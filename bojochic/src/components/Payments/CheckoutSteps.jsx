import { Steps } from 'antd';
import { ShoppingCartOutlined, CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons';

const CheckoutSteps = ({ current = 0 }) => (
  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
    <Steps
      current={current}
      size="small"
      style={{ maxWidth: '480px', width: '100%' }}
      items={[
        { title: 'Compra', icon: <ShoppingCartOutlined /> },
        { title: 'Pago', icon: <CreditCardOutlined /> },
        { title: 'Completado', icon: <CheckCircleOutlined /> },
      ]}
    />
  </div>
);

export default CheckoutSteps;
