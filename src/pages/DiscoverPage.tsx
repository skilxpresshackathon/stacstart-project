import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
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
import { ProviderVideos } from '../components/provider/ProviderVideos'
import { ProviderUploadVideo } from '../components/provider/ProviderUploadVideo'
import { ReviewVideo } from '../components/admin/ReviewVideo'
import { RejectVideo } from '../components/admin/RejectVideo'
import { VideoModeration } from '../components/admin/VideoModeration'
import { AdminDashboard } from '../components/admin/AdminDashboard'
import { IdVerification } from '../components/admin/IdVerification'
import { ProviderReviews } from '../components/provider/ProviderReviews'
import { fetchRealAdminMetrics, type RealAdminMetrics } from '../lib/data/admin'
import { SearchHeader } from '../components/search/SearchHeader'
import { SearchResultCard } from '../components/search/SearchResultCard'
import { FilterSheet } from '../components/search/FilterSheet'
import { SearchIcon } from '../components/common/Icons'
import { supabase } from '../lib/supabase'
import {
  fetchDiscoverMarketplaceItems,
  fetchProviderVideos,
  fetchAdminModerationVideos,
  moderateApproveVideo,
  moderateRejectVideo,
} from '../lib/data/videos'
import { fetchProviderDetails } from '../lib/data/providers'
import {
  createReview,
  fetchCustomerReviewedBookingIds,
  fetchReviewForBooking,
} from '../lib/data/reviews'
import {
  fetchBookingMessages,
  sendMessage,
  subscribeToBookingMessages,
} from '../lib/data/messages'
import { ReviewBookingModal } from '../components/booking/ReviewBookingModal'
import type { Review } from '../types/marketplace'
import {
  CATEGORIES,
  LOCATIONS,
  DEFAULT_SEARCH_FILTERS,
  parsePriceRange,
  DEFAULT_REVIEW_VIDEO_ITEM,
  type ReviewVideoItem,
  type RejectionReason,
  type ModerationVideoItem,
  type ProviderVideoItem,
} from '../lib/mockData'
import {
  fetchCustomerBookings,
  fetchProviderBookings,
  updateBookingStatus,
  cancelBooking,
} from '../lib/data/bookings'
import type { MarketplaceItem, User, BookingRequest, BookingStatus, SearchFilters, Provider } from '../types/marketplace'

import { type ViewType, getHashForView, getViewFromHash } from '../lib/routes'

