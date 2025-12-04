// src/pages/CartPage.jsx
import { useState, useEffect } from 'react';
import { Card, List, InputNumber, Button, Typography, Space, Empty, Divider, message, Row, Col } from 'antd';
import { DeleteOutlined, ShoppingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { collection, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const { Title, Text } = Typography;

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    
    if (!user) {
      message.warning('Debes iniciar sesión para ver tu carrito');
      navigate('/login');
      return;
    }

    // Listener en tiempo real del carrito
    const cartRef = collection(db, 'users', user.uid, 'cart');
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCartItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

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

  // ⬅️ FUNCIÓN ACTUALIZADA
  const handleCheckout = () => {
    navigate('/checkout'); // Navega al checkout
  };

  if (loading) {
    return <Card loading={loading} style={{ maxWidth: 1200, margin: '50px auto' }} />;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '50px auto', padding: '0 20px' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/')}
        style={{ marginBottom: '20px' }}
      >
        Seguir Comprando
      </Button>

      <Title level={2}>
        <ShoppingOutlined /> Mi Carrito de Compras
      </Title>

      {cartItems.length === 0 ? (
        <Card>
          <Empty
            description="Tu carrito está vacío"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/')}>
              Ir a Comprar
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={24}>
          {/* Lista de productos */}
          <Col xs={24} lg={16}>
            <Card title="Productos">
              <List
                itemLayout="horizontal"
                dataSource={cartItems}
                renderItem={(item) => (
                  <List.Item
                    style={{ padding: '20px 0' }}
                    actions={[
                      <Button 
                        type="text" 
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeItem(item.id)}
                      >
                        Eliminar
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <img 
                          src={item.image || '/placeholder.png'} 
                          alt={item.name}
                          style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '8px' }}
                        />
                      }
                      title={<Text strong style={{ fontSize: '16px' }}>{item.name}</Text>}
                      description={
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          <Text type="secondary" style={{ fontSize: '16px' }}>
                            Precio: ${item.price.toLocaleString('es-CL')}
                          </Text>
                          {item.size && <Text type="secondary">Talla: {item.size}</Text>}
                          {item.color && <Text type="secondary">Color: {item.color}</Text>}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Text type="secondary">Cantidad:</Text>
                            <InputNumber
                              min={1}
                              max={99}
                              value={item.quantity}
                              onChange={(value) => updateQuantity(item.id, value)}
                            />
                          </div>
                          <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                            Subtotal: ${(item.price * item.quantity).toLocaleString('es-CL')}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Resumen del pedido */}
          <Col xs={24} lg={8}>
            <Card title="Resumen del Pedido" style={{ position: 'sticky', top: '20px' }}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <Text>Subtotal:</Text>
                    <Text>${calculateTotal().toLocaleString('es-CL')}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <Text>Envío:</Text>
                    <Text>
                      {calculateTotal() >= 20000 ? (
                        <Text type="success">¡GRATIS!</Text>
                      ) : (
                        `$${(3000).toLocaleString('es-CL')}`
                      )}
                    </Text>
                  </div>
                  <Divider />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={4} style={{ margin: 0 }}>Total:</Title>
                    <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                      ${(calculateTotal() + (calculateTotal() >= 20000 ? 0 : 3000)).toLocaleString('es-CL')}
                    </Title>
                  </div>
                </div>

                {calculateTotal() < 20000 && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Te faltan ${(20000 - calculateTotal()).toLocaleString('es-CL')} para envío gratis
                  </Text>
                )}

                <Button 
                  type="primary" 
                  size="large" 
                  block
                  icon={<ShoppingOutlined />}
                  onClick={handleCheckout}
                >
                  Proceder al Pago
                </Button>

                <Button 
                  size="large" 
                  block
                  onClick={() => navigate('/')}
                >
                  Seguir Comprando
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default CartPage;