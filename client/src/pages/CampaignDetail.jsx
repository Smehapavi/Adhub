import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, DollarSign, Calendar, Target } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import { ImpressionsChart, ClicksChart, MetricsChart, BudgetGauge } from '../components/Charts';

const CampaignDetail = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campRes, analyticsRes] = await Promise.all([
          api.get(`/campaigns/${id}`),
          api.get(`/analytics/campaign/${id}?days=30`),
        ]);
        setCampaign(campRes.data.data);
        setAnalytics(analyticsRes.data.data);
      } catch {
        /* handled */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Campaign not found</p>
        <Link to="/campaigns" className="text-primary-600 mt-2 inline-block">Back to campaigns</Link>
      </div>
    );
  }

  const totals = analytics?.totals || {};

  return (
    <div className="space-y-6">
      <div>
        <Link to="/campaigns" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to campaigns
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
              <StatusBadge status={campaign.status} />
            </div>
            <p className="text-gray-500 mt-1">{campaign.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Budget" value={`$${campaign.budget?.toLocaleString()}`} icon={DollarSign} color="green" />
        <StatCard title="Impressions" value={totals.impressions?.toLocaleString() || '0'} icon={Target} color="primary" />
        <StatCard title="Clicks" value={totals.clicks?.toLocaleString() || '0'} icon={Target} color="purple" />
        <StatCard title="CTR" value={`${totals.ctr || 0}%`} subtitle={`CPC: $${totals.cpc || 0}`} icon={Target} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Campaign Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
            </div>
            <div><span className="text-gray-500">Platform:</span> <span className="capitalize font-medium">{campaign.platform}</span></div>
            <div><span className="text-gray-500">Audience:</span> {campaign.targetAudience || 'General'}</div>
            {campaign.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {campaign.tags.map((tag) => (
                  <span key={tag} className="badge bg-gray-100 text-gray-700">{tag}</span>
                ))}
              </div>
            )}
          </div>
          <BudgetGauge spent={campaign.spent} total={campaign.budget} usage={analytics?.budgetUsage} />
        </div>

        <div className="lg:col-span-2 card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Performance (30 days)</h2>
          <ImpressionsChart data={analytics?.dailyData || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Clicks</h2>
          <ClicksChart data={analytics?.dailyData || []} />
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">CTR / CPC / CPM</h2>
          <MetricsChart data={analytics?.dailyData || []} />
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
