import { Layout, Menu, Dropdown } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import ShoppingCart from '../Carrito/ShoppingCart'

const { Header } = Layout;

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuItems = [
    {
      key: '/',
      label: <Link to="/">Inicio</Link>,
    },
    {
      key: '/Estadisticas',
      label: <Link to="/Estadisticas">Estadisticas</Link>,
    },
  ];

  // Menú desplegable cuando el usuario está logueado
  const userMenuItems = [
    {
      key: 'perfil',
      icon: <UserOutlined />,
      label: 'Mi Perfil',
      onClick: () => navigate('/perfil'),
    },
    {
      key: 'mis-pedidos',
      label: 'Mis Pedidos',
      onClick: () => navigate('/mis-pedidos'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: handleLogout,
    },
  ];

  const rightItems = currentUser
    ? [
        // Usuario logueado
        {
          key: 'user',
          icon: <UserOutlined />,
          label: (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <span style={{ cursor: 'pointer' }}>
                {currentUser.email}
              </span>
            </Dropdown>
          ),
        },
      ]
    : [
        // Usuario NO logueado
        {
          key: 'login',
          icon: <LoginOutlined />,
          label: <Link to="/login">Iniciar Sesión</Link>,
        },
        {
          key: 'registro',
          icon: <UserOutlined />,
          label: <Link to="/registro">Registrarse</Link>,
        },
      ];

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 50px',
        background: '#DE0797',
      }}
    >
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

      {/* Texto central - Saludo dinámico */}
      <div
        style={{
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
          textAlign: 'center',
          flex: 1,
          padding: '0 20px',
          whiteSpace: 'nowrap',
        }}
      >
        {currentUser ? (
          <span>
            ¡Hola, {currentUser.email.split('@')[0]}! 👋{' '}
            <span style={{ opacity: 0.9 }}>
              | Envíos gratis por compras sobre $20.000
            </span>
          </span>
        ) : (
          'Envíos gratis por compras sobre $20.000'
        )}
      </div>

      {/* Menú derecho + Carrito */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px' }}>
        <Menu
          mode="horizontal"
          items={rightItems}
          style={{
            background: '#DE0797',
          }}
          theme="dark"
        />
        
        {/* Componente del carrito con Drawer */}
        <ShoppingCart />
      </div>
    </Header>
  );
};

export default Navbar;