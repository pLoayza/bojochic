import { Layout, Typography } from 'antd';
import { useEffect } from 'react';
import { 
  FileTextOutlined,
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  CarOutlined,
  CopyrightOutlined,
  ToolOutlined,
  LinkOutlined,
  SafetyOutlined,
  MessageOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  SolutionOutlined,
  GlobalOutlined,
  MailOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const Terminos = () => {
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
          marginBottom: '50px',
          fontSize: '36px'
        }}>
          Términos de Servicio
        </Title>

        {/* Descripción General */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FileTextOutlined /> Descripción General
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Le damos la bienvenida a Bojo. Los términos "nosotros" y "nuestro(s)/nuestra(s)" hacen referencia a Bojo. Bojo opera esta tienda y sitio web, incluida toda la información, el contenido, las funciones, las herramientas, los productos y los servicios para brindarle a usted, el cliente, una experiencia de compra seleccionada (los "Servicios").
          </Paragraph>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Al ver nuestros Servicios, interactuar con ellos o utilizarlos, acepta cumplir con estos Términos del servicio y nuestra{' '}
            <Link to="/politicas/privacidad" style={{ color: ' #f33763', fontWeight: '600' }}>
              Política de privacidad
            </Link>
            . Si no acepta estos Términos del servicio ni la Política de privacidad, no debe utilizar nuestros Servicios.
          </Paragraph>
        </div>

        {/* Sección 1: Acceso y Cuenta */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <UserOutlined /> Sección 1: Acceso y Cuenta
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Al aceptar estos Términos del servicio, usted declara que tiene al menos la mayoría de edad prevista en el estado o la provincia en los que reside.
          </Paragraph>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Para utilizar los servicios, es posible que se le soliciten determinados datos, como su dirección de correo electrónico, dirección de facturación, forma de pago y dirección de envío. Usted declara y garantiza que toda la información que brinda es correcta, actual y completa.
          </Paragraph>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Usted es exclusivamente responsable de preservar la seguridad de las credenciales de su cuenta. No podrá transferir, vender ni asignar su cuenta a otra persona.
          </Paragraph>
        </div>

        {/* Sección 2: Nuestros Productos */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ShoppingOutlined /> Sección 2: Nuestros Productos
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Hemos realizado todos los esfuerzos posibles para ofrecer una representación precisa de nuestros productos en nuestras tiendas online. Sin embargo, los colores o el aspecto del producto pueden diferir debido al tipo de dispositivo que utilice.
          </Paragraph>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Nos reservamos el derecho de discontinuar cualquier producto en cualquier momento, y podemos limitar las cantidades de los productos que ofrezcamos.
          </Paragraph>
        </div>

        {/* Sección 3: Pedidos */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ShoppingOutlined /> Sección 3: Pedidos
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Cuando hace un pedido, realiza una oferta de compra. Bojo se reserva el derecho de aceptar o rechazar su pedido por cualquier motivo. Su pedido no se aceptará hasta que Bojo confirme la aceptación.
          </Paragraph>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Sus compras están sujetas a devoluciones o cambio únicamente conforme a nuestra{' '}
            <Link to="/politicas/reembolso" style={{ color: ' #f33763', fontWeight: '600' }}>
              Política de reembolso
            </Link>
            .
          </Paragraph>
        </div>

        {/* Sección 4: Precios y Facturación */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <DollarOutlined /> Sección 4: Precios y Facturación
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Los precios, los descuentos y las promociones están sujetos a cambios sin previo aviso. El precio cobrado será el que tenga efecto en el momento en que se haga el pedido.
          </Paragraph>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Para todas las compras, usted acepta brindar información actual, completa y precisa sobre compras, pagos y cuentas. Usted declara y garantiza que la información de la tarjeta de crédito que brindó es verdadera, correcta y completa.
          </Paragraph>
        </div>

        {/* Sección 5: Envío y Entrega */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <CarOutlined /> Sección 5: Envío y Entrega
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            No nos responsabilizamos por las demoras en envíos y entregas. Todos los tiempos de entrega están sujetos únicamente a estimaciones y no se garantizan. Una vez que entregamos los productos a la empresa de transportes, la titularidad y el riesgo pasan a estar en manos de usted.
          </Paragraph>
        </div>

        {/* Sección 6: Propiedad Intelectual */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <CopyrightOutlined /> Sección 6: Propiedad Intelectual
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Nuestros Servicios, incluidas las marcas registradas, marcas, texto, imágenes, gráficos, video y audio, son propiedad de Bojo y están protegidos por legislaciones sobre derechos de autor y propiedad intelectual.
          </Paragraph>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Estos términos le permiten utilizar los Servicios únicamente para fines personales y no comerciales. No debe reproducir, distribuir, modificar o volver a publicar el material sin previo consentimiento por escrito.
          </Paragraph>
        </div>

        {/* Sección 7: Herramientas Opcionales */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ToolOutlined /> Sección 7: Herramientas Opcionales
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Es posible que se le brinde acceso a herramientas de terceros. Usted reconoce y acepta que brindamos acceso a dichas herramientas "tal como están" y "según estén disponibles" sin garantías.
          </Paragraph>
        </div>

        {/* Sección 8: Enlaces de Terceros */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <LinkOutlined /> Sección 8: Enlaces de Terceros
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Los Servicios pueden contener hipervínculos a sitios web provistos por terceros. No nos responsabilizamos por la precisión de los materiales o sitios web de terceros. Revise detenidamente las políticas de terceros antes de realizar cualquier transacción.
          </Paragraph>
        </div>

        {/* Sección 9: Política de Privacidad */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <SafetyOutlined /> Sección 9: Política de Privacidad
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Toda la información personal que recopilamos está sujeta a nuestra{' '}
            <Link to="/politicas/privacidad" style={{ color: ' #f33763', fontWeight: '600' }}>
              Política de privacidad
            </Link>
            . Al utilizar los Servicios, usted reconoce que leyó esta política.
          </Paragraph>
        </div>

        {/* Sección 10: Comentarios */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <MessageOutlined /> Sección 10: Comentarios
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Si envía ideas, sugerencias, comentarios o reseñas, nos otorga una licencia perpetua para utilizar, reproducir, modificar y distribuir dichos Comentarios. Podemos supervisar, editar o eliminar Comentarios que determinemos sean ilegales, ofensivos o inapropiados.
          </Paragraph>
        </div>

        {/* Sección 11: Errores e Imprecisiones */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <WarningOutlined /> Sección 11: Errores, Imprecisiones y Omisiones
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Puede haber información que contenga errores tipográficos o imprecisiones. Nos reservamos el derecho a corregir cualquier error y actualizar información o cancelar pedidos en cualquier momento sin previo aviso.
          </Paragraph>
        </div>

        {/* Sección 12: Usos Prohibidos */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <StopOutlined /> Sección 12: Usos Prohibidos
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555', marginBottom: '15px' }}>
            Usted no podrá acceder a los Servicios ni utilizarlos para:
          </Paragraph>
          <ul style={{ fontSize: '15px', lineHeight: '1.8', color: '#555', paddingLeft: '20px' }}>
            <li>Fines ilegales o malintencionados</li>
            <li>Violar normativas, leyes u ordenanzas</li>
            <li>Infringir derechos de propiedad intelectual</li>
            <li>Acosar, insultar o difamar a empleados u otras personas</li>
            <li>Transmitir información falsa o engañosa</li>
            <li>Enviar correo basura o spam</li>
            <li>Usurpar la identidad de cualquier persona o entidad</li>
          </ul>
        </div>

        {/* Sección 13: Rescisión */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <CloseCircleOutlined /> Sección 13: Rescisión
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Podemos rescindir este acuerdo o interrumpir su acceso a los Servicios a nuestra entera discreción en cualquier momento sin previo aviso.
          </Paragraph>
        </div>

        {/* Sección 14: Descargo de Responsabilidad */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ExclamationCircleOutlined /> Sección 14: Descargo de Responsabilidad de Garantías
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Los Servicios y productos se proporcionan "TAL COMO ESTÁN" y "SEGÚN ESTÉN DISPONIBLES" sin garantías de ninguna clase. No garantizamos que los Servicios sean ininterrumpidos, oportunos, seguros o libres de errores.
          </Paragraph>
        </div>

        {/* Sección 15: Limitación de Responsabilidad */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ExclamationCircleOutlined /> Sección 15: Limitación de Responsabilidad
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Bajo ninguna circunstancia Bojo tendrá responsabilidad por daños directos, indirectos, fortuitos o resultantes que surjan del uso de los Servicios.
          </Paragraph>
        </div>

        {/* Sección 16: Indemnización */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <SolutionOutlined /> Sección 16: Indemnización
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Usted acepta indemnizar y eximir de responsabilidad a Bojo ante cualquier pérdida o reclamación como consecuencia del incumplimiento de estos Términos o la violación de cualquier ley.
          </Paragraph>
        </div>

        {/* Sección 20: Legislación Vigente */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <GlobalOutlined /> Sección 20: Legislación Vigente
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Los presentes Términos se deberán regir e interpretar en virtud de los tribunales de la jurisdicción a la que pertenece Bojo.
          </Paragraph>
        </div>

        {/* Sección 22: Cambios en los Términos */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FileTextOutlined /> Sección 22: Cambios en los Términos del Servicio
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Nos reservamos el derecho a actualizar o modificar estos Términos. El uso continuo de los Servicios después de cualquier modificación implica la aceptación de dichas modificaciones.
          </Paragraph>
        </div>

        {/* Sección 23: Contacto */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ 
            color: ' #f33763', 
            fontSize: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <MailOutlined /> Sección 23: Información de Contacto
          </Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
            Debe enviarnos cualquier pregunta acerca de los Términos del servicio a{' '}
            <a 
              href="mailto:bohochicchile@gmail.com"
              style={{ color: ' #f33763', fontWeight: '600' }}
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
            Última actualización: Febrero 2026
          </Text>
        </div>
      </Content>
    </Layout>
  );
};

export default Terminos;