// src/components/Productos/BundleModal.jsx
import { useState, useRef } from 'react';
import { Modal, Image, Button, Tag, Space, message, Carousel } from 'antd';
import { ShoppingCartOutlined, CloseOutlined, GiftOutlined, CheckOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { auth, db } from '../../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const CART_KEY = 'bojo_guest_cart';
const getGuestCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; } };
const saveGuestCart = (items) => localStorage.setItem(CART_KEY, JSON.stringify(items));

const BundleModal = ({ visible, bundle, onClose }) => {
  const carouselRef = useRef(null);
  const [loading, setLoading] = useState(false);

  if (!bundle) return null;

  const imagenes = bundle.imagenes?.length > 0 ? bundle.imagenes : [bundle.img].filter(Boolean);
  const ahorro = (bundle.precioNormal || 0) - (bundle.precioBundle || 0);
  const porcentaje = bundle.precioNormal > 0 ? Math.round((ahorro / bundle.precioNormal) * 100) : 0;
  const agotado = bundle.stock === 0 || bundle.activo === false;

  const agregarAlCarrito = async () => {
    if (agotado) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      const cartKey = `bundle_${bundle.id}`;
      const imagen = imagenes[0] || '';

      if (user) {
        const cartItemRef = doc(db, 'users', user.uid, 'cart', cartKey);
        const existing = await getDoc(cartItemRef);
        const currentQty = existing.exists() ? (existing.data().quantity || 0) : 0;
        await setDoc(cartItemRef, {
          id:            bundle.id,
          name:          bundle.nombre,
          price:         bundle.precioBundle,
          image:         imagen,
          quantity:      currentQty + 1,
          addedAt:       new Date().toISOString(),
          esBundle:      true,
          productosSnap: bundle.productosSnap || [],
        });
      } else {
        const cart = getGuestCart();
        const existingIndex = cart.findIndex(item => item.id === cartKey);
        if (existingIndex >= 0) {
          cart[existingIndex].quantity += 1;
        } else {
          cart.push({
            id:            cartKey,
            name:          bundle.nombre,
            price:         bundle.precioBundle,
            image:         imagen,
            quantity:      1,
            addedAt:       new Date().toISOString(),
            esBundle:      true,
            productosSnap: bundle.productosSnap || [],
          });
        }
        saveGuestCart(cart);
        window.dispatchEvent(new CustomEvent('guestCartUpdated'));
      }

      message.success('¡Bundle agregado al carrito!');
      onClose();
    } catch (err) {
      console.error(err);
      message.error('Error al agregar al carrito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ maxWidth: '900px', top: 20 }}
      closeIcon={<CloseOutlined style={{ fontSize: '20px', color: '#666' }} />}
      styles={{ body: { padding: '20px' } }}
    >
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>

        {/* ── Columna imágenes ── */}
        <div style={{ flex: '1 1 300px', minWidth: '250px', position: 'relative' }}>

          {/* Badge bundle */}
          <div style={{
            position: 'absolute', top: '12px', left: '12px', zIndex: 20,
            background: '#722ed1', color: '#fff',
            fontSize: '13px', fontWeight: 700,
            padding: '4px 12px', borderRadius: '20px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <GiftOutlined /> Bundle
          </div>

          {/* Badge descuento */}
          {porcentaje > 0 && (
            <div style={{
              position: 'absolute', top: '12px', right: '12px', zIndex: 20,
              background: '#f33763', color: '#fff',
              fontSize: '13px', fontWeight: 700,
              padding: '4px 12px', borderRadius: '20px',
            }}>
              -{porcentaje}% OFF
            </div>
          )}

          {imagenes.length > 1 ? (
            <div style={{ position: 'relative' }}>
              <Carousel
                ref={carouselRef}
                dotPosition="bottom"
                style={{ borderRadius: '12px', overflow: 'hidden' }}
              >
                {imagenes.map((img, index) => (
                  <div key={index}>
                    <Image
                      src={img}
                      alt={`${bundle.nombre} - Imagen ${index + 1}`}
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
                  background: 'rgba(255,255,255,0.9)', border: 'none',
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
                  background: 'rgba(255,255,255,0.9)', border: 'none',
                  borderRadius: '50%', width: '40px', height: '40px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              />

              <div style={{
                position: 'absolute', bottom: '15px', right: '15px',
                background: 'rgba(0,0,0,0.6)', color: 'white',
                padding: '5px 12px', borderRadius: '20px',
                fontSize: '12px', fontWeight: '500', zIndex: 10,
              }}>
                {imagenes.length} fotos
              </div>
            </div>
          ) : (
            <Image
              src={imagenes[0]}
              alt={bundle.nombre}
              style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px' }}
              preview={{ mask: 'Ver imagen completa' }}
            />
          )}
        </div>

        {/* ── Columna info ── */}
        <div style={{ flex: '1 1 350px', minWidth: '250px' }}>

          <h2 style={{ margin: '0 0 10px 0', fontSize: 'clamp(22px,5vw,28px)', fontWeight: 700, color: '#333' }}>
            {bundle.nombre}
          </h2>

          {/* Precio */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'clamp(26px,6vw,32px)', fontWeight: 'bold', color: '#f33763' }}>
                ${(bundle.precioBundle || 0).toLocaleString('es-CL')}
              </span>
              {bundle.precioNormal > 0 && (
                <span style={{ fontSize: '20px', color: '#bbb', textDecoration: 'line-through' }}>
                  ${bundle.precioNormal.toLocaleString('es-CL')}
                </span>
              )}
            </div>
            {ahorro > 0 && (
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#888' }}>
                Ahorras ${ahorro.toLocaleString('es-CL')}
              </p>
            )}
          </div>

          {/* Tags */}
          <Space style={{ marginBottom: '25px', flexWrap: 'wrap' }}>
            <Tag color="purple" style={{ fontSize: '13px', padding: '4px 10px' }}>
              <GiftOutlined /> Bundle
            </Tag>
            {agotado
              ? <Tag color="red"    style={{ fontSize: '13px', padding: '4px 10px' }}>Agotado</Tag>
              : <Tag color="green"  style={{ fontSize: '13px', padding: '4px 10px' }}>Disponible</Tag>
            }
            {!agotado && bundle.stock > 0 && (
              <Tag color="blue" style={{ fontSize: '13px', padding: '4px 10px' }}>
                {bundle.stock} en stock
              </Tag>
            )}
            {!agotado && bundle.stock <= 5 && bundle.stock > 0 && (
              <Tag color="orange" style={{ fontSize: '13px', padding: '4px 10px' }}>
                ⚡ Últimas unidades
              </Tag>
            )}
          </Space>

          {/* Descripción */}
          {bundle.descripcion && (
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px' }}>Descripción:</h4>
              <p style={{ color: '#666', lineHeight: '1.6', fontSize: '15px' }}>{bundle.descripcion}</p>
            </div>
          )}

          {/* Productos incluidos */}
          {bundle.productosSnap?.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                🎁 Este bundle incluye:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bundle.productosSnap.map((p) => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: '#fafafa', borderRadius: '10px',
                    padding: '10px 12px', border: '1px solid #f0f0f0',
                  }}>
                    {p.imagen && (
                      <Image
                        src={p.imagen} alt={p.nombre}
                        width={52} height={52}
                        style={{ objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                        preview={{ mask: false }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '14px', fontWeight: 600, color: '#333',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {p.nombre}
                      </div>
                      <div style={{ fontSize: '13px', color: '#f33763', fontWeight: 500 }}>
                        ${(p.precio || 0).toLocaleString('es-CL')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info adicional */}
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
            <p style={{ fontSize: '13px', color: '#666', margin: 0, lineHeight: '1.8' }}>
              ✓ Precio especial por llevar el pack completo
              <br />✓ Aplica descuento de despacho por compras sobre $30.000
              <br />✓ Garantía de 30 días
              <br />✓ Atención al cliente 24/7
            </p>
          </div>

          {/* Botones */}
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button
              type="primary" size="large" block
              icon={agotado ? null : <ShoppingCartOutlined />}
              onClick={agregarAlCarrito}
              disabled={agotado || loading}
              loading={loading}
              style={{
                background: agotado ? '#d9d9d9' : 'linear-gradient(45deg, #722ed1, #9b59b6)',
                border: 'none', borderRadius: '8px',
                fontWeight: 600, height: '50px', fontSize: '16px',
              }}
            >
              {agotado ? 'Bundle no disponible' : 'Agregar bundle al carrito'}
            </Button>

            <Button
              size="large" block onClick={onClose}
              style={{
                borderRadius: '8px', fontWeight: 600, height: '45px',
                borderColor: '#f33763', color: '#f33763',
              }}
            >
              Seguir comprando
            </Button>
          </Space>

        </div>
      </div>
    </Modal>
  );
};

export default BundleModal;