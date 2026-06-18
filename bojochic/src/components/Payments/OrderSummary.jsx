import { Card, List, Typography, Space, Divider, Alert, Progress, Button } from 'antd';
import { CheckCircleFilled, DeleteOutlined } from '@ant-design/icons';
import { MINIMO_ENVIO_GRATIS } from './CheckoutForm';

const { Title, Text } = Typography;

const OrderSummary = ({ cartItems, subtotal, shipping, total, descuento, codigoAplicado, onRemoveItem }) => {
  return (
    <Card 
      title="Resumen del Pedido" 
      style={{ position: 'sticky', top: '20px' }}
    >
      <List
        itemLayout="horizontal"
        dataSource={cartItems}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <img 
                  src={item.image} 
                  alt={item.name}
                  style={{ 
                    width: 60, 
                    height: 60, 
                    objectFit: 'cover', 
                    borderRadius: '8px' 
                  }}
                />
              }
              title={<Text strong>{item.name}</Text>}
              description={
                <Space direction="vertical" size="small">
                  <Text type="secondary">
                    ${item.price.toLocaleString('es-CL')} x {item.quantity}
                  </Text>
                  {item.size && <Text type="secondary">Talla: {item.size}</Text>}
                  {item.color && <Text type="secondary">Color: {item.color}</Text>}
                </Space>
              }
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              <Text strong style={{ color: '#f33763' }}>
                ${(item.price * item.quantity).toLocaleString('es-CL')}
              </Text>
              {onRemoveItem && (
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => onRemoveItem(item)}
                  style={{ color: '#bbb', padding: '0 4px' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f33763'}
                  onMouseLeave={e => e.currentTarget.style.color = '#bbb'}
                />
              )}
            </div>
          </List.Item>
        )}
      />

      <Divider />

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text>Subtotal:</Text>
          <Text strong>${subtotal.toLocaleString('es-CL')}</Text>
        </div>

        {descuento > 0 && codigoAplicado && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Descuento <Text code style={{ fontSize: 12 }}>{codigoAplicado}</Text>:</Text>
            <Text strong style={{ color: '#52c41a' }}>
              -${descuento.toLocaleString('es-CL')}
            </Text>
          </div>
        )}

        {/* Barra progreso envío gratis */}
        {(() => {
          const falta = Math.max(0, MINIMO_ENVIO_GRATIS - subtotal);
          const pct = Math.min(100, Math.round((subtotal / MINIMO_ENVIO_GRATIS) * 100));
          return falta > 0 ? (
            <div style={{ background: '#fff8f9', border: '1px solid #ffd6e0', borderRadius: '10px', padding: '10px 14px' }}>
              <Text style={{ fontSize: '13px', color: '#555' }}>
                Agrega{' '}
                <Text strong style={{ color: '#f33763' }}>
                  ${falta.toLocaleString('es-CL')}
                </Text>
                {' '}más para conseguir <Text strong>envío gratis</Text>
              </Text>
              <Progress
                percent={pct}
                showInfo={false}
                strokeColor="#f33763"
                trailColor="#f0d0d8"
                size="small"
                style={{ marginTop: '6px', marginBottom: 0 }}
              />
            </div>
          ) : (
            <div style={{
              background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '10px',
              padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <CheckCircleFilled style={{ color: '#52c41a', fontSize: '16px' }} />
              <Text strong style={{ color: '#389e0d', fontSize: '13px' }}>
                ¡Tienes envío gratis en regiones seleccionadas!
              </Text>
            </div>
          );
        })()}

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text>Envío:</Text>
          <Text strong style={{ color: shipping === 0 ? '#52c41a' : '#000' }}>
            {shipping === 0 ? '¡GRATIS!' : `$${shipping.toLocaleString('es-CL')}`}
          </Text>
        </div>

       

        <Divider style={{ margin: '10px 0' }} />

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Title level={4} style={{ margin: 0 }}>Total:</Title>
          <Title level={3} style={{ margin: 0, color: '#f33763' }}>
            ${total.toLocaleString('es-CL')}
          </Title>
        </div>
      </Space>
    </Card>
  );
};

export default OrderSummary;