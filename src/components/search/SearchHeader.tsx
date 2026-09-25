import { SearchIcon, ChevronLeftIcon } from '../common/Icons'
import { ActiveFilterChips } from './ActiveFilterChips'
import type { SearchFilters } from '../../types/marketplace'

interface SearchHeaderProps {
  query: string
  onQueryChange: (val: string) => void
  onBack: () => void
  filters: SearchFilters
  activeFilterCount: number
  onOpenFilterSheet: () => void
  onRemoveLocation: () => void
  onRemoveCategory: () => void
  onRemoveBudget: () => void
  onClearAllFilters: () => void
}

export function SearchHeader({
  query,
  onQueryChange,
  onBack,
  filters,
  activeFilterCount,
  onOpenFilterSheet,
  onRemoveLocation,
  onRemoveCategory,
  onRemoveBudget,
  onClearAllFilters,
}: SearchHeaderProps) {
  return (
    <header className="search-activity-header" aria-label="Search header">
      <div className="search-activity-top-row">
        <button
          type="button"
          className="search-back-btn"
          onClick={onBack}
          aria-label="Back to Discover"
        >
          <ChevronLeftIcon className="search-back-icon" />
        </button>

        <div className="search-activity-input-wrap">
          <SearchIcon className="search-activity-search-icon" />
          <input
            id="search-activity-input"
            type="text"
            className="search-activity-input"
            placeholder="Search for a service or provider"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Search for a service or provider"
            autoFocus
          />
          {query.trim().length > 0 && (
            <button
              type="button"
              className="search-activity-clear-btn"
              onClick={() => onQueryChange('')}
              aria-label="Clear search text"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <ActiveFilterChips
        filters={filters}
        activeCount={activeFilterCount}
        onOpenFilterSheet={onOpenFilterSheet}
        onRemoveLocation={onRemoveLocation}
        onRemoveCategory={onRemoveCategory}
        onRemoveBudget={onRemoveBudget}
        onClearAll={onClearAllFilters}
      />
    </header>
  )
}
