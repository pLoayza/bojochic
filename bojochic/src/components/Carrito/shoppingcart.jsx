import { useState, useEffect } from 'react';
import { Drawer, Button, Badge, List, InputNumber, Typography, Space, Empty, Divider, message } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // ⬅️ AGREGADO
import { auth, db } from '../../firebase/config';
import { collection, doc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';

const { Title, Text } = Typography;

function ShoppingCart() {
  const [open, setOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ⬅️ AGREGADO

  useEffect(() => {
    const user = auth.currentUser;
    
    // Listener siempre activo si hay usuario autenticado
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
      // Si no hay usuario, limpiar el carrito
      setCartItems([]);
    }
  }, []);

  const showDrawer = () => {
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

  // ⬅️ FUNCIÓN ACTUALIZADA
  const handleCheckout = () => {
    onClose(); // Cierra el drawer
    navigate('/checkout'); // Navega al checkout
  };

  return (
    <>
      {/* Botón del carrito en el navbar */}
      <Badge count={cartItems.length} showZero>
        <Button 
          type="text" 
          icon={<ShoppingCartOutlined style={{ fontSize: '20px', color: 'white' }} />}
          onClick={showDrawer}
        />
      </Badge>

      {/* Drawer del carrito */}
      <Drawer
        title={
          <Space>
            <ShoppingCartOutlined />
            <span>Mi Carrito</span>
          </Space>
        }
        placement="right"
        onClose={onClose}
        open={open}
        width={400}
        footer={
          cartItems.length > 0 && (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Divider style={{ margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: '18px' }}>Total:</Text>
                <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                  ${calculateTotal().toLocaleString('es-CL')}
                </Title>
              </div>
              <Button 
                type="primary" 
                size="large" 
                block
                icon={<ShoppingOutlined />}
                onClick={handleCheckout}
              >
                Proceder al Pago
              </Button>
            </Space>
          )
        }
      >
        {cartItems.length === 0 ? (
          <Empty
            description="Tu carrito está vacío"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={onClose}>
              Ir a Comprar
            </Button>
          </Empty>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={cartItems}
            renderItem={(item) => (
              <List.Item
                style={{ padding: '16px 0' }}
                actions={[
                  <Button 
                    type="text" 
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeItem(item.id)}
                  />
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <img 
                      src={item.image || '/placeholder.png'} 
                      alt={item.name}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px' }}
                    />
                  }
                  title={<Text strong>{item.name}</Text>}
                  description={
                    <Space direction="vertical" size="small">
                      <Text type="secondary">${item.price.toLocaleString('es-CL')}</Text>
                      {item.size && <Text type="secondary">Talla: {item.size}</Text>}
                      {item.color && <Text type="secondary">Color: {item.color}</Text>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text type="secondary">Cantidad:</Text>
                        <InputNumber
                          min={1}
                          max={99}
                          value={item.quantity}
                          onChange={(value) => updateQuantity(item.id, value)}
                          size="small"
                        />
                      </div>
                      <Text strong style={{ color: '#1890ff' }}>
                        Subtotal: ${(item.price * item.quantity).toLocaleString('es-CL')}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </>
  );
}

export default ShoppingCart;