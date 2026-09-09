import { Router } from 'express';
const router = Router();
import { generateReport, downloadPdf, downloadExcel } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

router.use(protect);

router.post('/:datasetId/generate', generateReport);
router.get('/:datasetId/download/pdf', downloadPdf);
router.get('/:datasetId/download/excel', downloadExcel);

export default router;
