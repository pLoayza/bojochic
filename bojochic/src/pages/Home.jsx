// src/pages/Home.jsx
import { Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import Banner from '../components/Banner/Banner';
import Categories from '../components/Categorias/Categorias';
import Destacado from '../components/Destacado/Destacado';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Banner principal */}
      <Banner />
      
      {/* Categorías */}
      <Categories />
      
      {/* Productos destacados */}
      <Destacado />
    </div>
  );
};

export default Home;