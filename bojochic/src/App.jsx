// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App as AntApp } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// PÁGINAS
import AuthLanding from './pages/Auth/AuthLanding';
import Home from './pages/Home';
import Registro from './pages/Registro';
import Nosotros from './pages/Nosotros';
import Catalogo from './pages/Catalogo';
import ProductosPage from './pages/Productos/ProductosPage';
import EstadisticasPage from './pages/Estadisticas/EstadisticasPage';
import Popup from './components/popup/popup';
import LoginPage from './pages/LoginPage';
import Profile from './pages/profile';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import OrderConfirmationPage from './pages/Checkout/OrderConfirmationPage';
import AdminPage from './pages/Admin/AdminPage';
import GestionUsuariosPage from './pages/Admin/GestionUsuariosPage';
import Checkout from './components/Payments/Checkout';
import WebpayReturn from './components/Payments/WebpayReturn';
import CartPage from './pages/CartPage';

function App() {
  return (
    <BrowserRouter>
      <AntApp>
        <AuthProvider>
          <Popup 
            delaySeconds={3} 
            discountPercent={10} 
            showEveryMinutes={1}
          />
          
          <Routes>
            {/* RUTA RAÍZ - Página de autenticación temporal (SIN LAYOUT) */}
            <Route path="/" element={<AuthLanding />} />
            
            {/* RUTAS CON LAYOUT */}
            <Route element={<MainLayout />}>
              {/* 👇 Home completo - SOLO ADMINS */}
              <Route 
                path="/home" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="registro" element={<Registro />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="nosotros" element={<Nosotros />} />
              <Route path="catalogo" element={<Catalogo />} />
              <Route path="ofertas" element={<Catalogo />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/webpay/return" element={<WebpayReturn />} />
              <Route path="Estadisticas" element={<EstadisticasPage />} />
              <Route path="aros" element={<ProductosPage />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="anillos" element={<ProductosPage />} />
              <Route path="panuelos" element={<ProductosPage />} />
              <Route path="pulseras" element={<ProductosPage />} />
              <Route path="collares" element={<ProductosPage />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
              <Route path="conjuntos" element={<ProductosPage />} />
              
              {/* Rutas protegidas para Admin */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/usuarios" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <GestionUsuariosPage />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
        </AuthProvider>
      </AntApp>
    </BrowserRouter>
  );
}

export default App;