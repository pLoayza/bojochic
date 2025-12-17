// src/components/Admin/AgregarProducto.jsx
import { useState } from 'react';
import { Form, Input, InputNumber, Button, Select, message, Space, List, Image } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const { TextArea } = Input;

const AgregarProducto = () => {
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

  // Función para agregar una imagen a la lista
  const agregarImagen = () => {
    if (!nuevaImagenUrl.trim()) {
      message.warning('Ingresa una URL válida');
      return;
    }

    // Validar que sea una URL
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
    setImagenes(imagenes.filter(img => img !== url));
    message.info('Imagen eliminada');
  };

  const onFinish = async (values) => {
    if (imagenes.length === 0) {
      message.error('Debes agregar al menos una imagen');
      return;
    }

    setLoading(true);

    try {
      const producto = {
        nombre: values.nombre,
        descripcion: values.descripcion,
        precio: values.precio,
        stock: values.stock,
        categoria: values.categoria,
        img: imagenes[0], // Primera imagen como principal
        imagenes: imagenes, // Array con todas las imágenes
        activo: true,
        fechaCreacion: new Date().toISOString(),
      };

      await addDoc(collection(db, 'productos'), producto);
      
      message.success('¡Producto agregado exitosamente!');
      form.resetFields();
      setImagenes([]);
      setNuevaImagenUrl('');

    } catch (error) {
      console.error('Error agregando producto:', error);
      message.error('Error al agregar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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

        {/* Sección de Imágenes */}
        <Form.Item
          label="Imágenes del Producto"
          required
          extra="La primera imagen será la imagen principal. Puedes agregar varias imágenes."
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
              style={{
                background: 'linear-gradient(45deg, #DE0797, #FF6B9D)',
                border: 'none',
              }}
            >
              Agregar
            </Button>
          </Space.Compact>

          {/* Lista de imágenes agregadas */}
          {imagenes.length > 0 && (
            <List
              style={{ marginTop: '20px' }}
              bordered
              dataSource={imagenes}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <Button 
                      danger 
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => eliminarImagen(item)}
                    >
                      Eliminar
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Image
                        src={item}
                        width={60}
                        height={60}
                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                      />
                    }
                    title={index === 0 ? 'Imagen Principal' : `Imagen ${index + 1}`}
                    description={item}
                  />
                </List.Item>
              )}
            />
          )}
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => {
              form.resetFields();
              setImagenes([]);
              setNuevaImagenUrl('');
            }}>
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