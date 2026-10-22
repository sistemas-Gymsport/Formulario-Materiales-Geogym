import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '../../src/config/prisma.js';
import { createRequest } from '../../src/services/requestService.js';
import { buildMonthlyReport } from '../../src/services/reportService.js';
import { closeElapsedMonths } from '../../src/services/monthlyCloseService.js';
import { createTestAdmin, firstBranch, loginAgent, materialIdsByName, resetDatabase } from '../helpers.js';
import { zonedToUtc } from '../../src/utils/time.js';

const TZ = 'America/Mexico_City';
const at = (day, hour = 10) => zonedToUtc({ year: 2026, month: 9, day, hour }, TZ);

const seedMonth = async () => {
  const satelite = await firstBranch('Satélite');
  const lomas = await firstBranch('Lomas');
  const [hojas, papel, cloro] = await materialIdsByName('Hojas blancas', 'Papel higiénico', 'Cloro');
  const make = (name, branchId, materialIds, customMaterials, now) =>
    createRequest({ input: { requesterName: name, branchId, materialIds, customMaterials }, idempotencyKey: randomUUID(), now });
  await make('Ana López Ruiz', satelite.id, [hojas, papel], [], at(1, 0));
  await make('Ana  lopez ruiz', satelite.id, [papel], ['Cinta canela'], at(15));
  await make('Luis Pérez Soto', lomas.id, [papel, cloro], ['Cinta canela'], at(30, 23));
  await make('Fuera Del Mes', lomas.id, [hojas], [], zonedToUtc({ year: 2026, month: 10, day: 1, hour: 0, minute: 5 }, TZ));
};

beforeEach(async () => {
  await resetDatabase();
  await createTestAdmin();
});
afterAll(() => prisma.$disconnect());

describe('reporte mensual', () => {
  it('calcula estadísticas solo con las solicitudes del mes en la zona horaria oficial', async () => {
    await seedMonth();
    const report = await buildMonthlyReport(2026, 9, { includeRequests: true });
    expect(report.summary.totalRequests).toBe(3);
    expect(report.summary.branchesWithRequests).toBe(2);
    expect(report.summary.uniqueRequesters).toBe(2);
    expect(report.summary.totalSelections).toBe(7);
    expect(report.summary.distinctMaterials).toBe(4);
    expect(report.summary.customSelections).toBe(2);
    expect(report.summary.topMaterial).toMatchObject({ name: 'Papel higiénico', value: 3, tie: false });
    expect(report.summary.topBranch).toMatchObject({ name: 'Satélite', value: 2 });
    expect(report.summary.topCategory.name).toBe('Higiene personal');
    expect(report.charts.byDay[0].value).toBe(1);
    expect(report.charts.byDay[29].value).toBe(1);
    expect(report.requests).toHaveLength(3);
    expect(report.insights.some((i) => i.text.includes('Satélite registró el mayor número'))).toBe(true);
  });

  it('no inventa conclusiones cuando no hay datos', async () => {
    const report = await buildMonthlyReport(2026, 3);
    expect(report.summary.totalRequests).toBe(0);
    expect(report.summary.topMaterial).toBeNull();
    expect(report.insights).toHaveLength(1);
  });

  it('el dashboard mensual y el PDF usan la misma consulta', async () => {
    await seedMonth();
    const { agent } = await loginAgent();
    const json = await agent.get('/api/admin/reports/monthly?year=2026&month=9');
    expect(json.status).toBe(200);
    expect(json.body.summary.totalRequests).toBe(3);
  });

  it('genera el PDF en memoria sin escribir archivos en disco', async () => {
    await seedMonth();
    const { agent } = await loginAgent();
    const tmp = os.tmpdir();
    const before = fs.readdirSync(tmp).filter((f) => f.endsWith('.pdf'));
    const writeSpy = vi.spyOn(fs, 'createWriteStream');
    const res = await agent
      .get('/api/admin/reports/monthly/pdf?year=2026&month=9')
      .buffer(true)
      .parse((response, done) => {
        const chunks = [];
        response.on('data', (c) => chunks.push(c));
        response.on('end', () => done(null, Buffer.concat(chunks)));
      });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('reporte-geogym-2026-09.pdf');
    expect(res.body.subarray(0, 5).toString()).toBe('%PDF-');
    expect(res.body.length).toBeGreaterThan(5000);
    expect(writeSpy).not.toHaveBeenCalled();
    expect(fs.readdirSync(tmp).filter((f) => f.endsWith('.pdf'))).toEqual(before);
    expect(fs.existsSync(path.resolve('reports'))).toBe(false);
    writeSpy.mockRestore();
  });

  it('cierra automáticamente los meses terminados de forma idempotente y conserva los datos', async () => {
    await seedMonth();
    const first = await closeElapsedMonths();
    const second = await closeElapsedMonths();
    expect(first).toBeGreaterThan(0);
    expect(second).toBe(0);
    expect(await prisma.monthlyClose.findUnique({ where: { year_month: { year: 2026, month: 9 } } })).not.toBeNull();
    expect((await buildMonthlyReport(2026, 9)).period.isClosed).toBe(true);
    expect(await prisma.request.count()).toBe(4);
  });

  it('el PDF incluye todas las solicitudes aunque el reporte sea extenso', async () => {
    const branch = await firstBranch();
    const materials = await prisma.material.findMany({ select: { id: true } });
    for (let i = 0; i < 60; i += 1) {
      await createRequest({
        input: { requesterName: `Persona Prueba ${String.fromCharCode(65 + (i % 26))}`, branchId: branch.id, materialIds: materials.map((m) => m.id), customMaterials: [] },
        idempotencyKey: randomUUID(),
        now: at(1 + (i % 28))
      });
    }
    const report = await buildMonthlyReport(2026, 9, { includeRequests: true });
    expect(report.requests).toHaveLength(60);
    const { agent } = await loginAgent();
    const res = await agent.get('/api/admin/reports/monthly/pdf?year=2026&month=9').buffer(true).parse((response, done) => {
      const chunks = [];
      response.on('data', (c) => chunks.push(c));
      response.on('end', () => done(null, Buffer.concat(chunks)));
    });
    const pages = (res.body.toString('latin1').match(/\/Type \/Page\b/g) ?? []).length;
    expect(pages).toBeGreaterThan(20);
  });
});
