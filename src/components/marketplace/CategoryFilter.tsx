interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <nav className="category-nav" aria-label="Service categories">
      <div className="category-scroll-container">
        {categories.map((cat) => {
          const isSelected = cat === selectedCategory
          return (
            <button
              key={cat}
              type="button"
              className={`category-pill ${isSelected ? 'category-pill-active' : ''}`}
              onClick={() => onSelectCategory(cat)}
              aria-pressed={isSelected}
            >
              {cat}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
