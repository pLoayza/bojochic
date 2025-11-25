// components/auth/FormularioRegistro.jsx
import { Form, Input, Button, Typography } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { validateForm } from '../../../utils/validaciones';
import { useAuth } from '../../../contexts/AuthContext';

const { Text } = Typography;

const FormularioRegistro = ({ onSuccess, showLoginLink = true }) => {
  const [form] = Form.useForm();
  const { signup } = useAuth();

  const onFinish = async (values) => {
    // Aplicar validaciones personalizadas
    const validation = validateForm(values);

    if (!validation.isValid) {
      form.setFields([
        {
          name: 'nombre',
          errors: validation.errors.nombre ? [validation.errors.nombre] : [],
        },
        {
          name: 'email',
          errors: validation.errors.email ? [validation.errors.email] : [],
        },
        {
          name: 'rut',
          errors: validation.errors.rut ? [validation.errors.rut] : [],
        },
        {
          name: 'password',
          errors: validation.errors.password
            ? [validation.errors.password]
            : [],
        },
        {
          name: 'confirmPassword',
          errors: validation.errors.confirmPassword
            ? [validation.errors.confirmPassword]
            : [],
        },
      ]);
      return;
    }

    try {
      // Registro con Firebase Auth
      await signup(values.email, values.password);
      
      // Aquí puedes guardar info adicional en Firestore
      // await guardarInfoUsuario(values.nombre, values.rut);
      
      form.resetFields();
      
      // Callback opcional para acciones después del registro
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Error al registrar:', error);
      form.setFields([
        {
          name: 'email',
          errors: ['Error al crear la cuenta. Intenta nuevamente.'],
        },
      ]);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="nombre"
        rules={[
          { required: true, message: 'Por favor ingresa tu nombre' },
          { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
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
          { type: 'email', message: 'Email inválido' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
      </Form.Item>

      <Form.Item
        name="rut"
        rules={[{ required: true, message: 'Por favor ingresa tu RUT' }]}
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
          {
            min: 6,
            message: 'La contraseña debe tener al menos 6 caracteres',
          },
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
              return Promise.reject(
                new Error('Las contraseñas no coinciden')
              );
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

      {showLoginLink && (
        <div style={{ textAlign: 'center' }}>
          <Text>¿Ya tienes cuenta? </Text>
          <a href="/login">Inicia sesión</a>
        </div>
      )}
    </Form>
  );
};

export default FormularioRegistro;