import { Router } from 'express';
const router = Router();
import { uploadDataset, getAllDatasets, getDatasetById, deleteDataset } from '../controllers/datasetController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

router.use(protect);

router.post('/upload', upload.single('file'), uploadDataset);
router.get('/', getAllDatasets);
router.get('/:id', getDatasetById);
router.delete('/:id', deleteDataset);

export default router;
