import { Layout, Typography } from 'antd';
import { useEffect } from 'react';
import { 
  SafetyOutlined,
  FileProtectOutlined,
  UserOutlined,
  LockOutlined,
  GlobalOutlined,
  MailOutlined,
  BellOutlined,
  TeamOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const Privacidad = () => {
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
          Política de Privacidad
        </Title>
        
        <Paragraph style={{ 
          textAlign: 'center', 
          fontSize: '14px',
          color: '#999',
          marginBottom: '50px'
        }}>
          Última actualización: 28 de enero del 2026
        </Paragraph>

        {/* Introducción */}
        <Paragraph style={{ 
          fontSize: '15px', 
          lineHeight: '1.8',
          color: '#555',
          marginBottom: '40px'
        }}>
          Bojo gestiona esta tienda y este sitio web, incluidos los datos, el contenido, las funciones, las herramientas, los productos y los servicios para ofrecerle a usted, el cliente, una experiencia de compra seleccionada (los "Servicios").
        </Paragraph>

        <Paragraph style={{ 
          fontSize: '15px', 
          lineHeight: '1.8',
          color: '#555',
          marginBottom: '40px'
        }}>
          Esta Política de privacidad describe cómo recopilamos, utilizamos y divulgamos su información personal cuando visita, utiliza o realiza una compra u otra transacción a través de los Servicios o cuando se comunica con nosotros por cualquier otro medio.
        </Paragraph>

        {/* Información personal que recopilamos */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: '#DE0797', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <UserOutlined /> Información Personal que Recopilamos
          </Title>
          <Paragraph style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            marginBottom: '20px'
          }}>
            Cuando utilizamos el término "información personal", nos referimos a cualquier dato que le identifique o que pueda vincularse razonablemente con usted. Podemos recopilar las siguientes categorías de información personal:
          </Paragraph>
          <ul style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            paddingLeft: '20px'
          }}>
            <li><strong>Detalles de contacto:</strong> nombre, dirección, dirección de facturación, dirección de envío, número de teléfono y dirección de correo electrónico.</li>
            <li><strong>Información financiera:</strong> números de tarjeta de crédito, tarjeta de débito, información de cuentas financieras, detalles de transacciones y forma de pago.</li>
            <li><strong>Información de la cuenta:</strong> nombre de usuario, contraseña, preguntas de seguridad, preferencias y configuración.</li>
            <li><strong>Información sobre transacciones:</strong> artículos que consulta, añade al carrito, guarda en su lista de deseos o compra, así como devoluciones y cambios.</li>
            <li><strong>Comunicaciones con nosotros:</strong> información que nos facilite en sus comunicaciones, como al enviar una reclamación al servicio de atención al cliente.</li>
            <li><strong>Información del dispositivo:</strong> información sobre su dispositivo, navegador, conexión de red y dirección IP.</li>
            <li><strong>Información sobre el uso:</strong> información relativa a su interacción con los Servicios.</li>
          </ul>
        </div>

        {/* Fuentes de información */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: '#DE0797', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FileProtectOutlined /> Fuentes de Información Personal
          </Title>
          <Paragraph style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            marginBottom: '15px'
          }}>
            Podemos recopilar información personal de las siguientes fuentes:
          </Paragraph>
          <ul style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            paddingLeft: '20px'
          }}>
            <li><strong>Directamente de usted:</strong> cuando crea una cuenta, visita o utiliza los Servicios, o se comunica con nosotros.</li>
            <li><strong>Automáticamente:</strong> mediante el uso de cookies y tecnologías similares cuando visita nuestros sitios web.</li>
            <li><strong>De nuestros proveedores de servicios:</strong> cuando recopilan o tratan su información personal en nuestro nombre.</li>
            <li><strong>De nuestros partners o terceros.</strong></li>
          </ul>
        </div>

        {/* Cómo utilizamos su información */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: '#DE0797', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <SafetyOutlined /> Cómo Utilizamos su Información Personal
          </Title>
          <ul style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            paddingLeft: '20px'
          }}>
            <li><strong>Prestar, personalizar y mejorar los Servicios:</strong> procesar pagos, gestionar pedidos, recordar preferencias, crear y mantener su cuenta, organizar envíos y ofrecerle una experiencia de compra personalizada.</li>
            <li><strong>Marketing y publicidad:</strong> enviarle comunicaciones comerciales por correo electrónico, mensaje de texto o correo postal, y mostrarle anuncios en línea.</li>
            <li><strong>Seguridad y prevención de fraudes:</strong> autenticar su cuenta, detectar actividades fraudulentas y proteger la seguridad de nuestros servicios.</li>
            <li><strong>Comunicaciones con usted:</strong> ofrecerle atención al cliente y responder a sus solicitudes.</li>
            <li><strong>Motivos legales:</strong> cumplir con la legislación aplicable y responder a procedimientos legales.</li>
          </ul>
        </div>

        {/* Cómo divulgamos la información */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: '#DE0797', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <TeamOutlined /> Cómo Divulgamos la Información Personal
          </Title>
          <Paragraph style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            marginBottom: '15px'
          }}>
            En determinadas circunstancias, podemos divulgar su información personal a terceros:
          </Paragraph>
          <ul style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            paddingLeft: '20px'
          }}>
            <li>Con proveedores y otros terceros que prestan servicios en nuestro nombre (gestión de TI, procesamiento de pagos, atención al cliente, gestión de pedidos y envíos).</li>
            <li>Con partners comerciales y de marketing para prestar servicios de marketing y publicidad.</li>
            <li>Cuando usted nos lo indique, lo solicite o consienta la divulgación.</li>
            <li>Con nuestros afiliados o dentro de nuestro grupo empresarial.</li>
            <li>En relación con transacciones comerciales, fusiones o para cumplir con obligaciones legales.</li>
          </ul>
        </div>

        {/* Sitios web de terceros */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: '#DE0797', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <GlobalOutlined /> Sitios Web y Enlaces de Terceros
          </Title>
          <Paragraph style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
          }}>
            Los Servicios pueden incluir enlaces a sitios web gestionados por terceros. Le recomendamos que revise sus políticas de privacidad y seguridad. No garantizamos ni nos hacemos responsables de la privacidad o seguridad de dichos sitios.
          </Paragraph>
        </div>

        {/* Datos de menores */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: '#DE0797', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <LockOutlined /> Datos de Menores
          </Title>
          <Paragraph style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
          }}>
            Los Servicios no están destinados a ser utilizados por menores, y no recopilamos conscientemente información personal de menores de edad. Si usted es padre, madre o tutor legal de un menor que nos haya facilitado su información personal, puede ponerse en contacto con nosotros para solicitar su eliminación.
          </Paragraph>
        </div>

        {/* Seguridad y retención */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: '#DE0797', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <SafetyOutlined /> Seguridad y Retención
          </Title>
          <Paragraph style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
          }}>
            Ninguna medida de seguridad es perfecta o infalible. Le recomendamos que no utilice canales no seguros para enviarnos información sensible. El tiempo durante el cual conservamos su información personal depende de varios factores, como la necesidad de mantener su cuenta, prestarle los Servicios y cumplir con obligaciones legales.
          </Paragraph>
        </div>

        {/* Sus derechos */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: '#DE0797', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FileProtectOutlined /> Sus Derechos y Opciones
          </Title>
          <Paragraph style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            marginBottom: '15px'
          }}>
            Según el lugar en el que resida, puede tener los siguientes derechos:
          </Paragraph>
          <ul style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
            paddingLeft: '20px'
          }}>
            <li><strong>Derecho de acceso:</strong> solicitar acceso a la información personal que conservamos sobre usted.</li>
            <li><strong>Derecho de supresión:</strong> solicitarnos la supresión de su información personal.</li>
            <li><strong>Derecho de rectificación:</strong> solicitar que rectifiquemos la información personal inexacta.</li>
            <li><strong>Derecho a la portabilidad:</strong> recibir una copia de su información personal.</li>
            <li><strong>Gestión de preferencias de comunicación:</strong> optar por no recibir correos electrónicos promocionales.</li>
          </ul>
        </div>

        {/* Transferencias internacionales */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: '#DE0797', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <GlobalOutlined /> Transferencias Internacionales
          </Title>
          <Paragraph style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
          }}>
            Podemos transferir, almacenar y tratar su información personal fuera del país en el que reside, utilizando mecanismos de transferencia reconocidos como las cláusulas contractuales estándar.
          </Paragraph>
        </div>

        {/* Cambios en la política */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: '#DE0797', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <BellOutlined /> Cambios en esta Política
          </Title>
          <Paragraph style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
          }}>
            Podemos actualizar esta Política de privacidad ocasionalmente. Publicaremos la versión actualizada en este sitio web y notificaremos los cambios conforme a lo exigido por la legislación aplicable.
          </Paragraph>
        </div>

        {/* Contacto */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: '#DE0797', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <MailOutlined /> Contacto
          </Title>
          <Paragraph style={{ 
            fontSize: '15px', 
            lineHeight: '1.8',
            color: '#555',
          }}>
            Si tiene alguna pregunta contáctenos a{' '}
            <a 
              href="mailto:bohochicchile@gmail.com"
              style={{ color: '#DE0797', fontWeight: '600' }}
            >
              bohochicchile@gmail.com
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
            Última actualización: 28 de enero del 2026
          </Text>
        </div>
      </Content>
    </Layout>
  );
};

export default Privacidad;