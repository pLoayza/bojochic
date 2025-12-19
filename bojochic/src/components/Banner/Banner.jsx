// src/components/Banner/Banner.jsx
import { Space, Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, UserOutlined, LogoutOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ShoppingCart from '../Carrito/shoppingcart';
import SearchModal from '../search/SearchModal';
import { useResponsive } from '../../hooks/useResponsive'; // ← 1. IMPORTAR
import bojoLogo from '../../assets/bojo-logo_360x.png';

const Banner = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const { isMobile, isSmallMobile, padding } = useResponsive(); // ← 2. LLAMAR

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Menú desplegable del usuario
  const userMenuItems = [
    {
      key: 'perfil',
      icon: <UserOutlined />,
      label: 'Mi Perfil',
      onClick: () => navigate('/perfil'),
    },
    {
      key: 'mis-pedidos',
      icon: <ShoppingOutlined />,
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
      danger: true,
    },
  ];

  // Menú desplegable del catálogo
  const catalogoMenuItems = [
    {
      key: 'aros',
      label: 'Aros',
      onClick: () => navigate('/aros'),
    },
    {
      key: 'collares',
      label: 'Collares',
      onClick: () => navigate('/collares'),
    },
    {
      key: 'pulseras',
      label: 'Pulseras',
      onClick: () => navigate('/pulseras'),
    },
    {
      key: 'panuelos',
      label: 'Pañuelos',
      onClick: () => navigate('/panuelos'),
    },
    {
      key: 'chokers',
      label: 'Chokers',
      onClick: () => navigate('/chokers'),
    },
    {
      key: 'liquidacion',
      label: 'Liquidación',
      onClick: () => navigate('/liquidacion'),
    },
  ];

  const iconStyle = {
    fontSize: isMobile ? '20px' : '22px', // ← 3. Iconos más pequeños en móvil
    color: '#DE0797',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  return (
    <div>
      {/* Banner principal */}
      <div
        style={{
          background: 'white',
          padding: isMobile ? '20px 15px 20px 15px' : '40px 50px 30px 50px', // ← 3. Menos padding en móvil
          position: 'relative',
        }}
      >
        {/* Contenedor para logo e iconos */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          flexDirection: isMobile ? 'column' : 'row', // ← 3. Layout vertical en móvil
        }}>
          {/* Logo centrado */}
          <img
            src={bojoLogo}
            alt="Bojo Chic Logo"
            style={{
              maxWidth: isMobile ? '200px' : '280px', // ← 3. Logo más pequeño en móvil
              width: '100%',
              display: 'block',
              marginBottom: isMobile ? '20px' : '0', // ← 3. Espacio debajo en móvil
            }}
          />

          {/* Iconos a la derecha */}
          <div style={{
            position: isMobile ? 'relative' : 'absolute', // ← 3. Relativo en móvil (no absoluto)
            right: isMobile ? 'auto' : 0,
            display: 'flex',
            gap: isMobile ? '15px' : '20px', // ← 3. Menos espacio en móvil
            alignItems: 'center',
          }}>
            {/* Icono de búsqueda */}
            <SearchOutlined 
              style={iconStyle}
              onClick={() => setSearchModalVisible(true)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />

            {/* Icono de usuario */}
            {currentUser ? (
              <Dropdown 
                menu={{ items: userMenuItems }} 
                placement="bottomRight"
                trigger={['click']}
              >
                <UserOutlined 
                  style={iconStyle}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              </Dropdown>
            ) : (
              <UserOutlined 
                style={iconStyle}
                onClick={() => navigate('/login')}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            )}

            {/* Carrito de compras con notificaciones */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: '#DE0797',
              fontSize: isMobile ? '20px' : '22px', // ← 3. Más pequeño en móvil
            }}>
              <ShoppingCart />
            </div>
          </div>
        </div>

        {/* Menú de navegación centrado debajo del logo */}
        <div style={{ 
          textAlign: 'center',
          marginTop: isMobile ? '20px' : '30px' // ← 3. Menos margen en móvil
        }}>
          <Space size={isMobile ? 'middle' : 'large'}> {/* ← 3. Menos espacio en móvil */}
            <a
              onClick={() => navigate('/')}
              style={{
                color: '#DE0797',
                fontSize: isMobile ? '14px' : '16px', // ← 3. Texto más pequeño en móvil
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: '500',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Inicio
            </a>
            
            <Dropdown 
              menu={{ items: catalogoMenuItems }} 
              placement="bottom"
              trigger={isMobile ? ['click'] : ['hover']} // ← 3. Click en móvil, hover en desktop
            >
              <a
                style={{
                  color: '#DE0797',
                  fontSize: isMobile ? '14px' : '16px', // ← 3. Texto más pequeño en móvil
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                Catálogo ▾
              </a>
            </Dropdown>
          </Space>
        </div>
      </div>

      {/* Línea separadora */}
      <div
        style={{
          borderBottom: '1px solid #e0e0e0',
          width: '100%',
        }}
      />

      {/* Modal de búsqueda */}
      <SearchModal 
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
      />
    </div>
  );
};

export default Banner;