// src/pages/Auth/AuthLanding.jsx
import { Card, Typography, Button, Space, Tag } from 'antd';
import { LockOutlined, ToolOutlined, UserOutlined, CrownOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import FormularioLogin from '../../components/auth/login/FormularioLogin';

const { Title, Paragraph } = Typography;

const AuthLanding = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  // Obtener nombre del usuario desde Firestore
  useEffect(() => {
    const obtenerNombre = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().nombre || 'Usuario');
          }
        } catch (error) {
          console.error('Error obteniendo nombre:', error);
          setUserName('Usuario');
        } finally {
          setLoading(false);
        }
      }
    };

    obtenerNombre();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // 👇 Si está autenticado, mostrar opciones
  if (currentUser) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '80px 20px',
        background: '#ffffff',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ToolOutlined style={{ fontSize: '80px', marginBottom: '20px', color: '#1890ff' }} />
        <Title level={1} style={{ margin: '20px 0' }}>
          Sitio en Construcción
        </Title>
        <Paragraph style={{ 
          fontSize: '18px', 
          color: '#666',
          maxWidth: '600px',
          marginBottom: '30px'
        }}>
          Estamos trabajando para mejorar tu experiencia. 
          Pronto tendremos grandes novedades para ti.
        </Paragraph>

        <Card style={{ 
          background: '#f5f5f5', 
          borderRadius: '12px',
          padding: '20px',
          maxWidth: '500px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div style={{ textAlign: 'center' }}>
              {userRole === 'admin' ? (
                <CrownOutlined style={{ fontSize: '40px', color: '#faad14' }} />
              ) : (
                <UserOutlined style={{ fontSize: '40px', color: '#1890ff' }} />
              )}
              
              <Title level={4} style={{ margin: '15px 0 10px 0' }}>
                ¡Bienvenid@, {loading ? '...' : userName}!
              </Title>
              
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Paragraph style={{ margin: 0, color: '#666' }}>
                  <strong>Email:</strong> {currentUser.email}
                </Paragraph>
                
                <div>
                  <strong>Tu rol es: </strong>
                  {userRole === 'admin' ? (
                    <Tag color="gold" icon={<CrownOutlined />} style={{ fontSize: '14px' }}>
                      Administrador
                    </Tag>
                  ) : (
                    <Tag color="blue" icon={<UserOutlined />} style={{ fontSize: '14px' }}>
                      Cliente
                    </Tag>
                  )}
                </div>
              </Space>
            </div>
            
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {/* 👇 SOLO ADMINS pueden ver estos botones */}
              {userRole === 'admin' && (
                <>
                  {/* Botón para ver sitio completo */}
                  <Button 
                    type="primary"
                    icon={<EyeOutlined />}
                    block 
                    size="large"
                    onClick={() => navigate('/home')}
                  >
                    Ver Sitio Completo (Vista Previa)
                  </Button>

                  {/* Botón de Admin */}
                  <Button 
                    type="default"
                    icon={<CrownOutlined />}
                    block 
                    size="large"
                    onClick={() => navigate('/admin')}
                  >
                    Ir al Panel de Administración
                  </Button>
                </>
              )}
              
              {/* 👇 Si NO es admin, mostrar mensaje */}
              {userRole !== 'admin' && (
                <Card 
                  style={{ 
                    background: '#e6f7ff', 
                    border: '1px solid #91d5ff',
                    marginBottom: '10px'
                  }}
                  size="small"
                >
                  <Paragraph style={{ margin: 0, fontSize: '14px', color: '#0050b3' }}>
                    ℹ️ El sitio estará disponible próximamente. Te notificaremos cuando esté listo.
                  </Paragraph>
                </Card>
              )}
              
              {/* Botón de cerrar sesión para todos */}
              <Button 
                type={userRole === 'admin' ? 'default' : 'primary'}
                block 
                size="large"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </Button>
            </Space>
          </Space>
        </Card>
      </div>
    );
  }

  // 👇 Si NO está autenticado, mostrar login
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          maxWidth: '450px',
          width: '100%',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <LockOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <Title level={3} style={{ marginTop: '15px' }}>
            Acceso Restringido
          </Title>
          <Paragraph type="secondary">
            Sitio en construcción. Inicia sesión para continuar.
          </Paragraph>
        </div>

        <FormularioLogin 
          onSuccess={() => navigate('/')}
          showRegisterLink={true}
        />
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Paragraph type="secondary" style={{ fontSize: '12px' }}>
            🔒 Acceso temporal mientras se completa el desarrollo
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default AuthLanding;