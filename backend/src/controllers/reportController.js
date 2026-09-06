const Dataset = require('../models/Dataset');
const ProcessingResult = require('../models/ProcessingResult');
const CleaningHistory = require('../models/CleaningHistory');
const Report = require('../models/Report');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const pythonService = require('../services/pythonService');
const cloudinaryService = require('../services/cloudinaryService');

exports.generateReport = asyncHandler(async (req, res) => {
  const dataset = await Dataset.findOne({ _id: req.params.datasetId, userId: req.user._id });
  if (!dataset) return sendError(res, 'Dataset not found.', 404);

  const [result, cleaning] = await Promise.all([
    ProcessingResult.findOne({ datasetId: dataset._id }).lean(),
    CleaningHistory.findOne({ datasetId: dataset._id }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!result || !result.qualityScore) {
    return sendError(res, 'Please run validation before generating a report.', 400);
  }

  const pdfBuffer = await pythonService.generatePdfReport({
    dataset: { name: dataset.originalName, rows: dataset.rowCount, columns: dataset.columnCount, fileSize: dataset.fileSize, createdAt: dataset.createdAt },
    processingResult: result,
    cleaningHistory: cleaning,
    userName: req.user.name,
  });

  const uploadResult = await cloudinaryService.uploadBuffer(
    pdfBuffer,
    `${dataset.originalName.replace(/\.[^.]+$/, '')}_report.pdf`,
    req.user._id.toString(),
    'raw'
  );

  const report = await Report.findOneAndUpdate(
    { datasetId: dataset._id, type: 'pdf' },
    { cloudinaryUrl: uploadResult.secure_url, cloudinaryPublicId: uploadResult.public_id, userId: req.user._id },
    { upsert: true, new: true }
  );

  return sendSuccess(res, { downloadUrl: report.cloudinaryUrl }, 'Report generated successfully');
});

exports.downloadPdf = asyncHandler(async (req, res) => {
  const dataset = await Dataset.findOne({ _id: req.params.datasetId, userId: req.user._id });
  if (!dataset) return sendError(res, 'Dataset not found.', 404);

  const report = await Report.findOne({ datasetId: dataset._id, type: 'pdf' });
  if (!report) return sendError(res, 'Report not found. Generate report first.', 404);

  return sendSuccess(res, { downloadUrl: report.cloudinaryUrl });
});

exports.downloadExcel = asyncHandler(async (req, res) => {
  const dataset = await Dataset.findOne({ _id: req.params.datasetId, userId: req.user._id });
  if (!dataset) return sendError(res, 'Dataset not found.', 404);

  const cleaning = await CleaningHistory.findOne({ datasetId: dataset._id }).sort({ createdAt: -1 });
  if (!cleaning || !cleaning.cleanedCloudinaryUrl) {
    return sendError(res, 'No cleaned dataset found. Run cleaning first.', 404);
  }

  return sendSuccess(res, { downloadUrl: cleaning.cleanedCloudinaryUrl });
});
