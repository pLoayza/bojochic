import { useEffect, useState } from 'react';
import { Tag, Typography, Spin, Empty, Descriptions, Collapse, Button, Divider } from 'antd';
import { ShoppingOutlined, HomeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const { Title, Text } = Typography;

const STATUS_CONFIG = {
  pending:   { color: '#fa8c16', bg: '#fff7e6', label: 'Pendiente',  icon: '⏳' },
  approved:  { color: '#52c41a', bg: '#f6ffed', label: 'Pagado',     icon: '✅' },
  rejected:  { color: '#ff4d4f', bg: '#fff2f0', label: 'Rechazado',  icon: '❌' },
  enviado:   { color: '#1677ff', bg: '#e6f4ff', label: 'Enviado',    icon: '🚚' },
  entregado: { color: '#13c2c2', bg: '#e6fffb', label: 'Entregado',  icon: '📦' },
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;
      if (!user) { navigate('/login'); return; }
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error cargando pedidos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
        <Text style={{ marginTop: 16, color: '#888' }}>Cargando tus pedidos...</Text>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🛍️</div>
        <Title level={3} style={{ color: '#888', fontWeight: 400 }}>No tienes pedidos aún</Title>
        <Text type="secondary">¡Explora nuestra tienda y encuentra algo que te encante!</Text>
        <br />
        <Button
          type="primary"
          size="large"
          icon={<HomeOutlined />}
          onClick={() => navigate('/')}
          style={{ marginTop: 24, background: 'linear-gradient(45deg,  #f33763, #FF6B9D)', border: 'none', borderRadius: 8, height: 44 }}
        >
          Ir a la tienda
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '860px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(45deg,  #f33763, #FF6B9D)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <ShoppingOutlined style={{ color: 'white', fontSize: 22 }} />
        </div>
        <div>
          <Title level={2} style={{ margin: 0 }}>Mis Pedidos</Title>
          <Text type="secondary">{orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} encontrados</Text>
        </div>
      </div>

      {/* Lista de órdenes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {orders.map((order) => {
          const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          const date = order.createdAt?.toDate?.()?.toLocaleDateString('es-CL', {
            year: 'numeric', month: 'long', day: 'numeric'
          });

          // ✅ Fix: usar amount si no existe total, y calcular shipping si no existe
          const total = order.total ?? order.amount;
          const itemsSubtotal = (order.items || []).reduce((acc, i) => acc + (i.price * i.quantity), 0);
          const shipping = order.shipping !== undefined ? order.shipping : (total - itemsSubtotal);

          return (
            <div key={order.id} style={{
              background: 'white',
              borderRadius: 16,
              border: '1px solid #f0f0f0',
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}>
              {/* Header de la orden */}
              <div style={{
                padding: '16px 24px',
                background: '#fafafa',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8
              }}>
                <div>
                  <Text strong style={{ fontSize: 15, color: '#333' }}>
                    {order.buyOrder}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13, marginLeft: 12 }}>
                    📅 {date}
                  </Text>
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 14px', borderRadius: 20,
                  background: status.bg, border: `1px solid ${status.color}20`
                }}>
                  <span>{status.icon}</span>
                  <Text style={{ color: status.color, fontWeight: 600, fontSize: 13 }}>
                    {status.label}
                  </Text>
                </div>
              </div>

              {/* Productos */}
              <div style={{ padding: '16px 24px' }}>
                {(order.items || []).map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', gap: 14, alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: idx < order.items.length - 1 ? '1px solid #f5f5f5' : 'none'
                  }}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10, border: '1px solid #f0f0f0' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 14 }}>{item.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        ${item.price?.toLocaleString('es-CL')} × {item.quantity}
                        {item.size && ` · Talla: ${item.size}`}
                        {item.color && ` · Color: ${item.color}`}
                      </Text>
                    </div>
                    <Text strong style={{ color: ' #f33763', fontSize: 14, whiteSpace: 'nowrap' }}>
                      ${(item.price * item.quantity).toLocaleString('es-CL')}
                    </Text>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div style={{ padding: '12px 24px 16px', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text type="secondary">Envío:</Text>
                  <Text style={{ color: shipping === 0 ? '#52c41a' : '#333', fontWeight: 500 }}>
                    {shipping === 0 ? '¡Gratis! 🎉' : `$${shipping?.toLocaleString('es-CL')}`}
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 15 }}>Total pagado:</Text>
                  <Text strong style={{ color: ' #f33763', fontSize: 18 }}>
                    ${total?.toLocaleString('es-CL')}
                  </Text>
                </div>
              </div>

              {/* Collapse datos de envío */}
              <Collapse
                ghost
                style={{ borderTop: '1px solid #f0f0f0' }}
                items={[{
                  key: '1',
                  label: (
                    <Text style={{ fontSize: 13, color: ' #f33763', fontWeight: 500 }}>
                      📦 Ver datos de envío y transacción
                    </Text>
                  ),
                  children: (
                    <div style={{ padding: '0 8px 8px' }}>
                      <Descriptions size="small" column={{ xs: 1, sm: 2 }} bordered>
                        <Descriptions.Item label="👤 Destinatario">
                          {order.shippingData?.nombre}
                        </Descriptions.Item>
                        <Descriptions.Item label="📞 Teléfono">
                          {order.shippingData?.telefono}
                        </Descriptions.Item>
                        <Descriptions.Item label="🏠 Dirección" span={2}>
                          {order.shippingData?.direccion}, {order.shippingData?.comuna}, {order.shippingData?.region}
                        </Descriptions.Item>
                        {order.shippingData?.notas && (
                          <Descriptions.Item label="📝 Notas" span={2}>
                            {order.shippingData.notas}
                          </Descriptions.Item>
                        )}
                        {order.authorizationCode && (
                          <Descriptions.Item label="🔐 Autorización">
                            {order.authorizationCode}
                          </Descriptions.Item>
                        )}
                        {order.cardNumber && (
                          <Descriptions.Item label="💳 Tarjeta">
                            **** **** **** {order.cardNumber}
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </div>
                  )
                }]}
              />
            </div>
          );
        })}
      </div>

      {/* Botón volver */}
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <Button
          onClick={() => navigate('/')}
          size="large"
          style={{ borderRadius: 8, minWidth: 160 }}
        >
          Seguir comprando
        </Button>
      </div>
    </div>
  );
};

export default MyOrders;