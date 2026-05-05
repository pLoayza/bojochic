// src/pages/Productos/BundleCard.jsx
import { useState } from 'react';
import { GiftOutlined } from '@ant-design/icons';
import BundleModal from '../../components/Productos/BundleModal';

const BundleCard = ({ bundle }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const ahorro = (bundle.precioNormal || 0) - (bundle.precioBundle || 0);
  const porcentaje = bundle.precioNormal > 0
    ? Math.round((ahorro / bundle.precioNormal) * 100)
    : 0;

  const imagen = bundle.img || bundle.imagenes?.[0] || '';
  const agotado = bundle.stock === 0 || bundle.activo === false;

  return (
    <>
      <style>{`
        .bc-root {
          display: flex;
          flex-direction: column;
          background: #fff;
          border-radius: 14px;
          overflow: visible;
          transition: box-shadow 0.25s ease;
          position: relative;
          cursor: pointer;
        }
        .bc-root:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.10); }
        .bc-img-wrapper {
          position: relative;
          width: 100%;
          padding-bottom: 150%;
          overflow: hidden;
          background: #f5f5f5;
          border-radius: 14px;
          flex-shrink: 0;
        }
        .bc-img {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.45s ease;
        }
        .bc-root:hover .bc-img { transform: scale(1.04); }
        .bc-badge-bundle {
          position: absolute;
          top: 10px; left: 10px;
          z-index: 4;
          background: #722ed1;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .bc-badge-desc {
          position: absolute;
          top: 10px; right: 10px;
          z-index: 4;
          background: #f33763;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .bc-badge-agotado {
          position: absolute;
          top: 10px; left: 10px;
          z-index: 4;
          background: #f33763;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
        }
        .bc-products-strip {
          position: absolute;
          bottom: 10px; left: 10px; right: 10px;
          z-index: 4;
          display: flex;
          gap: 4px;
        }
        .bc-product-thumb {
          width: 36px; height: 36px;
          border-radius: 6px;
          object-fit: cover;
          border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.18);
          background: #eee;
        }
        .bc-info { padding: 12px 2px 0 2px; }
        .bc-name {
          font-size: 14px;
          font-weight: 500;
          color: #222;
          margin: 0 0 5px 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 40px;
        }
        .bc-price-block { display: flex; flex-direction: column; gap: 1px; margin-bottom: 6px; }
        .bc-price { font-size: 17px; font-weight: 700; color: #f33763; }
        .bc-price-original { font-size: 12px; color: #aaa; text-decoration: line-through; }
        .bc-ahorro { font-size: 11px; color: #888; margin-bottom: 10px; }
        .bc-ver-btn {
          width: 100%;
          padding: 11px 0;
          background: linear-gradient(45deg, #722ed1, #9b59b6);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s ease, transform 0.15s ease;
        }
        .bc-ver-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .bc-ver-btn:disabled { background: #ddd; color: #999; cursor: not-allowed; transform: none; }
      `}</style>

      <div className="bc-root" onClick={() => setModalVisible(true)}>
        <div className="bc-img-wrapper">

          {agotado
            ? <span className="bc-badge-agotado">Agotado</span>
            : <span className="bc-badge-bundle"><GiftOutlined /> Bundle</span>
          }

          {porcentaje > 0 && !agotado && (
            <span className="bc-badge-desc">-{porcentaje}%</span>
          )}

          <img src={imagen} alt={bundle.nombre} className="bc-img" />

          {bundle.productosSnap?.length > 0 && (
            <div className="bc-products-strip">
              {bundle.productosSnap.slice(0, 4).map((p) => (
                <img key={p.id} src={p.imagen} alt={p.nombre} className="bc-product-thumb" />
              ))}
            </div>
          )}
        </div>

        <div className="bc-info">
          <p className="bc-name">{bundle.nombre}</p>

          <div className="bc-price-block">
            <div className="bc-price">${(bundle.precioBundle || 0).toLocaleString('es-CL')}</div>
            {bundle.precioNormal > 0 && (
              <div className="bc-price-original">${bundle.precioNormal.toLocaleString('es-CL')}</div>
            )}
          </div>

          {ahorro > 0 && (
            <div className="bc-ahorro">Ahorras ${ahorro.toLocaleString('es-CL')}</div>
          )}

          <button className="bc-ver-btn" disabled={agotado}>
            <GiftOutlined />
            {agotado ? 'Sin stock' : 'Ver bundle'}
          </button>
        </div>
      </div>

      <BundleModal
        visible={modalVisible}
        bundle={bundle}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

export default BundleCard;