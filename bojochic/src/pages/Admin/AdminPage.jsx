// src/pages/Admin/AdminPage.jsx
import { Card, Tabs, Button, Space } from 'antd';
import { UserOutlined, ShoppingOutlined, UnorderedListOutlined, TeamOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AgregarProducto from '../../components/Admin/AgregarProducto';
import ListaProductos from '../../components/Admin/ListaProductos';

const AdminPage = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  const items = [
    {
      key: '1',
      label: <span><ShoppingOutlined /> Agregar Producto</span>,
      children: <AgregarProducto />,
    },
    {
      key: '2',
      label: <span><UnorderedListOutlined /> Lista de Productos</span>,
      children: <ListaProductos />,
    },
  ];

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '50px auto', 
      padding: '0 20px' 
    }}>
      <Card 
        title="Panel de Administración - Bojo Chic"
        extra={
          // 👇 Solo mostrar si es admin
          userRole === 'admin' && (
            <Button 
              type="primary"
              icon={<TeamOutlined />}
              onClick={() => navigate('/admin/usuarios')}
              size="large"
            >
              Gestionar Usuarios
            </Button>
          )
        }
      >
        <Tabs defaultActiveKey="1" items={items} />
      </Card>
    </div>
  );
};

export default AdminPage;