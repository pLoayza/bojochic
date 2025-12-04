// src/components/Admin/EditarProducto.jsx
import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const { TextArea } = Input;

const EditarProducto = ({ visible, producto, onClose, onSuccess }) => {
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

  useEffect(() => {
    if (producto) {
      form.setFieldsValue({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        stock: producto.stock,
        categoria: producto.categoria,
        img: producto.img,
        activo: producto.activo
      });
    }
  }, [producto, form]);

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const productoRef = doc(db, 'productos', producto.id);
      
      await updateDoc(productoRef, {
        nombre: values.nombre,
        descripcion: values.descripcion,
        precio: values.precio,
        stock: values.stock,
        categoria: values.categoria,
        img: values.img,
        activo: values.activo
      });

      message.success('¡Producto actualizado exitosamente!');
      onSuccess();
      onClose();

    } catch (error) {
      console.error('Error actualizando producto:', error);
      message.error('Error al actualizar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Editar Producto"
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
      okText="Guardar Cambios"
      cancelText="Cancelar"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="nombre"
          label="Nombre del Producto"
          rules={[
            { required: true, message: 'Ingresa el nombre del producto' },
            { min: 3, message: 'Mínimo 3 caracteres' }
          ]}
        >
          <Input size="large" />
        </Form.Item>

        <Form.Item
          name="descripcion"
          label="Descripción"
          rules={[
            { required: true, message: 'Ingresa una descripción' },
            { min: 10, message: 'Mínimo 10 caracteres' }
          ]}
        >
          <TextArea rows={4} />
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
          <Select size="large">
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
        >
          <Input size="large" />
        </Form.Item>

        <Form.Item
          name="activo"
          label="Estado del Producto"
          rules={[{ required: true }]}
        >
          <Select size="large">
            <Select.Option value={true}>Activo</Select.Option>
            <Select.Option value={false}>Inactivo</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditarProducto;