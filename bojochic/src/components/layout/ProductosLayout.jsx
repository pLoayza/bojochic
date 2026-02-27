// src/components/Layout/ProductosLayout.jsx
import { Outlet } from 'react-router-dom';
import Banner from '../Banner/Banner';

/**
 * Layout para las páginas de categorías de productos.
 * Mantiene el Banner (ticker + header + navbar) fijo arriba,
 * y solo el <Outlet> cambia al navegar entre categorías.
 */
const ProductosLayout = () => {
  return (
    <div>
      {/* Banner completo: ticker + logo + carrito + navbar */}
      <Banner />

      {/* Aquí se renderiza el grid de productos de cada categoría */}
      <Outlet />
    </div>
  );
};

export default ProductosLayout;