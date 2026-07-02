import express from 'express';
import {
  getAdvertisements,
  getAdvertisement,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
} from '../controllers/adController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { adValidation } from '../utils/validators.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAdvertisements)
  .post(upload.single('media'), adValidation, validate, createAdvertisement);
router.route('/:id')
  .get(getAdvertisement)
  .put(upload.single('media'), adValidation, validate, updateAdvertisement)
  .delete(deleteAdvertisement);

export default router;
