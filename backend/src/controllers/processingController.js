const Dataset = require('../models/Dataset');
const ProcessingResult = require('../models/ProcessingResult');
const CleaningHistory = require('../models/CleaningHistory');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const pythonService = require('../services/pythonService');
const logger = require('../utils/logger');

const getDatasetForUser = async (datasetId, userId) => {
  return Dataset.findOne({ _id: datasetId, userId });
};

exports.profileDataset = asyncHandler(async (req, res) => {
  const dataset = await getDatasetForUser(req.params.datasetId, req.user._id);
  if (!dataset) return sendError(res, 'Dataset not found.', 404);

  await Dataset.findByIdAndUpdate(dataset._id, { status: 'profiling' });

  const result = await pythonService.profile({
    cloudinaryUrl: dataset.cloudinaryUrl,
    fileType: dataset.fileType,
  });

  await Dataset.findByIdAndUpdate(dataset._id, {
    rowCount: result.rowCount,
    columnCount: result.columnCount,
    status: 'uploaded',
  });

  await ProcessingResult.findOneAndUpdate(
    { datasetId: dataset._id },
    { $set: { datasetId: dataset._id, userId: req.user._id, profilingResult: result } },
    { upsert: true, new: true }
  );

  logger.info(`Profiling complete for dataset ${dataset._id}`);
  return sendSuccess(res, result, 'Profiling complete');
});

exports.validateDataset = asyncHandler(async (req, res) => {
  const dataset = await getDatasetForUser(req.params.datasetId, req.user._id);
  if (!dataset) return sendError(res, 'Dataset not found.', 404);

  await Dataset.findByIdAndUpdate(dataset._id, { status: 'validating' });

  const result = await pythonService.validate({
    cloudinaryUrl: dataset.cloudinaryUrl,
    fileType: dataset.fileType,
  });

  const isSuspicious = result.qualityScore?.overall < 30 || result.anomalyResult?.anomalyPercentage > 30;

  await Dataset.findByIdAndUpdate(dataset._id, {
    status: 'completed',
    isSuspicious,
  });

  await ProcessingResult.findOneAndUpdate(
    { datasetId: dataset._id },
    {
      $set: {
        datasetId: dataset._id,
        userId: req.user._id,
        validationResult: result.validationResult,
        qualityScore: result.qualityScore,
        anomalyResult: result.anomalyResult,
      }
    },
    { upsert: true, new: true }
  );

  logger.info(`Validation complete for dataset ${dataset._id}`);
  return sendSuccess(res, result, 'Validation complete');
});

exports.detectAnomalies = asyncHandler(async (req, res) => {
  const dataset = await getDatasetForUser(req.params.datasetId, req.user._id);
  if (!dataset) return sendError(res, 'Dataset not found.', 404);

  const result = await pythonService.detectAnomalies({
    cloudinaryUrl: dataset.cloudinaryUrl,
    fileType: dataset.fileType,
  });

  await ProcessingResult.findOneAndUpdate(
    { datasetId: dataset._id },
    { $set: { anomalyResult: result } },
    { upsert: true, new: true }
  );

  return sendSuccess(res, result, 'Anomaly detection complete');
});

exports.getResults = asyncHandler(async (req, res) => {
  const dataset = await getDatasetForUser(req.params.datasetId, req.user._id);
  if (!dataset) return sendError(res, 'Dataset not found.', 404);

  const result = await ProcessingResult.findOne({ datasetId: dataset._id }).lean();
  if (!result) return sendError(res, 'No processing results found. Run analysis first.', 404);

  return sendSuccess(res, result);
});

exports.getComparison = asyncHandler(async (req, res) => {
  const dataset = await getDatasetForUser(req.params.datasetId, req.user._id);
  if (!dataset) return sendError(res, 'Dataset not found.', 404);

  const cleaning = await CleaningHistory.findOne({ datasetId: dataset._id }).sort({ createdAt: -1 }).lean();
  if (!cleaning) return sendError(res, 'No cleaning history found. Run cleaning first.', 404);

  return sendSuccess(res, cleaning);
});
