import { Typography } from 'antd';

const { Title } = Typography;

const Nosotros = () => {
  return (
    <div style={{ 
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px'
    }}>
      <Title level={1}>Nosotros</Title>
      <Title level={4} type="secondary">Página en construcción</Title>
    </div>
  );
};

export default Nosotros;