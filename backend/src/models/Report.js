const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['pdf', 'excel'],
    required: true,
  },
  cloudinaryUrl: String,
  cloudinaryPublicId: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Report', reportSchema);
