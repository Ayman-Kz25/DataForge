import { Router } from 'express';
const router = Router();
import { profileDataset, validateDataset, detectAnomalies, cleanDataset, getResults, getComparison } from '../controllers/processingController.js';
import { protect } from '../middleware/authMiddleware.js';

router.use(protect);

router.post('/:datasetId/profile', profileDataset);
router.post('/:datasetId/validate', validateDataset);
router.post('/:datasetId/anomalies', detectAnomalies);
router.post('/:datasetId/clean', cleanDataset);
router.get('/:datasetId/results', getResults);
router.get('/:datasetId/comparison', getComparison);

export default router;
