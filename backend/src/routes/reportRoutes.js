const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/:datasetId/generate', reportController.generateReport);
router.get('/:datasetId/download/pdf', reportController.downloadPdf);
router.get('/:datasetId/download/excel', reportController.downloadExcel);

module.exports = router;
