import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

type Column<T> = {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, rowIndex: number) => React.ReactNode;
};

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  selectedRow?: T;
  rowKey?: string;
  className?: string;
}

function getCellAlignClass(align?: 'left' | 'center' | 'right') {
  switch (align) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    default:
      return 'text-left';
  }
}

function normalize(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.toLowerCase();
  return String(value).toLowerCase();
}

const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'Sin datos',
  onRowClick,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  selectedRow,
  rowKey,
  className = '',
}: DataTableProps<T>) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return data;
    const q = query.trim().toLowerCase();
    return data.filter((row) =>
      columns.some((c) => normalize(row[c.key as string]).includes(q))
    );
  }, [data, query, searchable, columns]);

  return (
    <div className={`space-y-3 ${className}`}>
      {searchable && (
        <div className="flex items-center">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>
      )}

      <div className="border border-slate-600 rounded-lg overflow-hidden">
        <div className="max-h-[480px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-700">
                {columns.map((col, idx) => (
                  <TableHead
                    key={idx}
                    className={`text-white ${getCellAlignClass(col.align)} ${col.width || ''}`}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-slate-300">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-slate-400">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row, rowIndex) => {
                  const isSelected = selectedRow && rowKey ? (row[rowKey] === (selectedRow as any)[rowKey]) : false;
                  return (
                  <TableRow
                    key={rowKey ? String(row[rowKey]) : rowIndex}
                    className={`${isSelected ? 'bg-slate-700/60' : ''} hover:bg-slate-700/40 cursor-${onRowClick ? 'pointer' : 'default'}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col, colIndex) => (
                      <TableCell key={colIndex} className={`${getCellAlignClass(col.align)} text-white`}>
                        {col.render ? col.render(row, rowIndex) : row[col.key as string] ?? ''}
                      </TableCell>
                    ))}
                  </TableRow>
                )})
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DataTable;


