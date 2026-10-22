import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { createAdminBody, integrationBody, updateAdminBody } from '../../validators/adminValidators.js';
import { describeSettings, rotateCredential, updateSettings } from '../../services/integrationService.js';
import { retryFailed, sendTestEvent, triggerDelivery } from '../../services/notificationService.js';
import { createAdmin, listAdmins, setAdminActive } from '../../services/authService.js';

const router = Router();

router.get('/integrations', async (req, res) => {
  res.json(await describeSettings());
});

router.put('/integrations', validate({ body: integrationBody }), async (req, res) => {
  const enabled = await updateSettings(req.data.body);
  if (enabled) triggerDelivery();
  res.json(await describeSettings());
});

router.post('/integrations/credential', async (req, res) => {
  const secret = await rotateCredential();
  res.set('Cache-Control', 'no-store').json({ secret, settings: await describeSettings() });
});

router.post('/integrations/test', async (req, res) => {
  const result = await sendTestEvent();
  res.json({ result, settings: await describeSettings() });
});

router.post('/integrations/retry', async (req, res) => {
  const count = await retryFailed();
  res.json({ requeued: count, settings: await describeSettings() });
});

router.get('/admins', async (req, res) => {
  res.json(await listAdmins());
});

router.post('/admins', validate({ body: createAdminBody }), async (req, res) => {
  res.status(201).json(await createAdmin(req.data.body));
});

router.patch('/admins/:id', validate({ params: z.object({ id: z.string().uuid() }), body: updateAdminBody }), async (req, res) => {
  res.json(await setAdminActive(req.admin.id, req.data.params.id, req.data.body.isActive));
});

export default router;
