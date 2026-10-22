import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { idParam, moveBody } from '../../validators/common.js';
import {
  ICONS,
  branchBody,
  branchPatch,
  categoryBody,
  categoryPatch,
  materialBody,
  materialPatch,
  materialQuery
} from '../../validators/adminValidators.js';
import * as catalog from '../../services/catalogService.js';
import * as branches from '../../services/branchService.js';

const router = Router();

router.get('/materials', validate({ query: materialQuery }), async (req, res) => {
  res.json(await catalog.listMaterials(req.data.query));
});

router.get('/materials/custom', async (req, res) => {
  res.json(await catalog.listCustomMaterials());
});

router.post('/materials', validate({ body: materialBody }), async (req, res) => {
  res.status(201).json(await catalog.createMaterial(req.data.body));
});

router.patch('/materials/:id', validate({ params: idParam, body: materialPatch }), async (req, res) => {
  res.json(await catalog.updateMaterial(req.data.params.id, req.data.body));
});

router.post('/materials/:id/move', validate({ params: idParam, body: moveBody }), async (req, res) => {
  res.json(await catalog.moveMaterial(req.data.params.id, req.data.body.direction));
});

router.get('/categories', async (req, res) => {
  res.json({ categories: await catalog.listCategories(), icons: ICONS });
});

router.post('/categories', validate({ body: categoryBody }), async (req, res) => {
  res.status(201).json(await catalog.createCategory(req.data.body));
});

router.patch('/categories/:id', validate({ params: idParam, body: categoryPatch }), async (req, res) => {
  res.json(await catalog.updateCategory(req.data.params.id, req.data.body));
});

router.post('/categories/:id/move', validate({ params: idParam, body: moveBody }), async (req, res) => {
  res.json(await catalog.moveCategory(req.data.params.id, req.data.body.direction));
});

router.get('/branches', async (req, res) => {
  res.json(await branches.listBranches());
});

router.post('/branches', validate({ body: branchBody }), async (req, res) => {
  res.status(201).json(await branches.createBranch(req.data.body));
});

router.patch('/branches/:id', validate({ params: idParam, body: branchPatch }), async (req, res) => {
  res.json(await branches.updateBranch(req.data.params.id, req.data.body));
});

router.post('/branches/:id/move', validate({ params: idParam, body: moveBody }), async (req, res) => {
  res.json(await branches.moveBranch(req.data.params.id, req.data.body.direction));
});

export default router;
