const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const axios = require('axios');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'https://www.bojo.cl', 'https://bojochic.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.type,
    project_id: process.env.project_id,
    private_key_id: process.env.private_key_id,
    private_key: process.env.private_key?.replace(/\\n/g, '\n'),
    client_email: process.env.client_email,
    client_id: process.env.client_id,
    auth_uri: process.env.auth_uri,
    token_uri: process.env.token_uri,
    client_x509_cert_url: process.env.client_x509_cert_url
  })
});

const db = admin.firestore();

// Webpay Config
const WEBPAY = {
  host: process.env.WEBPAY_ENV === 'production'
    ? 'https://webpay3g.transbank.cl'
    : 'https://webpay3gint.transbank.cl',
  commerceCode: process.env.WEBPAY_ENV === 'production'
    ? process.env.WEBPAY_COMMERCE_CODE
    : '597055555532',
  apiKey: process.env.WEBPAY_ENV === 'production'
    ? process.env.WEBPAY_API_KEY
    : '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C'
};

// ─────────────────────────────────────────
// Helper: llamadas a Transbank con logging
// Reemplaza todos los axios.post/put directos a Webpay.
// Guarda cada request/response en Firestore (colección tbk_logs)
// para poder auditar errores por buyOrder.
// ─────────────────────────────────────────
const tbkRequest = async (method, path, data, context = {}) => {
  const url = `${WEBPAY.host}${path}`;
  const headers = {
    'Tbk-Api-Key-Id': WEBPAY.commerceCode,
    'Tbk-Api-Key-Secret': WEBPAY.apiKey,
    'Content-Type': 'application/json'
  };

  const startTime = Date.now();
  const logEntry = {
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    method: method.toUpperCase(),
    url,
    environment: process.env.WEBPAY_ENV || 'integration',
    requestBody: data || null,
    ...context
  };

  try {
    const response = await axios({ method, url, data, headers });
    const latency = Date.now() - startTime;

    logEntry.status = 'success';
    logEntry.httpStatus = response.status;
    logEntry.latencyMs = latency;
    logEntry.responseBody = response.data;
    logEntry.tbkHeaders = {
      traceId:   response.headers['x-tbk-trace-id'] || null,
      requestId: response.headers['x-request-id']   || null,
    };

    console.log(`✅ TBK ${method.toUpperCase()} ${path} → ${response.status} (${latency}ms)`);
    return response;

  } catch (error) {
    const latency = Date.now() - startTime;
    const axiosError = error.response;

    logEntry.status = 'error';
    logEntry.latencyMs = latency;
    logEntry.httpStatus = axiosError?.status || null;
    logEntry.errorMessage = error.message;
    logEntry.responseBody = axiosError?.data || null;
    logEntry.tbkErrorCode = axiosError?.data?.error_message || null;
    logEntry.tbkDetail    = axiosError?.data?.detail        || null;
    logEntry.tbkHeaders = {
      traceId:   axiosError?.headers?.['x-tbk-trace-id'] || null,
      requestId: axiosError?.headers?.['x-request-id']   || null,
    };

    console.error(`❌ TBK ${method.toUpperCase()} ${path} → ${axiosError?.status || 'SIN_RESPUESTA'} (${latency}ms)`);
    console.error('   Body TBK:', JSON.stringify(axiosError?.data, null, 2));
    console.error('   Trace-ID:', logEntry.tbkHeaders.traceId);

    throw error;

  } finally {
    // Guardar log en Firestore sin bloquear la respuesta
    const logId = context.buyOrder || `tbk-${Date.now()}`;
    db.collection('tbk_logs')
      .doc(logId)
      .set(logEntry, { merge: true })
      .catch(e => console.error('⚠️ Error guardando log TBK:', e.message));
  }
};

