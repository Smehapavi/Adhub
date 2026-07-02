import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    advertisement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Advertisement',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    impressions: {
      type: Number,
      default: 0,
      min: 0,
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },
    spend: {
      type: Number,
      default: 0,
      min: 0,
    },
    ctr: {
      type: Number,
      default: 0,
      min: 0,
    },
    cpc: {
      type: Number,
      default: 0,
      min: 0,
    },
    cpm: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

analyticsSchema.index({ campaign: 1, date: -1 });
analyticsSchema.index({ user: 1, date: -1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
