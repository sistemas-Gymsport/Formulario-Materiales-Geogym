import { getZonedParts, pad } from '../../utils/time.js';
import { COLORS, blob, drawBrandBadge, bottomLimit, contentWidth, createDoc, decoratePages, drawTable, drawWordmark, ensureSpace, left, paragraph, sectionTitle } from './layout.js';
import { areaChart, barChart, donutChart, horizontalBarChart, stackedBarChart } from './charts.js';

const formatDateTime = (iso, timeZone) => {
  const p = getZonedParts(new Date(iso), timeZone);
  return `${pad(p.day)}/${pad(p.month)}/${p.year} ${pad(p.hour)}:${pad(p.minute)}`;
};

const cover = (doc, report, generatedLabel) => {
  const { width, height } = doc.page;
  doc.save().rect(0, 0, width, height).fill(COLORS.beige).restore();
  blob(doc, width - 70, 150, 190, COLORS.coral, 0.95);
  if (!drawBrandBadge(doc, width - 290, 110, 220)) blob(doc, width - 210, 330, 70, COLORS.black, 0.9);
  blob(doc, 60, height - 120, 120, COLORS.gray, 0.08);
  doc.page.margins.bottom = 0;
  drawWordmark(doc, 56, 60, 1.25, COLORS.black);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.coral).text('REPORTE MENSUAL', 56, height * 0.46, { characterSpacing: 3 });
  doc.font('Helvetica-Bold').fontSize(36).fillColor(COLORS.black).text('Solicitudes de\nmateriales', 56, doc.y + 8, { lineGap: -4, width: width - 112 });
  doc.font('Helvetica-Bold').fontSize(22).fillColor(COLORS.coral).text(report.period.label, 56, doc.y + 18);
  doc.save().moveTo(56, doc.y + 18).lineTo(160, doc.y + 18).lineWidth(4).strokeColor(COLORS.black).stroke().restore();
  const metaY = height - 170;
  const meta = [
    ['Periodo', `${report.period.label} · ${report.period.timezone}`],
    ['Generado', generatedLabel],
    ['Estado del periodo', report.period.isClosed ? 'Cerrado' : report.period.isCurrent ? 'En curso' : 'Abierto'],
    ['Solicitudes incluidas', String(report.summary.totalRequests)]
  ];
  meta.forEach(([label, value], i) => {
    const y = metaY + i * 26;
    doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted).text(label.toUpperCase(), 56, y, { characterSpacing: 1.2, lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(10.5).fillColor(COLORS.black).text(value, 200, y - 1.5, { lineBreak: false });
  });
  doc.page.margins.bottom = 64;
};

const kpiGrid = (doc, summary) => {
  const items = [
    ['Solicitudes registradas', summary.totalRequests],
    ['Sucursales participantes', `${summary.branchesWithRequests}/${summary.activeBranches}`],
    ['Solicitantes diferentes', summary.uniqueRequesters],
    ['Selecciones de materiales', summary.totalSelections],
    ['Materiales diferentes', summary.distinctMaterials],
    ['Materiales adicionales', summary.customSelections],
    ['Categoría más solicitada', summary.topCategory ? summary.topCategory.names.join(' / ') : '—'],
    ['Material más frecuente', summary.topMaterial ? summary.topMaterial.names.join(' / ') : '—'],
    ['Sucursal con más solicitudes', summary.topBranch ? summary.topBranch.names.join(' / ') : '—']
  ];
  const cols = 3;
  const gap = 10;
  const w = (contentWidth(doc) - gap * (cols - 1)) / cols;
  const h = 62;
  ensureSpace(doc, Math.ceil(items.length / cols) * (h + gap));
  const startY = doc.y;
  items.forEach(([label, value], i) => {
    const x = left(doc) + (i % cols) * (w + gap);
    const y = startY + Math.floor(i / cols) * (h + gap);
    const accent = i === 0;
    doc.save().roundedRect(x, y, w, h, 10).fill(accent ? COLORS.coral : COLORS.soft).restore();
    doc.font('Helvetica').fontSize(7.5).fillColor(accent ? COLORS.white : COLORS.muted).text(label.toUpperCase(), x + 12, y + 11, { width: w - 24, characterSpacing: 0.6, lineBreak: false });
    const text = String(value);
    doc.font('Helvetica-Bold').fontSize(typeof value === 'number' || text.length < 8 ? 20 : 10.5).fillColor(accent ? COLORS.white : COLORS.black);
    doc.text(text, x + 12, y + (typeof value === 'number' || text.length < 8 ? 28 : 30), { width: w - 24, height: 28, ellipsis: true });
  });
  doc.y = startY + Math.ceil(items.length / cols) * (h + gap) + 6;
};

