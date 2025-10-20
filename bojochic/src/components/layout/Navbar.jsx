import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';

const { Header } = Layout;

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    {
      key: '/',
      label: <Link to="/">Inicio</Link>,
    },
    
  ];

  const rightItems = [
    {
      key: 'user',
      icon: <UserOutlined />,
      label: <Link to="/registro">Mi Cuenta</Link>,
    },
    {
      key: 'cart',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/carrito">Carrito</Link>,
    },
  ];

  return (
    <Header style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '0 50px',
      background: '#DE0797',
    }}>
      
      {/* Menú izquierdo */}
      <div style={{ flex: 1 }}>
        <Menu
          mode="horizontal"
          selectedKeys={[currentPath]}
          items={menuItems}
          style={{ 
            background: '#DE0797',
          }}
          theme="dark"
        />
      </div>

      {/* Texto central */}
      <div style={{
        color: 'white',
        fontSize: '14px',
        fontWeight: '500',
        textAlign: 'center',
        flex: 1,
        padding: '0 20px',
        whiteSpace: 'nowrap'
      }}>
        Envíos gratis por compras sobre $20.000
      </div>

      {/* Menú derecho */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <Menu
          mode="horizontal"
          items={rightItems}
          style={{ 
            background: '#DE0797',
          }}
          theme="dark"
        />
      </div>
    </Header>
  );
};

export default Navbar;