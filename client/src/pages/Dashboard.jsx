import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  MousePointerClick,
  DollarSign,
  Target,
  TrendingUp,
  Megaphone,
} from 'lucide-react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { ImpressionsChart, BudgetGauge, PlatformPieChart } from '../components/Charts';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [campaignStats, setCampaignStats] = useState(null);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [platformData, setPlatformData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, statsRes, campaignsRes, platformRes] = await Promise.all([
          api.get('/analytics/dashboard?days=30'),
          api.get('/campaigns/stats'),
          api.get('/campaigns?limit=5&sortBy=createdAt&order=desc'),
          api.get('/analytics/platform-breakdown'),
        ]);
        setAnalytics(analyticsRes.data.data);
        setCampaignStats(statsRes.data.data);
        setRecentCampaigns(campaignsRes.data.data);
        setPlatformData(platformRes.data.data);
      } catch {
        /* handled by interceptor */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totals = analytics?.totals || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s an overview of your advertising performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Impressions"
          value={totals.impressions?.toLocaleString() || '0'}
          icon={Eye}
          color="primary"
          trend={8.2}
        />
        <StatCard
          title="Clicks"
          value={totals.clicks?.toLocaleString() || '0'}
          icon={MousePointerClick}
          color="purple"
          trend={5.4}
        />
        <StatCard
          title="Total Spend"
          value={`$${totals.spend?.toLocaleString() || '0'}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="CTR"
          value={`${totals.ctr || 0}%`}
          subtitle={`CPC: $${totals.cpc || 0} | CPM: $${totals.cpm || 0}`}
          icon={Target}
          color="yellow"
          trend={2.1}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Impressions Over Time</h2>
            <span className="text-xs text-gray-500">Last 30 days</span>
          </div>
          <ImpressionsChart data={analytics?.dailyData || []} />
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Usage</h2>
          <BudgetGauge
            spent={analytics?.budget?.spent}
            total={analytics?.budget?.total}
            usage={analytics?.budget?.usage}
          />
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{campaignStats?.active || 0}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{campaignStats?.total || 0}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
            <Link to="/campaigns" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Campaign</th>
                  <th className="px-5 py-3">Platform</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Budget</th>
                  <th className="px-5 py-3">Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentCampaigns.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <Link to={`/campaigns/${c._id}`} className="font-medium text-gray-900 hover:text-primary-600">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 capitalize">{c.platform}</td>
                    <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-3 text-sm">${c.budget?.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm">${c.spent?.toLocaleString()}</td>
                  </tr>
                ))}
                {recentCampaigns.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                      <Megaphone className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      No campaigns yet. <Link to="/campaigns" className="text-primary-600">Create one</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Breakdown</h2>
          {platformData.length > 0 ? (
            <PlatformPieChart data={platformData} />
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No platform data</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
