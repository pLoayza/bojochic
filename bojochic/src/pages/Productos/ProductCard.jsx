// src/pages/Productos/ProductCard.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { ShoppingCartOutlined, PlusOutlined, MinusOutlined, CheckOutlined } from '@ant-design/icons';

import { auth, db } from '../../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { calcularPrecio, formatearPrecio } from '../../utils/precioUtils';
import ProductModal from '../../components/Productos/ProductModal';
import './ProductCard.css';

const CART_KEY = 'bojo_guest_cart';

// Detecta dispositivos touch (mobile/tablet) — se evalúa una vez, no por card
const isMobile = window.matchMedia('(hover: none)').matches;

const getGuestCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
};

const saveGuestCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

const ProductCard = ({ producto }) => {
  const navigate = useNavigate();
  const [showQuantityPopup, setShowQuantityPopup] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const popupRef = useRef(null);
  const btnRef = useRef(null);
  const cardRef = useRef(null);
  const savedScrollY = useRef(0);

  const tallas = producto.tieneTallas && Array.isArray(producto.tallas) && producto.tallas.length > 0
    ? producto.tallas : null;

  const { precioFinal, precioOriginal, tieneDescuento, porcentaje } = calcularPrecio(producto);

  const imagenPrincipal = () => {
    if (producto.imagenes?.length > 0) return producto.imagenes[0];
    return producto.img || producto.imagen || producto.image;
  };

  const imagenSecundaria = () => {
    if (producto.imagenes?.length > 1) return producto.imagenes[1];
    return null;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popupRef.current && !popupRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setShowQuantityPopup(false);
        setCantidad(1);
        setSelectedSize(null);
      }
    };
    if (showQuantityPopup) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showQuantityPopup]);

  const handleCartButtonClick = (e) => {
    e.stopPropagation();
    setSelectedSize(null);
    setShowQuantityPopup(prev => !prev);
  };

  const handleCardClick = () => {
    if (showQuantityPopup) return;
    navigate(`/producto/${producto.id}`);
  };

  const confirmarAgregarAlCarrito = async (e) => {
    e.stopPropagation();

    // ✅ Validar stock antes de agregar
    const stockDisponible = producto.stock ?? 0;
    if (cantidad > stockDisponible) {
      message.warning(`Solo hay ${stockDisponible} unidad${stockDisponible !== 1 ? 'es' : ''} disponibles`);
      setCantidad(stockDisponible > 0 ? stockDisponible : 1);
      return;
    }

    const user = auth.currentUser;
    const cartKey = tallas && selectedSize ? `${producto.id}_${selectedSize}` : producto.id;

    try {
      setAddingToCart(true);

      if (user) {
        const cartItemRef = doc(db, 'users', user.uid, 'cart', cartKey);
        const existing    = await getDoc(cartItemRef);
        const currentQty  = existing.exists() ? (existing.data().quantity || 0) : 0;

        await setDoc(cartItemRef, {
          id:       producto.id,
          name:     producto.nombre || producto.title,
          price:    precioFinal,
          image:    imagenPrincipal(),
          quantity: currentQty + cantidad,
          addedAt:  new Date().toISOString(),
          size:     selectedSize || null,
          color:    producto.color || null,
        });

      } else {
        const cart = getGuestCart();
        const existingIndex = cart.findIndex(item => {
          const iKey = item.size ? `${item.id}_${item.size}` : item.id;
          return iKey === cartKey;
        });

        if (existingIndex >= 0) {
          cart[existingIndex].quantity += cantidad;
        } else {
          cart.push({
            id:       producto.id,
            cartKey,
            name:     producto.nombre || producto.title,
            price:    precioFinal,
            image:    imagenPrincipal(),
            quantity: cantidad,
            addedAt:  new Date().toISOString(),
            size:     selectedSize || null,
            color:    producto.color || null,
          });
        }

        saveGuestCart(cart);
        window.dispatchEvent(new CustomEvent('guestCartUpdated'));
      }

      setShowQuantityPopup(false);
      setCantidad(1);
      setSelectedSize(null);
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
  const stockMaximo = producto.stock ?? 1;
  const segundaImagen = imagenSecundaria();
  const confirmDisabled = addingToCart || (tallas && !selectedSize);

  return (
    <>
      <div ref={cardRef} className="pc-root" onClick={handleCardClick}>

        <div className="pc-img-wrapper">

          {/* Badge izquierda: Agotado tiene prioridad, luego Últimas unidades */}
          {agotado
            ? <span className="pc-badge">Agotado</span>
            : producto.ultimasUnidades && <span className="pc-badge-ultimas">⚡ Últimas unidades</span>
          }

          {/* Badge derecha: % descuento */}
          {tieneDescuento && <span className="pc-badge-desc">-{porcentaje}%</span>}

          <img
            src={imagenPrincipal()}
            alt={producto.nombre || producto.title}
            className="pc-img pc-img-primary"
            loading="lazy"
            decoding="async"
          />
          {segundaImagen && !isMobile && (
            <img
              src={segundaImagen}
              alt={`${producto.nombre || producto.title} - 2`}
              className="pc-img pc-img-secondary"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>

        <div className="pc-info">
          <p className="pc-name">{producto.nombre || producto.title}</p>

          <div className="pc-price-block">
            <div className="pc-price">{formatearPrecio(precioFinal)}</div>
            {tieneDescuento && (
              <div className="pc-price-original">{formatearPrecio(precioOriginal)}</div>
            )}
          </div>

          <div style={{ position: 'relative' }}>

            {showQuantityPopup && (
              <div ref={popupRef} className="pc-popup" onClick={(e) => e.stopPropagation()}>

                {tallas && (
                  <>
                    <p className="pc-popup-label">Elige tu talla</p>
                    <div className="pc-size-grid">
                      {tallas.map((t) => (
                        <button
                          key={t}
                          className={`pc-size-btn${selectedSize === t ? ' active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); setSelectedSize(t); }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {!selectedSize && <p className="pc-size-hint">* Selecciona una talla para continuar</p>}
                  </>
                )}

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
                  {/* ✅ Fix: usa stockMaximo en vez de || 99 */}
                  <button
                    className="pc-qty-btn"
                    onClick={(e) => { e.stopPropagation(); setCantidad(c => Math.min(stockMaximo, c + 1)); }}
                    disabled={cantidad >= stockMaximo}
                  >
                    <PlusOutlined />
                  </button>
                </div>
                <button className="pc-confirm-btn" onClick={confirmarAgregarAlCarrito} disabled={confirmDisabled}>
                  <ShoppingCartOutlined />
                  {addingToCart ? 'Agregando...' : `Agregar${cantidad > 1 ? ` (${cantidad})` : ''} al carrito`}
                </button>
              </div>
            )}

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

            <button
              className="pc-detail-btn"
              onClick={(e) => { e.stopPropagation(); savedScrollY.current = window.scrollY; setShowModal(true); }}
            >
              Ver detalle
            </button>

          </div>
        </div>
      </div>

      <ProductModal
        visible={showModal}
        producto={producto}
        onClose={() => setShowModal(false)}
        afterClose={() => window.scrollTo({ top: savedScrollY.current, behavior: 'instant' })}
      />
    </>
  );
};

export default ProductCard;