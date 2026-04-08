import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Spin, message } from 'antd';
import { auth, db } from '../../firebase/config';
import { collection, onSnapshot, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import CheckoutForm, { getCostoEnvio } from '../../components/Payments/CheckoutForm';
import OrderSummary from '../../components/Payments/OrderSummary';
import Banner from '../../components/Banner/Banner';

const CODIGOS_DESCUENTO = {
  'BOJO10':     { tipo: 'porcentaje', valor: 10 },
  'AMIGASBOJO': { tipo: 'porcentaje', valor: 20 },
  'ANJUBOJO':   { tipo: 'porcentaje', valor: 20 }
};

// ─── Helpers para carrito guest (localStorage) ───────────────────────────────
const CART_KEY = 'bojo_guest_cart';

const getGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
};

const clearGuestCart = () => {
  localStorage.removeItem(CART_KEY);
};
// ─────────────────────────────────────────────────────────────────────────────

const CheckoutPage = () => {
  const navigate = useNavigate();
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

    // ── USUARIO REGISTRADO ──────────────────────────────────────────────────
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

      // Carrito desde Firestore
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

    // ── GUEST ───────────────────────────────────────────────────────────────
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

  // Recalcula envío cuando cambian los items o la región
  useEffect(() => {
    if (regionGuardada && cartItems.length > 0) {
      const sub = cartItems.reduce((t, i) => t + (i.price * i.quantity), 0);
      setShipping(getCostoEnvio(regionGuardada, sub)); // 👈 ahora usa getCostoEnvio directo
    }
  }, [cartItems, regionGuardada]);

  // Recalcula descuento si cambia el subtotal
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
    setShipping(getCostoEnvio(region, subtotal)); // 👈 ahora usa getCostoEnvio directo
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

  const marcarCodigoUsado = async () => {
    if (isGuest || !codigoAplicado) return;

    try {
      const user = auth.currentUser;
      await updateDoc(doc(db, 'users', user.uid), {
        codigosUsados: arrayUnion(codigoAplicado)
      });
    } catch (error) {
      console.error('Error marcando código como usado:', error);
    }
  };

  const onPagoConfirmado = () => {
    if (isGuest) {
      clearGuestCart();
    }
    marcarCodigoUsado();
  };

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const total = subtotal + shipping - descuento;

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
            <OrderSummary
              cartItems={cartItems}
              subtotal={subtotal}
              shipping={shipping}
              descuento={descuento}
              codigoAplicado={codigoAplicado}
              total={total}
            />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default CheckoutPage;