 StacStart MVP — Technical Architecture

 1. Architecture Goal

The MVP should use a simple architecture that is easy for the team to build, understand, test and deploy during Build Week.

The system should avoid unnecessary complexity.

---

 2. High-Level Architecture

User
  ↓
React Web App
  ↓
Supabase
  ├── Authentication
  ├── PostgreSQL Database
  └── Storage
        ↓
   Provider Videos


 3. Frontend

The frontend is responsible for:

- Marketplace / Discover
- Search and filtering
- Provider profiles
- Video display
- Authentication screens
- Customer request screens
- Booking/request management
- Provider Hub
- Chat interface
- Reviews
- Account screens

The frontend communicates with Supabase for authentication, database operations and storage.

---

 4. Authentication

Supabase Authentication will manage user authentication.

Users can register and sign in.

Each authenticated user has a profile containing their basic account information and role.

Possible roles:

- Customer
- Provider
- Admin

Guest users can browse the marketplace without authentication.

Authentication is required when a guest attempts to perform an action that requires an account, such as submitting a service request.

---

 5. Database

Supabase PostgreSQL will store application data.

Main entities:

- Users / Profiles
- Providers
- Services
- Videos
- Service Requests
- Messages
- Reviews
- Notifications

Relationships should remain simple and follow the actual product requirements.

---

 6. Storage

Supabase Storage will be used for uploaded media such as:

- Provider videos
- Profile images
- Other approved media if required

Public marketplace videos should only be displayed after the required approval process.

---

 7. Provider Video Architecture

Provider

  ↓

Upload Video

  ↓

Storage

  ↓

Video Record Created

  ↓

Pending Review

  ↓

Admin Review

  ↓

Approved / Rejected

 Approved

Video becomes visible in:

- Discover
- Provider Profile

 Rejected

Video remains unavailable to customers.

The provider can correct and resubmit where supported.

---

 8. Service Request Architecture

Customer

  ↓

Provider Profile

  ↓

Request Service

  ↓

Request Form

  ↓

Create Service Request

  ↓

Pending

  ↓

Provider Reviews Request

  ↓

Accepted / Declined

 Accepted

Accepted

  ↓

In Progress

  ↓

Completed

 Declined

Request becomes read-only.

 Cancelled

Request becomes read-only.

---

 9. Chat Architecture

Chat belongs to a specific service request.

Customer and Provider can communicate while the request is active.

Basic structure:

Service Request

  ↓

Messages

  ├── Customer
  └── Provider

When the request becomes completed, cancelled or declined, the conversation becomes read-only.

---

 10. Review Architecture

Reviews are connected to completed service requests.

Flow:

Completed Request

  ↓

Customer submits review

  ↓

Rating: 1–5

  ↓

Optional Comment

  ↓

Review Stored

Reviews cannot be created before a request is completed.

A completed request should not allow unlimited duplicate reviews.

---

 11. Application Structure

The frontend should be organized into clear areas.

Example:

src/
├── components/
├── pages/
├── layouts/
├── hooks/
├── services/
├── lib/
├── types/
└── assets/

The exact structure may change during implementation if a simpler structure is more practical.

---

 12. Data Flow

 Reading Marketplace Data

React App

  ↓

Supabase Query

  ↓

Providers / Videos / Services

  ↓

React UI


 Creating a Request

React App

  ↓

Request Form

  ↓

Supabase Insert

  ↓

Service Request

  ↓

Provider Dashboard


 Sending a Message

React App

  ↓

Chat

  ↓

Supabase Insert

  ↓

Messages

  ↓

Other User


---

 13. Security

Security requirements:

- Never expose private keys in frontend code.
- Use environment variables for credentials.
- Use Supabase Row Level Security where required.
- Users should only access data they are authorized to access.
- Customers should only manage their own requests.
- Providers should only manage requests assigned to them.
- Admin functions must be protected.

No secrets should be committed to GitHub.

---

 14. Deployment

The frontend should be deployed to a suitable web hosting platform.

The production environment should contain:

- Production frontend
- Supabase project
- Environment variables
- Production database configuration

The deployed application must be accessible through a public URL before final submission.

---

 15. Development Principle

Build the simplest architecture that can successfully support the MVP.

Do not introduce:

- Microservices
- Unnecessary APIs
- Complex state-management systems
- Extra databases
- Unnecessary third-party services
- Complex infrastructure

unless the actual implementation requires them.

The architecture can be improved after the hackathon.

---

 16. Build Priority

 P0

- Frontend foundation
- Authentication
- Marketplace
- Provider profiles
- Service requests
- Request status
- Provider request management

 P1

- Video upload
- Admin approval
- Chat
- Reviews
- Notifications

 P2

- Advanced AI
- Payments
- Advanced recommendations
- Advanced analytics
- Other non-essential integrations