import Dataset from '../models/Dataset.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { uploadFile, deleteFile } from '../services/cloudinaryService.js';
import logger from '../utils/logger.js';

export const uploadDataset = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 'No file uploaded. Please select a CSV or Excel file.', 400);
  }

  const file = req.file;
  const ext = file.originalname.split('.').pop().toLowerCase();
  const fileType = ext === 'csv' ? 'csv' : 'xlsx';

  const uploadResult = await uploadFile(
    file.buffer,
    file.originalname,
    req.user._id.toString()
  );

  const dataset = await Dataset.create({
    userId: req.user._id,
    originalName: file.originalname,
    cloudinaryUrl: uploadResult.secure_url,
    cloudinaryPublicId: uploadResult.public_id,
    fileType,
    fileSize: file.size,
  });

  logger.info(`Dataset uploaded: ${file.originalname} by user ${req.user._id}`);

  return sendSuccess(res, dataset, 'Dataset uploaded successfully', 201);
});

export const getAllDatasets = asyncHandler(async (req, res) => {
  const datasets = await Dataset.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  return sendSuccess(res, datasets);
});

export const getDatasetById = asyncHandler(async (req, res) => {
  const dataset = await Dataset.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).lean();

  if (!dataset) {
    return sendError(res, 'Dataset not found.', 404);
  }

  return sendSuccess(res, dataset);
});

export const deleteDataset = asyncHandler(async (req, res) => {
  const dataset = await Dataset.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!dataset) {
    return sendError(res, 'Dataset not found.', 404);
  }

  try {
    await deleteFile(dataset.cloudinaryPublicId);
  } catch (err) {
    logger.error(`Could not delete Cloudinary file: ${dataset.cloudinaryPublicId}`, err);
  }

  await Dataset.findByIdAndDelete(dataset._id);

  logger.info(`Dataset deleted: ${dataset._id} by user ${req.user._id}`);

  return sendSuccess(res, null, 'Dataset deleted successfully');
});
