import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'completed', 'archived'],
      default: 'draft',
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [1, 'Budget must be at least 1'],
    },
    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    targetAudience: {
      type: String,
      default: 'General',
      trim: true,
    },
    platform: {
      type: String,
      enum: ['google', 'meta', 'youtube', 'display', 'other'],
      default: 'google',
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

campaignSchema.index({ user: 1, status: 1 });
campaignSchema.index({ name: 'text', description: 'text' });

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
