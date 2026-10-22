import { COLORS, PALETTE, truncate } from './layout.js';

const niceMax = (value) => {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude * 4 >= value) * magnitude;
  return step * 4;
};

const chartFrame = (doc, { x, y, w, h, title, subtitle }) => {
  doc.save().roundedRect(x, y, w, h, 10).fill(COLORS.soft).restore();
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(COLORS.black).text(title, x + 14, y + 12, { width: w - 28, lineBreak: false });
  if (subtitle) doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.muted).text(subtitle, x + 14, y + 27, { width: w - 28, lineBreak: false });
  return { x: x + 14, y: y + 46, w: w - 28, h: h - 60 };
};

const emptyChart = (doc, area) => {
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.muted).text('Sin datos en este periodo', area.x, area.y + area.h / 2 - 6, { width: area.w, align: 'center' });
};

const gridLines = (doc, area, max, steps = 4) => {
  doc.font('Helvetica').fontSize(6.5).fillColor(COLORS.muted);
  for (let i = 0; i <= steps; i += 1) {
    const gy = area.y + area.h - (area.h * i) / steps;
    doc.save().moveTo(area.x + 18, gy).lineTo(area.x + area.w, gy).lineWidth(0.4).dash(2, { space: 2 }).strokeColor(COLORS.line).stroke().undash().restore();
    doc.text(String(Math.round((max * i) / steps)), area.x - 4, gy - 3, { width: 18, align: 'right', lineBreak: false });
  }
};

export const barChart = (doc, frame, data) => {
  const area = chartFrame(doc, frame);
  if (!data.some((d) => d.value > 0)) return emptyChart(doc, area);
  const plot = { ...area, h: area.h - 18 };
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  gridLines(doc, plot, max);
  const slot = (plot.w - 22) / data.length;
  const barW = Math.min(34, slot * 0.6);
  data.forEach((d, i) => {
    const bh = (d.value / max) * plot.h;
    const bx = plot.x + 22 + slot * i + (slot - barW) / 2;
    const by = plot.y + plot.h - bh;
    if (bh > 0) doc.save().roundedRect(bx, by, barW, bh, Math.min(4, bh / 2)).fill(i === 0 ? COLORS.coral : COLORS.gray).restore();
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLORS.black).text(String(d.value), bx - 8, by - 11, { width: barW + 16, align: 'center', lineBreak: false });
    doc.font('Helvetica').fontSize(6.8).fillColor(COLORS.gray).text(truncate(doc, d.name, slot - 2), plot.x + 22 + slot * i, plot.y + plot.h + 5, { width: slot, align: 'center', lineBreak: false });
  });
};

export const horizontalBarChart = (doc, frame, data) => {
  const area = chartFrame(doc, frame);
  if (!data.length) return emptyChart(doc, area);
  const labelW = Math.min(150, area.w * 0.42);
  const rowH = Math.min(20, area.h / data.length);
  const max = Math.max(...data.map((d) => d.value));
  const barMax = area.w - labelW - 34;
  data.forEach((d, i) => {
    const ry = area.y + i * rowH;
    const bw = Math.max(2, (d.value / max) * barMax);
    doc.font('Helvetica').fontSize(7.8).fillColor(COLORS.gray).text(truncate(doc, d.name, labelW - 8), area.x, ry + rowH / 2 - 4, { width: labelW - 8, lineBreak: false });
    doc.save().roundedRect(area.x + labelW, ry + rowH * 0.2, bw, rowH * 0.6, 3).fill(i < 3 ? COLORS.coral : COLORS.gray).restore();
    doc.font('Helvetica-Bold').fontSize(7.8).fillColor(COLORS.black).text(String(d.value), area.x + labelW + bw + 6, ry + rowH / 2 - 4, { lineBreak: false });
  });
};

const arcPath = (cx, cy, r, ir, start, end) => {
  const large = end - start > Math.PI ? 1 : 0;
  const p = (radius, angle) => `${cx + radius * Math.cos(angle)} ${cy + radius * Math.sin(angle)}`;
  return `M ${p(r, start)} A ${r} ${r} 0 ${large} 1 ${p(r, end)} L ${p(ir, end)} A ${ir} ${ir} 0 ${large} 0 ${p(ir, start)} Z`;
};

