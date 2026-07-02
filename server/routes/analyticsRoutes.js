import express from 'express';
import {
  getDashboardAnalytics,
  getCampaignAnalytics,
  getPlatformBreakdown,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/platform-breakdown', getPlatformBreakdown);
router.get('/campaign/:campaignId', getCampaignAnalytics);

export default router;
