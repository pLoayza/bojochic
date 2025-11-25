// src/components/auth/login/FormularioLogin.jsx
import { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const FormularioLogin = ({ onSuccess, showRegisterLink = true }) => {
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setError('');
      setLoading(true);
      
      await login(values.email, values.password);
      
      console.log('Login exitoso!');
      
      // Si hay callback de éxito, ejecutarlo
      if (onSuccess) {
        onSuccess();
      } else {
        // Si no, redirigir al home
        navigate('/');
      }
      
    } catch (error) {
      console.error('Error al hacer login:', error);
      
      // Mensajes de error personalizados
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: '16px' }}
          onClose={() => setError('')}
        />
      )}

      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Por favor ingresa tu email' },
          { type: 'email', message: 'Email inválido' },
        ]}
      >
        <Input 
          prefix={<MailOutlined />} 
          placeholder="Email" 
          size="large"
          autoComplete="email"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: 'Por favor ingresa tu contraseña' },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Contraseña"
          size="large"
          autoComplete="current-password"
        />
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          size="large" 
          block
          loading={loading}
        >
          Iniciar sesión
        </Button>
      </Form.Item>

      {showRegisterLink && (
        <div style={{ textAlign: 'center' }}>
          <Text>¿No tienes cuenta? </Text>
          <a href="/registro">Regístrate aquí</a>
        </div>
      )}
      
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <a href="/recuperar-password">¿Olvidaste tu contraseña?</a>
      </div>
    </Form>
  );
};

export default FormularioLogin;