import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { NotificationIcon } from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const { markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const loadNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/notifications?page=${page}&limit=15`);
      setNotifications(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read');
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      toast.success('Notification deleted');
      loadNotifications(pagination.page);
      fetchNotifications();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated on your campaigns</p>
        </div>
        <button onClick={handleMarkAllRead} className="btn-secondary">
          <CheckCheck className="h-4 w-4" /> Mark all as read
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors ${
                    !n.isRead ? 'bg-primary-50/30' : ''
                  }`}
                >
                  <NotificationIcon type={n.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {n.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {!n.isRead && (
                          <button onClick={() => handleMarkRead(n._id)} className="btn-ghost !p-1.5 text-xs">
                            Mark read
                          </button>
                        )}
                        <button onClick={() => handleDelete(n._id)} className="btn-ghost !p-1.5 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              onPageChange={loadNotifications}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
