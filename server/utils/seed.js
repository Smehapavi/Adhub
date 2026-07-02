import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Campaign from './models/Campaign.js';
import Advertisement from './models/Advertisement.js';
import Analytics from './models/Analytics.js';
import Notification from './models/Notification.js';
import { generateDummyAnalytics, createNotification } from './utils/analyticsHelper.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    await Promise.all([
      User.deleteMany(),
      Campaign.deleteMany(),
      Advertisement.deleteMany(),
      Analytics.deleteMany(),
      Notification.deleteMany(),
    ]);
    console.log('Cleared existing data');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@adflow.com',
      password: 'admin123',
      role: 'admin',
      company: 'AdFlow Inc.',
      phone: '+1-555-0100',
    });

    const user = await User.create({
      name: 'John Doe',
      email: 'user@adflow.com',
      password: 'user123',
      role: 'user',
      company: 'Marketing Pro LLC',
      phone: '+1-555-0200',
    });

    const campaigns = await Campaign.insertMany([
      {
        name: 'Summer Sale 2026',
        description: 'Promote summer collection with targeted display ads',
        user: user._id,
        status: 'active',
        budget: 5000,
        spent: 2340,
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-08-31'),
        targetAudience: '18-35, Fashion enthusiasts',
        platform: 'google',
        tags: ['summer', 'sale', 'fashion'],
      },
      {
        name: 'Brand Awareness Q2',
        description: 'Increase brand visibility across social platforms',
        user: user._id,
        status: 'active',
        budget: 10000,
        spent: 4200,
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-06-30'),
        targetAudience: '25-54, All demographics',
        platform: 'meta',
        tags: ['brand', 'awareness'],
      },
      {
        name: 'Product Launch - SmartWatch X',
        description: 'Launch campaign for new SmartWatch X product line',
        user: user._id,
        status: 'paused',
        budget: 15000,
        spent: 8900,
        startDate: new Date('2026-05-15'),
        endDate: new Date('2026-07-15'),
        targetAudience: 'Tech enthusiasts, 25-45',
        platform: 'youtube',
        tags: ['launch', 'tech', 'smartwatch'],
      },
      {
        name: 'Holiday Prep Campaign',
        description: 'Early holiday season promotional campaign',
        user: user._id,
        status: 'draft',
        budget: 8000,
        spent: 0,
        startDate: new Date('2026-11-01'),
        endDate: new Date('2026-12-31'),
        targetAudience: 'Holiday shoppers',
        platform: 'display',
        tags: ['holiday', 'promo'],
      },
    ]);

    await Advertisement.insertMany([
      {
        title: 'Summer Banner Ad',
        description: 'Eye-catching summer sale banner',
        campaign: campaigns[0]._id,
        user: user._id,
        type: 'banner',
        status: 'active',
        destinationUrl: 'https://example.com/summer-sale',
        cpc: 0.45,
        cpm: 4.5,
      },
      {
        title: 'Brand Story Video',
        description: '60-second brand story video ad',
        campaign: campaigns[1]._id,
        user: user._id,
        type: 'video',
        status: 'active',
        destinationUrl: 'https://example.com/about',
        cpc: 0.62,
        cpm: 6.2,
      },
      {
        title: 'SmartWatch Product Image',
        description: 'Product showcase image ad',
        campaign: campaigns[2]._id,
        user: user._id,
        type: 'image',
        status: 'paused',
        destinationUrl: 'https://example.com/smartwatch-x',
        cpc: 0.78,
        cpm: 7.8,
      },
    ]);

    for (const campaign of campaigns) {
      const dummyData = generateDummyAnalytics(30);
      await Analytics.insertMany(
        dummyData.map((d) => ({
          ...d,
          campaign: campaign._id,
          user: user._id,
        }))
      );
    }

    await createNotification(
      Notification,
      user._id,
      'Welcome to AdFlow!',
      'Your account has been set up. Start by creating your first campaign.',
      'success',
      '/campaigns'
    );
    await createNotification(
      Notification,
      user._id,
      'Budget Alert',
      'Campaign "Summer Sale 2026" has used 47% of its budget.',
      'budget',
      `/campaigns/${campaigns[0]._id}`
    );
    await createNotification(
      Notification,
      user._id,
      'Campaign Performance',
      'Your "Brand Awareness Q2" campaign CTR increased by 12% this week.',
      'campaign',
      `/campaigns/${campaigns[1]._id}`
    );

    console.log('\n--- Seed Data Created ---');
    console.log('Admin: admin@adflow.com / admin123');
    console.log('User:  user@adflow.com / user123');
    console.log(`Campaigns: ${campaigns.length}`);
    console.log('Analytics: 30 days of dummy data per campaign');
    console.log('-------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seed();
