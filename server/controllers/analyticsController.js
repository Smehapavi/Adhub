import Analytics from '../models/Analytics.js';
import Campaign from '../models/Campaign.js';
import { aggregateAnalytics } from '../utils/analyticsHelper.js';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const userFilter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const dateFilter = { date: { $gte: startDate }, ...userFilter };

    const [records, campaignStats] = await Promise.all([
      Analytics.find(dateFilter).sort({ date: 1 }),
      Campaign.aggregate([
        { $match: userFilter },
        {
          $group: {
            _id: null,
            totalBudget: { $sum: '$budget' },
            totalSpent: { $sum: '$spent' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totals = aggregateAnalytics(records);

    const dailyData = records.reduce((acc, record) => {
      const dateKey = record.date.toISOString().split('T')[0];
      const existing = acc.find((d) => d.date === dateKey);

      if (existing) {
        existing.impressions += record.impressions;
        existing.clicks += record.clicks;
        existing.spend += record.spend;
      } else {
        acc.push({
          date: dateKey,
          impressions: record.impressions,
          clicks: record.clicks,
          spend: record.spend,
        });
      }
      return acc;
    }, []);

    dailyData.forEach((d) => {
      d.ctr = d.impressions > 0 ? parseFloat(((d.clicks / d.impressions) * 100).toFixed(2)) : 0;
      d.cpc = d.clicks > 0 ? parseFloat((d.spend / d.clicks).toFixed(2)) : 0;
      d.cpm = d.impressions > 0 ? parseFloat(((d.spend / d.impressions) * 1000).toFixed(2)) : 0;
    });

    const budgetUsage = campaignStats[0]
      ? parseFloat(((campaignStats[0].totalSpent / campaignStats[0].totalBudget) * 100).toFixed(1))
      : 0;

    res.json({
      success: true,
      data: {
        totals,
        dailyData,
        budget: {
          total: campaignStats[0]?.totalBudget || 0,
          spent: campaignStats[0]?.totalSpent || 0,
          usage: budgetUsage,
          campaigns: campaignStats[0]?.count || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaignAnalytics = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (req.user.role !== 'admin' && campaign.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await Analytics.find({
      campaign: campaign._id,
      date: { $gte: startDate },
    }).sort({ date: 1 });

    const totals = aggregateAnalytics(records);

    const dailyData = records.map((r) => ({
      date: r.date.toISOString().split('T')[0],
      impressions: r.impressions,
      clicks: r.clicks,
      spend: r.spend,
      ctr: r.ctr,
      cpc: r.cpc,
      cpm: r.cpm,
    }));

    res.json({
      success: true,
      data: {
        campaign: { id: campaign._id, name: campaign.name, budget: campaign.budget, spent: campaign.spent },
        totals,
        dailyData,
        budgetUsage: campaign.budget > 0
          ? parseFloat(((campaign.spent / campaign.budget) * 100).toFixed(1))
          : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPlatformBreakdown = async (req, res, next) => {
  try {
    const userFilter = req.user.role === 'admin' ? {} : { user: req.user._id };

    const breakdown = await Campaign.aggregate([
      { $match: userFilter },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
          budget: { $sum: '$budget' },
          spent: { $sum: '$spent' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, data: breakdown });
  } catch (error) {
    next(error);
  }
};
