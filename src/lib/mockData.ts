import type { MarketplaceItem } from '../types/marketplace'

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
    },
    service: {
      id: 'srv-1',
      providerId: 'prov-1',
      name: 'Custom Bridal Makeup',
      priceDisplay: '₦80,000',
      priceType: 'fixed',
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
    },
    video: {
      id: 'vid-5',
      providerId: 'prov-5',
      duration: '0:30',
    },
    rating: 5.0,
  },
]
