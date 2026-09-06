const ProcessingResult = require('../models/ProcessingResult');
const Dataset = require('../models/Dataset');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const geminiService = require('../services/geminiService');

exports.generateInsights = asyncHandler(async (req, res) => {
  const dataset = await Dataset.findOne({ _id: req.params.datasetId, userId: req.user._id });
  if (!dataset) return sendError(res, 'Dataset not found.', 404);

  const result = await ProcessingResult.findOne({ datasetId: dataset._id });
  if (!result || !result.qualityScore) {
    return sendError(res, 'Please run validation before generating insights.', 400);
  }

  const insights = await geminiService.generateInsights({
    datasetName: dataset.originalName,
    rows: dataset.rowCount,
    columns: dataset.columnCount,
    qualityScore: result.qualityScore,
    validationResult: result.validationResult,
    anomalyResult: result.anomalyResult,
  });

  await ProcessingResult.findOneAndUpdate(
    { datasetId: dataset._id },
    { $set: { aiInsights: { ...insights, generatedAt: new Date() } } }
  );

  return sendSuccess(res, insights, 'AI insights generated');
});

exports.getInsights = asyncHandler(async (req, res) => {
  const dataset = await Dataset.findOne({ _id: req.params.datasetId, userId: req.user._id });
  if (!dataset) return sendError(res, 'Dataset not found.', 404);

  const result = await ProcessingResult.findOne({ datasetId: dataset._id }).lean();
  if (!result || !result.aiInsights) {
    return sendError(res, 'No insights found. Generate insights first.', 404);
  }

  return sendSuccess(res, result.aiInsights);
});
