// src/components/Admin/CrearBundleModal.jsx
import { useState } from 'react';
import { Modal, Form, Input, InputNumber, List, Image, message, Space, Tag } from 'antd';
import { GiftOutlined, PercentageOutlined } from '@ant-design/icons';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const { TextArea } = Input;

const CrearBundleModal = ({ visible, productos, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const precioNormal = productos.reduce((acc, p) => acc + (p.precio || 0), 0);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const productosSnap = productos.map(p => ({
        id:     p.id,
        nombre: p.nombre || p.title || '',
        imagen: p.img || p.imagenes?.[0] || '',
        precio: p.precio || 0,
      }));

      const bundle = {
        nombre:        values.nombre,
        descripcion:   values.descripcion,
        precioBundle:  values.precioBundle,
        precioNormal:  precioNormal,
        productosIds:  productos.map(p => p.id),
        productosSnap: productosSnap,
        imagenes:      productos.map(p => p.img || p.imagenes?.[0]).filter(Boolean),
        img:           productos[0]?.img || productos[0]?.imagenes?.[0] || '',
        stock:         values.stock,
        activo:        true,
        tipo:          'bundle',
        fechaCreacion: new Date().toISOString(),
      };

      await addDoc(collection(db, 'bundles'), bundle);
      message.success('¡Bundle creado exitosamente!');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creando bundle:', error);
      message.error('Error al crear el bundle');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <GiftOutlined style={{ color: '#f33763' }} />
          <span>Crear Bundle</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Crear Bundle"
      cancelText="Cancelar"
      width={700}
      okButtonProps={{
        style: { background: 'linear-gradient(45deg, #f33763, #FF6B9D)', border: 'none' }
      }}
    >
      {/* Lista de productos incluidos */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontWeight: 600, marginBottom: '10px', color: '#333' }}>
          Productos incluidos ({productos.length}):
        </p>
        <List
          size="small"
          bordered
          dataSource={productos}
          renderItem={(p) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Image
                    src={p.img || p.imagenes?.[0]}
                    width={48} height={48}
                    style={{ objectFit: 'cover', borderRadius: '6px' }}
                    preview={false}
                  />
                }
                title={p.nombre || p.title}
                description={`$${(p.precio || 0).toLocaleString('es-CL')}`}
              />
            </List.Item>
          )}
        />
        <div style={{ marginTop: '10px', textAlign: 'right', color: '#888', fontSize: '13px' }}>
          Precio normal sumado:{' '}
          <strong style={{ color: '#333' }}>${precioNormal.toLocaleString('es-CL')}</strong>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>

        <Form.Item name="nombre" label="Nombre del Bundle"
          rules={[{ required: true, message: 'Ingresa el nombre del bundle' }, { min: 3 }]}
        >
          <Input
            placeholder="Ej: Pack Verano Dorado"
            size="large"
            prefix={<GiftOutlined style={{ color: '#f33763' }} />}
          />
        </Form.Item>

        <Form.Item name="descripcion" label="Descripción"
          rules={[{ required: true, message: 'Ingresa una descripción' }, { min: 10 }]}
        >
          <TextArea placeholder="Describe qué incluye el bundle y por qué es especial..." rows={3} />
        </Form.Item>

        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item name="precioBundle" label="Precio del Bundle (CLP)" style={{ flex: 2 }}
            rules={[{ required: true, message: 'Ingresa el precio especial' }, { type: 'number', min: 0 }]}
          >
            <InputNumber
              placeholder="14990" style={{ width: '100%' }} size="large"
              formatter={v => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={v => v.replace(/\$\s?|\./g, '')}
            />
          </Form.Item>

          <Form.Item label="Precio normal" style={{ flex: 1 }}>
            <InputNumber
              value={precioNormal} disabled
              style={{ width: '100%' }} size="large"
              formatter={v => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            />
          </Form.Item>
        </div>

        {/* Preview ahorro */}
        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.precioBundle !== cur.precioBundle}>
          {({ getFieldValue }) => {
            const precioBundle = getFieldValue('precioBundle');
            if (!precioBundle || precioBundle >= precioNormal) return null;
            const ahorro = precioNormal - precioBundle;
            const pct = Math.round((ahorro / precioNormal) * 100);
            return (
              <div style={{
                background: '#fff0f4', border: '1px solid #f33763',
                borderRadius: '8px', padding: '10px 16px', marginBottom: '24px',
                display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
              }}>
                <PercentageOutlined style={{ color: '#f33763', fontSize: '16px' }} />
                <Tag color="#f33763">{pct}% OFF</Tag>
                <span style={{ color: '#888', textDecoration: 'line-through', fontSize: '14px' }}>
                  ${precioNormal.toLocaleString('es-CL')}
                </span>
                <span style={{ color: '#f33763', fontWeight: 700, fontSize: '18px' }}>
                  ${precioBundle.toLocaleString('es-CL')}
                </span>
                <span style={{ color: '#888', fontSize: '13px' }}>
                  — ahorras ${ahorro.toLocaleString('es-CL')}
                </span>
              </div>
            );
          }}
        </Form.Item>

        <Form.Item name="stock" label="Stock del Bundle"
          rules={[{ required: true, message: 'Ingresa el stock' }, { type: 'number', min: 0 }]}
        >
          <InputNumber placeholder="10" style={{ width: '100%' }} size="large" min={0} />
        </Form.Item>

      </Form>
    </Modal>
  );
};

export default CrearBundleModal;