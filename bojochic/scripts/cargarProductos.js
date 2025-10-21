import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../src/firebase/config.js';

// Datos productos
const productos = [
  // Aros
  {
    id: 'aros-dorados-clasicos',
    nombre: 'Aros Dorados Clásicos',
    categoria: 'aros',
    precio: 3990,
    descripcion: 'Aros elegantes dorados para uso diario',
    img: 'https://i.imgur.com/ABC123.png',
    stock: 15,
  },
  {
    id: 'aros-perlas-elegantes',
    nombre: 'Aros de Perlas Elegantes',
    categoria: 'aros',
    precio: 5990,
    descripcion: 'Aros con perlas naturales',
    img: 'https://i.imgur.com/DEF456.png',
    stock: 8,
  },

  // Chokers
  {
    id: 'choker-negro-clasico',
    nombre: 'Choker Negro Clásico',
    categoria: 'chokers',
    precio: 4990,
    descripcion: 'Choker de terciopelo negro',
    img: 'https://i.imgur.com/GHI789.png',
    stock: 12,
  },

  // Pulseras
  {
    id: 'pulsera-pandora-style',
    nombre: 'Pulsera tipo Pandora',
    categoria: 'pulseras',
    precio: 4990,
    descripcion: 'Pulsera estilo pandora con dijes',
    img: 'https://i.imgur.com/7wWXmBz.png',
    stock: 5,
  },

  // Agregar más
];

// cargar productos
const cargarProductos = async () => {
  try {
    console.log('🚀 Iniciando carga de productos...');

    for (const producto of productos) {
      // Usar setDoc con ID personalizado
      await setDoc(doc(db, 'productos', producto.id), {
        nombre: producto.nombre,
        categoria: producto.categoria,
        precio: producto.precio,
        descripcion: producto.descripcion,
        img: producto.img,
        stock: producto.stock,
        fechaCreacion: new Date(),
        activo: true,
      });

      console.log(`✅ Producto "${producto.nombre}" agregado`);
    }

    console.log('🎉 Todos los productos han sido cargados exitosamente!');
  } catch (error) {
    console.error('❌ Error al cargar productos:', error);
  }
};

cargarProductos();
