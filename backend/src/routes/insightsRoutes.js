import { Router } from 'express';
const router = Router();
import { generateInsights, getInsights } from '../controllers/insightsController.js';
import { protect } from '../middleware/authMiddleware.js';

router.use(protect);

router.post('/:datasetId/generate', generateInsights);
router.get('/:datasetId', getInsights);

export default router;
