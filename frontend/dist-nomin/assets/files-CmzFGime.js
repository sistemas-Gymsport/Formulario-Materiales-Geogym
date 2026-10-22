import { c as createLucideIcon } from "./index-DLrGS1ff.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M12 15V3", key: "m9g1x1" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["path", { d: "m7 10 5 5 5-5", key: "brsn70" }]
];
const Download = createLucideIcon("download", __iconNode);
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: filename, rel: "noopener" });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 6e4);
};
const toPdfFile = (blob, filename) => new File([blob], filename, { type: "application/pdf" });
const canShareFile = (file) => Boolean(file && navigator.canShare?.({ files: [file] }));
const shareFile = async (file, { title, text }) => {
  try {
    await navigator.share({ files: [file], title, text });
    return "shared";
  } catch (error) {
    return error?.name === "AbortError" ? "cancelled" : "failed";
  }
};
const safeFilePart = (value) => String(value).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
export {
  Download as D,
  safeFilePart as a,
  canShareFile as c,
  downloadBlob as d,
  shareFile as s,
  toPdfFile as t
};
