import { useState, useMemo, useEffect, useRef } from 'react'
import { Header } from '../components/marketplace/Header'
import { SearchBar } from '../components/marketplace/SearchBar'
import { ProviderCardList } from '../components/marketplace/ProviderCardList'
import { NavDrawer } from '../components/navigation/NavDrawer'
import { AuthModal, type AuthMode } from '../components/auth/AuthModal'
import { VideoViewer } from '../components/marketplace/VideoViewer'
import { ProviderProfile } from '../components/marketplace/ProviderProfile'
import { RequestService } from '../components/booking/RequestService'
import { BookingsView } from '../components/booking/BookingsView'
import { ChatView, type ChatMessage } from '../components/chat/ChatView'
import { ProviderSignupFlow } from '../components/auth/ProviderSignupFlow'
import { ProviderHub } from '../components/provider/ProviderHub'
import { ProviderRequests } from '../components/provider/ProviderRequests'
import { ProviderRequestDetails } from '../components/provider/ProviderRequestDetails'
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
  INITIAL_PROVIDER_REQUESTS,
} from '../lib/mockData'
import type { MarketplaceItem, User, BookingRequest, BookingStatus, SearchFilters, Provider } from '../types/marketplace'

export function DiscoverPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<'discover' | 'bookings' | 'video-viewer' | 'request-service' | 'provider-profile' | 'chat' | 'provider-signup' | 'provider-hub' | 'provider-requests' | 'provider-request-details'>('discover')
  const [selectedProfileItem, setSelectedProfileItem] = useState<MarketplaceItem | null>(null)
  const [profileReturnView, setProfileReturnView] = useState<'discover' | 'bookings' | 'video-viewer' | 'request-service' | 'chat' | 'provider-hub' | 'provider-requests' | 'provider-request-details'>('discover')
  const [searchQuery, setSearchQuery] = useState('')
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
  const [bookingsTab, setBookingsTab] = useState<'All' | 'Pending' | 'Accepted' | 'In Progress' | 'Declined' | 'Canceled' | 'Completed'>('All')
  const [activeChatBooking, setActiveChatBooking] = useState<BookingRequest | null>(null)
  const [providerRequests, setProviderRequests] = useState<BookingRequest[]>(INITIAL_PROVIDER_REQUESTS)
  const [activeProviderRequest, setActiveProviderRequest] = useState<BookingRequest | null>(null)
  const [chatMessagesMap, setChatMessagesMap] = useState<Record<string, ChatMessage[]>>({})
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

  // Provider Hub booking statistics derived from real provider requests
  const providerBookingStats = useMemo(() => {
    const pending = providerRequests.filter((b) => b.status === 'pending').length
    const inProgress = providerRequests.filter((b) => b.status === 'in_progress').length
    const completed = providerRequests.filter((b) => b.status === 'completed').length
    const declined = providerRequests.filter((b) => b.status === 'declined').length
    return { pending, inProgress, completed, declined }
  }, [providerRequests])

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

  const handleOpenProviderProfile = (
    item: MarketplaceItem,
    fromView: 'discover' | 'bookings' | 'video-viewer' | 'request-service' | 'chat'
  ) => {
    if (fromView === 'discover' && !isSearchActive) {
      lastDiscoverScrollY.current = window.scrollY
    }
    setProfileReturnView(fromView)
    setSelectedProfileItem(item)
    setCurrentView('provider-profile')
  }

  const handleProviderClickFromBookings = (provider: Provider) => {
    const matchingItem =
      MOCK_MARKETPLACE_ITEMS.find((it) => it.provider.id === provider.id) ||
      MOCK_MARKETPLACE_ITEMS.find((it) => it.provider.businessName === provider.businessName) ||
      MOCK_MARKETPLACE_ITEMS[0]
    handleOpenProviderProfile(matchingItem, 'bookings')
  }

  const handleProviderClickFromChat = (provider: Provider) => {
    const matchingItem =
      MOCK_MARKETPLACE_ITEMS.find((it) => it.provider.id === provider.id) ||
      MOCK_MARKETPLACE_ITEMS.find((it) => it.provider.businessName === provider.businessName) ||
      MOCK_MARKETPLACE_ITEMS[0]
    handleOpenProviderProfile(matchingItem, 'chat')
  }

  const handleBackFromProviderProfile = () => {
    const returnView = profileReturnView
    setCurrentView(returnView)
    setSelectedProfileItem(null)
    if (returnView === 'discover' && !isSearchActive) {
      requestAnimationFrame(() => {
        window.scrollTo(0, lastDiscoverScrollY.current)
      })
    }
    if (window.location.hash === '#profile') {
      history.pushState(null, '', window.location.pathname + window.location.search)
    }
  }

  const handleRequestServiceFromProviderProfile = (item: MarketplaceItem) => {
    setBookingTargetItem(item)
    if (!currentUser) {
      setAuthModal({ isOpen: true, mode: 'login' })
    } else {
      setCurrentView('request-service')
    }
  }

  // URL hash support for testing / direct viewing of Provider Profile, Bookings, and Chat states
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#profile') {
        setSelectedProfileItem(MOCK_MARKETPLACE_ITEMS[0])
        setProfileReturnView('discover')
        setCurrentView('provider-profile')
      } else if (window.location.hash === '#bookings') {
        setCurrentView('bookings')
      } else if (window.location.hash === '#chat-pending') {
        setActiveChatBooking(createDemoBooking('pending'))
        setCurrentView('chat')
      } else if (window.location.hash === '#chat-inprogress') {
        setActiveChatBooking(createDemoBooking('in_progress'))
        setCurrentView('chat')
      } else if (window.location.hash === '#chat-declined') {
        setActiveChatBooking(createDemoBooking('declined'))
        setCurrentView('chat')
      } else if (window.location.hash === '#chat-completed') {
        setActiveChatBooking(createDemoBooking('completed'))
        setCurrentView('chat')
      } else if (window.location.hash === '#provider-hub' || window.location.hash === '#provider-hub-new' || window.location.hash === '#provider-hub-active') {
        setCurrentView('provider-hub')
      } else if (window.location.hash === '#client-requests') {
        setCurrentView('provider-requests')
      } else if (window.location.hash === '#request-details-pending') {
        setActiveProviderRequest(INITIAL_PROVIDER_REQUESTS[0])
        setCurrentView('provider-request-details')
      } else if (window.location.hash === '#request-details-inprogress') {
        setActiveProviderRequest(INITIAL_PROVIDER_REQUESTS[2])
        setCurrentView('provider-request-details')
      } else if (window.location.hash === '#request-details-completed') {
        setActiveProviderRequest(INITIAL_PROVIDER_REQUESTS[3])
        setCurrentView('provider-request-details')
      } else if (window.location.hash === '#request-details-declined') {
        setActiveProviderRequest(INITIAL_PROVIDER_REQUESTS[9])
        setCurrentView('provider-request-details')
      }
    }
    checkHash()
    window.addEventListener('hashchange', checkHash)
    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  const handleBookingSubmit = (newBooking: BookingRequest) => {
    setBookings((prev) => [newBooking, ...prev])
    if (newBooking.provider.id === 'prov-1' || newBooking.provider.businessName === 'Ade Beauty Studio') {
      setProviderRequests((prev) => [newBooking, ...prev])
    }
    setBookingTargetItem(null)
    setSelectedDetailItem(null)
    setCurrentView('bookings')
    showNotification(
      `Service request sent to ${newBooking.provider.businessName}! Status: Pending.`
    )
  }

  const handleOpenChat = (booking: BookingRequest) => {
    setActiveChatBooking(booking)
    setCurrentView('chat')
  }

  const handleBackFromChat = () => {
    setCurrentView('bookings')
    if (window.location.hash.startsWith('#chat')) {
      history.pushState(null, '', window.location.pathname + window.location.search)
    }
  }

  const handleSendMessageInChat = (
    bookingId: string,
    text: string,
    sender: 'customer' | 'provider' = 'customer'
  ) => {
    const now = new Date()
    const timeStr = now
      .toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .replace(' ', '')

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender,
      text,
      timestamp: timeStr,
      dateLabel: 'Today',
    }

    setChatMessagesMap((prev) => {
      const existing = prev[bookingId]
      if (existing) {
        return { ...prev, [bookingId]: [...existing, newMsg] }
      }
      return { ...prev, [bookingId]: [newMsg] }
    })
  }

  const handleReviewBooking = (booking: BookingRequest) => {
    showNotification(
      `Review for ${booking.provider.businessName} will be available soon.`
    )
  }

  const handleDeleteBooking = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId))
    showNotification('Booking removed.')
  }

  const handleEditBooking = (booking: BookingRequest) => {
    showNotification(`Editing request for ${booking.service.name}.`)
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
    setCurrentView('bookings')
  }

  const handleNavigateProviderHub = () => {
    setSelectedDetailItem(null)
    setBookingTargetItem(null)
    setCurrentView('provider-hub')
  }

  // Provider Request Action Handlers
  const handleAcceptProviderRequest = (request: BookingRequest) => {
    setProviderRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: 'in_progress' } : r))
    )
    setBookings((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: 'in_progress' } : r))
    )
    setActiveProviderRequest((prev) =>
      prev && prev.id === request.id ? { ...prev, status: 'in_progress' } : prev
    )
    showNotification(`Accepted request from ${request.customerName}. Status: In Progress.`)
  }

  const handleDeclineProviderRequest = (request: BookingRequest) => {
    setProviderRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: 'declined' } : r))
    )
    setBookings((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: 'declined' } : r))
    )
    setActiveProviderRequest((prev) =>
      prev && prev.id === request.id ? { ...prev, status: 'declined' } : prev
    )
    showNotification(`Declined request from ${request.customerName}.`)
  }

  const handleMarkCompleteProviderRequest = (request: BookingRequest) => {
    setProviderRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: 'completed' } : r))
    )
    setBookings((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: 'completed' } : r))
    )
    setActiveProviderRequest((prev) =>
      prev && prev.id === request.id ? { ...prev, status: 'completed' } : prev
    )
    showNotification(`Marked request from ${request.customerName} as complete!`)
  }

  const handleDeleteProviderRequest = (requestId: string) => {
    setProviderRequests((prev) => prev.filter((r) => r.id !== requestId))
    showNotification('Request removed.')
  }

  const handleOpenProviderRequestDetails = (request: BookingRequest) => {
    setActiveProviderRequest(request)
    setCurrentView('provider-request-details')
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
        {currentView === 'provider-profile' && selectedProfileItem ? (
          <ProviderProfile
            item={selectedProfileItem}
            onBack={handleBackFromProviderProfile}
            onRequestService={handleRequestServiceFromProviderProfile}
          />
        ) : currentView === 'video-viewer' && selectedDetailItem ? (
          <VideoViewer
            item={selectedDetailItem}
            onBack={handleBackFromVideoViewer}
            onRequestService={handleRequestServiceFromVideoViewer}
            onProviderClick={(item) => handleOpenProviderProfile(item, 'video-viewer')}
          />
        ) : currentView === 'request-service' && bookingTargetItem ? (
          <RequestService
            key={bookingTargetItem.id}
            item={bookingTargetItem}
            user={currentUser}
            onBack={handleBackFromRequestService}
            onSubmitBooking={handleBookingSubmit}
            onProviderClick={() => handleOpenProviderProfile(bookingTargetItem, 'request-service')}
          />
        ) : currentView === 'provider-signup' ? (
          <ProviderSignupFlow
            isOpen={true}
            onClose={() => setCurrentView('discover')}
            onSuccess={(newProviderUser) => {
              setCurrentUser(newProviderUser)
              setCurrentView('provider-hub')
              showNotification(
                'Provider account created! Verification documents submitted for review.'
              )
            }}
            onSwitchToSignIn={() => {
              setCurrentView('discover')
              setAuthModal({ isOpen: true, mode: 'login' })
            }}
          />
        ) : currentView === 'chat' && activeChatBooking ? (
          <ChatView
            booking={activeChatBooking}
            onBack={handleBackFromChat}
            onProviderClick={handleProviderClickFromChat}
            messages={chatMessagesMap[activeChatBooking.id]}
            onSendMessage={(text) => handleSendMessageInChat(activeChatBooking.id, text)}
          />
        ) : currentView === 'provider-hub' ? (
          <ProviderHub
            user={currentUser}
            isVerified={
              window.location.hash === '#provider-hub-active'
                ? true
                : window.location.hash === '#provider-hub-new'
                ? false
                : (currentUser?.role === 'provider' && bookings.length > 0)
            }
            isNewProvider={
              window.location.hash === '#provider-hub-new'
                ? true
                : window.location.hash === '#provider-hub-active'
                ? false
                : (currentUser?.role === 'provider' && bookings.length === 0)
            }
            bookingStats={providerBookingStats}
            onMenuClick={() => setIsDrawerOpen(true)}
            onUploadVideo={() =>
              showNotification('Video upload flow will be available in the next update.')
            }
            onViewRequests={() => {
              setCurrentView('provider-requests')
            }}
            onManageVideos={() =>
              showNotification('Video management will be available in the next update.')
            }
            onCustomerReviews={() =>
              showNotification('Customer reviews will be available in the next update.')
            }
            onViewProfile={() => {
              setSelectedProfileItem(MOCK_MARKETPLACE_ITEMS[0])
              setProfileReturnView('provider-hub')
              setCurrentView('provider-profile')
            }}
          />
        ) : currentView === 'provider-requests' ? (
          <ProviderRequests
            requests={providerRequests}
            onBack={() => setCurrentView('provider-hub')}
            onMenuClick={() => setIsDrawerOpen(true)}
            onOpenDetails={handleOpenProviderRequestDetails}
            onAcceptRequest={handleAcceptProviderRequest}
            onDeclineRequest={handleDeclineProviderRequest}
            onMarkCompleteRequest={handleMarkCompleteProviderRequest}
            onDeleteRequest={handleDeleteProviderRequest}
            onViewRating={(req) => showNotification(`Rating for ${req.service.name}: 5.0 ★`)}
          />
        ) : currentView === 'provider-request-details' && activeProviderRequest ? (
          <ProviderRequestDetails
            request={activeProviderRequest}
            onBack={() => setCurrentView('provider-requests')}
            onAccept={handleAcceptProviderRequest}
            onDecline={handleDeclineProviderRequest}
            onMarkComplete={handleMarkCompleteProviderRequest}
            messages={chatMessagesMap[activeProviderRequest.id]}
            onSendMessage={(text) => handleSendMessageInChat(activeProviderRequest.id, text, 'provider')}
          />
        ) : currentView === 'bookings' ? (
          <BookingsView
            bookings={bookings}
            activeTab={bookingsTab}
            onTabChange={setBookingsTab}
            onBackToDiscover={() => {
              setCurrentView('discover')
              setIsSearchActive(false)
              if (window.location.hash === '#bookings') {
                history.pushState(null, '', window.location.pathname + window.location.search)
              }
            }}
            onProviderClick={handleProviderClickFromBookings}
            onMenuClick={() => setIsDrawerOpen(true)}
            onOpenChat={handleOpenChat}
            onReviewBooking={handleReviewBooking}
            onDeleteBooking={handleDeleteBooking}
            onEditBooking={handleEditBooking}
          />
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
                        onProviderClick={(targetItem) =>
                          handleOpenProviderProfile(targetItem, 'discover')
                        }
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
              </div>
              <main className="marketplace-content">
                <ProviderCardList
                  items={MOCK_MARKETPLACE_ITEMS}
                  onItemClick={handleCardClick}
                  onProviderClick={(targetItem) =>
                    handleOpenProviderProfile(targetItem, 'discover')
                  }
                />
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
          onNavigateProviderHub={handleNavigateProviderHub}
          onSignOut={handleSignOut}
          isProvider={
            currentUser?.role === 'provider' ||
            window.location.hash.startsWith('#provider-') ||
            window.location.hash === '#client-requests' ||
            window.location.hash.startsWith('#request-details-')
          }
          currentView={currentView}
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
            setCurrentView('provider-signup')
          }}
        />
      </div>
    </div>
  )
}

function createDemoBooking(status: BookingStatus): BookingRequest {
  return {
    id: `demo-${status}`,
    customerId: 'cust-1',
    customerName: 'Customer',
    provider: MOCK_MARKETPLACE_ITEMS[0].provider, // Ade Beauty Studio
    service: {
      id: 'srv-1',
      providerId: 'prov-1',
      name: 'Custom Bridal Makeup',
      priceDisplay: '₦80,000',
    },
    location: 'Ikeja, Lagos',
    description: 'Bridal makeup for my wedding ceremony and reception, with long-wear finish.',
    preferredDate: 'Dec 14',
    preferredTime: '12:00 PM',
    status,
    createdAt: '2026-12-08T10:00:00Z',
  }
}


