import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Button, Typography, Alert, Divider,
  Space, Descriptions, Spin, message, Tag
} from 'antd';
import {
  CreditCardOutlined, BankOutlined, ArrowLeftOutlined,
  CheckCircleFilled, LockOutlined, SafetyOutlined
} from '@ant-design/icons';
import { auth, db } from '../../firebase/config';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import Banner from '../../components/Banner/Banner';
import CheckoutSteps from '../../components/Payments/CheckoutSteps';

const { Title, Text, Paragraph } = Typography;

const CHECKOUT_DATA_KEY = 'bojo_checkout_data';
const MP_SDK_URL = 'https://sdk.mercadopago.com/js/v2';

const loadMPSdk = () => {
  if (window.MercadoPago) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${MP_SDK_URL}"]`)) {
      const wait = setInterval(() => {
        if (window.MercadoPago) { clearInterval(wait); resolve(); }
      }, 100);
      return;
    }
    const script = document.createElement('script');
    script.src = MP_SDK_URL;
    script.onload = resolve;
    script.onerror = () => reject(new Error('No se pudo cargar el SDK de MercadoPago'));
    document.head.appendChild(script);
  });
};

const PaymentMethodPage = () => {
  const navigate = useNavigate();
  const [checkoutData, setCheckoutData] = useState(null);
  const [loadingWebpay, setLoadingWebpay] = useState(false);
  const [loadingTransferencia, setLoadingTransferencia] = useState(false);
  const [transferenciaOrden, setTransferenciaOrden] = useState(null);
  const [selected, setSelected] = useState(null);

  // MercadoPago brick state
  const [mpLoading, setMpLoading] = useState(false);
  const [mpReady, setMpReady] = useState(false);
  const [mpError, setMpError] = useState(null);
  const mpControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem(CHECKOUT_DATA_KEY);
    if (!raw) {
      message.warning('Completa primero tus datos de envío.');
      navigate('/checkout');
      return;
    }
    try {
      setCheckoutData(JSON.parse(raw));
    } catch {
      navigate('/checkout');
    }
  }, [navigate]);

  // Montar / desmontar brick según selección
  useEffect(() => {
    if (selected !== 'mercadopago') {
      mpControllerRef.current?.unmount();
      mpControllerRef.current = null;
      setMpReady(false);
      setMpError(null);
      setMpLoading(false);
      return;
    }
    if (mpControllerRef.current || mpLoading || !checkoutData) return;

    // Pequeño delay para que React renderice el contenedor antes de montarlo
    const timer = setTimeout(() => mountMPBrick(), 80);
    return () => clearTimeout(timer);
  }, [selected, checkoutData]);

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

  const mountMPBrick = async () => {
    if (!import.meta.env.VITE_MP_PUBLIC_KEY) {
      setMpError('Clave pública de MercadoPago no configurada (VITE_MP_PUBLIC_KEY).');
      return;
    }

    setMpLoading(true);
    setMpError(null);

    const { formValues, totalAmount, cartItems, shipping, descuento, isGuest, codigoAplicado } = checkoutData;

    try {
      const user = auth.currentUser;
      const headers = { 'Content-Type': 'application/json' };
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      await marcarCodigoUsado(codigoAplicado, isGuest);

      // Crear preferencia en el backend
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
      if (!prefRes.ok) throw new Error(prefData.error || 'Error al crear preferencia');

      if (!isMountedRef.current) return;

      sessionStorage.setItem('bojo_mp_order', prefData.buyOrder);
      sessionStorage.setItem('bojo_payment_in_progress', 'true');

      // Cargar SDK y montar brick
      await loadMPSdk();
      if (!isMountedRef.current) return;

      const mp = new window.MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'es-CL' });
      const builder = mp.bricks();

      mpControllerRef.current = await builder.create('payment', 'mp-inline-brick', {
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
            if (isMountedRef.current) { setMpReady(true); setMpLoading(false); }
          },
          // Solo para tarjetas directas — wallet redirige solo por back_urls
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
          onError: (err) => {
            console.error('MP Brick error:', err);
            if (isMountedRef.current) {
              setMpError('Error en el formulario de pago. Haz click para reintentar.');
              setMpLoading(false);
            }
          },
        },
      });
    } catch (err) {
      console.error('Error MP:', err);
      if (isMountedRef.current) {
        setMpError(err.message || 'No se pudo inicializar MercadoPago.');
        setMpLoading(false);
      }
    }
  };

  // ── Datos de transferencia — actualizar cuando estén disponibles ──
  const DATOS_TRANSFERENCIA = {
    banco:        'Scotiabank',
    tipoCuenta:   'Cuenta Corriente',
    numeroCuenta: '993182176',
    rut:          '78.308.976-9',
    nombre:       'Deyca SPA',
    email:        'bohochicchile@gmail.com',
  };

  const handleTransferencia = async () => {
    if (!checkoutData) return;
    setLoadingTransferencia(true);

    const { formValues, totalAmount, cartItems, isGuest, codigoAplicado } = checkoutData;

    // Generar ID aquí para poder abrir WhatsApp antes del await
    const buyOrder = `TRF-${Date.now()}`;

    // Abrir WhatsApp en el mismo hilo del click (antes de cualquier await)
    // para que el navegador no lo bloquee como popup
    const waMsg = `Hola, adjunto comprobante de mi compra ID ${buyOrder}`;
    window.open(`https://wa.me/56989058379?text=${encodeURIComponent(waMsg)}`, '_blank', 'noopener,noreferrer');

    try {
      const user = auth.currentUser;
      const headers = { 'Content-Type': 'application/json' };
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      await marcarCodigoUsado(codigoAplicado, isGuest);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transferencia/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          buyOrder,
          amount: totalAmount,
          isGuest,
          guestEmail: isGuest ? formValues.email : null,
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            size: item.size || null,
            color: item.color || null,
          })),
          shippingData: formValues,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al crear la orden');

      if (isGuest) localStorage.removeItem('bojo_guest_cart');
      sessionStorage.removeItem(CHECKOUT_DATA_KEY);

      setTransferenciaOrden(buyOrder);
    } catch (error) {
      console.error('Error transferencia:', error);
      message.error(error.message || 'Error al procesar la orden');
    } finally {
      setLoadingTransferencia(false);
    }
  };

  const handleWebpay = async () => {
    if (!checkoutData) return;
    setLoadingWebpay(true);

    const { formValues, totalAmount, cartItems, isGuest, codigoAplicado } = checkoutData;

    try {
      const user = auth.currentUser;
      const headers = { 'Content-Type': 'application/json' };
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      await marcarCodigoUsado(codigoAplicado, isGuest);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/webpay/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: totalAmount,
          isGuest,
          guestEmail: isGuest ? formValues.email : null,
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            size: item.size || null,
            color: item.color || null,
          })),
          shippingData: formValues,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al crear transacción');

      sessionStorage.setItem('bojo_payment_in_progress', 'true');

      const formEl = document.createElement('form');
      formEl.method = 'POST';
      formEl.action = data.url;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'token_ws';
      input.value = data.token;
      formEl.appendChild(input);
      document.body.appendChild(formEl);
      formEl.submit();

    } catch (error) {
      console.error('Error Webpay:', error);
      sessionStorage.removeItem('bojo_payment_in_progress');
      message.error(error.message || 'Error al procesar el pago');
      setLoadingWebpay(false);
    }
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

  const methods = [
    {
      key: 'webpay',
      label: 'Webpay',
      badge: null,
      subtitle: 'Tarjeta de crédito o débito',
      color: '#003087',
      content: (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Alert
            message={<Space><LockOutlined />Pago 100% seguro con Transbank</Space>}
            description="Serás redirigido a la plataforma de Transbank. Aceptamos todas las tarjetas de crédito y débito."
            type="info"
            showIcon={false}
          />
          <Button
            type="primary" size="large" block
            loading={loadingWebpay}
            icon={<CreditCardOutlined />}
            onClick={handleWebpay}
            style={{ background: '#003087', border: 'none', height: '52px', fontSize: '16px', fontWeight: 600 }}
          >
            {loadingWebpay ? 'Redirigiendo a Webpay...' : 'Pagar con Webpay'}
          </Button>
        </Space>
      ),
    },
    {
      key: 'mercadopago',
      label: 'MercadoPago',
      badge: 'No disponible actualmente',
      subtitle: 'Crédito, débito y saldo MercadoPago',
      color: '#009EE3',
      disabled: true,
      content: (
        <Space direction="vertical" style={{ width: '100%' }} size={0}>
          {/* Seguridad */}
          <Space style={{ marginBottom: 12 }}>
            <LockOutlined style={{ color: '#009EE3' }} />
            <Text type="secondary" style={{ fontSize: 13 }}>
              Pago seguro · Acepta crédito, débito y saldo MP
            </Text>
            <SafetyOutlined style={{ color: '#52c41a' }} />
          </Space>

          {/* Error con reintentar */}
          {mpError && (
            <Alert
              type="error"
              message="Hubo un error al cargar el formulario de pago."
              showIcon
              style={{ marginBottom: 12 }}
              action={
                <Button size="small" onClick={() => {
                  mpControllerRef.current = null;
                  setMpError(null);
                  setMpReady(false);
                  setTimeout(() => mountMPBrick(), 80);
                }}>
                  Reintentar
                </Button>
              }
            />
          )}

          {/* Spinner mientras carga */}
          {mpLoading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
                Cargando formulario de pago...
              </Text>
            </div>
          )}

          {/* Contenedor del brick — siempre en el DOM cuando está seleccionado */}
          <div id="mp-inline-brick" />
        </Space>
      ),
    },
    {
      key: 'transferencia',
      label: 'Transferencia Directa',
      badge: null,
      subtitle: 'Depósito o transferencia bancaria',
      color: '#389e0d',
      content: transferenciaOrden ? (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Alert
            message="¡Orden creada exitosamente!"
            description={`Tu orden ${transferenciaOrden} fue registrada. Realiza la transferencia con los datos de abajo y envíanos el comprobante.`}
            type="success"
            showIcon
          />
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Banco"><strong>{DATOS_TRANSFERENCIA.banco}</strong></Descriptions.Item>
            <Descriptions.Item label="Tipo de Cuenta"><strong>{DATOS_TRANSFERENCIA.tipoCuenta}</strong></Descriptions.Item>
            <Descriptions.Item label="N° Cuenta"><strong>{DATOS_TRANSFERENCIA.numeroCuenta}</strong></Descriptions.Item>
            <Descriptions.Item label="RUT"><strong>{DATOS_TRANSFERENCIA.rut}</strong></Descriptions.Item>
            <Descriptions.Item label="Nombre"><strong>{DATOS_TRANSFERENCIA.nombre}</strong></Descriptions.Item>
            <Descriptions.Item label="Email"><strong>{DATOS_TRANSFERENCIA.email}</strong></Descriptions.Item>
            <Descriptions.Item label="Monto exacto">
              <strong style={{ color: '#f33763', fontSize: '15px' }}>${totalAmount.toLocaleString('es-CL')}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Asunto / Referencia">
              <strong style={{ color: '#389e0d' }}>{transferenciaOrden}</strong>
            </Descriptions.Item>
          </Descriptions>
          <Paragraph type="secondary" style={{ fontSize: '13px', margin: 0 }}>
            Una vez verificada la transferencia te confirmaremos tu pedido por correo. Revisa también tu bandeja de entrada para los detalles del pedido.
          </Paragraph>
          <Button
            type="primary" size="large" block icon={<BankOutlined />}
            onClick={() => navigate('/')}
            style={{ background: '#389e0d', border: 'none', height: '52px', fontSize: '16px', fontWeight: 600 }}
          >
            Volver al inicio
          </Button>
        </Space>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Alert
            message={<Space><BankOutlined />Pago por transferencia bancaria</Space>}
            description="Confirma tu pedido y te enviaremos los datos de transferencia por correo. Tu pedido quedará reservado hasta verificar el pago."
            type="info"
            showIcon={false}
          />
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Banco"><strong>{DATOS_TRANSFERENCIA.banco}</strong></Descriptions.Item>
            <Descriptions.Item label="Tipo de Cuenta"><strong>{DATOS_TRANSFERENCIA.tipoCuenta}</strong></Descriptions.Item>
            <Descriptions.Item label="N° Cuenta"><strong>{DATOS_TRANSFERENCIA.numeroCuenta}</strong></Descriptions.Item>
            <Descriptions.Item label="RUT"><strong>{DATOS_TRANSFERENCIA.rut}</strong></Descriptions.Item>
            <Descriptions.Item label="Nombre"><strong>{DATOS_TRANSFERENCIA.nombre}</strong></Descriptions.Item>
            <Descriptions.Item label="Email"><strong>{DATOS_TRANSFERENCIA.email}</strong></Descriptions.Item>
            <Descriptions.Item label="Monto a transferir">
              <strong style={{ color: '#f33763', fontSize: '15px' }}>${totalAmount.toLocaleString('es-CL')}</strong>
            </Descriptions.Item>
          </Descriptions>
          <Button
            type="primary" size="large" block
            loading={loadingTransferencia}
            icon={<BankOutlined />}
            onClick={handleTransferencia}
            style={{ background: '#389e0d', border: 'none', height: '52px', fontSize: '16px', fontWeight: 600 }}
          >
            {loadingTransferencia ? 'Creando orden...' : 'Crear orden y enviar comprobante'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Banner />
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', minHeight: '70vh' }}>
        <CheckoutSteps current={1} />

        <Row align="middle" gutter={16} style={{ marginBottom: '24px' }}>
          <Col>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/checkout')}>
              Volver
            </Button>
          </Col>
          <Col flex="auto">
            <Title level={3} style={{ margin: 0 }}>Elige tu medio de pago</Title>
          </Col>
        </Row>

        {/* Resumen del total */}
        <Card size="small" style={{ marginBottom: '24px', background: '#fafafa', borderRadius: '8px' }}>
          <Row justify="space-between" align="middle" wrap>
            <Col>
              <Space direction="vertical" size={2}>
                {descuento > 0 && (
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    Descuento: −${descuento.toLocaleString('es-CL')}
                  </Text>
                )}
                <Text type="secondary" style={{ fontSize: '13px' }}>
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

        {/* Tarjetas de medios de pago */}
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {methods.map((method) => {
            const isSelected = selected === method.key;
            const isDisabled = method.disabled;
            return (
              <Card
                key={method.key}
                style={{
                  borderColor: isSelected ? method.color : '#d9d9d9',
                  borderWidth: isSelected ? 2 : 1,
                  borderRadius: '10px',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.5 : 1,
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxShadow: isSelected ? `0 0 0 2px ${method.color}22` : 'none',
                }}
                onClick={() => !isDisabled && setSelected(isSelected ? null : method.key)}
              >
                <Row align="middle" justify="space-between" wrap={false}>
                  <Col flex="auto">
                    <Space align="center" size="middle">
                      <div
                        style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          border: `2px solid ${isSelected ? method.color : '#bfbfbf'}`,
                          background: isSelected ? method.color : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, transition: 'all 0.2s',
                        }}
                      >
                        {isSelected && <CheckCircleFilled style={{ color: '#fff', fontSize: '12px' }} />}
                      </div>
                      <div>
                        <Space size="small">
                          <Text strong style={{ fontSize: '16px' }}>{method.label}</Text>
                          {method.badge && <Tag color="orange" style={{ marginLeft: 4 }}>{method.badge}</Tag>}
                        </Space>
                        <Text type="secondary" style={{ display: 'block', fontSize: '13px' }}>
                          {method.subtitle}
                        </Text>
                      </div>
                    </Space>
                  </Col>
                </Row>

                {isSelected && (
                  <div onClick={(e) => e.stopPropagation()} style={{ marginTop: '16px' }}>
                    <Divider style={{ margin: '0 0 16px' }} />
                    {method.content}
                  </div>
                )}
              </Card>
            );
          })}
        </Space>
      </div>
    </>
  );
};

export default PaymentMethodPage;
