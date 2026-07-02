export const generateDummyAnalytics = (days = 30) => {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const impressions = Math.floor(Math.random() * 5000) + 500;
    const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01));
    const spend = parseFloat((clicks * (Math.random() * 1.5 + 0.3)).toFixed(2));
    const ctr = impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(2)) : 0;
    const cpc = clicks > 0 ? parseFloat((spend / clicks).toFixed(2)) : 0;
    const cpm = impressions > 0 ? parseFloat(((spend / impressions) * 1000).toFixed(2)) : 0;

    data.push({ date, impressions, clicks, spend, ctr, cpc, cpm });
  }

  return data;
};

export const aggregateAnalytics = (records) => {
  const totals = records.reduce(
    (acc, r) => ({
      impressions: acc.impressions + r.impressions,
      clicks: acc.clicks + r.clicks,
      spend: acc.spend + r.spend,
    }),
    { impressions: 0, clicks: 0, spend: 0 }
  );

  totals.ctr = totals.impressions > 0
    ? parseFloat(((totals.clicks / totals.impressions) * 100).toFixed(2))
    : 0;
  totals.cpc = totals.clicks > 0
    ? parseFloat((totals.spend / totals.clicks).toFixed(2))
    : 0;
  totals.cpm = totals.impressions > 0
    ? parseFloat(((totals.spend / totals.impressions) * 1000).toFixed(2))
    : 0;

  return totals;
};

export const createNotification = async (Notification, userId, title, message, type = 'info', link = '') => {
  return Notification.create({ user: userId, title, message, type, link });
};
