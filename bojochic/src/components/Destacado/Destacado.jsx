import { Button, Card, Row, Col, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import arosImg from '../../assets/categorias/aros.webp';
import chokersImg from '../../assets/categorias/chokers.webp';
import panuelosImg from '../../assets/categorias/panuelos.png';
import pulserasImg from '../../assets/categorias/pulseras.webp';
import collaresImg from '../../assets/categorias/collares.webp';
import liquidacionImg from '../../assets/categorias/liquidacion.webp';

const { Title } = Typography;

const Destacado = () => {
  const navigate = useNavigate();

  const productos = [
    {
      id: 1,
      title: 'Pulsera tipo pandora',
      price: '$4.990',
      image: arosImg,
      path: '/producto/pulsera-pandora',
      popular: true,
    },
    {
      id: 2,
      title: 'Pulsera tejida 3',
      price: '$9.990',
      image: chokersImg,
      path: '/producto/pulsera-tejida',
    },
    {
      id: 3,
      title: 'Set de pulseras rock',
      price: '$6.990',
      image: panuelosImg,
      path: '/producto/set-pulseras-rock',
    },
    {
      id: 4,
      title: 'Pulsera vueltas',
      price: '$5.990',
      image: pulserasImg,
      path: '/producto/pulsera-vueltas',
    },
    {
      id: 5,
      title: 'Pulsera esclava bojo',
      price: '$5.990',
      image: collaresImg,
      path: '/producto/pulsera-esclava',
    },
    {
      id: 6,
      title: 'Pulsera hebilla bojo',
      price: '$5.990',
      image: liquidacionImg,
      path: '/producto/pulsera-hebilla',
    },
    {
      id: 7,
      title: 'Pulsera hippie chic',
      price: '$5.990',
      image: liquidacionImg,
      path: '/producto/pulsera-hippie',
    },
    {
      id: 8,
      title: 'Pulsera boho colgantes',
      price: '$5.990',
      image: liquidacionImg,
      path: '/producto/pulsera-boho',
      popular: true,
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
        Productos Destacados
      </Title>

      <Row gutter={[24, 24]}>
        {productos.map((producto) => (
          <Col xs={24} sm={12} md={8} lg={6} key={producto.id}>
            <Card
              hoverable
              style={{
                border: 'none',
                borderRadius: '0',
                overflow: 'hidden',
                position: 'relative',
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
                    src={producto.image}
                    alt={producto.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {producto.popular && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: '#DE0797',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      POPULAR
                    </div>
                  )}
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
                  {producto.title}
                </Title>

                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#DE0797',
                    marginBottom: '16px',
                  }}
                >
                  {producto.price}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Destacado;
