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

export interface User {
  id: string
  name: string
  email: string
  role: 'customer' | 'provider' | 'admin'
}

export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled'

export interface BookingRequest {
  id: string
  customerId: string
  customerName: string
  provider: Provider
  service: Service
  location: string
  description: string
  preferredDate?: string
  preferredTime?: string
  status: BookingStatus
  createdAt: string
}
