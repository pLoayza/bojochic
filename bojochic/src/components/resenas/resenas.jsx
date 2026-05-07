// src/components/Resenas/Resenas.jsx
import res1 from '../../assets/Categorias/res1.png';
import res2 from '../../assets/Categorias/res2.png';
import res3 from '../../assets/Categorias/res3.png';
import res4 from '../../assets/Categorias/res4.png';

const resenas = [res1, res2, res3, res4];

const Resenas = () => {
  return (
    <section
      style={{
        padding: '60px 40px',
        background: '#fff',
        textAlign: 'center',
      }}
    >
      {/* Título */}
      <p
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#f33763',
          marginBottom: '8px',
        }}
      >
        Lo que dicen nuestras clientas
      </p>
      <h2
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: '26px',
          fontWeight: 400,
          color: '#222',
          marginBottom: '40px',
          letterSpacing: '0.05em',
        }}
      >
        
      </h2>

      {/* Grid de imágenes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        {resenas.map((src, i) => (
          <div
            key={i}
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(243,55,99,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
            }}
          >
            <img
              src={src}
              alt={`Reseña ${i + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Resenas;