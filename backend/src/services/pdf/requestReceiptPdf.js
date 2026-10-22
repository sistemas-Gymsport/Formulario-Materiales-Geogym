import PDFDocument from 'pdfkit';
import { COLORS, LOGO_PATH, blob } from './layout.js';
import { getZonedParts, pad } from '../../utils/time.js';

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MARGIN = 44;
const FOOTER = 60;

const clock = (p) => `${p.hour % 12 || 12}:${pad(p.minute)} ${p.hour < 12 ? 'a. m.' : 'p. m.'}`;

const describeDate = (date, timeZone) => {
  const p = getZonedParts(new Date(date), timeZone);
  const weekday = WEEKDAYS[p.weekday];
  return {
    short: `${pad(p.day)}/${pad(p.month)}/${p.year}`,
    long: `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${p.day} de ${MONTHS[p.month - 1]} de ${p.year}`,
    time: clock(p)
  };
};

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const check = (doc, x, y, color = COLORS.coral, ink = COLORS.black) => {
  doc.save().circle(x + 6, y + 6, 6).fill(color).restore();
  doc.save().moveTo(x + 3.2, y + 6.2).lineTo(x + 5.3, y + 8.2).lineTo(x + 9, y + 4.2).lineWidth(1.5).lineCap('round').lineJoin('round').strokeColor(ink).stroke().restore();
};

const plus = (doc, x, y) => {
  doc.save().circle(x + 6, y + 6, 6).fill(COLORS.coralInk ?? '#B81F29').restore();
  doc.save().moveTo(x + 6, y + 3).lineTo(x + 6, y + 9).moveTo(x + 3, y + 6).lineTo(x + 9, y + 6).lineWidth(1.5).lineCap('round').strokeColor(COLORS.white).stroke().restore();
};

const decorate = (doc) => {
  const { width, height } = doc.page;
  doc.save().rect(0, 0, width, height).fill(COLORS.beige).restore();
  doc.save().rect(0, 0, width, height).clip();
  blob(doc, width - 40, 90, 170, COLORS.coral, 1);
  blob(doc, 30, height - 40, 90, COLORS.gray, 0.06);
  doc.restore();
};

const topbar = (doc, request) => {
  const { width } = doc.page;
  if (LOGO_PATH) {
    doc.save().roundedRect(MARGIN, 26, 32, 32, 8).clip();
    doc.image(LOGO_PATH, MARGIN - 2, 24, { width: 36 / 0.8895 });
    doc.restore();
  }
  doc.font('Helvetica-Bold').fontSize(13).fillColor(COLORS.black).text('GEO GYM', MARGIN + 42, 30, { lineBreak: false, characterSpacing: 1.2 });
  doc.font('Helvetica-Bold').fontSize(6.5).fillColor(COLORS.muted).text('MATERIALES', MARGIN + 42, 46, { lineBreak: false, characterSpacing: 2.4 });
  doc.font('Helvetica-Bold').fontSize(8);
  const w = doc.widthOfString(request.folio) + 24;
  doc.save().roundedRect(width - MARGIN - w, 30, w, 20, 10).fill(COLORS.black).restore();
  doc.fillColor(COLORS.white).text(request.folio, width - MARGIN - w, 36, { width: w, align: 'center', lineBreak: false });
};

const footer = (doc, request, page, total) => {
  const { width, height } = doc.page;
  const bottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  doc.save().moveTo(MARGIN, height - 40).lineTo(width - MARGIN, height - 40).lineWidth(0.7).strokeColor(COLORS.line).stroke().restore();
  doc.font('Helvetica-Bold').fontSize(7).fillColor(COLORS.muted).text(`GEO GYM · Reporte de solicitud para material · ${request.branchName}`, MARGIN, height - 31, { lineBreak: false });
  doc.fillColor(COLORS.gray).text(`Página ${page} de ${total}`, MARGIN, height - 31, { width: width - MARGIN * 2, align: 'right', lineBreak: false });
  doc.page.margins.bottom = bottom;
};

const newPage = (doc, request) => {
  doc.addPage();
  decorate(doc);
  topbar(doc, request);
  doc.y = 84;
};

const ensure = (doc, request, height) => {
  if (doc.y + height > doc.page.height - FOOTER) newPage(doc, request);
};

