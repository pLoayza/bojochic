// src/components/Admin/EditarProducto.jsx
import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message, Space, List, Image, Button } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const { TextArea } = Input;

const EditarProducto = ({ visible, producto, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imagenes, setImagenes] = useState([]);
  const [nuevaImagenUrl, setNuevaImagenUrl] = useState('');

  const categorias = [
    'aros',
    'collares',
    'pulseras',
    'panuelos',
    'chokers',
    'dorados',
    'plateados',
    'liquidacion',
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
        activo: producto.activo
      });

      // Cargar imágenes existentes
      if (producto.imagenes && Array.isArray(producto.imagenes)) {
        setImagenes(producto.imagenes);
      } else if (producto.img) {
        // Si no tiene array de imágenes, usar la imagen principal
        setImagenes([producto.img]);
      } else {
        setImagenes([]);
      }
    }
  }, [producto, form]);

  // Función para agregar una imagen
  const agregarImagen = () => {
    if (!nuevaImagenUrl.trim()) {
      message.warning('Ingresa una URL válida');
      return;
    }

    try {
      new URL(nuevaImagenUrl);
    } catch (error) {
      message.error('La URL no es válida');
      return;
    }

    if (imagenes.includes(nuevaImagenUrl)) {
      message.warning('Esta imagen ya fue agregada');
      return;
    }

    setImagenes([...imagenes, nuevaImagenUrl]);
    setNuevaImagenUrl('');
    message.success('Imagen agregada');
  };

  // Función para eliminar una imagen
  const eliminarImagen = (url) => {
    if (imagenes.length === 1) {
      message.error('Debes tener al menos una imagen');
      return;
    }
    setImagenes(imagenes.filter(img => img !== url));
    message.info('Imagen eliminada');
  };

  const onFinish = async (values) => {
    if (imagenes.length === 0) {
      message.error('Debes tener al menos una imagen');
      return;
    }

    setLoading(true);

    try {
      const productoRef = doc(db, 'productos', producto.id);
      
      await updateDoc(productoRef, {
        nombre: values.nombre,
        descripcion: values.descripcion,
        precio: values.precio,
        stock: values.stock,
        categoria: values.categoria,
        img: imagenes[0], // Primera imagen como principal
        imagenes: imagenes, // Array con todas las imágenes
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

  const handleCancel = () => {
    setNuevaImagenUrl('');
    onClose();
  };

  return (
    <Modal
      title="Editar Producto"
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={800}
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
            parser={value => value.replace(/\$\s?|\./g, '')}
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

        {/* Sección de Imágenes */}
        <Form.Item
          label="Imágenes del Producto"
          required
          extra="La primera imagen será la imagen principal"
        >
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="https://i.imgur.com/ABC123.png"
              size="large"
              value={nuevaImagenUrl}
              onChange={(e) => setNuevaImagenUrl(e.target.value)}
              onPressEnter={agregarImagen}
            />
            <Button 
              type="primary" 
              size="large"
              icon={<PlusOutlined />}
              onClick={agregarImagen}
            >
              Agregar
            </Button>
          </Space.Compact>

          {imagenes.length > 0 && (
            <List
              style={{ marginTop: '15px', maxHeight: '300px', overflowY: 'auto' }}
              bordered
              size="small"
              dataSource={imagenes}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <Button 
                      danger 
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => eliminarImagen(item)}
                      disabled={imagenes.length === 1}
                    >
                      Eliminar
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Image
                        src={item}
                        width={50}
                        height={50}
                        style={{ objectFit: 'cover', borderRadius: '6px' }}
                      />
                    }
                    title={index === 0 ? 'Imagen Principal' : `Imagen ${index + 1}`}
                    description={
                      <div style={{ 
                        fontSize: '11px', 
                        wordBreak: 'break-all',
                        maxWidth: '400px' 
                      }}>
                        {item}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
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