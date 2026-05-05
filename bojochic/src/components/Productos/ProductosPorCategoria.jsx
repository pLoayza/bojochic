// src/components/Productos/ProductosPorCategoria.jsx
import { useState, useEffect } from 'react';
import { Row, Col, Typography, Breadcrumb, Select, Space } from 'antd';
import { HomeOutlined, SortAscendingOutlined } from '@ant-design/icons';
import ProductCard from '../../pages/Productos/ProductCard';
import BundleCard from '../Productos/BundleCard';

const { Title } = Typography;
const { Option } = Select;

const ProductosPorCategoria = ({ categoria, productos, bundles = [], categoriaNombre }) => {
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [ordenamiento, setOrdenamiento] = useState('nombre-az');

  const tituloCategoria = categoriaNombre || (categoria
    ? categoria.charAt(0).toUpperCase() + categoria.slice(1)
    : '');

  const ordenarProductos = (prods, tipo) => {
    const productosOrdenados = [...prods];
    switch (tipo) {
      case 'precio-menor':
        return productosOrdenados.sort((a, b) => (a.precio || 0) - (b.precio || 0));
      case 'precio-mayor':
        return productosOrdenados.sort((a, b) => (b.precio || 0) - (a.precio || 0));
      case 'nombre-az':
        return productosOrdenados.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
      default:
        return productosOrdenados;
    }
  };

  useEffect(() => {
    setProductosFiltrados(ordenarProductos(productos, ordenamiento));
  }, [productos, ordenamiento]);

  const totalItems = productosFiltrados.length + bundles.length;

  return (
    <div id="productos-section" style={{ minHeight: '70vh', backgroundColor: '#f8f9fa' }}>

      {/* Breadcrumb */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 20px 0' }}>
        <Breadcrumb
          items={[
            { href: '/', title: <HomeOutlined /> },
            { title: tituloCategoria },
          ]}
        />
      </div>

      {/* Contenido principal */}
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>

        {/* Header con título y filtro */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          <Title level={1} style={{
            margin: 0,
            color: '#f33763',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: 'clamp(24px, 5vw, 36px)',
          }}>
            {tituloCategoria}
          </Title>

          {/* Filtro — se muestra si hay cualquier item */}
          {totalItems > 0 && (
            <div style={{ minWidth: '280px' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{
                  fontSize: '13px',
                  color: '#888',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <SortAscendingOutlined style={{ fontSize: '16px' }} />
                  ORDENAR POR
                </div>
                <Select
                  value={ordenamiento}
                  onChange={setOrdenamiento}
                  style={{ width: '100%' }}
                  size="large"
                  dropdownStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                >
                  <Option value="nombre-az">
                    <Space><span style={{ fontSize: '16px' }}>🔤</span>A - Z</Space>
                  </Option>
                  <Option value="precio-mayor">
                    <Space><span style={{ fontSize: '16px' }}>$</span>Precio: Mayor a Menor</Space>
                  </Option>
                  <Option value="precio-menor">
                    <Space><span style={{ fontSize: '16px' }}>$</span>Precio: Menor a Mayor</Space>
                  </Option>
                </Select>
              </Space>
            </div>
          )}
        </div>

        {/* Contador */}
        {totalItems > 0 && (
          <div style={{ marginBottom: '30px', color: '#666', fontSize: '14px', fontWeight: '500' }}>
            Mostrando {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            {bundles.length > 0 && (
              <span style={{ marginLeft: '8px', color: '#722ed1', fontWeight: 600 }}>
                · {bundles.length} {bundles.length === 1 ? 'bundle' : 'bundles'} incluidos
              </span>
            )}
          </div>
        )}

        {/* ── BUNDLES (solo aparecen en /promociones) ── */}
        {bundles.length > 0 && (
          <>
            <div style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#722ed1',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              🎁 Bundles especiales
            </div>
            <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
              {bundles.map((bundle) => (
                <Col xs={24} sm={12} md={8} lg={6} key={bundle.id}>
                  <BundleCard bundle={bundle} />
                </Col>
              ))}
            </Row>
          </>
        )}

        {/* ── PRODUCTOS ── */}
        {productosFiltrados.length > 0 ? (
          <>
            {/* Subtítulo "Productos en oferta" solo si también hay bundles */}
            {bundles.length > 0 && (
              <div style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#f33763',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                % Productos en oferta
              </div>
            )}
            <Row gutter={[24, 24]}>
              {productosFiltrados.map((producto) => (
                <Col xs={24} sm={12} md={8} lg={6} key={producto.id}>
                  <ProductCard producto={producto} />
                </Col>
              ))}
            </Row>
          </>
        ) : (
          /* Vacío solo si tampoco hay bundles */
          totalItems === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Title level={3} style={{ color: '#666' }}>
                Próximamente productos en esta categoría
              </Title>
            </div>
          )
        )}

      </div>
    </div>
  );
};

export default ProductosPorCategoria;