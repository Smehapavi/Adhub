import express from 'express';
import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignStats,
} from '../controllers/campaignController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { campaignValidation } from '../utils/validators.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getCampaignStats);
router.route('/')
  .get(getCampaigns)
  .post(campaignValidation, validate, createCampaign);
router.route('/:id')
  .get(getCampaign)
  .put(campaignValidation, validate, updateCampaign)
  .delete(deleteCampaign);

export default router;
