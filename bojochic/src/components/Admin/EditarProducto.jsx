// src/components/Admin/EditarProducto.jsx
import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message, Space, List, Image, Button, Switch, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, TagOutlined, PercentageOutlined } from '@ant-design/icons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const { TextArea } = Input;

const EditarProducto = ({ visible, producto, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imagenes, setImagenes] = useState([]);
  const [nuevaImagenUrl, setNuevaImagenUrl] = useState('');
  const [tieneTallas, setTieneTallas] = useState(false);
  const [tallas, setTallas] = useState([]);
  const [nuevaTalla, setNuevaTalla] = useState('');
  const [ultimasUnidades, setUltimasUnidades] = useState(false);  // ← NUEVO

  const categorias = [
    'aros', 'collares', 'pulseras', 'panuelos',
    'anillos', 'dorados', 'plateados', 'conjuntos', 'otros', 'mama'
  ];

  useEffect(() => {
    if (producto) {
      const categoriasProducto = producto.categorias ||
        (producto.categoria ? [producto.categoria] : []);

      form.setFieldsValue({
        nombre:      producto.nombre,
        descripcion: producto.descripcion,
        precio:      producto.precio,
        stock:       producto.stock,
        categorias:  categoriasProducto,
        activo:      producto.activo,
        descuento:   producto.descuento || 0,
      });

      if (producto.imagenes && Array.isArray(producto.imagenes)) {
        setImagenes(producto.imagenes);
      } else if (producto.img) {
        setImagenes([producto.img]);
      } else {
        setImagenes([]);
      }

      setTieneTallas(producto.tieneTallas || false);
      setTallas(Array.isArray(producto.tallas) ? producto.tallas : []);
      setNuevaTalla('');
      setUltimasUnidades(producto.ultimasUnidades || false);  // ← NUEVO
    }
  }, [producto, form]);

  const agregarImagen = () => {
    if (!nuevaImagenUrl.trim()) { message.warning('Ingresa una URL válida'); return; }
    try { new URL(nuevaImagenUrl); } catch { message.error('La URL no es válida'); return; }
    if (imagenes.includes(nuevaImagenUrl)) { message.warning('Esta imagen ya fue agregada'); return; }
    setImagenes([...imagenes, nuevaImagenUrl]);
    setNuevaImagenUrl('');
    message.success('Imagen agregada');
  };

  const eliminarImagen = (url) => {
    if (imagenes.length === 1) { message.error('Debes tener al menos una imagen'); return; }
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
    if (imagenes.length === 0) { message.error('Debes tener al menos una imagen'); return; }
    if (tieneTallas && tallas.length === 0) {
      message.error('Activaste las tallas pero no agregaste ninguna'); return;
    }

    setLoading(true);
    try {
      const productoRef = doc(db, 'productos', producto.id);

      await updateDoc(productoRef, {
        nombre:          values.nombre,
        descripcion:     values.descripcion,
        precio:          values.precio,
        stock:           values.stock,
        categorias:      values.categorias || [],
        categoria:       values.categorias?.[0] || 'otros',
        img:             imagenes[0],
        imagenes:        imagenes,
        activo:          values.activo,
        tieneTallas:     tieneTallas,
        tallas:          tieneTallas ? tallas : [],
        descuento:       values.descuento || 0,
        ultimasUnidades: ultimasUnidades,        // ← NUEVO
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
    setNuevaTalla('');
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
      okButtonProps={{ style: { background: 'linear-gradient(45deg, #f33763, #FF6B9D)', border: 'none' } }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>

        <Form.Item name="nombre" label="Nombre del Producto"
          rules={[{ required: true, message: 'Ingresa el nombre' }, { min: 3 }]}
        >
          <Input size="large" />
        </Form.Item>

        <Form.Item name="descripcion" label="Descripción"
          rules={[{ required: true, message: 'Ingresa una descripción' }, { min: 10 }]}
        >
          <TextArea rows={4} />
        </Form.Item>

        {/* Precio + Descuento */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item name="precio" label="Precio (CLP)" style={{ flex: 2 }}
            rules={[{ required: true }, { type: 'number', min: 0 }]}
          >
            <InputNumber
              style={{ width: '100%' }} size="large"
              formatter={v => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={v => v.replace(/\$\s?|\./g, '')}
            />
          </Form.Item>

          <Form.Item name="descuento" label="Descuento" style={{ flex: 1 }}
            extra="0 = sin descuento"
            rules={[{ type: 'number', min: 0, max: 100, message: 'Entre 0 y 100' }]}
          >
            <InputNumber
              style={{ width: '100%' }} size="large" min={0} max={100} placeholder="0"
              prefix={<PercentageOutlined style={{ color: '#f33763' }} />}
              formatter={v => v ? `${v}%` : ''}
              parser={v => v.replace('%', '')}
            />
          </Form.Item>
        </div>

        {/* Preview precio con descuento */}
        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.precio !== cur.precio || prev.descuento !== cur.descuento}>
          {({ getFieldValue }) => {
            const precio = getFieldValue('precio');
            const descuento = getFieldValue('descuento');
            if (!precio || !descuento || descuento <= 0) return null;
            const precioFinal = Math.round(precio * (1 - descuento / 100));
            return (
              <div style={{
                background: '#fff0f4', border: '1px solid #f33763',
                borderRadius: '8px', padding: '10px 16px', marginBottom: '24px',
                display: 'flex', alignItems: 'center', gap: '12px'
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
          rules={[{ required: true }, { type: 'number', min: 0 }]}
        >
          <InputNumber style={{ width: '100%' }} size="large" min={0} />
        </Form.Item>

        <Form.Item name="categorias" label="Categorías"
          rules={[{ required: true, message: 'Selecciona al menos una categoría' }]}
          extra="Puedes seleccionar múltiples categorías"
        >
          <Select mode="multiple" size="large" maxTagCount="responsive">
            {categorias.map(cat => (
              <Select.Option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* ── ÚLTIMAS UNIDADES ─────────────────────────────────────────────── */}
        <Form.Item label="Últimas Unidades">
          <div style={{
            border: `1px solid ${ultimasUnidades ? '#fa8c16' : '#f0f0f0'}`,
            borderRadius: '8px', padding: '16px',
            background: ultimasUnidades ? '#fff7e6' : '#fafafa',
            transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <Switch
              checked={ultimasUnidades}
              onChange={setUltimasUnidades}
              style={{ background: ultimasUnidades ? '#fa8c16' : undefined }}
            />
            <div>
              <span style={{ fontWeight: '500', color: ultimasUnidades ? '#fa8c16' : '#888' }}>
                {ultimasUnidades ? '⚡ Mostrando badge "Últimas unidades"' : 'Sin badge de últimas unidades'}
              </span>
              {ultimasUnidades && (
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#aaa' }}>
                  Aparecerá un badge naranja en la card del producto
                </p>
              )}
            </div>
          </div>
        </Form.Item>
        {/* ─────────────────────────────────────────────────────────────────── */}

        {/* SECCIÓN TALLAS */}
        <Form.Item label="Tallas / Medidas">
          <div style={{
            border: `1px solid ${tieneTallas ? '#f33763' : '#f0f0f0'}`,
            borderRadius: '8px', padding: '16px',
            background: tieneTallas ? '#fff8fa' : '#fafafa',
            transition: 'all 0.2s ease'
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
                  <Button type="primary" size="large" icon={<PlusOutlined />} onClick={agregarTalla}
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
                    Agrega los valores de talla (ej: 6, 7, 8 para anillos — XS, S, M para ropa)
                  </p>
                )}
              </>
            )}
          </div>
        </Form.Item>

        {/* Imágenes */}
        <Form.Item label="Imágenes del Producto" required extra="La primera imagen será la imagen principal">
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="https://i.imgur.com/ABC123.png" size="large"
              value={nuevaImagenUrl}
              onChange={(e) => setNuevaImagenUrl(e.target.value)}
              onPressEnter={agregarImagen}
            />
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={agregarImagen}>
              Agregar
            </Button>
          </Space.Compact>

          {imagenes.length > 0 && (
            <List
              style={{ marginTop: '15px', maxHeight: '300px', overflowY: 'auto' }}
              bordered size="small" dataSource={imagenes}
              renderItem={(item, index) => (
                <List.Item actions={[
                  <Button danger size="small" icon={<DeleteOutlined />}
                    onClick={() => eliminarImagen(item)} disabled={imagenes.length === 1}
                  >
                    Eliminar
                  </Button>
                ]}>
                  <List.Item.Meta
                    avatar={<Image src={item} width={50} height={50} style={{ objectFit: 'cover', borderRadius: '6px' }} />}
                    title={index === 0 ? 'Imagen Principal' : `Imagen ${index + 1}`}
                    description={<div style={{ fontSize: '11px', wordBreak: 'break-all', maxWidth: '400px' }}>{item}</div>}
                  />
                </List.Item>
              )}
            />
          )}
        </Form.Item>

        <Form.Item name="activo" label="Estado del Producto" rules={[{ required: true }]}>
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