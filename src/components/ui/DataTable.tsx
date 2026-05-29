import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from './Input';
import { Pagination } from './Pagination';
import { Skeleton } from './Skeleton';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pageSize?: number;
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  serverPagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  keyExtractor: (item: T) => string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pageSize: defaultPageSize = 10,
  searchable = false,
  searchKeys,
  onRowClick,
  emptyMessage = 'No data found',
  serverPagination,
  keyExtractor,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    if (!search || !searchKeys) return data;
    const lower = search.toLowerCase();
    return data.filter(item =>
      searchKeys.some(key => String(item[key] ?? '').toLowerCase().includes(lower))
    );
  }, [data, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = serverPagination ? serverPagination.totalPages : Math.ceil(sorted.length / pageSize);
  const currentPage = serverPagination ? serverPagination.currentPage : page;
  const paginatedData = serverPagination ? sorted : sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
      )}

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                {columns.map(col => (
                  <th
                    key={col.key}
                    className={`text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4 ${col.sortable ? 'cursor-pointer hover:bg-muted select-none' : ''} ${col.className || ''}`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span className="flex items-center gap-1">
                      {col.header}
                      {col.sortable && sortKey === col.key && (
                        <span className="text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-8 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map(item => (
                  <tr
                    key={keyExtractor(item)}
                    className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-accent/50' : 'hover:bg-muted/30'}`}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map(col => (
                      <td key={col.key} className={`py-3 px-4 text-sm ${col.className || ''}`}>
                        {col.render ? col.render(item) : String(item[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {serverPagination ? (
        <Pagination
          currentPage={serverPagination.currentPage}
          totalPages={serverPagination.totalPages}
          totalItems={serverPagination.totalItems}
          pageSize={pageSize}
          onPageChange={serverPagination.onPageChange}
          onPageSizeChange={serverPagination.onPageSizeChange}
        />
      ) : (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sorted.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={size => { setPageSize(size); setPage(1); }}
        />
      )}
    </div>
  );
}