export function DiscoverPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return getViewFromHash(window.location.hash)
    }
    return 'discover'
  })
  const [selectedProfileItem, setSelectedProfileItem] = useState<MarketplaceItem | null>(null)
  const [profileReturnView, setProfileReturnView] = useState<ViewType>('discover')
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
  const [bookingReturnView, setBookingReturnView] = useState<ViewType>('video-viewer')
  const [uploadVideoReturnView, setUploadVideoReturnView] = useState<ViewType>('provider-hub')
  const [reviewVideoTarget, setReviewVideoTarget] = useState<ReviewVideoItem>(DEFAULT_REVIEW_VIDEO_ITEM)
  const [reviewVideoReturnView, setReviewVideoReturnView] = useState<ViewType>('video-moderation')
  const [videoModerationReturnView, setVideoModerationReturnView] = useState<ViewType>('admin-dashboard')
  const [moderationVideos, setModerationVideos] = useState<ModerationVideoItem[]>([])
  const [adminMetrics, setAdminMetrics] = useState<RealAdminMetrics>({
    totalUsers: 0,
    verifiedUsers: 0,
    pendingVideosCount: 0,
    pendingVerificationsCount: 0,
  })
  const [bookings, setBookings] = useState<BookingRequest[]>([])
  const [bookingsTab, setBookingsTab] = useState<'All' | 'Pending' | 'Accepted' | 'In Progress' | 'Declined' | 'Canceled' | 'Completed'>('All')
  const [activeChatBooking, setActiveChatBooking] = useState<BookingRequest | null>(null)
  const [providerRequests, setProviderRequests] = useState<BookingRequest[]>([])
  const providerRequestsRef = useRef<BookingRequest[]>([])
  useEffect(() => {
    providerRequestsRef.current = providerRequests
  }, [providerRequests])
  const [isBookingsLoading, setIsBookingsLoading] = useState(false)
  const [isProviderRequestsLoading, setIsProviderRequestsLoading] = useState(false)
  const [activeProviderRequest, setActiveProviderRequest] = useState<BookingRequest | null>(null)
  const [chatMessagesMap, setChatMessagesMap] = useState<Record<string, ChatMessage[]>>({})
  const [notification, setNotification] = useState<string | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // Real Supabase Marketplace data state
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([])
  const [isMarketplaceLoading, setIsMarketplaceLoading] = useState(true)
  const [providerVideosList, setProviderVideosList] = useState<ProviderVideoItem[]>([])

  // Review System State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewTargetBooking, setReviewTargetBooking] = useState<BookingRequest | null>(null)
  const [reviewTargetExisting, setReviewTargetExisting] = useState<Review | null>(null)
  const [reviewedBookingIds, setReviewedBookingIds] = useState<Set<string>>(new Set())

  // Active Chat / Messaging Subscriptions
  useEffect(() => {
    const booking = activeChatBooking || activeProviderRequest
    if (!booking) return

    let isMounted = true

    // 1. Fetch initial real messages from Supabase
    fetchBookingMessages(booking.id, booking.customerId).then((res) => {
      if (isMounted && res.success) {
        setChatMessagesMap((prev) => ({
          ...prev,
          [booking.id]: res.messages,
        }))
      }
    })

    // 2. Realtime subscription (clean up on exit or booking change)
    const unsubscribe = subscribeToBookingMessages(booking.id, booking.customerId, (newMsg) => {
      if (!isMounted) return
      setChatMessagesMap((prev) => {
        const existing = prev[booking.id] || []
        if (existing.some((m) => m.id === newMsg.id)) return prev
        return {
          ...prev,
          [booking.id]: [...existing, newMsg],
        }
      })
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [activeChatBooking, activeProviderRequest])

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

  // Real Marketplace Data Loading
  useEffect(() => {
    let isMounted = true
    fetchDiscoverMarketplaceItems()
      .then((items) => {
        if (isMounted) {
          setMarketplaceItems(items)
          setIsMarketplaceLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('[DiscoverPage] Failed to fetch marketplace items:', err)
          showNotification('Unable to load marketplace data. Please try again.')
          setIsMarketplaceLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Provider Videos Data Loading
  useEffect(() => {
    if (currentView === 'provider-videos' && currentUser) {
      fetchProviderVideos(currentUser.id)
        .then((vids) => setProviderVideosList(vids))
        .catch((err) => console.warn('[DiscoverPage] Error loading provider videos:', err))
    }
  }, [currentView, currentUser])

  // Admin Moderation Data Loading
  useEffect(() => {
    if (
      (currentView === 'video-moderation' || currentView === 'admin-dashboard') &&
      currentUser?.role === 'admin'
    ) {
      fetchAdminModerationVideos()
        .then((vids) => setModerationVideos(vids))
        .catch((err) => console.warn('[DiscoverPage] Error loading moderation videos:', err))
    }
  }, [currentView, currentUser])

  // Customer Bookings Data Loading
  useEffect(() => {
    if (currentView === 'bookings' && currentUser) {
      let isMounted = true
      fetchCustomerBookings()
        .then((data) => {
          if (isMounted) {
            setBookings(data)
            setIsBookingsLoading(false)
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.warn('[DiscoverPage] Error loading customer bookings:', err)
            setIsBookingsLoading(false)
          }
        })

      fetchCustomerReviewedBookingIds(currentUser.id)
        .then((ids) => {
          if (isMounted) {
            setReviewedBookingIds(ids)
          }
        })
        .catch(console.warn)

      return () => {
        isMounted = false
      }
    }
  }, [currentView, currentUser])

  // Provider Requests Data Loading
  useEffect(() => {
    if (
      (currentView === 'provider-hub' ||
        currentView === 'provider-requests' ||
        currentView === 'provider-request-details') &&
      currentUser &&
      (currentUser.role === 'provider' || currentUser.role === 'admin')
    ) {
      let isMounted = true
      fetchProviderBookings()
        .then((data) => {
          if (isMounted) {
            setProviderRequests(data)
            setIsProviderRequestsLoading(false)
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.warn('[DiscoverPage] Error loading provider requests:', err)
            setIsProviderRequestsLoading(false)
          }
        })
      return () => {
        isMounted = false
      }
    }
  }, [currentView, currentUser])

  // Search Activity results (combining query, location, category, budget with real marketplace items)
  const searchResults = useMemo(() => {
    return marketplaceItems.filter((item) => {
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

      // 4. Budget range filter (numeric comparisons)
      if (searchFilters.minBudget > 0 || searchFilters.maxBudget < 200000) {
        const itemMin =
          item.service.minPrice ?? parsePriceRange(item.service.priceDisplay).min
        const itemMax =
          item.service.maxPrice ?? parsePriceRange(item.service.priceDisplay).max
        if (itemMin > searchFilters.maxBudget || itemMax < searchFilters.minBudget) {
          return false
        }
      }

      return true
    })
  }, [marketplaceItems, searchQuery, searchFilters])

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

  // Supabase Session Persistence and Auth State Listener
  useEffect(() => {
    // 1. Restore existing session on mount
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, email, role')
            .eq('id', session.user.id)
            .maybeSingle()

          const appUser: User = {
            id: session.user.id,
            name:
              profile?.full_name ||
              session.user.user_metadata?.full_name ||
              session.user.email?.split('@')[0] ||
              'User',
            email: session.user.email || '',
            role: (profile?.role as 'customer' | 'provider' | 'admin') || 'customer',
          }
          setCurrentUser(appUser)
        }
        setIsAuthLoading(false)
      })
      .catch(() => {
        setIsAuthLoading(false)
      })

    // 2. Listen to auth changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .eq('id', session.user.id)
          .maybeSingle()

        const appUser: User = {
          id: session.user.id,
          name:
            profile?.full_name ||
            session.user.user_metadata?.full_name ||
            session.user.email?.split('@')[0] ||
            'User',
          email: session.user.email || '',
          role: (profile?.role as 'customer' | 'provider' | 'admin') || 'customer',
        }
        setCurrentUser(appUser)
      } else {
        setCurrentUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Unified Navigation & Native History Management
  const navigateTo = (view: ViewType, options?: { replace?: boolean }) => {
    setCurrentView(view)
    const newHash = getHashForView(view)
    if (newHash) {
      if (options?.replace) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search + newHash)
      } else {
        window.history.pushState(null, '', window.location.pathname + window.location.search + newHash)
      }
    } else {
      if (options?.replace) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      } else {
        window.history.pushState(null, '', window.location.pathname + window.location.search)
      }
    }
  }

  const navigateBack = (fallbackView: ViewType = 'discover') => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      navigateTo(fallbackView)
    }
  }

  const refreshAdminMetrics = useCallback(() => {
    if (currentUser?.role === 'admin') {
      fetchRealAdminMetrics().then(setAdminMetrics).catch(console.warn)
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      refreshAdminMetrics()
    }
  }, [currentView, currentUser, refreshAdminMetrics])

  // Auth triggers
  const handleOpenAuth = (mode: AuthMode = 'login') => {
    setBookingTargetItem(null)
    setAuthModal({ isOpen: true, mode })
  }

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user)
    setAuthModal({ isOpen: false, mode: 'login' })
    if (bookingTargetItem) {
      navigateTo('request-service')
      showNotification(`Signed in! Complete your request with ${bookingTargetItem.provider.businessName}.`)
    } else if (user.role === 'admin') {
      refreshAdminMetrics()
      navigateTo('admin-dashboard')
      showNotification(`Signed in as Administrator. Welcome, ${user.name}!`)
    } else if (user.role === 'provider') {
      navigateTo('provider-hub')
      showNotification(`Signed in as Provider. Welcome back, ${user.name}!`)
    } else {
      showNotification(`Welcome back, ${user.name}!`)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
    setBookingTargetItem(null)
    setSelectedDetailItem(null)
    setSelectedProfileItem(null)
    setActiveChatBooking(null)
    setActiveProviderRequest(null)
    setIsDrawerOpen(false)
    setIsSearchActive(false)
    navigateTo('discover', { replace: true })
    showNotification('You have been signed out.')
  }

  // Card & Service interaction
  const handleCardClick = (item: MarketplaceItem) => {
    if (!isSearchActive) {
      lastDiscoverScrollY.current = window.scrollY
    }
    setSelectedDetailItem(item)
    setBookingTargetItem(item)
    navigateTo('video-viewer')
  }

  const handleBackFromVideoViewer = () => {
    setSelectedDetailItem(null)
    navigateBack('discover')
    if (!isSearchActive) {
      requestAnimationFrame(() => {
        window.scrollTo(0, lastDiscoverScrollY.current)
      })
    }
  }

  const handleRequestServiceFromVideoViewer = (item: MarketplaceItem) => {
    setBookingTargetItem(item)
    setSelectedDetailItem(item)
    setBookingReturnView('video-viewer')
    if (!currentUser) {
      setAuthModal({ isOpen: true, mode: 'login' })
    } else {
      navigateTo('request-service')
    }
  }

  const handleBackFromRequestService = () => {
    if (bookingReturnView === 'provider-profile') {
      if (!selectedProfileItem && bookingTargetItem) {
        setSelectedProfileItem(bookingTargetItem)
      }
      navigateBack('provider-profile')
    } else {
      navigateBack('video-viewer')
    }
  }

  const handleOpenProviderProfile = async (
    item: MarketplaceItem,
    fromView: ViewType
  ) => {
    if (fromView === 'discover' && !isSearchActive) {
      lastDiscoverScrollY.current = window.scrollY
    }
    setProfileReturnView(fromView)
    setSelectedProfileItem(item)
    navigateTo('provider-profile')

    // Fetch full provider details (services, videos, reviews) from Supabase
    if (item.provider?.id) {
      const fullProvider = await fetchProviderDetails(item.provider.id)
      if (fullProvider) {
        setSelectedProfileItem((prev) => (prev ? { ...prev, provider: fullProvider } : prev))
      }
    }
  }

  const handleProviderClickFromBookings = (provider: Provider) => {
    const matchingItem =
      marketplaceItems.find((it) => it.provider.id === provider.id) ||
      marketplaceItems.find((it) => it.provider.businessName === provider.businessName)
    if (matchingItem) {
      handleOpenProviderProfile(matchingItem, 'bookings')
    } else {
      const fallbackItem: MarketplaceItem = {
        id: `prov-item-${provider.id}`,
        provider,
        service: provider.services?.[0] || {
          id: 'srv-0',
          providerId: provider.id,
          name: provider.businessName,
          priceDisplay: 'Contact for pricing',
        },
        video: provider.featuredVideos?.[0] || {
          id: 'vid-0',
          providerId: provider.id,
          duration: '0:30',
        },
        rating: 0,
      }
      handleOpenProviderProfile(fallbackItem, 'bookings')
    }
  }

  const handleProviderClickFromChat = (provider: Provider) => {
    const matchingItem =
      marketplaceItems.find((it) => it.provider.id === provider.id) ||
      marketplaceItems.find((it) => it.provider.businessName === provider.businessName)
    if (matchingItem) {
      handleOpenProviderProfile(matchingItem, 'chat')
    } else {
      const fallbackItem: MarketplaceItem = {
        id: `prov-item-${provider.id}`,
        provider,
        service: provider.services?.[0] || {
          id: 'srv-0',
          providerId: provider.id,
          name: provider.businessName,
          priceDisplay: 'Contact for pricing',
        },
        video: provider.featuredVideos?.[0] || {
          id: 'vid-0',
          providerId: provider.id,
          duration: '0:30',
        },
        rating: 0,
      }
      handleOpenProviderProfile(fallbackItem, 'chat')
    }
  }

  const handleBackFromProviderProfile = () => {
    setSelectedProfileItem(null)
    navigateBack(profileReturnView)
    if (profileReturnView === 'discover' && !isSearchActive) {
      requestAnimationFrame(() => {
        window.scrollTo(0, lastDiscoverScrollY.current)
      })
    }
  }

  const handleRequestServiceFromProviderProfile = (item: MarketplaceItem) => {
    setBookingTargetItem(item)
    setSelectedProfileItem(item)
    setBookingReturnView('provider-profile')
    if (!currentUser) {
      setAuthModal({ isOpen: true, mode: 'login' })
    } else {
      navigateTo('request-service')
    }
  }

  // URL hash support and role-based route guards
  useEffect(() => {
    if (isAuthLoading) return

    const checkHash = () => {
      const hash = window.location.hash

      // Admin routes guard
      if (
        hash === '#admin-dashboard' ||
        hash === '#admin' ||
        hash === '#video-moderation' ||
        hash === '#moderation' ||
        hash === '#review-video' ||
        hash === '#reject-video' ||
        hash === '#id-verification' ||
        hash === '#verification'
      ) {
        if (currentUser?.role !== 'admin') {
          showNotification('Access restricted to administrators.')
          setCurrentView('discover')
          if (hash) history.pushState(null, '', window.location.pathname + window.location.search)
          return
        }
        if (hash === '#admin-dashboard' || hash === '#admin') setCurrentView('admin-dashboard')
        else if (hash === '#video-moderation' || hash === '#moderation') setCurrentView('video-moderation')
        else if (hash === '#review-video') setCurrentView('review-video')
        else if (hash === '#reject-video') setCurrentView('reject-video')
        else if (hash === '#id-verification' || hash === '#verification') setCurrentView('id-verification')
        return
      }

      // Provider routes guard
      if (
        hash === '#provider-hub' ||
        hash === '#provider-hub-active' ||
        hash === '#provider-hub-new' ||
        hash === '#client-requests' ||
        hash === '#provider-requests' ||
        hash.startsWith('#request-details-') ||
        hash === '#request-details' ||
        hash === '#provider-videos' ||
        hash === '#provider-upload-video' ||
        hash === '#customer-reviews' ||
        hash === '#reviews'
      ) {
        if (currentUser?.role !== 'provider' && currentUser?.role !== 'admin') {
          showNotification('Please sign in as a service provider to access Provider Hub.')
          setCurrentView('discover')
          if (hash) history.pushState(null, '', window.location.pathname + window.location.search)
          if (!currentUser) setAuthModal({ isOpen: true, mode: 'login' })
          return
        }
        if (
          hash === '#provider-hub' ||
          hash === '#provider-hub-active' ||
          hash === '#provider-hub-new'
        ) {
          setCurrentView('provider-hub')
        } else if (hash === '#client-requests' || hash === '#provider-requests') {
          setCurrentView('provider-requests')
        } else if (hash === '#provider-videos') {
          setCurrentView('provider-videos')
        } else if (hash === '#provider-upload-video') {
          setCurrentView('provider-upload-video')
        } else if (hash === '#customer-reviews' || hash === '#reviews') {
          setCurrentView('customer-reviews')
        } else if (hash === '#request-details-pending') {
          const req = providerRequestsRef.current.find((r) => r.status === 'pending') || providerRequestsRef.current[0] || null
          if (req) setActiveProviderRequest(req)
          setCurrentView('provider-request-details')
        } else if (hash === '#request-details-inprogress') {
          const req = providerRequestsRef.current.find((r) => r.status === 'in_progress') || providerRequestsRef.current[0] || null
          if (req) setActiveProviderRequest(req)
          setCurrentView('provider-request-details')
        } else if (hash === '#request-details-completed') {
          const req = providerRequestsRef.current.find((r) => r.status === 'completed') || providerRequestsRef.current[0] || null
          if (req) setActiveProviderRequest(req)
          setCurrentView('provider-request-details')
        } else if (hash === '#request-details-declined') {
          const req = providerRequestsRef.current.find((r) => r.status === 'declined') || providerRequestsRef.current[0] || null
          if (req) setActiveProviderRequest(req)
          setCurrentView('provider-request-details')
        } else if (hash === '#request-details') {
          setCurrentView('provider-request-details')
        }
        return
      }

      // Customer routes
      if (hash === '#profile') {
        if (marketplaceItems.length > 0) {
          setSelectedProfileItem(marketplaceItems[0])
          setProfileReturnView('discover')
          setCurrentView('provider-profile')
        }
      } else if (hash === '#bookings') {
        if (!currentUser) {
          showNotification('Please sign in to view your bookings.')
          setAuthModal({ isOpen: true, mode: 'login' })
          setCurrentView('discover')
          history.pushState(null, '', window.location.pathname + window.location.search)
          return
        }
        setCurrentView('bookings')
      } else if (hash === '#chat-pending') {
        setActiveChatBooking(createDemoBooking('pending'))
        setCurrentView('chat')
      } else if (hash === '#chat-inprogress') {
        setActiveChatBooking(createDemoBooking('in_progress'))
        setCurrentView('chat')
      } else if (hash === '#chat-declined') {
        setActiveChatBooking(createDemoBooking('declined'))
        setCurrentView('chat')
      } else if (hash === '#chat-completed') {
        setActiveChatBooking(createDemoBooking('completed'))
        setCurrentView('chat')
      } else if (hash === '#provider-signup') {
        setCurrentView('provider-signup')
      } else if (!hash || hash === '#discover') {
        setCurrentView('discover')
      }
    }

    checkHash()
    window.addEventListener('hashchange', checkHash)
    window.addEventListener('popstate', checkHash)
    return () => {
      window.removeEventListener('hashchange', checkHash)
      window.removeEventListener('popstate', checkHash)
    }
  }, [currentUser, isAuthLoading, marketplaceItems])

  // Admin Review Video Action Handlers
  const handleBackFromReviewVideo = () => {
    navigateBack(reviewVideoReturnView)
  }

  const handleApproveVideo = async (item: ReviewVideoItem) => {
    const res = await moderateApproveVideo(item.id)
    if (!res.success) {
      showNotification(`Error approving video: ${res.error}`)
      return
    }
    setModerationVideos((prev) =>
      prev.map((v) =>
        v.id === item.id || v.title === item.serviceName ? { ...v, status: 'approved' } : v
      )
    )
    refreshAdminMetrics()
    fetchDiscoverMarketplaceItems().then(setMarketplaceItems).catch(console.warn)
    showNotification(`Video for "${item.serviceName}" has been approved!`)
    handleBackFromReviewVideo()
  }

  const handleRejectVideo = (item: ReviewVideoItem) => {
    setReviewVideoTarget(item)
    navigateTo('reject-video')
  }

  const handleBackFromRejectVideo = () => {
    navigateBack('review-video')
  }

  const handleCancelRejectVideo = () => {
    navigateBack('review-video')
  }

  const handleConfirmRejectVideo = async (item: ReviewVideoItem, reason: RejectionReason) => {
    const res = await moderateRejectVideo(item.id, reason)
    if (!res.success) {
      showNotification(`Error rejecting video: ${res.error}`)
      return
    }
    setModerationVideos((prev) =>
      prev.map((v) =>
        v.id === item.id || v.title === item.serviceName ? { ...v, status: 'rejected' } : v
      )
    )
    refreshAdminMetrics()
    showNotification(`Video for "${item.serviceName}" has been rejected (${reason}).`)
    navigateBack(reviewVideoReturnView)
  }

  const handleOpenReviewVideoFromModeration = (video: ModerationVideoItem) => {
    setReviewVideoTarget({
      id: video.id,
      providerName: video.providerName,
      serviceName: video.title,
      storagePath: video.storagePath,
    })
    setReviewVideoReturnView('video-moderation')
    navigateTo('review-video')
  }

  // Admin Dashboard Action Handlers
  const handleNavigateReviewVideosFromDashboard = () => {
    setVideoModerationReturnView('admin-dashboard')
    navigateTo('video-moderation')
  }

  const handleReviewIdFromDashboard = () => {
    navigateTo('id-verification')
  }

  const handleBookingSubmit = (newBooking: BookingRequest) => {
    setBookings((prev) => [newBooking, ...prev.filter((b) => b.id !== newBooking.id)])
    setBookingTargetItem(null)
    setSelectedDetailItem(null)
    navigateTo('bookings')
    showNotification(
      `Service request sent to ${newBooking.provider.businessName}! Status: Pending.`
    )
  }

  const handleOpenChat = (booking: BookingRequest) => {
    setActiveChatBooking(booking)
    navigateTo('chat')
  }

  const handleBackFromChat = () => {
    setActiveChatBooking(null)
    navigateBack('bookings')
  }

  const handleSendMessageInChat = async (
    bookingId: string,
    text: string
  ) => {
    const booking =
      bookings.find((b) => b.id === bookingId) ||
      providerRequests.find((r) => r.id === bookingId) ||
      activeChatBooking ||
      activeProviderRequest

    const customerId = booking?.customerId

    const res = await sendMessage(bookingId, text, customerId)
    if (!res.success) {
      showNotification(res.error || 'Failed to send message.')
      return
    }

    if (res.message) {
      const newMsg = res.message
      setChatMessagesMap((prev) => {
        const existing = prev[bookingId] || []
        if (existing.some((m) => m.id === newMsg.id)) return prev
        return { ...prev, [bookingId]: [...existing, newMsg] }
      })
    }
  }

  const handleReviewBooking = async (booking: BookingRequest) => {
    if (booking.status !== 'completed') {
      showNotification('Only completed bookings can be reviewed.')
      return
    }
    setReviewTargetBooking(booking)
    const existing = await fetchReviewForBooking(booking.id)
    setReviewTargetExisting(existing)
    setIsReviewModalOpen(true)
  }

  const handleSubmitReview = async (
    bookingId: string,
    rating: number,
    comment?: string
  ): Promise<boolean> => {
    if (!reviewTargetBooking) return false

    const res = await createReview({
      bookingId,
      providerId: reviewTargetBooking.provider.id,
      rating,
      comment,
    })

    if (!res.success) {
      showNotification(res.error || 'Failed to submit review.')
      return false
    }

    showNotification('Review submitted successfully! Thank you for your feedback.')
    setReviewedBookingIds((prev) => new Set([...prev, bookingId]))

    // Refresh marketplace to update ratings
    fetchDiscoverMarketplaceItems().then(setMarketplaceItems).catch(console.warn)

    // If selected profile is this provider, reload reviews
    if (selectedProfileItem?.provider.id === reviewTargetBooking.provider.id) {
      fetchProviderDetails(reviewTargetBooking.provider.id).then((fullProvider) => {
        if (fullProvider) {
          setSelectedProfileItem((prev) => (prev ? { ...prev, provider: fullProvider } : prev))
        }
      })
    }

    return true
  }

  const handleDeleteBooking = async (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId)
    if (booking && (booking.status === 'pending' || booking.status === 'accepted')) {
      const { success, error } = await cancelBooking(bookingId)
      if (!success) {
        showNotification(`Failed to cancel booking: ${error || 'Unknown error'}`)
        return
      }
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'canceled' } : b))
      )
      showNotification('Booking canceled.')
    } else {
      setBookings((prev) => prev.filter((b) => b.id !== bookingId))
      showNotification('Booking removed.')
    }
  }

  const handleEditBooking = (booking: BookingRequest) => {
    showNotification(`Editing request for ${booking.service.name}.`)
  }

  // Drawer Navigation
  const handleNavigateHome = () => {
    setSelectedDetailItem(null)
    setBookingTargetItem(null)
    setIsSearchActive(false)
    navigateTo('discover')
  }

  const handleNavigateSearch = () => {
    setSelectedDetailItem(null)
    setBookingTargetItem(null)
    setIsSearchActive(true)
    navigateTo('discover')
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
    navigateTo('bookings')
  }

  const handleNavigateProviderHub = () => {
    setSelectedDetailItem(null)
    setBookingTargetItem(null)
    navigateTo('provider-hub')
  }

  // Provider Request Action Handlers
  const handleAcceptProviderRequest = async (request: BookingRequest) => {
    const { success, error } = await updateBookingStatus(request.id, 'accepted')
    if (!success) {
      showNotification(`Failed to accept request: ${error || 'Unknown error'}`)
      return
    }
    setProviderRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: 'accepted' } : r))
    )
    setBookings((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: 'accepted' } : r))
    )
    setActiveProviderRequest((prev) =>
      prev && prev.id === request.id ? { ...prev, status: 'accepted' } : prev
    )
    showNotification(`Accepted request from ${request.customerName}.`)
  }

  const handleDeclineProviderRequest = async (request: BookingRequest) => {
    const { success, error } = await updateBookingStatus(request.id, 'declined')
    if (!success) {
      showNotification(`Failed to decline request: ${error || 'Unknown error'}`)
      return
    }
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

  const handleMarkInProgressProviderRequest = async (request: BookingRequest) => {
    const { success, error } = await updateBookingStatus(request.id, 'in_progress')
    if (!success) {
      showNotification(`Failed to update request: ${error || 'Unknown error'}`)
      return
    }
    setProviderRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: 'in_progress' } : r))
    )
    setBookings((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: 'in_progress' } : r))
    )
    setActiveProviderRequest((prev) =>
      prev && prev.id === request.id ? { ...prev, status: 'in_progress' } : prev
    )
    showNotification(`Marked request from ${request.customerName} as in progress!`)
  }

  const handleMarkCompleteProviderRequest = async (request: BookingRequest) => {
    if (request.status === 'accepted') {
      const inProgRes = await updateBookingStatus(request.id, 'in_progress')
      if (!inProgRes.success) {
        showNotification(`Failed to update request: ${inProgRes.error || 'Unknown error'}`)
        return
      }
    }
    const { success, error } = await updateBookingStatus(request.id, 'completed')
    if (!success) {
      showNotification(`Failed to complete request: ${error || 'Unknown error'}`)
      return
    }
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
            onUploadVideo={() => {
              setUploadVideoReturnView('provider-hub')
              navigateTo('provider-upload-video')
            }}
            onViewRequests={() => {
              navigateTo('provider-requests')
            }}
            onManageVideos={() => {
              navigateTo('provider-videos')
            }}
            onCustomerReviews={() => {
              navigateTo('customer-reviews')
            }}
            onViewProfile={async () => {
              if (currentUser) {
                const fullProvider = await fetchProviderDetails(currentUser.id)
                if (fullProvider) {
                  setSelectedProfileItem({
                    id: `prov-item-${fullProvider.id}`,
                    provider: fullProvider,
                    service: fullProvider.services?.[0] || {
                      id: 'srv-0',
                      providerId: fullProvider.id,
                      name: fullProvider.businessName,
                      priceDisplay: 'Contact for pricing',
                    },
                    video: fullProvider.featuredVideos?.[0] || {
                      id: 'vid-0',
                      providerId: fullProvider.id,
                      duration: '0:30',
                    },
                    rating: 0,
                  })
                  setProfileReturnView('provider-hub')
                  navigateTo('provider-profile')
                  return
                }
              }
              if (marketplaceItems.length > 0) {
                setSelectedProfileItem(marketplaceItems[0])
                setProfileReturnView('provider-hub')
                navigateTo('provider-profile')
              } else {
                showNotification('No provider profile found.')
              }
            }}
          />
        ) : currentView === 'provider-videos' ? (
          <ProviderVideos
            videos={providerVideosList}
            onBack={() => navigateBack('provider-hub')}
            onMenuClick={() => setIsDrawerOpen(true)}
            onUploadVideo={() => {
              setUploadVideoReturnView('provider-videos')
              navigateTo('provider-upload-video')
            }}
          />
        ) : currentView === 'provider-upload-video' ? (
          <ProviderUploadVideo
            onBack={() => navigateBack(uploadVideoReturnView)}
            onMenuClick={() => setIsDrawerOpen(true)}
            onSubmitSuccess={() => {
              if (currentUser) {
                fetchProviderVideos(currentUser.id)
                  .then(setProviderVideosList)
                  .catch(console.warn)
              }
              navigateTo('provider-videos')
              showNotification('Video uploaded successfully and submitted for review!')
            }}
          />
        ) : currentView === 'review-video' ? (
          <ReviewVideo
            item={reviewVideoTarget}
            onBack={handleBackFromReviewVideo}
            onApprove={handleApproveVideo}
            onReject={handleRejectVideo}
          />
        ) : currentView === 'reject-video' ? (
          <RejectVideo
            item={reviewVideoTarget}
            onBack={handleBackFromRejectVideo}
            onCancel={handleCancelRejectVideo}
            onConfirmReject={handleConfirmRejectVideo}
          />
        ) : currentView === 'video-moderation' ? (
          <VideoModeration
            videos={moderationVideos}
            onBack={() => navigateBack(videoModerationReturnView)}
            onMenuClick={() => setIsDrawerOpen(true)}
            onReviewVideo={handleOpenReviewVideoFromModeration}
          />
        ) : currentView === 'admin-dashboard' ? (
          <AdminDashboard
            metrics={adminMetrics}
            onMenuClick={() => setIsDrawerOpen(true)}
            onReviewVideos={handleNavigateReviewVideosFromDashboard}
            onReviewId={handleReviewIdFromDashboard}
          />
        ) : currentView === 'id-verification' ? (
          <IdVerification
            onBack={() => navigateBack('admin-dashboard')}
            onMenuClick={() => setIsDrawerOpen(true)}
            onStatusChange={() => {
              refreshAdminMetrics()
            }}
          />
        ) : currentView === 'customer-reviews' ? (
          <ProviderReviews
            providerId={currentUser?.id}
            providerName={currentUser?.name}
            onBack={() => navigateBack('provider-hub')}
            onMenuClick={() => setIsDrawerOpen(true)}
          />
        ) : currentView === 'provider-requests' ? (
          <ProviderRequests
            requests={providerRequests}
            isLoading={isProviderRequestsLoading}
            onBack={() => navigateBack('provider-hub')}
            onMenuClick={() => setIsDrawerOpen(true)}
            onOpenDetails={handleOpenProviderRequestDetails}
            onAcceptRequest={handleAcceptProviderRequest}
            onDeclineRequest={handleDeclineProviderRequest}
            onMarkInProgressRequest={handleMarkInProgressProviderRequest}
            onMarkCompleteRequest={handleMarkCompleteProviderRequest}
            onDeleteRequest={handleDeleteProviderRequest}
            onViewRating={(req) => showNotification(`Rating for ${req.service.name}: 5.0 ★`)}
          />
        ) : currentView === 'provider-request-details' && activeProviderRequest ? (
          <ProviderRequestDetails
            request={activeProviderRequest}
            onBack={() => {
              setActiveProviderRequest(null)
              navigateBack('provider-requests')
            }}
            onAccept={handleAcceptProviderRequest}
            onDecline={handleDeclineProviderRequest}
            onMarkInProgress={handleMarkInProgressProviderRequest}
            onMarkComplete={handleMarkCompleteProviderRequest}
            messages={chatMessagesMap[activeProviderRequest.id]}
            onSendMessage={(text) => handleSendMessageInChat(activeProviderRequest.id, text)}
          />
        ) : currentView === 'bookings' ? (
          <BookingsView
            bookings={bookings}
            isLoading={isBookingsLoading}
            activeTab={bookingsTab}
            onTabChange={setBookingsTab}
            onBackToDiscover={() => {
              setIsSearchActive(false)
              navigateBack('discover')
            }}
            onProviderClick={handleProviderClickFromBookings}
            onMenuClick={() => setIsDrawerOpen(true)}
            onOpenChat={handleOpenChat}
            onReviewBooking={handleReviewBooking}
            onDeleteBooking={handleDeleteBooking}
            onEditBooking={handleEditBooking}
            reviewedBookingIds={reviewedBookingIds}
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
                {isMarketplaceLoading ? (
                  <div
                    className="empty-state"
                    style={{ padding: '64px 16px', textAlign: 'center' }}
                  >
                    <p className="empty-state-title">Loading marketplace...</p>
                    <p className="empty-state-subtitle">
                      Connecting to Discover services.
                    </p>
                  </div>
                ) : (
                  <ProviderCardList
                    items={marketplaceItems}
                    onItemClick={handleCardClick}
                    onProviderClick={(targetItem) =>
                      handleOpenProviderProfile(targetItem, 'discover')
                    }
                  />
                )}
              </main>
            </>
          )
        )}

        {/* Navigation Drawer */}
        <NavDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          user={currentUser}
          onSignIn={() => {
            setIsDrawerOpen(false)
            setAuthModal({ isOpen: true, mode: 'login' })
          }}
          onNavigateHome={handleNavigateHome}
          onNavigateSearch={handleNavigateSearch}
          onNavigateBookings={handleNavigateBookings}
          onNavigateProviderHub={handleNavigateProviderHub}
          onNavigateVideoModeration={() => navigateTo('video-moderation')}
          onNavigateAdminDashboard={() => navigateTo('admin-dashboard')}
          onNavigateIdVerification={() => navigateTo('id-verification')}
          onNavigateProviderSignup={() => navigateTo('provider-signup')}
          onSignOut={handleSignOut}
          isProvider={currentUser?.role === 'provider' || currentUser?.role === 'admin'}
          isAdmin={currentUser?.role === 'admin'}
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

        {/* Customer Review Modal */}
        <ReviewBookingModal
          isOpen={isReviewModalOpen}
          booking={reviewTargetBooking}
          existingReview={reviewTargetExisting}
          onClose={() => {
            setIsReviewModalOpen(false)
            setReviewTargetBooking(null)
            setReviewTargetExisting(null)
          }}
          onSubmitReview={handleSubmitReview}
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
    provider: {
      id: 'prov-demo',
      businessName: 'Ade Beauty Studio',
      initials: 'AB',
      category: 'Makeup Artists',
      location: 'Ikeja, Lagos',
      isVerified: true,
      bio: 'Bridal and event makeup artist based in Ikeja, specializing in soft glam.',
      reviewCount: 0,
    },
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


