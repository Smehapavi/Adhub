import { Search } from 'lucide-react';

const SearchFilter = ({
  search,
  onSearchChange,
  filters = [],
  onFilterChange,
  placeholder = 'Search...',
}) => (
  <div className="flex flex-col sm:flex-row gap-3">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-10"
      />
    </div>
    {filters.map((filter) => (
      <select
        key={filter.key}
        value={filter.value}
        onChange={(e) => onFilterChange(filter.key, e.target.value)}
        className="input sm:w-40"
      >
        <option value="">{filter.label}</option>
        {filter.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ))}
  </div>
);

export default SearchFilter;
