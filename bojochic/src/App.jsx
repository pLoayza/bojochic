import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App as AntApp } from 'antd';
import { AuthProvider } from './contexts/AuthContext'; //  AuthProvider
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Registro from './pages/Registro';
import Nosotros from './pages/Nosotros';
import Catalogo from './pages/Catalogo';
import ProductosPage from './pages/Productos/ProductosPage';
import EstadisticasPage from './pages/Estadisticas/EstadisticasPage';
import Popup from './components/popup/popup';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <AntApp>
       
        <AuthProvider>
          {/* Popup de suscripción - aparece a los 3 segundos, y cada 30 minutos si no se suscribe */}
          <Popup 
            delaySeconds={3} 
            discountPercent={10} 
            showEveryMinutes={1}
          />
          
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
              <Route path="login" element={<LoginPage />} />
              <Route path="chokers" element={<ProductosPage />} />
              <Route path="panuelos" element={<ProductosPage />} />
              <Route path="pulseras" element={<ProductosPage />} />
              <Route path="collares" element={<ProductosPage />} />
              <Route path="liquidacion" element={<ProductosPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </AntApp>
    </BrowserRouter>
  );
}

export default App;