// src/components/Productos/ProductosPorCategoria.jsx
import { useState, useEffect } from 'react';
import { Row, Col, Typography, Breadcrumb, Select, Space } from 'antd';
import { HomeOutlined, SortAscendingOutlined } from '@ant-design/icons';
import ProductCard from '../../pages/Productos/ProductCard';

const { Title } = Typography;
const { Option } = Select;

const ProductosPorCategoria = ({ categoria, productos }) => {
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [ordenamiento, setOrdenamiento] = useState('nombre-az');

  const tituloCategoria = categoria
    ? categoria.charAt(0).toUpperCase() + categoria.slice(1)
    : '';

  // Función para ordenar productos
  const ordenarProductos = (prods, tipo) => {
    const productosOrdenados = [...prods];

    switch (tipo) {
      case 'precio-menor':
        return productosOrdenados.sort((a, b) => 
          (a.precio || 0) - (b.precio || 0)
        );
      
      case 'precio-mayor':
        return productosOrdenados.sort((a, b) => 
          (b.precio || 0) - (a.precio || 0)
        );
      
      case 'nombre-az':
        return productosOrdenados.sort((a, b) => 
          (a.nombre || '').localeCompare(b.nombre || '')
        );
      
      default:
        return productosOrdenados;
    }
  };

  // Actualizar productos cuando cambie el ordenamiento o los productos originales
  useEffect(() => {
    const productosOrdenados = ordenarProductos(productos, ordenamiento);
    setProductosFiltrados(productosOrdenados);
  }, [productos, ordenamiento]);

  // Manejar cambio de ordenamiento
  const handleOrdenamiento = (value) => {
    setOrdenamiento(value);
  };

  return (
    <div style={{ minHeight: '70vh', backgroundColor: '#f8f9fa' }}>
      {/* Breadcrumb */}
      <div
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 20px 0' }}
      >
        <Breadcrumb
          items={[
            {
              href: '/',
              title: <HomeOutlined />,
            },
            {
              title: tituloCategoria,
            },
          ]}
        />
      </div>

      {/* Contenido principal */}
      <div
        style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}
      >
        {/* Header con título y filtro */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <Title
            level={1}
            style={{
              margin: 0,
              color: '#DE0797',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontSize: 'clamp(24px, 5vw, 36px)',
            }}
          >
            {tituloCategoria}
          </Title>

          {/* Filtro de ordenamiento */}
          {productos && productos.length > 0 && (
            <div style={{ minWidth: '280px' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ 
                  fontSize: '13px', 
                  color: '#888', 
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <SortAscendingOutlined style={{ fontSize: '16px' }} />
                  ORDENAR POR
                </div>
                <Select
                  value={ordenamiento}
                  onChange={handleOrdenamiento}
                  style={{ width: '100%' }}
                  size="large"
                  dropdownStyle={{
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  <Option value="nombre-az">
                    <Space>
                      <span style={{ fontSize: '16px' }}>🔤</span>
                      A - Z
                    </Space>
                  </Option>
                  <Option value="precio-mayor">
                    <Space>
                      <span style={{ fontSize: '16px' }}>$</span>
                      Precio: Mayor a Menor
                    </Space>
                  </Option>
                  <Option value="precio-menor">
                    <Space>
                      <span style={{ fontSize: '16px' }}>$</span>
                      Precio: Menor a Mayor
                    </Space>
                  </Option>
                </Select>
              </Space>
            </div>
          )}
        </div>

        {/* Contador de productos */}
        {productos && productos.length > 0 && (
          <div
            style={{
              marginBottom: '30px',
              color: '#666',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Mostrando {productosFiltrados.length} {productosFiltrados.length === 1 ? 'producto' : 'productos'}
          </div>
        )}

        {/* Grid de productos */}
        {productosFiltrados && productosFiltrados.length > 0 ? (
          <Row gutter={[24, 24]}>
            {productosFiltrados.map((producto) => (
              <Col xs={24} sm={12} md={8} lg={6} key={producto.id}>
                <ProductCard producto={producto} />
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Title level={3} style={{ color: '#666' }}>
              Próximamente productos en esta categoría
            </Title>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductosPorCategoria;