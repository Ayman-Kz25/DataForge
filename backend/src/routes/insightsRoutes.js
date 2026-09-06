const express = require('express');
const router = express.Router();
const insightsController = require('../controllers/insightsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/:datasetId/generate', insightsController.generateInsights);
router.get('/:datasetId', insightsController.getInsights);

module.exports = router;
