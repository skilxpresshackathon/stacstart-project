import { useState } from 'react'
import type { SearchFilters } from '../../types/marketplace'
import { CloseIcon, LocationPinIcon, ChevronDownIcon } from '../common/Icons'
import { DEFAULT_SEARCH_FILTERS } from '../../lib/mockData'

interface FilterSheetProps {
  isOpen: boolean
  filters: SearchFilters
  categories: string[]
  locations: string[]
  onApply: (newFilters: SearchFilters) => void
  onClose: () => void
}

const BUDGET_MIN = 0
const BUDGET_MAX = 200000
const BUDGET_STEP = 5000

export function FilterSheet({
  isOpen,
  filters,
  categories,
  locations,
  onApply,
  onClose,
}: FilterSheetProps) {
  // Temporary state for uncommitted changes
  const [draftFilters, setDraftFilters] = useState<SearchFilters>(filters)

  if (!isOpen) return null


  const handleReset = () => {
    setDraftFilters({ ...DEFAULT_SEARCH_FILTERS })
  }

  const handleApply = () => {
    onApply(draftFilters)
    onClose()
  }

  const handleMinBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    if (val <= draftFilters.maxBudget - BUDGET_STEP) {
      setDraftFilters((prev) => ({ ...prev, minBudget: val }))
    }
  }

  const handleMaxBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    if (val >= draftFilters.minBudget + BUDGET_STEP) {
      setDraftFilters((prev) => ({ ...prev, maxBudget: val }))
    }
  }

  const minPercent = (draftFilters.minBudget / BUDGET_MAX) * 100
  const maxPercent = (draftFilters.maxBudget / BUDGET_MAX) * 100

  // Filter out 'All' from categories and locations for the select options
  const categoryOptions = categories.filter((c) => c !== 'All')
  const locationOptions = locations.filter((l) => l !== 'All')

  return (
    <div
      className="filter-sheet-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-sheet-title"
      onClick={onClose}
    >
      <div
        className="filter-sheet-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="filter-sheet-handle" aria-hidden="true" />

        {/* Header */}
        <div className="filter-sheet-header">
          <h2 id="filter-sheet-title" className="filter-sheet-title">
            Filters
          </h2>
          <button
            type="button"
            className="filter-sheet-close-btn"
            onClick={onClose}
            aria-label="Close filters"
          >
            <CloseIcon className="filter-close-icon" />
          </button>
        </div>

        {/* Filter Form Content */}
        <div className="filter-sheet-body">
          {/* Location Selector */}
          <div className="filter-group">
            <label htmlFor="filter-location-select" className="filter-group-label">
              Location
            </label>
            <div className="filter-select-wrapper">
              <LocationPinIcon className="filter-select-icon-left" />
              <select
                id="filter-location-select"
                className="filter-select"
                value={draftFilters.location}
                onChange={(e) =>
                  setDraftFilters((prev) => ({ ...prev, location: e.target.value }))
                }
              >
                <option value="">Select location</option>
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="filter-select-icon-right" />
            </div>
          </div>

          {/* Service Category Selector */}
          <div className="filter-group">
            <label htmlFor="filter-category-select" className="filter-group-label">
              Service Category
            </label>
            <div className="filter-select-wrapper">
              <select
                id="filter-category-select"
                className="filter-select filter-select-no-icon"
                value={draftFilters.category}
                onChange={(e) =>
                  setDraftFilters((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <option value="">Select category</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="filter-select-icon-right" />
            </div>
          </div>

          {/* Budget Range Slider */}
          <div className="filter-group">
            <label className="filter-group-label">Budget</label>
            <div className="budget-slider-box">
              <div className="budget-slider-track-wrap">
                <div className="budget-slider-base-track" />
                <div
                  className="budget-slider-active-track"
                  style={{
                    left: `${minPercent}%`,
                    width: `${Math.max(0, maxPercent - minPercent)}%`,
                  }}
                />
                <input
                  type="range"
                  min={BUDGET_MIN}
                  max={BUDGET_MAX}
                  step={BUDGET_STEP}
                  value={draftFilters.minBudget}
                  onChange={handleMinBudgetChange}
                  className="budget-slider-input"
                  aria-label="Minimum budget"
                />
                <input
                  type="range"
                  min={BUDGET_MIN}
                  max={BUDGET_MAX}
                  step={BUDGET_STEP}
                  value={draftFilters.maxBudget}
                  onChange={handleMaxBudgetChange}
                  className="budget-slider-input"
                  aria-label="Maximum budget"
                />
              </div>

              {/* Price labels */}
              <div className="budget-values-row">
                <span className="budget-value-text">
                  ₦{draftFilters.minBudget.toLocaleString()}
                </span>
                <span className="budget-value-text">
                  ₦{draftFilters.maxBudget.toLocaleString()}
                </span>
              </div>

              {/* Helper text */}
              <p className="budget-helper-text">
                We&apos;ll prioritize providers priced near this range.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="filter-sheet-footer">
          <button
            type="button"
            className="filter-btn-reset"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            type="button"
            className="filter-btn-apply"
            onClick={handleApply}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}
