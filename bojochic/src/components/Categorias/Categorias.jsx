import { Card, Row, Col, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import arosImg from '../../assets/categorias/aros.webp';
import chokersImg from '../../assets/categorias/chokers.webp';
import panuelosImg from '../../assets/categorias/panuelos.png';
import pulserasImg from '../../assets/categorias/pulseras.webp';
import collaresImg from '../../assets/categorias/collares.webp';
import liquidacionImg from '../../assets/categorias/liquidacion.webp';

const { Title } = Typography;

const Categorias = () => {
  const navigate = useNavigate();

  const categories = [
    {
      title: 'Aros',
      path: '/aros',
      image: arosImg,
    },
    {
      title: 'Chokers',
      path: '/chokers',
      image: chokersImg,
    },
    {
      title: 'Pañuelos',
      path: '/panuelos',
      image: panuelosImg,
    },
    {
      title: 'Pulseras',
      path: '/pulseras',
      image: pulserasImg,
    },
    {
      title: 'Collares',
      path: '/collares',
      image: collaresImg,
    },
    {
      title: 'Liquidación',
      path: '/liquidacion',
      image: liquidacionImg,
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
      <Title
        level={2}
        style={{
          textAlign: 'center',
          marginBottom: '40px',
          color: '#DE0797',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}
      >
        Colección Verano 2025
      </Title>
      <Row gutter={[24, 24]}>
        {categories.map((cat) => (
          <Col xs={24} sm={12} md={8} key={cat.title}>
            <Card
              hoverable
              onClick={() => navigate(cat.path)}
              style={{
                border: 'none',
                borderRadius: '0',
                overflow: 'hidden',
              }}
              bodyStyle={{
                padding: 0,
              }}
              cover={
                <div
                  style={{
                    width: '100%',
                    paddingBottom: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={cat.image}
                    alt={cat.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      width: '100%',
                    }}
                  >
                    <Title
                      level={2}
                      style={{
                        color: '#fff',
                        margin: 0,
                        fontSize: '28px',
                        fontWeight: 'bold',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                      }}
                    >
                      {cat.title}
                    </Title>
                  </div>
                </div>
              }
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Categorias;
