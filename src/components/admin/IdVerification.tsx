import { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeftIcon,
  MenuLinesIcon,
  CheckIcon,
  CloseIcon,
  ShieldCheckIcon,
  DocumentIcon,
  UserIcon,
} from '../common/Icons'
import {
  fetchAdminVerificationSubmissions,
  moderateApproveVerification,
  moderateRejectVerification,
  getVerificationDocumentUrl,
  isLegacyVerificationPath,
  type AdminVerificationItem,
} from '../../lib/data/verification'

export type VerificationTab = 'Pending' | 'Approved' | 'Rejected'

interface IdVerificationProps {
  onBack: () => void
  onMenuClick: () => void
  onStatusChange?: () => void
}

const COMMON_REJECTION_REASONS = [
  'NIN document is unreadable or blurry',
  'Selfie does not match photo on identity document',
  'Name mismatch with official records',
  'Expired or invalid identity document',
  'Document does not meet platform verification guidelines',
]

export function IdVerification({ onBack, onMenuClick, onStatusChange }: IdVerificationProps) {
  const [submissions, setSubmissions] = useState<AdminVerificationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<VerificationTab | 'All'>('Pending')
  const [activeReviewItem, setActiveReviewItem] = useState<AdminVerificationItem | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState(COMMON_REJECTION_REASONS[0])
  const [customReason, setCustomReason] = useState('')
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Signed document preview URLs
  const [ninSignedUrl, setNinSignedUrl] = useState<string | null>(null)
  const [selfieSignedUrl, setSelfieSignedUrl] = useState<string | null>(null)
  const [isLoadingDocUrls, setIsLoadingDocUrls] = useState(false)
  const [enlargedImage, setEnlargedImage] = useState<{ url: string; title: string } | null>(null)

  const loadSubmissions = useCallback(async () => {
    setIsLoading(true)
    const items = await fetchAdminVerificationSubmissions()
    setSubmissions(items)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let isMounted = true
    fetchAdminVerificationSubmissions().then((items) => {
      if (isMounted) {
        setSubmissions(items)
        setIsLoading(false)
      }
    }).catch(() => {
      if (isMounted) {
        setIsLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const handleOpenReview = (item: AdminVerificationItem) => {
    setActiveReviewItem(item)
    setNinSignedUrl(null)
    setSelfieSignedUrl(null)
    setIsLoadingDocUrls(true)

    Promise.all([
      getVerificationDocumentUrl(item.idDocumentPath),
      getVerificationDocumentUrl(item.selfiePath),
    ])
      .then(([ninUrl, selfieUrl]) => {
        setNinSignedUrl(ninUrl)
        setSelfieSignedUrl(selfieUrl)
        setIsLoadingDocUrls(false)
      })
      .catch(() => {
        setIsLoadingDocUrls(false)
      })
  }

  const handleCloseReview = () => {
    setActiveReviewItem(null)
    setNinSignedUrl(null)
    setSelfieSignedUrl(null)
    setIsLoadingDocUrls(false)
  }

  const filteredSubmissions = submissions.filter((sub) => {
    if (selectedTab === 'All') return true
    if (selectedTab === 'Pending') return sub.status === 'pending'
    if (selectedTab === 'Approved') return sub.status === 'approved'
    if (selectedTab === 'Rejected') return sub.status === 'rejected'
    return true
  })

  const handleApprove = async (item: AdminVerificationItem) => {
    setIsProcessing(true)
    setFeedbackMsg(null)
    const res = await moderateApproveVerification(item.id, item.providerId)
    setIsProcessing(false)

    if (res.success) {
      setFeedbackMsg({
        type: 'success',
        text: `Verification approved for ${item.businessName}. Provider is now verified!`,
      })
      handleCloseReview()
      await loadSubmissions()
      onStatusChange?.()
    } else {
      setFeedbackMsg({
        type: 'error',
        text: res.error || 'Failed to approve verification submission.',
      })
    }
  }

  const handleOpenReject = (item: AdminVerificationItem) => {
    setActiveReviewItem(item)
    setRejectionModalOpen(true)
    setCustomReason('')
  }

  const handleConfirmReject = async () => {
    if (!activeReviewItem) return
    const reasonToUse = customReason.trim() ? customReason.trim() : selectedReason
    setIsProcessing(true)
    setFeedbackMsg(null)

    const res = await moderateRejectVerification(
      activeReviewItem.id,
      activeReviewItem.providerId,
      reasonToUse
    )
    setIsProcessing(false)

    if (res.success) {
      setFeedbackMsg({
        type: 'success',
        text: `Verification rejected for ${activeReviewItem.businessName}.`,
      })
      setRejectionModalOpen(false)
      handleCloseReview()
      await loadSubmissions()
      onStatusChange?.()
    } else {
      setFeedbackMsg({
        type: 'error',
        text: res.error || 'Failed to reject verification submission.',
      })
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="id-verification-screen">
      <div className="id-verification-container">
        {/* Header Bar */}
        <header className="id-verification-header">
          <div className="id-verification-header-left">
            <button
              type="button"
              className="id-verification-back-btn"
              onClick={onBack}
              aria-label="Back to Admin Dashboard"
            >
              <ChevronLeftIcon className="id-verification-back-icon" />
            </button>
            <h1 className="id-verification-title">ID Verification</h1>
          </div>
          <button
            type="button"
            className="id-verification-menu-btn"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <MenuLinesIcon className="id-verification-menu-icon" />
          </button>
        </header>

        {/* Feedback Alert Message */}
        {feedbackMsg && (
          <div className={`id-verification-alert alert-${feedbackMsg.type}`} role="status">
            <span>{feedbackMsg.text}</span>
            <button
              type="button"
              className="alert-close-btn"
              onClick={() => setFeedbackMsg(null)}
              aria-label="Dismiss alert"
            >
              <CloseIcon />
            </button>
          </div>
        )}

        {/* Status Filter Tabs */}
        <nav className="id-verification-tabs-nav" aria-label="Filter verifications by status">
          {(['Pending', 'Approved', 'Rejected', 'All'] as const).map((tab) => {
            const isActive = selectedTab === tab
            const count = submissions.filter((s) =>
              tab === 'All' ? true : s.status === tab.toLowerCase()
            ).length

            return (
              <button
                key={tab}
                type="button"
                className={`id-verification-tab ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedTab(tab)}
              >
                <span>{tab}</span>
                <span className="tab-counter-badge">{count}</span>
              </button>
            )
          })}
        </nav>

        {/* Submissions List Content */}
        <main className="id-verification-content">
          {isLoading ? (
            <div className="id-verification-loading">
              <div className="spinner" />
              <p>Loading verification submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="id-verification-empty">
              <ShieldCheckIcon className="empty-icon" />
              <h2>No {selectedTab === 'All' ? '' : selectedTab} Submissions</h2>
              <p>
                {selectedTab === 'Pending'
                  ? 'There are currently no provider ID submissions awaiting review.'
                  : `No verification submissions match the "${selectedTab}" filter.`}
              </p>
            </div>
          ) : (
            <div className="id-verification-list" role="list">
              {filteredSubmissions.map((sub) => (
                <div key={sub.id} className="id-verification-card" role="listitem">
                  <div className="id-verification-card-header">
                    <div>
                      <h2 className="id-card-business-name">{sub.businessName}</h2>
                      <p className="id-card-provider-name">
                        <UserIcon className="inline-icon" />
                        <span>{sub.providerName}</span>
                      </p>
                    </div>
                    <span className={`id-status-badge status-${sub.status}`}>
                      {sub.status === 'pending'
                        ? 'Pending Review'
                        : sub.status === 'approved'
                        ? 'Approved'
                        : 'Rejected'}
                    </span>
                  </div>

                  <div className="id-card-details-grid">
                    <div className="id-detail-item">
                      <span className="id-detail-label">Category:</span>
                      <span className="id-detail-val">{sub.category}</span>
                    </div>
                    <div className="id-detail-item">
                      <span className="id-detail-label">Location:</span>
                      <span className="id-detail-val">{sub.location}</span>
                    </div>
                    <div className="id-detail-item">
                      <span className="id-detail-label">NIN:</span>
                      <span className="id-detail-val font-mono">
                        {sub.nin.length > 4 ? `••• ••• ${sub.nin.slice(-4)}` : sub.nin}
                      </span>
                    </div>
                    <div className="id-detail-item">
                      <span className="id-detail-label">Submitted:</span>
                      <span className="id-detail-val">{formatDate(sub.submittedAt)}</span>
                    </div>
                  </div>

                  {sub.rejectionReason && (
                    <div className="id-card-rejection-note">
                      <strong>Rejection Reason:</strong> {sub.rejectionReason}
                    </div>
                  )}

                  <div className="id-card-actions">
                    <button
                      type="button"
                      className="id-view-details-btn"
                      onClick={() => handleOpenReview(sub)}
                    >
                      {sub.status === 'pending' ? 'Review Submission' : 'View Details'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Detailed Review & Approval Modal */}
        {activeReviewItem && !rejectionModalOpen && (
          <div className="id-modal-backdrop" onClick={handleCloseReview}>
            <div
              className="id-review-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="id-modal-header">
                <div>
                  <h2 id="review-modal-title" className="id-modal-title">
                    Verify Provider Identity
                  </h2>
                  <p className="id-modal-subtitle">{activeReviewItem.businessName}</p>
                </div>
                <button
                  type="button"
                  className="id-modal-close-btn"
                  onClick={handleCloseReview}
                  aria-label="Close review dialog"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="id-modal-body">
                {/* Provider Identity Information */}
                <section className="id-modal-section">
                  <h3 className="id-modal-section-title">Provider Profile</h3>
                  <div className="id-modal-info-grid">
                    <div>
                      <span className="id-info-label">Full Name</span>
                      <p className="id-info-val">{activeReviewItem.providerName}</p>
                    </div>
                    <div>
                      <span className="id-info-label">Business Name</span>
                      <p className="id-info-val">{activeReviewItem.businessName}</p>
                    </div>
                    <div>
                      <span className="id-info-label">Category</span>
                      <p className="id-info-val">{activeReviewItem.category}</p>
                    </div>
                    <div>
                      <span className="id-info-label">Location</span>
                      <p className="id-info-val">{activeReviewItem.location}</p>
                    </div>
                    {activeReviewItem.email && (
                      <div>
                        <span className="id-info-label">Email</span>
                        <p className="id-info-val">{activeReviewItem.email}</p>
                      </div>
                    )}
                    {activeReviewItem.phone && (
                      <div>
                        <span className="id-info-label">Phone</span>
                        <p className="id-info-val">{activeReviewItem.phone}</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Submitted Documents Inspection */}
                <section className="id-modal-section">
                  <h3 className="id-modal-section-title">Submitted Identity Credentials</h3>
                  <div className="id-docs-grid">
                    {/* NIN Document Card */}
                    <div className="id-doc-preview-card">
                      <div className="id-doc-header">
                        <DocumentIcon className="id-doc-icon" />
                        <div>
                          <span className="id-doc-type">National Identification (NIN)</span>
                          <p className="id-doc-number font-mono">{activeReviewItem.nin}</p>
                        </div>
                      </div>

                      {isLegacyVerificationPath(activeReviewItem.idDocumentPath) ? (
                        <div className="id-legacy-doc-notice">
                          <span className="id-legacy-badge">Legacy Submission</span>
                          <p className="id-legacy-text">Document unavailable — legacy local submission</p>
                        </div>
                      ) : isLoadingDocUrls ? (
                        <div className="id-doc-loading-state">Resolving secure document...</div>
                      ) : ninSignedUrl ? (
                        activeReviewItem.idDocumentPath.toLowerCase().endsWith('.pdf') ? (
                          <div className="id-doc-pdf-wrap">
                            <span className="id-doc-pdf-name">{activeReviewItem.idDocumentPath.split('/').pop()}</span>
                            <a
                              href={ninSignedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="id-doc-action-link"
                            >
                              Open Secure PDF
                            </a>
                          </div>
                        ) : (
                          <div
                            className="id-doc-image-wrap"
                            onClick={() => setEnlargedImage({ url: ninSignedUrl, title: 'National Identity Document (NIN)' })}
                            role="button"
                            tabIndex={0}
                            title="Click to view full size"
                          >
                            <img src={ninSignedUrl} alt="NIN Document" className="id-doc-img" />
                            <div className="id-doc-overlay-hint">Click to enlarge</div>
                          </div>
                        )
                      ) : (
                        <div className="id-doc-empty">
                          <p>Secure document object not found in storage.</p>
                        </div>
                      )}

                      <div className="id-doc-file-info">
                        <span className="id-doc-filename">
                          {activeReviewItem.idDocumentPath.split('/').pop() || 'nin_document.pdf'}
                        </span>
                        <span className="id-doc-status-chip">
                          {isLegacyVerificationPath(activeReviewItem.idDocumentPath) ? 'Local Ref' : 'Verified Storage'}
                        </span>
                      </div>
                    </div>

                    {/* Selfie Verification Card */}
                    <div className="id-doc-preview-card">
                      <div className="id-doc-header">
                        <UserIcon className="id-doc-icon" />
                        <div>
                          <span className="id-doc-type">Facial Verification / Selfie</span>
                          <p className="id-doc-number">Identity match confirmation</p>
                        </div>
                      </div>

                      {isLegacyVerificationPath(activeReviewItem.selfiePath) ? (
                        <div className="id-legacy-doc-notice">
                          <span className="id-legacy-badge">Legacy Submission</span>
                          <p className="id-legacy-text">Document unavailable — legacy local submission</p>
                        </div>
                      ) : isLoadingDocUrls ? (
                        <div className="id-doc-loading-state">Resolving secure selfie...</div>
                      ) : selfieSignedUrl ? (
                        <div
                          className="id-doc-image-wrap"
                          onClick={() => setEnlargedImage({ url: selfieSignedUrl, title: 'Biometric Selfie Verification' })}
                          role="button"
                          tabIndex={0}
                          title="Click to view full size"
                        >
                          <img src={selfieSignedUrl} alt="Provider Selfie" className="id-doc-img" />
                          <div className="id-doc-overlay-hint">Click to enlarge</div>
                        </div>
                      ) : (
                        <div className="id-doc-empty">
                          <p>Secure selfie object not found in storage.</p>
                        </div>
                      )}

                      <div className="id-doc-file-info">
                        <span className="id-doc-filename">
                          {activeReviewItem.selfiePath.split('/').pop() || 'selfie_verification.jpg'}
                        </span>
                        <span className="id-doc-status-chip">
                          {isLegacyVerificationPath(activeReviewItem.selfiePath) ? 'Local Ref' : 'Verified Storage'}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Current Status Note */}
                {activeReviewItem.status !== 'pending' && (
                  <div className="id-modal-status-summary">
                    <p>
                      Current Status:{' '}
                      <strong className={`status-${activeReviewItem.status}`}>
                        {activeReviewItem.status.toUpperCase()}
                      </strong>
                    </p>
                    {activeReviewItem.rejectionReason && (
                      <p>Reason: {activeReviewItem.rejectionReason}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="id-modal-footer">
                {activeReviewItem.status === 'pending' ? (
                  <>
                    <button
                      type="button"
                      className="id-btn-approve"
                      onClick={() => handleApprove(activeReviewItem)}
                      disabled={isProcessing}
                    >
                      <CheckIcon className="btn-icon" />
                      <span>{isProcessing ? 'Approving...' : 'Approve Provider'}</span>
                    </button>
                    <button
                      type="button"
                      className="id-btn-reject"
                      onClick={() => handleOpenReject(activeReviewItem)}
                      disabled={isProcessing}
                    >
                      <CloseIcon className="btn-icon" />
                      <span>Reject</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="id-btn-close"
                    onClick={() => setActiveReviewItem(null)}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rejection Reason Selection Dialog */}
        {rejectionModalOpen && activeReviewItem && (
          <div className="id-modal-backdrop" onClick={() => setRejectionModalOpen(false)}>
            <div
              className="id-rejection-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="rejection-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="id-modal-header">
                <div>
                  <h2 id="rejection-modal-title" className="id-modal-title">
                    Select Rejection Reason
                  </h2>
                  <p className="id-modal-subtitle">
                    Explain why {activeReviewItem.businessName}&apos;s submission was rejected
                  </p>
                </div>
                <button
                  type="button"
                  className="id-modal-close-btn"
                  onClick={() => setRejectionModalOpen(false)}
                  aria-label="Close dialog"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="id-modal-body">
                <div className="rejection-reasons-list">
                  {COMMON_REJECTION_REASONS.map((reason) => (
                    <label key={reason} className="rejection-reason-option">
                      <input
                        type="radio"
                        name="rejection-reason"
                        checked={selectedReason === reason && !customReason}
                        onChange={() => {
                          setSelectedReason(reason)
                          setCustomReason('')
                        }}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                <div className="custom-rejection-wrap">
                  <label htmlFor="custom-reason-input" className="custom-reason-label">
                    Or specify a custom reason:
                  </label>
                  <textarea
                    id="custom-reason-input"
                    rows={3}
                    className="custom-reason-textarea"
                    placeholder="Provide additional details regarding the rejection..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="id-modal-footer">
                <button
                  type="button"
                  className="id-btn-reject-confirm"
                  onClick={handleConfirmReject}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
                <button
                  type="button"
                  className="id-btn-cancel"
                  onClick={() => setRejectionModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enlarged Image Lightbox */}
        {enlargedImage && (
          <div className="id-lightbox-backdrop" onClick={() => setEnlargedImage(null)}>
            <div className="id-lightbox-content" onClick={(e) => e.stopPropagation()}>
              <div className="id-lightbox-header">
                <h4 className="id-lightbox-title">{enlargedImage.title}</h4>
                <button
                  type="button"
                  className="id-lightbox-close-btn"
                  onClick={() => setEnlargedImage(null)}
                  aria-label="Close enlarged preview"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="id-lightbox-body">
                <img src={enlargedImage.url} alt={enlargedImage.title} className="id-lightbox-img" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
