import { useState, useMemo } from 'react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T, index?: number) => React.ReactNode;
  sortable?: boolean;
}

export interface ActionButton<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: ActionButton<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  filterable?: boolean;
  filterOptions?: { key: string; label: string; options: string[] }[];
  onFilter?: (filters: Record<string, string>) => void;
  emptyMessage?: string;
  loading?: boolean;
  cellPadding?: 'normal' | 'large';
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  searchable = true,
  searchPlaceholder = 'Search...',
  filterable = false,
  filterOptions = [],
  onFilter,
  emptyMessage = 'No data available',
  loading = false,
  cellPadding = 'normal',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    let result = data;

    // Apply search
    if (searchTerm) {
      result = result.filter((item) =>
        columns.some((col) => {
          const value = item[col.key as keyof T];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    if (filterable && filterOptions.length > 0) {
      Object.keys(filters).forEach((filterKey) => {
        if (filters[filterKey]) {
          result = result.filter((item) => item[filterKey] === filters[filterKey]);
        }
      });
    }

    // Apply sorting
    if (sortConfig) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, filters, sortConfig, columns, filterable, filterOptions]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  const getActionButtonStyles = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return 'text-red-600 hover:text-red-800 hover:bg-red-50';
      case 'success':
        return 'text-green-600 hover:text-green-800 hover:bg-green-50';
      case 'primary':
        return 'text-blue-600 hover:text-blue-800 hover:bg-blue-50';
      default:
        return 'text-gray-600 hover:text-gray-800 hover:bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const paddingClass = cellPadding === 'large' ? 'px-10' : 'px-6';

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {searchable && (
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-primary-white text-primary-black focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm"
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        )}

        {filterable && filterOptions.map((filter) => (
          <div key={filter.key} className="sm:w-48">
            <select
              value={filters[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-primary-white text-primary-black focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm"
            >
              <option value="">All {filter.label}</option>
              {filter.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  scope="col"
                  className={`${paddingClass} py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && sortConfig?.key === column.key && (
                      <svg
                        className={`w-4 h-4 ${sortConfig.direction === 'asc' ? '' : 'rotate-180'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th scope="col" className={`${paddingClass} py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className={`${paddingClass} py-12 text-center text-sm text-gray-500`}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={String(column.key)} className={`${paddingClass} py-4 whitespace-nowrap text-sm text-primary-black`}>
                      {column.render ? column.render(item, index) : item[column.key as keyof T]}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className={`${paddingClass} py-4 whitespace-nowrap text-right text-sm font-medium`}>
                      <div className="flex items-center justify-end gap-2">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(item)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${getActionButtonStyles(
                              action.variant
                            )} ${action.className || ''}`}
                            title={action.label}
                          >
                            {action.icon || action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      {filteredData.length > 0 && (
        <div className="text-sm text-gray-500">
          Showing {filteredData.length} of {data.length} results
        </div>
      )}
    </div>
  );
}

