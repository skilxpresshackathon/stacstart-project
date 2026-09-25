import type { SearchFilters } from '../../types/marketplace'
import { FilterSlidersIcon } from '../common/Icons'
import { formatBudgetChip } from '../../lib/mockData'

interface ActiveFilterChipsProps {
  filters: SearchFilters
  activeCount: number
  onOpenFilterSheet: () => void
  onRemoveLocation: () => void
  onRemoveCategory: () => void
  onRemoveBudget: () => void
  onClearAll: () => void
}

export function ActiveFilterChips({
  filters,
  activeCount,
  onOpenFilterSheet,
  onRemoveLocation,
  onRemoveCategory,
  onRemoveBudget,
  onClearAll,
}: ActiveFilterChipsProps) {
  const isLocationActive = Boolean(filters.location && filters.location !== 'All')
  const isCategoryActive = Boolean(filters.category && filters.category !== 'All')
  const isBudgetActive = filters.minBudget > 0 || filters.maxBudget < 200000

  // Display location short name (e.g., "Ikeja" from "Ikeja, Lagos")
  const locationLabel = filters.location ? filters.location.split(',')[0].trim() : ''

  return (
    <div className="search-filters-bar" aria-label="Search filter options">
      {/* Filters trigger button */}
      <button
        type="button"
        className={`search-filter-trigger-btn ${activeCount > 0 ? 'active' : ''}`}
        onClick={onOpenFilterSheet}
        aria-label={
          activeCount > 0
            ? `Open filters (${activeCount} active)`
            : 'Open filters'
        }
      >
        <FilterSlidersIcon className="search-filter-trigger-icon" />
        <span className="search-filter-trigger-text">Filters</span>
        {activeCount > 0 && (
          <span className="search-filter-badge">{activeCount}</span>
        )}
      </button>

      {/* Active filter chips */}
      {isLocationActive && (
        <div className="filter-chip" role="status">
          <span className="filter-chip-text">{locationLabel}</span>
          <button
            type="button"
            className="filter-chip-remove"
            onClick={onRemoveLocation}
            aria-label={`Remove ${locationLabel} location filter`}
          >
            ✕
          </button>
        </div>
      )}

      {isCategoryActive && (
        <div className="filter-chip" role="status">
          <span className="filter-chip-text">{filters.category}</span>
          <button
            type="button"
            className="filter-chip-remove"
            onClick={onRemoveCategory}
            aria-label={`Remove ${filters.category} category filter`}
          >
            ✕
          </button>
        </div>
      )}

      {isBudgetActive && (
        <div className="filter-chip" role="status">
          <span className="filter-chip-text">
            {formatBudgetChip(filters.minBudget, filters.maxBudget)}
          </span>
          <button
            type="button"
            className="filter-chip-remove"
            onClick={onRemoveBudget}
            aria-label="Remove budget filter"
          >
            ✕
          </button>
        </div>
      )}

      {/* Clear all option when at least one filter is active */}
      {activeCount > 0 && (
        <button
          type="button"
          className="filter-chip-clear-all"
          onClick={onClearAll}
          aria-label="Clear all active filters"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
