// src/pages/Admin/GestionUsuariosPage.jsx
import { Card, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import GestionUsuarios from '../../components/Admin/GestionUsuarios';

const GestionUsuariosPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '50px auto', 
      padding: '0 20px' 
    }}>
      <Card 
        title="Gestión de Usuarios"
        extra={
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin')}
          >
            Volver al Panel
          </Button>
        }
      >
        <GestionUsuarios />
      </Card>
    </div>
  );
};

export default GestionUsuariosPage;