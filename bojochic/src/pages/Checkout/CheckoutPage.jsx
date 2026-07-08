import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Spin, message, Grid } from 'antd';

const { useBreakpoint } = Grid;
import { auth, db } from '../../firebase/config';
import { collection, onSnapshot, doc, getDoc, deleteDoc } from 'firebase/firestore';
import CheckoutForm, { getCostoEnvio } from '../../components/Payments/CheckoutForm';
import OrderSummary from '../../components/Payments/OrderSummary';
import RecomendacionesEnvioGratis from '../../components/Payments/RecomendacionesEnvioGratis';
import Banner from '../../components/Banner/Banner';
import CheckoutSteps from '../../components/Payments/CheckoutSteps';

const CHECKOUT_DATA_KEY = 'bojo_checkout_data';

const CODIGOS_DESCUENTO = {
  /* DESACTIVADOS MIENTRAS 20% TOTAL ACTIVO
  'BOJO10':     { tipo: 'porcentaje', valor: 10 },
  'AMIGASBOJO': { tipo: 'porcentaje', valor: 20 },
  'ANJUBOJO':   { tipo: 'porcentaje', valor: 20 },
  'Bojofer':    { tipo: 'porcentaje', valor: 10 },
  'Bojonaomi':  { tipo: 'porcentaje', valor: 10 },
  'Bojobianca': { tipo: 'porcentaje', valor: 10 },
  'BOJO15JO':   { tipo: 'porcentaje', valor: 15 },
  'BOJOTEEXTRAÑA':   { tipo: 'porcentaje', valor: 10 }, */
  /* 'TESTINGQQQQZCXSD':     { tipo: 'porcentaje', valor: 99 }, */
  /* 'SANDRA': { tipo: 'porcentaje', valor: 99 }, */
  'REGALO10':   { tipo: 'porcentaje', valor: 10 },
};

const CART_KEY = 'bojo_guest_cart';

const getGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isDesktop = !!screens.lg;
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [shipping, setShipping] = useState(getCostoEnvio('Metropolitana', 0));
  const [regionGuardada, setRegionGuardada] = useState('Metropolitana');
  const [descuento, setDescuento] = useState(0);
  const [codigoAplicado, setCodigoAplicado] = useState(null);
  const [loadingCodigo, setLoadingCodigo] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      setIsGuest(false);

      const loadUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({ ...data, email: user.email });
            if (data.region) {
              setRegionGuardada(data.region);
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

        // ─── FIX: no redirigir si hay un pago en curso ───────────────
        // Cuando el backend aprueba el pago y limpia el carrito,
        // onSnapshot detecta 0 items y redirigía al inicio antes de que
        // el usuario viera la pantalla de éxito en /webpay/return.
        const paymentInProgress = sessionStorage.getItem('bojo_payment_in_progress');

        if (items.length === 0 && !paymentInProgress) {
          message.info('Tu carrito está vacío');
          navigate('/');
        }
        // ─────────────────────────────────────────────────────────────

        setCartItems(items);
        setLoading(false);
      });

      return () => unsubscribe();

    } else {
      setIsGuest(true);
      setUserData(null);

      const items = getGuestCart();

      if (items.length === 0) {
        message.info('Tu carrito está vacío');
        navigate('/');
        return;
      }

      setCartItems(items);
      setLoading(false);
    }
  }, [navigate]);

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  useEffect(() => {
    if (regionGuardada && cartItems.length > 0) {
      setShipping(getCostoEnvio(regionGuardada, subtotal));
    }
  }, [cartItems, regionGuardada, subtotal]);

  useEffect(() => {
    if (codigoAplicado) {
      const promo = CODIGOS_DESCUENTO[codigoAplicado];
      if (promo?.tipo === 'porcentaje') {
        setDescuento(Math.round(subtotal * promo.valor / 100));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, codigoAplicado]);

  const handleRegionChange = (region) => {
    setRegionGuardada(region);
    setShipping(getCostoEnvio(region, subtotal));
  };

  const aplicarCodigo = async (codigo) => {
    const codigoUpper = codigo.trim().toUpperCase();
    setLoadingCodigo(true);

    try {
      const promo = CODIGOS_DESCUENTO[codigoUpper];
      if (!promo) {
        message.error('Código de descuento inválido');
        return;
      }

      if (!isGuest) {
        const user = auth.currentUser;
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const codigosUsados = userDoc.data()?.codigosUsados || [];

        if (codigosUsados.includes(codigoUpper)) {
          message.error('Este código ya fue utilizado en tu cuenta');
          return;
        }
      }

      const descuentoCalculado = promo.tipo === 'porcentaje'
        ? Math.round(subtotal * promo.valor / 100)
        : promo.valor;

      setDescuento(descuentoCalculado);
      setCodigoAplicado(codigoUpper);
      message.success(`¡Código aplicado! Descuento de $${descuentoCalculado.toLocaleString('es-CL')}`);

    } catch (error) {
      console.error('Error aplicando código:', error);
      message.error('Error al aplicar el código');
    } finally {
      setLoadingCodigo(false);
    }
  };

  const quitarCodigo = () => {
    setDescuento(0);
    setCodigoAplicado(null);
  };

  const removeItem = async (item) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const itemRef = doc(db, 'users', user.uid, 'cart', item.id);
        await deleteDoc(itemRef);
        message.success('Producto eliminado del carrito');
      } else {
        const cartKey = item.size ? `${item.id}_${item.size}` : item.id;
        const updated = cartItems.filter(i => {
          const k = i.size ? `${i.id}_${i.size}` : i.id;
          return k !== cartKey;
        });
        localStorage.setItem(CART_KEY, JSON.stringify(updated));
        setCartItems(updated);
        message.success('Producto eliminado del carrito');
      }
    } catch (error) {
      console.error('Error eliminando producto:', error);
      message.error('Error al eliminar el producto');
    }
  };

  const total = subtotal + shipping - descuento;

  const onPagoConfirmado = (formValues) => {
    sessionStorage.setItem(CHECKOUT_DATA_KEY, JSON.stringify({
      formValues,
      totalAmount: total,
      shipping,
      cartItems,
      isGuest,
      codigoAplicado,
      descuento,
    }));
    navigate('/checkout/pago');
  };

  if (loading) {
    return (
      <>
        <Banner />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Spin size="large" />
        </div>
      </>
    );
  }

  return (
    <>
      <Banner />
      <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '0 20px', minHeight: '70vh' }}>
        <CheckoutSteps current={0} />
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={14}>
            <CheckoutForm
              userData={userData}
              isGuest={isGuest}
              cartItems={cartItems}
              totalAmount={total}
              onRegionChange={handleRegionChange}
              shipping={shipping}
              onAplicarCodigo={aplicarCodigo}
              onQuitarCodigo={quitarCodigo}
              codigoAplicado={codigoAplicado}
              loadingCodigo={loadingCodigo}
              onConfirmarPago={onPagoConfirmado}
            />
          </Col>
          <Col xs={24} lg={10}>
            <div style={{ position: isDesktop ? 'sticky' : 'static', top: isDesktop ? '20px' : 'auto' }}>
              <OrderSummary
                cartItems={cartItems}
                subtotal={subtotal}
                shipping={shipping}
                descuento={descuento}
                codigoAplicado={codigoAplicado}
                total={total}
                onRemoveItem={removeItem}
              />
              <RecomendacionesEnvioGratis
                subtotal={subtotal}
                cartItems={cartItems}
              />
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default CheckoutPage;