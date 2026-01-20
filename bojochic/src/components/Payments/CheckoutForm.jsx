import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Row, Col, Alert, Typography, message } from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  HomeOutlined,
  EnvironmentOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { auth } from '../../firebase/config';

const { Title } = Typography;

const CheckoutForm = ({ userData, cartItems, totalAmount }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

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
    console.log('🔵 === INICIO HANDLESUBMIT ===');
    console.log('🔵 Formulario enviado:', values);
    console.log('🔵 Total:', totalAmount);
    console.log('🔵 Items:', cartItems);
    console.log('🔵 Usuario autenticado:', auth.currentUser?.email);
    
    setSubmitting(true);
    
    try {
      // Validar carrito
      if (!cartItems || cartItems.length === 0) {
        console.log('❌ Carrito vacío');
        message.error('Tu carrito está vacío');
        setSubmitting(false);
        return;
      }

      // Obtener token de autenticación
      const user = auth.currentUser;
      if (!user) {
        console.log('❌ Usuario no autenticado');
        message.error('Debes iniciar sesión');
        setSubmitting(false);
        return;
      }

      console.log('✅ Usuario OK, obteniendo token...');
      const token = await user.getIdToken();
      console.log('✅ Token obtenido');

      const requestBody = {
        amount: totalAmount,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          size: item.size || null,
          color: item.color || null
        })),
        shippingData: values
      };

      console.log('🔵 Request body:', requestBody);
      console.log('🔵 Llamando al backend...');

      // Llamar al backend para crear transacción
      const response = await fetch('http://localhost:3001/api/webpay/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('🔵 Response status:', response.status);

      const data = await response.json();
      console.log('🔵 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear transacción');
      }

      console.log('✅ Transacción creada, redirigiendo a Webpay...');
      console.log('✅ URL:', data.url);
      console.log('✅ Token:', data.token);

      // Redirigir a Webpay
      const formElement = document.createElement('form');
      formElement.method = 'POST';
      formElement.action = data.url;
      
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'token_ws';
      input.value = data.token;
      
      formElement.appendChild(input);
      document.body.appendChild(formElement);
      
      console.log('✅ Form creado, enviando...');
      formElement.submit();

    } catch (error) {
      console.error('❌ ERROR:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      message.error(error.message || 'Error al procesar el pago');
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
            disabled={!!userData?.email}
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
              rules={[{ required: true, message: 'Ingresa tu comuna' }]}
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
              rules={[{ required: true, message: 'Ingresa tu región' }]}
            >
              <Input 
                prefix={<EnvironmentOutlined />} 
                placeholder="Metropolitana" 
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="notas" label="Notas adicionales (opcional)">
          <Input.TextArea 
            placeholder="Ej: Dejar en conserjería, timbre no funciona, etc."
            rows={3}
          />
        </Form.Item>

        <Alert
          message="Pago Seguro con Webpay"
          description="Serás redirigido a la plataforma segura de Transbank para completar tu pago."
          type="info"
          showIcon
          icon={<CreditCardOutlined />}
          style={{ marginBottom: '20px' }}
        />

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            size="large" 
            block
            loading={submitting}
            icon={<CreditCardOutlined />}
            style={{
              background: 'linear-gradient(45deg, #DE0797, #FF6B9D)',
              border: 'none',
              height: '50px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {submitting ? 'Redirigiendo a Webpay...' : 'Pagar con Webpay'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CheckoutForm;