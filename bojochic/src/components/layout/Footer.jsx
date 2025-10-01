import { Layout, Row, Col, Space } from 'antd';
import { InstagramOutlined, FacebookOutlined, TwitterOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Footer: AntFooter } = Layout;

const Footer = () => {
  return (
    <AntFooter style={{ background: '#001529', color: '#fff', marginTop: '50px' }}>
      <Row gutter={[32, 32]} style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Col xs={24} sm={12} md={6}>
          <h3 style={{ color: '#52c41a' }}>Bojo Chic</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
            Moda, joyas y lifestyle al mejor precio
          </p>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <h4 style={{ color: '#fff' }}>Categorías</h4>
          <Space direction="vertical">
            <Link to="/hombre" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Hombre</Link>
            <Link to="/mujer" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Mujer</Link>
            <Link to="/ninos" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Niños</Link>
            <Link to="/ofertas" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Ofertas</Link>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <h4 style={{ color: '#fff' }}>Ayuda</h4>
          <Space direction="vertical">
            <a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Contacto</a>
            <a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Envíos</a>
            <a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Devoluciones</a>
            <a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>FAQ</a>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <h4 style={{ color: '#fff' }}>Síguenos</h4>
          <Space size="large">
            <InstagramOutlined style={{ fontSize: '24px', color: 'rgba(255, 255, 255, 0.65)' }} />
            <FacebookOutlined style={{ fontSize: '24px', color: 'rgba(255, 255, 255, 0.65)' }} />
            <TwitterOutlined style={{ fontSize: '24px', color: 'rgba(255, 255, 255, 0.65)' }} />
          </Space>
        </Col>
      </Row>
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: '40px', 
        paddingTop: '20px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'rgba(255, 255, 255, 0.65)'
      }}>
        © 2025 Bojo Chic. Todos los derechos reservados.
      </div>
    </AntFooter>
  );
};

export default Footer;