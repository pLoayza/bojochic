// functions/index.js
const {onCall} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const admin = require("firebase-admin");
const axios = require("axios");
const logger = require("firebase-functions/logger");

// Inicializar Firebase Admin
admin.initializeApp();

// Configuración global
setGlobalOptions({ 
  maxInstances: 10,
  region: "us-central1" // O "southamerica-east1" para estar más cerca de Chile
});

// Configuración de Webpay
const WEBPAY_CONFIG = {
  integration: {
    host: "https://webpay3gint.transbank.cl",
    commerceCode: "597055555532",
    apiKey: "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C"
  },
  production: {
    host: "https://webpay3g.transbank.cl",
    commerceCode: process.env.WEBPAY_COMMERCE_CODE || "",
    apiKey: process.env.WEBPAY_API_KEY || ""
  }
};

// Seleccionar ambiente
const ENV = process.env.WEBPAY_ENV || "integration";
const config = WEBPAY_CONFIG[ENV];

// 🔹 FUNCIÓN 1: Crear transacción Webpay
exports.createWebpayTransaction = onCall(async (request) => {
  try {
    // Verificar autenticación
    if (!request.auth) {
      throw new Error("Usuario no autenticado");
    }

    const { amount, items, shippingData } = request.data;
    
    // Validaciones básicas
    if (!amount || amount <= 0) {
      throw new Error("Monto inválido");
    }

    if (!items || items.length === 0) {
      throw new Error("No hay productos en el carrito");
    }

    const buyOrder = `ORD-${Date.now()}`;
    const sessionId = request.auth.uid;
    
    // URL de retorno
    const returnUrl = process.env.APP_URL 
      ? `${process.env.APP_URL}/webpay/return`
      : "http://localhost:3000/webpay/return";

    logger.info("Creando transacción Webpay", { 
      buyOrder, 
      amount, 
      userId: sessionId 
    });

    // Llamar al API de Transbank
    const response = await axios.post(
      `${config.host}/rswebpaytransaction/api/webpay/v1.2/transactions`,
      {
        buy_order: buyOrder,
        session_id: sessionId,
        amount: amount,
        return_url: returnUrl
      },
      {
        headers: {
          "Tbk-Api-Key-Id": config.commerceCode,
          "Tbk-Api-Key-Secret": config.apiKey,
          "Content-Type": "application/json"
        }
      }
    );

    logger.info("Respuesta de Transbank", { 
      token: response.data.token 
    });

    // Guardar orden en Firestore
    await admin.firestore().collection("orders").doc(buyOrder).set({
      userId: request.auth.uid,
      buyOrder: buyOrder,
      sessionId: sessionId,
      amount: amount,
      items: items,
      shippingData: shippingData,
      token: response.data.token,
      status: "pending",
      paymentStatus: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      token: response.data.token,
      url: response.data.url,
      buyOrder: buyOrder
    };

  } catch (error) {
    logger.error("Error creando transacción", { 
      error: error.message,
      response: error.response?.data 
    });
    
    throw new Error(
      error.response?.data?.error_message || 
      error.message || 
      "Error al crear transacción"
    );
  }
});

// 🔹 FUNCIÓN 2: Confirmar transacción Webpay
exports.confirmWebpayTransaction = onCall(async (request) => {
  try {
    // Verificar autenticación
    if (!request.auth) {
      throw new Error("Usuario no autenticado");
    }

    const { token } = request.data;
    
    if (!token) {
      throw new Error("Token no proporcionado");
    }

    logger.info("Confirmando transacción", { token });

    // Confirmar con Transbank
    const response = await axios.put(
      `${config.host}/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`,
      {},
      {
        headers: {
          "Tbk-Api-Key-Id": config.commerceCode,
          "Tbk-Api-Key-Secret": config.apiKey,
          "Content-Type": "application/json"
        }
      }
    );

    logger.info("Respuesta de confirmación", { 
      buyOrder: response.data.buy_order,
      responseCode: response.data.response_code 
    });

    const paymentData = response.data;
    const isApproved = paymentData.response_code === 0;

    // Buscar orden en Firestore
    const ordersRef = admin.firestore().collection("orders");
    const orderSnapshot = await ordersRef
      .where("token", "==", token)
      .limit(1)
      .get();

    if (orderSnapshot.empty) {
      throw new Error("Orden no encontrada");
    }

    const orderDoc = orderSnapshot.docs[0];
    
    // Actualizar orden con resultado del pago
    await orderDoc.ref.update({
      status: isApproved ? "approved" : "rejected",
      paymentStatus: isApproved ? "paid" : "failed",
      vci: paymentData.vci || null,
      cardNumber: paymentData.card_detail?.card_number || null,
      authorizationCode: paymentData.authorization_code || null,
      transactionDate: paymentData.transaction_date || null,
      paymentTypeCode: paymentData.payment_type_code || null,
      responseCode: paymentData.response_code,
      installments: paymentData.installments_number || 0,
      confirmedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Si fue aprobado, limpiar el carrito
    if (isApproved) {
      const cartRef = admin.firestore()
        .collection("users")
        .doc(request.auth.uid)
        .collection("cart");
      
      const cartSnapshot = await cartRef.get();
      
      if (!cartSnapshot.empty) {
        const batch = admin.firestore().batch();
        cartSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        
        logger.info("Carrito limpiado", { userId: request.auth.uid });
      }
    }

    return {
      success: isApproved,
      buyOrder: paymentData.buy_order,
      amount: paymentData.amount,
      authorizationCode: paymentData.authorization_code,
      responseCode: paymentData.response_code,
      status: paymentData.status,
      cardNumber: paymentData.card_detail?.card_number
    };

  } catch (error) {
    logger.error("Error confirmando transacción", { 
      error: error.message,
      response: error.response?.data 
    });
    
    throw new Error(
      error.response?.data?.error_message || 
      error.message || 
      "Error al confirmar transacción"
    );
  }
});

// 🔹 FUNCIÓN 3: Obtener orden por ID (opcional pero útil)
exports.getOrder = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new Error("Usuario no autenticado");
    }

    const { orderId } = request.data;
    
    const orderDoc = await admin.firestore()
      .collection("orders")
      .doc(orderId)
      .get();

    if (!orderDoc.exists) {
      throw new Error("Orden no encontrada");
    }

    const orderData = orderDoc.data();

    // Verificar que la orden pertenece al usuario
    if (orderData.userId !== request.auth.uid) {
      throw new Error("No autorizado");
    }

    return {
      success: true,
      order: {
        id: orderDoc.id,
        ...orderData
      }
    };

  } catch (error) {
    logger.error("Error obteniendo orden", { error: error.message });
    throw new Error(error.message);
  }
});