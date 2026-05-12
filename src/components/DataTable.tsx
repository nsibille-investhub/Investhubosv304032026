import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  X,
  MoreVertical
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import { toast } from 'sonner@2.0.3';

export interface ColumnConfig<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render: (row: T, searchTerm: string) => ReactNode;
  className?: string;
}

interface DataTableProps<T extends { id: number }> {
  data: T[];
  columns: ColumnConfig<T>[];
  hoveredRow: number | null;
  setHoveredRow: (id: number | null) => void;
  onRowClick: (row: T, tab?: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
  compactMode?: boolean;
  allFilteredData?: T[];
  searchTerm?: string;
  entityName?: string; // "investisseur", "partenaire", etc.
  hideSelection?: boolean;
}

export function DataTable<T extends { id: number }>({
  data,
  columns,
  hoveredRow,
  setHoveredRow,
  onRowClick,
  sortConfig,
  onSort,
  compactMode = false,
  allFilteredData,
  searchTerm = '',
  entityName = 'item',
  hideSelection = false
}: DataTableProps<T>) {
  // Safety check
  if (!columns || columns.length === 0) {
    return null;
  }

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  const totalFilteredData = allFilteredData || data;
  
  useEffect(() => {
    const allIds = totalFilteredData.map(item => item.id);
    const isAllSelected = allIds.length > 0 && allIds.every(id => selectedIds.has(id));
    setSelectAll(isAllSelected);
  }, [selectedIds, totalFilteredData]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      toast.info('Sélection annulée', {
        description: `Tous les ${entityName}s ont été désélectionnés`,
      });
    } else {
      const allIds = new Set(totalFilteredData.map(item => item.id));
      setSelectedIds(allIds);
      toast.success(`${allIds.size} ${entityName}s sélectionnés`, {
        description: `Toutes les pages sont sélectionnées (${allIds.size} ${entityName}s au total)`,
        duration: 4000,
      });
    }
  };

  const handleSelectRow = (id: number) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
    toast.info('Sélection annulée');
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-gray-900 dark:text-gray-100" />
      : <ArrowDown className="w-3.5 h-3.5 text-gray-900 dark:text-gray-100" />;
  };

  return (
    <>
      {/* Selection info banner */}
      <AnimatePresence>
        {!hideSelection && selectedIds.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-muted/50 border-b border-border overflow-hidden"
          >
            <div className="px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary text-primary-foreground px-3 py-1 shadow-sm">
                  {selectedIds.size} {selectedIds.size === 1 ? `${entityName} sélectionné` : `${entityName}s sélectionnés`}
                </Badge>
                <span className="text-sm text-muted-foreground font-medium">
                  {selectedIds.size === totalFilteredData.length 
                    ? '(Toutes les pages sont sélectionnées)'
                    : '(Sélection partielle sur toutes les pages)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-4 h-4 mr-1" />
                  Annuler la sélection
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto relative">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40 backdrop-blur-sm">
              {/* Checkbox column */}
              {!hideSelection && (
                <th className="px-6 py-4 text-left">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer hover:scale-110"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {selectAll
                        ? `Désélectionner tous les ${totalFilteredData.length} ${entityName}s (toutes pages)`
                        : `Sélectionner tous les ${totalFilteredData.length} ${entityName}s (toutes pages)`}
                    </TooltipContent>
                  </Tooltip>
                </th>
              )}

              {/* Dynamic columns */}
              {columns.map((column) => (
                column.sortable ? (
                  <motion.th 
                    key={column.key}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    onClick={() => onSort(column.key)}
                    className={cn(
                      "px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer group",
                      column.className
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      <SortIcon columnKey={column.key} />
                    </div>
                  </motion.th>
                ) : (
                  <th 
                    key={column.key}
                    className={cn(
                      "px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider",
                      column.className
                    )}
                  >
                    {column.label}
                  </th>
                )
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {data.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: compactMode ? 0 : 0.5 + index * 0.05 }}
                  onHoverStart={() => setHoveredRow(row.id)}
                  onHoverEnd={() => setHoveredRow(null)}
                  onClick={() => onRowClick(row)}
                  className={cn(
                    'border-b border-border/70 transition-all duration-200 cursor-pointer',
                    hoveredRow === row.id 
                      ? 'bg-muted/70' 
                      : 'hover:bg-muted/50',
                    selectedIds.has(row.id) && 'bg-muted'
                  )}
                >
                  {/* Checkbox */}
                  {!hideSelection && (
                    <td className="px-6 py-4">
                      <motion.input
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer"
                      />
                    </td>
                  )}

                  {/* Dynamic columns */}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn('px-6 py-4', column.className)}
                    >
                      {column.render(row, searchTerm)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </>
  );
}
