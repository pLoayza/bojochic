import { Layout, Typography } from 'antd';
import { useEffect } from 'react';
import { 
  SwapOutlined,
  DollarOutlined,
  SendOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const Reembolso = () => {
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
          Política de Reembolso
        </Title>
        
        <Paragraph style={{ 
          textAlign: 'center', 
          fontSize: '16px',
          color: '#666',
          marginBottom: '50px'
        }}>
          En Bojo queremos que estés feliz con tu compra. Si algo no resultó como esperabas, puedes solicitar un cambio o devolución de manera sencilla.
        </Paragraph>

        <Paragraph style={{ 
          textAlign: 'center', 
          fontSize: '15px',
          color: '#555',
          marginBottom: '50px',
          fontWeight: '500'
        }}>
          A continuación, te explicamos cómo funciona 👇
        </Paragraph>

        {/* Cambios */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <SwapOutlined /> Cambios
          </Title>
          <ul style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            paddingLeft: '20px'
          }}>
            <li>Puedes solicitar un cambio dentro de los <strong>10 días</strong> desde que recibes tu pedido.</li>
            <li>El artículo debe estar <strong>sin uso</strong>, en perfecto estado y con su empaque original.</li>
            <li>El cliente cubre los costos de envío (ida y vuelta).</li>
            <li>Si necesitas un segundo cambio, los gastos de envío correrán por cuenta del cliente (ida y vuelta).</li>
            <li>El tiempo de entrega puede variar dependiendo de tu comuna o región.</li>
          </ul>
        </div>

        {/* Devoluciones y Reembolsos */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <DollarOutlined /> Devoluciones y Reembolsos
          </Title>
          <ul style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            paddingLeft: '20px'
          }}>
            <li>Puedes solicitar una devolución dentro de los <strong>10 días</strong> desde la recepción del producto.</li>
            <li>El cliente cubre los costos de envío (ida y vuelta).</li>
            <li>El reembolso corresponde únicamente al <strong>valor del producto</strong>, no incluye el costo de despacho original.</li>
            <li>Además, se descontará un <strong>4%</strong> correspondiente a la comisión del medio de pago utilizado.</li>
            <li>Los artículos deben devolverse sin uso, en buen estado y con su empaque original.</li>
            <li>No se aceptan devoluciones de productos usados.</li>
          </ul>
        </div>

        {/* Cómo solicitar */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <SendOutlined /> ¿Cómo solicitar un cambio o devolución?
          </Title>
          <Paragraph style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            marginBottom: '15px'
          }}>
            Escríbenos al WhatsApp{' '}
            <a 
              href="https://wa.me/56989058379" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: ' #f33763', fontWeight: '600' }}
            >
              +56 9 8905 8379
            </a>
            {' '}indicando:
          </Paragraph>
          <ul style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            paddingLeft: '20px'
          }}>
            <li>Número de pedido</li>
            <li>Motivo del cambio o devolución</li>
          </ul>
          <Paragraph style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            marginTop: '15px'
          }}>
            Nuestro equipo revisará tu solicitud y te responderá a la brevedad para coordinar el proceso 🖤
          </Paragraph>
        </div>

        {/* Información importante */}
        <div style={{ 
          background: '#FFF5FC', 
          border: '1px solid #FFD6F0',
          borderRadius: '8px',
          padding: '25px',
          marginBottom: '40px'
        }}>
          <Title level={3} style={{ 
            color: ' #f33763', 
            fontSize: '18px',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <InfoCircleOutlined /> Información Importante
          </Title>
          <ul style={{ 
            fontSize: '14px', 
            lineHeight: '1.8',
            color: '#555',
            paddingLeft: '20px',
            marginBottom: '0'
          }}>
            <li>Los plazos de 10 días se cuentan desde la <strong>recepción del producto</strong>.</li>
            <li>Los productos deben estar en <strong>perfecto estado</strong> para ser aceptados.</li>
            <li>El cliente asume los costos de envío en cambios y devoluciones.</li>
            <li>Los reembolsos se procesan una vez que el producto es recibido y verificado.</li>
          </ul>
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

export default Reembolso;