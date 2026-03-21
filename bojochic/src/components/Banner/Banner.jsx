// src/components/Banner/Banner.jsx
import { Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, UserOutlined, LogoutOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ShoppingCart from '../Carrito/shoppingcart';
import SearchModal from '../search/SearchModal';
import { useResponsive } from '../../hooks/useResponsive';
import bojoLogo from '../../assets/Categorias/logo-bojo.png';

/* ─── Paleta ─────────────────────────────────────────── */
const C = {
  bg:     '#f7d5d7',  // rosa claro (color del logo)
  hot:    '#f33763',  // fondo header y ticker
  pink:   '#f690a8',  // acento corazones
  light:  '#fce4ec',  // texto nav (rosa muy claro)
  white:  '#ffffff',
};

/* ─── Estilos globales ─────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap');

  @keyframes tickerMove {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes floatHeart {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0.25; }
    50%       { transform: translateY(-5px) scale(1.15); opacity: 0.4; }
  }
  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .bojo-ticker-inner {
    display: inline-block;
    white-space: nowrap;
    animation: tickerMove 24s linear infinite;
  }

  .bojo-logo-wrap {
    animation: fadeDown 0.7s ease both;
  }

  .bojo-nav-link {
    color: #f33763 !important;
    text-decoration: none !important;
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    letter-spacing: 0.18em;
    font-weight: 500;
    text-transform: uppercase;
    padding: 15px 26px;
    display: inline-block;
    border-bottom: 2px solid transparent;
    transition: all 0.25s;
    cursor: pointer;
  }
  .bojo-nav-link:hover {
    color: #fff !important;
    background: rgba(255,255,255,0.12);
    border-bottom-color: #f33763;
  }
  .bojo-nav-sep {
    color: rgba(243,55,99,0.4);
    font-size: 10px;
    user-select: none;
  }
`;

/* ─── Corazón decorativo ─────────────────────────────── */
const Heart = ({ style }) => (
  <span
    style={{
      position: 'absolute',
      color: C.light,
      opacity: 0.25,
      animation: 'floatHeart 4s ease-in-out infinite',
      pointerEvents: 'none',
      ...style,
    }}
  >
    ♥
  </span>
);

/* ════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════ */
const Banner = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const { isMobile } = useResponsive();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const userMenuItems = [
    { key: 'perfil',      icon: <UserOutlined />,    label: 'Mi Perfil',     onClick: () => navigate('/perfil') },
    { key: 'mis-pedidos', icon: <ShoppingOutlined />, label: 'Mis Pedidos',   onClick: () => navigate('/orders') },
    { type: 'divider' },
    { key: 'logout',      icon: <LogoutOutlined />,   label: 'Cerrar Sesión', onClick: handleLogout, danger: true },
  ];

  const catalogoMenuItems = [
    { key: 'aros',      label: 'Aros',      onClick: () => navigate('/aros') },
    { key: 'collares',  label: 'Collares',  onClick: () => navigate('/collares') },
    { key: 'pulseras',  label: 'Pulseras',  onClick: () => navigate('/pulseras') },
    { key: 'panuelos',  label: 'Pañuelos',  onClick: () => navigate('/panuelos') },
    { key: 'anillos',   label: 'Anillos',   onClick: () => navigate('/anillos') },
    { key: 'conjuntos', label: 'Conjuntos', onClick: () => navigate('/conjuntos') },
  ];

  /* Iconos blancos sobre fondo hot */
  const iconStyle = {
    fontSize: isMobile ? '20px' : '22px',
    color: C.white,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  };
  const hoverScale = {
    onMouseEnter: (e) => (e.currentTarget.style.transform = 'scale(1.15)'),
    onMouseLeave: (e) => (e.currentTarget.style.transform = 'scale(1)'),
  };

  return (
    <>
      <style>{globalStyles}</style>

      {/* ── TICKER ── */}
      <div
        style={{
          background: '#f7d5d7',
          color: '#f33763',
          fontSize: '11px',
          letterSpacing: '0.12em',
          fontWeight: 500,
          fontFamily: "'Jost', sans-serif",
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          padding: '7px 0',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div className="bojo-ticker-inner">
          {[
            '✦ Descuento en envío por compras sobre $29.990',
            '✦ Pago seguro con Webpay Plus',
            '✦ Descuento en envío por compras sobre $29.990',
            '✦ Pago seguro con Webpay Plus',
          ].map((msg, i) => (
            <span key={i} style={{ margin: '0 240px' }}>{msg}</span>
          ))}
        </div>
      </div>

      {/* ── HEADER — altura fija para no empujar el contenido ── */}
      <div
        style={{
          background: C.hot,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: isMobile ? '120px' : '280px',  // ← más alto para el logo
          overflow: 'hidden',
          padding: `0 ${isMobile ? '20px' : '60px'}`,
        }}
      >
        {/* Corazones decorativos */}
        {!isMobile && (
          <>
            <Heart style={{ fontSize: '18px', top: '18px',   left: '60px',   animationDelay: '0s'   }} />
            <Heart style={{ fontSize: '11px', top: '46px',   left: '108px',  animationDelay: '1.5s' }} />
            <Heart style={{ fontSize: '13px', top: '16px',   right: '80px',  animationDelay: '0.8s' }} />
            <Heart style={{ fontSize: '20px', bottom: '16px',left: '180px',  animationDelay: '2.2s' }} />
            <Heart style={{ fontSize: '9px',  bottom: '20px',right: '200px', animationDelay: '1.1s' }} />
          </>
        )}

        {/* Logo — grande pero contenido en la altura fija */}
        <div className="bojo-logo-wrap" style={{ zIndex: 1, textAlign: 'center' }}>
          <img
            src={bojoLogo}
            alt="Bojo Logo"
            style={{
              width: isMobile ? '200px' : '540px',
              display: 'block',
              margin: '0 auto',
            }}
          />
        </div>

        {/* Iconos — blancos a la derecha */}
        <div
          style={{
            position: 'absolute',
            right: isMobile ? '20px' : '60px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            gap: isMobile ? '14px' : '20px',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          <SearchOutlined
            style={iconStyle}
            onClick={() => setSearchModalVisible(true)}
            {...hoverScale}
          />

          {currentUser ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <UserOutlined style={iconStyle} {...hoverScale} />
            </Dropdown>
          ) : (
            <UserOutlined
              style={iconStyle}
              onClick={() => navigate('/login')}
              {...hoverScale}
            />
          )}

          <div style={{ color: C.white, fontSize: isMobile ? '20px' : '22px', display: 'flex', alignItems: 'center' }}>
            <ShoppingCart />
          </div>
        </div>
      </div>

      {/* ── NAVBAR ── */}
      <nav
        style={{
          background: '#f7d5d7',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 3px 16px rgba(246,144,168,0.4)',
          borderTop: '1px solid rgba(255,255,255,0.15)',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}
      >
        <a className="bojo-nav-link" onClick={() => navigate('/home')}>Inicio</a>
        <span className="bojo-nav-sep">|</span>

        <Dropdown
          menu={{ items: catalogoMenuItems }}
          placement="bottom"
          trigger={isMobile ? ['click'] : ['hover']}
        >
          <a className="bojo-nav-link">
            Catálogo <span style={{ fontSize: '9px' }}>▾</span>
          </a>
        </Dropdown>

        <span className="bojo-nav-sep">|</span>
        <a className="bojo-nav-link" onClick={() => navigate('/novedades')}>Novedades</a>
        <span className="bojo-nav-sep">|</span>
        <a className="bojo-nav-link" onClick={() => navigate('/promociones')}>Promociones</a>
      </nav>

      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
      />
    </>
  );
};

export default Banner;