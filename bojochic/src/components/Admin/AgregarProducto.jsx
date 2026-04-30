// src/components/Admin/AgregarProducto.jsx
import { useState } from 'react';
import { Form, Input, InputNumber, Button, Select, message, Space, List, Image, Switch, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, TagOutlined, PercentageOutlined } from '@ant-design/icons';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const { TextArea } = Input;

const AgregarProducto = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imagenes, setImagenes] = useState([]);
  const [nuevaImagenUrl, setNuevaImagenUrl] = useState('');

  const [tieneTallas, setTieneTallas] = useState(false);
  const [tallas, setTallas] = useState([]);
  const [nuevaTalla, setNuevaTalla] = useState('');

  const categorias = [
    'aros', 'collares', 'pulseras', 'panuelos',
    'anillos', 'dorados', 'plateados', 'conjuntos', 'otros', 'mama', 'novedades', 'promociones',
  ];

  const agregarImagen = () => {
    if (!nuevaImagenUrl.trim()) { message.warning('Ingresa una URL válida'); return; }
    try { new URL(nuevaImagenUrl); } catch { message.error('La URL no es válida'); return; }
    if (imagenes.includes(nuevaImagenUrl)) { message.warning('Esta imagen ya fue agregada'); return; }
    setImagenes([...imagenes, nuevaImagenUrl]);
    setNuevaImagenUrl('');
    message.success('Imagen agregada');
  };

  const eliminarImagen = (url) => {
    setImagenes(imagenes.filter(img => img !== url));
    message.info('Imagen eliminada');
  };

  const agregarTalla = () => {
    const valor = nuevaTalla.trim();
    if (!valor) { message.warning('Ingresa un valor de talla'); return; }
    if (tallas.includes(valor)) { message.warning('Esa talla ya está en la lista'); return; }
    setTallas([...tallas, valor]);
    setNuevaTalla('');
  };

  const eliminarTalla = (t) => setTallas(tallas.filter(x => x !== t));

  const handleTieneTallasChange = (checked) => {
    setTieneTallas(checked);
    if (!checked) setTallas([]);
  };

  const onFinish = async (values) => {
    if (imagenes.length === 0) { message.error('Debes agregar al menos una imagen'); return; }
    if (tieneTallas && tallas.length === 0) {
      message.error('Activaste las tallas pero no agregaste ninguna'); return;
    }

    setLoading(true);
    try {
      const producto = {
        nombre:        values.nombre,
        descripcion:   values.descripcion,
        precio:        values.precio,
        stock:         values.stock,
        categorias:    values.categorias || [],
        categoria:     values.categorias?.[0] || 'otros',
        img:           imagenes[0],
        imagenes:      imagenes,
        activo:        true,
        fechaCreacion: new Date().toISOString(),
        tieneTallas:   tieneTallas,
        tallas:        tieneTallas ? tallas : [],
        descuento:     values.descuento || 0,   // ← guarda el descuento
      };

      await addDoc(collection(db, 'productos'), producto);
      message.success('¡Producto agregado exitosamente!');
      form.resetFields();
      setImagenes([]);
      setNuevaImagenUrl('');
      setTieneTallas(false);
      setTallas([]);
      setNuevaTalla('');
    } catch (error) {
      console.error('Error agregando producto:', error);
      message.error('Error al agregar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">

        <Form.Item name="nombre" label="Nombre del Producto"
          rules={[{ required: true, message: 'Ingresa el nombre del producto' }, { min: 3 }]}
        >
          <Input placeholder="Ej: Anillo Abrazo Plateado" size="large" />
        </Form.Item>

        <Form.Item name="descripcion" label="Descripción"
          rules={[{ required: true, message: 'Ingresa una descripción' }, { min: 10 }]}
        >
          <TextArea placeholder="Describe el producto..." rows={4} />
        </Form.Item>

        {/* Precio y Descuento en la misma fila */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item name="precio" label="Precio (CLP)" style={{ flex: 2 }}
            rules={[{ required: true, message: 'Ingresa el precio' }, { type: 'number', min: 0 }]}
          >
            <InputNumber
              placeholder="3990" style={{ width: '100%' }} size="large"
              formatter={v => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={v => v.replace(/\$\s?|\./g, '')}
            />
          </Form.Item>

          <Form.Item
            name="descuento"
            label="Descuento"
            style={{ flex: 1 }}
            extra="0 = sin descuento"
            rules={[{ type: 'number', min: 0, max: 100, message: 'Entre 0 y 100' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              size="large"
              min={0}
              max={100}
              placeholder="0"
              prefix={<PercentageOutlined style={{ color: '#f33763' }} />}
              formatter={v => v ? `${v}%` : ''}
              parser={v => v.replace('%', '')}
            />
          </Form.Item>
        </div>

        {/* Preview en tiempo real */}
        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.precio !== cur.precio || prev.descuento !== cur.descuento}>
          {({ getFieldValue }) => {
            const precio = getFieldValue('precio');
            const descuento = getFieldValue('descuento');
            if (!precio || !descuento || descuento <= 0) return null;
            const precioFinal = Math.round(precio * (1 - descuento / 100));
            return (
              <div style={{
                background: '#fff0f4', border: '1px solid #f33763',
                borderRadius: '8px', padding: '10px 16px',
                marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <PercentageOutlined style={{ color: '#f33763', fontSize: '16px' }} />
                <span style={{ color: '#888', textDecoration: 'line-through', fontSize: '14px' }}>
                  ${precio.toLocaleString('es-CL')}
                </span>
                <span style={{ color: '#f33763', fontWeight: 700, fontSize: '18px' }}>
                  ${precioFinal.toLocaleString('es-CL')}
                </span>
                <span style={{ color: '#888', fontSize: '13px' }}>
                  — ahorras ${(precio - precioFinal).toLocaleString('es-CL')}
                </span>
              </div>
            );
          }}
        </Form.Item>

        <Form.Item name="stock" label="Stock Disponible"
          rules={[{ required: true, message: 'Ingresa el stock' }, { type: 'number', min: 0 }]}
        >
          <InputNumber placeholder="15" style={{ width: '100%' }} size="large" min={0} />
        </Form.Item>

        <Form.Item name="categorias" label="Categorías"
          rules={[{ required: true, message: 'Selecciona al menos una categoría' }]}
          extra="Puedes seleccionar múltiples categorías"
        >
          <Select mode="multiple" placeholder="Selecciona una o más categorías" size="large" maxTagCount="responsive">
            {categorias.map(cat => (
              <Select.Option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* SECCIÓN TALLAS */}
        <Form.Item label="Tallas / Medidas">
          <div style={{
            border: '1px solid #f0f0f0', borderRadius: '8px',
            padding: '16px', background: tieneTallas ? '#fff8fa' : '#fafafa'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: tieneTallas ? '16px' : 0 }}>
              <Switch
                checked={tieneTallas}
                onChange={handleTieneTallasChange}
                style={{ background: tieneTallas ? '#f33763' : undefined }}
              />
              <span style={{ fontWeight: '500', color: tieneTallas ? '#f33763' : '#888' }}>
                {tieneTallas ? 'Este producto requiere elegir talla' : 'Este producto no requiere talla'}
              </span>
            </div>

            {tieneTallas && (
              <>
                <Space.Compact style={{ width: '100%', marginBottom: '12px' }}>
                  <Input
                    prefix={<TagOutlined />}
                    placeholder='Ej: 6, 7, XS, S, M...'
                    size="large"
                    value={nuevaTalla}
                    onChange={(e) => setNuevaTalla(e.target.value)}
                    onPressEnter={agregarTalla}
                  />
                  <Button
                    type="primary" size="large" icon={<PlusOutlined />}
                    onClick={agregarTalla}
                    style={{ background: 'linear-gradient(45deg, #f33763, #FF6B9D)', border: 'none' }}
                  >
                    Agregar
                  </Button>
                </Space.Compact>

                {tallas.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {tallas.map(t => (
                      <Tag key={t} closable onClose={() => eliminarTalla(t)}
                        style={{
                          fontSize: '14px', padding: '4px 12px', borderRadius: '6px',
                          border: '1.5px solid #f33763', color: '#f33763',
                          background: '#fff0f4', cursor: 'default'
                        }}
                      >
                        {t}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>
                    Agrega los valores de talla disponibles (ej: 6, 7, 8 para anillos o XS, S, M para ropa)
                  </p>
                )}
              </>
            )}
          </div>
        </Form.Item>

        {/* Imágenes */}
        <Form.Item label="Imágenes del Producto" required extra="La primera imagen será la imagen principal.">
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="https://i.imgur.com/ABC123.png" size="large"
              value={nuevaImagenUrl}
              onChange={(e) => setNuevaImagenUrl(e.target.value)}
              onPressEnter={agregarImagen}
            />
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={agregarImagen}
              style={{ background: 'linear-gradient(45deg, #f33763, #FF6B9D)', border: 'none' }}
            >
              Agregar
            </Button>
          </Space.Compact>

          {imagenes.length > 0 && (
            <List style={{ marginTop: '20px' }} bordered dataSource={imagenes}
              renderItem={(item, index) => (
                <List.Item actions={[
                  <Button danger size="small" icon={<DeleteOutlined />} onClick={() => eliminarImagen(item)}>
                    Eliminar
                  </Button>
                ]}>
                  <List.Item.Meta
                    avatar={<Image src={item} width={60} height={60} style={{ objectFit: 'cover', borderRadius: '8px' }} />}
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
              form.resetFields(); setImagenes([]); setNuevaImagenUrl('');
              setTieneTallas(false); setTallas([]); setNuevaTalla('');
            }}>
              Limpiar
            </Button>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}
              size="large" loading={loading}
              style={{ background: 'linear-gradient(45deg, #f33763, #FF6B9D)', border: 'none' }}
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