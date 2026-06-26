import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Button, Typography, Spin, Alert, Space, Row, Col, Tag
} from 'antd';
import { ArrowLeftOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { auth, db } from '../../firebase/config';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import Banner from '../../components/Banner/Banner';
import CheckoutSteps from '../../components/Payments/CheckoutSteps';

const { Title, Text } = Typography;

// ─── CREDENCIALES — reemplazar con valores reales al tenerlos ───────────────
// VITE_MP_PUBLIC_KEY se define en .env.development / .env.production
// Ejemplo: VITE_MP_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
// ────────────────────────────────────────────────────────────────────────────
const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;

const CHECKOUT_DATA_KEY = 'bojo_checkout_data';
const SDK_URL = 'https://sdk.mercadopago.com/js/v2';

// Nivel de módulo: persiste entre remontajes del componente.
// Permite cancelar una operación async anterior si el usuario
// sale y vuelve rápido antes de que el brick termine de crear.
let _mpSeq = 0;
let _mpCtrl = null;

const cancelPreviousBrick = () => {
  _mpSeq++;
  if (_mpCtrl) {
    try { _mpCtrl.unmount(); } catch { /* ignorar */ }
    _mpCtrl = null;
  }
  const el = document.getElementById('mp-brick-container');
  if (el) el.innerHTML = '';
};

const loadMPSdk = () => {
  if (window.MercadoPago) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${SDK_URL}"]`)) {
      const wait = setInterval(() => {
        if (window.MercadoPago) { clearInterval(wait); resolve(); }
      }, 100);
      return;
    }
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.onload = resolve;
    script.onerror = () => reject(new Error('No se pudo cargar el SDK de MercadoPago'));
    document.head.appendChild(script);
  });
};

