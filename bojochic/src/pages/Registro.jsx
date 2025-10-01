import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, IdcardOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Registro = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Formulario:', values);
    // Aquí irá tu lógica de registro
  };

  return (
    <div style={{ 
      minHeight: '80vh',
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '40px 20px',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: '100%', maxWidth: '450px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
          Registro
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="nombre"
            rules={[
              { required: true, message: 'Por favor ingresa tu nombre' },
              { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Nombre completo" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Por favor ingresa tu email' },
              { type: 'email', message: 'Email inválido' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Email" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="rut"
            rules={[
              { required: true, message: 'Por favor ingresa tu RUT' }
            ]}
          >
            <Input 
              prefix={<IdcardOutlined />} 
              placeholder="RUT (12345678-9)" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Por favor ingresa tu contraseña' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Contraseña" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Por favor confirma tu contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Confirmar contraseña" 
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Registrarse
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text>¿Ya tienes cuenta? </Text>
            <a href="#">Inicia sesión</a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Registro;