export const calcularPrecio = (producto) => {
  const precioOriginal = producto.precio || producto.price || 0;
  const porcentaje = producto.descuento || 0;

  if (!porcentaje || porcentaje <= 0) {
    return { precioFinal: precioOriginal, precioOriginal, tieneDescuento: false, porcentaje: 0 };
  }

  const precioFinal = Math.round(precioOriginal * (1 - porcentaje / 100));
  return { precioFinal, precioOriginal, tieneDescuento: true, porcentaje };
};

export const formatearPrecio = (precio) =>
  typeof precio === 'number' ? `$${precio.toLocaleString('es-CL')}` : precio;