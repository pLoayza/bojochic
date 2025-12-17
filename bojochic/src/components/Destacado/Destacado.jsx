import { Card, Row, Col, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import arosImg from '../../assets/Categorias/aros.webp';
import chokersImg from '../../assets/Categorias/chokers.webp';
import panuelosImg from '../../assets/Categorias/panuelos.png';
import pulserasImg from '../../assets/Categorias/pulseras.webp';
import collaresImg from '../../assets/Categorias/collares.webp';
import liquidacionImg from '../../assets/Categorias/liquidacion.webp';

const { Title } = Typography;

const Colecciones = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const colecciones = [
    {
      title: 'Colección 1',
      path: '/coleccion1',
      image: arosImg,
    },
    {
      title: 'Colección 2',
      path: '/coleccion2',
      image: collaresImg,
    },
    {
      title: 'Colección 3',
      path: '/coleccion3',
      image: pulserasImg,
    },
    {
      title: 'Colección 4',
      path: '/coleccion4',
      image: panuelosImg,
    },
    {
      title: 'Colección 5',
      path: '/coleccion5',
      image: chokersImg,
    },
    {
      title: 'Colección 6',
      path: '/coleccion6',
      image: liquidacionImg,
    },
    {
      title: 'Colección 7',
      path: '/coleccion7',
      image: arosImg, // Reutilizando imágenes
    },
    {
      title: 'Colección 8',
      path: '/coleccion8',
      image: collaresImg, // Reutilizando imágenes
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
        Colecciones Destacadas
      </Title>
      <Row gutter={[24, 24]}>
        {colecciones.map((coleccion, index) => (
          <Col xs={24} sm={12} md={6} key={coleccion.title}>
            <Card
              onClick={() => navigate(coleccion.path)}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                border: 'none',
                borderRadius: '0',
                overflow: 'hidden',
                cursor: 'pointer',
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
                  {/* Imagen con efecto zoom */}
                  <img
                    src={coleccion.image}
                    alt={coleccion.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                      transform: hoveredCard === index ? 'scale(1.1)' : 'scale(1)',
                    }}
                  />
                  
                  {/* Overlay oscuro que se aclara en hover */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: hoveredCard === index 
                        ? 'rgba(0, 0, 0, 0.1)' 
                        : 'rgba(0, 0, 0, 0.25)',
                      transition: 'background 0.3s ease',
                    }}
                  />
                  
                  {/* Título */}
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
                      level={3}
                      style={{
                        color: '#fff',
                        margin: 0,
                        fontSize: '22px',
                        fontWeight: 'bold',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                        transition: 'transform 0.3s ease',
                        transform: hoveredCard === index ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {coleccion.title}
                    </Title>
                  </div>

                  {/* Borde rosa que aparece en hover */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      border: hoveredCard === index ? '4px solid #DE0797' : '4px solid transparent',
                      transition: 'border 0.3s ease',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              }
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Colecciones;