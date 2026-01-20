// src/components/Admin/ListaProductos.jsx
import { useState, useEffect } from 'react';
import { Table, Button, Space, message, Popconfirm, Tag, Image, Select } from 'antd';
import { DeleteOutlined, EditOutlined, FilterOutlined } from '@ant-design/icons';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import EditarProducto from './EditarProducto';

const { Option } = Select;

const ListaProductos = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');

  const categorias = [
    { value: 'todas', label: 'Todas las Categorías' },
    { value: 'aros', label: 'Aros' },
    { value: 'collares', label: 'Collares' },
    { value: 'pulseras', label: 'Pulseras' },
    { value: 'panuelos', label: 'Pañuelos' },
    { value: 'anillos', label: 'Anillos' },
    { value: 'dorados', label: 'Dorados' },
    { value: 'plateados', label: 'Plateados' },
    { value: 'conjuntos', label: 'Conjuntos' },
    { value: 'otros', label: 'Otros' }
  ];

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    filtrarProductos();
  }, [productos, categoriaSeleccionada]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'productos'));
      const productosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        key: doc.id,
        ...doc.data()
      }));
      setProductos(productosData);
    } catch (error) {
      console.error('Error cargando productos:', error);
      message.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  // ← CAMBIO: Filtrar productos que tengan la categoría en su array
  const filtrarProductos = () => {
    if (categoriaSeleccionada === 'todas') {
      setProductosFiltrados(productos);
    } else {
      const filtrados = productos.filter(p => {
        // Si tiene array de categorías, buscar en el array
        if (p.categorias && Array.isArray(p.categorias)) {
          return p.categorias.includes(categoriaSeleccionada);
        }
        // Fallback: si solo tiene categoría única
        return p.categoria === categoriaSeleccionada;
      });
      setProductosFiltrados(filtrados);
    }
  };

  const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, 'productos', id));
      message.success('Producto eliminado');
      cargarProductos();
    } catch (error) {
      console.error('Error eliminando producto:', error);
      message.error('Error al eliminar producto');
    }
  };

  const abrirModalEditar = (producto) => {
    setProductoSeleccionado(producto);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setProductoSeleccionado(null);
  };

  const handleEditarExito = () => {
    cargarProductos();
  };

  const columns = [
    {
      title: 'Imagen',
      dataIndex: 'img',
      key: 'img',
      width: 100,
      render: (img) => (
        <Image 
          src={img} 
          alt="Producto"
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: '8px' }}
        />
      ),
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      key: 'precio',
      render: (precio) => `$${precio.toLocaleString('es-CL')}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock} unidades
        </Tag>
      ),
    },
    {
      title: 'Categorías', // ← CAMBIO: Plural
      key: 'categorias',
      render: (_, record) => {
        // ← CAMBIO: Mostrar todas las categorías como Tags
        const cats = record.categorias || (record.categoria ? [record.categoria] : []);
        return (
          <Space wrap>
            {cats.map(cat => (
              <Tag color="blue" key={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      render: (activo) => (
        <Tag color={activo ? 'green' : 'red'}>
          {activo ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            size="small"
            onClick={() => abrirModalEditar(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Eliminar este producto?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => eliminarProducto(record.id)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
              size="small"
            >
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Selector de categoría */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <strong>Total: {productosFiltrados.length} productos</strong>
          {categoriaSeleccionada !== 'todas' && (
            <Tag 
              color="blue" 
              style={{ marginLeft: '10px' }}
              closable
              onClose={() => setCategoriaSeleccionada('todas')}
            >
              {categorias.find(c => c.value === categoriaSeleccionada)?.label}
            </Tag>
          )}
        </div>
        
        <Space align="center">
          <FilterOutlined style={{ color: '#DE0797' }} />
          <span>Filtrar por:</span>
          <Select
            value={categoriaSeleccionada}
            onChange={setCategoriaSeleccionada}
            style={{ width: 200 }}
          >
            {categorias.map(cat => (
              <Option key={cat.value} value={cat.value}>
                {cat.label}
              </Option>
            ))}
          </Select>
        </Space>
      </div>

      {/* Tabla de productos */}
      <Table 
        columns={columns} 
        dataSource={productosFiltrados}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
      />

      {/* Modal de edición */}
      <EditarProducto
        visible={modalVisible}
        producto={productoSeleccionado}
        onClose={cerrarModal}
        onSuccess={handleEditarExito}
      />
    </div>
  );
};

export default ListaProductos;