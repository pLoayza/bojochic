import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ContactBubble from '../contacto/contactbubble'; // Importar el componente

const { Content } = Layout;

const MainLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />
      <Content>
        <Outlet />
      </Content>
      <Footer />
      <ContactBubble /> {/* Con mayúscula inicial */}
    </Layout>
  );
};

export default MainLayout;