import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Space, message, Spin, Row, Col } from 'antd';
import { UserOutlined, PhoneOutlined, HomeOutlined, MailOutlined, IdcardOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

function Profile() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }
    loadUserData();
  }, [navigate]);

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          form.setFieldsValue(data);
        } else {
          message.warning('No se encontró información del perfil');
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      message.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setSaving(true);
    
    try {
      const user = auth.currentUser;
      await updateDoc(doc(db, 'users', user.uid), {
        nombre: values.nombre,
        telefono: values.telefono || '',
        direccion: values.direccion || '',
        comuna: values.comuna || '',
        region: values.region || ''
      });
      
      message.success('¡Perfil actualizado correctamente!');
      setUserData({ ...userData, ...values });
    } catch (error) {
      console.error('Error guardando:', error);
      message.error('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: 700, 
      margin: '50px auto', 
      padding: '0 20px' 
    }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2}>Mi Perfil</Title>
          
          {/* Datos no editables */}
          <Space direction="vertical" size="small" style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '8px',
            width: '100%'
          }}>
            <Text type="secondary">
              <MailOutlined /> Email: <strong>{userData?.email}</strong>
            </Text>
            <Text type="secondary">
              <IdcardOutlined /> RUT: <strong>{userData?.rut}</strong>
            </Text>
          </Space>

          {/* Formulario editable */}
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="nombre"
              label="Nombre Completo"
              rules={[
                { required: true, message: 'Por favor ingresa tu nombre' },
                { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                size="large"
                placeholder="Tu nombre completo"
              />
            </Form.Item>

            <Form.Item
              name="telefono"
              label="Teléfono"
              rules={[
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
              label="Dirección Completa"
              tooltip="Incluye calle, número, departamento si aplica"
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
                >
                  <Input 
                    prefix={<EnvironmentOutlined />} 
                    placeholder="Metropolitana" 
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                💡 Completa tu perfil para hacer el proceso de compra más rápido
              </Text>
              
              <Form.Item style={{ marginBottom: 0 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large" 
                  block
                  loading={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </Form.Item>
            </Space>
          </Form>
        </Space>
      </Card>
    </div>
  );
}

export default Profile;