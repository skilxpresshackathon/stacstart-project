import { SearchIcon } from '../common/Icons'

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
  onFocus?: () => void
  onClick?: () => void
}

export function SearchBar({ value, onChange, onFocus, onClick }: SearchBarProps) {
  return (
    <section className="search-section" aria-label="Search services or providers">
      <div className="search-input-wrapper">
        <SearchIcon className="search-input-icon" />
        <input
          id="marketplace-search-input"
          type="search"
          className="search-input"
          placeholder="Search for a service or provider"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onClick={onClick}
          aria-label="Search for a service or provider"
        />
      </div>
      <p className="search-helper-text">
        Browse freely — sign in only when you&apos;re ready to book.
      </p>
    </section>
  )
}

