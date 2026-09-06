const express = require('express');
const router = express.Router();
const processingController = require('../controllers/processingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/:datasetId/profile', processingController.profileDataset);
router.post('/:datasetId/validate', processingController.validateDataset);
router.post('/:datasetId/anomalies', processingController.detectAnomalies);
router.get('/:datasetId/results', processingController.getResults);
router.get('/:datasetId/comparison', processingController.getComparison);

module.exports = router;
