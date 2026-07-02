import Advertisement from '../models/Advertisement.js';
import Campaign from '../models/Campaign.js';

const buildAdQuery = (req) => {
  const query = req.user.role === 'admin' ? {} : { user: req.user._id };

  if (req.query.status) query.status = req.query.status;
  if (req.query.type) query.type = req.query.type;
  if (req.query.campaign) query.campaign = req.query.campaign;

  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  return query;
};

export const getAdvertisements = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = buildAdQuery(req);

    const [ads, total] = await Promise.all([
      Advertisement.find(query)
        .populate('campaign', 'name status')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Advertisement.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: ads,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdvertisement = async (req, res, next) => {
  try {
    const ad = await Advertisement.findById(req.params.id)
      .populate('campaign', 'name status budget')
      .populate('user', 'name email');

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    if (req.user.role !== 'admin' && ad.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: ad });
  } catch (error) {
    next(error);
  }
};

export const createAdvertisement = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.body.campaign);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (req.user.role !== 'admin' && campaign.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this campaign' });
    }

    const adData = {
      ...req.body,
      user: req.user._id,
    };

    if (req.file) {
      adData.mediaUrl = `/uploads/${req.file.filename}`;
      adData.mediaType = req.file.mimetype;
      adData.type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    const ad = await Advertisement.create(adData);

    res.status(201).json({ success: true, message: 'Advertisement created successfully', data: ad });
  } catch (error) {
    next(error);
  }
};

export const updateAdvertisement = async (req, res, next) => {
  try {
    let ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    if (req.user.role !== 'admin' && ad.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updateData = { ...req.body };

    if (req.file) {
      updateData.mediaUrl = `/uploads/${req.file.filename}`;
      updateData.mediaType = req.file.mimetype;
      updateData.type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    ad = await Advertisement.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Advertisement updated successfully', data: ad });
  } catch (error) {
    next(error);
  }
};

export const deleteAdvertisement = async (req, res, next) => {
  try {
    const ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    if (req.user.role !== 'admin' && ad.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await ad.deleteOne();

    res.json({ success: true, message: 'Advertisement deleted successfully' });
  } catch (error) {
    next(error);
  }
};
