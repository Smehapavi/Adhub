import { useState, useEffect } from 'react';
import { Eye, MousePointerClick, DollarSign, Target } from 'lucide-react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { ImpressionsChart, ClicksChart, SpendChart, MetricsChart, PlatformPieChart, BudgetGauge } from '../components/Charts';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [platformData, setPlatformData] = useState([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [analyticsRes, platformRes] = await Promise.all([
          api.get(`/analytics/dashboard?days=${days}`),
          api.get('/analytics/platform-breakdown'),
        ]);
        setAnalytics(analyticsRes.data.data);
        setPlatformData(platformRes.data.data);
      } catch {
        /* handled */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [days]);

  if (loading) {
    return (
      <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
    );
  }

  const totals = analytics?.totals || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Detailed performance metrics and insights</p>
        </div>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="input w-auto">
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Impressions" value={totals.impressions?.toLocaleString() || '0'} icon={Eye} color="primary" />
        <StatCard title="Clicks" value={totals.clicks?.toLocaleString() || '0'} icon={MousePointerClick} color="purple" />
        <StatCard title="Spend" value={`$${totals.spend?.toLocaleString() || '0'}`} icon={DollarSign} color="green" />
        <StatCard title="CTR" value={`${totals.ctr || 0}%`} icon={Target} color="yellow" />
        <StatCard title="CPC / CPM" value={`$${totals.cpc || 0}`} subtitle={`CPM: $${totals.cpm || 0}`} icon={DollarSign} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Impressions</h2>
          <ImpressionsChart data={analytics?.dailyData || []} />
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Clicks</h2>
          <ClicksChart data={analytics?.dailyData || []} />
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Daily Spend</h2>
          <SpendChart data={analytics?.dailyData || []} />
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">CTR / CPC / CPM Trends</h2>
          <MetricsChart data={analytics?.dailyData || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Budget Overview</h2>
          <BudgetGauge
            spent={analytics?.budget?.spent}
            total={analytics?.budget?.total}
            usage={analytics?.budget?.usage}
          />
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Total campaigns: <span className="font-semibold">{analytics?.budget?.campaigns || 0}</span>
            </p>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Campaigns by Platform</h2>
          {platformData.length > 0 ? (
            <PlatformPieChart data={platformData} />
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
