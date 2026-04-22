// src/components/Banner/Banner.jsx
import { Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, UserOutlined, LogoutOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ShoppingCart from '../Carrito/shoppingcart';
import SearchModal from '../search/SearchModal';
import { useResponsive } from '../../hooks/useResponsive';
import banner1 from '../../assets/Categorias/bojo1.png';
import banner2 from '../../assets/Categorias/bojo2.png';
import banner3 from '../../assets/Categorias/bojo3.png';
import bojoLogo from '../../assets/Categorias/logo-bojo.png';

const banners = [banner1, banner2, banner3];

const C = {
  bg:    '#f7d5d7',
  hot:   '#f33763',
  white: '#ffffff',
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap');

  @keyframes tickerMove {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .bojo-ticker-inner {
    display: inline-block;
    white-space: nowrap;
    animation: tickerMove 24s linear infinite;
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
    color: #f33763 !important;
    border-bottom-color: #f33763;
  }
  .bojo-nav-sep {
    color: rgba(243,55,99,0.4);
    font-size: 10px;
    user-select: none;
  }

  .bojo-carousel-slide {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center bottom;
    transition: opacity 0.9s ease-in-out;
  }

  .bojo-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255,255,255,0.5);
    border: none;
    cursor: pointer;
    transition: all 0.3s;
    padding: 0;
  }
  .bojo-dot.active {
    background: #ffffff;
    width: 24px;
    border-radius: 4px;
  }
`;

const Banner = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isMobile } = useResponsive();

  // Avanza automáticamente cada 4 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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

  const iconStyle = {
    fontSize: '20px',
    color: C.hot,
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
          background: C.hot,
          color: C.white,
          fontSize: '11px',
          letterSpacing: '0.12em',
          fontWeight: 500,
          fontFamily: "'Jost', sans-serif",
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          padding: '7px 0',
        }}
      >
        <div className="bojo-ticker-inner">
          {[
            '✦ Envío gratis por compras sobre $29.990 *',
            '✦ Pago seguro con Webpay Plus',
            '✦ Envío gratis por compras sobre $29.990 *',
            '✦ Envío express RM',
          ].map((msg, i) => (
            <span key={i} style={{ margin: '0 240px' }}>{msg}</span>
          ))}
        </div>
      </div>

      {/* ── NAVBAR ── */}
      <nav
        style={{
          background: C.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: isMobile ? '10px 20px' : '0 60px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          borderBottom: `1px solid ${C.bg}`,
          height: isMobile ? '60px' : '70px',
        }}
      >
        {/* Logo */}
        <img
          src={bojoLogo}
          alt="Bojo"
          style={{ height: isMobile ? '36px' : '44px', cursor: 'pointer', objectFit: 'contain' }}
          onClick={() => navigate('/home')}
        />

        {/* Links centro */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <a className="bojo-nav-link" onClick={() => navigate('/home')}>Inicio</a>
            <span className="bojo-nav-sep">|</span>
            <Dropdown menu={{ items: catalogoMenuItems }} placement="bottom" trigger={['hover']}>
              <a className="bojo-nav-link">
                Catálogo <span style={{ fontSize: '9px' }}>▾</span>
              </a>
            </Dropdown>
            <span className="bojo-nav-sep">|</span>
            <a className="bojo-nav-link" onClick={() => navigate('/#')}>Novedades</a>
            <span className="bojo-nav-sep">|</span>
            <a className="bojo-nav-link" onClick={() => navigate('/#')}>Promociones</a>
          </div>
        )}

        {/* Iconos derecha */}
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
          <SearchOutlined style={iconStyle} onClick={() => setSearchModalVisible(true)} {...hoverScale} />
          {currentUser ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <UserOutlined style={iconStyle} {...hoverScale} />
            </Dropdown>
          ) : (
            <UserOutlined style={iconStyle} onClick={() => navigate('/login')} {...hoverScale} />
          )}
          <div style={{ color: C.hot, fontSize: '20px', display: 'flex', alignItems: 'center' }}>
            <ShoppingCart color={C.hot} iconColor={C.hot} style={{ color: C.hot }} />
          </div>
        </div>
      </nav>

      {/* ── CAROUSEL ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: isMobile ? '260px' : '85vh',
          overflow: 'hidden',
        }}
      >
        {/* Slides */}
        {banners.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Banner ${i + 1}`}
            className="bojo-carousel-slide"
            style={{ opacity: i === currentSlide ? 1 : 0 }}
          />
        ))}

        {/* Flecha izquierda */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.25)',
            border: 'none',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            fontSize: '18px',
            color: C.white,
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.45)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
        >
          ‹
        </button>

        {/* Flecha derecha */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.25)',
            border: 'none',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            fontSize: '18px',
            color: C.white,
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.45)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
        >
          ›
        </button>

        {/* Dots indicadores */}
        <div
          style={{
            position: 'absolute',
            bottom: '18px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 10,
          }}
        >
          {banners.map((_, i) => (
            <button
              key={i}
              className={`bojo-dot ${i === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(i)}
            />
          ))}
        </div>
      </div>

      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
      />
    </>
  );
};

export default Banner;