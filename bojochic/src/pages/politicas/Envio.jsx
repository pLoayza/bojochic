import { Layout, Typography } from 'antd';
import { useEffect } from 'react';
import { 
  TruckOutlined, 
  ClockCircleOutlined, 
  GiftOutlined, 
  EnvironmentOutlined,
  ReloadOutlined,
  SearchOutlined 
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const Envio = () => {
  // Forzar scroll al inicio cuando se carga la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Content style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        padding: '60px 20px',
      }}>
        <Title level={1} style={{ 
          textAlign: 'center', 
          color: '#333',
          marginBottom: '15px',
          fontSize: '36px'
        }}>
          Política de Envío
        </Title>
        
        <Paragraph style={{ 
          textAlign: 'center', 
          fontSize: '16px',
          color: '#666',
          marginBottom: '50px'
        }}>
          En Bojo nos preocupamos de que tu pedido llegue en perfectas condiciones y dentro de los plazos establecidos 🖤
        </Paragraph>

        {/* Despachos */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: '#DE0797', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <TruckOutlined /> Despachos
          </Title>
          <ul style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            paddingLeft: '20px'
          }}>
            <li>Realizamos envíos a todo Chile a través de empresas de courier externas.</li>
            <li>Los tiempos de entrega pueden variar según tu comuna o región, pero en promedio:</li>
            <ul style={{ marginTop: '10px', marginBottom: '10px' }}>
              <li><strong>Región Metropolitana:</strong> 1 a 4 días hábiles.</li>
              <li><strong>Regiones:</strong> 2 a 7 días hábiles.</li>
            </ul>
            <li>Los plazos comienzan a correr desde que el pedido es confirmado y despachado (no desde la compra).</li>
          </ul>
        </div>

        {/* Procesamiento del Pedido */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: '#DE0797', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ClockCircleOutlined /> Procesamiento del Pedido
          </Title>
          <ul style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            paddingLeft: '20px'
          }}>
            <li>El tiempo de preparación es de <strong>24 a 48 horas hábiles</strong>, dependiendo del volumen de pedidos y disponibilidad de stock.</li>
            <li>Una vez despachado, recibirás un correo de confirmación con el número de seguimiento para que puedas monitorear tu entrega en línea.</li>
          </ul>
        </div>

        {/* Envío Gratuito y Pagado */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: '#DE0797', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <GiftOutlined /> Envío Gratuito y Pagado
          </Title>
          <ul style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            paddingLeft: '20px'
          }}>
            <li>Ofrecemos envío gratuito en compras desde un monto mínimo (cuando esté disponible en promociones activas).</li>
            <li>En compras con envío pagado, el costo se calcula automáticamente en el checkout según la dirección de entrega.</li>
          </ul>
        </div>

        {/* Importante */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: '#DE0797', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <EnvironmentOutlined /> Importante
          </Title>
          <ul style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            paddingLeft: '20px'
          }}>
            <li>La responsabilidad del transporte recae en la empresa de courier una vez que el pedido ha sido entregado a ellos.</li>
            <li>Si la empresa de transporte presenta demoras, pérdida o problemas con la entrega, te ayudaremos a gestionar la incidencia con el courier.</li>
            <li>Asegúrate de ingresar correctamente tus datos de envío (nombre, dirección y número de contacto) para evitar retrasos.</li>
          </ul>
        </div>

        {/* Envíos Devueltos */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: '#DE0797', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ReloadOutlined /> Envíos Devueltos
          </Title>
          <ul style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            paddingLeft: '20px'
          }}>
            <li>Si el pedido es devuelto por dirección incorrecta, ausencia en el domicilio u otros motivos ajenos a Bojo, el cliente deberá pagar un nuevo envío para el reenvío del paquete.</li>
          </ul>
        </div>

        {/* Seguimiento */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: '#DE0797', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <SearchOutlined /> Seguimiento
          </Title>
          <Paragraph style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
          }}>
            Puedes hacer seguimiento de tu pedido desde el correo que recibirás una vez que esté en camino. 
            Si tienes dudas, escríbenos al WhatsApp{' '}
            <a 
              href="https://wa.me/56989058379" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#DE0797', fontWeight: '600' }}
            >
              +56 9 8905 8379
            </a>
          </Paragraph>
        </div>

        {/* Divider final */}
        <div style={{ 
          borderTop: '1px solid #e0e0e0', 
          paddingTop: '30px',
          marginTop: '50px',
          textAlign: 'center'
        }}>
          <Text style={{ color: '#999', fontSize: '14px' }}>
            Última actualización: Febrero 2026
          </Text>
        </div>
      </Content>
    </Layout>
  );
};

export default Envio;