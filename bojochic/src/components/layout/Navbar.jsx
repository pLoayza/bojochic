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
    {
      key: '/hombre',
      label: <Link to="/hombre">Hombre</Link>,
    },
    {
      key: '/mujer',
      label: <Link to="/mujer">Mujer</Link>,
    },
    {
      key: '/ninos',
      label: <Link to="/ninos">Niños</Link>,
    },
    {
      key: '/ofertas',
      label: <Link to="/ofertas">Ofertas</Link>,
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
      background: '#000',
    }}>
      <Link to="/" style={{ 
        color: '#52c41a', 
        fontSize: '24px', 
        fontWeight: 'bold',
        marginRight: '50px'
      }}>
        Bojo
      </Link>
      
      <Menu
        mode="horizontal"
        selectedKeys={[currentPath]}
        items={menuItems}
        style={{ 
          flex: 1, 
          minWidth: 0,
          background: '#000',
        }}
        theme="dark"
      />

      <Menu
        mode="horizontal"
        items={rightItems}
        style={{ 
          background: '#000',
          marginLeft: '20px'
        }}
        theme="dark"
      />
    </Header>
  );
};

export default Navbar;


