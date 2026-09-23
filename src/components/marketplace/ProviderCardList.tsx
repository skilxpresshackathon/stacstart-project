import type { MarketplaceItem } from '../../types/marketplace'
import { ProviderCard } from './ProviderCard'

interface ProviderCardListProps {
  items: MarketplaceItem[]
  onItemClick?: (item: MarketplaceItem) => void
}

export function ProviderCardList({ items, onItemClick }: ProviderCardListProps) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state-title">No service providers found</p>
        <p className="empty-state-subtitle">
          Try adjusting your search terms or select another category.
        </p>
      </div>
    )
  }

  return (
    <section className="provider-card-list" aria-label="Featured service providers">
      {items.map((item) => (
        <ProviderCard key={item.id} item={item} onCardClick={onItemClick} />
      ))}
    </section>
  )
}