const insightsBlock = (doc, insights) => {
  insights.forEach((insight) => {
    doc.font('Helvetica').fontSize(10);
    const height = doc.heightOfString(insight.text, { width: contentWidth(doc) - 26, lineGap: 2 }) + 12;
    ensureSpace(doc, height);
    const y = doc.y;
    const color = insight.tone === 'warning' ? COLORS.gray : insight.tone === 'highlight' ? COLORS.coral : COLORS.muted;
    doc.save().circle(left(doc) + 5, y + 6, 3.5).fill(color).restore();
    doc.fillColor(COLORS.gray).text(insight.text, left(doc) + 18, y, { width: contentWidth(doc) - 26, lineGap: 2 });
    doc.y += 6;
  });
};

const chartsSection = (doc, report) => {
  const { charts } = report;
  sectionTitle(doc, 'Visualización', 'Gráficas del mes', { newPage: true });
  const w = contentWidth(doc);
  const half = (w - 12) / 2;
  const x = left(doc);
  let y = doc.y;
  barChart(doc, { x, y, w: half, h: 200, title: 'Solicitudes por sucursal', subtitle: 'Número de solicitudes registradas' }, charts.byBranch);
  areaChart(doc, { x: x + half + 12, y, w: half, h: 200, title: 'Solicitudes por día del mes', subtitle: 'Solicitudes registradas cada día' }, charts.byDay);
  y += 212;
  donutChart(doc, { x, y, w, h: 190, title: 'Participación por categorías', subtitle: 'Selecciones de materiales del catálogo' }, charts.byCategory);
  y += 202;
  const topHeight = Math.max(150, Math.min(charts.topMaterials.length, 12) * 18 + 64);
  if (y + topHeight > bottomLimit(doc)) {
    doc.addPage();
    y = doc.y;
  }
  horizontalBarChart(doc, { x, y, w, h: topHeight, title: 'Materiales más solicitados', subtitle: 'Número de solicitudes que incluyeron cada material' }, charts.topMaterials);
  y += topHeight + 12;
  if (y + 230 > bottomLimit(doc)) {
    doc.addPage();
    y = doc.y;
  }
  stackedBarChart(doc, { x, y, w, h: 230, title: 'Sucursales y categorías', subtitle: 'Selecciones por categoría en cada sucursal' }, charts.branchCategory);
  y += 242;
  if (charts.topCustom.length) {
    const customHeight = charts.topCustom.length * 18 + 64;
    if (y + customHeight > bottomLimit(doc)) {
      doc.addPage();
      y = doc.y;
    }
    horizontalBarChart(doc, { x, y, w, h: customHeight, title: 'Materiales adicionales más frecuentes', subtitle: 'Materiales escritos por los solicitantes' }, charts.topCustom);
    y += customHeight + 12;
  }
  doc.y = y;
};

const share = (value, total) => (total ? `${Math.round((value / total) * 100)}%` : '0%');

const tablesSection = (doc, report) => {
  const { summary, charts } = report;
  sectionTitle(doc, 'Desglose', 'Solicitudes por sucursal', { newPage: true });
  drawTable(doc, {
    columns: [{ label: 'Sucursal', weight: 4, bold: true }, { label: 'Solicitudes', weight: 2, align: 'right' }, { label: 'Participación', weight: 2, align: 'right' }],
    rows: charts.byBranch.map((b) => [b.name, b.value, share(b.value, summary.totalRequests)])
  });
  sectionTitle(doc, 'Desglose', 'Categorías más utilizadas');
  const catalogSelections = charts.byCategory.reduce((s, c) => s + c.value, 0);
  drawTable(doc, {
    columns: [{ label: 'Categoría', weight: 5, bold: true }, { label: 'Selecciones', weight: 2, align: 'right' }, { label: 'Participación', weight: 2, align: 'right' }],
    rows: charts.byCategory.map((c) => [c.name, c.value, share(c.value, catalogSelections)])
  });
  sectionTitle(doc, 'Desglose', 'Materiales más solicitados');
  drawTable(doc, {
    columns: [{ label: '#', weight: 0.6 }, { label: 'Material', weight: 4, bold: true }, { label: 'Categoría', weight: 4 }, { label: 'Solicitudes', weight: 1.6, align: 'right' }],
    rows: report.allMaterials.map((m, i) => [i + 1, m.name, m.category, m.value])
  });
  sectionTitle(doc, 'Fuera de catálogo', 'Materiales adicionales');
  drawTable(doc, {
    columns: [{ label: '#', weight: 0.6 }, { label: 'Material adicional', weight: 7, bold: true }, { label: 'Veces', weight: 1.6, align: 'right' }],
    rows: report.allCustom.map((m, i) => [i + 1, m.name, m.value]),
    emptyText: 'No se registraron materiales adicionales en este periodo.'
  });
};

