import type { MarketplaceItem, SearchFilters, BookingRequest } from '../types/marketplace'

/**
 * Temporary local mock data reflecting the approved Figma design.
 * Clearly isolated so it can easily be swapped with Supabase data later.
 */
export const CATEGORIES: string[] = [
  'All',
  'Barbers',
  'Makeup Artists',
  'Tailors',
  'Mechanics',
  'Electricians',
  'Photographers',
]

export const LOCATIONS: string[] = [
  'All',
  'Ikeja, Lagos',
  'Yaba, Lagos',
  'Surulere, Lagos',
  'Lekki, Lagos',
  'Victoria Island, Lagos',
]

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  location: '',
  category: '',
  minBudget: 0,
  maxBudget: 200000,
}

/**
 * Extracts numeric min and max price from formatted priceDisplay string.
 * e.g. "₦80,000" -> { min: 80000, max: 80000 }
 * e.g. "₦18,000–₦30,000" -> { min: 18000, max: 30000 }
 * e.g. "From ₦100,000" -> { min: 100000, max: 100000 }
 */
export function parsePriceRange(priceDisplay: string): { min: number; max: number } {
  const cleaned = priceDisplay.replace(/,/g, '')
  const matches = cleaned.match(/\d+/g)
  if (!matches || matches.length === 0) {
    return { min: 0, max: 0 }
  }
  const nums = matches.map((n) => parseInt(n, 10))
  if (nums.length === 1) {
    return { min: nums[0], max: nums[0] }
  }
  return { min: Math.min(...nums), max: Math.max(...nums) }
}

export function formatK(num: number): string {
  if (num >= 1000) {
    const k = num / 1000
    return `${k}k`
  }
  return `${num}`
}

export function formatBudgetChip(min: number, max: number): string {
  if (min > 0 && max < 200000) {
    return `₦${formatK(min)} – ₦${formatK(max)}`
  }
  if (min > 0) {
    return `From ₦${formatK(min)}`
  }
  return `Up to ₦${formatK(max)}`
}


export const MOCK_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 'item-1',
    provider: {
      id: 'prov-1',
      businessName: 'Ade Beauty Studio',
      initials: 'AB',
      category: 'Makeup Artists',
      location: 'Ikeja, Lagos',
      isVerified: true,
      bio: 'Bridal and event makeup artist based in Ikeja, specializing in soft glam and long-wear looks for weddings, photoshoots, and traditional ceremonies across Lagos.',
      reviewCount: 126,
      services: [
        {
          id: 'srv-1',
          providerId: 'prov-1',
          name: 'Custom Bridal Makeup',
          priceDisplay: '₦80,000',
        },
        {
          id: 'srv-1b',
          providerId: 'prov-1',
          name: 'Photoshoot Makeup',
          priceDisplay: '₦25,000',
        },
        {
          id: 'srv-1c',
          providerId: 'prov-1',
          name: 'Engagement Makeup',
          priceDisplay: '₦35,000 – ₦45,000',
        },
      ],
      featuredVideos: [
        {
          id: 'vid-1a',
          providerId: 'prov-1',
          title: 'Custom Bridal Makeup',
          duration: '0:22',
        },
        {
          id: 'vid-1b',
          providerId: 'prov-1',
          title: 'Soft Glam Look',
          duration: '0:15',
        },
        {
          id: 'vid-1c',
          providerId: 'prov-1',
          duration: '0:19',
        },
        {
          id: 'vid-1d',
          providerId: 'prov-1',
          duration: '0:12',
        },
      ],
      reviews: [
        {
          id: 'rev-1',
          authorName: 'Kristin Watson',
          rating: 5,
          comment: '“One of the best make-up sessions I’ve had.”',
          date: 'Sept 12, 2026',
        },
        {
          id: 'rev-2',
          authorName: 'Joan Dennis',
          rating: 4,
          comment: '“Good customer service.”',
          date: 'Sept 02, 2026',
        },
      ],
    },
    service: {
      id: 'srv-1',
      providerId: 'prov-1',
      name: 'Custom Bridal Makeup',
      priceDisplay: '₦50,000 – ₦80,000',
      priceType: 'starting_from',
      description: 'Full bridal glam application with an airbrush finish, including a 4-hour touchup kit for the day',
    },
    video: {
      id: 'vid-1',
      providerId: 'prov-1',
      duration: '0:22',
    },
    rating: 4.8,
  },
  {
    id: 'item-2',
    provider: {
      id: 'prov-2',
      businessName: 'Femi Auto Works',
      initials: 'FA',
      category: 'Mechanics',
      location: 'Yaba, Lagos',
      isVerified: true,
    },
    service: {
      id: 'srv-2',
      providerId: 'prov-2',
      name: 'Toyota Camry Engine Repair',
      priceDisplay: '₦25,000',
      priceType: 'fixed',
      description: 'Comprehensive diagnostic scan, complete engine overhaul, and timing calibration for optimal fuel economy.',
    },
    video: {
      id: 'vid-2',
      providerId: 'prov-2',
      duration: '0:41',
    },
    rating: 4.6,
  },
  {
    id: 'item-3',
    provider: {
      id: 'prov-3',
      businessName: 'Bola Bespoke',
      initials: 'BB',
      category: 'Tailors',
      location: 'Surulere, Lagos',
      isVerified: true,
    },
    service: {
      id: 'srv-3',
      providerId: 'prov-3',
      name: 'Ankara Two-Piece Set',
      priceDisplay: '₦18,000–₦30,000',
      priceType: 'starting_from',
      description: 'Handcrafted custom two-piece traditional Ankara tailored to your exact measurements and styling preferences.',
    },
    video: {
      id: 'vid-3',
      providerId: 'prov-3',
      duration: '0:16',
    },
    rating: 4.9,
  },
  {
    id: 'item-4',
    provider: {
      id: 'prov-4',
      businessName: "The Gentleman's Cut",
      initials: 'GC',
      category: 'Barbers',
      location: 'Lekki, Lagos',
      isVerified: true,
    },
    service: {
      id: 'srv-4',
      providerId: 'prov-4',
      name: 'Skin Fade Haircut',
      priceDisplay: '₦4,000–₦6,000',
      priceType: 'starting_from',
      description: 'Precision clipper skin fade, beard grooming, hot towel wash and styling finish by master barbers.',
    },
    video: {
      id: 'vid-4',
      providerId: 'prov-4',
      duration: '0:12',
    },
    rating: 4.7,
  },
  {
    id: 'item-5',
    provider: {
      id: 'prov-5',
      businessName: 'Lens & Light Studio',
      initials: 'LL',
      category: 'Photographers',
      location: 'Victoria Island, Lagos',
      isVerified: true,
    },
    service: {
      id: 'srv-5',
      providerId: 'prov-5',
      name: 'Event Photography',
      priceDisplay: 'From ₦100,000',
      priceType: 'starting_from',
      description: 'High-definition full-day event photo and video coverage with curated editing and digital gallery delivery.',
    },
    video: {
      id: 'vid-5',
      providerId: 'prov-5',
      duration: '0:30',
    },
    rating: 5.0,
  },
]

