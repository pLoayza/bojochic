

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Spin, message } from 'antd';
import { auth, db } from '../../firebase/config';
import { collection, onSnapshot, addDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import CheckoutForm from '../../components/Payments/CheckoutForm';
import OrderSummary from '../../components/Payments/OrderSummary';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    
    if (!user) {
      message.warning('Debes iniciar sesión para continuar');
      navigate('/login');
      return;
    }

    // Cargar datos del usuario
    const loadUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
      }
    };

    loadUserData();

    // Listener del carrito
    const cartRef = collection(db, 'users', user.uid, 'cart');
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (items.length === 0) {
        message.info('Tu carrito está vacío');
        navigate('/');
      }
      
      setCartItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 20000 ? 0 : 3000;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const generarNumeroOrden = () => {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000);
    return `ORD-${año}${mes}${dia}-${random}`;
  };

  const limpiarCarrito = async () => {
    try {
      const user = auth.currentUser;
      const deletePromises = cartItems.map(item => 
        deleteDoc(doc(db, 'users', user.uid, 'cart', item.id))
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error limpiando carrito:', error);
    }
  };

  const handleConfirmarPedido = async (formValues) => {
    try {
      const user = auth.currentUser;
      const numeroOrden = generarNumeroOrden();

      const orden = {
        orderId: numeroOrden,
        userId: user.uid,
        customerInfo: {
          ...formValues,
          rut: userData?.rut || ''
        },
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          size: item.size,
          color: item.color
        })),
        subtotal: calculateSubtotal(),
        shipping: calculateShipping(),
        total: calculateTotal(),
        paymentMethod: 'pendiente',
        status: 'pendiente_pago',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'orders'), orden);
      await limpiarCarrito();

      message.success('¡Orden creada exitosamente!');
      navigate(`/order-confirmation/${numeroOrden}`, { state: { orden } });

    } catch (error) {
      console.error('Error creando orden:', error);
      message.error('Error al procesar la orden. Intenta nuevamente.');
      throw error;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '50px auto', 
      padding: '0 20px',
      minHeight: '70vh'
    }}>
      <Row gutter={[32, 32]}>
        <Col xs={24} lg={14}>
          <CheckoutForm 
            userData={userData}
            onSubmit={handleConfirmarPedido}
          />
        </Col>

        <Col xs={24} lg={10}>
          <OrderSummary 
            cartItems={cartItems}
            subtotal={calculateSubtotal()}
            shipping={calculateShipping()}
            total={calculateTotal()}
          />
        </Col>
      </Row>
    </div>
  );
};

export default CheckoutPage;