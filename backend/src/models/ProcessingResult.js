const mongoose = require('mongoose');

const processingResultSchema = new mongoose.Schema({
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
  profilingResult: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  validationResult: {
    checks: [mongoose.Schema.Types.Mixed],
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
    columnScores: mongoose.Schema.Types.Mixed,
  },
  analyticsData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  aiInsights: {
    summary: String,
    qualityExplanation: String,
    cleaningExplanation: String,
    chartExplanations: mongoose.Schema.Types.Mixed,
    generatedAt: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ProcessingResult', processingResultSchema);
