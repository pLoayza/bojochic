import { useState, useEffect } from 'react';
import { Modal, Button, Badge, List, InputNumber, Typography, Space, Empty, message } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, ShoppingOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { collection, doc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { useResponsive } from '../../hooks/useResponsive';

const { Title, Text } = Typography;

function ShoppingCart({ iconColor = '#DE0797', iconSize = '22px', showInNavbar = false }) {
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
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCartItems(items);
      });

      return () => unsubscribe();
    } else {
      setCartItems([]);
    }
  }, []);

  const showModal = () => {
    if (!auth.currentUser) {
      message.warning('Debes iniciar sesión para ver tu carrito');
      return;
    }
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const user = auth.currentUser;
      const itemRef = doc(db, 'users', user.uid, 'cart', itemId);
      await updateDoc(itemRef, { quantity: newQuantity });
      message.success('Cantidad actualizada');
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
      message.error('Error al actualizar');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const user = auth.currentUser;
      const itemRef = doc(db, 'users', user.uid, 'cart', itemId);
      await deleteDoc(itemRef);
      message.success('Producto eliminado del carrito');
    } catch (error) {
      console.error('Error eliminando producto:', error);
      message.error('Error al eliminar');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

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
          backgroundColor: showInNavbar ? 'white' : '#DE0797',
          color: showInNavbar ? '#DE0797' : 'white',
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
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.15)';
          }}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: 0,
          maxWidth: '100vw',
          margin: 0,
          height: '100vh',
        } : { top: 20 }}
        styles={{
          body: { 
            padding: 0,
            height: isMobile ? '100vh' : 'auto',
            maxHeight: isMobile ? '100vh' : '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
          content: isMobile ? {
            padding: 0,
            borderRadius: 0,
            height: '100vh',
            width: '100vw',
            maxWidth: '100vw',
          } : {},
          mask: {
            backgroundColor: isMobile ? 'transparent' : 'rgba(0, 0, 0, 0.45)',
          }
        }}
        closeIcon={null}
        destroyOnClose
        modalRender={(modal) => isMobile ? (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1000,
          }}>
            {modal}
          </div>
        ) : modal}
      >
        {/* Header personalizado */}
        <div style={{
          padding: isMobile ? '16px' : '20px',
          borderBottom: '1px solid #f0f0f0',
          background: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          minHeight: '60px',
        }}>
          <Space>
            <ShoppingCartOutlined style={{ fontSize: '20px', color: '#DE0797' }} />
            <Text strong style={{ fontSize: '18px' }}>Mi Carrito</Text>
          </Space>
          <Button 
            type="text" 
            icon={<CloseOutlined style={{ fontSize: '18px' }} />}
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </div>

        {/* Contenido del carrito */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '0',
          width: '100%',
          WebkitOverflowScrolling: 'touch',
        }}>
          {cartItems.length === 0 ? (
            <Empty
              description="Tu carrito está vacío"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ 
                marginTop: isMobile ? '120px' : '80px',
                padding: '20px'
              }}
            >
              <Button 
                type="primary" 
                onClick={onClose}
                style={{
                  background: '#DE0797',
                  borderColor: '#DE0797',
                  height: '50px',
                  fontSize: '16px',
                  padding: '0 40px'
                }}
              >
                Ir a Comprar
              </Button>
            </Empty>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={cartItems}
              style={{ 
                padding: isMobile ? '0 16px' : '0 20px',
                width: '100%',
                boxSizing: 'border-box',
              }}
              renderItem={(item) => (
                <List.Item
                  style={{ 
                    padding: isMobile ? '20px 0' : '16px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                  actions={[
                    <Button 
                      type="text" 
                      danger
                      icon={<DeleteOutlined style={{ fontSize: '18px' }} />}
                      onClick={() => removeItem(item.id)}
                      style={{
                        height: '44px',
                        minWidth: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
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
                          objectFit: 'cover', 
                          borderRadius: '10px',
                          border: '1px solid #f0f0f0',
                          flexShrink: 0,
                        }}
                      />
                    }
                    title={
                      <Text strong style={{ 
                        fontSize: isMobile ? (window.innerWidth < 375 ? '14px' : '15px') : '15px',
                        display: 'block',
                        marginBottom: '4px',
                        wordBreak: 'break-word',
                      }}>
                        {item.name}
                      </Text>
                    }
                    description={
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Text 
                          style={{ 
                            fontSize: isMobile ? '16px' : '14px',
                            color: '#666',
                            fontWeight: '500'
                          }}
                        >
                          ${item.price.toLocaleString('es-CL')}
                        </Text>
                        {item.size && (
                          <Text type="secondary" style={{ fontSize: '14px' }}>
                            Talla: {item.size}
                          </Text>
                        )}
                        {item.color && (
                          <Text type="secondary" style={{ fontSize: '14px' }}>
                            Color: {item.color}
                          </Text>
                        )}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          marginTop: '12px'
                        }}>
                          <Text style={{ 
                            fontSize: '14px',
                            color: '#666'
                          }}>
                            Cantidad:
                          </Text>
                          <InputNumber
                            min={1}
                            max={99}
                            value={item.quantity}
                            onChange={(value) => updateQuantity(item.id, value)}
                            size="large"
                            style={{ 
                              width: '90px',
                              fontSize: '16px'
                            }}
                          />
                        </div>
                        <Text 
                          strong 
                          style={{ 
                            color: '#DE0797',
                            fontSize: isMobile ? '17px' : '16px',
                            marginTop: '12px',
                            display: 'block',
                            fontWeight: '600'
                          }}
                        >
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

        {/* Footer fijo con total y botón */}
        {cartItems.length > 0 && (
          <div style={{
            padding: isMobile ? '16px' : '20px',
            background: 'white',
            borderTop: '2px solid #f0f0f0',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* Total */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '10px 0',
              }}>
                <Text strong style={{ 
                  fontSize: '20px',
                  color: '#333'
                }}>
                  Total:
                </Text>
                <Text strong style={{ 
                  fontSize: '28px',
                  color: '#DE0797',
                  fontWeight: 'bold'
                }}>
                  ${calculateTotal().toLocaleString('es-CL')}
                </Text>
              </div>
              
              {/* Botón Checkout */}
              <Button 
                type="primary" 
                size="large" 
                block
                icon={<ShoppingOutlined />}
                onClick={handleCheckout}
                style={{
                  background: '#DE0797',
                  borderColor: '#DE0797',
                  height: '56px',
                  fontSize: '18px',
                  fontWeight: '600',
                  borderRadius: '12px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#c00686';
                  e.currentTarget.style.borderColor = '#c00686';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#DE0797';
                  e.currentTarget.style.borderColor = '#DE0797';
                }}
              >
                Proceder al Pago
              </Button>
            </Space>
          </div>
        )}
      </Modal>
    </>
  );
}

export default ShoppingCart;