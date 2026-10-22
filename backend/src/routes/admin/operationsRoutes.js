import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { idParam, monthQuery, uuidParam } from '../../validators/common.js';
import { exceptionBody, requestsQuery, scheduleBody } from '../../validators/adminValidators.js';
import { listRequests } from '../../services/requestQueryService.js';
import { getRequestById } from '../../services/requestService.js';
import { deleteException, getScheduleConfig, saveException, updateSchedule } from '../../services/scheduleService.js';
import { buildMonthlyReport } from '../../services/reportService.js';
import { renderMonthlyReport } from '../../services/pdf/monthlyReportPdf.js';
import { closeMonthManually, listMonthlyCloses } from '../../services/monthlyCloseService.js';
import { getAvailability } from '../../services/availabilityService.js';
import { describeSettings } from '../../services/integrationService.js';
import { getZonedParts, pad } from '../../utils/time.js';

const router = Router();

router.get('/dashboard', async (req, res) => {
  const availability = await getAvailability();
  const now = getZonedParts(new Date(), availability.timezone);
  const [report, recent, integration] = await Promise.all([
    buildMonthlyReport(now.year, now.month),
    listRequests({ page: 1, pageSize: 6 }),
    describeSettings()
  ]);
  res.json({
    availability,
    report,
    recent: recent.data,
    integration: { enabled: integration.enabled, connectionStatus: integration.connectionStatus, outbox: integration.outbox }
  });
});

router.get('/requests', validate({ query: requestsQuery }), async (req, res) => {
  res.json(await listRequests(req.data.query));
});

router.get('/requests/:id', validate({ params: uuidParam }), async (req, res) => {
  res.json(await getRequestById(req.data.params.id));
});

router.get('/schedule', async (req, res) => {
  res.json(await getScheduleConfig());
});

router.put('/schedule', validate({ body: scheduleBody }), async (req, res) => {
  await updateSchedule(req.data.body, req.admin.username);
  res.json(await getScheduleConfig());
});

router.post('/schedule/exceptions', validate({ body: exceptionBody }), async (req, res) => {
  res.status(201).json(await saveException(req.data.body));
});

router.delete('/schedule/exceptions/:id', validate({ params: idParam }), async (req, res) => {
  await deleteException(req.data.params.id);
  res.status(204).end();
});

router.get('/reports/monthly', validate({ query: monthQuery }), async (req, res) => {
  const { year, month } = req.data.query;
  res.json(await buildMonthlyReport(year, month));
});

router.get('/reports/monthly/pdf', validate({ query: monthQuery }), async (req, res) => {
  const { year, month } = req.data.query;
  const report = await buildMonthlyReport(year, month, { includeRequests: true });
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="reporte-geogym-${year}-${pad(month)}.pdf"`,
    'Cache-Control': 'no-store'
  });
  const doc = renderMonthlyReport(report, res);
  req.on('close', () => {
    if (!res.writableEnded) doc.unpipe(res);
  });
});

router.get('/reports/closes', async (req, res) => {
  res.json(await listMonthlyCloses());
});

router.post('/reports/closes', validate({ body: monthQuery }), async (req, res) => {
  const { year, month } = req.data.body;
  res.status(201).json(await closeMonthManually(year, month, req.admin.id));
});

export default router;
