import { Schema, model } from 'mongoose';

const processingResultSchema = new Schema({
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
  profilingResult: {
    type: Schema.Types.Mixed,
    default: null,
  },
  validationResult: {
    checks: [Schema.Types.Mixed],
    totalIssues: Number,
  },
  qualityScore: {
    overall: Number,
    completeness: Number,
    uniqueness: Number,
    validity: Number,
    consistency: Number,
    anomalyScore: Number,
  },
  anomalyResult: {
    method: String,
    contamination: Number,
    anomalyCount: Number,
    anomalyPercentage: Number,
    affectedRows: [Number],
    columnScores: Schema.Types.Mixed,
  },
  analyticsData: {
    type: Schema.Types.Mixed,
    default: null,
  },
  aiInsights: {
    summary: String,
    qualityExplanation: String,
    cleaningExplanation: String,
    chartExplanations: Schema.Types.Mixed,
    generatedAt: Date,
  },
}, {
  timestamps: true,
});

export default model('ProcessingResult', processingResultSchema);
