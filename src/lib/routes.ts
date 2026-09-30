export type ViewType =
  | 'discover'
  | 'bookings'
  | 'video-viewer'
  | 'request-service'
  | 'provider-profile'
  | 'chat'
  | 'provider-signup'
  | 'provider-hub'
  | 'provider-requests'
  | 'provider-request-details'
  | 'provider-videos'
  | 'provider-upload-video'
  | 'customer-reviews'
  | 'review-video'
  | 'reject-video'
  | 'video-moderation'
  | 'admin-dashboard'
  | 'id-verification'

export function getHashForView(view: ViewType): string {
  switch (view) {
    case 'admin-dashboard':
      return '#admin-dashboard'
    case 'video-moderation':
      return '#video-moderation'
    case 'review-video':
      return '#review-video'
    case 'reject-video':
      return '#reject-video'
    case 'id-verification':
      return '#id-verification'
    case 'provider-hub':
      return '#provider-hub'
    case 'provider-requests':
      return '#client-requests'
    case 'provider-request-details':
      return '#request-details'
    case 'provider-videos':
      return '#provider-videos'
    case 'provider-upload-video':
      return '#provider-upload-video'
    case 'customer-reviews':
      return '#customer-reviews'
    case 'bookings':
      return '#bookings'
    case 'provider-profile':
      return '#profile'
    case 'request-service':
      return '#request-service'
    case 'chat':
      return '#chat'
    case 'provider-signup':
      return '#provider-signup'
    case 'video-viewer':
      return '#video'
    case 'discover':
    default:
      return ''
  }
}

export function getViewFromHash(hash: string): ViewType {
  const cleanHash = hash.replace(/^#/, '')
  switch (cleanHash) {
    case 'admin-dashboard':
    case 'admin':
      return 'admin-dashboard'
    case 'video-moderation':
    case 'moderation':
      return 'video-moderation'
    case 'review-video':
      return 'review-video'
    case 'reject-video':
      return 'reject-video'
    case 'id-verification':
    case 'verification':
      return 'id-verification'
    case 'provider-hub':
    case 'provider-hub-active':
    case 'provider-hub-new':
      return 'provider-hub'
    case 'client-requests':
    case 'provider-requests':
      return 'provider-requests'
    case 'request-details':
    case 'request-details-pending':
    case 'request-details-inprogress':
    case 'request-details-completed':
    case 'request-details-declined':
      return 'provider-request-details'
    case 'provider-videos':
      return 'provider-videos'
    case 'provider-upload-video':
      return 'provider-upload-video'
    case 'customer-reviews':
    case 'reviews':
      return 'customer-reviews'
    case 'bookings':
      return 'bookings'
    case 'profile':
      return 'provider-profile'
    case 'request-service':
      return 'request-service'
    case 'chat':
    case 'chat-pending':
    case 'chat-inprogress':
    case 'chat-completed':
    case 'chat-declined':
      return 'chat'
    case 'provider-signup':
      return 'provider-signup'
    case 'video':
      return 'video-viewer'
    case 'discover':
    case '':
    default:
      return 'discover'
  }
}
