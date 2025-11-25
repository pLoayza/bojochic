
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config'; 
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto fácilmente
export function useAuth() {
  return useContext(AuthContext);
}

// Proveedor del contexto (envuelve tu app)
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para registrar usuario
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Función para hacer login
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Función para logout
  function logout() {
    return signOut(auth);
  }

  // Detectar cambios en la autenticación (login/logout automático)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup: desuscribirse cuando el componente se desmonte
    return unsubscribe;
  }, []);

  // Valores que estarán disponibles en toda la app
  const value = {
    currentUser,    // Usuario actual (null si no está logueado)
    signup,         // Función de registro
    login,          // Función de login
    logout,         // Función de logout
    loading         // Estado de carga
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}