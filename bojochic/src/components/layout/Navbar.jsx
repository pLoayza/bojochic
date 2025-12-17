// src/components/Layout/Navbar.jsx
import { Layout } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import ShoppingCart from '../Carrito/shoppingcart';

const { Header } = Layout;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 50px',
        background: '#DE0797',
        height: '50px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div style={{
        maxWidth: '1400px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
      }}>
        {/* Icono de Home a la izquierda */}
        <div
          onClick={() => navigate('/')}
          style={{
            fontSize: '24px',
            color: 'white',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            position: 'absolute',
            left: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <HomeOutlined />
        </div>

        {/* Texto promocional centrado */}
        <div
          style={{
            color: 'white',
            fontSize: '13px',
            fontWeight: '400',
            textAlign: 'center',
            width: '100%',
            letterSpacing: '0.3px',
          }}
        >
          Envíos gratis por compras sobre $20.000
        </div>

        {/* Carrito a la derecha - SOLO si NO estamos en Home */}
        {!isHome && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ShoppingCart showInNavbar={true} />
          </div>
        )}
      </div>
    </Header>
  );
};

export default Navbar;