export const INITIAL_PROVIDER_REQUESTS: BookingRequest[] = [
  {
    id: 'req-1',
    customerId: 'usr-funmi',
    customerName: 'Funmi Okafor',
    provider: MOCK_MARKETPLACE_ITEMS[0].provider,
    service: {
      id: 'srv-1',
      providerId: 'prov-1',
      name: 'Custom Bridal Makeup',
      priceDisplay: '₦80,000',
    },
    location: 'Ikeja, Lagos',
    description: 'Bridal makeup for my wedding ceremony and reception, with long-wear finish.',
    preferredDate: 'Dec 14',
    preferredTime: '10:00 AM',
    status: 'pending',
    createdAt: '2026-12-10T09:00:00.000Z',
  },
  {
    id: 'req-2',
    customerId: 'usr-chioma',
    customerName: 'Chioma Eze',
    provider: MOCK_MARKETPLACE_ITEMS[0].provider,
    service: {
      id: 'srv-1b',
      providerId: 'prov-1',
      name: 'Photoshoot Makeup',
      priceDisplay: '₦25,000',
    },
    location: 'Ikeja, Lagos',
    description: 'Editorial photoshoot makeup for brand campaign.',
    preferredDate: 'Dec 20',
    preferredTime: '1:00 PM',
    status: 'pending',
    createdAt: '2026-12-11T11:30:00.000Z',
  },
  {
    id: 'req-3',
    customerId: 'usr-jessica',
    customerName: 'Jessica Temma',
    provider: MOCK_MARKETPLACE_ITEMS[0].provider,
    service: {
      id: 'srv-1',
      providerId: 'prov-1',
      name: 'Bridal Makeup',
      priceDisplay: '₦80,000',
    },
    location: 'Victoria Island, Lagos',
    description: 'Full bridal makeup for traditional wedding and white wedding reception.',
    preferredDate: 'Dec 08',
    preferredTime: '1:00 PM',
    status: 'in_progress',
    createdAt: '2026-12-05T14:00:00.000Z',
  },
  {
    id: 'req-4',
    customerId: 'usr-tonia',
    customerName: 'Tonia Lawal',
    provider: MOCK_MARKETPLACE_ITEMS[0].provider,
    service: {
      id: 'srv-1c',
      providerId: 'prov-1',
      name: 'Engagement Makeup',
      priceDisplay: '₦40,000',
    },
    location: 'Lekki, Lagos',
    description: 'Traditional engagement makeup with gele styling.',
    preferredDate: 'Dec 03',
    preferredTime: '7:00 PM',
    status: 'completed',
    createdAt: '2026-11-29T10:00:00.000Z',
  },
  {
    id: 'req-5',
    customerId: 'usr-kristin',
    customerName: 'Kristin Watson',
    provider: MOCK_MARKETPLACE_ITEMS[0].provider,
    service: {
      id: 'srv-1',
      providerId: 'prov-1',
      name: 'Custom Bridal Makeup',
      priceDisplay: '₦80,000',
    },
    location: 'Ikeja, Lagos',
    description: 'One of the best make-up sessions I have had.',
    preferredDate: 'Nov 20',
    preferredTime: '11:00 AM',
    status: 'completed',
    createdAt: '2026-11-15T09:00:00.000Z',
  },
  {
    id: 'req-6',
    customerId: 'usr-joan',
    customerName: 'Joan Dennis',
    provider: MOCK_MARKETPLACE_ITEMS[0].provider,
    service: {
      id: 'srv-1b',
      providerId: 'prov-1',
      name: 'Photoshoot Makeup',
      priceDisplay: '₦25,000',
    },
    location: 'Yaba, Lagos',
    description: 'Birthday studio photoshoot glam look.',
    preferredDate: 'Nov 15',
    preferredTime: '2:00 PM',
    status: 'completed',
    createdAt: '2026-11-10T12:00:00.000Z',
  },
  {
    id: 'req-7',
    customerId: 'usr-amina',
    customerName: 'Amina Bello',
    provider: MOCK_MARKETPLACE_ITEMS[0].provider,
    service: {
      id: 'srv-1',
      providerId: 'prov-1',
      name: 'Soft Glam Makeup',
      priceDisplay: '₦35,000',
    },
    location: 'Surulere, Lagos',
    description: 'Dinner glam look for alumni awards ceremony.',
    preferredDate: 'Nov 10',
    preferredTime: '4:00 PM',
    status: 'completed',
    createdAt: '2026-11-05T15:30:00.000Z',
  },
  {
    id: 'req-8',
    customerId: 'usr-grace',
    customerName: 'Grace Oladipo',
    provider: MOCK_MARKETPLACE_ITEMS[0].provider,
    service: {
      id: 'srv-1c',
      providerId: 'prov-1',
      name: 'Engagement Makeup',
      priceDisplay: '₦45,000',
    },
    location: 'Ikeja, Lagos',
    description: 'Traditional engagement ceremony full look.',
    preferredDate: 'Nov 05',
    preferredTime: '1:30 PM',
    status: 'completed',
    createdAt: '2026-10-30T10:00:00.000Z',
  },
  {
    id: 'req-9',
    customerId: 'usr-blessing',
    customerName: 'Blessing Nnamdi',
    provider: MOCK_MARKETPLACE_ITEMS[0].provider,
    service: {
      id: 'srv-1',
      providerId: 'prov-1',
      name: 'Bridal Makeup',
      priceDisplay: '₦80,000',
    },
    location: 'Victoria Island, Lagos',
    description: 'Full bridal makeover with natural lashes.',
    preferredDate: 'Oct 28',
    preferredTime: '10:00 AM',
    status: 'completed',
    createdAt: '2026-10-20T08:00:00.000Z',
  },
  {
    id: 'req-10',
    customerId: 'usr-tolu',
    customerName: 'Tolu Adebayo',
    provider: MOCK_MARKETPLACE_ITEMS[0].provider,
    service: {
      id: 'srv-1',
      providerId: 'prov-1',
      name: 'Bridal Makeup & Styling',
      priceDisplay: '₦75,000',
    },
    location: 'Surulere, Lagos',
    description: 'Late evening bridal reception touch-up and styling.',
    preferredDate: 'Nov 28',
    preferredTime: '9:00 PM',
    status: 'declined',
    createdAt: '2026-11-25T16:00:00.000Z',
  },
]

