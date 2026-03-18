// src/components/Productos/ProductCard.jsx
import { useState, useRef, useEffect } from 'react';
import { message } from 'antd';
import { ShoppingCartOutlined, PlusOutlined, MinusOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import ProductModal from '../../components/Productos/ProductModal';

const ProductCard = ({ producto }) => {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [showQuantityPopup, setShowQuantityPopup] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [added, setAdded] = useState(false);
  const popupRef = useRef(null);
  const btnRef = useRef(null);

  const formatearPrecio = (precio) => {
    if (typeof precio === 'number') return `$${precio.toLocaleString('es-CL')}`;
    return precio;
  };

  const imagenPrincipal = () => {
    if (producto.imagenes?.length > 0) return producto.imagenes[0];
    return producto.img || producto.imagen || producto.image;
  };

  const imagenSecundaria = () => {
    if (producto.imagenes?.length > 1) return producto.imagenes[1];
    return null;
  };

  // Cerrar popup al click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popupRef.current && !popupRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setShowQuantityPopup(false);
        setCantidad(1);
      }
    };
    if (showQuantityPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showQuantityPopup]);

  const handleCartButtonClick = (e) => {
    e.stopPropagation();
    const user = auth.currentUser;
    if (!user) {
      message.warning('Debes iniciar sesión para agregar productos al carrito');
      navigate('/login');
      return;
    }
    setShowQuantityPopup(prev => !prev);
  };

  const confirmarAgregarAlCarrito = async (e) => {
    e.stopPropagation();
    const user = auth.currentUser;
    if (!user) return;

    try {
      setAddingToCart(true);
      const cartItemRef = doc(db, 'users', user.uid, 'cart', producto.id);

      // Sumar a cantidad existente si ya está en carrito
      const existing = await getDoc(cartItemRef);
      const currentQty = existing.exists() ? (existing.data().quantity || 0) : 0;

      await setDoc(cartItemRef, {
  id: producto.id,        // ← AGREGAR ESTO
  name: producto.nombre || producto.title,
  price: producto.precio || producto.price,
  image: imagenPrincipal(),
  quantity: currentQty + cantidad,
  addedAt: new Date().toISOString(),
  size: producto.talla || null,
  color: producto.color || null,
});
      setShowQuantityPopup(false);
      setCantidad(1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      message.error('Error al agregar al carrito');
    } finally {
      setAddingToCart(false);
    }
  };

  const agotado = producto.stock === 0 || producto.activo === false;
  const segundaImagen = imagenSecundaria();

  return (
    <>
      <style>{`
        .pc-root {
          display: flex;
          flex-direction: column;
          cursor: pointer;
          background: #fff;
          border-radius: 14px;
          overflow: visible;
          transition: box-shadow 0.25s ease;
          position: relative;
        }
        .pc-root:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.10);
        }

        .pc-img-wrapper {
          position: relative;
          width: 100%;
          padding-bottom: 150%;
          overflow: hidden;
          background: #f5f5f5;
          border-radius: 14px;
          flex-shrink: 0;
        }
        .pc-img {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.45s ease, opacity 0.35s ease;
        }
        .pc-img-primary { z-index: 1; }
        .pc-img-secondary { z-index: 2; opacity: 0; }
        .pc-root:hover .pc-img-primary { transform: scale(1.04); }
        .pc-root:hover .pc-img-secondary { opacity: 1; }

        .pc-badge {
          position: absolute;
          top: 10px; left: 10px;
          z-index: 4;
          background: #f33763;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .pc-info {
          padding: 12px 2px 0 2px;
        }
        .pc-name {
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
        .pc-price {
          font-size: 17px;
          font-weight: 700;
          color: #f33763;
          margin-bottom: 12px;
        }

        /* ── Botón agregar ── */
        .pc-cart-btn {
          width: 100%;
          padding: 11px 0;
          background: linear-gradient(45deg, #f33763, #FF6B9D);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.3px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s ease, transform 0.15s ease;
        }
        .pc-cart-btn:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .pc-cart-btn:disabled {
          background: #ddd;
          color: #999;
          cursor: not-allowed;
          transform: none;
        }
        .pc-cart-btn.pc-added {
          background: linear-gradient(45deg, #22c55e, #4ade80);
        }

        /* ── Quantity popup ── */
        .pc-popup {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 0; right: 0;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.16);
          padding: 14px;
          z-index: 200;
          animation: pc-popup-in 0.18s ease;
        }
        @keyframes pc-popup-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pc-popup::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 12px; height: 12px;
          background: #fff;
          box-shadow: 2px 2px 4px rgba(0,0,0,0.06);
        }
        .pc-popup-label {
          font-size: 12px;
          font-weight: 600;
          color: #888;
          text-align: center;
          margin-bottom: 10px;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }
        .pc-qty-row {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          border: 1.5px solid #f0f0f0;
          border-radius: 8px;
          overflow: hidden;
        }
        .pc-qty-btn {
          width: 40px; height: 38px;
          background: #fafafa;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          color: #333;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .pc-qty-btn:hover:not(:disabled) { background: #f33763; color: #fff; }
        .pc-qty-btn:disabled { color: #ccc; cursor: not-allowed; }
        .pc-qty-value {
          flex: 1;
          text-align: center;
          font-size: 16px;
          font-weight: 700;
          color: #222;
          border-left: 1.5px solid #f0f0f0;
          border-right: 1.5px solid #f0f0f0;
          height: 38px;
          line-height: 38px;
          user-select: none;
        }
        .pc-confirm-btn {
          width: 100%;
          padding: 9px 0;
          background: linear-gradient(45deg, #f33763, #FF6B9D);
          color: #fff;
          border: none;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: opacity 0.2s;
        }
        .pc-confirm-btn:hover:not(:disabled) { opacity: 0.88; }
        .pc-confirm-btn:disabled { background: #ccc; cursor: not-allowed; }
      `}</style>

      <div className="pc-root" onClick={() => !showQuantityPopup && setModalVisible(true)}>

        {/* Imagen */}
        <div className="pc-img-wrapper">
          {agotado && <span className="pc-badge">Agotado</span>}
          <img
            src={imagenPrincipal()}
            alt={producto.nombre || producto.title}
            className="pc-img pc-img-primary"
          />
          {segundaImagen && (
            <img
              src={segundaImagen}
              alt={`${producto.nombre || producto.title} - 2`}
              className="pc-img pc-img-secondary"
            />
          )}
        </div>

        {/* Info */}
        <div className="pc-info">
          <p className="pc-name">{producto.nombre || producto.title}</p>
          <div className="pc-price">{formatearPrecio(producto.precio || producto.price)}</div>

          {/* Zona relativa para el popup */}
          <div style={{ position: 'relative' }}>

            {/* Quantity popup */}
            {showQuantityPopup && (
              <div
                ref={popupRef}
                className="pc-popup"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="pc-popup-label">¿Cuántas unidades?</p>
                <div className="pc-qty-row">
                  <button
                    className="pc-qty-btn"
                    onClick={(e) => { e.stopPropagation(); setCantidad(c => Math.max(1, c - 1)); }}
                    disabled={cantidad <= 1}
                  >
                    <MinusOutlined />
                  </button>
                  <span className="pc-qty-value">{cantidad}</span>
                  <button
                    className="pc-qty-btn"
                    onClick={(e) => { e.stopPropagation(); setCantidad(c => Math.min(producto.stock || 99, c + 1)); }}
                    disabled={cantidad >= (producto.stock || 99)}
                  >
                    <PlusOutlined />
                  </button>
                </div>
                <button
                  className="pc-confirm-btn"
                  onClick={confirmarAgregarAlCarrito}
                  disabled={addingToCart}
                >
                  <ShoppingCartOutlined />
                  {addingToCart
                    ? 'Agregando...'
                    : `Agregar${cantidad > 1 ? ` (${cantidad})` : ''} al carrito`}
                </button>
              </div>
            )}

            {/* Botón principal */}
            <button
              ref={btnRef}
              className={`pc-cart-btn${added ? ' pc-added' : ''}`}
              onClick={handleCartButtonClick}
              disabled={agotado}
            >
              {added
                ? <><CheckOutlined /> ¡Agregado!</>
                : <><ShoppingCartOutlined /> {agotado ? 'Sin stock' : 'Agregar al carrito'}</>
              }
            </button>

          </div>
        </div>
      </div>

      <ProductModal
        visible={modalVisible}
        producto={producto}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

export default ProductCard;