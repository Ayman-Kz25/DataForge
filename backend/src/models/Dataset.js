const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  originalName: {
    type: String,
    required: true,
    trim: true,
  },
  cloudinaryUrl: {
    type: String,
    required: true,
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ['csv', 'xlsx'],
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  rowCount: {
    type: Number,
    default: null,
  },
  columnCount: {
    type: Number,
    default: null,
  },
  status: {
    type: String,
    enum: ['uploaded', 'profiling', 'validating', 'cleaning', 'completed', 'error'],
    default: 'uploaded',
  },
  errorMessage: {
    type: String,
    default: null,
  },
  isSuspicious: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Dataset', datasetSchema);
