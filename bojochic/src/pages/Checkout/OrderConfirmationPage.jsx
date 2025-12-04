// src/pages/OrderConfirmationPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Result, Button, Descriptions, List, Typography, Space, Divider, Alert } from 'antd';
import { 
  CheckCircleOutlined, 
  HomeOutlined, 
  PrinterOutlined,
  DownloadOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    // Obtener datos de la orden desde el state de navegación
    if (location.state?.orden) {
      setOrderData(location.state.orden);
    } else {
      // Si no hay datos, redirigir al home
      navigate('/');
    }
  }, [location, navigate]);

  if (!orderData) {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '50px auto', 
      padding: '0 20px',
      minHeight: '70vh'
    }}>
      <Card>
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          title="¡Pedido Confirmado Exitosamente!"
          subTitle={
            <Space direction="vertical" size="small">
              <Text strong style={{ fontSize: '16px' }}>
                Número de Orden: {orderData.orderId}
              </Text>
              <Text type="secondary">
                Hemos recibido tu pedido. Te enviaremos las instrucciones de pago a tu correo.
              </Text>
            </Space>
          }
        />

        <Divider />

        {/* Información del cliente */}
        <Title level={4}>Datos de Envío</Title>
        <Descriptions bordered column={1} style={{ marginBottom: '24px' }}>
          <Descriptions.Item label="Nombre">
            {orderData.customerInfo.nombre}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {orderData.customerInfo.email}
          </Descriptions.Item>
          <Descriptions.Item label="Teléfono">
            {orderData.customerInfo.telefono}
          </Descriptions.Item>
          <Descriptions.Item label="Dirección">
            {orderData.customerInfo.direccion}
          </Descriptions.Item>
          <Descriptions.Item label="Comuna">
            {orderData.customerInfo.comuna}
          </Descriptions.Item>
          <Descriptions.Item label="Región">
            {orderData.customerInfo.region}
          </Descriptions.Item>
          {orderData.customerInfo.notas && (
            <Descriptions.Item label="Notas">
              {orderData.customerInfo.notas}
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Productos del pedido */}
        <Title level={4}>Detalle del Pedido</Title>
        <List
          itemLayout="horizontal"
          dataSource={orderData.items}
          style={{ marginBottom: '24px' }}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{ 
                      width: 80, 
                      height: 80, 
                      objectFit: 'cover', 
                      borderRadius: '8px' 
                    }}
                  />
                }
                title={<Text strong>{item.name}</Text>}
                description={
                  <Space direction="vertical" size="small">
                    <Text type="secondary">
                      Precio: ${item.price.toLocaleString('es-CL')}
                    </Text>
                    <Text type="secondary">Cantidad: {item.quantity}</Text>
                    {item.size && <Text type="secondary">Talla: {item.size}</Text>}
                    {item.color && <Text type="secondary">Color: {item.color}</Text>}
                  </Space>
                }
              />
              <div>
                <Text strong style={{ fontSize: '16px', color: '#DE0797' }}>
                  ${(item.price * item.quantity).toLocaleString('es-CL')}
                </Text>
              </div>
            </List.Item>
          )}
        />

        {/* Resumen de totales */}
        <Card 
          style={{ 
            background: '#f5f5f5', 
            marginBottom: '24px' 
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Subtotal:</Text>
              <Text strong>${orderData.subtotal.toLocaleString('es-CL')}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Envío:</Text>
              <Text strong style={{ color: orderData.shipping === 0 ? '#52c41a' : '#000' }}>
                {orderData.shipping === 0 ? '¡GRATIS!' : `$${orderData.shipping.toLocaleString('es-CL')}`}
              </Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0 }}>Total:</Title>
              <Title level={3} style={{ margin: 0, color: '#DE0797' }}>
                ${orderData.total.toLocaleString('es-CL')}
              </Title>
            </div>
          </Space>
        </Card>

        {/* Instrucciones de pago */}
        <Alert
          message="Instrucciones de Pago"
          description={
            <Space direction="vertical" style={{ width: '100%' }}>
              <Paragraph>
                Para completar tu pedido, realiza una transferencia bancaria con los siguientes datos:
              </Paragraph>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Banco">
                  <strong>Banco Estado</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Tipo de Cuenta">
                  <strong>Cuenta Corriente</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Número de Cuenta">
                  <strong>123456789</strong>
                </Descriptions.Item>
                <Descriptions.Item label="RUT">
                  <strong>12.345.678-9</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Nombre">
                  <strong>Bojo Chic SpA</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <strong>ventas@bojochic.cl</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Monto a Transferir">
                  <strong style={{ color: '#DE0797', fontSize: '16px' }}>
                    ${orderData.total.toLocaleString('es-CL')}
                  </strong>
                </Descriptions.Item>
                <Descriptions.Item label="Referencia">
                  <strong>{orderData.orderId}</strong>
                </Descriptions.Item>
              </Descriptions>
              <Alert
                type="warning"
                message="Importante"
                description={
                  <>
                    <Text>
                      • Por favor incluye tu <strong>número de orden ({orderData.orderId})</strong> en la descripción de la transferencia.
                    </Text>
                    <br />
                    <Text>
                      • Envía el comprobante de pago a <strong>ventas@bojochic.cl</strong>
                    </Text>
                    <br />
                    <Text>
                      • Una vez confirmado el pago, procesaremos tu pedido en 24-48 horas.
                    </Text>
                  </>
                }
                showIcon
              />
            </Space>
          }
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        {/* Botones de acción */}
        <Space style={{ width: '100%', justifyContent: 'center' }} size="middle">
          <Button 
            type="primary" 
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            size="large"
          >
            Imprimir
          </Button>
          
          <Button 
            icon={<DownloadOutlined />}
            size="large"
          >
            Descargar PDF
          </Button>

          <Button 
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            size="large"
          >
            Volver al Inicio
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default OrderConfirmationPage;