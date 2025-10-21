import { Card, Row, Col, Typography, Button, Breadcrumb } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ProductosPorCategoria = ({ categoria, productos }) => {
  const navigate = useNavigate();

  const tituloCategoria = categoria
    ? categoria.charAt(0).toUpperCase() + categoria.slice(1)
    : '';

  // Formatear precio si viene como número desde Firebase
  const formatearPrecio = (precio) => {
    if (typeof precio === 'number') {
      return `$${precio.toLocaleString('es-CL')}`;
    }
    return precio;
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

                    <Button
                      type="primary"
                      block
                      style={{
                        background: 'linear-gradient(45deg, #DE0797, #FF6B9D)',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        height: '40px',
                      }}
                    >
                      Ver producto
                    </Button>
                  </div>
                </Card>
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
