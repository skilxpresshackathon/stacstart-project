 Discover — MVP Product Specification

 1. Product Overview

Discover is a video-first marketplace that helps customers discover local service providers through short service videos and request their services directly.

The MVP focuses on a simple journey:

Discover → Find a Provider → View Provider → Book a Service → Manage Booking

---

 2. Problem

Customers need a simple way to discover local service providers, understand their work, and make service bookings.

Service providers need a simple way to showcase their work, receive bookings, manage requests, and build trust through reviews and verification.

---

 3. Solution

Discover allows service providers to showcase their work through short videos.

Customers can:

- Discover service providers
- Search and filter providers
- Watch provider videos
- View provider profiles
- Book/request a service
- Track their bookings
- Communicate about an active booking
- Review a provider after completion

Providers can:

- Create and manage a provider profile
- Showcase their work through videos
- Receive service requests
- Accept or decline requests
- Provide a rejection reason when declining
- Manage bookings
- View customer reviews
- Edit their profile
- Submit information for business verification

---

 4. User Types

 Guest

A guest can:

- Browse the Discover marketplace
- Watch provider videos
- Search for services
- Filter providers
- View provider profiles

Authentication is required before performing account-based actions such as submitting a booking.

 Customer

A customer can:

- Browse providers
- View provider profiles
- Book/request services
- View their bookings
- Track booking status
- Communicate about an active booking
- Review a provider after completion
- Convert their account to a provider account

 Provider

A provider can:

- Browse the marketplace
- Manage their provider profile
- Receive service requests
- Accept or decline requests
- Provide a rejection reason when declining
- Manage active bookings
- Upload and manage videos
- View customer reviews
- Manage verification information

 Admin

An admin can:

- Review provider verification submissions
- Review submitted identification documents
- Approve or reject verification
- Manage verification status
- Perform required administrative moderation

---

 5. Core MVP Flow

 Discovery

Discover
→ Search / Filter
→ Provider Results
→ Provider Profile
→ Book / Request Service

 Booking

Book / Request Service
→ Sign In / Sign Up if required
→ Booking Form
→ Submit Request
→ Pending

 Booking Lifecycle

Pending
→ In Progress
→ Completed

Alternative outcome:

Pending
→ Declined
→ Rejection Reason

A booking may also be cancelled where supported by the final product flow.

---

 6. Main Navigation

 Customer

- Discover
- My Bookings
- Alerts
- Account

 Provider

- Discover
- My Bookings
- Provider Dashboard
- Account

---

 7. Provider Video Flow

Provider Dashboard

→ Upload Video

→ Manage Videos

→ Video becomes available according to the application's approval/moderation flow

Approved provider videos can appear in:

- Discover
- Provider Profile

---

 8. Provider Verification

Provider verification is handled inside Account Settings.

 Tier 1 Verification

A provider supplies:

- Business name
- Identification document
- Location
- Phone number

The submitted identification document is manually reviewed by an admin.

If approved:

Provider receives a verification badge.

Verification status should be visible where appropriate in the provider experience.

---

 9. Customer Conversion to Provider

A customer can convert their account to a provider account.

The conversion starts from the customer account experience.

Customer

→ Become a Provider

→ Provide additional provider information

→ Complete provider setup

→ Provider experience becomes available

Additional verification may be completed through Account Settings.

---

 10. Booking Rules

A booking/request contains information required to understand the customer's service request.

The booking lifecycle includes:

- Pending
- In Progress
- Completed
- Declined

When a provider declines a booking, a rejection reason is required.

The exact booking fields and final interaction details should follow the approved UI design.

---

 11. Reviews

Customers can review a provider after a completed booking.

A review can contain:

- 1–5 star rating
- Optional comment

Reviews should be connected to the completed booking.

---

 12. Social Features

Social sharing features are intentionally omitted from the MVP.

The product focuses primarily on:

- Discovery
- Comments
- Reviews
- Booking workflows
- Provider profiles
- Provider videos

---

 13. MVP Scope

 P0 — Must Have

- Discover marketplace
- Provider cards
- Search
- Basic filtering
- Provider profile
- Provider videos
- Customer authentication
- Provider authentication
- Booking/request form
- Booking management
- Provider booking management
- Booking status
- Provider profile management
- Basic reviews and ratings
- Customer-to-provider conversion

 P1 — Important

- Provider video management
- Tier 1 provider verification
- Admin verification review
- Verification badge
- Comments
- Notifications

 P2 — Optional

- Advanced recommendations
- Advanced analytics
- Payments
- Maps
- Advanced notification features
- Additional AI features

---

 14. Out of Scope for the MVP

The following should not block the first working version:

- Complex payment systems
- Advanced recommendation engines
- Complex analytics
- Large-scale moderation systems
- Advanced AI features without a clear user benefit
- Complex infrastructure
- Microservices
- Unnecessary third-party integrations
- Social sharing features

The priority is a working, testable and deployable product.

---

 15. AI Usage

AI may be used where it provides clear value to the product or development process.

AI should not be added only for the purpose of saying that the project uses AI.

Any AI feature must support a real user problem and remain within the MVP scope.

---

 16. MVP Success Criteria

The MVP should allow a user to:

1. Open Discover
2. Find a service provider
3. View the provider's work
4. Open the provider profile
5. Request/book a service
6. Track the booking
7. Allow the provider to respond
8. Move the booking through the supported lifecycle
9. Complete the booking
10. Leave a review

The MVP should also demonstrate:

- Provider profile management
- Provider video management
- Tier 1 verification flow
- Admin verification review
- Customer-to-provider conversion

---

 17. Build Week Priority

During the StacStart Build Week, priority is:

1. Working core user flow
2. Frontend and backend integration
3. Authentication
4. Discovery marketplace
5. Booking management
6. Provider functionality
7. Verification flow
8. Testing
9. Deployment
10. Documentation
11. Demo and pitch preparation

Optional features must not delay the core MVP.