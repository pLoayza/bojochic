import { useEffect, useState } from 'react';
import { Typography, Spin, Select, message, Collapse } from 'antd';
import { db } from '../../firebase/config';
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';

const { Text } = Typography;

const STATUS_CONFIG = {
  pending:   { color: '#fa8c16', bg: '#fff7e6', label: 'Pendiente',  icon: '⏳' },
  approved:  { color: '#52c41a', bg: '#f6ffed', label: 'Pagado',     icon: '✅' },
  rejected:  { color: '#ff4d4f', bg: '#fff2f0', label: 'Rechazado',  icon: '❌' },
  enviado:   { color: '#1677ff', bg: '#e6f4ff', label: 'Enviado',    icon: '🚚' },
  entregado: { color: '#13c2c2', bg: '#e6fffb', label: 'Entregado',  icon: '📦' },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Error cargando órdenes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      message.success('Estado actualizado');
    } catch {
      message.error('Error al actualizar estado');
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <Spin size="large" />
    </div>
  );

  if (orders.length === 0) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 48 }}>📭</div>
      <Text type="secondary">No hay órdenes aún</Text>
    </div>
  );

  const counts = Object.entries(STATUS_CONFIG).map(([key, val]) => ({
    key, val, count: orders.filter(o => o.status === key).length
  })).filter(x => x.count > 0);

  const ordenesFiltradas = filtro === 'todos' ? orders : orders.filter(o => o.status === filtro);

  const collapseItems = ordenesFiltradas.map((order) => {
    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const date = order.createdAt?.toDate?.()?.toLocaleDateString('es-CL', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    const total = order.total ?? order.amount;
    const itemsSubtotal = (order.items || []).reduce((acc, i) => acc + i.price * i.quantity, 0);
    const shipping = order.shipping !== undefined ? order.shipping : total - itemsSubtotal;

    return {
      key: order.id,
      label: (
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
          width: '100%', paddingRight: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Text strong style={{ fontSize: 13, fontFamily: 'monospace' }}>
              {order.buyOrder}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>📅 {date}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>👤 {order.shippingData?.nombre}</Text>
          </div>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            onClick={e => e.stopPropagation()}
          >
            <Text strong style={{ color: '#DE0797', fontSize: 15 }}>
              ${total?.toLocaleString('es-CL')}
            </Text>
            <Select
              value={order.status}
              onChange={(val) => handleStatusChange(order.id, val)}
              onClick={e => e.stopPropagation()}
              style={{ width: 140 }}
              options={Object.entries(STATUS_CONFIG).map(([key, val]) => ({
                value: key,
                label: <span>{val.icon} {val.label}</span>
              }))}
            />
          </div>
        </div>
      ),
      children: (
        <div>
          {/* Productos */}
          <div style={{ marginBottom: 12 }}>
            {(order.items || []).map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', gap: 12, alignItems: 'center',
                padding: '8px 0',
                borderBottom: idx < order.items.length - 1 ? '1px solid #f5f5f5' : 'none'
              }}>
                {item.image && (
                  <img src={item.image} alt={item.name}
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0' }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: 13 }}>{item.name}</Text><br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ${item.price?.toLocaleString('es-CL')} × {item.quantity}
                    {item.size && ` · Talla: ${item.size}`}
                    {item.color && ` · Color: ${item.color}`}
                  </Text>
                </div>
                <Text strong style={{ color: '#DE0797', fontSize: 13 }}>
                  ${(item.price * item.quantity).toLocaleString('es-CL')}
                </Text>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div style={{ background: '#fafafa', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Envío:</Text>
              <Text style={{ color: shipping === 0 ? '#52c41a' : '#333', fontSize: 13 }}>
                {shipping === 0 ? '¡Gratis!' : `$${shipping?.toLocaleString('es-CL')}`}
              </Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>Total:</Text>
              <Text strong style={{ color: '#DE0797' }}>${total?.toLocaleString('es-CL')}</Text>
            </div>
          </div>

          {/* Datos de envío */}
          <div style={{ background: '#fafafa', borderRadius: 8, padding: '10px 14px' }}>
            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>📦 Datos de envío</Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
              <Text style={{ fontSize: 12 }}><b>Destinatario:</b> {order.shippingData?.nombre}</Text>
              <Text style={{ fontSize: 12 }}><b>Teléfono:</b> {order.shippingData?.telefono}</Text>
              <Text style={{ fontSize: 12, gridColumn: '1 / -1' }}>
                <b>Dirección:</b> {order.shippingData?.direccion}, {order.shippingData?.comuna}, {order.shippingData?.region}
              </Text>
              {order.shippingData?.notas && (
                <Text style={{ fontSize: 12, gridColumn: '1 / -1' }}>
                  <b>Notas:</b> {order.shippingData.notas}
                </Text>
              )}
              {order.authorizationCode && (
                <Text style={{ fontSize: 12 }}><b>Autorización:</b> {order.authorizationCode}</Text>
              )}
              {order.cardNumber && (
                <Text style={{ fontSize: 12 }}><b>Tarjeta:</b> **** **** **** {order.cardNumber}</Text>
              )}
              <Text style={{ fontSize: 12 }}><b>Email:</b> {order.userEmail}</Text>
            </div>
          </div>
        </div>
      )
    };
  });

  return (
    <div>
      {/* Filtros / resumen de estados */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        {counts.map(({ key, val, count }) => (
          <div
            key={key}
            onClick={() => setFiltro(filtro === key ? 'todos' : key)}
            style={{
              padding: '4px 14px', borderRadius: 20, cursor: 'pointer',
              background: filtro === key ? val.color : val.bg,
              border: `1px solid ${val.color}30`,
              transition: 'all 0.2s'
            }}
          >
            <Text style={{ color: filtro === key ? 'white' : val.color, fontWeight: 600, fontSize: 13 }}>
              {val.icon} {val.label}: {count}
            </Text>
          </div>
        ))}
        <div
          onClick={() => setFiltro('todos')}
          style={{
            padding: '4px 14px', borderRadius: 20, cursor: 'pointer',
            background: filtro === 'todos' ? '#333' : '#f5f5f5',
            transition: 'all 0.2s'
          }}
        >
          <Text style={{ fontWeight: 600, fontSize: 13, color: filtro === 'todos' ? 'white' : '#333' }}>
            Todos: {orders.length}
          </Text>
        </div>
      </div>

      {/* Lista filtrada */}
      {ordenesFiltradas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, background: '#fafafa', borderRadius: 12 }}>
          <Text type="secondary">No hay órdenes con este estado</Text>
        </div>
      ) : (
        <Collapse
          accordion={false}
          style={{ background: 'white', borderRadius: 12, border: '1px solid #f0f0f0' }}
          items={collapseItems}
        />
      )}
    </div>
  );
};

export default AdminOrders;