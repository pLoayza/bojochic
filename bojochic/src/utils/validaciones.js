export const validateNombre = (nombre) => {
  if (!nombre || nombre.trim() === '') {
    return 'Por favor ingresa tu nombre';
  }
  if (nombre.trim().length < 2) {
    return 'El nombre debe tener al menos 2 caracteres';
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return 'Por favor ingresa tu email';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email inválido';
  }
  return null;
};

export const validateRut = (rut) => {
  if (!rut || rut.trim() === '') {
    return 'Por favor ingresa tu RUT';
  }
  const rutRegex = /^\d{7,8}-[\dkK]$/;
  if (!rutRegex.test(rut)) {
    return 'RUT debe tener formato 12345678-9';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password || password === '') {
    return 'Por favor ingresa tu contraseña';
  }
  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword === '') {
    return 'Por favor confirma tu contraseña';
  }
  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden';
  }
  return null;
};

export const validateForm = (formData) => {
  const errors = {};

  const nombreError = validateNombre(formData.nombre);
  if (nombreError) errors.nombre = nombreError;

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const rutError = validateRut(formData.rut);
  if (rutError) errors.rut = rutError;

  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;

  const confirmPasswordError = validateConfirmPassword(
    formData.password,
    formData.confirmPassword
  );
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
