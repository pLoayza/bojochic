// src/pages/Productos/ProductoDetallePage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { Spin } from 'antd';
import ProductModal from '../../components/Productos/ProductModal';

const ProductoDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const snap = await getDoc(doc(db, 'productos', id));
        if (snap.exists()) {
          setProducto({ id: snap.id, ...snap.data() });
        } else {
          navigate('/', { replace: true }); // si no existe, redirige
        }
      } catch (e) {
        console.error(e);
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  // Determina a qué categoría volver
  const volverA = () => {
    if (!producto) return navigate(-1);
    const cat = producto.categorias?.[0] || producto.categoria;
    if (cat) navigate(`/${cat}`);
    else navigate(-1);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ProductModal
      visible={true}
      producto={producto}
      onClose={volverA}
    />
  );
};

export default ProductoDetallePage;