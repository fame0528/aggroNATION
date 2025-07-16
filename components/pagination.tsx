import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount?: number;
  pageSize?: number;
  className?: string;
  ariaLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  pageSize,
  className = '',
  ariaLabel = 'Pagination Navigation',
}) => {
  if (totalPages <= 1) return null;

  // Show up to 5 page numbers, with ellipsis if needed
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <nav
      className={`flex items-center justify-between px-6 py-4 bg-gray-800 border-t border-gray-700 ${className}`}
      aria-label={ariaLabel}
    >
      <div className="flex items-center space-x-2 text-sm text-gray-400">
        {typeof totalCount === 'number' && typeof pageSize === 'number' && (
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2" role="navigation" aria-label="Pagination">
        <button
          className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded px-3 py-1 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          tabIndex={0}
        >
          Previous
        </button>
        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={`page-${page}`}
              className={`w-8 h-8 p-0 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                page === currentPage
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => onPageChange(page as number)}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
              tabIndex={0}
            >
              {page}
            </button>
          ),
        )}
        <button
          className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded px-3 py-1 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          tabIndex={0}
        >
          Next
        </button>
      </div>
    </nav>
  );
};
