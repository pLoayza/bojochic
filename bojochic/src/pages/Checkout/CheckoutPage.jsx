import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Spin, message } from 'antd';
import { auth, db } from '../../firebase/config';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import CheckoutForm, { getCostoEnvio } from '../../components/Payments/CheckoutForm';
import OrderSummary from '../../components/Payments/OrderSummary';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [shipping, setShipping] = useState(0); // 0 hasta que elija región

  useEffect(() => {
    const user = auth.currentUser;
    
    if (!user) {
      message.warning('Debes iniciar sesión para continuar');
      navigate('/login');
      return;
    }

    const loadUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({ ...data, email: user.email });
          // Si el usuario ya tiene región guardada, precarga el costo
          if (data.region) {
            setShipping(getCostoEnvio(data.region));
          }
        }
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
      }
    };

    loadUserData();

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

  const handleRegionChange = (region) => {
    setShipping(getCostoEnvio(region));
  };

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '0 20px', minHeight: '70vh' }}>
      <Row gutter={[32, 32]}>
        <Col xs={24} lg={14}>
          <CheckoutForm 
            userData={userData}
            cartItems={cartItems}
            totalAmount={total}
            onRegionChange={handleRegionChange}
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