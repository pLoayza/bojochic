// src/pages/LoginPage.jsx
import { Card, Typography } from 'antd';
import FormularioLogin from '../components/auth/login/FormularioLogin';

const { Title } = Typography;

const LoginPage = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: '100%', maxWidth: '450px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
          Iniciar Sesión
        </Title>

        <FormularioLogin />
      </Card>
    </div>
  );
};

export default LoginPage;