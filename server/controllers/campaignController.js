import Campaign from '../models/Campaign.js';
import Advertisement from '../models/Advertisement.js';
import Analytics from '../models/Analytics.js';
import Notification from '../models/Notification.js';
import { generateDummyAnalytics, createNotification } from '../utils/analyticsHelper.js';

const buildCampaignQuery = (req) => {
  const query = req.user.role === 'admin' ? {} : { user: req.user._id };

  if (req.query.status) query.status = req.query.status;
  if (req.query.platform) query.platform = req.query.platform;

  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  return query;
};

export const getCampaigns = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const query = buildCampaignQuery(req);

    const [campaigns, total] = await Promise.all([
      Campaign.find(query)
        .populate('user', 'name email')
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit),
      Campaign.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: campaigns,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('user', 'name email');

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (req.user.role !== 'admin' && campaign.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this campaign' });
    }

    res.json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
};

export const createCampaign = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const campaign = await Campaign.create({ ...req.body, user: req.user._id });

    const dummyData = generateDummyAnalytics(30);
    await Analytics.insertMany(
      dummyData.map((d) => ({
        ...d,
        campaign: campaign._id,
        user: req.user._id,
      }))
    );

    await createNotification(
      Notification,
      req.user._id,
      'Campaign Created',
      `Your campaign "${campaign.name}" has been created successfully.`,
      'campaign',
      `/campaigns/${campaign._id}`
    );

    res.status(201).json({ success: true, message: 'Campaign created successfully', data: campaign });
  } catch (error) {
    next(error);
  }
};

export const updateCampaign = async (req, res, next) => {
  try {
    let campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (req.user.role !== 'admin' && campaign.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this campaign' });
    }

    if (req.body.startDate && req.body.endDate) {
      if (new Date(req.body.endDate) <= new Date(req.body.startDate)) {
        return res.status(400).json({ success: false, message: 'End date must be after start date' });
      }
    }

    campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (req.body.status === 'active') {
      await createNotification(
        Notification,
        campaign.user,
        'Campaign Activated',
        `Campaign "${campaign.name}" is now active.`,
        'success',
        `/campaigns/${campaign._id}`
      );
    }

    res.json({ success: true, message: 'Campaign updated successfully', data: campaign });
  } catch (error) {
    next(error);
  }
};

export const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (req.user.role !== 'admin' && campaign.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this campaign' });
    }

    await Promise.all([
      Advertisement.deleteMany({ campaign: campaign._id }),
      Analytics.deleteMany({ campaign: campaign._id }),
      Campaign.findByIdAndDelete(campaign._id),
    ]);

    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCampaignStats = async (req, res, next) => {
  try {
    const userFilter = req.user.role === 'admin' ? {} : { user: req.user._id };

    const [total, active, paused, draft, budgetAgg] = await Promise.all([
      Campaign.countDocuments(userFilter),
      Campaign.countDocuments({ ...userFilter, status: 'active' }),
      Campaign.countDocuments({ ...userFilter, status: 'paused' }),
      Campaign.countDocuments({ ...userFilter, status: 'draft' }),
      Campaign.aggregate([
        { $match: userFilter },
        {
          $group: {
            _id: null,
            totalBudget: { $sum: '$budget' },
            totalSpent: { $sum: '$spent' },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        paused,
        draft,
        totalBudget: budgetAgg[0]?.totalBudget || 0,
        totalSpent: budgetAgg[0]?.totalSpent || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
