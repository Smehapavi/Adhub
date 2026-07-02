import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import SearchFilter from '../components/SearchFilter';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { ConfirmDialog } from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyForm = {
  name: '',
  description: '',
  budget: '',
  startDate: '',
  endDate: '',
  status: 'draft',
  platform: 'google',
  targetAudience: '',
  tags: '',
};

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', platform: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchCampaigns = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append('search', search);
      if (filters.status) params.append('status', filters.status);
      if (filters.platform) params.append('platform', filters.platform);

      const { data } = await api.get(`/campaigns?${params}`);
      setCampaigns(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCampaigns(1), 300);
    return () => clearTimeout(timer);
  }, [fetchCampaigns]);

  const openCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (campaign) => {
    setSelected(campaign);
    setForm({
      name: campaign.name,
      description: campaign.description || '',
      budget: campaign.budget,
      startDate: campaign.startDate?.split('T')[0],
      endDate: campaign.endDate?.split('T')[0],
      status: campaign.status,
      platform: campaign.platform,
      targetAudience: campaign.targetAudience || '',
      tags: campaign.tags?.join(', ') || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        budget: parseFloat(form.budget),
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };

      if (selected) {
        await api.put(`/campaigns/${selected._id}`, payload);
        toast.success('Campaign updated');
      } else {
        await api.post('/campaigns', payload);
        toast.success('Campaign created');
      }
      setModalOpen(false);
      fetchCampaigns(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/campaigns/${selected._id}`);
      toast.success('Campaign deleted');
      setDeleteOpen(false);
      fetchCampaigns(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-500 mt-1">Manage your advertising campaigns</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> New Campaign
        </button>
      </div>

      <div className="card p-4">
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          placeholder="Search campaigns..."
          filters={[
            {
              key: 'status',
              label: 'All Status',
              value: filters.status,
              options: [
                { value: 'draft', label: 'Draft' },
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
                { value: 'completed', label: 'Completed' },
              ],
            },
            {
              key: 'platform',
              label: 'All Platforms',
              value: filters.platform,
              options: [
                { value: 'google', label: 'Google' },
                { value: 'meta', label: 'Meta' },
                { value: 'youtube', label: 'YouTube' },
                { value: 'display', label: 'Display' },
              ],
            },
          ]}
          onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
        />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                    <th className="px-5 py-3">Campaign</th>
                    <th className="px-5 py-3">Platform</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Budget</th>
                    <th className="px-5 py-3">Spent</th>
                    <th className="px-5 py-3">Duration</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaigns.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <Link to={`/campaigns/${c._id}`} className="font-medium text-gray-900 hover:text-primary-600">
                          {c.name}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{c.description}</p>
                      </td>
                      <td className="px-5 py-4 text-sm capitalize">{c.platform}</td>
                      <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                      <td className="px-5 py-4 text-sm font-medium">${c.budget?.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm">${c.spent?.toLocaleString()}</td>
                      <td className="px-5 py-4 text-xs text-gray-500">
                        {new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(c)} className="btn-ghost !p-2"><Edit className="h-4 w-4" /></button>
                          <button
                            onClick={() => { setSelected(c); setDeleteOpen(true); }}
                            className="btn-ghost !p-2 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {campaigns.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                        <Megaphone className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                        No campaigns found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              onPageChange={fetchCampaigns}
            />
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selected ? 'Edit Campaign' : 'New Campaign'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Campaign Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={2} />
            </div>
            <div>
              <label className="label">Budget ($)</label>
              <input type="number" min="1" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">Platform</label>
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="input">
                <option value="google">Google</option>
                <option value="meta">Meta</option>
                <option value="youtube">YouTube</option>
                <option value="display">Display</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="label">Target Audience</label>
              <input value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Tags (comma separated)</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input" placeholder="summer, sale, promo" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <LoadingSpinner size="sm" /> : selected ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        message={`Are you sure you want to delete "${selected?.name}"? This will also remove all associated ads and analytics.`}
        loading={submitting}
      />
    </div>
  );
};

export default Campaigns;
