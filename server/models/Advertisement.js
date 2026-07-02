import mongoose from 'mongoose';

const advertisementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Ad title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'video', 'banner', 'carousel'],
      default: 'image',
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    mediaType: {
      type: String,
      default: '',
    },
    destinationUrl: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'rejected'],
      default: 'draft',
    },
    cpc: {
      type: Number,
      default: 0.5,
      min: 0,
    },
    cpm: {
      type: Number,
      default: 5,
      min: 0,
    },
  },
  { timestamps: true }
);

advertisementSchema.index({ campaign: 1, status: 1 });

const Advertisement = mongoose.model('Advertisement', advertisementSchema);
export default Advertisement;