export const donutChart = (doc, frame, data) => {
  const area = chartFrame(doc, frame);
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return emptyChart(doc, area);
  const r = Math.min(area.h / 2, area.w * 0.22);
  const cx = area.x + r + 4;
  const cy = area.y + area.h / 2;
  let angle = -Math.PI / 2;
  data.forEach((d, i) => {
    const sweep = (d.value / total) * Math.PI * 2;
    const end = angle + Math.min(sweep, Math.PI * 2 - 0.0001);
    doc.save().path(arcPath(cx, cy, r, r * 0.6, angle, end)).fill(PALETTE[i % PALETTE.length]).restore();
    angle += sweep;
  });
  doc.font('Helvetica-Bold').fontSize(15).fillColor(COLORS.black).text(String(total), cx - r, cy - 10, { width: r * 2, align: 'center', lineBreak: false });
  doc.font('Helvetica').fontSize(6.5).fillColor(COLORS.muted).text('selecciones', cx - r, cy + 6, { width: r * 2, align: 'center', lineBreak: false });
  const lx = cx + r + 18;
  const lw = area.x + area.w - lx;
  const rowH = Math.min(16, area.h / data.length);
  data.forEach((d, i) => {
    const ly = area.y + (area.h - rowH * data.length) / 2 + i * rowH;
    doc.save().circle(lx + 4, ly + 5, 4).fill(PALETTE[i % PALETTE.length]).restore();
    const pct = `${Math.round((d.value / total) * 100)}%`;
    doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.gray).text(truncate(doc, d.name, lw - 48), lx + 13, ly + 1.5, { width: lw - 48, lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLORS.black).text(pct, lx + lw - 34, ly + 1.5, { width: 34, align: 'right', lineBreak: false });
  });
};

export const areaChart = (doc, frame, data) => {
  const area = chartFrame(doc, frame);
  if (!data.some((d) => d.value > 0)) return emptyChart(doc, area);
  const plot = { ...area, h: area.h - 16 };
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  gridLines(doc, plot, max);
  const startX = plot.x + 22;
  const stepX = (plot.w - 22) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => [startX + stepX * i, plot.y + plot.h - (d.value / max) * plot.h]);
  doc.save().fillOpacity(0.16).fillColor(COLORS.coral);
  doc.moveTo(points[0][0], plot.y + plot.h);
  points.forEach(([px, py]) => doc.lineTo(px, py));
  doc.lineTo(points.at(-1)[0], plot.y + plot.h).closePath().fill().restore();
  doc.save().lineWidth(1.6).strokeColor(COLORS.coral).lineJoin('round');
  doc.moveTo(...points[0]);
  points.slice(1).forEach(([px, py]) => doc.lineTo(px, py));
  doc.stroke().restore();
  doc.font('Helvetica').fontSize(6.5).fillColor(COLORS.muted);
  data.forEach((d, i) => {
    if (d.value > 0) doc.save().circle(points[i][0], points[i][1], 1.8).fill(COLORS.black).restore();
    if (i % (data.length > 20 && area.w < 300 ? 5 : 3) === 0 || i === data.length - 1) doc.text(String(d.day), points[i][0] - 8, plot.y + plot.h + 4, { width: 16, align: 'center', lineBreak: false });
  });
};

export const stackedBarChart = (doc, frame, { categories, rows }) => {
  const area = chartFrame(doc, frame);
  if (!rows.length || !categories.length) return emptyChart(doc, area);
  const legendH = Math.ceil(categories.length / 3) * 12 + 6;
  const plot = { ...area, h: area.h - 18 - legendH };
  const totals = rows.map((r) => categories.reduce((s, c) => s + (r[c] ?? 0), 0));
  const max = niceMax(Math.max(...totals));
  gridLines(doc, plot, max);
  const slot = (plot.w - 22) / rows.length;
  const barW = Math.min(36, slot * 0.6);
  rows.forEach((row, i) => {
    const bx = plot.x + 22 + slot * i + (slot - barW) / 2;
    let by = plot.y + plot.h;
    categories.forEach((c, ci) => {
      const bh = ((row[c] ?? 0) / max) * plot.h;
      if (bh > 0) {
        by -= bh;
        doc.save().rect(bx, by, barW, bh).fill(PALETTE[ci % PALETTE.length]).restore();
      }
    });
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLORS.black).text(String(totals[i]), bx - 8, by - 11, { width: barW + 16, align: 'center', lineBreak: false });
    doc.font('Helvetica').fontSize(6.8).fillColor(COLORS.gray).text(truncate(doc, row.name, slot - 2), plot.x + 22 + slot * i, plot.y + plot.h + 5, { width: slot, align: 'center', lineBreak: false });
  });
  const colW = area.w / 3;
  categories.forEach((c, i) => {
    const lx = area.x + (i % 3) * colW;
    const ly = plot.y + plot.h + 22 + Math.floor(i / 3) * 12;
    doc.save().rect(lx, ly + 1, 7, 7).fill(PALETTE[i % PALETTE.length]).restore();
    doc.font('Helvetica').fontSize(6.8).fillColor(COLORS.gray).text(truncate(doc, c, colW - 16), lx + 11, ly + 1, { width: colW - 16, lineBreak: false });
  });
};
