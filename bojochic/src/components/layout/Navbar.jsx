// src/components/Layout/Navbar.jsx
import { Layout } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import ShoppingCart from '../Carrito/shoppingcart';
import { useResponsive } from '../../hooks/useResponsive'; // ← 1. IMPORTAR

const { Header } = Layout;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { isMobile, padding } = useResponsive(); // ← 2. LLAMAR EL HOOK

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `0 ${padding}`, // ← 3. USAR (20px móvil, 50px desktop)
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
            fontSize: isMobile ? '20px' : '24px', // ← Más pequeño en móvil
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
            fontSize: isMobile ? '11px' : '13px', // ← Más pequeño en móvil
            fontWeight: '400',
            textAlign: 'center',
            width: '100%',
            letterSpacing: '0.3px',
            padding: isMobile ? '0 60px' : '0', // ← Espacio para iconos en móvil
          }}
        >
          {/* Texto más corto en móvil para que quepa */}
          {isMobile ? 'Envíos gratis $20.000+' : 'Envíos gratis por compras sobre $20.000'}
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