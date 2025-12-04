// src/pages/Admin/AdminPage.jsx
import { useState, useEffect } from 'react';
import { Card, Tabs, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import AgregarProducto from '../../components/Admin/AgregarProducto';
import ListaProductos from '../../components/Admin/ListaProductos';

const AdminPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    
    // Verificar que hay un usuario autenticado
    if (!user) {
      message.error('Debes iniciar sesión para acceder al panel');
      navigate('/login');
      return;
    }

    setLoading(false);
  }, [navigate]);

  const items = [
    {
      key: '1',
      label: 'Agregar Producto',
      children: <AgregarProducto />,
    },
    {
      key: '2',
      label: 'Lista de Productos',
      children: <ListaProductos />,
    },
  ];

  if (loading) {
    return <Card loading />;
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '50px auto', 
      padding: '0 20px' 
    }}>
      <Card title="Panel de Administración - Bojo Chic">
        <Tabs defaultActiveKey="1" items={items} />
      </Card>
    </div>
  );
};

export default AdminPage;