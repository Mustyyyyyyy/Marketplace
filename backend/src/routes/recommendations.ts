import { Router } from 'express';
import * as svc from '../services/recommendationService';

const router = Router();
router.get('/tasks/:taskId/recommendations', async (req, res, next) => { try { res.json({ taskers: await svc.recommendTaskers(req.params.taskId) }); } catch (e) { next(e); } });
router.get('/taskers/:taskerId/recommendations', async (req, res, next) => { try { res.json({ tasks: await svc.recommendTasksForTasker(req.params.taskerId) }); } catch (e) { next(e); } });
export default router;