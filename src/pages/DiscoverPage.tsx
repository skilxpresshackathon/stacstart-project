import { useState, useMemo, useEffect, useRef } from 'react'
import { Header } from '../components/marketplace/Header'
import { SearchBar } from '../components/marketplace/SearchBar'
import { CategoryFilter } from '../components/marketplace/CategoryFilter'
import { ProviderCardList } from '../components/marketplace/ProviderCardList'
import { NavDrawer } from '../components/navigation/NavDrawer'
import { AuthModal, type AuthMode } from '../components/auth/AuthModal'
import { VideoViewer } from '../components/marketplace/VideoViewer'
import { RequestService } from '../components/booking/RequestService'
import { BookingsView } from '../components/booking/BookingsView'
import { SearchHeader } from '../components/search/SearchHeader'
import { SearchResultCard } from '../components/search/SearchResultCard'
import { FilterSheet } from '../components/search/FilterSheet'
import { SearchIcon } from '../components/common/Icons'
import {
  CATEGORIES,
  MOCK_MARKETPLACE_ITEMS,
  LOCATIONS,
  DEFAULT_SEARCH_FILTERS,
  parsePriceRange,
} from '../lib/mockData'
import type { MarketplaceItem, User, BookingRequest, SearchFilters } from '../types/marketplace'

