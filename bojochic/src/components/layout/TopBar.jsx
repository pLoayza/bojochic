// src/components/Layout/TopBar.jsx
import { Row, Col, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/bojo-logo_360x.png'; 

const TopBar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    {
      key: '/inicio',
      label: <Link to="/inicio">Inicio</Link>,
    },
    {
      key: '/catalogo',
      label: <Link to="/catalogo">Catálogo</Link>,
    },
  ];

  return (
    <div style={{
      borderBottom: '1px solid #f0f0f0',
      padding: '20px 50px',
      background: 'white'
    }}>
      <Row align="middle" justify="space-between">
        {/* Logo */}
        <Col>
          <Link to="/inicio">
            <img 
              src={logo} 
              alt="Bojo Chic Logo" 
              style={{ 
                height: '80px',
                cursor: 'pointer'
              }}
            />
          </Link>
        </Col>

        {/* Menú de navegación */}
        <Col>
          <Menu
            mode="horizontal"
            selectedKeys={[currentPath]}
            items={menuItems}
            style={{
              border: 'none',
              fontSize: '15px',
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default TopBar;