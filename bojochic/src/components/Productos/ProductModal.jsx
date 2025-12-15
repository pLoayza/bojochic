// src/components/Productos/ProductModal.jsx
import { Modal, Image, Button, Tag, Descriptions, Space, message } from 'antd';
import { ShoppingCartOutlined, CloseOutlined } from '@ant-design/icons';
import { auth, db } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const ProductModal = ({ visible, producto, onClose }) => {
  const navigate = useNavigate();

  // Si no hay producto, no renderizar nada
  if (!producto) return null;

  // Formatear precio
  const formatearPrecio = (precio) => {
    if (typeof precio === 'number') {
      return `$${precio.toLocaleString('es-CL')}`;
    }
    return precio;
  };

  // Función para agregar al carrito
  const agregarAlCarrito = async () => {
    const user = auth.currentUser;

    if (!user) {
      message.warning('Debes iniciar sesión para agregar productos al carrito');
      onClose();
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
      onClose();
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      message.error('Error al agregar al carrito');
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ maxWidth: '900px', top: 20 }}
      closeIcon={<CloseOutlined style={{ fontSize: '20px', color: '#666' }} />}
      styles={{
        body: { padding: '20px' },
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '30px',
          flexWrap: 'wrap',
        }}
      >
        {/* Columna de imagen */}
        <div style={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Image
            src={producto.img || producto.imagen || producto.image}
            alt={producto.nombre || producto.title}
            style={{
              width: '100%',
              borderRadius: '12px',
              objectFit: 'cover',
            }}
            preview={{
              mask: 'Ver imagen completa',
            }}
          />
        </div>

        {/* Columna de información */}
        <div style={{ flex: '1 1 350px', minWidth: '250px' }}>
          {/* Nombre del producto */}
          <h2
            style={{
              margin: '0 0 10px 0',
              fontSize: 'clamp(22px, 5vw, 28px)',
              fontWeight: '700',
              color: '#333',
            }}
          >
            {producto.nombre || producto.title}
          </h2>

          {/* Precio */}
          <div
            style={{
              fontSize: 'clamp(26px, 6vw, 32px)',
              fontWeight: 'bold',
              color: '#DE0797',
              marginBottom: '20px',
            }}
          >
            {formatearPrecio(producto.precio || producto.price)}
          </div>

          {/* Tags de estado */}
          <Space style={{ marginBottom: '25px', flexWrap: 'wrap' }}>
            {producto.activo !== false && (
              <Tag color="green" style={{ fontSize: '13px', padding: '4px 10px' }}>
                Disponible
              </Tag>
            )}
            {producto.stock > 0 ? (
              <Tag color="blue" style={{ fontSize: '13px', padding: '4px 10px' }}>
                {producto.stock} en stock
              </Tag>
            ) : (
              <Tag color="red" style={{ fontSize: '13px', padding: '4px 10px' }}>
                Agotado
              </Tag>
            )}
            {producto.categoria && (
              <Tag color="magenta" style={{ fontSize: '13px', padding: '4px 10px' }}>
                {producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1)}
              </Tag>
            )}
          </Space>

          {/* Descripción */}
          {producto.descripcion && (
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
                Descripción:
              </h4>
              <p style={{ color: '#666', lineHeight: '1.6', fontSize: '15px' }}>
                {producto.descripcion}
              </p>
            </div>
          )}

          {/* Características del producto */}
          {(producto.material || producto.talla || producto.color || producto.peso) && (
            <Descriptions
              column={1}
              bordered
              size="small"
              style={{ marginBottom: '25px' }}
            >
              {producto.material && (
                <Descriptions.Item
                  label="Material"
                  labelStyle={{ fontWeight: '600', width: '100px' }}
                >
                  {producto.material}
                </Descriptions.Item>
              )}
              {producto.talla && (
                <Descriptions.Item
                  label="Tamaño"
                  labelStyle={{ fontWeight: '600', width: '100px' }}
                >
                  {producto.talla}
                </Descriptions.Item>
              )}
              {producto.color && (
                <Descriptions.Item
                  label="Color"
                  labelStyle={{ fontWeight: '600', width: '100px' }}
                >
                  {producto.color}
                </Descriptions.Item>
              )}
              {producto.peso && (
                <Descriptions.Item
                  label="Peso"
                  labelStyle={{ fontWeight: '600', width: '100px' }}
                >
                  {producto.peso}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}

          {/* Información adicional */}
          <div
            style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '25px',
            }}
          >
            <p
              style={{
                fontSize: '13px',
                color: '#666',
                margin: 0,
                lineHeight: '1.8',
              }}
            >
              ✓ Envío gratis en compras sobre $20.000
              <br />
              ✓ Garantía de 30 días
              <br />
              ✓ Materiales hipoalergénicos
              <br />✓ Atención al cliente 24/7
            </p>
          </div>

          {/* Botones de acción */}
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button
              type="primary"
              size="large"
              block
              icon={<ShoppingCartOutlined />}
              onClick={agregarAlCarrito}
              disabled={producto.stock === 0 || producto.activo === false}
              style={{
                background:
                  producto.stock === 0 || producto.activo === false
                    ? '#d9d9d9'
                    : 'linear-gradient(45deg, #DE0797, #FF6B9D)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                height: '50px',
                fontSize: '16px',
              }}
            >
              {producto.stock === 0 || producto.activo === false
                ? 'Producto no disponible'
                : 'Agregar al carrito'}
            </Button>

            <Button
              size="large"
              block
              onClick={onClose}
              style={{
                borderRadius: '8px',
                fontWeight: '600',
                height: '45px',
                borderColor: '#DE0797',
                color: '#DE0797',
              }}
            >
              Seguir comprando
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default ProductModal;