const requestersSection = (doc, report) => {
  sectionTitle(doc, 'Participación', 'Detalle por solicitante', { newPage: true });
  paragraph(doc, 'Agrupación operativa aproximada por nombre normalizado y sucursal. Dos personas con el mismo nombre en la misma sucursal aparecerán agrupadas.', { size: 8.5, color: COLORS.muted });
  doc.moveDown(0.8);
  drawTable(doc, {
    columns: [{ label: 'Solicitante', weight: 3.4, bold: true }, { label: 'Sucursal', weight: 2 }, { label: 'Solicitudes', weight: 1.4, align: 'right' }, { label: 'Folios', weight: 4 }],
    rows: report.requesters.map((r) => [r.name, r.branch, r.count, r.requests.map((q) => q.folio).join(', ')])
  });
};

const requestBlock = (doc, request, timeZone) => {
  const x = left(doc);
  const w = contentWidth(doc);
  const lines = [...request.categories.map((c) => ({ title: c.name, text: c.materials.join(' · ') }))];
  if (request.customMaterials.length) lines.push({ title: 'Materiales adicionales', text: request.customMaterials.join(' · '), custom: true });
  const bodyHeights = lines.map((l) => {
    const textHeight = doc.font('Helvetica').fontSize(8.6).heightOfString(l.text, { width: w - 150 });
    const titleHeight = doc.font('Helvetica-Bold').fontSize(7.8).heightOfString(l.title, { width: 126 });
    return Math.max(textHeight, titleHeight) + 6;
  });
  const total = 40 + bodyHeights.reduce((s, h) => s + h, 0) + 10;
  ensureSpace(doc, Math.min(total, 160));
  const y = doc.y;
  doc.save().roundedRect(x, y, w, 30, 6).fill(COLORS.beige).restore();
  doc.save().roundedRect(x, y, 4, 30, 2).fill(COLORS.coral).restore();
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLORS.black).text(request.folio, x + 14, y + 6, { lineBreak: false });
  doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.muted).text(formatDateTime(request.createdAt, timeZone), x + 14, y + 18, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.gray).text(request.requesterName, x + 150, y + 6, { width: w - 290, lineBreak: false, ellipsis: true });
  doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.muted).text(request.branchName, x + 150, y + 18, { width: w - 290, lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.coral).text(`${request.itemCount} ${request.itemCount === 1 ? 'material' : 'materiales'}`, x + w - 130, y + 11, { width: 118, align: 'right', lineBreak: false });
  doc.y = y + 36;
  lines.forEach((line, i) => {
    if (doc.y + bodyHeights[i] > bottomLimit(doc)) {
      doc.addPage();
      doc.font('Helvetica-Oblique').fontSize(7.5).fillColor(COLORS.muted).text(`${request.folio} (continuación)`, x, doc.y);
      doc.moveDown(0.4);
    }
    const ly = doc.y;
    doc.font('Helvetica-Bold').fontSize(7.8).fillColor(line.custom ? COLORS.coral : COLORS.gray).text(line.title, x + 14, ly, { width: 126 });
    doc.font('Helvetica').fontSize(8.6).fillColor(COLORS.gray).text(line.text, x + 150, ly, { width: w - 150 });
    doc.y = Math.max(doc.y, ly + bodyHeights[i]);
  });
  doc.y += 10;
};

const detailSection = (doc, report) => {
  sectionTitle(doc, 'Registro completo', 'Detalle de solicitudes', { newPage: true });
  if (!report.requests.length) {
    paragraph(doc, 'No se registraron solicitudes en este periodo.', { color: COLORS.muted });
    return;
  }
  paragraph(doc, `${report.requests.length} solicitudes en orden cronológico. Cada material aparece una sola vez por solicitud; los totales son conteos de selección, no cantidades físicas.`, { size: 8.5, color: COLORS.muted });
  doc.moveDown(0.8);
  report.requests.forEach((request) => requestBlock(doc, request, report.period.timezone));
};

export const renderMonthlyReport = (report, output) => {
  const generatedLabel = formatDateTime(report.generatedAt, report.period.timezone);
  const doc = createDoc(`Reporte de solicitudes · ${report.period.label}`);
  doc.pipe(output);
  cover(doc, report, generatedLabel);
  sectionTitle(doc, 'Resumen ejecutivo', `Panorama de ${report.period.label}`, { newPage: true });
  paragraph(
    doc,
    `Este reporte analiza exclusivamente las solicitudes registradas entre el 1 y el último día de ${report.period.label} (zona horaria ${report.period.timezone}). Los indicadores cuentan solicitudes y selecciones de materiales; no representan cantidades físicas de producto.`,
    { size: 9.5 }
  );
  doc.moveDown(1);
  kpiGrid(doc, report.summary);
  sectionTitle(doc, 'Análisis automático', 'Conclusiones del mes');
  insightsBlock(doc, report.insights);
  chartsSection(doc, report);
  tablesSection(doc, report);
  requestersSection(doc, report);
  detailSection(doc, report);
  decoratePages(doc, { label: `Reporte mensual · ${report.period.label}`, generatedLabel: `Generado ${generatedLabel}` });
  doc.end();
  return doc;
};
