import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  // Card layout renderer for mobile view
  renderMobileCard?: (item: T, index: number) => React.ReactNode;
}

export function Table<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found.',
  onRowClick,
  renderMobileCard,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
        <p className="text-sm font-medium text-neutral-500 font-sans">Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <p className="text-sm font-medium text-neutral-500 font-sans">{emptyMessage}</p>
      </div>
    );
  }

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  return (
    <div className="w-full">
      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-cream-150">
        <table className="min-w-full divide-y divide-cream-100 text-sm font-sans">
          <thead>
            <tr className="text-xs text-neutral-400 font-bold uppercase tracking-wider text-left bg-cream-50/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 ${getAlignClass(col.align)}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100 text-primary-800 font-medium bg-white">
            {data.map((item, rIndex) => (
              <tr
                key={rIndex}
                onClick={() => onRowClick?.(item)}
                className={`transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-cream-50/30' : 'hover:bg-cream-50/10'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 whitespace-nowrap ${getAlignClass(col.align)}`}
                  >
                    {col.render ? col.render(item, rIndex) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="block md:hidden space-y-4">
        {data.map((item, index) => {
          if (renderMobileCard) {
            return (
              <div
                key={index}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {renderMobileCard(item, index)}
              </div>
            );
          }

          return (
            <div
              key={index}
              onClick={() => onRowClick?.(item)}
              className={`p-4 bg-white border border-cream-150 rounded-luxury shadow-sm space-y-2 ${
                onRowClick ? 'cursor-pointer active:bg-cream-50' : ''
              }`}
            >
              {columns.map((col) => (
                <div key={col.key} className="flex justify-between items-start text-xs">
                  <span className="font-bold text-neutral-400 uppercase tracking-wider">{col.header}:</span>
                  <span className="text-primary-800 font-semibold text-right">
                    {col.render ? col.render(item, index) : (item as any)[col.key]}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Table;