export type ProviderVideoStatus = 'approved' | 'under_review' | 'rejected'

export interface ProviderVideoItem {
  id: string
  title: string
  status: ProviderVideoStatus
  thumbnailUrl?: string
}

export const INITIAL_PROVIDER_VIDEOS: ProviderVideoItem[] = [
  {
    id: 'pvid-1',
    title: 'Custom Bridal Makeup',
    status: 'approved',
  },
  {
    id: 'pvid-2',
    title: 'Engagement Makeup',
    status: 'approved',
  },
  {
    id: 'pvid-3',
    title: 'Soft Glam Look',
    status: 'under_review',
  },
  {
    id: 'pvid-4',
    title: 'Rushed Clip',
    status: 'rejected',
  },
]

export interface ReviewVideoItem {
  id: string
  providerName: string
  serviceName: string
  videoUrl?: string
  thumbnailUrl?: string
}

export const DEFAULT_REVIEW_VIDEO_ITEM: ReviewVideoItem = {
  id: 'rev-vid-1',
  providerName: 'Ade Beauty Studio',
  serviceName: 'Custom Bridal Makeup',
}

export type RejectionReason = 'Violates Platform Guidelines' | 'Irrelevant Video'

export const REJECTION_REASONS: RejectionReason[] = [
  'Violates Platform Guidelines',
  'Irrelevant Video',
]



