import { useState, useEffect } from 'react';
import { Modal, Button, Badge, List, InputNumber, Typography, Space, Empty, message, Progress } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, ShoppingOutlined, CloseOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { collection, doc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { useResponsive } from '../../hooks/useResponsive';

const { Title, Text } = Typography;

// ─── Helpers localStorage (guest) ────────────────────────────────────────────
const CART_KEY = 'bojo_guest_cart';

const getGuestCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
};

const saveGuestCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};
// ─────────────────────────────────────────────────────────────────────────────

function ShoppingCart({ iconColor = ' #ffffff', iconSize = '22px', showInNavbar = false }) {
  const [open, setOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      const cartRef = collection(db, 'users', user.uid, 'cart');
      const unsubscribe = onSnapshot(cartRef, (snapshot) => {
        const items = snapshot.docs.map(docSnap => ({
          cartKey: docSnap.id,
          ...docSnap.data(),
        }));
        setCartItems(items);
      });
      return () => unsubscribe();
    } else {
      setCartItems(getGuestCart());

      const handleStorage   = (e) => { if (e.key === CART_KEY) setCartItems(getGuestCart()); };
      const handleGuestCart = () => setCartItems(getGuestCart());

      window.addEventListener('storage', handleStorage);
      window.addEventListener('guestCartUpdated', handleGuestCart);
      return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener('guestCartUpdated', handleGuestCart);
      };
    }
  }, []);

  const showModal = () => setOpen(true);
  const onClose  = () => setOpen(false);

  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    const user = auth.currentUser;
    if (user) {
      try {
        const docKey  = item.cartKey || item.id;
        const itemRef = doc(db, 'users', user.uid, 'cart', docKey);
        await updateDoc(itemRef, { quantity: newQuantity });
        message.success('Cantidad actualizada');
      } catch (error) {
        console.error('Error actualizando cantidad:', error);
        message.error('Error al actualizar');
      }
    } else {
      const cartKey = item.cartKey || (item.size ? `${item.id}_${item.size}` : item.id);
      const updated = getGuestCart().map(i => {
        const iKey = i.size ? `${i.id}_${i.size}` : i.id;
        return iKey === cartKey ? { ...i, quantity: newQuantity } : i;
      });
      saveGuestCart(updated);
      setCartItems(updated);
      message.success('Cantidad actualizada');
    }
  };

  const removeItem = async (item) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const docKey  = item.cartKey || item.id;
        const itemRef = doc(db, 'users', user.uid, 'cart', docKey);
        await deleteDoc(itemRef);
        message.success('Producto eliminado del carrito');
      } catch (error) {
        console.error('Error eliminando producto:', error);
        message.error('Error al eliminar');
      }
    } else {
      const cartKey = item.cartKey || (item.size ? `${item.id}_${item.size}` : item.id);
      const updated = getGuestCart().filter(i => {
        const iKey = i.size ? `${i.id}_${i.size}` : i.id;
        return iKey !== cartKey;
      });
      saveGuestCart(updated);
      setCartItems(updated);
      message.success('Producto eliminado del carrito');
    }
  };

  const calculateTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const finalIconColor = showInNavbar ? 'white' : iconColor;

  return (
    <>
      {/* Botón del carrito */}
      <Badge
        count={cartItems.length}
        showZero={false}
        style={{
          backgroundColor: showInNavbar ? 'white' : ' #f33763',
          color: showInNavbar ? ' #f33763' : 'white',
        }}
      >
        <ShoppingCartOutlined
          style={{
            fontSize: iconSize,
            color: finalIconColor,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onClick={showModal}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        />
      </Badge>

      {/* Modal Fullscreen en móvil */}
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={isMobile ? '100vw' : 500}
        centered={!isMobile}
        style={isMobile ? {
          top: 0, left: 0, right: 0, bottom: 0,
          padding: 0, maxWidth: '100vw', margin: 0,
          height: '100dvh', // ✅ CAMBIO
        } : { top: 20 }}
        styles={{
          body: {
            padding: 0,
            height: isMobile ? '100dvh' : 'auto',       // ✅ CAMBIO
            maxHeight: isMobile ? '100dvh' : '80vh',    // ✅ CAMBIO
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
          content: isMobile ? {
            padding: 0, borderRadius: 0,
            height: '100dvh', width: '100vw', maxWidth: '100vw', // ✅ CAMBIO
          } : {},
          mask: {
            backgroundColor: isMobile ? 'transparent' : 'rgba(0, 0, 0, 0.45)',
          }
        }}
        closeIcon={null}
        destroyOnClose
        modalRender={(modal) => isMobile ? (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            width: '100vw', height: '100dvh', zIndex: 1000, // ✅ CAMBIO
          }}>
            {modal}
          </div>
        ) : modal}
      >
        {/* Header */}
        <div style={{
          padding: isMobile ? '16px' : '20px',
          borderBottom: '1px solid #f0f0f0',
          background: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0, zIndex: 10,
          minHeight: '60px',
        }}>
          <Space>
            <ShoppingCartOutlined style={{ fontSize: '20px', color: ' #f33763' }} />
            <Text strong style={{ fontSize: '18px' }}>Mi Carrito</Text>
          </Space>
          <Button
            type="text"
            icon={<CloseOutlined style={{ fontSize: '18px' }} />}
            onClick={onClose}
            style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </div>

        {/* Contenido */}
        <div style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: '0', width: '100%', WebkitOverflowScrolling: 'touch',
        }}>
          {cartItems.length === 0 ? (
            <Empty
              description="Tu carrito está vacío"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ marginTop: isMobile ? '120px' : '80px', padding: '20px' }}
            >
              <Button
                type="primary"
                onClick={onClose}
                style={{
                  background: ' #f33763', borderColor: ' #f33763',
                  height: '50px', fontSize: '16px', padding: '0 40px'
                }}
              >
                Ir a Comprar
              </Button>
            </Empty>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={cartItems}
              style={{ padding: isMobile ? '0 16px' : '0 20px', width: '100%', boxSizing: 'border-box' }}
              renderItem={(item) => (
                <List.Item
                  style={{ padding: isMobile ? '20px 0' : '16px 0', borderBottom: '1px solid #f0f0f0' }}
                  actions={[
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined style={{ fontSize: '18px' }} />}
                      onClick={() => removeItem(item)}
                      style={{ height: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {isMobile && <span style={{ marginLeft: '4px' }}>Eliminar</span>}
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        style={{
                          width: isMobile ? (window.innerWidth < 375 ? 70 : 80) : 70,
                          height: isMobile ? (window.innerWidth < 375 ? 70 : 80) : 70,
                          objectFit: 'cover', borderRadius: '10px',
                          border: '1px solid #f0f0f0', flexShrink: 0,
                        }}
                      />
                    }
                    title={
                      <Text strong style={{
                        fontSize: isMobile ? (window.innerWidth < 375 ? '14px' : '15px') : '15px',
                        display: 'block', marginBottom: '4px', wordBreak: 'break-word',
                      }}>
                        {item.name}
                      </Text>
                    }
                    description={
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Text style={{ fontSize: isMobile ? '16px' : '14px', color: '#666', fontWeight: '500' }}>
                          ${item.price.toLocaleString('es-CL')}
                        </Text>
                        {item.size  && <Text type="secondary" style={{ fontSize: '14px' }}>Talla: {item.size}</Text>}
                        {item.color && <Text type="secondary" style={{ fontSize: '14px' }}>Color: {item.color}</Text>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                          <Text style={{ fontSize: '14px', color: '#666' }}>Cantidad:</Text>
                          <InputNumber
                            min={1} max={99}
                            value={item.quantity}
                            onChange={(value) => updateQuantity(item, value)}
                            size="large"
                            style={{ width: '90px', fontSize: '16px' }}
                          />
                        </div>
                        <Text strong style={{
                          color: ' #f33763', fontSize: isMobile ? '17px' : '16px',
                          marginTop: '12px', display: 'block', fontWeight: '600'
                        }}>
                          Subtotal: ${(item.price * item.quantity).toLocaleString('es-CL')}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>

        {/* Footer con total y botón */}
        {cartItems.length > 0 && (
          <div style={{
            padding: isMobile ? '16px' : '20px',
            background: 'white', borderTop: '2px solid #f0f0f0',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
            width: '100%', boxSizing: 'border-box',
          }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* Barra envío gratis */}
              {(() => {
                const MINIMO = 19990;
                const total = calculateTotal();
                const falta = Math.max(0, MINIMO - total);
                const pct = Math.min(100, Math.round((total / MINIMO) * 100));
                return falta > 0 ? (
                  <div style={{ background: '#fff8f9', border: '1px solid #ffd6e0', borderRadius: '10px', padding: '10px 14px' }}>
                    <Text style={{ fontSize: '13px', color: '#555' }}>
                      Agrega{' '}
                      <Text strong style={{ color: '#f33763' }}>
                        ${falta.toLocaleString('es-CL')}
                      </Text>
                      {' '}más para conseguir <Text strong>envío gratis</Text>
                    </Text>
                    <Progress
                      percent={pct}
                      showInfo={false}
                      strokeColor="#f33763"
                      trailColor="#f0d0d8"
                      size="small"
                      style={{ marginTop: '6px', marginBottom: 0 }}
                    />
                  </div>
                ) : (
                  <div style={{
                    background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '10px',
                    padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <CheckCircleFilled style={{ color: '#52c41a', fontSize: '16px' }} />
                    <Text strong style={{ color: '#389e0d', fontSize: '13px' }}>
                      ¡Tienes envío gratis en regiones seleccionadas!
                    </Text>
                  </div>
                );
              })()}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                <Text strong style={{ fontSize: '20px', color: '#333' }}>Total:</Text>
                <Text strong style={{ fontSize: '28px', color: ' #f33763', fontWeight: 'bold' }}>
                  ${calculateTotal().toLocaleString('es-CL')}
                </Text>
              </div>

              <Button
                type="primary" size="large" block
                icon={<ShoppingOutlined />}
                onClick={handleCheckout}
                style={{
                  background: ' #f33763', borderColor: ' #f33763',
                  height: '56px', fontSize: '18px', fontWeight: '600', borderRadius: '12px',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#c00686'; e.currentTarget.style.borderColor = '#c00686'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ' #f33763'; e.currentTarget.style.borderColor = ' #f33763'; }}
              >
                Continuar compra
              </Button>
            </Space>
          </div>
        )}
      </Modal>
    </>
  );
}

export default ShoppingCart;