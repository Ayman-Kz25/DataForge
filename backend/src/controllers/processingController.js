import Dataset from "../models/Dataset.js";
import ProcessingResult from "../models/ProcessingResult.js";
import CleaningHistory from "../models/CleaningHistory.js";
import { cleaningOperationSchema } from "../models/CleaningHistory.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

import {
  profile,
  validate,
  detectAnomalies as detectAnomaliesService,
  clean,
} from "../services/pythonService.js";

import logger from "../utils/logger.js";

const getDatasetForUser = async (datasetId, userId) => {
  return Dataset.findOne({
    _id: datasetId,
    userId,
  });
};

export const profileDataset = asyncHandler(async (req, res) => {
  const dataset = await getDatasetForUser(req.params.datasetId, req.user._id);

  if (!dataset) {
    return sendError(res, "Dataset not found.", 404);
  }

  await Dataset.findByIdAndUpdate(dataset._id, {
    status: "profiling",
  });

  const result = await profile({
    cloudinaryUrl: dataset.cloudinaryUrl,
    fileType: dataset.fileType,
  });

  await Dataset.findByIdAndUpdate(dataset._id, {
    rowCount: result.rowCount,
    columnCount: result.columnCount,
    status: "uploaded",
  });

  await Dataset.findOneAndUpdate(
    {
      datasetId: dataset._id,
    },
    {
      $set: {
        datasetId: dataset._id,
        userId: req.user._id,
        profilingResult: result,
      },
    },
    {
      upsert: true,
      new: true,
    },
  );

  logger.info(`Profiling complete for dataset ${dataset._id}`);

  return sendSuccess(res, result, "Profiling complete");
});

export const validateDataset = asyncHandler(async (req, res) => {
  const dataset = await getDatasetForUser(req.params.datasetId, req.user._id);

  if (!dataset) {
    return sendError(res, "Dataset not found.", 404);
  }

  await Dataset.findByIdAndUpdate(dataset._id, {
    status: "validating",
  });

  const result = await validate({
    cloudinaryUrl: dataset.cloudinaryUrl,
    fileType: dataset.fileType,
  });

  const isSuspicious =
    result.qualityScore?.overall < 30 ||
    result.anomalyResult?.anomalyPercentage > 30;

  await Dataset.findByIdAndUpdate(dataset._id, {
    status: "completed",
    isSuspicious,
  });

  await Dataset.findOneAndUpdate(
    {
      datasetId: dataset._id,
    },
    {
      $set: {
        datasetId: dataset._id,
        userId: req.user._id,
        validationResult: result.validationResult,
        qualityScore: result.qualityScore,
        anomalyResult: result.anomalyResult,
      },
    },
    {
      upsert: true,
      new: true,
    },
  );

  info(`Validation complete for dataset ${dataset._id}`);

  return sendSuccess(res, result, "Validation complete");
});

export const detectAnomalies = asyncHandler(async (req, res) => {
  const dataset = await getDatasetForUser(req.params.datasetId, req.user._id);

  if (!dataset) {
    return sendError(res, "Dataset not found.", 404);
  }

  const result = await detectAnomaliesService({
    cloudinaryUrl: dataset.cloudinaryUrl,
    fileType: dataset.fileType,
  });

  await Dataset.findOneAndUpdate(
    {
      datasetId: dataset._id,
    },
    {
      $set: {
        anomalyResult: result,
      },
    },
    {
      upsert: true,
      new: true,
    },
  );

  return sendSuccess(res, result, "Anomaly detection complete");
});

export const cleanDataset = asyncHandler(async (req, res) => {
  const dataset = await getDatasetForUser(req.params.datasetId, req.user._id);

  if (!dataset) {
    return sendError(res, "Dataset not found.", 404);
  }

  const options = req.body || {};
  const mode = options.mode || "auto";

  await Dataset.findByIdAndUpdate(dataset._id, {
    status: "cleaning",
  });

  const result = await clean({
    cloudinaryUrl: dataset.cloudinaryUrl,
    fileType: dataset.fileType,

    options: {
      mode,

      missingNumericStrategy: options.missingNumericStrategy || "median",

      missingCatStrategy: options.missingCatStrategy || "mode",

      handleDuplicates: options.handleDuplicates !== false,

      handleOutliers: options.handleOutliers !== false,

      outlierStrategy: options.outlierStrategy || "winsorize",

      handleFormats: options.handleFormats !== false,
    },
  });

  // Save cleaning history to MongoDB
  await CleaningHistory(
    {
      datasetId: dataset._id,
    },
    {
      $set: {
        datasetId: dataset._id,
        userId: req.user._id,
        mode,
        operations: result.operations,
        rowsBefore: result.rowsBefore,
        rowsAfter: result.rowsAfter,
        cleanedFileB64: result.cleanedFileB64,
        previewRows: result.previewRows,
        completedAt: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
    },
  );

  await Dataset.findByIdAndUpdate(dataset._id, {
    status: "completed",
  });

  info(
    `Cleaning complete for dataset ${dataset._id}: ${result.operations.length} operations`,
  );

  return sendSuccess(
    res,
    {
      operations: result.operations,
      rowsBefore: result.rowsBefore,
      rowsAfter: result.rowsAfter,
      cleanedFileB64: result.cleanedFileB64,
      previewRows: result.previewRows,
    },
    "Cleaning complete",
  );
});

export const getResults = asyncHandler(async (req, res) => {
  const dataset = await getDatasetForUser(req.params.datasetId, req.user._id);

  if (!dataset) {
    return sendError(res, "Dataset not found.", 404);
  }

  const result = await ProcessingResult.find({
    datasetId: dataset._id,
  }).lean();

  if (!result) {
    return sendError(
      res,
      "No processing results found. Run analysis first.",
      404,
    );
  }

  return sendSuccess(res, result);
});

export const getComparison = asyncHandler(async (req, res) => {
  const dataset = await getDatasetForUser(req.params.datasetId, req.user._id);

  if (!dataset) {
    return sendError(res, "Dataset not found.", 404);
  }

  const cleaning = await cleaningOperationSchema({
    datasetId: dataset._id,
  })
    .sort({
      createdAt: -1,
    })
    .lean();

  if (!cleaning) {
    return sendError(
      res,
      "No cleaning history found. Run cleaning first.",
      404,
    );
  }

  return sendSuccess(res, cleaning);
});
