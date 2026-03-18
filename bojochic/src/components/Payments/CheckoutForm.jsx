import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Row, Col, Alert, Typography, message, Select } from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  HomeOutlined,
  EnvironmentOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { auth } from '../../firebase/config';

const { Title } = Typography;
const { Option } = Select;

const REGIONES_COMUNAS = {
  'Arica y Parinacota': ['Arica', 'Camarones', 'Putre', 'General Lagos'],
  'Tarapacá': ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Camiña', 'Colchane', 'Huara', 'Pica'],
  'Antofagasta': ['Antofagasta', 'Mejillones', 'Sierra Gorda', 'Taltal', 'Calama', 'Ollagüe', 'San Pedro de Atacama', 'Tocopilla', 'María Elena'],
  'Atacama': ['Copiapó', 'Caldera', 'Tierra Amarilla', 'Chañaral', 'Diego de Almagro', 'Vallenar', 'Alto del Carmen', 'Freirina', 'Huasco'],
  'Coquimbo': ['La Serena', 'Coquimbo', 'Andacollo', 'La Higuera', 'Paiguano', 'Vicuña', 'Illapel', 'Canela', 'Los Vilos', 'Salamanca', 'Ovalle', 'Combarbalá', 'Monte Patria', 'Punitaqui', 'Río Hurtado'],
  'Valparaíso': ['Valparaíso', 'Casablanca', 'Concón', 'Juan Fernández', 'Puchuncaví', 'Quintero', 'Viña del Mar', 'Isla de Pascua', 'Los Andes', 'Calle Larga', 'Rinconada', 'San Esteban', 'La Ligua', 'Cabildo', 'Papudo', 'Petorca', 'Zapallar', 'Quillota', 'Calera', 'Hijuelas', 'La Cruz', 'Nogales', 'San Antonio', 'Algarrobo', 'Cartagena', 'El Quisco', 'El Tabo', 'Santo Domingo', 'San Felipe', 'Catemu', 'Llaillay', 'Panquehue', 'Putaendo', 'Santa María', 'Quilpué', 'Limache', 'Olmué', 'Villa Alemana'],
  'Metropolitana': ['Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central', 'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Joaquín', 'San Miguel', 'San Ramón', 'Santiago', 'Vitacura', 'Puente Alto', 'Pirque', 'San José de Maipo', 'Colina', 'Lampa', 'Tiltil', 'San Bernardo', 'Buin', 'Calera de Tango', 'Paine', 'Melipilla', 'Alhué', 'Curacaví', 'María Pinto', 'San Pedro', 'Talagante', 'El Monte', 'Isla de Maipo', 'Padre Hurtado', 'Peñaflor'],
  'O\'Higgins': ['Rancagua', 'Codegua', 'Coinco', 'Coltauco', 'Doñihue', 'Graneros', 'Las Cabras', 'Machalí', 'Malloa', 'Mostazal', 'Olivar', 'Peumo', 'Pichidegua', 'Quinta de Tilcoco', 'Rengo', 'Requínoa', 'San Vicente', 'Pichilemu', 'La Estrella', 'Litueche', 'Marchihue', 'Navidad', 'Paredones', 'San Fernando', 'Chépica', 'Chimbarongo', 'Lolol', 'Nancagua', 'Palmilla', 'Peralillo', 'Placilla', 'Pumanque', 'Santa Cruz'],
  'Maule': ['Talca', 'Constitución', 'Curepto', 'Empedrado', 'Maule', 'Pelarco', 'Pencahue', 'Río Claro', 'San Clemente', 'San Rafael', 'Cauquenes', 'Chanco', 'Pelluhue', 'Curicó', 'Hualañé', 'Licantén', 'Molina', 'Rauco', 'Romeral', 'Sagrada Familia', 'Teno', 'Vichuquén', 'Linares', 'Colbún', 'Longaví', 'Parral', 'Retiro', 'San Javier', 'Villa Alegre', 'Yerbas Buenas'],
  'Ñuble': ['Chillán', 'Bulnes', 'Chillán Viejo', 'El Carmen', 'Pemuco', 'Petorca', 'Pinto', 'Quillón', 'San Ignacio', 'Yungay', 'Cobquecura', 'Coelemu', 'Ninhue', 'Portezuelo', 'Quirihue', 'Ránquil', 'Trehuaco', 'San Carlos', 'Coihueco', 'Ñiquén', 'San Fabián', 'San Nicolás'],
  'Biobío': ['Concepción', 'Coronel', 'Chiguayante', 'Florida', 'Hualqui', 'Lota', 'Penco', 'San Pedro de la Paz', 'Santa Juana', 'Talcahuano', 'Tomé', 'Hualpén', 'Lebu', 'Arauco', 'Cañete', 'Contulmo', 'Curanilahue', 'Los Álamos', 'Tirúa', 'Los Ángeles', 'Antuco', 'Cabrero', 'Laja', 'Mulchén', 'Nacimiento', 'Negrete', 'Quilaco', 'Quilleco', 'San Rosendo', 'Santa Bárbara', 'Tucapel', 'Yumbel', 'Alto Biobío'],
  'La Araucanía': ['Temuco', 'Carahue', 'Cunco', 'Curarrehue', 'Freire', 'Galvarino', 'Gorbea', 'Lautaro', 'Loncoche', 'Melipeuco', 'Nueva Imperial', 'Padre las Casas', 'Perquenco', 'Pitrufquén', 'Pucón', 'Saavedra', 'Teodoro Schmidt', 'Toltén', 'Vilcún', 'Villarrica', 'Cholchol', 'Angol', 'Collipulli', 'Curacautín', 'Ercilla', 'Lonquimay', 'Los Sauces', 'Lumaco', 'Purén', 'Renaico', 'Traiguén', 'Victoria'],
  'Los Ríos': ['Valdivia', 'Corral', 'Futrono', 'La Unión', 'Lago Ranco', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco', 'Panguipulli', 'Río Bueno'],
  'Los Lagos': ['Puerto Montt', 'Calbuco', 'Cochamó', 'Fresia', 'Frutillar', 'Los Muermos', 'Llanquihue', 'Maullín', 'Puerto Varas', 'Castro', 'Ancud', 'Chonchi', 'Curaco de Vélez', 'Dalcahue', 'Puqueldón', 'Queilén', 'Quellón', 'Quemchi', 'Quinchao', 'Osorno', 'Puerto Octay', 'Purranque', 'Puyehue', 'Río Negro', 'San Juan de la Costa', 'San Pablo', 'Chaitén', 'Futaleufú', 'Hualaihué', 'Palena'],
  'Aysén': ['Coyhaique', 'Lago Verde', 'Aysén', 'Cisnes', 'Guaitecas', 'Cochrane', 'O\'Higgins', 'Tortel', 'Chile Chico', 'Río Ibáñez'],
  'Magallanes': ['Punta Arenas', 'Laguna Blanca', 'Río Verde', 'San Gregorio', 'Cabo de Hornos', 'Antártica', 'Porvenir', 'Primavera', 'Timaukel', 'Natales', 'Torres del Paine'],
};

// ✅ Exportado para usarlo en CheckoutPage
export const COSTO_ENVIO = {
  'Arica y Parinacota': 7990,
  'Tarapacá':           6990,
  'Antofagasta':        6990,
  'Atacama':            5990,
  'Coquimbo':           5990,
  'Valparaíso':         4990,
  'Metropolitana':      3990,
  'O\'Higgins':         4990,
  'Maule':              5990,
  'Ñuble':              5990,
  'Biobío':             5990,
  'La Araucanía':       5990,
  'Los Ríos':           6990,
  'Los Lagos':          6990,
  'Aysén':              9990,
  'Magallanes':         9990,
};

/* export const getCostoEnvio = (region) => COSTO_ENVIO[region] ?? 3000; */
export const getCostoEnvio = (region) => 0;

const CheckoutForm = ({ userData, cartItems, totalAmount, onRegionChange }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [regionSeleccionada, setRegionSeleccionada] = useState(null);
  const [comunasDisponibles, setComunasDisponibles] = useState([]);

  useEffect(() => {
    if (userData) {
      form.setFieldsValue({
        nombre: userData.nombre || '',
        email: userData.email || '',
        telefono: userData.telefono || '',
        direccion: userData.direccion || '',
        comuna: userData.comuna || '',
        region: userData.region || ''
      });

      if (userData.region && REGIONES_COMUNAS[userData.region]) {
        setRegionSeleccionada(userData.region);
        setComunasDisponibles(REGIONES_COMUNAS[userData.region]);
      }
    }
  }, [userData, form]);

  const handleRegionChange = (region) => {
    setRegionSeleccionada(region);
    setComunasDisponibles(REGIONES_COMUNAS[region] || []);
    form.setFieldValue('comuna', undefined);
    onRegionChange?.(region); // ✅ Notifica al padre
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);

    try {
      if (!cartItems || cartItems.length === 0) {
        message.error('Tu carrito está vacío');
        setSubmitting(false);
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        message.error('Debes iniciar sesión');
        setSubmitting(false);
        return;
      }

      const token = await user.getIdToken();

      const requestBody = {
        amount: totalAmount, // ✅ Ya incluye el envío dinámico calculado en el padre
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          size: item.size || null,
          color: item.color || null
        })),
        shippingData: values
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/webpay/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear transacción');
      }

      const formElement = document.createElement('form');
      formElement.method = 'POST';
      formElement.action = data.url;

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'token_ws';
      input.value = data.token;

      formElement.appendChild(input);
      document.body.appendChild(formElement);
      formElement.submit();

    } catch (error) {
      console.error('❌ ERROR:', error);
      message.error(error.message || 'Error al procesar el pago');
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <Title level={3} style={{ marginBottom: '24px' }}>
        Datos de Envío
      </Title>

      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">

        <Form.Item
          name="nombre"
          label="Nombre Completo"
          rules={[
            { required: true, message: 'Ingresa tu nombre completo' },
            { min: 3, message: 'Mínimo 3 caracteres' }
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Juan Pérez" size="large" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Ingresa tu email' },
            { type: 'email', message: 'Email inválido' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="correo@ejemplo.com"
            size="large"
            disabled={!!userData?.email}
          />
        </Form.Item>

        <Form.Item
          name="telefono"
          label="Teléfono"
          rules={[
            { required: true, message: 'Ingresa tu teléfono' },
            { pattern: /^[0-9+\s()-]+$/, message: 'Teléfono inválido' }
          ]}
        >
          <Input prefix={<PhoneOutlined />} placeholder="+56 9 1234 5678" size="large" />
        </Form.Item>

        <Form.Item
          name="direccion"
          label="Dirección"
          rules={[
            { required: true, message: 'Ingresa tu dirección' },
            { min: 5, message: 'Dirección muy corta' }
          ]}
        >
          <Input
            prefix={<HomeOutlined />}
            placeholder="Calle Ejemplo 123, Depto 45"
            size="large"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="region"
              label="Región"
              rules={[{ required: true, message: 'Selecciona tu región' }]}
            >
              <Select
                size="large"
                placeholder="Selecciona una región"
                onChange={handleRegionChange}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                suffixIcon={<EnvironmentOutlined />}
              >
                {Object.keys(REGIONES_COMUNAS).map(region => (
                  <Option key={region} value={region}>{region}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="comuna"
              label="Comuna"
              rules={[{ required: true, message: 'Selecciona tu comuna' }]}
            >
              <Select
                size="large"
                placeholder={regionSeleccionada ? 'Selecciona una comuna' : 'Primero selecciona una región'}
                disabled={!regionSeleccionada}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                suffixIcon={<EnvironmentOutlined />}
              >
                {comunasDisponibles.map(comuna => (
                  <Option key={comuna} value={comuna}>{comuna}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="notas" label="Notas adicionales (opcional)">
          <Input.TextArea
            placeholder="Ej: Dejar en conserjería, timbre no funciona, etc."
            rows={3}
          />
        </Form.Item>

        {/* ✅ Muestra el costo de envío dinámico */}
        {regionSeleccionada && (
          <Alert
            message={`Envío a ${regionSeleccionada}: $${getCostoEnvio(regionSeleccionada).toLocaleString('es-CL')}`}
            type="success"
            showIcon
            icon={<EnvironmentOutlined />}
            style={{ marginBottom: '12px' }}
          />
        )}

        <Alert
          message="Pago Seguro con Webpay"
          description="Serás redirigido a la plataforma segura de Transbank para completar tu pago."
          type="info"
          showIcon
          icon={<CreditCardOutlined />}
          style={{ marginBottom: '20px' }}
        />

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={submitting}
            icon={<CreditCardOutlined />}
            style={{
              background: 'linear-gradient(45deg, #f33763, #FF6B9D)',
              border: 'none',
              height: '50px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {submitting ? 'Redirigiendo a Webpay...' : 'Pagar con Webpay'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CheckoutForm;