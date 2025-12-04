
import { Card, List, Typography, Space, Divider, Alert } from 'antd';

const { Title, Text } = Typography;

const OrderSummary = ({ cartItems, subtotal, shipping, total }) => {
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
            <div>
              <Text strong style={{ color: '#DE0797' }}>
                ${(item.price * item.quantity).toLocaleString('es-CL')}
              </Text>
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

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text>Envío:</Text>
          <Text strong style={{ color: shipping === 0 ? '#52c41a' : '#000' }}>
            {shipping === 0 ? '¡GRATIS!' : `$${shipping.toLocaleString('es-CL')}`}
          </Text>
        </div>

        {subtotal < 20000 && subtotal > 0 && (
          <Alert
            message={`Te faltan $${(20000 - subtotal).toLocaleString('es-CL')} para envío gratis`}
            type="warning"
            showIcon
            style={{ fontSize: '12px' }}
          />
        )}

        <Divider style={{ margin: '10px 0' }} />

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Title level={4} style={{ margin: 0 }}>Total:</Title>
          <Title level={3} style={{ margin: 0, color: '#DE0797' }}>
            ${total.toLocaleString('es-CL')}
          </Title>
        </div>
      </Space>
    </Card>
  );
};

export default OrderSummary;
