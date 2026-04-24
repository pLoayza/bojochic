// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App as AntApp } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { useEffect } from 'react';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import ProductosLayout from './components/layout/ProductosLayout';

// PÁGINAS
import Home from './pages/Home';
import Registro from './pages/Registro';
import Nosotros from './pages/Nosotros';
import Catalogo from './pages/Catalogo';
import ProductosPage from './pages/Productos/ProductosPage';
import ProductoDetallePage from './pages/Productos/ProductoDetallePage'; // ← NUEVO
import EstadisticasPage from './pages/Estadisticas/EstadisticasPage';
// import Popup from './components/popup/popup';
import LoginPage from './pages/LoginPage';
import Profile from './pages/profile';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import OrderConfirmationPage from './pages/Checkout/OrderConfirmationPage';
import AdminPage from './pages/Admin/AdminPage';
import GestionUsuariosPage from './pages/Admin/GestionUsuariosPage';
import WebpayReturn from './components/Payments/WebpayReturn';
import CartPage from './pages/CartPage';
import MyOrders from './components/Payments/MyOrders';
// POLÍTICAS
import Envio from './pages/politicas/Envio';
import Privacidad from './pages/politicas/Privacidad';
import Reembolso from './pages/politicas/Reembolso';
import Terminos from './pages/politicas/Terminos';


function App() {
  return (
    <BrowserRouter>
      <AntApp>
        <AuthProvider>
          {/* <Popup
            delaySeconds={3}
            discountPercent={10}
            showEveryMinutes={1}
          /> */}

          <Routes>
            {/* RUTAS CON LAYOUT GENERAL */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />

              <Route path="registro"    element={<Registro />} />
              <Route path="login"       element={<LoginPage />} />
              <Route path="nosotros"    element={<Nosotros />} />
              <Route path="catalogo"    element={<Catalogo />} />
              <Route path="ofertas"     element={<Catalogo />} />
              <Route path="/checkout"   element={<CheckoutPage />} />
              <Route path="/webpay/return" element={<WebpayReturn />} />
              <Route path="Estadisticas" element={<EstadisticasPage />} />
              <Route path="/perfil"     element={<Profile />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
              <Route path="/orders"     element={<MyOrders />} />
              

              {/* ← NUEVA RUTA: página de detalle de producto */}
              <Route path="/producto/:id" element={<ProductoDetallePage />} />

              {/* Políticas */}
              <Route path="/politicas/envio"       element={<Envio />} />
              <Route path="/politicas/privacidad"  element={<Privacidad />} />
              <Route path="/politicas/reembolso"   element={<Reembolso />} />
              <Route path="/politicas/terminos"    element={<Terminos />} />
              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminPage /></ProtectedRoute>} />
              <Route path="/admin/usuarios" element={<ProtectedRoute requireAdmin={true}><GestionUsuariosPage /></ProtectedRoute>} />
            </Route>

            {/* RUTAS DE CATEGORÍAS */}
            <Route element={<ProductosLayout />}>
              <Route path="aros"      element={<ProductosPage />} />
              <Route path="collares"  element={<ProductosPage />} />
              <Route path="pulseras"  element={<ProductosPage />} />
              <Route path="anillos"   element={<ProductosPage />} />
              <Route path="panuelos"  element={<ProductosPage />} />
              <Route path="otros"     element={<ProductosPage />} />
              <Route path="conjuntos" element={<ProductosPage />} />
              {/* Colecciones */}
              <Route path="plateados" element={<ProductosPage />} />
              <Route path="dorados"   element={<ProductosPage />} />
              <Route path="mama" element={<ProductosPage />} />
              <Route path="novedades"   element={<ProductosPage />} />
              <Route path="promociones" element={<ProductosPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </AntApp>
    </BrowserRouter>
  );
}

export default App;