export function DiscoverPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<'discover' | 'bookings' | 'video-viewer' | 'request-service'>('discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: AuthMode }>({
    isOpen: false,
    mode: 'login',
  })
  const [selectedDetailItem, setSelectedDetailItem] = useState<MarketplaceItem | null>(null)
  const [bookingTargetItem, setBookingTargetItem] = useState<MarketplaceItem | null>(null)
  const [bookings, setBookings] = useState<BookingRequest[]>([])
  const [notification, setNotification] = useState<string | null>(null)

  // Scroll position preservation for Discover feed
  const lastDiscoverScrollY = useRef(0)

  // Scroll direction detection for Discover feed header hide/reveal
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    if (currentView !== 'discover' || isSearchActive) return

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const prevScrollY = lastScrollY.current
      const delta = currentScrollY - prevScrollY

      setIsScrolled(currentScrollY > 15)

      // Always show header when at the very top of the page
      if (currentScrollY <= 15) {
        setIsHeaderVisible(true)
      } else if (delta > 6 && currentScrollY > 60) {
        // Scrolling downward -> hide header
        setIsHeaderVisible(false)
      } else if (delta < -1) {
        // Scrolling upward -> immediately reveal header
        setIsHeaderVisible(true)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentView, isSearchActive])

  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr))
    }, 4500)
  }

  // Active filters count for Search Activity
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (searchFilters.location.trim() !== '' && searchFilters.location !== 'All') count++
    if (searchFilters.category.trim() !== '' && searchFilters.category !== 'All') count++
    if (searchFilters.minBudget > 0 || searchFilters.maxBudget < 200000) count++
    return count
  }, [searchFilters])

  // Discover feed items (standard portrait card browsing)
  const discoverItems = useMemo(() => {
    return MOCK_MARKETPLACE_ITEMS.filter((item) => {
      if (selectedCategory !== 'All' && item.provider.category !== selectedCategory) {
        return false
      }
      return true
    })
  }, [selectedCategory])

  // Search Activity results (combining query, location, category, budget)
  const searchResults = useMemo(() => {
    return MOCK_MARKETPLACE_ITEMS.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim()
        const matchesName = item.provider.businessName.toLowerCase().includes(q)
        const matchesService = item.service.name.toLowerCase().includes(q)
        const matchesLocation = item.provider.location.toLowerCase().includes(q)
        const matchesCategory = item.provider.category.toLowerCase().includes(q)
        if (!matchesName && !matchesService && !matchesLocation && !matchesCategory) {
          return false
        }
      }

      // 2. Location filter
      if (searchFilters.location.trim() !== '' && searchFilters.location !== 'All') {
        const targetLoc = searchFilters.location.toLowerCase().trim()
        if (!item.provider.location.toLowerCase().includes(targetLoc)) {
          return false
        }
      }

      // 3. Category filter
      if (searchFilters.category.trim() !== '' && searchFilters.category !== 'All') {
        if (item.provider.category !== searchFilters.category) {
          return false
        }
      }

      // 4. Budget range filter
      if (searchFilters.minBudget > 0 || searchFilters.maxBudget < 200000) {
        const { min: itemMin, max: itemMax } = parsePriceRange(item.service.priceDisplay)
        if (itemMin > searchFilters.maxBudget || itemMax < searchFilters.minBudget) {
          return false
        }
      }

      return true
    })
  }, [searchQuery, searchFilters])

  // Filter dismissal handlers
  const handleRemoveLocation = () => {
    setSearchFilters((prev) => ({ ...prev, location: '' }))
  }

  const handleRemoveCategory = () => {
    setSearchFilters((prev) => ({ ...prev, category: '' }))
  }

  const handleRemoveBudget = () => {
    setSearchFilters((prev) => ({ ...prev, minBudget: 0, maxBudget: 200000 }))
  }

  const handleClearAllFilters = () => {
    setSearchFilters({ ...DEFAULT_SEARCH_FILTERS })
  }

  const handleExitSearch = () => {
    setIsSearchActive(false)
    setSearchQuery('')
    setSearchFilters({ ...DEFAULT_SEARCH_FILTERS })
  }

  // Auth triggers
  const handleOpenAuth = (mode: AuthMode = 'login') => {
    setBookingTargetItem(null)
    setAuthModal({ isOpen: true, mode })
  }

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user)
    setAuthModal({ isOpen: false, mode: 'login' })
    if (bookingTargetItem) {
      setCurrentView('request-service')
      showNotification(`Signed in! Complete your request with ${bookingTargetItem.provider.businessName}.`)
    } else {
      showNotification(`Welcome back, ${user.name}!`)
    }
  }

  const handleSignOut = () => {
    setCurrentUser(null)
    setBookingTargetItem(null)
    setSelectedDetailItem(null)
    setCurrentView('discover')
    setIsSearchActive(false)
    showNotification('You have been signed out.')
  }

  // Card & Service interaction
  const handleCardClick = (item: MarketplaceItem) => {
    if (!isSearchActive) {
      lastDiscoverScrollY.current = window.scrollY
    }
    setSelectedDetailItem(item)
    setBookingTargetItem(item)
    setCurrentView('video-viewer')
  }

  const handleBackFromVideoViewer = () => {
    setCurrentView('discover')
    setSelectedDetailItem(null)
    if (!isSearchActive) {
      requestAnimationFrame(() => {
        window.scrollTo(0, lastDiscoverScrollY.current)
      })
    }
  }

  const handleRequestServiceFromVideoViewer = (item: MarketplaceItem) => {
    setBookingTargetItem(item)
    if (!currentUser) {
      setAuthModal({ isOpen: true, mode: 'login' })
    } else {
      setCurrentView('request-service')
    }
  }

  const handleBackFromRequestService = () => {
    setCurrentView('video-viewer')
  }

  const handleBookingSubmit = (newBooking: BookingRequest) => {
    setBookings((prev) => [newBooking, ...prev])
    setBookingTargetItem(null)
    setSelectedDetailItem(null)
    setCurrentView('bookings')
    showNotification(
      `Service request sent to ${newBooking.provider.businessName}! Status: Pending.`
    )
  }

  // Drawer Navigation
  const handleNavigateHome = () => {
    setSelectedDetailItem(null)
    setBookingTargetItem(null)
    setCurrentView('discover')
    setIsSearchActive(false)
  }

  const handleNavigateSearch = () => {
    setSelectedDetailItem(null)
    setBookingTargetItem(null)
    setCurrentView('discover')
    setIsSearchActive(true)
    setTimeout(() => {
      const searchEl = document.getElementById('search-activity-input')
      if (searchEl) {
        searchEl.focus()
      }
    }, 100)
  }

  const handleNavigateBookings = () => {
    setSelectedDetailItem(null)
    setBookingTargetItem(null)
    if (!currentUser) {
      setAuthModal({ isOpen: true, mode: 'login' })
    } else {
      setCurrentView('bookings')
    }
  }

  return (
    <div className="discover-screen">
      <div className="screen-container">
        {notification && (
          <div className="global-toast" role="status" aria-live="polite">
            <span>{notification}</span>
            <button
              type="button"
              className="toast-dismiss-btn"
              onClick={() => setNotification(null)}
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {/* View Switcher */}
        {currentView === 'video-viewer' && selectedDetailItem ? (
          <VideoViewer
            item={selectedDetailItem}
            onBack={handleBackFromVideoViewer}
            onRequestService={handleRequestServiceFromVideoViewer}
          />
        ) : currentView === 'request-service' && bookingTargetItem ? (
          <RequestService
            key={bookingTargetItem.id}
            item={bookingTargetItem}
            user={currentUser}
            onBack={handleBackFromRequestService}
            onSubmitBooking={handleBookingSubmit}
          />
        ) : currentView === 'bookings' ? (
          <>
            <Header
              user={currentUser}
              onAuthClick={() => handleOpenAuth('login')}
              onMenuClick={() => setIsDrawerOpen(true)}
            />
            <main className="marketplace-content">
              <BookingsView
                bookings={bookings}
                onBackToDiscover={() => {
                  setCurrentView('discover')
                  setIsSearchActive(false)
                }}
              />
            </main>
          </>
        ) : (
          /* Discover or Search Activity View */
          isSearchActive ? (
            <div className="search-activity-view">
              <SearchHeader
                query={searchQuery}
                onQueryChange={setSearchQuery}
                onBack={handleExitSearch}
                filters={searchFilters}
                activeFilterCount={activeFilterCount}
                onOpenFilterSheet={() => setIsFilterSheetOpen(true)}
                onRemoveLocation={handleRemoveLocation}
                onRemoveCategory={handleRemoveCategory}
                onRemoveBudget={handleRemoveBudget}
                onClearAllFilters={handleClearAllFilters}
              />
              <main className="search-results-content">
                {searchResults.length > 0 ? (
                  <div className="search-results-list" role="feed" aria-label="Search results">
                    {searchResults.map((item) => (
                      <SearchResultCard
                        key={item.id}
                        item={item}
                        onClick={handleCardClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="search-empty-state">
                    <div className="search-empty-icon-wrap">
                      <SearchIcon className="search-empty-icon" />
                    </div>
                    <h3 className="search-empty-title">No services found</h3>
                    <p className="search-empty-desc">
                      We couldn&apos;t find any providers matching your search and filter criteria.
                    </p>
                    <button
                      type="button"
                      className="search-empty-reset-btn"
                      onClick={() => {
                        setSearchQuery('')
                        setSearchFilters({ ...DEFAULT_SEARCH_FILTERS })
                      }}
                    >
                      Reset search &amp; filters
                    </button>
                  </div>
                )}
              </main>
            </div>
          ) : (
            <>
              <div
                className={`marketplace-header-area ${
                  isHeaderVisible ? 'header-visible' : 'header-hidden'
                } ${isScrolled ? 'scrolled-header' : ''}`}
              >
                <Header
                  user={currentUser}
                  onAuthClick={() => handleOpenAuth('login')}
                  onMenuClick={() => setIsDrawerOpen(true)}
                />
                <SearchBar
                  value={searchQuery}
                  onChange={(val) => {
                    setSearchQuery(val)
                    if (val.trim().length > 0) {
                      setIsSearchActive(true)
                    }
                  }}
                  onFocus={() => setIsSearchActive(true)}
                  onClick={() => setIsSearchActive(true)}
                />
                <CategoryFilter
                  categories={CATEGORIES}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </div>
              <main className="marketplace-content">
                <ProviderCardList items={discoverItems} onItemClick={handleCardClick} />
              </main>
            </>
          )
        )}

        {/* Navigation Drawer */}
        <NavDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onNavigateHome={handleNavigateHome}
          onNavigateSearch={handleNavigateSearch}
          onNavigateBookings={handleNavigateBookings}
          onSignOut={handleSignOut}
        />

        {/* Filter Sheet Modal */}
        {isFilterSheetOpen && (
          <FilterSheet
            isOpen={isFilterSheetOpen}
            filters={searchFilters}
            categories={CATEGORIES}
            locations={LOCATIONS}
            onApply={(newFilters) => setSearchFilters(newFilters)}
            onClose={() => setIsFilterSheetOpen(false)}
          />
        )}

        {/* Authentication Modal */}
        <AuthModal
          isOpen={authModal.isOpen}
          mode={authModal.mode}
          onModeChange={(newMode) => setAuthModal((prev) => ({ ...prev, mode: newMode }))}
          onClose={() => {
            setAuthModal({ isOpen: false, mode: 'login' })
            if (!currentUser && currentView !== 'video-viewer' && currentView !== 'request-service') {
              setBookingTargetItem(null)
            }
          }}
          onAuthSuccess={handleAuthSuccess}
          onProviderSignupClick={() => {
            setAuthModal({ isOpen: false, mode: 'login' })
            showNotification('Provider onboarding will be available in subsequent Build Week tasks.')
          }}
        />
      </div>
    </div>
  )
}