const card = (doc, x, y, w, h, label, value, hint) => {
  doc.save().roundedRect(x, y, w, h, 12).fill(COLORS.soft).restore();
  doc.save().roundedRect(x, y, 4, h, 2).fill(COLORS.coral).restore();
  doc.font('Helvetica-Bold').fontSize(7).fillColor(COLORS.muted).text(label.toUpperCase(), x + 14, y + 10, { characterSpacing: 1.6, lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.black).text(value, x + 14, y + 22, { width: w - 24, height: 16, ellipsis: true, lineBreak: false });
  if (hint) doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted).text(hint, x + 14, y + 39, { width: w - 24, lineBreak: false });
};

const itemsGrid = (doc, request, names, icon, x, w) => {
  const colW = (w - 28) / 2;
  for (let i = 0; i < names.length; i += 2) {
    ensure(doc, request, 20);
    const y = doc.y;
    [names[i], names[i + 1]].forEach((name, col) => {
      if (!name) return;
      const cx = x + 14 + col * colW;
      icon(doc, cx, y);
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLORS.gray).text(name, cx + 18, y + 1.5, { width: colW - 24, lineBreak: false, ellipsis: true });
    });
    doc.y = y + 18;
  }
};

const group = (doc, request, title, names, { custom = false } = {}) => {
  const x = MARGIN;
  const w = doc.page.width - MARGIN * 2;
  const height = 44 + Math.ceil(names.length / 2) * 18 + (custom ? 16 : 0);
  ensure(doc, request, Math.min(height, 120));
  const top = doc.y;
  const fits = top + height <= doc.page.height - FOOTER;
  if (fits) {
    doc.save().roundedRect(x, top, w, height, 14).fill(custom ? '#FDE4E5' : COLORS.soft).restore();
    if (custom) doc.save().roundedRect(x, top, w, height, 14).dash(3, { space: 3 }).lineWidth(1).strokeColor(COLORS.coral).stroke().undash().restore();
  }
  doc.save().circle(x + 23, top + 18, 8).fill(custom ? '#B81F29' : COLORS.coral).restore();
  doc.font('Helvetica-Bold').fontSize(11).fillColor(custom ? '#B81F29' : COLORS.black).text(title, x + 38, top + 12, { lineBreak: false });
  const count = plural(names.length, 'material', 'materiales');
  doc.font('Helvetica-Bold').fontSize(7.5);
  const cw = doc.widthOfString(count) + 16;
  doc.save().roundedRect(x + w - 14 - cw, top + 10, cw, 16, 8).fill(COLORS.black).restore();
  doc.fillColor(COLORS.white).text(count, x + w - 14 - cw, top + 14.5, { width: cw, align: 'center', lineBreak: false });
  doc.save().moveTo(x + 14, top + 34).lineTo(x + w - 14, top + 34).lineWidth(0.7).strokeColor(COLORS.line).stroke().restore();
  doc.y = top + 42;
  itemsGrid(doc, request, names, custom ? plus : check, x, w);
  if (custom) {
    doc.font('Helvetica').fontSize(8).fillColor('#B81F29').text('Escritos por el solicitante; no forman parte del catálogo oficial.', x + 14, doc.y + 2, { lineBreak: false });
    doc.y += 14;
  }
  doc.y += 12;
};

