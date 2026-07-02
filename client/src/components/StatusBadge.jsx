import { AlertCircle, CheckCircle, Info, AlertTriangle, Megaphone, DollarSign } from 'lucide-react';

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  campaign: Megaphone,
  budget: DollarSign,
};

const colors = {
  info: 'bg-blue-50 text-blue-700',
  success: 'bg-green-50 text-green-700',
  warning: 'bg-yellow-50 text-yellow-700',
  error: 'bg-red-50 text-red-700',
  campaign: 'bg-purple-50 text-purple-700',
  budget: 'bg-orange-50 text-orange-700',
};

const StatusBadge = ({ status }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    archived: 'bg-slate-100 text-slate-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`badge ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export const NotificationIcon = ({ type }) => {
  const Icon = icons[type] || Info;
  return (
    <div className={`p-2 rounded-lg ${colors[type] || colors.info}`}>
      <Icon className="h-4 w-4" />
    </div>
  );
};

export default StatusBadge;
