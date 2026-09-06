const mongoose = require('mongoose');

const cleaningOperationSchema = new mongoose.Schema({
  step: Number,
  type: {
    type: String,
    enum: ['missing_values', 'duplicates', 'outliers', 'type_fix', 'format_fix', 'other'],
  },
  column: { type: String, default: null },
  strategy: String,
  rowsBefore: Number,
  rowsAfter: Number,
  changeCount: Number,
  description: String,
}, { _id: false });

const cleaningHistorySchema = new mongoose.Schema({
  datasetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mode: {
    type: String,
    enum: ['auto', 'manual'],
    required: true,
  },
  operations: [cleaningOperationSchema],
  cleanedCloudinaryUrl: String,
  cleanedPublicId: String,
  rowsBefore: Number,
  rowsAfter: Number,
  qualityScoreBefore: Number,
  qualityScoreAfter: Number,
  completedAt: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('CleaningHistory', cleaningHistorySchema);
