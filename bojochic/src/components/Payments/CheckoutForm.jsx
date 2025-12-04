// src/components/Checkout/CheckoutForm.jsx
import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Row, Col, Alert, Typography } from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  HomeOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title } = Typography;

const CheckoutForm = ({ userData, onSubmit }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Pre-llenar formulario con datos del perfil
  useEffect(() => {
    if (userData) {
      form.setFieldsValue({
        nombre: userData.nombre || '',
        email: userData.email || '',
        telefono: userData.telefono || '',
        direccion: userData.direccion || '',
        comuna: userData.comuna || '',
        region: userData.region || ''
      });
    }
  }, [userData, form]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Error en formulario:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <Title level={3} style={{ marginBottom: '24px' }}>
        Datos de Envío
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="nombre"
          label="Nombre Completo"
          rules={[
            { required: true, message: 'Ingresa tu nombre completo' },
            { min: 3, message: 'Mínimo 3 caracteres' }
          ]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="Juan Pérez" 
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Ingresa tu email' },
            { type: 'email', message: 'Email inválido' }
          ]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="correo@ejemplo.com" 
            size="large"
            disabled
          />
        </Form.Item>

        <Form.Item
          name="telefono"
          label="Teléfono"
          rules={[
            { required: true, message: 'Ingresa tu teléfono' },
            { pattern: /^[0-9+\s()-]+$/, message: 'Teléfono inválido' }
          ]}
        >
          <Input 
            prefix={<PhoneOutlined />} 
            placeholder="+56 9 1234 5678" 
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="direccion"
          label="Dirección"
          rules={[
            { required: true, message: 'Ingresa tu dirección' },
            { min: 5, message: 'Dirección muy corta' }
          ]}
        >
          <Input 
            prefix={<HomeOutlined />} 
            placeholder="Calle Ejemplo 123, Depto 45" 
            size="large"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="comuna"
              label="Comuna"
              rules={[
                { required: true, message: 'Ingresa tu comuna' }
              ]}
            >
              <Input 
                prefix={<EnvironmentOutlined />} 
                placeholder="Santiago Centro" 
                size="large"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="region"
              label="Región"
              rules={[
                { required: true, message: 'Ingresa tu región' }
              ]}
            >
              <Input 
                prefix={<EnvironmentOutlined />} 
                placeholder="Metropolitana" 
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="notas"
          label="Notas adicionales (opcional)"
        >
          <Input.TextArea 
            placeholder="Ej: Dejar en conserjería, timbre no funciona, etc."
            rows={3}
          />
        </Form.Item>

        <Alert
          message="Información de Pago"
          description="Después de confirmar tu pedido, recibirás las instrucciones de pago por email."
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            size="large" 
            block
            loading={submitting}
            icon={<CheckCircleOutlined />}
            style={{
              background: 'linear-gradient(45deg, #DE0797, #FF6B9D)',
              border: 'none',
              height: '50px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {submitting ? 'Procesando...' : 'Confirmar Pedido'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CheckoutForm;