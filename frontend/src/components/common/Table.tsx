import React from 'react';

interface TableColumn {
  key: string;
  label: string;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  onRowClick?: (row: any) => void;
}

export function Table({ columns, data, loading = false, onRowClick }: TableProps) {
  const totalWidth = columns.reduce((sum, col) => {
    const width = col.width ? parseInt(col.width) : 100;
    return sum + width;
  }, 0);

  return (
    <div className="overflow-x-auto rounded-sm border border-gray-100 shadow-sm" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="inline-block min-w-full align-middle">
        <table 
          className="border-collapse bg-white w-full" 
          style={{ 
            tableLayout: 'fixed', 
            minWidth: `${totalWidth}px`
          }}
        >
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left font-black text-gray-400 text-[10px] uppercase tracking-widest"
                  style={{ 
                    width: column.width || '100px',
                    minWidth: column.width || '100px',
                    maxWidth: column.width || '100px'
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 text-sm">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium">Fetching records...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl">📂</div>
                    <p className="text-sm font-medium">No records available yet</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-blue-50/30 cursor-pointer transition-all duration-200 group"
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key} 
                      className="px-6 py-4 text-gray-700 text-xs font-medium"
                      style={{ 
                        width: column.width || '100px',
                        minWidth: column.width || '100px',
                        maxWidth: column.width || '100px',
                        overflow: 'hidden'
                      }}
                    >
                      {column.render ? column.render(row[column.key], row) : (
                        <span className="truncate block">{row[column.key]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