export const renderRequestReceipt = (request, timeZone, output) => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 84, bottom: 0, left: MARGIN, right: MARGIN },
    bufferPages: true,
    autoFirstPage: false,
    info: { Title: `Reporte de solicitud ${request.folio}`, Author: 'GEO GYM', Subject: 'Reporte de solicitud de material' }
  });
  doc.pipe(output);
  newPage(doc, request);
  const { width } = doc.page;
  const contentW = width - MARGIN * 2;
  const when = describeDate(request.createdAt, timeZone);

  if (LOGO_PATH) {
    const sw = 118;
    doc.save().roundedRect(width - MARGIN - sw - 4, 86, sw + 8, sw * 0.8895 + 8, 18).fill(COLORS.white).restore();
    doc.save().roundedRect(width - MARGIN - sw, 90, sw, sw * 0.8895, 14).clip();
    doc.image(LOGO_PATH, width - MARGIN - sw, 90, { width: sw });
    doc.restore();
  }
  doc.save().roundedRect(MARGIN, 92, 22, 3, 1.5).fill(COLORS.coral).restore();
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#B81F29').text('COMPROBANTE DE REGISTRO', MARGIN + 30, 89, { characterSpacing: 2.4, lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(27).fillColor(COLORS.black).text('Reporte de solicitud', MARGIN, 106, { lineBreak: false });
  doc.fillColor(COLORS.coral).text('para material', MARGIN, 136, { lineBreak: false });
  doc.save().moveTo(MARGIN + 2, 172).bezierCurveTo(MARGIN + 50, 162, MARGIN + 120, 160, MARGIN + 170, 166).lineWidth(5).lineCap('round').strokeColor(COLORS.coral).stroke().restore();
  doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.gray).text('Documento generado al confirmar la solicitud. Compártelo en el grupo de WhatsApp del gimnasio como evidencia.', MARGIN, 182, { width: contentW - 150, lineGap: 2 });

  const ty = 222;
  doc.save().roundedRect(MARGIN, ty, contentW, 54, 16).fill(COLORS.black).restore();
  doc.font('Helvetica-Bold').fontSize(7).fillColor('#9C968E').text('FOLIO DE LA SOLICITUD', MARGIN + 20, ty + 12, { characterSpacing: 2.2, lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(18).fillColor(COLORS.coral).text(request.folio, MARGIN + 20, ty + 25, { lineBreak: false });
  doc.save().roundedRect(MARGIN + contentW - 120, ty + 16, 100, 22, 11).fill(COLORS.coral).restore();
  check(doc, MARGIN + contentW - 110, ty + 21, COLORS.black, COLORS.coral);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLORS.black).text('REGISTRADA', MARGIN + contentW - 92, ty + 24.5, { lineBreak: false });

  const gy = ty + 64;
  const cw = (contentW - 8) / 2;
  card(doc, MARGIN, gy, cw, 54, 'Solicitante', request.requesterName);
  card(doc, MARGIN + cw + 8, gy, cw, 54, 'Sucursal', request.branchName);
  card(doc, MARGIN, gy + 62, cw, 54, 'Fecha', when.short, when.long);
  card(doc, MARGIN + cw + 8, gy + 62, cw, 54, 'Hora', when.time, timeZone === 'America/Mexico_City' ? 'Hora del centro de México' : timeZone);

  const sy = gy + 126;
  doc.save().roundedRect(MARGIN, sy, contentW, 62, 16).fill(COLORS.coral).restore();
  doc.font('Helvetica-Bold').fontSize(32).fillColor(COLORS.black).text(String(request.itemCount), MARGIN + 18, sy + 15, { width: 54, lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(11.5).text(request.itemCount === 1 ? 'Material diferente solicitado' : 'Materiales diferentes solicitados', MARGIN + 80, sy + 15, { lineBreak: false });
  doc.font('Helvetica').fontSize(8.5).fillColor('#5A1218').text('Este reporte registra qué materiales se solicitan; no incluye cantidades.', MARGIN + 80, sy + 32, { lineBreak: false });
  doc.y = sy + 78;

  ensure(doc, request, 60);
  doc.font('Helvetica-Bold').fontSize(15).fillColor(COLORS.black).text('Materiales solicitados', MARGIN, doc.y, { lineBreak: false });
  doc.y += 26;
  request.categories.forEach((c) => group(doc, request, c.name, c.materials));
  if (request.customMaterials.length) group(doc, request, 'Materiales adicionales', request.customMaterials, { custom: true });

  ensure(doc, request, 86);
  const ey = doc.y + 4;
  doc.save().roundedRect(MARGIN, ey, contentW, 78, 16).fill(COLORS.black).restore();
  doc.save().circle(MARGIN + 30, ey + 30, 14).fill(COLORS.coral).restore();
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.coral).text('Evidencia para el grupo de WhatsApp', MARGIN + 54, ey + 14, { lineBreak: false });
  doc.font('Helvetica').fontSize(8.8).fillColor('#D9D4CC').text(`Envía este PDF al grupo de WhatsApp del gimnasio para que tu solicitud quede registrada como evidencia. El folio ${request.folio} identifica tu solicitud en el sistema.`, MARGIN + 54, ey + 30, { width: contentW - 70, lineGap: 1.5 });
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#8E887F').text(`Registrada el ${when.long.charAt(0).toLowerCase()}${when.long.slice(1)} a las ${when.time}`, MARGIN + 54, ey + 60, { lineBreak: false });

  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i += 1) {
    doc.switchToPage(range.start + i);
    footer(doc, request, i + 1, range.count);
  }
  doc.end();
  return doc;
};