const MercadoPagoPage = () => {
  const navigate = useNavigate();
  const [checkoutData, setCheckoutData] = useState(null);
  const [brickReady, setBrickReady] = useState(false);
  const [initError, setInitError] = useState(null);
  const [buyOrder, setBuyOrder] = useState(null);
  const brickControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => () => {
    isMountedRef.current = false;
    cancelPreviousBrick();
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem(CHECKOUT_DATA_KEY);
    if (!raw) {
      navigate('/checkout');
      return;
    }
    try {
      setCheckoutData(JSON.parse(raw));
    } catch {
      navigate('/checkout');
    }
  }, [navigate]);

  useEffect(() => {
    if (!checkoutData) return;
    mountBrick();
  }, [checkoutData]);

  const marcarCodigoUsado = async (codigoAplicado, isGuest) => {
    if (isGuest || !codigoAplicado) return;
    try {
      const user = auth.currentUser;
      if (!user) return;
      await updateDoc(doc(db, 'users', user.uid), {
        codigosUsados: arrayUnion(codigoAplicado),
      });
    } catch (err) {
      console.error('Error marcando código como usado:', err);
    }
  };

  const mountBrick = async () => {
    if (!MP_PUBLIC_KEY) {
      setInitError('Clave pública de MercadoPago no configurada. Agrega VITE_MP_PUBLIC_KEY en el archivo .env.');
      return;
    }

    // Cancela cualquier operación anterior y limpia el contenedor
    cancelPreviousBrick();
    const mySeq = _mpSeq;

    setBrickReady(false);
    setInitError(null);

    const { formValues, totalAmount, cartItems, shipping, descuento, isGuest, codigoAplicado } = checkoutData;

    try {
      const user = auth.currentUser;
      const headers = { 'Content-Type': 'application/json' };
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      await marcarCodigoUsado(codigoAplicado, isGuest);

      const prefRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/mercadopago/create-preference`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: totalAmount,
          shipping,
          descuento,
          items: cartItems,
          shippingData: formValues,
          isGuest,
          guestEmail: isGuest ? formValues.email : null,
        }),
      });

      const prefData = await prefRes.json();
      if (!prefRes.ok) throw new Error(prefData.error || 'Error al crear preferencia de pago');

      // Si el usuario salió mientras esperábamos, abortamos
      if (!isMountedRef.current || _mpSeq !== mySeq) return;

      setBuyOrder(prefData.buyOrder);
      sessionStorage.setItem('bojo_mp_order', prefData.buyOrder);
      sessionStorage.setItem('bojo_payment_in_progress', 'true');

      await loadMPSdk();
      if (!isMountedRef.current || _mpSeq !== mySeq) return;

      // Limpiamos el contenedor justo antes de montar por si algo escribió en él
      const container = document.getElementById('mp-brick-container');
      if (container) container.innerHTML = '';

      const mp = new window.MercadoPago(MP_PUBLIC_KEY, { locale: 'es-CL' });
      const builder = mp.bricks();

      const controller = await builder.create('payment', 'mp-brick-container', {
        initialization: {
          amount: totalAmount,
          preferenceId: prefData.preferenceId,
          payer: {
            firstName: formValues.nombre?.split(' ')[0] || '',
            lastName: formValues.nombre?.split(' ').slice(1).join(' ') || '',
            email: formValues.email || '',
          },
        },
        customization: {
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
            mercadoPago: ['wallet_purchase'],
          },
          visual: {
            style: { theme: 'default' },
            hideFormTitle: true,
          },
        },
        callbacks: {
          onReady: () => {
            if (isMountedRef.current && _mpSeq === mySeq) setBrickReady(true);
          },
          onSubmit: ({ formData }) =>
            new Promise(async (resolve, reject) => {
              try {
                const payRes = await fetch(
                  `${import.meta.env.VITE_BACKEND_URL}/api/mercadopago/process-payment`,
                  {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ ...formData, buyOrder: prefData.buyOrder }),
                  }
                );
                const payData = await payRes.json();
                if (!payRes.ok) throw new Error(payData.error || 'Error procesando pago');

                sessionStorage.removeItem('bojo_payment_in_progress');
                navigate(
                  `/mercadopago/return?payment_id=${payData.paymentId}&status=${payData.status}&external_reference=${prefData.buyOrder}`
                );
                resolve();
              } catch (err) {
                reject(err);
              }
            }),
          onError: (error) => {
            console.error('MP Brick error:', error);
            if (isMountedRef.current && _mpSeq === mySeq)
              setInitError('Error en el formulario de pago. Por favor recarga la página.');
          },
        },
      });

      // Si una nueva operación empezó mientras esperábamos builder.create(), desmontar y salir
      if (!isMountedRef.current || _mpSeq !== mySeq) {
        try { controller.unmount(); } catch { /* ignorar */ }
        return;
      }

      _mpCtrl = controller;
      brickControllerRef.current = controller;
    } catch (err) {
      console.error('Error inicializando MercadoPago:', err);
      if (isMountedRef.current && _mpSeq === mySeq) setInitError(err.message);
    }
  };

  const handleRetry = () => {
    mountBrick();
  };

  if (!checkoutData) {
    return (
      <>
        <Banner />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Spin size="large" />
        </div>
      </>
    );
  }

  const { totalAmount, shipping, descuento } = checkoutData;

  return (
    <>
      <Banner />
      <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 20px', minHeight: '70vh' }}>
        <CheckoutSteps current={1} />

        <Row align="middle" gutter={16} style={{ marginBottom: 24 }}>
          <Col>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/checkout/pago')}>
              Volver
            </Button>
          </Col>
          <Col flex="auto">
            <Space align="center" size="small">
              <Title level={3} style={{ margin: 0 }}>Pagar con MercadoPago</Title>
              <Tag color="#009EE3" style={{ fontSize: 12 }}>Seguro</Tag>
            </Space>
          </Col>
        </Row>

        {/* Resumen del total */}
        <Card size="small" style={{ marginBottom: 20, background: '#fafafa', borderRadius: 8 }}>
          <Row justify="space-between" align="middle" wrap>
            <Col>
              <Space direction="vertical" size={2}>
                {descuento > 0 && (
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Descuento: −${descuento.toLocaleString('es-CL')}
                  </Text>
                )}
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Envío:{' '}
                  {shipping === 0
                    ? <span style={{ color: '#52c41a', fontWeight: 600 }}>¡Gratis!</span>
                    : `$${shipping.toLocaleString('es-CL')}`}
                </Text>
              </Space>
            </Col>
            <Col>
              <Title level={3} style={{ margin: 0, color: '#f33763' }}>
                Total: ${totalAmount.toLocaleString('es-CL')}
              </Title>
            </Col>
          </Row>
        </Card>

        {/* Error de inicialización */}
        {initError && (
          <Alert
            type="error"
            message="No se pudo cargar el pago"
            description={initError}
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" onClick={handleRetry}>
                Reintentar
              </Button>
            }
          />
        )}

        {/* Contenedor del Brick */}
        {!initError && (
          <Card style={{ borderRadius: 10, overflow: 'hidden' }}>
            <Space style={{ marginBottom: 16 }}>
              <LockOutlined style={{ color: '#009EE3' }} />
              <Text type="secondary" style={{ fontSize: 13 }}>
                Pago seguro procesado por MercadoPago · Acepta crédito, débito y saldo MP
              </Text>
              <SafetyOutlined style={{ color: '#52c41a' }} />
            </Space>

            {!brickReady && (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <Spin size="large" />
                <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
                  Cargando formulario de pago...
                </Text>
              </div>
            )}

            <div id="mp-brick-container" />
          </Card>
        )}
      </div>
    </>
  );
};

export default MercadoPagoPage;
