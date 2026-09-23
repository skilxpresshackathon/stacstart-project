import { useState, useMemo } from 'react'
import { Header } from '../components/marketplace/Header'
import { SearchBar } from '../components/marketplace/SearchBar'
import { CategoryFilter } from '../components/marketplace/CategoryFilter'
import { ProviderCardList } from '../components/marketplace/ProviderCardList'
import { CATEGORIES, MOCK_MARKETPLACE_ITEMS } from '../lib/mockData'

export function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredItems = useMemo(() => {
    return MOCK_MARKETPLACE_ITEMS.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.provider.category !== selectedCategory) {
        return false
      }

      // Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim()
        const matchesName = item.provider.businessName.toLowerCase().includes(query)
        const matchesService = item.service.name.toLowerCase().includes(query)
        const matchesLocation = item.provider.location.toLowerCase().includes(query)
        const matchesCategory = item.provider.category.toLowerCase().includes(query)
        return matchesName || matchesService || matchesLocation || matchesCategory
      }

      return true
    })
  }, [searchQuery, selectedCategory])

  const handleAuthClick = () => {
    // Guest discovery mode: authentication placeholder
  }

  const handleCardClick = () => {
    // Guest discovery mode: will link to provider profile in subsequent tasks
  }

  return (
    <div className="discover-screen">
      <div className="screen-container">
        <Header onAuthClick={handleAuthClick} />
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <CategoryFilter
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <main className="marketplace-content">
          <ProviderCardList items={filteredItems} onItemClick={handleCardClick} />
        </main>
      </div>
    </div>
  )
}
