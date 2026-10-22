import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';

export const COLORS = {
  beige: '#EBE8E2',
  coral: '#F64851',
  gray: '#393939',
  black: '#000000',
  white: '#FFFFFF',
  muted: '#7C7770',
  line: '#D8D2C8',
  soft: '#F6F4F0'
};

export const PALETTE = ['#F64851', '#393939', '#B5A595', '#FF9A9E', '#77716A', '#D9CEC1', '#000000', '#C7363E'];

const ASSETS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../assets');
export const LOGO_PATH = ['logo.png', 'logo.jpg', 'logo.jpeg'].map((f) => path.join(ASSETS, f)).find((f) => fs.existsSync(f)) ?? null;
const LOGO_RATIO = 1779 / 2000;

export const createDoc = (title) =>
  new PDFDocument({
    size: 'A4',
    margins: { top: 78, bottom: 64, left: 48, right: 48 },
    bufferPages: true,
    autoFirstPage: true,
    info: { Title: title, Author: 'GEO GYM', Subject: 'Reporte mensual de solicitudes de materiales', Creator: 'GEO GYM · Sistema de solicitudes' }
  });

export const contentWidth = (doc) => doc.page.width - doc.page.margins.left - doc.page.margins.right;

export const left = (doc) => doc.page.margins.left;

export const bottomLimit = (doc) => doc.page.height - doc.page.margins.bottom;

export const ensureSpace = (doc, height) => {
  if (doc.y + height > bottomLimit(doc)) doc.addPage();
};

export const truncate = (doc, text, width) => {
  const value = String(text);
  if (doc.widthOfString(value) <= width) return value;
  let cut = value;
  while (cut.length > 1 && doc.widthOfString(`${cut}…`) > width) cut = cut.slice(0, -1);
  return `${cut}…`;
};

export const drawWordmark = (doc, x, y, size = 1, color = COLORS.black) => {
  doc.save();
  if (LOGO_PATH) {
    const h = 24 * size;
    doc.roundedRect(x, y - 1 * size, h, h, 5 * size).clip();
    doc.image(LOGO_PATH, x - (h / LOGO_RATIO - h) / 2, y - 1 * size - h * 0.12, { width: h / LOGO_RATIO });
    doc.restore().save();
    doc.font('Helvetica-Bold').fontSize(18 * size).fillColor(color).text('GEO GYM', x + 32 * size, y + 2 * size, { lineBreak: false, characterSpacing: 1.5 * size });
    doc.restore();
    return;
  }
  doc.circle(x + 11 * size, y + 11 * size, 11 * size).fill(COLORS.coral);
  doc.circle(x + 11 * size, y + 11 * size, 4.5 * size).fill(COLORS.beige);
  doc.font('Helvetica-Bold').fontSize(18 * size).fillColor(color).text('GEO GYM', x + 28 * size, y + 2 * size, { lineBreak: false, characterSpacing: 1.5 * size });
  doc.restore();
};

export const drawBrandBadge = (doc, x, y, width) => {
  if (!LOGO_PATH) return false;
  const height = width * LOGO_RATIO;
  doc.save().roundedRect(x - 6, y - 6, width + 12, height + 12, 22).fill(COLORS.beige).restore();
  doc.save().roundedRect(x, y, width, height, 18).clip();
  doc.image(LOGO_PATH, x, y, { width, height });
  doc.restore();
  return true;
};

export const blob = (doc, cx, cy, r, color, opacity = 1) => {
  const k = r * 0.56;
  doc.save().fillOpacity(opacity).fillColor(color);
  doc
    .moveTo(cx, cy - r)
    .bezierCurveTo(cx + k * 1.3, cy - r, cx + r * 1.1, cy - k, cx + r, cy + r * 0.1)
    .bezierCurveTo(cx + r * 0.9, cy + k * 1.4, cx + k * 0.6, cy + r * 1.05, cx - r * 0.1, cy + r * 0.95)
    .bezierCurveTo(cx - k * 1.5, cy + r * 0.9, cx - r * 1.05, cy + k * 0.5, cx - r * 0.95, cy - r * 0.15)
    .bezierCurveTo(cx - r * 0.9, cy - k * 1.3, cx - k * 0.9, cy - r, cx, cy - r)
    .fill();
  doc.restore();
};

