import { Schema, model } from 'mongoose';

const reportSchema = new Schema({
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

export default model('Report', reportSchema);
