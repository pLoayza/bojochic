// src/pages/Productos/ProductosPage.jsx
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Spin, Alert } from 'antd';
import { db } from '../../firebase/config.js';
import ProductosPorCategoria from '../../components/Productos/ProductosPorCategoria';

const categoryNames = {
  aros:        'Aros',
  collares:    'Collares',
  pulseras:    'Pulseras',
  anillos:     'Anillos',
  panuelos:    'Pañuelos',
  conjuntos:   'Conjuntos',
  otros:       'Otros',
  plateados:   'Plateados',
  dorados:     'Dorados',
  mama:        'Mamá',
  novedades:   'Novedades',
  promociones: 'Promociones',
};

const ProductosPage = () => {
  const location = useLocation();
  const categoria = location.pathname.slice(1);
  const categoriaNombre = categoryNames[categoria] || categoria;

  const [productos, setProductos] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        setLoading(true);
        setError(null);

        const querySnapshot = await getDocs(collection(db, 'productos'));
        const productosData = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((producto) => {
            if (categoria === 'promociones') {
              return producto.descuento && producto.descuento > 0;
            }
            if (producto.categorias && Array.isArray(producto.categorias)) {
              return producto.categorias.includes(categoria);
            }
            return producto.categoria === categoria;
          });

        setProductos(productosData);

        // Cargar bundles solo en /promociones
        if (categoria === 'promociones') {
          const bundlesSnap = await getDocs(collection(db, 'bundles'));
          const bundlesData = bundlesSnap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((b) => b.activo !== false);
          setBundles(bundlesData);
        } else {
          setBundles([]);
        }

      } catch (err) {
        console.error('❌ Error al obtener productos:', err);
        setError(`Error al cargar los productos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (categoria) obtenerProductos();
  }, [categoria]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '60vh', flexDirection: 'column', gap: '20px',
      }}>
        <Spin size="large" />
        <p>Conectando con Firebase...</p>
        <p style={{ color: '#666' }}>Categoría: {categoriaNombre}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <Alert
          message="Error de conexión" description={error} type="error" showIcon
          action={<button onClick={() => window.location.reload()}>Reintentar</button>}
        />
      </div>
    );
  }

  return (
    <ProductosPorCategoria
      categoria={categoria}
      productos={productos}
      bundles={bundles}
      categoriaNombre={categoriaNombre}
    />
  );
};

export default ProductosPage;