import { describe, test, expect } from 'vitest';
import { validateForm } from './validaciones';

describe('Validaciones de Registro', () => {
  test('formulario vacío muestra todos los errores', () => {
    const result = validateForm({
      nombre: '',
      email: '',
      rut: '',
      password: '',
      confirmPassword: '',
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.nombre).toBe('Por favor ingresa tu nombre');
    expect(result.errors.email).toBe('Por favor ingresa tu email');
    expect(result.errors.rut).toBe('Por favor ingresa tu RUT');
    expect(result.errors.password).toBe('Por favor ingresa tu contraseña');
    expect(result.errors.confirmPassword).toBe(
      'Por favor confirma tu contraseña'
    );
  });

  test('datos inválidos muestran errores específicos', () => {
    const result = validateForm({
      nombre: 'A', // muy corto
      email: 'email-malo', // formato inválido
      rut: '123', // formato inválido
      password: '123', // muy corta
      confirmPassword: '456', // no coincide
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.nombre).toBe(
      'El nombre debe tener al menos 2 caracteres'
    );
    expect(result.errors.email).toBe('Email inválido');
    expect(result.errors.rut).toBe('RUT debe tener formato 12345678-9');
    expect(result.errors.password).toBe(
      'La contraseña debe tener al menos 6 caracteres'
    );
    expect(result.errors.confirmPassword).toBe('Las contraseñas no coinciden');
  });

  test('formulario válido pasa todas las validaciones', () => {
    const result = validateForm({
      nombre: 'Juan Pérez',
      email: 'juan@gmail.com',
      rut: '12345678-9',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });
});
