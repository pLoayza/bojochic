import { WhatsAppOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

const ContactBubble = () => {
  const phoneNumber = '56989058379'; // Cambia esto por tu número
  const message = '¡Hola! Me gustaría obtener más información sobre sus productos.';
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleClick = () => {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: '#25D366',
        color: 'white',
        padding: isMobile ? '15px' : '12px 20px',
        borderRadius: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        transition: 'all 0.3s ease',
        fontWeight: '500',
        minWidth: isMobile ? '60px' : 'auto',
        minHeight: isMobile ? '60px' : 'auto',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#128C7E';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#25D366';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      }}
    >
      <WhatsAppOutlined style={{ fontSize: '24px' }} />
      {!isMobile && <span>Contáctanos</span>}
    </div>
  );
};

export default ContactBubble;