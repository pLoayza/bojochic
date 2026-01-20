import { useState, useEffect } from 'react';
import { Row, Col, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import CheckoutForm from './CheckoutForm';
import OrderSummary from './OrderSummary';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      message.warning('Debes iniciar sesión');
      navigate('/login');
      return;
    }

    // Cargar datos del usuario
    const loadUserData = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData({ ...userDoc.data(), email: user.email });
      }
    };

    // Cargar carrito
    const cartRef = collection(db, 'users', user.uid, 'cart');
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCartItems(items);
      setLoading(false);

      if (items.length === 0) {
        message.info('Tu carrito está vacío');
        navigate('/');
      }
    });

    loadUserData();

    return () => unsubscribe();
  }, [navigate]);

  // Calcular totales
  const subtotal = cartItems.reduce((total, item) => 
    total + (item.price * item.quantity), 0
  );

  const shipping = subtotal >= 20000 ? 0 : 3000;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Row gutter={[32, 32]}>
        <Col xs={24} lg={14}>
          <CheckoutForm 
            userData={userData}
            cartItems={cartItems}
            totalAmount={total}
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

export default Checkout;