export const collapseSpaces = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

export const normalizeKey = (value) =>
  collapseSpaces(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[.,;:]+$/g, '')
    .replace(/[^a-z0-9ñ ()\-/+&]/g, '')
    .trim();

export const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

export const toTitleSentence = (value) => {
  const clean = collapseSpaces(value);
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

const NAME_PATTERN = /^[\p{L}][\p{L} .'\-]*$/u;
const LABEL_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} .,'()\-/+&#°]*$/u;

export const validateRequesterName = (value, limits) => {
  const clean = collapseSpaces(value);
  if (!clean) return 'Escribe tu nombre completo';
  if (clean.length < limits.nameMin) return `Debe tener al menos ${limits.nameMin} caracteres`;
  if (clean.length > limits.nameMax) return `Máximo ${limits.nameMax} caracteres`;
  if (!NAME_PATTERN.test(clean)) return 'Usa solo letras y espacios';
  if (clean.split(' ').length < 2) return 'Escribe nombre y apellido';
  return null;
};

export const validateCustomName = (value, limits) => {
  const clean = collapseSpaces(value);
  if (!clean) return 'Escribe el nombre del material';
  if (clean.length < limits.customMin) return `Debe tener al menos ${limits.customMin} caracteres`;
  if (clean.length > limits.customMax) return `Máximo ${limits.customMax} caracteres`;
  if (!LABEL_PATTERN.test(clean)) return 'Contiene caracteres no permitidos';
  return null;
};
