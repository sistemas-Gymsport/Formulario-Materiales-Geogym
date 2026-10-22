export const collapseSpaces = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

export const normalizeKey = (value) =>
  collapseSpaces(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[.,;:]+$/g, '')
    .replace(/[^a-z0-9ñ ()\-/+&]/g, '')
    .trim();

export const slugify = (value) =>
  normalizeKey(value)
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);

export const toTitleSentence = (value) => {
  const clean = collapseSpaces(value);
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};
