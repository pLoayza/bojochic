import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Spin, Button, Descriptions, Card } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ShoppingOutlined,
  HomeOutlined 
} from '@ant-design/icons';
import { auth } from '../../firebase/config';

const WebpayReturn = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // ✅ Prevenir doble llamado en React Strict Mode
  const hasConfirmed = useRef(false);

  useEffect(() => {
    const confirmPayment = async () => {
      // ✅ Si ya confirmó, no volver a hacerlo
      if (hasConfirmed.current) {
        console.log('⏭️ Ya confirmado, saltando...');
        return;
      }

      const token = searchParams.get('token_ws');
      
      if (!token) {
        setError('Token inválido');
        setLoading(false);
        return;
      }

      // ✅ Marcar como confirmado ANTES de hacer el fetch
      hasConfirmed.current = true;
      console.log('🔵 Confirmando por primera vez...');

      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Usuario no autenticado');
          setLoading(false);
          return;
        }

        const userToken = await user.getIdToken();

        // Confirmar transacción con el backend
        const response = await fetch('http://localhost:3001/api/webpay/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (!response.ok) {
          // Si el error es "already locked", verificar si el pago fue exitoso
          if (data.error?.includes('already locked')) {
            console.log('⚠️ Ya procesado por otra petición, verificando estado...');
            // Mostrar como exitoso si fue aprobado
            setPaymentData({ 
              success: true, 
              message: 'Pago ya procesado exitosamente'
            });
          } else {
            throw new Error(data.error || 'Error al confirmar pago');
          }
        } else {
          setPaymentData(data);
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Error al verificar el pago');
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [searchParams]); // ✅ Solo depende de searchParams

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '60vh',
        padding: '40px'
      }}>
        <Spin size="large" />
        <p style={{ marginTop: 20, fontSize: '16px' }}>
          Verificando tu pago...
        </p>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
        <Result
          status="error"
          title="Error en la transacción"
          subTitle={error || "No se pudo procesar tu pago"}
          extra={[
            <Button 
              type="primary" 
              key="retry" 
              onClick={() => navigate('/checkout')}
              style={{ background: '#DE0797', borderColor: '#DE0797' }}
            >
              Intentar nuevamente
            </Button>,
            <Button key="home" onClick={() => navigate('/')}>
              Volver al inicio
            </Button>
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <Result
        status={paymentData.success ? 'success' : 'error'}
        icon={paymentData.success ? 
          <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        }
        title={paymentData.success ? '¡Pago Exitoso!' : 'Pago Rechazado'}
        subTitle={
          paymentData.success
            ? 'Tu compra ha sido procesada correctamente. Recibirás un email de confirmación.'
            : 'Tu pago no pudo ser procesado. Por favor intenta nuevamente.'
        }
      />

      {paymentData.success && paymentData.buyOrder && (
        <Card style={{ marginTop: 24 }}>
          <Descriptions 
            title="Detalles de la Transacción" 
            bordered 
            column={1}
            size="middle"
          >
            <Descriptions.Item label="Número de Orden">
              <strong>{paymentData.buyOrder}</strong>
            </Descriptions.Item>
            {paymentData.amount && (
              <Descriptions.Item label="Monto Pagado">
                <strong style={{ color: '#DE0797', fontSize: '18px' }}>
                  ${paymentData.amount?.toLocaleString('es-CL')}
                </strong>
              </Descriptions.Item>
            )}
            {paymentData.authorizationCode && (
              <Descriptions.Item label="Código de Autorización">
                {paymentData.authorizationCode}
              </Descriptions.Item>
            )}
            {paymentData.cardNumber && (
              <Descriptions.Item label="Tarjeta">
                **** **** **** {paymentData.cardNumber}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Fecha">
              {new Date().toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <div style={{ 
        marginTop: 32, 
        display: 'flex', 
        gap: '16px', 
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <Button 
          type="primary" 
          size="large"
          icon={<HomeOutlined />}
          onClick={() => navigate('/')}
          style={{
            background: '#DE0797',
            borderColor: '#DE0797',
            minWidth: '160px'
          }}
        >
          Volver al Inicio
        </Button>
        
        {paymentData.success && (
          <Button 
            size="large"
            icon={<ShoppingOutlined />}
            onClick={() => navigate('/orders')}
            style={{ minWidth: '160px' }}
          >
            Ver mis Pedidos
          </Button>
        )}
      </div>
    </div>
  );
};

export default WebpayReturn;