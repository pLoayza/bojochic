import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Typography, Spin, Alert } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { db } from '../../firebase/config.js';

const { Title } = Typography;

const EstadisticasPage = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'productos'));
        const productosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductos(productosData);
        console.log('📊 Datos para el gráfico:', productosData);
        console.log('📊 Total productos encontrados:', productosData.length);
      } catch (err) {
        setError('Error al cargar datos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  // Preparar datos para el gráfico
  const stockData = productos
    .map((producto) => ({
      nombre:
        producto.nombre.length > 12
          ? producto.nombre.substring(0, 12) + '...'
          : producto.nombre,
      stock: producto.stock || 0,
      nombreCompleto: producto.nombre,
    }))
    .sort((a, b) => b.stock - a.stock);

  console.log('📈 Datos procesados para gráfico:', stockData);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: 'white',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>
            {data.nombreCompleto}
          </p>
          <p
            style={{ margin: '4px 0 0 0', color: '#DE0797', fontWeight: '600' }}
          >
            Stock: {data.stock} unidades
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <Title
          level={1}
          style={{
            textAlign: 'center',
            color: '#DE0797',
            marginBottom: '40px',
          }}
        >
          Stock de Productos
        </Title>

        {/* Contenedor del gráfico con altura mínima */}
        <div
          style={{
            width: '100%',
            minHeight: '600px',
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ width: '100%', height: '500px' }}>
            <ResponsiveContainer>
              <BarChart
                data={stockData}
                margin={{
                  top: 20,
                  right: 40,
                  left: 20,
                  bottom: 100,
                }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="nombre"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={11}
                  interval={0}
                  tick={{ fill: '#666' }}
                />
                <YAxis
                  label={{
                    value: 'Cantidad en Stock',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#666' },
                  }}
                  tick={{ fill: '#666' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="stock"
                  fill="#DE0797"
                  radius={[6, 6, 0, 0]}
                  stroke="#DE0797"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* INFO */}
        <div
          style={{
            marginTop: '30px',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
          }}
        >
          <p>
            Total de productos: {productos.length} | Stock total:{' '}
            {productos.reduce((sum, p) => sum + (p.stock || 0), 0)} unidades
          </p>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasPage;
