"use client";

import { useCallback, useMemo, useState } from "react";

export function useTableSelection(allIds: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const selectedIds = useMemo(() => [...selected], [selected]);

  const isSelected = useCallback((id: string) => selected.has(id), [selected]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      if (prev.size === allIds.length && allIds.length > 0) return new Set();
      return new Set(allIds);
    });
  }, [allIds]);

  const clear = useCallback(() => setSelected(new Set()), []);

  const allSelected = allIds.length > 0 && selected.size === allIds.length;
  const someSelected = selected.size > 0 && selected.size < allIds.length;

  return {
    selectedIds,
    selectedCount: selected.size,
    isSelected,
    toggle,
    toggleAll,
    clear,
    allSelected,
    someSelected,
  };
}

export type TableSelection = ReturnType<typeof useTableSelection>;
