// src/components/Layout/MainLayout.jsx
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ContactBubble from '../contacto/contactbubble';

const { Content } = Layout;

const MainLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Barra superior con promoción e iconos */}
      <Navbar />
      
      {/* Contenido principal (aquí se renderiza el Banner dentro de Home) */}
      <Content>
        <Outlet />
      </Content>
      
      {/* Footer */}
      <Footer />
      
      {/* Burbuja de contacto */}
      <ContactBubble />
    </Layout>
  );
};

export default MainLayout;