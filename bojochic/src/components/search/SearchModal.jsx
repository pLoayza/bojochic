// src/components/Search/SearchModal.jsx
import { useState, useEffect } from 'react';
import { Modal, Input, List, Image, Empty, Tag, Spin, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

const { Search } = Input;

const SearchModal = ({ visible, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [productos, setProductos] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cargar todos los productos al abrir el modal
  useEffect(() => {
    if (visible) {
      cargarProductos();
    }
  }, [visible]);

  // Buscar productos cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setResultados([]);
    } else {
      buscarProductos(searchTerm);
    }
  }, [searchTerm, productos]);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const productosRef = collection(db, 'productos');
      const q = query(productosRef, where('activo', '==', true));
      const querySnapshot = await getDocs(q);
      
      const productosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProductos(productosData);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  // ← CAMBIO: Buscar también en array de categorías
  const buscarProductos = (termino) => {
    const terminoLower = termino.toLowerCase();
    
    const filtrados = productos.filter(producto => {
      // Buscar en nombre
      const nombreCoincide = producto.nombre.toLowerCase().includes(terminoLower);
      
      // Buscar en descripción
      const descripcionCoincide = producto.descripcion?.toLowerCase().includes(terminoLower) || false;
      
      // ← CAMBIO: Buscar en TODAS las categorías
      let categoriaCoincide = false;
      if (producto.categorias && Array.isArray(producto.categorias)) {
        // Si tiene array de categorías, buscar en el array
        categoriaCoincide = producto.categorias.some(cat => 
          cat.toLowerCase().includes(terminoLower)
        );
      } else if (producto.categoria) {
        // Fallback: buscar en categoría única
        categoriaCoincide = producto.categoria.toLowerCase().includes(terminoLower);
      }
      
      return nombreCoincide || descripcionCoincide || categoriaCoincide;
    });
    
    setResultados(filtrados);
  };

  const handleProductClick = (producto) => {
    navigate(`/producto/${producto.id}`);
    handleClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setResultados([]);
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SearchOutlined style={{ color: '#DE0797', fontSize: '20px' }} />
          <span>Buscar Productos</span>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={700}
      style={{ top: 50 }}
    >
      {/* Barra de búsqueda */}
      <Search
        placeholder="Busca por nombre, descripción o categoría..."
        size="large"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '20px' }}
        autoFocus
        allowClear
      />

      {/* Resultados */}
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : searchTerm === '' ? (
          <Empty
            description="Escribe algo para buscar productos"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : resultados.length === 0 ? (
          <Empty
            description={`No se encontraron productos con "${searchTerm}"`}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={resultados}
            renderItem={(producto) => {
              // ← CAMBIO: Obtener array de categorías para mostrar
              const categorias = producto.categorias && Array.isArray(producto.categorias) && producto.categorias.length > 0
                ? producto.categorias
                : (producto.categoria ? [producto.categoria] : []);

              return (
                <List.Item
                  onClick={() => handleProductClick(producto)}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: '15px',
                    borderRadius: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f5f5f5';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Image
                        src={producto.img}
                        alt={producto.nombre}
                        width={80}
                        height={80}
                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                        preview={false}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '16px', fontWeight: '600' }}>
                          {producto.nombre}
                        </span>
                        <span style={{ color: '#DE0797', fontSize: '18px', fontWeight: 'bold' }}>
                          ${producto.precio.toLocaleString('es-CL')}
                        </span>
                      </div>
                    }
                    description={
                      <div>
                        <p style={{ 
                          margin: '5px 0', 
                          color: '#666',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '400px'
                        }}>
                          {producto.descripcion}
                        </p>
                        {/* ← CAMBIO: Mostrar TODAS las categorías */}
                        <Space wrap style={{ marginTop: '8px' }}>
                          {categorias.map((cat, index) => (
                            <Tag key={index} color="blue">
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </Tag>
                          ))}
                          {producto.stock > 0 ? (
                            <Tag color="green">En stock</Tag>
                          ) : (
                            <Tag color="red">Agotado</Tag>
                          )}
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </div>

      {/* Contador de resultados */}
      {searchTerm && resultados.length > 0 && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: '#f5f5f5',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666'
        }}>
          Se encontraron <strong>{resultados.length}</strong> producto{resultados.length !== 1 ? 's' : ''}
        </div>
      )}
    </Modal>
  );
};

export default SearchModal;