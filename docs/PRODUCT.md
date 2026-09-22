 StacStart MVP — Product Specification

 1. Product Overview

StacStart is a video-first marketplace that helps customers discover local service providers through short service videos and request their services directly.

The MVP focuses on a simple journey:

Discover → Find a Provider → View Provider → Request Service → Manage Request

---

 2. Problem

Customers often struggle to discover trustworthy local service providers and understand the quality of their work before contacting them.

Service providers also need a simple way to showcase their work and receive service requests from potential customers.

---

 3. Solution

StacStart allows service providers to showcase their work through short videos.

Customers can:

- Discover service providers
- Search and filter providers
- Watch provider videos
- View provider profiles
- Request a service
- Track their requests
- Communicate about an active request
- Review a provider after a completed request

Providers can:

- Create a provider profile
- Showcase their work
- Receive service requests
- Accept or decline requests
- Manage active requests
- Communicate with customers

---

 4. User Types

 Guest

A guest can:

- Browse the Discover marketplace
- Watch provider videos
- Search for services
- Filter providers
- View provider profiles

A guest must sign in before submitting a service request.

 Customer

A customer can:

- Browse providers
- View provider profiles
- Request services
- View their requests
- Track request status
- Chat within an active request
- Review a provider after completion

 Provider

A provider can:

- Browse the marketplace
- Manage their provider profile
- Receive service requests
- Accept or decline requests
- Manage active requests
- Communicate with customers
- Submit work videos for approval

---

 5. Core MVP Flow

 Discovery

Discover
→ Search / Filter
→ Provider Results
→ Provider Profile
→ Request Service

 Request

Request Service
→ Sign In / Sign Up if required
→ Request Form
→ Submit Request
→ Pending

 Request Lifecycle

Pending
→ Accepted
→ In Progress
→ Completed

Alternative outcomes:

Pending
→ Declined

Pending / Accepted
→ Cancelled

 Review

Completed
→ Customer Review
→ 1–5 Star Rating
→ Optional Comment

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
- Provider Hub
- Account

---

 7. Provider Video Flow

Provider
→ Upload Video
→ Admin Review
→ Approved / Rejected

If approved:

Video
→ Discover
→ Provider Profile

Rejected videos do not appear publicly.

---

 8. Request Rules

A service request contains:

- Service
- Location
- Description
- Preferred date
- Preferred time

Request statuses:

- Pending
- Accepted
- Declined
- In Progress
- Completed
- Cancelled

Chat is connected to a specific service request.

Completed, declined, or cancelled requests become read-only.

Customers can only submit a review after a request is completed.

---

 9. MVP Scope

 P0 — Must Have

- Discover marketplace
- Provider cards
- Search
- Basic filtering
- Provider profile
- Provider videos
- Customer authentication
- Provider authentication
- Service request form
- Request management
- Provider request management
- Request status
- Basic request-scoped chat
- Basic review and rating

 P1 — Important

- Provider video upload
- Admin video approval
- Notifications
- Provider verification
- Improved profile management

 P2 — Optional

- Advanced recommendations
- Advanced analytics
- Payments
- Maps
- Advanced notifications
- Additional AI features

---

 10. Out of Scope for the MVP

The following should not block the first working version:

- Complex payment systems
- Advanced recommendation engines
- Complex analytics
- Large-scale moderation systems
- Advanced AI features
- Complex infrastructure
- Microservices
- Unnecessary third-party integrations

The priority is a working, testable and deployable product.

---

 11. AI Usage

AI may be used where it provides clear value to the product or development process.

AI must not be added only for the purpose of saying that the project uses AI.

Any AI feature must support a real user problem and remain within the MVP scope.

---

 12. MVP Success Criteria

The MVP should allow a user to:

1. Open Discover
2. Find a service provider
3. View the provider's work
4. Open the provider profile
5. Request a service
6. Track the request
7. Allow the provider to respond
8. Complete the request
9. Leave a review

The complete core journey should work from the frontend through the backend.

---

 13. Build Week Priority

During StacStart Build Week, priority is:

1. Working core user flow
2. Frontend and backend integration
3. Authentication
4. Request management
5. Provider functionality
6. Testing
7. Deployment
8. Documentation
9. Demo preparation

Optional features must not delay the core MVP.