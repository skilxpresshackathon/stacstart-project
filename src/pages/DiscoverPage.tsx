import { useState, useMemo } from 'react'
import { Header } from '../components/marketplace/Header'
import { SearchBar } from '../components/marketplace/SearchBar'
import { CategoryFilter } from '../components/marketplace/CategoryFilter'
import { ProviderCardList } from '../components/marketplace/ProviderCardList'
import { NavDrawer } from '../components/navigation/NavDrawer'
import { AuthModal, type AuthMode } from '../components/auth/AuthModal'
import { ProviderDetailModal } from '../components/marketplace/ProviderDetailModal'
import { BookingModal } from '../components/booking/BookingModal'
import { BookingsView } from '../components/booking/BookingsView'
import { CATEGORIES, MOCK_MARKETPLACE_ITEMS } from '../lib/mockData'
import type { MarketplaceItem, User, BookingRequest } from '../types/marketplace'

export function DiscoverPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<'discover' | 'bookings'>('discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: AuthMode }>({
    isOpen: false,
    mode: 'login',
  })
  const [selectedDetailItem, setSelectedDetailItem] = useState<MarketplaceItem | null>(null)
  const [bookingTargetItem, setBookingTargetItem] = useState<MarketplaceItem | null>(null)
  const [bookings, setBookings] = useState<BookingRequest[]>([])
  const [notification, setNotification] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr))
    }, 4500)
  }

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

  // Auth triggers
  const handleOpenAuth = (mode: AuthMode = 'login') => {
    setBookingTargetItem(null)
    setAuthModal({ isOpen: true, mode })
  }

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user)
    setAuthModal({ isOpen: false, mode: 'login' })
    if (bookingTargetItem) {
      showNotification(`Signed in! Confirm your booking with ${bookingTargetItem.provider.businessName}.`)
    } else {
      showNotification(`Welcome back, ${user.name}!`)
    }
  }

  const handleSignOut = () => {
    setCurrentUser(null)
    setBookingTargetItem(null)
    setSelectedDetailItem(null)
    setCurrentView('discover')
    showNotification('You have been signed out.')
  }

  // Card & Service interaction
  const handleCardClick = (item: MarketplaceItem) => {
    setSelectedDetailItem(item)
  }

  const handleRequestServiceFromDetail = (item: MarketplaceItem) => {
    setSelectedDetailItem(null)
    setBookingTargetItem(item)
    if (!currentUser) {
      setAuthModal({ isOpen: true, mode: 'login' })
    }
  }

  const handleBookingSubmit = (newBooking: BookingRequest) => {
    setBookings((prev) => [newBooking, ...prev])
    setBookingTargetItem(null)
    setCurrentView('bookings')
    showNotification(
      `Service request sent to ${newBooking.provider.businessName}! Status: Pending.`
    )
  }

  // Drawer Navigation
  const handleNavigateHome = () => {
    setCurrentView('discover')
  }

  const handleNavigateSearch = () => {
    setCurrentView('discover')
    setTimeout(() => {
      const searchEl = document.getElementById('marketplace-search-input')
      if (searchEl) {
        searchEl.focus()
        searchEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  const handleNavigateBookings = () => {
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

        <Header
          user={currentUser}
          onAuthClick={() => handleOpenAuth('login')}
          onMenuClick={() => setIsDrawerOpen(true)}
        />

        {currentView === 'discover' ? (
          <>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <CategoryFilter
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
            <main className="marketplace-content">
              <ProviderCardList items={filteredItems} onItemClick={handleCardClick} />
            </main>
          </>
        ) : (
          <main className="marketplace-content">
            <BookingsView
              bookings={bookings}
              onBackToDiscover={() => setCurrentView('discover')}
            />
          </main>
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

        {/* Authentication Modal */}
        <AuthModal
          isOpen={authModal.isOpen}
          mode={authModal.mode}
          onModeChange={(newMode) => setAuthModal((prev) => ({ ...prev, mode: newMode }))}
          onClose={() => {
            setAuthModal({ isOpen: false, mode: 'login' })
            if (!currentUser) {
              setBookingTargetItem(null)
            }
          }}
          onAuthSuccess={handleAuthSuccess}
          onProviderSignupClick={() => {
            setAuthModal({ isOpen: false, mode: 'login' })
            showNotification('Provider onboarding will be available in subsequent Build Week tasks.')
          }}
        />

        {/* Provider / Service Detail Modal */}
        <ProviderDetailModal
          item={selectedDetailItem}
          isOpen={!!selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
          onRequestService={handleRequestServiceFromDetail}
        />

        {/* Request Service / Booking Modal */}
        {bookingTargetItem && (
          <BookingModal
            key={bookingTargetItem.id}
            item={bookingTargetItem}
            user={currentUser}
            isOpen={!!bookingTargetItem && !!currentUser}
            onClose={() => setBookingTargetItem(null)}
            onSubmitBooking={handleBookingSubmit}
          />
        )}
      </div>
    </div>
  )
}
