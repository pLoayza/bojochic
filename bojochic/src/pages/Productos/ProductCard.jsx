// src/components/Productos/ProductCard.jsx
import { useState } from 'react';
import { Card, Typography, Button, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { auth, db } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import ProductModal from '../../components/Productos/ProductModal';

const { Title } = Typography;

const ProductCard = ({ producto }) => {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);

  // Formatear precio
  const formatearPrecio = (precio) => {
    if (typeof precio === 'number') {
      return `$${precio.toLocaleString('es-CL')}`;
    }
    return precio;
  };

  // Función para agregar al carrito
  const agregarAlCarrito = async (e) => {
    e.stopPropagation();

    const user = auth.currentUser;
    
    if (!user) {
      message.warning('Debes iniciar sesión para agregar productos al carrito');
      navigate('/login');
      return;
    }

    try {
      const cartItemRef = doc(db, 'users', user.uid, 'cart', producto.id);
      
      const cartItem = {
        name: producto.nombre || producto.title,
        price: producto.precio || producto.price,
        image: producto.img || producto.imagen || producto.image,
        quantity: 1,
        addedAt: new Date().toISOString(),
        size: producto.talla || null,
        color: producto.color || null,
      };

      await setDoc(cartItemRef, cartItem, { merge: true });
      
      message.success('¡Producto agregado al carrito!');
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      message.error('Error al agregar al carrito');
    }
  };

  // Función para abrir el modal
  const abrirModal = (e) => {
    e.stopPropagation();
    setModalVisible(true);
  };

  // Función para cerrar el modal
  const cerrarModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <Card
        hoverable
        style={{
          border: 'none',
          borderRadius: '0',
          overflow: 'hidden',
          boxShadow: 'none',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        bodyStyle={{
          padding: '16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
        cover={
          <div
            style={{
              width: '100%',
              paddingBottom: '75%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <img
              src={producto.img || producto.imagen || producto.image}
              alt={producto.nombre || producto.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        }
      >
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Title
            level={4}
            style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              color: '#333',
              fontWeight: '600',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {producto.nombre || producto.title}
          </Title>

          <div
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#DE0797',
              marginBottom: '16px',
            }}
          >
            {formatearPrecio(producto.precio || producto.price)}
          </div>

          {/* Botones de acción */}
          <Space direction="vertical" style={{ width: '100%', marginTop: 'auto' }} size="small">
            <Button
              type="primary"
              block
              icon={<ShoppingCartOutlined />}
              onClick={agregarAlCarrito}
              style={{
                background: 'linear-gradient(45deg, #DE0797, #FF6B9D)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                height: '40px',
              }}
            >
              Agregar al carrito
            </Button>

            <Button
              block
              onClick={abrirModal}
              style={{
                borderRadius: '8px',
                fontWeight: '600',
                height: '40px',
                borderColor: '#DE0797',
                color: '#DE0797',
              }}
            >
              Ver detalles
            </Button>
          </Space>
        </div>
      </Card>

      {/* Modal de detalles del producto */}
      <ProductModal
        visible={modalVisible}
        producto={producto}
        onClose={cerrarModal}
      />
    </>
  );
};

export default ProductCard;