// src/components/Productos/ProductModal.jsx
import { useState, useRef } from 'react';
import { Modal, Image, Button, Space, Carousel } from 'antd';
import { ShoppingCartOutlined, CloseOutlined, LeftOutlined, RightOutlined, CheckOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { auth, db } from '../../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import { calcularPrecio, formatearPrecio } from '../../utils/precioUtils';

const CART_KEY = 'bojo_guest_cart';

const getGuestCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
};

const saveGuestCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

// ─── Helper Klaviyo ───────────────────────────────────────────────────────────
const trackAddedToCart = (producto, precioFinal, categorias, imagenes, selectedSize, cartItems) => {
  if (!window.klaviyo) return;

  window.klaviyo.track("Added to Cart", {
    "$value": cartItems.reduce((total, i) => total + i.price * i.quantity, 0),
    "AddedItemProductName": producto.nombre || producto.title,
    "AddedItemProductID": producto.id,
    "AddedItemSKU": producto.sku || producto.id,
    "AddedItemPrice": precioFinal,
    "AddedItemQuantity": 1,
    "AddedItemCategories": categorias,
    "AddedItemImageURL": imagenes[0],
    "AddedItemURL": `https://bojo.cl/producto/${producto.slug || producto.id}`,
    "AddedItemSize": selectedSize || null,
    "ItemNames": cartItems.map(i => i.name),
    "CheckoutURL": "https://bojo.cl/checkout",
    "Items": cartItems.map(i => ({
      "ProductID": i.id,
      "ProductName": i.name,
      "SKU": i.sku || i.id,
      "Quantity": i.quantity,
      "ItemPrice": i.price,
      "RowTotal": i.price * i.quantity,
      "ImageURL": i.image,
      "ProductCategories": i.categories || [],
    }))
  });
};
// ─────────────────────────────────────────────────────────────────────────────

