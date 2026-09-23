DISCOVER — MVP TECHNICAL ARCHITECTURE

1. Architecture Goal

The MVP should use a simple architecture that the team can build, understand, test and deploy during Build Week.

The architecture should support the core Discover marketplace and booking workflow without unnecessary complexity.

2. High-Level Architecture

User
  ↓
React + TypeScript Web App
  ↓
Supabase
  ├── Authentication
  ├── PostgreSQL Database
  └── Storage
        ↓
   Provider Videos


3. Frontend

The frontend is responsible for:

- Discover marketplace
- Search and filtering
- Provider profiles
- Provider videos
- Authentication
- Customer bookings
- Provider dashboard
- Booking management
- Comments
- Reviews
- Account settings
- Provider verification
- Admin verification interface

The frontend communicates with Supabase for authentication, database operations and storage.

4. Authentication

Supabase Authentication manages registered users.

The main user roles are:

- Customer
- Provider
- Admin

Guests can browse Discover without signing in.

Authentication is required for account-based actions such as submitting a booking.

Customers can later convert their account to a provider account through the provider setup flow.

5. User Profiles

Every registered user has a profile.

Customer profiles contain basic account information.

Provider profiles contain additional marketplace information such as:

- Business name
- Category
- Location
- Phone number
- Profile information
- Services
- Videos
- Verification status

6. Provider Dashboard

Providers have access to a Provider Dashboard.

The dashboard allows providers to:

- View service requests
- Manage bookings
- Upload and manage videos
- View reviews
- Edit their profile
- Manage verification information

7. Provider Verification

Verification is handled through Account Settings.

Tier 1 verification requires:

- Business name
- Identification document
- Location
- Phone number

The provider submits the information and identification document.

The admin manually reviews the submission.

Approved providers receive a verification badge.

8. Admin

Admin functionality is kept simple for the MVP.

The main administrative responsibility is provider verification.

Admin can:

- View verification submissions
- Review identification documents
- Approve verification
- Reject verification

Admin-only functionality must be protected.

9. Provider Videos

Providers can upload and manage videos.

Videos are stored using Supabase Storage.

A video record is stored in the database.

The application should follow the agreed moderation/approval flow before displaying videos publicly.

Approved videos can appear in:

- Discover
- Provider Profile

10. Booking Architecture

Customer

  ↓

Provider Profile

  ↓

Book / Request Service

  ↓

Booking Form

  ↓

Create Service Request

  ↓

Pending

  ↓

Provider Response

  ├── In Progress
  │      ↓
  │   Completed
  │
  └── Declined
         ↓
   Rejection Reason

The provider must provide a rejection reason when declining a request.

11. Booking Data

A booking connects:

- Customer
- Provider
- Service
- Location
- Request details
- Preferred date/time where supported
- Booking status

The exact fields should follow the final UI design.

12. Comments and Reviews

Comments and reviews are part of the marketplace experience.

Reviews are connected to completed bookings.

Customers can provide:

- 1–5 star rating
- Optional comment

Reviews should only be submitted after a completed booking.

Social sharing is not part of the MVP.

13. Notifications

Notifications may be used for important events such as:

- New booking request
- Booking status changes
- New message or communication
- Verification status
- Review activity

The exact notification implementation should remain simple enough for the Build Week timeline.

14. Database

Supabase PostgreSQL stores application data.

The initial database entities are:

- Profiles
- Providers
- Services
- Videos
- Service Requests
- Messages
- Reviews
- Notifications

The database structure is documented separately in DATABASE.md.

15. Storage

Supabase Storage is used for uploaded media such as:

- Provider videos
- Profile images
- Verification documents where required

Sensitive documents such as identification documents must not be publicly accessible.

16. Security

Security requirements:

- Never expose private keys in frontend code.
- Use environment variables for credentials.
- Use Supabase Row Level Security where required.
- Users should only access information they are authorized to access.
- Customers should only manage their own bookings.
- Providers should only manage bookings assigned to them.
- Providers should not approve their own verification.
- Admin functions must be protected.
- Verification documents must be protected from public access.
- No secrets should be committed to GitHub.

17. Application Structure

The frontend is organized into clear areas:

src/
├── components/
├── layouts/
├── pages/
├── hooks/
├── lib/
├── services/
├── types/
└── assets/

The structure can be adjusted during implementation if a simpler approach is required.

18. Development Approach

The team will build the MVP in small, testable parts.

Abubakar and Adam handle development.

Desmond performs daily user testing and identifies bugs using smartphone devices.

Development progress should be pushed to GitHub daily.

19. Deployment

The application must be deployed to a public URL before final submission.

The production setup should contain:

- Production frontend
- Supabase project
- Production environment variables
- Production database configuration

20. Architecture Principle

Build the simplest architecture that can support the agreed MVP.

Do not introduce:

- Microservices
- Multiple unnecessary databases
- Complex infrastructure
- Unnecessary APIs
- Large state-management systems
- Unnecessary third-party services

The architecture can be improved after the hackathon.