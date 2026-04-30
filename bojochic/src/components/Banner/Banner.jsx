// src/components/Banner/Banner.jsx
import { Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { SearchOutlined, UserOutlined, LogoutOutlined, ShoppingOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ShoppingCart from '../Carrito/shoppingcart';
import SearchModal from '../search/SearchModal';
import { useResponsive } from '../../hooks/useResponsive';
import banner1 from '../../assets/Categorias/bojo1.png';
import banner2 from '../../assets/Categorias/bojo2.png';
import banner3 from '../../assets/Categorias/bojo3.png';
import banner4 from '../../assets/Categorias/bojo4.png';
import banner5 from '../../assets/Categorias/bojo5.png';
import bojoLogo from '../../assets/Categorias/logo-bojo.png';

const banners = [banner1, banner3, banner5, banner4];

const C = {
  bg:    '#f7d5d7',
  hot:   '#f33763',
  white: '#ffffff',
};

const RUTAS_CON_PRODUCTOS = [
  '/aros', '/collares', '/pulseras', '/panuelos',
  '/anillos', '/conjuntos', '/otros', '/mama',
  '/novedades', '/promociones',
];

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap');

  @keyframes tickerMove {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to   { transform: translateX(0); }
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
    padding: 10px 26px;
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
    object-position: center 55%;
    transition: opacity 0.9s ease-in-out;
    cursor: pointer;
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

  .bojo-mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 300;
  }
  .bojo-mobile-drawer {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 78%;
    max-width: 300px;
    background: #fff;
    z-index: 301;
    display: flex;
    flex-direction: column;
    animation: slideIn 0.28s ease;
    overflow-y: auto;
  }
  .bojo-mobile-link {
    color: #f33763 !important;
    font-family: 'Jost', sans-serif;
    font-size: 14px;
    letter-spacing: 0.14em;
    font-weight: 500;
    text-transform: uppercase;
    padding: 15px 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #fce4ec;
    cursor: pointer;
    text-decoration: none !important;
    transition: background 0.2s;
  }
  .bojo-mobile-link:hover {
    background: #fef0f2;
  }
  .bojo-mobile-sublink {
    color: #f33763 !important;
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    letter-spacing: 0.1em;
    padding: 12px 28px 12px 44px;
    display: block;
    border-bottom: 1px solid #fce4ec;
    cursor: pointer;
    text-decoration: none !important;
    transition: background 0.2s;
    opacity: 0.75;
  }
  .bojo-mobile-sublink:hover {
    background: #fef0f2;
    opacity: 1;
  }
`;

const Banner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [catalogoOpen, setCatalogoOpen] = useState(false);
  const { isMobile } = useResponsive();

  // ── Scroll suave a la sección de productos ────────────────────────────────
  const scrollToProductos = () => {
    setTimeout(() => {
      const el = document.getElementById('productos-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Se dispara cuando la ruta cambia (links de Novedades, Promociones, etc.)
  useEffect(() => {
    if (RUTAS_CON_PRODUCTOS.includes(location.pathname)) {
      scrollToProductos();
    }
  }, [location.pathname]);
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const goTo = (path) => {
    setDrawerOpen(false);
    navigate(path);
  };

  const userMenuItems = [
    { key: 'perfil',      icon: <UserOutlined />,    label: 'Mi Perfil',     onClick: () => navigate('/perfil') },
    { key: 'mis-pedidos', icon: <ShoppingOutlined />, label: 'Mis Pedidos',   onClick: () => navigate('/orders') },
    { type: 'divider' },
    { key: 'logout',      icon: <LogoutOutlined />,   label: 'Cerrar Sesión', onClick: handleLogout, danger: true },
  ];

  const catalogoItems = [
    { key: 'aros',      label: 'Aros' },
    { key: 'collares',  label: 'Collares' },
    { key: 'pulseras',  label: 'Pulseras' },
    { key: 'panuelos',  label: 'Pañuelos' },
    { key: 'anillos',   label: 'Anillos' },
    { key: 'conjuntos', label: 'Conjuntos' },
    { key: 'otros',     label: 'Otros' },
    { key: 'mama',      label: 'Mamá' },
  ];

  // ── Al clickear en catálogo: navega Y hace scroll (cubre caso misma ruta) ──
  const catalogoMenuItems = catalogoItems.map((item) => ({
    key: item.key,
    label: item.label,
    onClick: () => {
      goTo(`/${item.key}`);
      scrollToProductos();
    },
  }));

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
          zIndex: 200,
          padding: isMobile ? '0 16px' : '0 60px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          borderBottom: `1px solid ${C.bg}`,
          height: isMobile ? '56px' : '58px',
        }}
      >
        {/* Izquierda */}
        {isMobile ? (
          <MenuOutlined
            style={{ fontSize: '20px', color: C.hot, cursor: 'pointer' }}
            onClick={() => setDrawerOpen(true)}
          />
        ) : (
          <img
            src={bojoLogo}
            alt="Bojo"
            style={{ height: '36px', cursor: 'pointer', objectFit: 'contain' }}
            onClick={() => navigate('/home')}
          />
        )}

        {/* Centro */}
        {isMobile ? (
          <img
            src={bojoLogo}
            alt="Bojo"
            style={{
              height: '32px',
              cursor: 'pointer',
              objectFit: 'contain',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
            onClick={() => navigate('/home')}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <a className="bojo-nav-link" onClick={() => goTo('/home')}>Inicio</a>
            <span className="bojo-nav-sep">|</span>
            <Dropdown menu={{ items: catalogoMenuItems }} placement="bottom" trigger={['hover']}>
              <a className="bojo-nav-link">
                Catálogo <span style={{ fontSize: '9px' }}>▾</span>
              </a>
            </Dropdown>
            <span className="bojo-nav-sep">|</span>
            <a className="bojo-nav-link" onClick={() => { goTo('/novedades'); scrollToProductos(); }}>Novedades</a>
            <span className="bojo-nav-sep">|</span>
            <a className="bojo-nav-link" onClick={() => { goTo('/promociones'); scrollToProductos(); }}>Promociones</a>
          </div>
        )}

        {/* Derecha: iconos */}
        <div style={{ display: 'flex', gap: isMobile ? '12px' : '18px', alignItems: 'center' }}>
          <SearchOutlined style={iconStyle} onClick={() => setSearchModalVisible(true)} {...hoverScale} />
          {currentUser ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <UserOutlined style={iconStyle} {...hoverScale} />
            </Dropdown>
          ) : (
            <UserOutlined style={iconStyle} onClick={() => navigate('/login')} {...hoverScale} />
          )}
          <ShoppingCart color={C.hot} iconColor={C.hot} style={{ color: C.hot }} />
        </div>
      </nav>

      {/* ── DRAWER MÓVIL ── */}
      {drawerOpen && (
        <div className="bojo-mobile-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="bojo-mobile-drawer" onClick={(e) => e.stopPropagation()}>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: `2px solid ${C.bg}`,
            }}>
              <img src={bojoLogo} alt="Bojo" style={{ height: '30px', objectFit: 'contain' }} />
              <CloseOutlined
                style={{ fontSize: '18px', color: C.hot, cursor: 'pointer' }}
                onClick={() => setDrawerOpen(false)}
              />
            </div>

            <div className="bojo-mobile-link" onClick={() => goTo('/home')}>Inicio</div>

            <div className="bojo-mobile-link" onClick={() => setCatalogoOpen((v) => !v)}>
              <span>Catálogo</span>
              <span style={{ fontSize: '10px' }}>{catalogoOpen ? '▲' : '▾'}</span>
            </div>
            {catalogoOpen && catalogoItems.map((item) => (
              <div
                key={item.key}
                className="bojo-mobile-sublink"
                onClick={() => { goTo(`/${item.key}`); scrollToProductos(); }}
              >
                {item.label}
              </div>
            ))}

            <div className="bojo-mobile-link" onClick={() => { goTo('/novedades'); scrollToProductos(); }}>Novedades</div>
            <div className="bojo-mobile-link" onClick={() => { goTo('/promociones'); scrollToProductos(); }}>Promociones</div>

            <div style={{ marginTop: 'auto', padding: '20px' }}>
              {currentUser ? (
                <>
                  <div className="bojo-mobile-link" onClick={() => goTo('/perfil')}>Mi Perfil</div>
                  <div className="bojo-mobile-link" onClick={() => goTo('/orders')}>Mis Pedidos</div>
                  <div
                    className="bojo-mobile-link"
                    onClick={() => { handleLogout(); setDrawerOpen(false); }}
                    style={{ color: '#cc0000 !important' }}
                  >
                    Cerrar Sesión
                  </div>
                </>
              ) : (
                <button
                  onClick={() => goTo('/login')}
                  style={{
                    width: '100%',
                    background: C.hot,
                    color: C.white,
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '13px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CAROUSEL ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: isMobile ? '56vw' : '92vh',
          overflow: 'hidden',
          background: C.bg,
        }}
      >
        {banners.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Banner ${i + 1}`}
            className="bojo-carousel-slide"
            style={{ opacity: i === currentSlide ? 1 : 0 }}
            onClick={() => goTo('/mama')}
          />
        ))}

        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
          style={{
            position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%',
            width: isMobile ? '30px' : '42px', height: isMobile ? '30px' : '42px',
            fontSize: isMobile ? '16px' : '22px', color: C.white, cursor: 'pointer',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 10, transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.45)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
        >‹</button>

        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
          style={{
            position: 'absolute', right: '12px', top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%',
            width: isMobile ? '30px' : '42px', height: isMobile ? '30px' : '42px',
            fontSize: isMobile ? '16px' : '22px', color: C.white, cursor: 'pointer',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 10, transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.45)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
        >›</button>

        <div style={{
          position: 'absolute', bottom: '14px', left: '50%',
          transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10,
        }}>
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