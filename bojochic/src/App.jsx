import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Registro from './pages/Registro';
import Nosotros from './pages/Nosotros';
import Catalogo from './pages/Catalogo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="registro" element={<Registro />} />
          <Route path="nosotros" element={<Nosotros />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="hombre" element={<Catalogo />} />
          <Route path="mujer" element={<Catalogo />} />
          <Route path="ninos" element={<Catalogo />} />
          <Route path="ofertas" element={<Catalogo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;