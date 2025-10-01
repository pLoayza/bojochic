import { Button, Card, Row, Col, Typography, Space } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();

  const categories = [
    { title: 'Hombre', path: '/hombre', color: '#1890ff' },
    { title: 'Mujer', path: '/mujer', color: '#eb2f96' },
    { title: 'Niños', path: '/ninos', color: '#faad14' },
  ];

  return (
    <div>
      {/* Banner principal */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        color: '#fff'
      }}>
        <Title level={1} style={{ color: '#fff', fontSize: '48px', marginBottom: '20px' }}>
          Bojo Chic
        </Title>
        <Paragraph style={{ fontSize: '20px', color: '#fff', marginBottom: '30px' }}>
          Moda, joyas y lifestyle al mejor precio
        </Paragraph>
        <Space size="large">
          <Button 
            type="primary" 
            size="large" 
            icon={<ShoppingOutlined />}
            onClick={() => navigate('/catalogo')}
          >
            Ver Catálogo
          </Button>
          <Button 
            size="large" 
            ghost
            onClick={() => navigate('/registro')}
            style={{ color: '#fff', borderColor: '#fff' }}
          >
            Crear Cuenta
          </Button>
        </Space>
      </div>

      {/* Categorías */}
      <div style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
          Compra por Categoría
        </Title>
        <Row gutter={[24, 24]}>
          {categories.map((cat) => (
            <Col xs={24} sm={12} md={8} key={cat.title}>
              <Card
                hoverable
                onClick={() => navigate(cat.path)}
                style={{ 
                  height: '250px',
                  background: cat.color,
                  border: 'none',
                }}
                bodyStyle={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Title level={2} style={{ color: '#fff', margin: 0 }}>
                  {cat.title}
                </Title>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Productos destacados */}
      <div style={{ background: '#f5f5f5', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
            Productos Destacados
          </Title>
          <Row gutter={[24, 24]}>
            {[1, 2, 3, 4].map((item) => (
              <Col xs={24} sm={12} md={6} key={item}>
                <Card
                  hoverable
                  cover={
                    <div style={{ 
                      height: '300px', 
                      background: '#e8e8e8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px'
                    }}>
                      👕
                    </div>
                  }
                >
                  <Card.Meta
                    title={`Producto ${item}`}
                    description="Descripción breve del producto"
                  />
                  <div style={{ marginTop: '15px', fontSize: '20px', fontWeight: 'bold' }}>
                    $29.990
                  </div>
                  <Button 
                    type="primary" 
                    block 
                    style={{ marginTop: '10px' }}
                  >
                    Ver más
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Banner ofertas */}
      <div style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        padding: '60px 20px',
        textAlign: 'center',
        color: '#fff'
      }}>
        <Title level={2} style={{ color: '#fff' }}>
          ¡Ofertas de Temporada!
        </Title>
        <Paragraph style={{ fontSize: '18px', color: '#fff', marginBottom: '20px' }}>
          Hasta 50% de descuento en productos seleccionados
        </Paragraph>
        <Button 
          size="large" 
          style={{ background: '#fff', color: '#f5576c', borderColor: '#fff' }}
          onClick={() => navigate('/ofertas')}
        >
          Ver Ofertas
        </Button>
      </div>
    </div>
  );
};

export default Home;