// src/components/Admin/GestionUsuarios.jsx
import { useState, useEffect } from 'react';
import { Table, Switch, Select, message, Tag, Space, Input, Button, Popconfirm, Alert } from 'antd';
import { UserOutlined, CrownOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

const { Option } = Select;

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const { currentUser } = useAuth();

  // Cargar usuarios desde Firestore
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const usuariosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar: admins primero, luego por nombre
      usuariosData.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return (a.nombre || '').localeCompare(b.nombre || '');
      });
      
      setUsuarios(usuariosData);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      message.error('Error al cargar usuarios');
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Cambiar rol del usuario
  const cambiarRol = async (userId, userEmail, nuevoRol) => {
    // Prevenir que el admin se quite sus propios permisos
    if (userId === currentUser.uid && nuevoRol === 'customer') {
      message.warning('No puedes quitarte tus propios permisos de administrador');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        role: nuevoRol
      });
      
      // Actualizar estado local
      setUsuarios(usuarios.map(user => 
        user.id === userId ? { ...user, role: nuevoRol } : user
      ));
      
      const rolTexto = nuevoRol === 'admin' ? 'Administrador' : 'Cliente';
      message.success(`${userEmail} ahora es ${rolTexto}`);
    } catch (error) {
      console.error('Error actualizando rol:', error);
      message.error('Error al actualizar rol');
    }
  };

  // Filtrar usuarios por búsqueda
  const usuariosFiltrados = usuarios.filter(user => 
    user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.nombre?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.rut?.includes(searchText)
  );

  // Contar admins y clientes
  const totalAdmins = usuarios.filter(u => u.role === 'admin').length;
  const totalClientes = usuarios.filter(u => u.role === 'customer').length;
  const sinRol = usuarios.filter(u => !u.role).length;

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (text, record) => (
        <Space>
          <strong>{text || 'Sin nombre'}</strong>
          {record.id === currentUser.uid && (
            <Tag color="green">Tú</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'RUT',
      dataIndex: 'rut',
      key: 'rut',
      render: (text) => text || '-',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'roleStatus',
      render: (role) => {
        if (role === 'admin') {
          return <Tag color="gold" icon={<CrownOutlined />}>Administrador</Tag>;
        } else if (role === 'customer') {
          return <Tag color="blue" icon={<UserOutlined />}>Cliente</Tag>;
        } else {
          return <Tag color="default">Sin rol</Tag>;
        }
      },
    },
    {
      title: 'Cambiar Rol',
      key: 'action',
      render: (_, record) => {
        // Si es el mismo usuario logueado, no permitir cambio
        if (record.id === currentUser.uid) {
          return (
            <Select
              value={record.role || 'customer'}
              style={{ width: 150 }}
              disabled
            >
              <Option value="admin">
                <CrownOutlined /> Admin
              </Option>
            </Select>
          );
        }

        return (
          <Popconfirm
            title="¿Cambiar rol de usuario?"
            description={`¿Estás seguro de cambiar el rol de ${record.email}?`}
            onConfirm={() => {
              const nuevoRol = record.role === 'admin' ? 'customer' : 'admin';
              cambiarRol(record.id, record.email, nuevoRol);
            }}
            okText="Sí, cambiar"
            cancelText="Cancelar"
          >
            <Switch
              checked={record.role === 'admin'}
              checkedChildren={<><CrownOutlined /> Admin</>}
              unCheckedChildren={<><UserOutlined /> Cliente</>}
            />
          </Popconfirm>
        );
      },
    },
    {
      title: 'Fecha Registro',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : '-',
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* Estadísticas */}
      <Alert
        message={
          <Space size="large">
            <span><strong>Total usuarios:</strong> {usuarios.length}</span>
            <span><CrownOutlined /> <strong>Admins:</strong> {totalAdmins}</span>
            <span><UserOutlined /> <strong>Clientes:</strong> {totalClientes}</span>
            {sinRol > 0 && <span style={{ color: '#ff4d4f' }}><strong>Sin rol:</strong> {sinRol}</span>}
          </Space>
        }
        type="info"
        showIcon
      />

      {/* Búsqueda y Recarga */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <Input
          placeholder="Buscar por email, nombre o RUT..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
          allowClear
          style={{ flex: 1 }}
        />
        <Button 
          icon={<ReloadOutlined />}
          onClick={cargarUsuarios}
          size="large"
        >
          Recargar
        </Button>
      </div>

      {/* Tabla de usuarios */}
      <Table
        columns={columns}
        dataSource={usuariosFiltrados}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Total: ${total} usuarios`,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
        scroll={{ x: 1000 }}
      />
    </Space>
  );
};

export default GestionUsuarios;