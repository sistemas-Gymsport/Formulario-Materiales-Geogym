export const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,40}$/;

export const passwordProblems = (password, username = '') => {
  const problems = [];
  if (password.length < 12) problems.push('mínimo 12 caracteres');
  if (password.length > 128) problems.push('máximo 128 caracteres');
  if (!/[a-z]/.test(password)) problems.push('una letra minúscula');
  if (!/[A-Z]/.test(password)) problems.push('una letra mayúscula');
  if (!/\d/.test(password)) problems.push('un número');
  if (!/[^a-zA-Z0-9]/.test(password)) problems.push('un símbolo');
  if (username && password.toLowerCase().includes(username.toLowerCase())) problems.push('no contener el nombre de usuario');
  if (/(.)\1{3,}/.test(password)) problems.push('no repetir el mismo carácter más de 3 veces seguidas');
  return problems;
};
