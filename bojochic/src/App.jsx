import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App as AntApp } from 'antd'; // Importar el provider
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Registro from './pages/Registro';
import Nosotros from './pages/Nosotros';
import Catalogo from './pages/Catalogo';
import ProductosPage from './pages/Productos/ProductosPage';
import EstadisticasPage from './pages/Estadisticas/EstadisticasPage';

function App() {
  return (
    <BrowserRouter>
      <AntApp> {/* Envolver todo con AntApp */}
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="registro" element={<Registro />} />
            <Route path="nosotros" element={<Nosotros />} />
            <Route path="catalogo" element={<Catalogo />} />
            <Route path="ofertas" element={<Catalogo />} />
            <Route path="Estadisticas" element={<EstadisticasPage />} />
            {/* Rutas para categorías de productos */}
            <Route path="aros" element={<ProductosPage />} />
            <Route path="chokers" element={<ProductosPage />} />
            <Route path="panuelos" element={<ProductosPage />} />
            <Route path="pulseras" element={<ProductosPage />} />
            <Route path="collares" element={<ProductosPage />} />
            <Route path="liquidacion" element={<ProductosPage />} />
          </Route>
        </Routes>
      </AntApp>
    </BrowserRouter>
  );
}

export default App;