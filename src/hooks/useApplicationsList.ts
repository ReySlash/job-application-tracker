import { useState, useMemo } from 'react';
import type { FilterStatus } from '../types/StatusFilter';
import type { MobileSortOption, SortConfig, SortKey } from '../types/SortConfig';
import type { Application } from '../types/ApplicationType';

function useApplications(applications: Application[]) {
  // Local state for the search query, status filter and date sort.
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filtered list based on the search query, applied before status filtering and sorting.
  const searchedApplications = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return applications.filter(
      (app) => app.company.toLowerCase().includes(query) || app.role.toLowerCase().includes(query),
    );
  }, [applications, searchQuery]);

  // Filter state controls which application statuses are visible.
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Apply the selected status filter before sorting.
  const filteredApplications = useMemo(() => {
    return filterStatus !== 'all'
      ? searchedApplications.filter((app) => app.status === filterStatus)
      : searchedApplications;
  }, [searchedApplications, filterStatus]);

  // Sort state controls the applied date ordering.
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Sort a copy of the filtered list so the provider state stays unchanged.
  // handle column header sort click
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
  // handle mobile sort change from the dropdown
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
