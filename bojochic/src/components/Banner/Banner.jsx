import { Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import bojoLogo from '../../assets/bojo-logo_360x.png';

const Banner = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Banner principal */}
      <div
        style={{
          background: 'white',
          padding: '60px 20px 40px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <img
          src={bojoLogo}
          alt="Bojo Chic Logo"
          style={{
            maxWidth: '280px',
            width: '100%',
            marginBottom: '30px',
            display: 'block',
          }}
        />

        <Space size="large" style={{ marginTop: '20px' }}>
          <a
            onClick={() => navigate('/inicio')}
            style={{
              color: '#DE0797',
              fontSize: '16px',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: '500',
            }}
          >
            Inicio
          </a>
          <a
            onClick={() => navigate('/catalogo')}
            style={{
              color: '#DE0797',
              fontSize: '16px',
              cursor: 'pointer',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            Catálogo
          </a>
        </Space>
      </div>
      {/* Línea separadora */}
      <div
        style={{
          borderBottom: '1px solid #e0e0e0',
          width: '100%',
        }}
      />
    </div>
  );
};

export default Banner;
