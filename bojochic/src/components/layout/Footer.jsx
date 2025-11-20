import { Layout, Row, Col, Input, Button, notification } from 'antd'; // Cambiar message por notification
import { InstagramOutlined, FacebookOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const { Footer: AntFooter } = Layout;

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification(); // Hook de notificación

  const handleSubscribe = async () => {
    // Validar que el campo no esté vacío
    if (!email.trim()) {
      api.error({
        message: 'Error',
        description: 'Por favor ingresa tu correo electrónico',
        placement: 'topRight',
        duration: 3,
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      api.error({
        message: 'Error',
        description: 'Por favor ingresa un correo electrónico válido',
        placement: 'topRight',
        duration: 3,
      });
      return;
    }

    setLoading(true);

    try {
      // Verificar si el email ya existe en la base de datos
      const subscribersRef = collection(db, 'subscribers');
      const q = query(subscribersRef, where('email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        api.warning({
          message: 'Ya estás suscrito',
          description: 'Este correo ya está suscrito a nuestras promociones 😊',
          placement: 'topRight',
          duration: 4,
        });
        setEmail('');
        setLoading(false);
        return;
      }

      // Guardar el nuevo suscriptor en Firestore
      await addDoc(collection(db, 'subscribers'), {
        email: email.toLowerCase(),
        subscribedAt: new Date(),
        status: 'active'
      });

      api.success({
        message: '¡Gracias por suscribirte! 🎉',
        description: 'Recibirás nuestras mejores promociones',
        placement: 'topRight',
        duration: 4,
      });
      setEmail('');
      
    } catch (error) {
      console.error('Error al suscribir:', error);
      api.error({
        message: 'Error',
        description: 'Hubo un error al procesar tu suscripción. Por favor intenta nuevamente',
        placement: 'topRight',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  // Permitir suscribirse con Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubscribe();
    }
  };

  return (
    <>
      {contextHolder} {/* Importante: agregar el contextHolder */}
      <AntFooter style={{ background: '#f5f5f5', padding: '60px 20px 40px', marginTop: '80px' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          paddingBottom: '40px',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Row gutter={[80, 32]}>
            {/* Enlaces rápidos */}
            <Col xs={24} sm={8} md={6}>
              <h3 style={{ 
                color: '#333', 
                fontSize: '16px', 
                fontWeight: '600',
                marginBottom: '20px'
              }}>
                Enlaces rápidos
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link 
                  to="/inicio" 
                  style={{ 
                    color: '#666', 
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}
                >
                  Inicio
                </Link>
                <Link 
                  to="/catalogo" 
                  style={{ 
                    color: '#666', 
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}
                >
                  Catálogo
                </Link>
              </div>
            </Col>

            {/* Suscripción */}
            <Col xs={24} sm={16} md={18}>
              <h3 style={{ 
                color: '#333', 
                fontSize: '16px', 
                fontWeight: '600',
                marginBottom: '20px'
              }}>
                Suscríbete a nuestras promociones
              </h3>
              <div style={{ display: 'flex', gap: '0', maxWidth: '600px' }}>
                <Input 
                  type="email"
                  placeholder="Dirección de correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  style={{
                    borderRadius: '0',
                    border: '1px solid #d9d9d9',
                    padding: '10px 15px',
                    fontSize: '14px',
                    flex: 1
                  }}
                />
                <Button 
                  onClick={handleSubscribe}
                  loading={loading}
                  disabled={loading}
                  style={{
                    background: loading ? '#ccc' : '#DE0797',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0',
                    padding: '10px 30px',
                    height: 'auto',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.currentTarget.style.background = '#c00686';
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) e.currentTarget.style.background = '#DE0797';
                  }}
                >
                  SUSCRIBIRSE
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {/* Redes sociales */}
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          paddingTop: '30px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '20px'
        }}>
          <a 
            href="https://facebook.com/bojochic" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#333', fontSize: '24px' }}
          >
            <FacebookOutlined />
          </a>
          <a 
            href="https://instagram.com/bojochic" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#333', fontSize: '24px' }}
          >
            <InstagramOutlined />
          </a>
        </div>
      </AntFooter>
    </>
  );
};

export default Footer;