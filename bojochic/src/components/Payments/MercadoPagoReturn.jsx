import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Spin, Button, Card, Descriptions, Typography, Space, Tag } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { auth } from '../../firebase/config';
import Banner from '../Banner/Banner';
import CheckoutSteps from './CheckoutSteps';

const { Text } = Typography;

const STATUS = {
  approved: {
    antStatus: 'success',
    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    title: '¡Pago aprobado!',
    subtitle: 'Tu compra fue procesada exitosamente. Recibirás un email de confirmación pronto.',
    step: 2,
    tagColor: 'success',
    tagLabel: 'Aprobado',
  },
  pending: {
    antStatus: 'warning',
    icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
    title: 'Pago en proceso',
    subtitle: 'Tu pago está siendo revisado. Te avisaremos por email cuando se confirme.',
    step: 2,
    tagColor: 'warning',
    tagLabel: 'Pendiente',
  },
  failure: {
    antStatus: 'error',
    icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    title: 'Pago rechazado',
    subtitle: 'No pudimos procesar tu pago. Puedes intentarlo nuevamente con otro medio.',
    step: 1,
    tagColor: 'error',
    tagLabel: 'Rechazado',
  },
  rejected: {
    antStatus: 'error',
    icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    title: 'Pago rechazado',
    subtitle: 'Tu pago fue rechazado por la entidad emisora. Intenta con otra tarjeta.',
    step: 1,
    tagColor: 'error',
    tagLabel: 'Rechazado',
  },
};

const MercadoPagoReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentDetail, setPaymentDetail] = useState(null);
  const hasVerified = useRef(false);

  const paymentId = searchParams.get('payment_id');
  const rawStatus = searchParams.get('status') || 'failure';
  const externalRef = searchParams.get('external_reference') ||
    sessionStorage.getItem('bojo_mp_order');

  const statusKey = STATUS[rawStatus] ? rawStatus : 'failure';
  const config = STATUS[statusKey];

  useEffect(() => {
    sessionStorage.removeItem('bojo_payment_in_progress');
    sessionStorage.removeItem('bojo_mp_order');

    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      if (!paymentId) { setLoading(false); return; }

      try {
        // Esperar rehidratación de Firebase Auth (por si venía de redirect)
        await new Promise((resolve) => {
          const unsub = auth.onAuthStateChanged(() => { unsub(); resolve(); });
        });

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/mercadopago/payment/${paymentId}`
        );
        if (res.ok) {
          const data = await res.json();
          setPaymentDetail(data);

          // Limpiar carrito de guest si el pago fue aprobado
          if (data.status === 'approved') {
            localStorage.removeItem('bojo_guest_cart');
          }
        }
      } catch (err) {
        console.error('Error verificando pago MP:', err);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [paymentId]);

  if (loading) {
    return (
      <>
        <Banner />
        <div style={{
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          minHeight: '60vh',
        }}>
          <Spin size="large" />
          <Text type="secondary" style={{ marginTop: 20, fontSize: 16 }}>
            Verificando tu pago...
          </Text>
        </div>
      </>
    );
  }

  const isSuccess = statusKey === 'approved';
  const isPending = statusKey === 'pending';

  return (
    <>
      <Banner />
      <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 20px', minHeight: '70vh' }}>
        <CheckoutSteps current={config.step} />

        <Result
          status={config.antStatus}
          icon={config.icon}
          title={config.title}
          subTitle={config.subtitle}
          extra={[
            isSuccess || isPending ? (
              <Button
                key="orders"
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                onClick={() => navigate('/orders')}
                style={{ background: '#f33763', border: 'none' }}
              >
                Ver mis pedidos
              </Button>
            ) : (
              <Button
                key="retry"
                type="primary"
                size="large"
                onClick={() => navigate('/checkout/pago')}
                style={{ background: '#009EE3', border: 'none' }}
              >
                Intentar de nuevo
              </Button>
            ),
            <Button key="home" size="large" icon={<HomeOutlined />} onClick={() => navigate('/')}>
              Volver al inicio
            </Button>,
          ]}
        />

        {(externalRef || paymentId || paymentDetail) && (
          <Card style={{ borderRadius: 10, marginTop: 8 }}>
            <Space style={{ marginBottom: 12 }}>
              <Tag color={config.tagColor}>{config.tagLabel}</Tag>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Procesado por MercadoPago
              </Text>
            </Space>
            <Descriptions column={1} size="small" bordered>
              {externalRef && (
                <Descriptions.Item label="N° Orden">
                  <Text strong>{externalRef}</Text>
                </Descriptions.Item>
              )}
              {paymentId && (
                <Descriptions.Item label="ID de Pago MercadoPago">
                  <Text strong>{paymentId}</Text>
                </Descriptions.Item>
              )}
              {paymentDetail?.transaction_amount && (
                <Descriptions.Item label="Monto">
                  <Text strong style={{ color: '#f33763', fontSize: 16 }}>
                    ${Number(paymentDetail.transaction_amount).toLocaleString('es-CL')}
                  </Text>
                </Descriptions.Item>
              )}
              {paymentDetail?.payment_method_id && (
                <Descriptions.Item label="Medio de pago">
                  <Text>{paymentDetail.payment_method_id}</Text>
                </Descriptions.Item>
              )}
              {paymentDetail?.status_detail && (
                <Descriptions.Item label="Detalle">
                  <Text type="secondary">{paymentDetail.status_detail}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}
      </div>
    </>
  );
};

export default MercadoPagoReturn;
