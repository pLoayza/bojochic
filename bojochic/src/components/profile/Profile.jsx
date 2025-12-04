import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Space, message } from 'antd';
import { UserOutlined, PhoneOutlined, HomeOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

const { Title, Text } = Typography;

function Profile() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

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
        telefono: values.telefono,
        direccion: values.direccion
        // RUT y email no se pueden cambiar
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
    return <Card loading={loading} style={{ maxWidth: 600, margin: '50px auto' }} />;
  }

  return (
    <div style={{ maxWidth: 600, margin: '50px auto', padding: '0 20px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2}>Mi Perfil</Title>
          
          {/* Datos no editables */}
          <Space direction="vertical" size="small">
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
              <Input prefix={<UserOutlined />} size="large" />
            </Form.Item>

            <Form.Item
              name="telefono"
              label="Teléfono"
              rules={[
                { required: false }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="+56 9 1234 5678" size="large" />
            </Form.Item>

            <Form.Item
              name="direccion"
              label="Dirección"
              rules={[
                { required: false }
              ]}
            >
              <Input prefix={<HomeOutlined />} placeholder="Calle, número, comuna" size="large" />
            </Form.Item>

            <Form.Item>
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
          </Form>
        </Space>
      </Card>
    </div>
  );
}

export default Profile;