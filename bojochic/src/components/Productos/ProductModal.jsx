// src/components/Productos/ProductModal.jsx
import { useState } from 'react';
import { Modal, Image, Button, Tag, Descriptions, Space, message, Carousel } from 'antd';
import { ShoppingCartOutlined, CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { auth, db } from '../../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

// ─── Helpers localStorage (guest) ────────────────────────────────────────────
const CART_KEY = 'bojo_guest_cart';

const getGuestCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
};

const saveGuestCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};
// ─────────────────────────────────────────────────────────────────────────────

const ProductModal = ({ visible, producto, onClose }) => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const [selectedSize, setSelectedSize] = useState(null); // ← NUEVO

  if (!producto) return null;

  // ── Tallas: solo si el producto tiene tieneTallas: true y array con elementos ──
  const tallas = producto.tieneTallas && Array.isArray(producto.tallas) && producto.tallas.length > 0
    ? producto.tallas
    : null;

  const imagenes = producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0
    ? producto.imagenes
    : [producto.img || producto.imagen || producto.image];

  const categorias = producto.categorias && Array.isArray(producto.categorias) && producto.categorias.length > 0
    ? producto.categorias
    : (producto.categoria ? [producto.categoria] : []);

  const formatearPrecio = (precio) => {
    if (typeof precio === 'number') return `$${precio.toLocaleString('es-CL')}`;
    return precio;
  };

  // ── Agregar al carrito (usuario registrado O guest) ──────────────────────
  const agregarAlCarrito = async () => {
    const user = auth.currentUser;

    // ── Construir key único: si tiene talla, el id incluye la talla ──
    const cartItemId = tallas && selectedSize
      ? `${producto.id}_${selectedSize}`
      : producto.id;

    try {
      if (user) {
        // ── Usuario registrado: Firestore ──
        const cartItemRef = doc(db, 'users', user.uid, 'cart', cartItemId);
        const existing = await getDoc(cartItemRef);
        const currentQty = existing.exists() ? (existing.data().quantity || 0) : 0;

        await setDoc(cartItemRef, {
          id:       producto.id,
          name:     producto.nombre || producto.title,
          price:    producto.precio || producto.price,
          image:    imagenes[0],
          quantity: currentQty + 1,
          addedAt:  new Date().toISOString(),
          size:     selectedSize || null, // ← CAMBIADO
          color:    producto.color || null,
        });

      } else {
        // ── Guest: localStorage ──
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
            price:    producto.precio || producto.price,
            image:    imagenes[0],
            quantity: 1,
            addedAt:  new Date().toISOString(),
            size:     selectedSize || null, // ← CAMBIADO
            color:    producto.color || null,
          });
        }

        saveGuestCart(cart);
        window.dispatchEvent(new CustomEvent('guestCartUpdated'));
      }

      message.success('¡Producto agregado al carrito!');
      setSelectedSize(null); // reset al cerrar
      onClose();

    } catch (error) {
      console.error('Error agregando al carrito:', error);
      message.error('Error al agregar al carrito');
    }
  };

  const handleClose = () => {
    setSelectedSize(null);
    onClose();
  };

  const sinStock = producto.stock === 0 || producto.activo === false;
  const addDisabled = sinStock || (tallas && !selectedSize); // ← NUEVO

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      width="90%"
      style={{ maxWidth: '900px', top: 20 }}
      closeIcon={<CloseOutlined style={{ fontSize: '20px', color: '#666' }} />}
      styles={{
        body: { padding: '20px' },
      }}
    >
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>

        {/* Columna de imágenes con Carousel */}
        <div style={{ flex: '1 1 300px', minWidth: '250px', position: 'relative' }}>
          {imagenes.length > 1 ? (
            <div style={{ position: 'relative' }}>
              <Carousel
                ref={carouselRef}
                arrows
                dotPosition="bottom"
                style={{ borderRadius: '12px', overflow: 'hidden' }}
              >
                {imagenes.map((img, index) => (
                  <div key={index}>
                    <Image
                      src={img}
                      alt={`${producto.nombre || producto.title} - Imagen ${index + 1}`}
                      style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px' }}
                      preview={{ mask: 'Ver imagen completa' }}
                    />
                  </div>
                ))}
              </Carousel>

              <Button
                icon={<LeftOutlined />}
                onClick={() => carouselRef.current?.prev()}
                style={{
                  position: 'absolute', left: '10px', top: '50%',
                  transform: 'translateY(-50%)', zIndex: 10,
                  background: 'rgba(255, 255, 255, 0.9)', border: 'none',
                  borderRadius: '50%', width: '40px', height: '40px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              />
              <Button
                icon={<RightOutlined />}
                onClick={() => carouselRef.current?.next()}
                style={{
                  position: 'absolute', right: '10px', top: '50%',
                  transform: 'translateY(-50%)', zIndex: 10,
                  background: 'rgba(255, 255, 255, 0.9)', border: 'none',
                  borderRadius: '50%', width: '40px', height: '40px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              />

              <div style={{
                position: 'absolute', bottom: '15px', right: '15px',
                background: 'rgba(0, 0, 0, 0.6)', color: 'white',
                padding: '5px 12px', borderRadius: '20px',
                fontSize: '12px', fontWeight: '500', zIndex: 10,
              }}>
                {imagenes.length} fotos
              </div>
            </div>
          ) : (
            <Image
              src={imagenes[0]}
              alt={producto.nombre || producto.title}
              style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px' }}
              preview={{ mask: 'Ver imagen completa' }}
            />
          )}
        </div>

        {/* Columna de información */}
        <div style={{ flex: '1 1 350px', minWidth: '250px' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '700', color: '#333' }}>
            {producto.nombre || producto.title}
          </h2>

          <div style={{ fontSize: 'clamp(26px, 6vw, 32px)', fontWeight: 'bold', color: '#f33763', marginBottom: '20px' }}>
            {formatearPrecio(producto.precio || producto.price)}
          </div>

          <Space style={{ marginBottom: '25px', flexWrap: 'wrap' }}>
            {producto.activo !== false && (
              <Tag color="green" style={{ fontSize: '13px', padding: '4px 10px' }}>Disponible</Tag>
            )}
            {producto.stock > 0 ? (
              <Tag color="blue" style={{ fontSize: '13px', padding: '4px 10px' }}>{producto.stock} en stock</Tag>
            ) : (
              <Tag color="red" style={{ fontSize: '13px', padding: '4px 10px' }}>Agotado</Tag>
            )}
            {categorias.map((cat, index) => (
              <Tag key={index} color="magenta" style={{ fontSize: '13px', padding: '4px 10px' }}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Tag>
            ))}
          </Space>

          {producto.descripcion && (
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>Descripción:</h4>
              <p style={{ color: '#666', lineHeight: '1.6', fontSize: '15px' }}>{producto.descripcion}</p>
            </div>
          )}

          {/* ── Selector de talla interactivo (reemplaza el campo estático) ── */}
          {tallas ? (
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Talla:</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {tallas.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedSize(t)}
                    style={{
                      padding: '8px 18px',
                      border: selectedSize === t ? '2px solid #f33763' : '1.5px solid #ddd',
                      borderRadius: '8px',
                      background: selectedSize === t ? '#fff0f4' : '#fff',
                      color: selectedSize === t ? '#f33763' : '#555',
                      fontWeight: selectedSize === t ? '700' : '500',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p style={{ color: '#f33763', fontSize: '12px', margin: '8px 0 0 0' }}>
                  * Selecciona una talla para agregar al carrito
                </p>
              )}
            </div>
          ) : (
            /* Tabla de detalles estáticos solo si no hay tallas dinámicas */
            (producto.material || producto.talla || producto.color || producto.peso) && (
              <Descriptions column={1} bordered size="small" style={{ marginBottom: '25px' }}>
                {producto.material && (
                  <Descriptions.Item label="Material" labelStyle={{ fontWeight: '600', width: '100px' }}>
                    {producto.material}
                  </Descriptions.Item>
                )}
                {producto.talla && (
                  <Descriptions.Item label="Tamaño" labelStyle={{ fontWeight: '600', width: '100px' }}>
                    {producto.talla}
                  </Descriptions.Item>
                )}
                {producto.color && (
                  <Descriptions.Item label="Color" labelStyle={{ fontWeight: '600', width: '100px' }}>
                    {producto.color}
                  </Descriptions.Item>
                )}
                {producto.peso && (
                  <Descriptions.Item label="Peso" labelStyle={{ fontWeight: '600', width: '100px' }}>
                    {producto.peso}
                  </Descriptions.Item>
                )}
              </Descriptions>
            )
          )}

          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
            <p style={{ fontSize: '13px', color: '#666', margin: 0, lineHeight: '1.8' }}>
              ✓ aplica descuento de 3990 en despacho por compras sobre 30000
              <br />✓ Garantía de 30 días
              <br />✓ Atención al cliente 24/7
            </p>
          </div>

          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button
              type="primary"
              size="large"
              block
              icon={<ShoppingCartOutlined />}
              onClick={agregarAlCarrito}
              disabled={addDisabled} // ← CAMBIADO
              style={{
                background: addDisabled
                  ? '#d9d9d9'
                  : 'linear-gradient(45deg, #f33763, #FF6B9D)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                height: '50px',
                fontSize: '16px',
              }}
            >
              {sinStock
                ? 'Producto no disponible'
                : (tallas && !selectedSize)
                  ? 'Selecciona una talla'
                  : 'Agregar al carrito'}
            </Button>

            <Button
              size="large"
              block
              onClick={handleClose}
              style={{ borderRadius: '8px', fontWeight: '600', height: '45px', borderColor: '#f33763', color: '#f33763' }}
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