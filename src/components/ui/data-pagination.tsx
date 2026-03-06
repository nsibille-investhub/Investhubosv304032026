import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface DataPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
}

export function DataPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  showPageSizeSelector = true
}: DataPaginationProps) {
  // Protéger contre les valeurs invalides
  const safeTotalPages = isNaN(totalPages) || totalPages < 1 ? 1 : totalPages;
  const safeTotalItems = isNaN(totalItems) || totalItems < 0 ? 0 : totalItems;
  const safeCurrentPage = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;
  const safePageSize = isNaN(pageSize) || pageSize < 1 ? 10 : pageSize;

  const startItem = safeTotalItems === 0 ? 0 : (safeCurrentPage - 1) * safePageSize + 1;
  const endItem = Math.min(safeCurrentPage * safePageSize, safeTotalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (safeTotalPages <= maxVisible) {
      // Afficher toutes les pages si le total est petit
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour afficher les pages avec ellipses
      if (safeCurrentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(safeTotalPages);
      } else if (safeCurrentPage >= safeTotalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = safeTotalPages - 3; i <= safeTotalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        pages.push(safeCurrentPage - 1);
        pages.push(safeCurrentPage);
        pages.push(safeCurrentPage + 1);
        pages.push('ellipsis');
        pages.push(safeTotalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
      <div className="flex items-center gap-6">
        {/* Informations sur les éléments affichés */}
        <div className="text-sm text-gray-600">
          Affichage de <span className="font-medium text-gray-900">{startItem}</span> à{' '}
          <span className="font-medium text-gray-900">{endItem}</span> sur{' '}
          <span className="font-medium text-gray-900">{safeTotalItems}</span> résultat{safeTotalItems > 1 ? 's' : ''}
        </div>

        {/* Sélecteur de taille de page */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Afficher</span>
            <Select
              value={safePageSize.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">par page</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        {/* Bouton Précédent */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          className="h-8 px-3 gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Précédent</span>
        </Button>

        {/* Numéros de page */}
        <div className="hidden md:flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="w-8 h-8 flex items-center justify-center text-gray-400"
                >
                  ...
                </div>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === safeCurrentPage;

            return (
              <Button
                key={pageNumber}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                className={`h-8 w-8 p-0 ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={
                  isActive
                    ? { background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }
                    : undefined
                }
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        {/* Indicateur mobile */}
        <div className="md:hidden text-sm text-gray-600">
          Page {safeCurrentPage} / {safeTotalPages}
        </div>

        {/* Bouton Suivant */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === safeTotalPages}
          className="h-8 px-3 gap-1"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}