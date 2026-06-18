import { useState, useEffect } from 'react';
import { Typography, Spin, Card } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { calcularPrecio, formatearPrecio } from '../../utils/precioUtils';
import { MINIMO_ENVIO_GRATIS } from './CheckoutForm';
import ProductModal from '../Productos/ProductModal';

const { Text } = Typography;

const RecomendacionesEnvioGratis = ({ subtotal, cartItems }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const falta = Math.max(0, MINIMO_ENVIO_GRATIS - subtotal);

  useEffect(() => {
    if (falta <= 0) return;

    const cargar = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'productos'));
        const cartIds = new Set(cartItems.map(i => i.id));

        const todos = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.activo !== false && p.stock > 0 && !cartIds.has(p.id));

        const conPrecio = todos.map(p => ({
          ...p,
          _precioFinal: calcularPrecio(p).precioFinal,
        }));

        // Los 3 más cercanos al monto faltante
        const ordenados = conPrecio
          .sort((a, b) => Math.abs(a._precioFinal - falta) - Math.abs(b._precioFinal - falta))
          .slice(0, 3);

        setProductos(ordenados);
      } catch (err) {
        console.error('Error cargando recomendaciones:', err);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  // Solo recargamos cuando cambia el monto faltante (cambio de carrito)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [falta]);

  if (falta <= 0 || (!loading && productos.length === 0)) return null;

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
      }}>
        <GiftOutlined style={{ color: '#f33763', fontSize: '18px' }} />
        <Text strong style={{ fontSize: '14px' }}>
          Agrega uno de estos para conseguir{' '}
          <Text strong style={{ color: '#f33763' }}>envío gratis</Text>
        </Text>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="small" />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {productos.map(producto => (
            <Card
              key={producto.id}
              hoverable
              onClick={() => setSelectedProduct(producto)}
              bodyStyle={{ padding: '10px' }}
              style={{
                flex: '1 1 calc(33% - 10px)',
                minWidth: '100px',
                maxWidth: '160px',
                borderRadius: '10px',
                border: '1px solid #f0d0d8',
                cursor: 'pointer',
              }}
            >
              <img
                src={producto.img || (producto.imagenes && producto.imagenes[0])}
                alt={producto.nombre}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  display: 'block',
                  marginBottom: '8px',
                }}
              />
              <Text
                style={{
                  fontSize: '12px',
                  lineHeight: '1.3',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {producto.nombre}
              </Text>
              <Text strong style={{ color: '#f33763', fontSize: '13px' }}>
                {formatearPrecio(producto._precioFinal)}
              </Text>
            </Card>
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductModal
          visible={!!selectedProduct}
          producto={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default RecomendacionesEnvioGratis;
