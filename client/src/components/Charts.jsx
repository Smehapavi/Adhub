import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, parseISO } from 'date-fns';

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626'];

const formatDate = (dateStr) => {
  try {
    return format(parseISO(dateStr), 'MMM d');
  } catch {
    return dateStr;
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-gray-900 mb-1">{formatDate(label)}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
};

export const ImpressionsChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="impressionsGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} stroke="#94a3b8" />
      <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
      <Tooltip content={<CustomTooltip />} />
      <Area type="monotone" dataKey="impressions" name="Impressions" stroke="#2563eb" fill="url(#impressionsGrad)" strokeWidth={2} />
    </AreaChart>
  </ResponsiveContainer>
);

export const ClicksChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} stroke="#94a3b8" />
      <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
      <Tooltip content={<CustomTooltip />} />
      <Line type="monotone" dataKey="clicks" name="Clicks" stroke="#7c3aed" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

export const SpendChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} stroke="#94a3b8" />
      <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="spend" name="Spend ($)" fill="#059669" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const MetricsChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} stroke="#94a3b8" />
      <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
      <Tooltip content={<CustomTooltip />} />
      <Line type="monotone" dataKey="ctr" name="CTR (%)" stroke="#2563eb" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="cpc" name="CPC ($)" stroke="#d97706" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="cpm" name="CPM ($)" stroke="#dc2626" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

export const PlatformPieChart = ({ data }) => {
  const chartData = data.map((d) => ({
    name: d._id?.charAt(0).toUpperCase() + d._id?.slice(1) || 'Other',
    value: d.count,
    budget: d.budget,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const BudgetGauge = ({ spent, total, usage }) => {
  const percentage = usage || (total > 0 ? (spent / total) * 100 : 0);

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Budget Used</span>
        <span className="font-semibold text-gray-900">{percentage.toFixed(1)}%</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>${spent?.toLocaleString()} spent</span>
        <span>${total?.toLocaleString()} total</span>
      </div>
    </div>
  );
};
