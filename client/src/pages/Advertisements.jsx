import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Image, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getMediaUrl } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import SearchFilter from '../components/SearchFilter';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { ConfirmDialog } from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyForm = {
  title: '',
  description: '',
  campaign: '',
  type: 'image',
  status: 'draft',
  destinationUrl: '',
  cpc: '0.5',
  cpm: '5',
};

const Advertisements = () => {
  const [ads, setAds] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [mediaFile, setMediaFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/campaigns?limit=100').then(({ data }) => setCampaigns(data.data)).catch(() => {});
  }, []);

  const fetchAds = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append('search', search);
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);

      const { data } = await api.get(`/ads?${params}`);
      setAds(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load advertisements');
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    const timer = setTimeout(() => fetchAds(1), 300);
    return () => clearTimeout(timer);
  }, [fetchAds]);

  const openCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setMediaFile(null);
    setPreview('');
    setModalOpen(true);
  };

  const openEdit = (ad) => {
    setSelected(ad);
    setForm({
      title: ad.title,
      description: ad.description || '',
      campaign: ad.campaign?._id || ad.campaign,
      type: ad.type,
      status: ad.status,
      destinationUrl: ad.destinationUrl || '',
      cpc: ad.cpc?.toString() || '0.5',
      cpm: ad.cpm?.toString() || '5',
    });
    setMediaFile(null);
    setPreview(ad.mediaUrl ? getMediaUrl(ad.mediaUrl) : '');
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (mediaFile) formData.append('media', mediaFile);

      if (selected) {
        await api.put(`/ads/${selected._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Advertisement updated');
      } else {
        await api.post('/ads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Advertisement created');
      }
      setModalOpen(false);
      fetchAds(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/ads/${selected._id}`);
      toast.success('Advertisement deleted');
      setDeleteOpen(false);
      fetchAds(pagination.page);
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
          <h1 className="text-2xl font-bold text-gray-900">Advertisements</h1>
          <p className="text-gray-500 mt-1">Manage your ad creatives and media</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> New Ad
        </button>
      </div>

      <div className="card p-4">
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          placeholder="Search ads..."
          filters={[
            {
              key: 'status',
              label: 'All Status',
              value: filters.status,
              options: [
                { value: 'draft', label: 'Draft' },
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
              ],
            },
            {
              key: 'type',
              label: 'All Types',
              value: filters.type,
              options: [
                { value: 'image', label: 'Image' },
                { value: 'video', label: 'Video' },
                { value: 'banner', label: 'Banner' },
              ],
            },
          ]}
          onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ads.map((ad) => (
              <div key={ad._id} className="card overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {ad.mediaUrl ? (
                    ad.type === 'video' ? (
                      <video src={getMediaUrl(ad.mediaUrl)} className="w-full h-full object-cover" />
                    ) : (
                      <img src={getMediaUrl(ad.mediaUrl)} alt={ad.title} className="w-full h-full object-cover" />
                    )
                  ) : (
                    <Image className="h-12 w-12 text-gray-300" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{ad.title}</h3>
                    <StatusBadge status={ad.status} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{ad.type} · {ad.campaign?.name}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{ad.description}</p>
                  <div className="flex justify-end gap-1 mt-3">
                    <button onClick={() => openEdit(ad)} className="btn-ghost !p-2"><Edit className="h-4 w-4" /></button>
                    <button
                      onClick={() => { setSelected(ad); setDeleteOpen(true); }}
                      className="btn-ghost !p-2 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {ads.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Image className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                No advertisements found
              </div>
            )}
          </div>
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            onPageChange={fetchAds}
          />
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selected ? 'Edit Ad' : 'New Ad'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={2} />
            </div>
            <div>
              <label className="label">Campaign</label>
              <select value={form.campaign} onChange={(e) => setForm({ ...form, campaign: e.target.value })} className="input" required>
                <option value="">Select campaign</option>
                {campaigns.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div>
              <label className="label">Destination URL</label>
              <input value={form.destinationUrl} onChange={(e) => setForm({ ...form, destinationUrl: e.target.value })} className="input" placeholder="https://" />
            </div>
            <div>
              <label className="label">CPC ($)</label>
              <input type="number" step="0.01" value={form.cpc} onChange={(e) => setForm({ ...form, cpc: e.target.value })} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Media (Image or Video)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
                {preview ? (
                  <div className="relative">
                    {form.type === 'video' || preview.includes('video') ? (
                      <video src={preview} className="max-h-40 mx-auto rounded" controls />
                    ) : (
                      <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded" />
                    )}
                  </div>
                ) : (
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                )}
                <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="mt-2 text-sm" />
              </div>
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
        title="Delete Advertisement"
        message={`Are you sure you want to delete "${selected?.title}"?`}
        loading={submitting}
      />
    </div>
  );
};

export default Advertisements;
