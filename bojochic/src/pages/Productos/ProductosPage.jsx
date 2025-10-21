import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Spin, Alert } from 'antd';
import { db } from '../../firebase/config.js';
import ProductosPorCategoria from '../../components/Productos/ProductosPorCategoria';

const ProductosPage = () => {
  const location = useLocation();
  const categoria = location.pathname.slice(1);

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(' Buscando productos para categoría:', categoria);

        // Query a Firebase para obtener productos por categoría
        const q = query(
          collection(db, 'productos'),
          where('categoria', '==', categoria)
        );

        const querySnapshot = await getDocs(q);
        const productosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log(' Productos encontrados:', productosData);
        setProductos(productosData);

        if (productosData.length === 0) {
          console.log(' No se encontraron productos para esta categoría');
        }
      } catch (err) {
        console.error(' Error al obtener productos:', err);
        setError(`Error al cargar los productos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Solo hacer la consulta si hay una categoría válida
    if (categoria) {
      obtenerProductos();
    }
  }, [categoria]);

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <Spin size="large" />
        <p>Conectando con Firebase...</p>
        <p style={{ color: '#666' }}>Categoría: {categoria}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          maxWidth: '1200px',
          margin: '60px auto',
          padding: '0 20px',
        }}
      >
        <Alert
          message="Error de conexión"
          description={error}
          type="error"
          showIcon
          action={
            <button onClick={() => window.location.reload()}>Reintentar</button>
          }
        />
      </div>
    );
  }

  return <ProductosPorCategoria categoria={categoria} productos={productos} />;
};

export default ProductosPage;
