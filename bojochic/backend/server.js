const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const axios = require('axios');
require('dotenv').config();

const app = express();

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
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
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error auth:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// CREAR TRANSACCIÓN
app.post('/api/webpay/create', verifyAuth, async (req, res) => {
  try {
    const { amount, items, shippingData } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    const buyOrder = `ORD-${Date.now()}`;
    const sessionId = req.user.uid;
    const returnUrl = `${process.env.FRONTEND_URL}/webpay/return`;

    console.log('✅ Creando transacción:', { buyOrder, amount });

    const response = await axios.post(
      `${WEBPAY.host}/rswebpaytransaction/api/webpay/v1.2/transactions`,
      {
        buy_order: buyOrder,
        session_id: sessionId,
        amount: amount,
        return_url: returnUrl
      },
      {
        headers: {
          'Tbk-Api-Key-Id': WEBPAY.commerceCode,
          'Tbk-Api-Key-Secret': WEBPAY.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Transbank respondió:', response.data);

    await db.collection('orders').doc(buyOrder).set({
      userId: req.user.uid,
      buyOrder,
      sessionId,
      amount,
      items,
      shippingData,
      token: response.data.token,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      token: response.data.token,
      url: response.data.url,
      buyOrder
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data?.error_message || error.message 
    });
  }
});

// CONFIRMAR TRANSACCIÓN
app.post('/api/webpay/confirm', verifyAuth, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token no proporcionado' });
    }

    console.log('✅ Confirmando:', token);

    const response = await axios.put(
      `${WEBPAY.host}/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`,
      {},
      {
        headers: {
          'Tbk-Api-Key-Id': WEBPAY.commerceCode,
          'Tbk-Api-Key-Secret': WEBPAY.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Confirmación:', response.data);

    const paymentData = response.data;
    const isApproved = paymentData.response_code === 0;

    const ordersSnapshot = await db.collection('orders')
      .where('token', '==', token)
      .limit(1)
      .get();

    if (ordersSnapshot.empty) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const orderDoc = ordersSnapshot.docs[0];

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
      const cartSnapshot = await db.collection('users')
        .doc(req.user.uid)
        .collection('cart')
        .get();

      const batch = db.batch();
      cartSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      
      console.log('✅ Carrito limpiado');
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
    res.status(500).json({ 
      error: error.response?.data?.error_message || error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.WEBPAY_ENV || 'integration'
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log(`📝 Ambiente: ${process.env.WEBPAY_ENV || 'integration'}`);
});