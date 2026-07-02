import { body } from 'express-validator';

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const campaignValidation = [
  body('name').trim().notEmpty().withMessage('Campaign name is required'),
  body('budget').isFloat({ min: 1 }).withMessage('Budget must be at least 1'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('status').optional().isIn(['draft', 'active', 'paused', 'completed', 'archived']),
  body('platform').optional().isIn(['google', 'meta', 'youtube', 'display', 'other']),
];

export const adValidation = [
  body('title').trim().notEmpty().withMessage('Ad title is required'),
  body('campaign').notEmpty().withMessage('Campaign ID is required'),
  body('type').optional().isIn(['image', 'video', 'banner', 'carousel']),
  body('status').optional().isIn(['draft', 'active', 'paused', 'rejected']),
];

export const profileValidation = [
  body('name').optional().trim().isLength({ max: 50 }),
  body('company').optional().trim(),
  body('phone').optional().trim(),
];