const ProductModal = ({ visible, producto, onClose, afterClose }) => {
  const carouselRef = useRef(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [added, setAdded] = useState(false);
  const DESC_LIMIT = 160;

  if (!producto) return null;

  const tallas = producto.tieneTallas && Array.isArray(producto.tallas) && producto.tallas.length > 0
    ? producto.tallas : null;

  const { precioFinal, precioOriginal, tieneDescuento, porcentaje } = calcularPrecio(producto);

  const imagenes = producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0
    ? producto.imagenes
    : [producto.img || producto.imagen || producto.image];

  const categorias = producto.categorias && Array.isArray(producto.categorias) && producto.categorias.length > 0
    ? producto.categorias
    : (producto.categoria ? [producto.categoria] : []);

  const agregarAlCarrito = async () => {
    const user = auth.currentUser;
    const cartItemId = tallas && selectedSize ? `${producto.id}_${selectedSize}` : producto.id;

    try {
      if (user) {
        const cartItemRef = doc(db, 'users', user.uid, 'cart', cartItemId);
        const existing = await getDoc(cartItemRef);
        const currentQty = existing.exists() ? (existing.data().quantity || 0) : 0;

        await setDoc(cartItemRef, {
          id:       producto.id,
          name:     producto.nombre || producto.title,
          price:    precioFinal,
          image:    imagenes[0],
          quantity: currentQty + cantidad,
          addedAt:  new Date().toISOString(),
          size:     selectedSize || null,
          color:    producto.color || null,
        });

        // Para usuarios logueados no tenemos el carrito completo acá,
        // así que armamos el carrito con al menos el item actual
        const cartParaKlaviyo = [{
          id:         producto.id,
          name:       producto.nombre || producto.title,
          price:      precioFinal,
          image:      imagenes[0],
          quantity:   currentQty + 1,
          categories: categorias,
        }];
        trackAddedToCart(producto, precioFinal, categorias, imagenes, selectedSize, cartParaKlaviyo);

      } else {
        const cart = getGuestCart();
        const existingIndex = cart.findIndex(item => {
          const itemKey = item.size ? `${item.id}_${item.size}` : item.id;
          return itemKey === cartItemId;
        });

        if (existingIndex >= 0) {
          cart[existingIndex].quantity += 1;
        } else {
          cart.push({
            id:       producto.id,
            name:     producto.nombre || producto.title,
            price:    precioFinal,
            image:    imagenes[0],
            quantity: cantidad,
            addedAt:  new Date().toISOString(),
            size:     selectedSize || null,
            color:    producto.color || null,
          });
        }

        saveGuestCart(cart);
        window.dispatchEvent(new CustomEvent('guestCartUpdated'));

        // Para guest usamos el carrito ya actualizado del localStorage
        const cartActualizado = cart.map(i => ({ ...i, categories: i.categories || [] }));
        trackAddedToCart(producto, precioFinal, categorias, imagenes, selectedSize, cartActualizado);
      }

      setAdded(true);
      setTimeout(() => setAdded(false), 2500);

    } catch (error) {
      console.error('Error agregando al carrito:', error);
      message.error('Error al agregar al carrito');
    }
  };

  const handleClose = () => {
    setSelectedSize(null);
    setCantidad(1);
    setAdded(false);
    onClose();
  };

  const sinStock = producto.stock === 0 || producto.activo === false;
  const addDisabled = sinStock || (tallas && !selectedSize);

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      afterClose={afterClose}
      width="90%"
      style={{ maxWidth: '880px', top: 20 }}
      closeIcon={
        <div style={{
          width: '34px', height: '34px',
          background: '#1a1a1a', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CloseOutlined style={{ fontSize: '13px', color: '#fff' }} />
        </div>
      }
      styles={{ body: { padding: '16px' } }}
    >
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'stretch' }}>

        {/* Columna de imágenes — ocupa toda la altura del panel derecho */}
        <div style={{ flex: '1 1 300px', minWidth: '250px', position: 'relative', minHeight: '380px', borderRadius: '12px', overflow: 'hidden' }}>

          {/* Badges sobre la imagen */}
          {!sinStock && producto.ultimasUnidades && (
            <div style={{
              position: 'absolute', top: '12px', left: '12px', zIndex: 20,
              background: '#fa8c16', color: '#fff',
              fontSize: '12px', fontWeight: 700,
              padding: '4px 12px', borderRadius: '20px',
            }}>
              ⚡ Últimas unidades
            </div>
          )}
          {tieneDescuento && (
            <div style={{
              position: 'absolute', top: '12px', right: '12px', zIndex: 20,
              background: '#f33763', color: '#fff',
              fontSize: '13px', fontWeight: 800,
              padding: '4px 12px', borderRadius: '20px',
              letterSpacing: '0.4px',
              boxShadow: '0 2px 8px rgba(243,55,99,0.35)',
            }}>
              -{porcentaje}% OFF
            </div>
          )}

          {/* Imagen/Carrusel llenando 100% del contenedor */}
          {imagenes.length > 1 ? (
            <>
              <style>{`
                .pm-carousel, .pm-carousel .slick-list,
                .pm-carousel .slick-track, .pm-carousel .slick-slide,
                .pm-carousel .slick-slide > div { height: 100% !important; }
              `}</style>
              <Carousel ref={carouselRef} dotPosition="bottom" className="pm-carousel"
                style={{ position: 'absolute', inset: 0, height: '100%' }}
              >
                {imagenes.map((img, index) => (
                  <div key={index}>
                    <img
                      src={img}
                      alt={`${producto.nombre || producto.title} - Imagen ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                ))}
              </Carousel>
              <Button icon={<LeftOutlined />} onClick={() => carouselRef.current?.prev()} style={{
                position: 'absolute', left: '10px', top: '50%',
                transform: 'translateY(-50%)', zIndex: 10,
                background: 'rgba(255,255,255,0.9)', border: 'none',
                borderRadius: '50%', width: '38px', height: '38px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }} />
              <Button icon={<RightOutlined />} onClick={() => carouselRef.current?.next()} style={{
                position: 'absolute', right: '10px', top: '50%',
                transform: 'translateY(-50%)', zIndex: 10,
                background: 'rgba(255,255,255,0.9)', border: 'none',
                borderRadius: '50%', width: '38px', height: '38px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }} />
              <div style={{
                position: 'absolute', bottom: '14px', right: '14px',
                background: 'rgba(0,0,0,0.55)', color: '#fff',
                padding: '4px 11px', borderRadius: '20px',
                fontSize: '12px', fontWeight: 500, zIndex: 10,
              }}>
                {imagenes.length} fotos
              </div>
            </>
          ) : (
            <Image
              src={imagenes[0]}
              alt={producto.nombre || producto.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              wrapperStyle={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              preview={{ mask: 'Ver imagen completa' }}
            />
          )}
        </div>

        {/* Columna de información — borde fucsia como en el reference */}
        <div style={{
          flex: '1 1 320px', minWidth: '260px',
          border: '2px solid #f33763',
          borderRadius: '12px',
          padding: '22px 24px',
        }}>
          <h2 style={{ margin: '0 0 14px 0', fontSize: 'clamp(18px,4vw,24px)', fontWeight: '700', color: '#1a1a1a', lineHeight: '1.3' }}>
            {producto.nombre || producto.title}
          </h2>

          {/* Precio */}
          <div style={{ marginBottom: '16px' }}>
            {tieneDescuento && (
              <div style={{
                display: 'inline-block', marginBottom: '6px',
                background: '#f33763', color: '#fff',
                fontSize: '12px', fontWeight: 800,
                padding: '2px 10px', borderRadius: '20px', letterSpacing: '0.4px',
              }}>
                -{porcentaje}% OFF
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: '800', color: '#000', lineHeight: 1 }}>
                {formatearPrecio(precioFinal)}
              </span>
              {tieneDescuento && (
                <span style={{ fontSize: '16px', color: '#bbb', textDecoration: 'line-through' }}>
                  {formatearPrecio(precioOriginal)}
                </span>
              )}
            </div>
            {tieneDescuento && (
              <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#888' }}>
                Ahorras {formatearPrecio(precioOriginal - precioFinal)}
              </p>
            )}
          </div>

          {/* Pills de info */}
          <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '18px' }}>
            {producto.activo !== false && (
              <span style={{ border: '1.5px solid #52c41a', color: '#389e0d', background: '#f6ffed', borderRadius: '20px', padding: '3px 11px', fontSize: '12px', fontWeight: '600' }}>
                Disponible
              </span>
            )}
            {!sinStock && producto.ultimasUnidades && (
              <span style={{ border: '1.5px solid #fa8c16', color: '#d46b08', background: '#fff7e6', borderRadius: '20px', padding: '3px 11px', fontSize: '12px', fontWeight: '600' }}>
                ⚡ Últimas unidades
              </span>
            )}
            {producto.stock > 0 ? (
              <span style={{ border: '1.5px solid #40a9ff', color: '#096dd9', background: '#e6f7ff', borderRadius: '20px', padding: '3px 11px', fontSize: '12px', fontWeight: '600' }}>
                {producto.stock} en stock
              </span>
            ) : (
              <span style={{ border: '1.5px solid #ff4d4f', color: '#cf1322', background: '#fff1f0', borderRadius: '20px', padding: '3px 11px', fontSize: '12px', fontWeight: '600' }}>
                Agotado
              </span>
            )}
            {categorias.map((cat, index) => (
              <span key={index} style={{ border: '1.5px solid #f33763', color: '#f33763', background: '#fff0f4', borderRadius: '20px', padding: '3px 11px', fontSize: '12px', fontWeight: '600' }}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </span>
            ))}
            {producto.material && (
              <span style={{ border: '1.5px solid #9254de', color: '#722ed1', background: '#f9f0ff', borderRadius: '20px', padding: '3px 11px', fontSize: '12px', fontWeight: '600' }}>
                {producto.material}
              </span>
            )}
          </div>

          {/* Selector de cantidad */}
          {!sinStock && (
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 10px 0', color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cantidad</h4>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', width: 'fit-content' }}>
                <button
                  onClick={() => setCantidad(c => Math.max(1, c - 1))}
                  disabled={cantidad <= 1}
                  style={{
                    width: '38px', height: '38px', background: '#fafafa', border: 'none',
                    cursor: cantidad <= 1 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cantidad <= 1 ? '#ccc' : '#333', fontSize: '14px',
                  }}
                >
                  <MinusOutlined />
                </button>
                <span style={{
                  minWidth: '44px', textAlign: 'center',
                  fontSize: '15px', fontWeight: '700', color: '#1a1a1a',
                  borderLeft: '1.5px solid #e0e0e0', borderRight: '1.5px solid #e0e0e0',
                  height: '38px', lineHeight: '38px',
                }}>
                  {cantidad}
                </span>
                <button
                  onClick={() => setCantidad(c => Math.min(producto.stock || 99, c + 1))}
                  disabled={cantidad >= (producto.stock || 99)}
                  style={{
                    width: '38px', height: '38px', background: '#fafafa', border: 'none',
                    cursor: cantidad >= (producto.stock || 99) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cantidad >= (producto.stock || 99) ? '#ccc' : '#333', fontSize: '14px',
                  }}
                >
                  <PlusOutlined />
                </button>
              </div>
            </div>
          )}

          {/* Descripción con Ver más */}
          {producto.descripcion && (() => {
            const texto = producto.descripcion;
            const esLargo = texto.length > DESC_LIMIT;
            const visible = esLargo && !descExpanded ? texto.slice(0, DESC_LIMIT).trimEnd() + '…' : texto;
            return (
              <div style={{ marginBottom: '18px' }}>
                <p style={{ color: '#666', lineHeight: '1.65', fontSize: '14px', margin: '0 0 4px 0' }}>
                  {visible}
                </p>
                {esLargo && (
                  <button
                    onClick={() => setDescExpanded(v => !v)}
                    style={{ background: 'none', border: 'none', color: '#f33763', fontSize: '13px', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                  >
                    {descExpanded ? 'Ver menos ↑' : 'Ver más ↓'}
                  </button>
                )}
              </div>
            );
          })()}

          {/* Selector de tallas */}
          {tallas ? (
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Talla</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {tallas.map((t) => (
                  <button key={t} onClick={() => setSelectedSize(t)} style={{
                    padding: '7px 15px',
                    border: selectedSize === t ? '2px solid #f33763' : '1.5px solid #ddd',
                    borderRadius: '8px',
                    background: selectedSize === t ? '#fff0f4' : '#fff',
                    color: selectedSize === t ? '#f33763' : '#555',
                    fontWeight: selectedSize === t ? '700' : '500',
                    fontSize: '13px', cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}>
                    {t}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p style={{ color: '#f33763', fontSize: '12px', margin: '7px 0 0 0' }}>
                  * Selecciona una talla para agregar al carrito
                </p>
              )}
            </div>
          ) : null}

          {/* Beneficios */}
          <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', padding: '13px 15px', borderRadius: '10px', marginBottom: '18px' }}>
            <p style={{ fontSize: '13px', color: '#555', margin: 0, lineHeight: '2' }}>
              ✓ Envío gratis por compras sobre $19.990 para regiones seleccionadas
              <br />✓ Garantía de 30 días
              <br />✓ Atención al cliente 24/7
            </p>
          </div>

          {/* Botones */}
          <Space direction="vertical" style={{ width: '100%' }} size={10}>
            <Button
              type="primary" size="large" block
              icon={added ? <CheckOutlined /> : <ShoppingCartOutlined />}
              onClick={agregarAlCarrito}
              disabled={addDisabled || added}
              style={{
                background: added ? '#22c55e' : addDisabled ? '#d9d9d9' : '#f33763',
                border: 'none', borderRadius: '8px',
                fontWeight: '700', height: '50px', fontSize: '15px',
                letterSpacing: '0.3px',
                transition: 'background 0.3s ease',
              }}
            >
              {added
                ? '¡Añadido al carrito!'
                : sinStock
                  ? 'Producto no disponible'
                  : (tallas && !selectedSize)
                    ? 'Selecciona una talla'
                    : `Añadir al carrito${cantidad > 1 ? ` (${cantidad})` : ''}`}
            </Button>
            <Button
              size="large" block onClick={handleClose}
              style={{ borderRadius: '8px', fontWeight: '600', height: '46px', borderColor: '#f33763', color: '#f33763', background: '#fff' }}
            >
              Seguir comprando
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default ProductModal;