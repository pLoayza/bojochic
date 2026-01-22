import { Row, Col, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import arosImg from '../../assets/Categorias/aros.webp';
import pulserasImg from '../../assets/Categorias/pulseras.webp';
import collaresImg from '../../assets/Categorias/collares.webp';
import plateadosImg from '../../assets/Categorias/plateados.webp';
import doradosImg from '../../assets/Categorias/Dorados.jpg';

const { Title } = Typography;

const Destacado = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const colecciones = [
    {
      title: 'Plateados',
      path: '/productos/plateados',
      backgroundImage: plateadosImg,
      backgroundPosition: 'center 85%',
      productos: [
        { id: 1, nombre: 'Aros Plateados', imagen: arosImg, precio: '$15.990' },
        { id: 2, nombre: 'Pulsera Plata', imagen: pulserasImg, precio: '$12.990' },
        { id: 3, nombre: 'Collar Plateado', imagen: collaresImg, precio: '$18.990' },
        { id: 4, nombre: 'Anillo Plata', imagen: arosImg, precio: '$9.990' },
      ],
    },
    {
      title: 'Dorados',
      path: '/productos/dorados',
      backgroundImage: doradosImg,
      backgroundPosition: 'center',
      productos: [
        { id: 5, nombre: 'Aros Dorados', imagen: arosImg, precio: '$16.990' },
        { id: 6, nombre: 'Pulsera Oro', imagen: pulserasImg, precio: '$13.990' },
        { id: 7, nombre: 'Collar Dorado', imagen: collaresImg, precio: '$19.990' },
        { id: 8, nombre: 'Anillo Oro', imagen: arosImg, precio: '$10.990' },
      ],
    },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '60px auto', padding: '0 20px' }}>
      <Title
        level={2}
        style={{
          textAlign: 'center',
          marginBottom: '50px',
          color: '#DE0797',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          fontSize: '32px',
        }}
      >
        Colecciones Destacadas
      </Title>

      <Row gutter={[0, 30]}>
        {colecciones.map((coleccion, index) => (
          <Col xs={24} key={coleccion.title}>
            <div
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: 'relative',
                height: hoveredCard === index ? '550px' : '300px',
                borderRadius: '20px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: hoveredCard === index
                  ? '0 20px 60px rgba(0,0,0,0.3)'
                  : '0 10px 30px rgba(0,0,0,0.15)',
              }}
              onClick={() => navigate(coleccion.path)}
            >
              {/* Imagen de fondo como elemento <img> */}
              <img
                src={coleccion.backgroundImage}
                alt={coleccion.title}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: coleccion.backgroundPosition || 'center',
                  zIndex: 0,
                  transition: 'transform 0.5s ease',
                  transform: hoveredCard === index ? 'scale(1.05)' : 'scale(1)',
                }}
              />

              {/* Título principal */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) scale(${hoveredCard === index ? 0.8 : 1})`,
                  transition: 'all 0.5s ease',
                  zIndex: 2,
                  opacity: hoveredCard === index ? 0.3 : 1,
                  pointerEvents: 'none',
                }}
              >
                <Title
                  level={1}
                  style={{
                    color: '#fff',
                    margin: 0,
                    fontSize: hoveredCard === index ? '60px' : '80px',
                    fontWeight: 'bold',
                    textShadow: '4px 4px 15px rgba(0,0,0,0.9)',
                    letterSpacing: '5px',
                    transition: 'font-size 0.5s ease',
                  }}
                >
                  {coleccion.title}
                </Title>
              </div>

              {/* Overlay oscuro suave para legibilidad */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: hoveredCard === index
                    ? 'rgba(0, 0, 0, 0.7)'
                    : 'rgba(0, 0, 0, 0.25)',
                  transition: 'background 0.5s ease',
                  zIndex: 1,
                }}
              />

              {/* Grid de productos que aparece en hover */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '30px',
                  opacity: hoveredCard === index ? 1 : 0,
                  transform: `translateY(${hoveredCard === index ? 0 : '50px'})`,
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: 3,
                  pointerEvents: hoveredCard === index ? 'auto' : 'none',
                }}
              >
                <Row gutter={[20, 20]}>
                  {coleccion.productos.map((producto, prodIndex) => (
                    <Col xs={12} sm={6} key={producto.id}>
                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          transform: `translateY(${hoveredCard === index ? 0 : '20px'})`,
                          opacity: hoveredCard === index ? 1 : 0,
                          transition: `all 0.4s ease ${prodIndex * 0.1}s`,
                          boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/producto/${producto.id}`);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            paddingBottom: '100%',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
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
                        <div style={{ padding: '12px', textAlign: 'center' }}>
                          <div
                            style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#333',
                              marginBottom: '5px',
                            }}
                          >
                            {producto.nombre}
                          </div>
                          <div
                            style={{
                              fontSize: '16px',
                              fontWeight: 'bold',
                              color: '#DE0797',
                            }}
                          >
                            {producto.precio}
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>

                {/* Botón "Ver todos" */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(coleccion.path);
                    }}
                    style={{
                      background: '#DE0797',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 40px',
                      borderRadius: '25px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 5px 15px rgba(222, 7, 151, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 8px 20px rgba(222, 7, 151, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 5px 15px rgba(222, 7, 151, 0.3)';
                    }}
                  >
                    Ver todos los {coleccion.title}
                  </button>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Destacado;