import { useState, useMemo, useCallback } from 'react';

interface UseBulkSelectionOptions<T> {
  /** All items matching the current filters (across all pages). */
  allFilteredItems: T[];
  /** Items on the current page only. */
  pageItems: T[];
  /** Extract a unique ID from an item. */
  getId: (item: T) => string;
  /** Optional predicate — only items passing this can be selected. */
  canSelect?: (item: T) => boolean;
}

interface UseBulkSelectionReturn<T> {
  selectedIds: Set<string>;
  /** Whether "select all filtered" mode is active. */
  selectAllFiltered: boolean;
  /** Toggle a single row. */
  toggleRow: (id: string) => void;
  /** Set multiple rows selected or deselected at once. */
  setRowsSelected: (ids: string[], selected: boolean) => void;
  /** Toggle all selectable items on the current page. */
  togglePageAll: () => void;
  /** Select all items matching the current filter (cross-page). */
  selectAllFilteredItems: () => void;
  /** Clear the entire selection. */
  clearSelection: () => void;
  /** Whether every selectable item on the page is selected. */
  allPageSelected: boolean;
  /** Whether some (but not all) selectable page items are selected. */
  somePageSelected: boolean;
  /** The total count of selected items. */
  selectedCount: number;
  /** The actual selected item objects (from allFilteredItems). */
  selectedItems: T[];
}

export function useBulkSelection<T>({
  allFilteredItems,
  pageItems,
  getId,
  canSelect,
}: UseBulkSelectionOptions<T>): UseBulkSelectionReturn<T> {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAllFiltered, setSelectAllFiltered] = useState(false);

  const selectablePageItems = useMemo(
    () => (canSelect ? pageItems.filter(canSelect) : pageItems),
    [pageItems, canSelect],
  );

  const selectablePageIds = useMemo(
    () => selectablePageItems.map(getId),
    [selectablePageItems, getId],
  );

  const allPageSelected =
    selectablePageIds.length > 0 &&
    selectablePageIds.every((id) => selectedIds.has(id));

  const somePageSelected =
    !allPageSelected && selectablePageIds.some((id) => selectedIds.has(id));

  const toggleRow = useCallback((id: string) => {
    setSelectAllFiltered(false);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setRowsSelected = useCallback((ids: string[], selected: boolean) => {
    setSelectAllFiltered(false);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => {
        if (selected) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  }, []);

  const togglePageAll = useCallback(() => {
    setSelectAllFiltered(false);
    setSelectedIds((prev) => {
      if (
        selectablePageIds.length > 0 &&
        selectablePageIds.every((id) => prev.has(id))
      ) {
        const next = new Set(prev);
        selectablePageIds.forEach((id) => next.delete(id));
        return next;
      }
      const next = new Set(prev);
      selectablePageIds.forEach((id) => next.add(id));
      return next;
    });
  }, [selectablePageIds]);

  const selectAllFilteredItems = useCallback(() => {
    const selectable = canSelect
      ? allFilteredItems.filter(canSelect)
      : allFilteredItems;
    const ids = new Set(selectable.map(getId));
    setSelectedIds(ids);
    setSelectAllFiltered(true);
  }, [allFilteredItems, getId, canSelect]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelectAllFiltered(false);
  }, []);

  const selectedCount = selectedIds.size;

  const selectedItems = useMemo(
    () => allFilteredItems.filter((item) => selectedIds.has(getId(item))),
    [allFilteredItems, selectedIds, getId],
  );

  return {
    selectedIds,
    selectAllFiltered,
    toggleRow,
    setRowsSelected,
    togglePageAll,
    selectAllFilteredItems,
    clearSelection,
    allPageSelected,
    somePageSelected,
    selectedCount,
    selectedItems,
  };
}
