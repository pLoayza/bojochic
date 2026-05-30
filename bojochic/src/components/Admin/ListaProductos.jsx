// src/components/Admin/ListaProductos.jsx
import { useState, useEffect } from 'react';
import { Table, Button, Space, message, Popconfirm, Tag, Image, Select, Tabs, Modal, InputNumber } from 'antd';
import { DeleteOutlined, EditOutlined, FilterOutlined, GiftOutlined, PercentageOutlined } from '@ant-design/icons';
import { collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase/config';
import EditarProducto from './EditarProducto';
import CrearBundleModal from './CrearBundleModal';

const { Option } = Select;

const ListaProductos = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBundles, setLoadingBundles] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [seleccionados, setSeleccionados] = useState([]);
  const [bundleModalVisible, setBundleModalVisible] = useState(false);

  // ── Descuento General ──
  const [descuentoModalVisible, setDescuentoModalVisible] = useState(false);
  const [descuentoGlobal, setDescuentoGlobal] = useState(20);
  const [loadingDescuento, setLoadingDescuento] = useState(false);

  const categorias = [
    { value: 'todas',       label: 'Todas las Categorías' },
    { value: 'aros',        label: 'Aros' },
    { value: 'collares',    label: 'Collares' },
    { value: 'pulseras',    label: 'Pulseras' },
    { value: 'panuelos',    label: 'Pañuelos' },
    { value: 'anillos',     label: 'Anillos' },
    { value: 'dorados',     label: 'Dorados' },
    { value: 'plateados',   label: 'Plateados' },
    { value: 'conjuntos',   label: 'Conjuntos' },
    { value: 'otros',       label: 'Otros' },
    { value: 'Invierno',    label: 'Invierno' },
    { value: 'novedades',   label: 'Novedades' },
    { value: 'promociones', label: 'Promociones' },
  ];

  useEffect(() => { cargarProductos(); cargarBundles(); }, []);
  useEffect(() => { filtrarProductos(); }, [productos, categoriaSeleccionada]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'productos'));
      const data = snap.docs.map(d => ({ id: d.id, key: d.id, ...d.data() }));
      setProductos(data);
    } catch {
      message.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const cargarBundles = async () => {
    try {
      setLoadingBundles(true);
      const snap = await getDocs(collection(db, 'bundles'));
      const data = snap.docs.map(d => ({ id: d.id, key: d.id, ...d.data() }));
      setBundles(data);
    } catch {
      message.error('Error al cargar bundles');
    } finally {
      setLoadingBundles(false);
    }
  };

  const filtrarProductos = () => {
    if (categoriaSeleccionada === 'todas') {
      setProductosFiltrados(productos);
    } else if (categoriaSeleccionada === 'promociones') {
      setProductosFiltrados(productos.filter(p => p.descuento && p.descuento > 0));
    } else {
      setProductosFiltrados(productos.filter(p => {
        if (p.categorias && Array.isArray(p.categorias)) return p.categorias.includes(categoriaSeleccionada);
        return p.categoria === categoriaSeleccionada;
      }));
    }
  };

  const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, 'productos', id));
      message.success('Producto eliminado');
      cargarProductos();
    } catch {
      message.error('Error al eliminar producto');
    }
  };

  const eliminarBundle = async (id) => {
    try {
      await deleteDoc(doc(db, 'bundles', id));
      message.success('Bundle eliminado');
      cargarBundles();
    } catch {
      message.error('Error al eliminar bundle');
    }
  };

  // ── Aplicar descuento a todos los productos ──
  const aplicarDescuentoGeneral = async () => {
    setLoadingDescuento(true);
    try {
      const snap = await getDocs(collection(db, 'productos'));

      // Firestore permite máx 500 ops por batch; usamos chunks de 400 por seguridad
      const docs = snap.docs;
      const chunks = [];
      for (let i = 0; i < docs.length; i += 400) {
        chunks.push(docs.slice(i, i + 400));
      }

      for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach(d => {
          batch.update(doc(db, 'productos', d.id), {
            descuento: descuentoGlobal,
            oferta: descuentoGlobal > 0,
          });
        });
        await batch.commit();
      }

      const accion = descuentoGlobal > 0
        ? `✅ ${snap.size} productos actualizados con ${descuentoGlobal}% de descuento`
        : `✅ Descuento eliminado de ${snap.size} productos`;

      message.success(accion);
      setDescuentoModalVisible(false);
      cargarProductos();
    } catch (err) {
      console.error(err);
      message.error('Error al aplicar descuento');
    } finally {
      setLoadingDescuento(false);
    }
  };

  const productosSeleccionados = productos.filter(p => seleccionados.includes(p.id));

  const rowSelection = {
    selectedRowKeys: seleccionados,
    onChange: (keys) => setSeleccionados(keys),
  };

  // ── Columnas productos ──
  const columnasProductos = [
    {
      title: 'Imagen', dataIndex: 'img', key: 'img', width: 80,
      render: (img) => (
        <Image src={img} width={55} height={55} style={{ objectFit: 'cover', borderRadius: '8px' }} />
      ),
    },
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    {
      title: 'Precio', dataIndex: 'precio', key: 'precio',
      render: (precio) => `$${precio?.toLocaleString('es-CL')}`,
    },
    {
      title: 'Descuento', dataIndex: 'descuento', key: 'descuento',
      render: (descuento) => descuento > 0
        ? <Tag color="volcano">-{descuento}%</Tag>
        : <Tag color="default">Sin descuento</Tag>,
    },
    {
      title: 'Stock', dataIndex: 'stock', key: 'stock',
      render: (stock) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>{stock} unidades</Tag>
      ),
    },
    {
      title: 'Categorías', key: 'categorias',
      render: (_, record) => {
        const cats = record.categorias || (record.categoria ? [record.categoria] : []);
        return <Space wrap>{cats.map(cat => <Tag color="blue" key={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Tag>)}</Space>;
      },
    },
    {
      title: 'Estado', dataIndex: 'activo', key: 'activo',
      render: (activo) => <Tag color={activo ? 'green' : 'red'}>{activo ? 'Activo' : 'Inactivo'}</Tag>,
    },
    {
      title: 'Acciones', key: 'acciones',
      render: (_, record) => (
        <Space>
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => { setProductoSeleccionado(record); setModalVisible(true); }}>
            Editar
          </Button>
          <Popconfirm
            title="¿Eliminar este producto?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => eliminarProducto(record.id)}
            okText="Sí, eliminar" cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} size="small">Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ── Columnas bundles ──
  const columnasBundles = [
    {
      title: 'Imagen', dataIndex: 'img', key: 'img', width: 80,
      render: (img) => (
        <Image src={img} width={55} height={55} style={{ objectFit: 'cover', borderRadius: '8px' }} />
      ),
    },
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    {
      title: 'Precio Bundle', dataIndex: 'precioBundle', key: 'precioBundle',
      render: (p) => <span style={{ color: '#f33763', fontWeight: 700 }}>${p?.toLocaleString('es-CL')}</span>,
    },
    {
      title: 'Precio Normal', dataIndex: 'precioNormal', key: 'precioNormal',
      render: (p) => <span style={{ color: '#aaa', textDecoration: 'line-through' }}>${p?.toLocaleString('es-CL')}</span>,
    },
    {
      title: 'Ahorro', key: 'ahorro',
      render: (_, record) => {
        const ahorro = (record.precioNormal || 0) - (record.precioBundle || 0);
        const pct = record.precioNormal > 0 ? Math.round((ahorro / record.precioNormal) * 100) : 0;
        return ahorro > 0
          ? <Tag color="volcano">-{pct}% (${ahorro.toLocaleString('es-CL')})</Tag>
          : '-';
      },
    },
    {
      title: 'Productos', key: 'productos',
      render: (_, record) => (
        <Space wrap>
          {record.productosSnap?.map(p => (
            <Tag key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {p.imagen && (
                <img src={p.imagen} alt={p.nombre} style={{ width: 18, height: 18, borderRadius: 3, objectFit: 'cover' }} />
              )}
              {p.nombre}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Stock', dataIndex: 'stock', key: 'stock',
      render: (stock) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>{stock} unidades</Tag>
      ),
    },
    {
      title: 'Estado', dataIndex: 'activo', key: 'activo',
      render: (activo) => <Tag color={activo ? 'green' : 'red'}>{activo ? 'Activo' : 'Inactivo'}</Tag>,
    },
    {
      title: 'Acciones', key: 'acciones',
      render: (_, record) => (
        <Popconfirm
          title="¿Eliminar este bundle?"
          description="Esta acción no se puede deshacer"
          onConfirm={() => eliminarBundle(record.id)}
          okText="Sí, eliminar" cancelText="Cancelar"
          okButtonProps={{ danger: true }}
        >
          <Button danger icon={<DeleteOutlined />} size="small">Eliminar</Button>
        </Popconfirm>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'productos',
      label: <span>🛍️ Productos ({productosFiltrados.length})</span>,
      children: (
        <div>
          {/* Header productos */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '20px', flexWrap: 'wrap', gap: '10px',
          }}>
            <Space wrap align="center">
              <strong>Total: {productosFiltrados.length} productos</strong>
              {categoriaSeleccionada !== 'todas' && (
                <Tag color="blue" closable onClose={() => setCategoriaSeleccionada('todas')}>
                  {categorias.find(c => c.value === categoriaSeleccionada)?.label}
                </Tag>
              )}
              {seleccionados.length >= 2 && (
                <Button
                  type="primary" icon={<GiftOutlined />}
                  onClick={() => setBundleModalVisible(true)}
                  style={{ background: 'linear-gradient(45deg, #722ed1, #9b59b6)', border: 'none' }}
                >
                  Crear Bundle ({seleccionados.length} productos)
                </Button>
              )}
              <Button
                icon={<PercentageOutlined />}
                onClick={() => setDescuentoModalVisible(true)}
                style={{ background: 'linear-gradient(45deg, #fa8c16, #ffa940)', border: 'none', color: '#fff' }}
              >
                Descuento General
              </Button>
            </Space>

            <Space align="center">
              <FilterOutlined style={{ color: '#f33763' }} />
              <span>Filtrar por:</span>
              <Select value={categoriaSeleccionada} onChange={setCategoriaSeleccionada} style={{ width: 200 }}>
                {categorias.map(cat => <Option key={cat.value} value={cat.value}>{cat.label}</Option>)}
              </Select>
            </Space>
          </div>

          {seleccionados.length === 1 && (
            <div style={{ marginBottom: '12px', color: '#888', fontSize: '13px' }}>
              Selecciona al menos 1 producto más para crear un bundle
            </div>
          )}

          <Table
            rowSelection={rowSelection}
            columns={columnasProductos}
            dataSource={productosFiltrados}
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
          />
        </div>
      ),
    },
    {
      key: 'bundles',
      label: <span><GiftOutlined /> Bundles ({bundles.length})</span>,
      children: (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <strong>Total: {bundles.length} bundles</strong>
          </div>
          <Table
            columns={columnasBundles}
            dataSource={bundles}
            loading={loadingBundles}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1100 }}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Tabs items={tabItems} />

      <EditarProducto
        visible={modalVisible}
        producto={productoSeleccionado}
        onClose={() => { setModalVisible(false); setProductoSeleccionado(null); }}
        onSuccess={cargarProductos}
      />

      <CrearBundleModal
        visible={bundleModalVisible}
        productos={productosSeleccionados}
        onClose={() => { setBundleModalVisible(false); setSeleccionados([]); }}
        onSuccess={() => { setSeleccionados([]); cargarProductos(); cargarBundles(); }}
      />

      {/* ── Modal Descuento General ── */}
      <Modal
        title={
          <Space>
            <PercentageOutlined style={{ color: '#fa8c16' }} />
            <span>Aplicar Descuento General</span>
          </Space>
        }
        open={descuentoModalVisible}
        onCancel={() => !loadingDescuento && setDescuentoModalVisible(false)}
        onOk={aplicarDescuentoGeneral}
        confirmLoading={loadingDescuento}
        okText={descuentoGlobal > 0 ? `Aplicar ${descuentoGlobal}% a todos` : 'Quitar descuento a todos'}
        cancelText="Cancelar"
        okButtonProps={{
          style: { background: 'linear-gradient(45deg, #fa8c16, #ffa940)', border: 'none' },
          disabled: loadingDescuento,
        }}
      >
        <div style={{ padding: '16px 0' }}>
          <p style={{ marginBottom: '20px', color: '#555' }}>
            Esto actualizará el campo <strong>descuento</strong> en{' '}
            <strong>todos los productos</strong> de la tienda. Los que ya tenían
            un descuento diferente serán reemplazados.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontWeight: 500 }}>Porcentaje de descuento:</span>
            <InputNumber
              min={0}
              max={100}
              value={descuentoGlobal}
              onChange={v => setDescuentoGlobal(v ?? 0)}
              formatter={v => `${v}%`}
              parser={v => v.replace('%', '')}
              size="large"
              style={{ width: 110 }}
            />
          </div>

          {descuentoGlobal > 0 ? (
            <div style={{
              background: '#fff7e6', border: '1px solid #ffa940',
              borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#ad6800',
            }}>
              ✅ Se aplicará <strong>{descuentoGlobal}%</strong> de descuento a todos los productos
              y se activará el campo <strong>oferta: true</strong>.
            </div>
          ) : (
            <div style={{
              background: '#fff1f0', border: '1px solid #ffa39e',
              borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#cf1322',
            }}>
              ⚠️ Con 0% se <strong>eliminará el descuento</strong> de todos los productos
              y se desactivará el campo <strong>oferta: false</strong>.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ListaProductos;