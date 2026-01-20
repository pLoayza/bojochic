import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Spin, message } from 'antd';
import { auth, db } from '../../firebase/config';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
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
          setUserData({ ...userDoc.data(), email: user.email });
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
      
      console.log('🔵 Carrito cargado en CheckoutPage:', items);
      
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

  const subtotal = calculateSubtotal();
  const shipping = calculateShipping();
  const total = calculateTotal();

  console.log('🔵 CheckoutPage - Total:', total);
  console.log('🔵 CheckoutPage - Items:', cartItems);

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
            cartItems={cartItems}      // ✅ AGREGADO
            totalAmount={total}         // ✅ AGREGADO
          />
        </Col>

        <Col xs={24} lg={10}>
          <OrderSummary 
            cartItems={cartItems}
            subtotal={subtotal}
            shipping={shipping}
            total={total}
          />
        </Col>
      </Row>
    </div>
  );
};

export default CheckoutPage;