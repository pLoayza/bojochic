// src/components/Admin/AgregarProducto.jsx
import { useState } from 'react';
import { Form, Input, InputNumber, Button, Select, message, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const { TextArea } = Input;

const AgregarProducto = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const categorias = [
    'aros',
    'collares',
    'pulseras',
    'anillos',
    'sets',
    'otros'
  ];

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const producto = {
        nombre: values.nombre,
        descripcion: values.descripcion,
        precio: values.precio,
        stock: values.stock,
        categoria: values.categoria,
        img: values.img,
        activo: true,
        fechaCreacion: new Date().toISOString(),
      };

      await addDoc(collection(db, 'productos'), producto);
      
      message.success('¡Producto agregado exitosamente!');
      form.resetFields();

    } catch (error) {
      console.error('Error agregando producto:', error);
      message.error('Error al agregar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="nombre"
          label="Nombre del Producto"
          rules={[
            { required: true, message: 'Ingresa el nombre del producto' },
            { min: 3, message: 'Mínimo 3 caracteres' }
          ]}
        >
          <Input 
            placeholder="Ej: Aros Dorados Clásicos" 
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="descripcion"
          label="Descripción"
          rules={[
            { required: true, message: 'Ingresa una descripción' },
            { min: 10, message: 'Mínimo 10 caracteres' }
          ]}
        >
          <TextArea 
            placeholder="Describe el producto..."
            rows={4}
          />
        </Form.Item>

        <Form.Item
          name="precio"
          label="Precio (CLP)"
          rules={[
            { required: true, message: 'Ingresa el precio' },
            { type: 'number', min: 0, message: 'El precio debe ser mayor a 0' }
          ]}
        >
          <InputNumber
            placeholder="3990"
            style={{ width: '100%' }}
            size="large"
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="stock"
          label="Stock Disponible"
          rules={[
            { required: true, message: 'Ingresa el stock' },
            { type: 'number', min: 0, message: 'El stock debe ser mayor o igual a 0' }
          ]}
        >
          <InputNumber
            placeholder="15"
            style={{ width: '100%' }}
            size="large"
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="categoria"
          label="Categoría"
          rules={[
            { required: true, message: 'Selecciona una categoría' }
          ]}
        >
          <Select 
            placeholder="Selecciona una categoría"
            size="large"
          >
            {categorias.map(cat => (
              <Select.Option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="img"
          label="URL de la Imagen"
          rules={[
            { required: true, message: 'Ingresa la URL de la imagen' },
            { type: 'url', message: 'Debe ser una URL válida' }
          ]}
          extra="Puedes usar Imgur, Cloudinary u otro servicio de imágenes"
        >
          <Input 
            placeholder="https://i.imgur.com/ABC123.png"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => form.resetFields()}>
              Limpiar
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<PlusOutlined />}
              size="large"
              loading={loading}
              style={{
                background: 'linear-gradient(45deg, #DE0797, #FF6B9D)',
                border: 'none',
              }}
            >
              {loading ? 'Agregando...' : 'Agregar Producto'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AgregarProducto;