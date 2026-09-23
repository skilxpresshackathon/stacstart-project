export type PriceType = 'fixed' | 'starting_from' | 'negotiable'

export interface Provider {
  id: string
  businessName: string
  initials: string
  category: string
  location: string
  isVerified: boolean
  avatarUrl?: string
}

export interface Service {
  id: string
  providerId: string
  name: string
  priceDisplay: string
  priceType?: PriceType
}

export interface VideoItem {
  id: string
  providerId: string
  duration: string
  videoUrl?: string
  thumbnailUrl?: string
}

export interface MarketplaceItem {
  id: string
  provider: Provider
  service: Service
  video: VideoItem
  rating: number
}

export type Category = string
