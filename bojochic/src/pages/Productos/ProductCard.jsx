// src/components/Productos/ProductCard.jsx
import { Card, Typography, Button, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { auth, db } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

const { Title } = Typography;

const ProductCard = ({ producto }) => {
  const navigate = useNavigate();

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

  return (
    <Card
      hoverable
      onClick={() => navigate(`/producto/${producto.id}`)}
      style={{
        border: 'none',
        borderRadius: '0',
        overflow: 'hidden',
        boxShadow: 'none',
      }}
      bodyStyle={{
        padding: '16px',
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
      <div style={{ textAlign: 'center' }}>
        <Title
          level={4}
          style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            color: '#333',
            fontWeight: '600',
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
        <Space direction="vertical" style={{ width: '100%' }} size="small">
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
  );
};

export default ProductCard;