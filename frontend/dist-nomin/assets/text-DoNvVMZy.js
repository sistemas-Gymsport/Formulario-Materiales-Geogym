import { c as createLucideIcon } from "./index-DLrGS1ff.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 16h6", key: "100bgy" }],
  ["path", { d: "M19 13v6", key: "85cyf1" }],
  [
    "path",
    {
      d: "M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14",
      key: "e7tb2h"
    }
  ],
  ["path", { d: "m7.5 4.27 9 5.15", key: "1c824w" }],
  ["polyline", { points: "3.29 7 12 12 20.71 7", key: "ousv84" }],
  ["line", { x1: "12", x2: "12", y1: "22", y2: "12", key: "a4e8g8" }]
];
const PackagePlus = createLucideIcon("package-plus", __iconNode);
const collapseSpaces = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const normalizeKey = (value) => collapseSpaces(value).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[.,;:]+$/g, "").replace(/[^a-z0-9ñ ()\-/+&]/g, "").trim();
const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;
const toTitleSentence = (value) => {
  const clean = collapseSpaces(value);
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};
const NAME_PATTERN = /^[\p{L}][\p{L} .'\-]*$/u;
const LABEL_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} .,'()\-/+&#°]*$/u;
const validateRequesterName = (value, limits) => {
  const clean = collapseSpaces(value);
  if (!clean) return "Escribe tu nombre completo";
  if (clean.length < limits.nameMin) return `Debe tener al menos ${limits.nameMin} caracteres`;
  if (clean.length > limits.nameMax) return `Máximo ${limits.nameMax} caracteres`;
  if (!NAME_PATTERN.test(clean)) return "Usa solo letras y espacios";
  if (clean.split(" ").length < 2) return "Escribe nombre y apellido";
  return null;
};
const validateCustomName = (value, limits) => {
  const clean = collapseSpaces(value);
  if (!clean) return "Escribe el nombre del material";
  if (clean.length < limits.customMin) return `Debe tener al menos ${limits.customMin} caracteres`;
  if (clean.length > limits.customMax) return `Máximo ${limits.customMax} caracteres`;
  if (!LABEL_PATTERN.test(clean)) return "Contiene caracteres no permitidos";
  return null;
};
export {
  PackagePlus as P,
  validateRequesterName as a,
  collapseSpaces as c,
  normalizeKey as n,
  plural as p,
  toTitleSentence as t,
  validateCustomName as v
};
