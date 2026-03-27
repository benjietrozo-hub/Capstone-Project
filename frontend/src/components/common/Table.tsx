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
    <div className="overflow-x-auto -mx-3 sm:mx-0 rounded-lg shadow-sm" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="inline-block min-w-full align-middle">
        <table 
          className="border-collapse bg-white" 
          style={{ 
            tableLayout: 'fixed', 
            width: `${totalWidth}px`,
            minWidth: `${totalWidth}px`
          }}
        >
          <thead className="bg-gray-100 border-b">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left font-semibold text-gray-700 text-xs"
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
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-600 text-sm">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-600 text-sm">
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key} 
                      className="px-4 py-3 text-gray-800 text-xs"
                      style={{ 
                        width: column.width || '100px',
                        minWidth: column.width || '100px',
                        maxWidth: column.width || '100px',
                        overflow: 'hidden'
                      }}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
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
