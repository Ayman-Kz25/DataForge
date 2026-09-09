import { Schema, model } from 'mongoose';

export const cleaningOperationSchema = new Schema({
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

const cleaningHistorySchema = new Schema({
  datasetId: {
    type: Schema.Types.ObjectId,
    ref: 'Dataset',
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
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
  cleanedFileB64: String,
  previewRows: { type: Schema.Types.Mixed, default: null },
  rowsBefore: Number,
  rowsAfter: Number,
  qualityScoreBefore: Number,
  qualityScoreAfter: Number,
  completedAt: Date,
}, {
  timestamps: true,
});

export default model('CleaningHistory', cleaningHistorySchema);
