// src/components/Admin/ListaProductos.jsx
import { useState, useEffect } from 'react';
import { Table, Button, Space, message, Popconfirm, Tag, Image } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import EditarProducto from './EditarProducto'; 
const ListaProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false); // ⬅️ AGREGAR
  const [productoSeleccionado, setProductoSeleccionado] = useState(null); // ⬅️ AGREGAR

  useEffect(() => {
    cargarProductos();
  }, []);

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

  // ⬅️ AGREGAR ESTAS FUNCIONES
  const abrirModalEditar = (producto) => {
    setProductoSeleccionado(producto);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setProductoSeleccionado(null);
  };

  const handleEditarExito = () => {
    cargarProductos(); // Recargar la lista
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
      title: 'Categoría',
      dataIndex: 'categoria',
      key: 'categoria',
      render: (categoria) => (
        <Tag color="blue">
          {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
        </Tag>
      ),
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
            onClick={() => abrirModalEditar(record)} // ⬅️ CAMBIAR ESTO
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
      <Table 
        columns={columns} 
        dataSource={productos}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
      />

      {/* ⬅️ AGREGAR ESTE MODAL */}
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