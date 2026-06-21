import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const delta = 2;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </p>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {getPageNumbers().map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">...</span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onPageChange(page)}
              className="w-8 h-8 text-sm"
            >
              {page}
            </Button>
          )
        )}

        <Button variant="ghost" size="icon" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>

      {onPageSizeChange && (
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          className="h-8 text-sm rounded-md border border-input bg-transparent px-2"
        >
          {[10, 20, 50, 100].map(size => (
            <option key={size} value={size}>{size} / page</option>
          ))}
        </select>
      )}
    </div>
  );
}
