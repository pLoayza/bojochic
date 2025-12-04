// src/components/Productos/ProductosPorCategoria.jsx
import { Row, Col, Typography, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import ProductCard from '../../pages/Productos/ProductCard';

const { Title } = Typography;

const ProductosPorCategoria = ({ categoria, productos }) => {
  const tituloCategoria = categoria
    ? categoria.charAt(0).toUpperCase() + categoria.slice(1)
    : '';

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
        <Title
          level={1}
          style={{
            textAlign: 'center',
            marginBottom: '50px',
            color: '#DE0797',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          {tituloCategoria}
        </Title>

        {productos && productos.length > 0 ? (
          <Row gutter={[24, 24]}>
            {productos.map((producto) => (
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