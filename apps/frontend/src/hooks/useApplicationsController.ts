import { useState, useMemo } from 'react';
import type { FilterStatus } from '../types/StatusFilter';
import type { MobileSortOption, SortConfig, SortKey } from '../types/SortConfig';
import type { Application } from '../types/ApplicationType';

function useApplications(applications: Application[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Apply search first so the later filter/sort steps work on a smaller list.
  const searchedApplications = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return applications.filter(
      (app) => app.company.toLowerCase().includes(query) || app.role.toLowerCase().includes(query),
    );
  }, [applications, searchQuery]);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const filteredApplications = useMemo(() => {
    return filterStatus !== 'all'
      ? searchedApplications.filter((app) => app.status === filterStatus)
      : searchedApplications;
  }, [searchedApplications, filterStatus]);

  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Clicking the same column toggles direction; a new column starts in ascending order.
  const handleColumnSort = (key: SortKey) => {
    if (!sortConfig || sortConfig.sortKey !== key) {
      setSortConfig({ sortKey: key, sortOrder: 'asc' });
    } else {
      setSortConfig({
        sortKey: key,
        sortOrder: sortConfig.sortOrder === 'asc' ? 'desc' : 'asc',
      });
    }
  };

  // Mobile uses a single select, so the key and direction are encoded in one value.
  const handleMobileSortChange = (value: MobileSortOption) => {
    if (value === 'none') {
      setSortConfig(null);
      return;
    }
    const [sortKey, sortOrder] = value.split('-') as [SortKey, 'asc' | 'desc'];
    setSortConfig({ sortKey, sortOrder });
  };

  const sortedApplications = useMemo(() => {
    if (!sortConfig?.sortKey) return filteredApplications;

    // Sort a copy so the original query result stays untouched for other consumers.
    const sorted = [...filteredApplications].sort((a, b) => {
      const aValue = a[sortConfig.sortKey];
      const bValue = b[sortConfig.sortKey];
      if (aValue < bValue) return sortConfig.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredApplications, sortConfig]);

  return {
    sortedApplications,
    handleColumnSort,
    handleMobileSortChange,
    sortConfig,
    searchQuery,
    setSearchQuery,
    filtersOpen,
    setFiltersOpen,
    filterStatus,
    setFilterStatus,
  };
}

export default useApplications;
