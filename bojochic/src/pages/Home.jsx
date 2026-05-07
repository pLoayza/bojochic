// src/pages/Home.jsx
import { Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import Banner from '../components/Banner/Banner';
import Categories from '../components/Categorias/Categorias';
import Destacado from '../components/Destacado/Destacado';
import Resenas from '../components/Resenas/Resenas'; // ← importas el componente

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Banner />
      <Categories />
      <Destacado />
      <Resenas /> {/* ← lo agregas al final */}
    </div>
  );
};

export default Home;