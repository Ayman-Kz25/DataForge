const express = require('express');
const router = express.Router();
const datasetController = require('../controllers/datasetController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.use(protect);

router.post('/upload', upload.single('file'), datasetController.uploadDataset);
router.get('/', datasetController.getAllDatasets);
router.get('/:id', datasetController.getDatasetById);
router.delete('/:id', datasetController.deleteDataset);

module.exports = router;