export const sectionTitle = (doc, kicker, title, { newPage = false } = {}) => {
  if (newPage) doc.addPage();
  else ensureSpace(doc, 90);
  const x = left(doc);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.coral).text(kicker.toUpperCase(), x, doc.y, { characterSpacing: 2 });
  doc.moveDown(0.3);
  doc.font('Helvetica-Bold').fontSize(19).fillColor(COLORS.black).text(title, x, doc.y);
  const lineY = doc.y + 6;
  doc.save().moveTo(x, lineY).lineTo(x + 46, lineY).lineWidth(3).strokeColor(COLORS.coral).stroke().restore();
  doc.y = lineY + 16;
};

export const paragraph = (doc, text, options = {}) => {
  doc.font(options.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(options.size ?? 10).fillColor(options.color ?? COLORS.gray);
  doc.text(text, left(doc), doc.y, { width: contentWidth(doc), lineGap: 2.5, ...options });
};

export const drawTable = (doc, { columns, rows, emptyText = 'Sin registros en este periodo.' }) => {
  const x = left(doc);
  const width = contentWidth(doc);
  const totalWeight = columns.reduce((s, c) => s + c.weight, 0);
  const widths = columns.map((c) => (c.weight / totalWeight) * width);
  const header = () => {
    ensureSpace(doc, 46);
    const y = doc.y;
    doc.save().roundedRect(x, y, width, 22, 4).fill(COLORS.gray).restore();
    let cx = x;
    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.white);
    columns.forEach((c, i) => {
      doc.text(c.label.toUpperCase(), cx + 8, y + 7.5, { width: widths[i] - 16, align: c.align ?? 'left', lineBreak: false, characterSpacing: 0.8 });
      cx += widths[i];
    });
    doc.y = y + 24;
  };
  header();
  if (!rows.length) {
    paragraph(doc, emptyText, { color: COLORS.muted });
    doc.moveDown();
    return;
  }
  doc.font('Helvetica').fontSize(9);
  rows.forEach((row, index) => {
    const heights = row.map((cell, i) => doc.heightOfString(String(cell), { width: widths[i] - 16 }));
    const h = Math.max(...heights) + 10;
    if (doc.y + h > bottomLimit(doc)) {
      doc.addPage();
      header();
      doc.font('Helvetica').fontSize(9);
    }
    const y = doc.y;
    if (index % 2 === 0) doc.save().rect(x, y, width, h).fill(COLORS.soft).restore();
    let cx = x;
    row.forEach((cell, i) => {
      doc.font(columns[i].bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).fillColor(columns[i].color ?? COLORS.gray);
      doc.text(String(cell), cx + 8, y + 5, { width: widths[i] - 16, align: columns[i].align ?? 'left' });
      cx += widths[i];
    });
    doc.y = y + h;
  });
  doc.moveDown(1.2);
};

export const decoratePages = (doc, { label, generatedLabel }) => {
  const range = doc.bufferedPageRange();
  for (let i = range.start + 1; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    const { width, height } = doc.page;
    const savedBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    drawWordmark(doc, 48, 30, 0.72, COLORS.black);
    doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted).text(label, 48, 36, { width: width - 96, align: 'right', lineBreak: false });
    doc.save().moveTo(48, 58).lineTo(width - 48, 58).lineWidth(0.6).strokeColor(COLORS.line).stroke().restore();
    doc.save().moveTo(48, height - 44).lineTo(width - 48, height - 44).lineWidth(0.6).strokeColor(COLORS.line).stroke().restore();
    doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.muted).text(`GEO GYM · Solicitudes de materiales · ${generatedLabel}`, 48, height - 34, { lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLORS.gray).text(`Página ${i + 1} de ${range.count}`, 48, height - 34, { width: width - 96, align: 'right', lineBreak: false });
    doc.page.margins.bottom = savedBottom;
  }
};
