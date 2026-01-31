// src/components/auth/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Result, Button, Space } from 'antd';
import { LockOutlined, LoginOutlined, HomeOutlined } from '@ant-design/icons';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Card loading />
      </div>
    );
  }

  // 👇 Si no está autenticado, redirigir a login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 👇 Si requiere admin y no es admin, mostrar mensaje con opción de logout
  if (requireAdmin && userRole !== 'admin') {
    return (
      <div style={{ 
        maxWidth: '600px', 
        margin: '100px auto', 
        padding: '20px' 
      }}>
        <Result
          status="403"
          title="Acceso Denegado"
          subTitle={`Tu cuenta (${currentUser.email}) no tiene permisos de administrador para acceder a esta página.`}
          icon={<LockOutlined style={{ fontSize: '72px', color: '#ff4d4f' }} />}
          extra={
            <Space direction="vertical" size="middle">
              <Button type="primary" icon={<HomeOutlined />} href="/" size="large">
                Volver al inicio
              </Button>
              <Button 
                type="default" 
                icon={<LoginOutlined />} 
                onClick={() => {
                  // Hacer logout y redirigir a login
                  window.location.href = '/login';
                }}
                size="large"
              >
                Cerrar sesión e iniciar con otra cuenta
              </Button>
            </Space>
          }
        />
        
        <Card 
          style={{ marginTop: '30px', background: '#f0f0f0' }}
          size="small"
        >
          <p style={{ margin: 0, fontSize: '12px', color: '#666', textAlign: 'center' }}>
            💡 Si crees que deberías tener acceso, contacta al administrador del sitio.
          </p>
        </Card>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;