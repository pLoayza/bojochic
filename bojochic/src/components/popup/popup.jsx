import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Typography, notification } from 'antd';
import { MailOutlined, GiftOutlined } from '@ant-design/icons';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const { Title, Text } = Typography;

const Popup = ({ 
  delaySeconds = 3, 
  discountPercent = 10,
  productImage = null,
  showEveryMinutes = 1 // Mostrar cada X minutos si no se suscribe
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    const checkIfShouldShow = () => {
      // Si ya está suscrito, nunca mostrar
      const isSubscribed = localStorage.getItem('bojo_subscribed');
      if (isSubscribed) return false;

      // Verificar última vez que se mostró
      const lastShown = localStorage.getItem('bojo_popup_last_shown');
      
      if (!lastShown) return true; // Nunca se ha mostrado
      
      const lastShownDate = new Date(parseInt(lastShown));
      const now = new Date();
      const minutesDiff = (now - lastShownDate) / (1000 * 60);
      
      return minutesDiff >= showEveryMinutes;
    };

    if (checkIfShouldShow()) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        localStorage.setItem('bojo_popup_last_shown', Date.now().toString());
      }, delaySeconds * 1000);

      return () => clearTimeout(timer);
    }
  }, [delaySeconds, showEveryMinutes]);

  const handleSubscribe = async () => {
    if (!email.trim()) {
      api.error({
        message: 'Error',
        description: 'Por favor ingresa tu correo electrónico',
        placement: 'topRight',
        duration: 3,
      });
      return;
    }

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
      const subscribersRef = collection(db, 'subscribers');
      const q = query(subscribersRef, where('email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        api.warning({
          message: 'Ya estás suscrito',
          description: 'Este correo ya está registrado. ¡Revisa tu bandeja para el código de descuento! 😊',
          placement: 'topRight',
          duration: 4,
        });
        setEmail('');
        localStorage.setItem('bojo_subscribed', 'true');
        setIsVisible(false);
        return;
      }

      await addDoc(collection(db, 'subscribers'), {
        email: email.toLowerCase(),
        subscribedAt: new Date(),
        source: 'popup',
        status: 'active'
      });

      api.success({
        message: `¡Gracias por suscribirte! 🎉`,
        description: `Tu código de ${discountPercent}% de descuento llegará a tu correo`,
        placement: 'topRight',
        duration: 4,
      });
      
      setEmail('');
      localStorage.setItem('bojo_subscribed', 'true');
      setIsVisible(false);
      
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

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubscribe();
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={isVisible}
        onCancel={handleClose}
        footer={null}
        centered
        width={520}
        styles={{
          body: { padding: 0 },
          content: { borderRadius: 8, overflow: 'hidden' }
        }}
        closable={true}
      >
        <div style={{ display: 'flex', minHeight: 380 }}>
          <div 
            style={{ 
              width: '45%',
              background: productImage 
                ? `url(${productImage}) center/cover no-repeat`
                : 'linear-gradient(135deg, #DE0797 0%, #ff6bb3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            {!productImage && (
              <GiftOutlined style={{ fontSize: 80, color: 'white', opacity: 0.8 }} />
            )}
          </div>

          <div 
            style={{ 
              width: '55%', 
              padding: '40px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <Title 
              level={3} 
              style={{ 
                color: '#DE0797',
                marginBottom: 8,
                fontStyle: 'italic',
                fontWeight: 600
              }}
            >
              Únete a nuestra comunidad
            </Title>
            
            <Text 
              style={{ 
                color: '#ff6bb3',
                fontSize: 16,
                marginBottom: 28,
                display: 'block',
                lineHeight: 1.5
              }}
            >
              Y te damos <strong>{discountPercent}% dcto</strong><br />
              adicional en tu primera compra
            </Text>

            <Input
              placeholder="Email"
              prefix={<MailOutlined style={{ color: '#bbb' }} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              style={{ 
                marginBottom: 16,
                borderRadius: 4,
                height: 44
              }}
            />

            <Button
              type="primary"
              block
              onClick={handleSubscribe}
              loading={loading}
              disabled={loading}
              style={{
                background: '#DE0797',
                borderColor: '#DE0797',
                height: 44,
                fontWeight: 'bold',
                borderRadius: 4,
                fontSize: 14
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#c00686';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = '#DE0797';
              }}
            >
              SUSCRÍBETE
            </Button>

            <Text 
              type="secondary" 
              style={{ 
                fontSize: 11, 
                marginTop: 20,
                lineHeight: 1.5,
                color: '#999'
              }}
            >
              *Al introducir tu correo electrónico automáticamente 
              quedas suscrito a recibir nuestros correos y te puedes 
              desuscribir cuando lo desees.
            </Text>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Popup;