// ─────────────────────────────────────────
// Middleware Auth — obligatorio
// ─────────────────────────────────────────
const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'No autorizado' });
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// ─────────────────────────────────────────
// Middleware Auth — opcional (permite guests)
// ─────────────────────────────────────────
const verifyAuthOptional = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (token) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
    } else {
      req.user = null;
    }
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// ─────────────────────────────────────────
// Template correo cliente (orden confirmada)
// ─────────────────────────────────────────
const buildOrderEmail = (shippingData, items, amount, buyOrder, authorizationCode) => {
  const itemsHTML = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${item.image}" alt="${item.name}" 
            style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" />
          <span style="font-weight: 500;">${item.name}</span>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666;">
        x${item.quantity}
        ${item.size ? `<br/><small>Talla: ${item.size}</small>` : ''}
        ${item.color ? `<br/><small>Color: ${item.color}</small>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600; color: #f33763;">
        $${(item.price * item.quantity).toLocaleString('es-CL')}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: #f33763; padding: 20px 32px; text-align: center;">
          <img src="https://firebasestorage.googleapis.com/v0/b/bojochic-21749.firebasestorage.app/o/logo-bojo.png?alt=media&token=dede7080-d9a2-4533-bb13-0e1c3b46137d"
            alt="Bojo" style="height: 200px; width: auto; display: block; margin: 0 auto;" />
        </div>
        <div style="padding: 32px; text-align: center; border-bottom: 1px solid #f0f0f0;">
          <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
          <h2 style="margin: 0 0 8px; color: #1a1a1a; font-size: 24px;">¡Pedido confirmado, ${shippingData.nombre}!</h2>
          <p style="margin: 0; color: #666; font-size: 15px; line-height: 1.6;">Tu pago fue procesado exitosamente. Pronto nos pondremos en contacto para coordinar el envío.</p>
        </div>
        <div style="padding: 24px 32px; background: #fafafa; border-bottom: 1px solid #f0f0f0;">
          <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div>
              <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;">N° de Orden</p>
              <p style="margin: 4px 0 0; font-size: 15px; font-weight: 700; color: #1a1a1a;">${buyOrder}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Código Autorización</p>
              <p style="margin: 4px 0 0; font-size: 15px; font-weight: 700; color: #1a1a1a;">${authorizationCode}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Fecha</p>
              <p style="margin: 4px 0 0; font-size: 15px; font-weight: 700; color: #1a1a1a;">${new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
        <div style="padding: 24px 32px;">
          <h3 style="margin: 0 0 16px; color: #1a1a1a; font-size: 16px;">Productos comprados</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9f9f9;">
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #999; text-transform: uppercase;">Producto</th>
                <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #999; text-transform: uppercase;">Cant.</th>
                <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #999; text-transform: uppercase;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsHTML}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 16px 12px; text-align: right; font-size: 16px; font-weight: 700; color: #1a1a1a;">Total pagado:</td>
                <td style="padding: 16px 12px; text-align: right; font-size: 20px; font-weight: 700; color: #f33763;">$${amount.toLocaleString('es-CL')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div style="padding: 24px 32px; background: #fafafa; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0;">
          <h3 style="margin: 0 0 16px; color: #1a1a1a; font-size: 16px;">📦 Datos de envío</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #999; font-size: 14px; width: 140px;">Nombre:</td><td style="padding: 6px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${shippingData.nombre}</td></tr>
            <tr><td style="padding: 6px 0; color: #999; font-size: 14px;">Teléfono:</td><td style="padding: 6px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${shippingData.telefono}</td></tr>
            <tr><td style="padding: 6px 0; color: #999; font-size: 14px;">Dirección:</td><td style="padding: 6px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${shippingData.direccion}</td></tr>
            <tr><td style="padding: 6px 0; color: #999; font-size: 14px;">Comuna:</td><td style="padding: 6px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${shippingData.comuna}</td></tr>
            <tr><td style="padding: 6px 0; color: #999; font-size: 14px;">Región:</td><td style="padding: 6px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${shippingData.region}</td></tr>
            ${shippingData.notas ? `<tr><td style="padding: 6px 0; color: #999; font-size: 14px;">Notas:</td><td style="padding: 6px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${shippingData.notas}</td></tr>` : ''}
          </table>
        </div>
        <div style="padding: 28px 32px; text-align: center;">
          <p style="margin: 0 0 8px; color: #666; font-size: 14px; line-height: 1.6;">¿Tienes alguna duda? Escríbenos a <a href="mailto:contacto@bojo.cl" style="color: #f33763; text-decoration: none;">contacto@bojo.cl</a></p>
          <p style="margin: 16px 0 0; color: #bbb; font-size: 12px;">© ${new Date().getFullYear()} Bojo · Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ─────────────────────────────────────────
// Template correo admin
// ─────────────────────────────────────────
const buildAdminEmail = (shippingData, items, amount, buyOrder, authorizationCode, isGuest = false) => {
  const itemsHTML = items.map(item => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0;">
        <strong>${item.name}</strong>
        ${item.size ? ` — Talla: ${item.size}` : ''}
        ${item.color ? ` — Color: ${item.color}` : ''}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: center;">
        x${item.quantity}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #f33763; font-weight: 600;">
        $${(item.price * item.quantity).toLocaleString('es-CL')}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="margin:0; padding:0; background:#f9f9f9; font-family: Helvetica, Arial, sans-serif;">
      <div style="max-width:600px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:#1a1a1a; padding:24px 32px; text-align:center;">
          <h1 style="margin:0; color:#f33763; font-size:22px;">🛍️ Nueva venta en Bojo</h1>
          <p style="margin:8px 0 0; color:#aaa; font-size:14px;">${new Date().toLocaleString('es-CL')}</p>
        </div>
        <div style="padding:24px 32px; background:#fafafa; border-bottom:1px solid #f0f0f0;">
          <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:12px;">
            <div>
              <p style="margin:0; font-size:12px; color:#999; text-transform:uppercase; letter-spacing:1px;">N° Orden</p>
              <p style="margin:4px 0 0; font-size:16px; font-weight:700; color:#1a1a1a;">${buyOrder}</p>
            </div>
            <div>
              <p style="margin:0; font-size:12px; color:#999; text-transform:uppercase; letter-spacing:1px;">Autorización</p>
              <p style="margin:4px 0 0; font-size:16px; font-weight:700; color:#1a1a1a;">${authorizationCode}</p>
            </div>
            <div>
              <p style="margin:0; font-size:12px; color:#999; text-transform:uppercase; letter-spacing:1px;">Total</p>
              <p style="margin:4px 0 0; font-size:20px; font-weight:700; color:#f33763;">$${amount.toLocaleString('es-CL')}</p>
            </div>
            ${isGuest ? `
            <div>
              <p style="margin:0; font-size:12px; color:#999; text-transform:uppercase; letter-spacing:1px;">Tipo</p>
              <p style="margin:4px 0 0; font-size:14px; font-weight:700; color:#ff9800;">👤 Invitado</p>
            </div>` : ''}
          </div>
        </div>
        <div style="padding:24px 32px; border-bottom:1px solid #f0f0f0;">
          <h3 style="margin:0 0 16px; font-size:15px; color:#1a1a1a;">👤 Datos del cliente</h3>
          <table style="width:100%; border-collapse:collapse;">
            <tr><td style="padding:5px 0; color:#999; font-size:14px; width:120px;">Nombre:</td><td style="padding:5px 0; font-size:14px; font-weight:500;">${shippingData.nombre}</td></tr>
            <tr><td style="padding:5px 0; color:#999; font-size:14px;">Email:</td><td style="padding:5px 0; font-size:14px; font-weight:500;">${shippingData.email}</td></tr>
            <tr><td style="padding:5px 0; color:#999; font-size:14px;">Teléfono:</td><td style="padding:5px 0; font-size:14px; font-weight:500;">${shippingData.telefono}</td></tr>
            <tr><td style="padding:5px 0; color:#999; font-size:14px;">Dirección:</td><td style="padding:5px 0; font-size:14px; font-weight:500;">${shippingData.direccion}</td></tr>
            <tr><td style="padding:5px 0; color:#999; font-size:14px;">Comuna:</td><td style="padding:5px 0; font-size:14px; font-weight:500;">${shippingData.comuna}</td></tr>
            <tr><td style="padding:5px 0; color:#999; font-size:14px;">Región:</td><td style="padding:5px 0; font-size:14px; font-weight:500;">${shippingData.region}</td></tr>
            ${shippingData.notas ? `<tr><td style="padding:5px 0; color:#999; font-size:14px;">Notas:</td><td style="padding:5px 0; font-size:14px; font-weight:500;">${shippingData.notas}</td></tr>` : ''}
          </table>
        </div>
        <div style="padding:24px 32px;">
          <h3 style="margin:0 0 16px; font-size:15px; color:#1a1a1a;">📦 Productos</h3>
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:#f9f9f9;">
                <th style="padding:10px 12px; text-align:left; font-size:12px; color:#999; text-transform:uppercase;">Producto</th>
                <th style="padding:10px 12px; text-align:center; font-size:12px; color:#999; text-transform:uppercase;">Cant.</th>
                <th style="padding:10px 12px; text-align:right; font-size:12px; color:#999; text-transform:uppercase;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsHTML}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:16px 12px; text-align:right; font-size:15px; font-weight:700; color:#1a1a1a;">Total:</td>
                <td style="padding:16px 12px; text-align:right; font-size:20px; font-weight:700; color:#f33763;">$${amount.toLocaleString('es-CL')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div style="padding:20px 32px; background:#fafafa; text-align:center;">
          <p style="margin:0; color:#bbb; font-size:12px;">Notificación automática de Bojo · ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ─────────────────────────────────────────
// Template correo bienvenida suscriptor
// ─────────────────────────────────────────
const buildWelcomeEmail = () => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: #f33763; padding: 20px 32px; text-align: center;">
          <img src="https://firebasestorage.googleapis.com/v0/b/bojochic-21749.firebasestorage.app/o/logo-bojo.png?alt=media&token=dede7080-d9a2-4533-bb13-0e1c3b46137d"
            alt="Bojo" style="height: 200px; width: auto; display: block; margin: 0 auto;" />
        </div>
        <div style="padding: 36px 32px; text-align: center; border-bottom: 1px solid #f0f0f0;">
          <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
          <h2 style="margin: 0 0 12px; color: #1a1a1a; font-size: 24px;">¡Bienvenida a la comunidad Bojo!</h2>
          <p style="margin: 0; color: #666; font-size: 15px; line-height: 1.7;">
            Gracias por suscribirte. Ahora serás la primera en enterarte de nuestras novedades, lanzamientos y ofertas exclusivas. 💖
          </p>
        </div>
        <div style="padding: 36px 32px; text-align: center; border-bottom: 1px solid #f0f0f0;">
          <p style="margin: 0 0 24px; color: #444; font-size: 15px; line-height: 1.6;">
            Como prometimos, aquí está tu regalo de bienvenida:
          </p>
          <div style="background: linear-gradient(135deg, #f33763 0%, #ff6bb3 100%); border-radius: 12px; padding: 28px 32px;">
            <p style="margin: 0 0 8px; color: rgba(255,255,255,0.85); font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Tu código exclusivo</p>
            <h1 style="margin: 0 0 8px; color: #fff; font-size: 42px; letter-spacing: 6px; font-weight: 800;">BOJO10</h1>
            <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px;">10% de descuento en tu primera compra</p>
          </div>
          <p style="margin: 24px 0 0; color: #888; font-size: 13px; line-height: 1.6;">
            Ingresa el código al momento del pago en el checkout 🛍️
          </p>
        </div>
        <div style="padding: 32px; text-align: center; border-bottom: 1px solid #f0f0f0;">
          <p style="margin: 0 0 20px; color: #555; font-size: 15px;">¿Lista para tu primera compra?</p>
          <a href="https://www.bojo.cl"
            style="display: inline-block; background: #f33763; color: #fff; text-decoration: none;
                   padding: 14px 36px; border-radius: 8px; font-weight: 700; font-size: 15px;">
            Ver colección →
          </a>
        </div>
        <div style="padding: 28px 32px; text-align: center;">
          <p style="margin: 0 0 8px; color: #666; font-size: 14px; line-height: 1.6;">
            ¿Tienes alguna duda? Escríbenos a
            <a href="mailto:contacto@bojo.cl" style="color: #f33763; text-decoration: none;">contacto@bojo.cl</a>
          </p>
          <p style="margin: 12px 0 0; color: #bbb; font-size: 11px; line-height: 1.6;">
            Recibiste este correo porque te suscribiste en bojo.cl.
            Puedes darte de baja cuando quieras.
          </p>
          <p style="margin: 8px 0 0; color: #bbb; font-size: 12px;">© ${new Date().getFullYear()} Bojo · Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ─────────────────────────────────────────
// CREAR TRANSACCIÓN
// ─────────────────────────────────────────
app.post('/api/webpay/create', verifyAuthOptional, async (req, res) => {
  try {
    const { amount, items, shippingData, isGuest, guestEmail } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ error: 'Monto inválido' });

    const buyOrder  = `ORD-${Date.now()}`;
    const sessionId = req.user ? req.user.uid : (guestEmail || `guest-${Date.now()}`);
    const returnUrl = `${process.env.FRONTEND_URL}/webpay/return`;

    // ← Usa tbkRequest en vez de axios.post directo
    const response = await tbkRequest(
      'post',
      '/rswebpaytransaction/api/webpay/v1.2/transactions',
      { buy_order: buyOrder, session_id: sessionId, amount, return_url: returnUrl },
      { buyOrder, sessionId, action: 'create' }
    );

    await db.collection('orders').doc(buyOrder).set({
      userId:        req.user ? req.user.uid : null,
      isGuest:       isGuest || false,
      buyOrder,
      sessionId,
      amount,
      items,
      shippingData,
      token:         response.data.token,
      status:        'pending',
      paymentStatus: 'pending',
      createdAt:     admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, token: response.data.token, url: response.data.url, buyOrder });

  } catch (error) {
    console.error('❌ Error create:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error_message || error.message });
  }
});

// ─────────────────────────────────────────
// CONFIRMAR TRANSACCIÓN
// ─────────────────────────────────────────
app.post('/api/webpay/confirm', verifyAuthOptional, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token no proporcionado' });

    const ordersSnapshot = await db.collection('orders')
      .where('token', '==', token)
      .limit(1)
      .get();

    if (ordersSnapshot.empty) return res.status(404).json({ error: 'Orden no encontrada' });

    const orderDoc  = ordersSnapshot.docs[0];
    const orderData = orderDoc.data();

    if (orderData.status === 'approved' || orderData.status === 'rejected') {
      console.log('⚠️ Orden ya procesada, ignorando:', orderData.buyOrder);
      return res.json({
        success:           orderData.status === 'approved',
        buyOrder:          orderData.buyOrder,
        amount:            orderData.amount,
        authorizationCode: orderData.authorizationCode,
        responseCode:      orderData.responseCode,
        cardNumber:        orderData.cardNumber,
        alreadyProcessed:  true
      });
    }

    await orderDoc.ref.update({ status: 'processing' });

    // ← Usa tbkRequest en vez de axios.put directo
    const response = await tbkRequest(
      'put',
      `/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`,
      {},
      { buyOrder: orderData.buyOrder, action: 'confirm' }
    );

    const paymentData = response.data;
    const isApproved  = paymentData.response_code === 0;

    await orderDoc.ref.update({
      status:            isApproved ? 'approved' : 'rejected',
      paymentStatus:     isApproved ? 'paid' : 'failed',
      vci:               paymentData.vci,
      cardNumber:        paymentData.card_detail?.card_number,
      authorizationCode: paymentData.authorization_code,
      transactionDate:   paymentData.transaction_date,
      paymentTypeCode:   paymentData.payment_type_code,
      responseCode:      paymentData.response_code,
      installments:      paymentData.installments_number || 0,
      confirmedAt:       admin.firestore.FieldValue.serverTimestamp()
    });

    if (isApproved) {
      // Limpiar carrito
      if (!orderData.isGuest && orderData.userId) {
        try {
          const cartSnapshot = await db.collection('users').doc(orderData.userId).collection('cart').get();
          const batch = db.batch();
          cartSnapshot.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          console.log('✅ Carrito limpiado');
        } catch (cartError) {
          console.error('⚠️ Error limpiando carrito:', cartError.message);
        }
      }

      // Bajar stock
      try {
        const stockBatch = db.batch();
        for (const item of orderData.items) {
          if (!item.id) { console.warn('⚠️ Item sin id, saltando:', item.name); continue; }
          const productoRef  = db.collection('productos').doc(item.id);
          const productoSnap = await productoRef.get();
          if (productoSnap.exists) {
            const stockActual = productoSnap.data().stock || 0;
            const nuevoStock  = Math.max(0, stockActual - item.quantity);
            stockBatch.update(productoRef, { stock: nuevoStock });
            console.log(`📦 Stock ${item.name}: ${stockActual} → ${nuevoStock}`);
          } else {
            console.warn('⚠️ Producto no encontrado en Firestore:', item.id);
          }
        }
        await stockBatch.commit();
        console.log('✅ Stock actualizado');
      } catch (stockError) {
        console.error('⚠️ Error actualizando stock:', stockError.message);
      }

      // Correo cliente
      try {
        await resend.emails.send({
          from:    'Bojo <Pedidos@bojo.cl>',
          to:      orderData.shippingData.email,
          subject: `✨ ¡Pedido confirmado! Orden ${orderData.buyOrder}`,
          html:    buildOrderEmail(orderData.shippingData, orderData.items, orderData.amount, orderData.buyOrder, paymentData.authorization_code)
        });
        console.log('✅ Correo enviado a:', orderData.shippingData.email);
      } catch (emailError) {
        console.error('⚠️ Error enviando correo al cliente:', emailError.message);
      }

      // Correo admin
      try {
        await resend.emails.send({
          from:    'Bojo <Pedidos@bojo.cl>',
          to:      process.env.ADMIN_EMAIL,
          subject: `🛍️ Nueva venta — ${orderData.buyOrder} — $${orderData.amount.toLocaleString('es-CL')}${orderData.isGuest ? ' [Invitado]' : ''}`,
          html:    buildAdminEmail(orderData.shippingData, orderData.items, orderData.amount, orderData.buyOrder, paymentData.authorization_code, orderData.isGuest)
        });
        console.log('✅ Notificación enviada al admin');
      } catch (emailError) {
        console.error('⚠️ Error enviando notificación al admin:', emailError.message);
      }
    }

    res.json({
      success:           isApproved,
      buyOrder:          paymentData.buy_order,
      amount:            paymentData.amount,
      authorizationCode: paymentData.authorization_code,
      responseCode:      paymentData.response_code,
      status:            paymentData.status,
      cardNumber:        paymentData.card_detail?.card_number
    });

  } catch (error) {
    console.error('❌ Error confirm:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error_message || error.message });
  }
});

// ─────────────────────────────────────────
// DEBUG: consultar log de una orden
// Uso: GET /api/debug/order/ORD-1234567890
// Requiere token de admin (verifyAuth)
// ─────────────────────────────────────────
app.get('/api/debug/order/:buyOrder', verifyAuth, async (req, res) => {
  const { buyOrder } = req.params;

  try {
    const [orderSnap, logSnap] = await Promise.all([
      db.collection('orders').doc(buyOrder).get(),
      db.collection('tbk_logs').doc(buyOrder).get()
    ]);

    if (!orderSnap.exists) return res.status(404).json({ error: 'Orden no encontrada' });

    const order = orderSnap.data();
    const log   = logSnap.exists ? logSnap.data() : null;

    res.json({
      order: {
        buyOrder:          order.buyOrder,
        status:            order.status,
        paymentStatus:     order.paymentStatus,
        amount:            order.amount,
        isGuest:           order.isGuest,
        responseCode:      order.responseCode,
        authorizationCode: order.authorizationCode,
        createdAt:         order.createdAt,
        confirmedAt:       order.confirmedAt,
      },
      tbkLog: log ? {
        action:       log.action,
        status:       log.status,
        httpStatus:   log.httpStatus,
        latencyMs:    log.latencyMs,
        errorMessage: log.errorMessage,
        tbkErrorCode: log.tbkErrorCode,
        tbkDetail:    log.tbkDetail,
        tbkHeaders:   log.tbkHeaders,
        responseBody: log.responseBody,
      } : { message: 'Sin log TBK — la orden fue creada antes de activar el logging' }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────
// CORREO BIENVENIDA SUSCRIPTOR
// ─────────────────────────────────────────
app.post('/api/subscribers/welcome', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });

  try {
    await resend.emails.send({
      from:    'Bojo <contacto@bojo.cl>',
      to:      email,
      subject: '🎉 ¡Bienvenida a Bojo! Tu código de descuento te espera',
      html:    buildWelcomeEmail()
    });
    console.log('✅ Correo de bienvenida enviado a:', email);
    res.json({ ok: true });
  } catch (error) {
    console.error('⚠️ Error enviando correo de bienvenida:', error.message);
    res.status(500).json({ error: 'Error al enviar correo' });
  }
});

// ─────────────────────────────────────────
// MERCADOPAGO — Config
// Credenciales: https://www.mercadopago.cl/developers/panel/app
// ─────────────────────────────────────────
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

// Helper: acciones post-pago aprobado (limpiar carrito, stock, emails)
const handleMPPostPayment = async (orderData, paymentId) => {
  // Limpiar carrito del usuario registrado
  if (!orderData.isGuest && orderData.userId) {
    try {
      const cartSnapshot = await db.collection('users').doc(orderData.userId).collection('cart').get();
      const batch = db.batch();
      cartSnapshot.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      console.log('✅ MP: Carrito limpiado');
    } catch (err) {
      console.error('⚠️ MP: Error limpiando carrito:', err.message);
    }
  }

  // Bajar stock
  try {
    const stockBatch = db.batch();
    for (const item of orderData.items) {
      if (!item.id) continue;
      const productoRef = db.collection('productos').doc(item.id);
      const productoSnap = await productoRef.get();
      if (productoSnap.exists) {
        const nuevoStock = Math.max(0, (productoSnap.data().stock || 0) - item.quantity);
        stockBatch.update(productoRef, { stock: nuevoStock });
      }
    }
    await stockBatch.commit();
    console.log('✅ MP: Stock actualizado');
  } catch (err) {
    console.error('⚠️ MP: Error actualizando stock:', err.message);
  }

  // Correo al cliente
  try {
    await resend.emails.send({
      from: 'Bojo <Pedidos@bojo.cl>',
      to: orderData.shippingData.email,
      subject: `✨ ¡Pedido confirmado! Orden ${orderData.buyOrder}`,
      html: buildOrderEmail(orderData.shippingData, orderData.items, orderData.amount, orderData.buyOrder, paymentId),
    });
    console.log('✅ MP: Correo enviado al cliente');
  } catch (err) {
    console.error('⚠️ MP: Error enviando correo al cliente:', err.message);
  }

  // Correo al admin
  try {
    await resend.emails.send({
      from: 'Bojo <Pedidos@bojo.cl>',
      to: process.env.ADMIN_EMAIL,
      subject: `🛍️ Nueva venta MP — ${orderData.buyOrder} — $${orderData.amount.toLocaleString('es-CL')}${orderData.isGuest ? ' [Invitado]' : ''}`,
      html: buildAdminEmail(orderData.shippingData, orderData.items, orderData.amount, orderData.buyOrder, paymentId, orderData.isGuest),
    });
    console.log('✅ MP: Notificación enviada al admin');
  } catch (err) {
    console.error('⚠️ MP: Error enviando correo al admin:', err.message);
  }
};

// ─────────────────────────────────────────
// MP: CREAR PREFERENCIA
// ─────────────────────────────────────────
app.post('/api/mercadopago/create-preference', verifyAuthOptional, async (req, res) => {
  try {
    const { amount, items, shipping = 0, descuento = 0, shippingData, isGuest, guestEmail } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ error: 'Monto inválido' });

    const buyOrder = `MP-${Date.now()}`;
    const frontendUrl = process.env.FRONTEND_URL;

    // Armar items para la preferencia (CLP = sin decimales, sin precios negativos)
    const mpItems = items.map(item => ({
      id: String(item.id),
      title: String(item.name).substring(0, 256),
      quantity: Number(item.quantity),
      unit_price: Math.round(item.price),
      currency_id: 'CLP',
    }));

    // Envío como item separado en lugar de campo shipments
    if (shipping > 0) {
      mpItems.push({
        id: 'envio',
        title: 'Costo de envío',
        quantity: 1,
        unit_price: Math.round(shipping),
        currency_id: 'CLP',
      });
    }

    // Descuento: restar del primer item para evitar precios negativos
    // (MP bloquea unit_price negativo en algunas cuentas)
    if (descuento > 0 && mpItems.length > 0) {
      const totalItems = mpItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
      const factor = (totalItems - descuento) / totalItems;
      mpItems.forEach(i => { i.unit_price = Math.round(i.unit_price * factor); });
    }

    const preference = {
      items: mpItems,
      payer: {
        email: shippingData.email || guestEmail || '',
      },
      back_urls: {
        success: `${frontendUrl}/mercadopago/return`,
        failure: `${frontendUrl}/mercadopago/return`,
        pending: `${frontendUrl}/mercadopago/return`,
      },
      auto_return: 'approved',
      external_reference: buyOrder,
      // Solo incluir webhook en producción — MP rechaza URLs de localhost
      ...(process.env.BACKEND_URL && !process.env.BACKEND_URL.includes('localhost')
        ? { notification_url: `${process.env.BACKEND_URL}/api/mercadopago/webhook` }
        : {}),
    };

    const prefClient = new Preference(mpClient);
    const mpRes = await prefClient.create({ body: preference });

    const { id: preferenceId, init_point, sandbox_init_point } = mpRes;

    await db.collection('orders').doc(buyOrder).set({
      userId: req.user ? req.user.uid : null,
      isGuest: isGuest || false,
      buyOrder,
      amount,
      items,
      shippingData,
      preferenceId,
      paymentMethod: 'mercadopago',
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ MP preferencia creada: ${buyOrder} → ${preferenceId}`);
    res.json({ success: true, preferenceId, init_point, sandbox_init_point, buyOrder });

  } catch (error) {
    console.error('❌ MP create-preference:', error?.cause || error.message);
    res.status(500).json({ error: error?.cause?.message || error.message });
  }
});

// ─────────────────────────────────────────
// MP: PROCESAR PAGO (tarjeta directo via Brick)
// Solo se llama para pagos con tarjeta; wallet redirige solo vía back_urls
// ─────────────────────────────────────────
app.post('/api/mercadopago/process-payment', verifyAuthOptional, async (req, res) => {
  try {
    const { token, issuer_id, payment_method_id, transaction_amount, installments, payer, buyOrder } = req.body;

    if (!token) return res.status(400).json({ error: 'Token de pago requerido' });

    const paymentPayload = {
      token,
      issuer_id,
      payment_method_id,
      transaction_amount: Math.round(Number(transaction_amount)),
      installments: Number(installments) || 1,
      description: 'Compra en Bojo',
      payer: { email: payer.email, identification: payer.identification || {} },
    };

    const payClient = new Payment(mpClient);
    const payment = await payClient.create({
      body: paymentPayload,
      requestOptions: { idempotencyKey: buyOrder || `pay-${Date.now()}` },
    });
    const isApproved = payment.status === 'approved';

    if (buyOrder) {
      const orderRef = db.collection('orders').doc(buyOrder);
      const orderSnap = await orderRef.get();
      if (orderSnap.exists) {
        await orderRef.update({
          status: isApproved ? 'approved' : payment.status,
          paymentStatus: isApproved ? 'paid' : payment.status,
          mpPaymentId: String(payment.id),
          mpStatus: payment.status,
          mpStatusDetail: payment.status_detail,
          paymentMethodId: payment.payment_method_id,
          confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        if (isApproved) await handleMPPostPayment(orderSnap.data(), String(payment.id));
      }
    }

    console.log(`✅ MP pago procesado: ${buyOrder} → ${payment.status}`);
    res.json({ success: isApproved, paymentId: payment.id, status: payment.status, statusDetail: payment.status_detail });

  } catch (error) {
    console.error('❌ MP process-payment:', error?.cause || error.message);
    res.status(500).json({ error: error?.cause?.message || error.message });
  }
});

// ─────────────────────────────────────────
// MP: WEBHOOK / IPN
// MP llama a esta URL para notificar cambios de estado
// ─────────────────────────────────────────
app.post('/api/mercadopago/webhook', async (req, res) => {
  // Responder 200 siempre primero para que MP no reintente
  res.status(200).json({ ok: true });

  try {
    const { type, data } = req.body;
    if (!type || !data?.id) return;

    if (type === 'payment') {
      const payClient = new Payment(mpClient);
      const payment = await payClient.get({ id: data.id });
      const buyOrder = payment.external_reference;
      if (!buyOrder) return;

      const orderRef = db.collection('orders').doc(buyOrder);
      const orderSnap = await orderRef.get();
      if (!orderSnap.exists) return;

      const order = orderSnap.data();
      if (order.status === 'approved') return; // Idempotencia: ya procesada

      const isApproved = payment.status === 'approved';
      await orderRef.update({
        status: isApproved ? 'approved' : payment.status,
        paymentStatus: isApproved ? 'paid' : payment.status,
        mpPaymentId: String(payment.id),
        mpStatus: payment.status,
        mpStatusDetail: payment.status_detail,
        confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (isApproved) await handleMPPostPayment(order, String(payment.id));
      console.log(`✅ MP webhook procesado: ${buyOrder} → ${payment.status}`);
    }
  } catch (err) {
    console.error('❌ MP webhook:', err.message);
  }
});

// ─────────────────────────────────────────
// MP: CONSULTAR ESTADO DE PAGO
// Usado por MercadoPagoReturn para mostrar detalles
// ─────────────────────────────────────────
app.get('/api/mercadopago/payment/:paymentId', async (req, res) => {
  try {
    const payClient = new Payment(mpClient);
    const payment = await payClient.get({ id: req.params.paymentId });
    const { status, status_detail, payment_method_id, transaction_amount, external_reference } = payment;
    res.json({ status, status_detail, payment_method_id, transaction_amount, external_reference });
  } catch (error) {
    console.error('❌ MP get payment:', error?.cause || error.message);
    res.status(500).json({ error: 'No se pudo obtener el estado del pago' });
  }
});

// ─────────────────────────────────────────
// Health check
// ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), environment: process.env.WEBPAY_ENV || 'integration' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log(`📝 Ambiente: ${process.env.WEBPAY_ENV || 'integration'}`);
});