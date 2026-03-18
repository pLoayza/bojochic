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

// Middleware Auth
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

// Template del correo
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
        
        <!-- HEADER -->
<div style="background: #f33763; padding: 20px 32px; text-align: center;">
  <img src="https://firebasestorage.googleapis.com/v0/b/bojochic-21749.firebasestorage.app/o/logo-bojo.png?alt=media&token=dede7080-d9a2-4533-bb13-0e1c3b46137d"
    alt="Bojo"
    style="height: 200px; width: auto; display: block; margin: 0 auto;" />
</div>
        <div style="padding: 32px; text-align: center; border-bottom: 1px solid #f0f0f0;">
          <div style="font-size: 48px; margin-bottom: 16px;"></div>
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
// CREAR TRANSACCIÓN
app.post('/api/webpay/create', verifyAuth, async (req, res) => {
  try {
    const { amount, items, shippingData } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Monto inválido' });

    const buyOrder = `ORD-${Date.now()}`;
    const sessionId = req.user.uid;
    const returnUrl = `${process.env.FRONTEND_URL}/webpay/return`;

    const response = await axios.post(
      `${WEBPAY.host}/rswebpaytransaction/api/webpay/v1.2/transactions`,
      { buy_order: buyOrder, session_id: sessionId, amount, return_url: returnUrl },
      { headers: { 'Tbk-Api-Key-Id': WEBPAY.commerceCode, 'Tbk-Api-Key-Secret': WEBPAY.apiKey, 'Content-Type': 'application/json' } }
    );

    await db.collection('orders').doc(buyOrder).set({
      userId: req.user.uid, buyOrder, sessionId, amount, items, shippingData,
      token: response.data.token, status: 'pending', paymentStatus: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, token: response.data.token, url: response.data.url, buyOrder });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error_message || error.message });
  }
});

// CONFIRMAR TRANSACCIÓN
app.post('/api/webpay/confirm', verifyAuth, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token no proporcionado' });

    // 🔒 Buscar la orden ANTES de llamar a Transbank
    const ordersSnapshot = await db.collection('orders')
      .where('token', '==', token)
      .limit(1)
      .get();

    if (ordersSnapshot.empty) return res.status(404).json({ error: 'Orden no encontrada' });

    const orderDoc = ordersSnapshot.docs[0];
    const orderData = orderDoc.data();

    // ✅ Si ya fue procesada, retornar datos guardados sin reenviar correo
    if (orderData.status === 'approved' || orderData.status === 'rejected') {
      console.log('⚠️ Orden ya procesada, ignorando:', orderData.buyOrder);
      return res.json({
        success: orderData.status === 'approved',
        buyOrder: orderData.buyOrder,
        amount: orderData.amount,
        authorizationCode: orderData.authorizationCode,
        responseCode: orderData.responseCode,
        cardNumber: orderData.cardNumber,
        alreadyProcessed: true
      });
    }

    // 🔒 Marcar como 'processing' para evitar race conditions
    await orderDoc.ref.update({ status: 'processing' });

    const response = await axios.put(
      `${WEBPAY.host}/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`,
      {},
      { headers: { 'Tbk-Api-Key-Id': WEBPAY.commerceCode, 'Tbk-Api-Key-Secret': WEBPAY.apiKey, 'Content-Type': 'application/json' } }
    );

    const paymentData = response.data;
    const isApproved = paymentData.response_code === 0;

    await orderDoc.ref.update({
      status: isApproved ? 'approved' : 'rejected',
      paymentStatus: isApproved ? 'paid' : 'failed',
      vci: paymentData.vci,
      cardNumber: paymentData.card_detail?.card_number,
      authorizationCode: paymentData.authorization_code,
      transactionDate: paymentData.transaction_date,
      paymentTypeCode: paymentData.payment_type_code,
      responseCode: paymentData.response_code,
      installments: paymentData.installments_number || 0,
      confirmedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    if (isApproved) {
      // Limpiar carrito
      const cartSnapshot = await db.collection('users').doc(req.user.uid).collection('cart').get();
      const batch = db.batch();
      cartSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log('✅ Carrito limpiado');

      // 📧 Enviar correo de confirmación
      try {
        await resend.emails.send({
          from: 'Bojo <Pedidos@bojo.cl>',
          to: orderData.shippingData.email,
          subject: `✨ ¡Pedido confirmado! Orden ${orderData.buyOrder}`,
          html: buildOrderEmail(
            orderData.shippingData, orderData.items, orderData.amount,
            orderData.buyOrder, paymentData.authorization_code
          )
        });
        console.log('✅ Correo enviado a:', orderData.shippingData.email);
      } catch (emailError) {
        console.error('⚠️ Error enviando correo:', emailError.message);
      }
    }

    res.json({
      success: isApproved,
      buyOrder: paymentData.buy_order,
      amount: paymentData.amount,
      authorizationCode: paymentData.authorization_code,
      responseCode: paymentData.response_code,
      status: paymentData.status,
      cardNumber: paymentData.card_detail?.card_number
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error_message || error.message });
  }
});






// Health check
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

