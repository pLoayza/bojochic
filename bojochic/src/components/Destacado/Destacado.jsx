import { Button, Card, Row, Col, Typography } from 'antd';

const { Title } = Typography;

const Destacado = () => {
  return (
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
                  <div
                    style={{
                      height: '300px',
                      background: '#e8e8e8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px',
                    }}
                  >
                    👕
                  </div>
                }
              >
                <Card.Meta
                  title={`Producto ${item}`}
                  description="Descripción breve del producto"
                />
                <div
                  style={{
                    marginTop: '15px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                  }}
                >
                  $29.990
                </div>
                <Button type="primary" block style={{ marginTop: '10px' }}>
                  Ver más
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Destacado;
