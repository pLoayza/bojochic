import { Typography } from 'antd';

const { Title } = Typography;

const Catalogo = () => {
  return (
    <div style={{ 
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px'
    }}>
      <Title level={1}>Catálogo</Title>
      <Title level={4} type="secondary">Página en construcción</Title>
    </div>
  );
};

export default Catalogo;