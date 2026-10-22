import { Router } from 'express';
import { validate, parse } from '../middleware/validate.js';
import { publicReadLimiter, submitLimiter } from '../middleware/rateLimits.js';
import { idempotencyHeader, receiptBody, requestBody } from '../validators/publicValidators.js';
import { LIMITS } from '../validators/common.js';
import { getAvailability } from '../services/availabilityService.js';
import { getPublicCatalog } from '../services/catalogService.js';
import { listPublicBranches } from '../services/branchService.js';
import { createRequest, getReceiptRequest } from '../services/requestService.js';
import { getTimezone } from '../services/scheduleStore.js';
import { renderRequestReceipt } from '../services/pdf/requestReceiptPdf.js';

const router = Router();

const noStore = (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
};

router.use(noStore);

router.get('/config', publicReadLimiter, async (req, res) => {
  const [availability, branches, categories] = await Promise.all([getAvailability(), listPublicBranches(), getPublicCatalog()]);
  res.json({ availability, branches, categories, limits: LIMITS });
});

router.get('/form-availability', publicReadLimiter, async (req, res) => {
  res.json(await getAvailability());
});

router.get('/branches', publicReadLimiter, async (req, res) => {
  res.json(await listPublicBranches());
});

router.get('/categories', publicReadLimiter, async (req, res) => {
  res.json((await getPublicCatalog()).map(({ materials, ...c }) => ({ ...c, materialCount: materials.length })));
});

router.get('/materials', publicReadLimiter, async (req, res) => {
  res.json((await getPublicCatalog()).flatMap((c) => c.materials.map((m) => ({ ...m, categoryId: c.id, categoryName: c.name }))));
});

router.post('/requests', submitLimiter, validate({ body: requestBody }), async (req, res) => {
  const idempotencyKey = parse(idempotencyHeader, req.get('idempotency-key'));
  const { website, ...input } = req.data.body;
  const result = await createRequest({ input, idempotencyKey });
  res.status(result.replayed ? 200 : 201).json(result);
});

router.post('/requests/receipt', publicReadLimiter, validate({ body: receiptBody }), async (req, res) => {
  const [request, timeZone] = await Promise.all([getReceiptRequest(req.data.body), getTimezone()]);
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="Solicitud-${request.folio}.pdf"`,
    'Cache-Control': 'no-store'
  });
  const doc = renderRequestReceipt(request, timeZone, res);
  req.on('close', () => {
    if (!res.writableEnded) doc.unpipe(res);
  });
});

export default router;
