import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Spin, message } from 'antd';
import { auth, db } from '../../firebase/config';
import { collection, onSnapshot, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import CheckoutForm, { getCostoEnvio } from '../../components/Payments/CheckoutForm';
import OrderSummary from '../../components/Payments/OrderSummary';
import Banner from '../../components/Banner/Banner';

const DESCUENTO_ENVIO = 3990;
const UMBRAL_DESCUENTO = 30000;

const CODIGOS_DESCUENTO = {
  'BOJO10': { tipo: 'porcentaje', valor: 10 },
  // agrega más códigos aquí
};

const calcularEnvio = (region, subtotalProductos) => {
  const costoBase = getCostoEnvio(region);
  return subtotalProductos >= UMBRAL_DESCUENTO
    ? Math.max(0, costoBase - DESCUENTO_ENVIO)
    : costoBase;
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [shipping, setShipping] = useState(calcularEnvio('Metropolitana', 0));
  const [regionGuardada, setRegionGuardada] = useState('Metropolitana');
  const [descuento, setDescuento] = useState(0);
  const [codigoAplicado, setCodigoAplicado] = useState(null);
  const [loadingCodigo, setLoadingCodigo] = useState(false);

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

      if (items.length === 0) {
        message.info('Tu carrito está vacío');
        navigate('/');
      }

      setCartItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (regionGuardada && cartItems.length > 0) {
      const sub = cartItems.reduce((t, i) => t + (i.price * i.quantity), 0);
      setShipping(calcularEnvio(regionGuardada, sub));
    }
  }, [cartItems, regionGuardada]);

  // Si el subtotal cambia y hay código aplicado, recalcula el descuento
  useEffect(() => {
    if (codigoAplicado) {
      const promo = CODIGOS_DESCUENTO[codigoAplicado];
      if (promo?.tipo === 'porcentaje') {
        setDescuento(Math.round(subtotal * promo.valor / 100));
      }
    }
  }, [cartItems, codigoAplicado]);

  const handleRegionChange = (region) => {
    setShipping(calcularEnvio(region, subtotal));
  };

  const aplicarCodigo = async (codigo) => {
    const codigoUpper = codigo.trim().toUpperCase();
    setLoadingCodigo(true);

    try {
      // 1. Verificar que el código existe
      const promo = CODIGOS_DESCUENTO[codigoUpper];
      if (!promo) {
        message.error('Código de descuento inválido');
        return;
      }

      // 2. Verificar que el usuario no lo haya usado antes
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const codigosUsados = userDoc.data()?.codigosUsados || [];

      if (codigosUsados.includes(codigoUpper)) {
        message.error('Este código ya fue utilizado en tu cuenta');
        return;
      }

      // 3. Calcular y aplicar descuento
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

  // El registro de que fue usado se hace en el backend al confirmar el pago,
  // pero como fallback también lo puedes hacer aquí si quieres (opcional)
  const marcarCodigoUsado = async () => {
    if (!codigoAplicado) return;
    try {
      const user = auth.currentUser;
      await updateDoc(doc(db, 'users', user.uid), {
        codigosUsados: arrayUnion(codigoAplicado)
      });
    } catch (error) {
      console.error('Error marcando código como usado:', error);
    }
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
              cartItems={cartItems}
              totalAmount={total}
              onRegionChange={handleRegionChange}
              shipping={shipping}
              onAplicarCodigo={aplicarCodigo}
              onQuitarCodigo={quitarCodigo}
              codigoAplicado={codigoAplicado}
              loadingCodigo={loadingCodigo}
              onConfirmarPago={marcarCodigoUsado}
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