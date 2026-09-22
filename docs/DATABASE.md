 StacStart MVP — Database Structure

 1. Profiles

The `profiles` table stores the basic account information for every registered user.

One user has one profile.

 Table: `profiles`

| Column | Type | Required | Description |
|---|---|---:|---|
| `id` | UUID | Yes | References the authenticated user |
| `full_name` | TEXT | Yes | User's full name |
| `email` | TEXT | Yes | User's email address |
| `phone` | TEXT | No | User's phone number |
| `role` | TEXT | Yes | `customer`, `provider`, or `admin` |
| `avatar_url` | TEXT | No | Profile image URL |
| `created_at` | TIMESTAMP | Yes | Account creation time |
| `updated_at` | TIMESTAMP | Yes | Last profile update |

 Role Rules

A profile can have one of three roles:

- `customer`
- `provider`
- `admin`

 Relationships

`profiles.id`

→ references

`auth.users.id`

The authenticated Supabase user is the source of identity.

 Access Rules

- Users can view public profile information where required.
- Users can update their own profile.
- Users cannot change their role themselves.
- Admin-only operations must be protected.

---

 Database Design Principle

Only create tables and fields that are required by the approved MVP.

Do not add fields simply because they might be useful in the future.
 2. Providers

The `providers` table stores marketplace information for users who provide services.

A provider must have a corresponding record in `profiles`.

 Table: `providers`

| Column | Type | Required | Description |
|---|---|---:|---|
| `id` | UUID | Yes | Unique provider record ID |
| `profile_id` | UUID | Yes | References `profiles.id` |
| `business_name` | TEXT | Yes | Provider or business name |
| `category` | TEXT | Yes | Main service category |
| `bio` | TEXT | No | Short description of the provider |
| `location` | TEXT | No | Provider's service location |
| `profile_image_url` | TEXT | No | Provider profile image |
| `phone` | TEXT | No | Provider contact number |
| `is_verified` | BOOLEAN | Yes | Whether the provider is verified |
| `created_at` | TIMESTAMP | Yes | Provider record creation time |
| `updated_at` | TIMESTAMP | Yes | Last provider profile update |

 Relationship

`providers.profile_id`

→ references

`profiles.id`

One profile can have one provider profile.

 Provider Rules

- Only users with the `provider` role should have a provider record.
- Providers can update their own marketplace information.
- Providers cannot manually mark themselves as verified.
- Verification is controlled by an authorized admin.
- Provider information shown in Discover should come from this table.

 Marketplace Information

The following information can be displayed publicly:

- Business name
- Category
- Bio
- Location
- Profile image
- Verification status
- Provider videos
- Services offered
- Rating information

Private account information should not be exposed unnecessarily.

 3. Services

The `services` table stores the individual services offered by providers.

A provider can offer multiple services.

 Table: `services`

| Column | Type | Required | Description |
|---|---|---:|---|
| `id` | UUID | Yes | Unique service ID |
| `provider_id` | UUID | Yes | References `providers.id` |
| `name` | TEXT | Yes | Service name |
| `description` | TEXT | No | Short service description |
| `price` | DECIMAL | No | Service price |
| `price_type` | TEXT | No | `fixed`, `starting_from`, or `negotiable` |
| `is_active` | BOOLEAN | Yes | Whether the service is currently available |
| `created_at` | TIMESTAMP | Yes | Service creation time |
| `updated_at` | TIMESTAMP | Yes | Last service update |

 Relationship

`services.provider_id`

→ references

`providers.id`

One provider can have many services.

 Service Rules

- A service belongs to one provider.
- Providers can create and manage their own services.
- Customers can view active services.
- Inactive services should not appear as available services.
- A customer request should reference the selected service where applicable.

 Price Rules

The price may be:

- A fixed amount
- A starting price
- Negotiable

The MVP does not require online payment processing.

The displayed price is informational and does not represent a completed payment.

 4. Videos

The `videos` table stores videos uploaded by providers.

Videos are used to showcase a provider's work and appear in the Discover marketplace after approval.

 Table: `videos`

| Column | Type | Required | Description |
|---|---|---:|---|
| `id` | UUID | Yes | Unique video ID |
| `provider_id` | UUID | Yes | References `providers.id` |
| `title` | TEXT | Yes | Video title |
| `description` | TEXT | No | Video description |
| `video_url` | TEXT | Yes | Storage URL of the uploaded video |
| `thumbnail_url` | TEXT | No | Video thumbnail |
| `status` | TEXT | Yes | `pending`, `approved`, or `rejected` |
| `views_count` | INTEGER | No | Number of views |
| `created_at` | TIMESTAMP | Yes | Upload time |
| `updated_at` | TIMESTAMP | Yes | Last update time |

 Relationship

`videos.provider_id`

→ references

`providers.id`

One provider can have many videos.

 Approval Rules

Videos must go through review before appearing publicly.

Possible statuses:

- `pending`
- `approved`
- `rejected`

 Visibility Rules

Only approved videos should appear in:

- Discover Marketplace
- Provider Profile

Pending and rejected videos remain hidden from customers.

 Video Rules

- Providers can upload videos.
- Providers can delete their own videos.
- Providers cannot approve their own videos.
- Approval actions should be restricted to admins.

 5. Service Requests

The `service_requests` table stores requests submitted by customers to providers.

A request represents one service interaction between a customer and a provider.

 Table: `service_requests`

| Column | Type | Required | Description |
|---|---|---:|---|
| `id` | UUID | Yes | Unique request ID |
| `customer_id` | UUID | Yes | References `profiles.id` |
| `provider_id` | UUID | Yes | References `providers.id` |
| `service_id` | UUID | No | References `services.id` |
| `location` | TEXT | Yes | Where the service is requested |
| `description` | TEXT | Yes | Customer's description of the request |
| `preferred_date` | DATE | No | Customer's preferred service date |
| `preferred_time` | TIME | No | Customer's preferred service time |
| `status` | TEXT | Yes | Current request status |
| `created_at` | TIMESTAMP | Yes | Request creation time |
| `updated_at` | TIMESTAMP | Yes | Last request update |

 Relationships

`service_requests.customer_id`

→ references

`profiles.id`

`service_requests.provider_id`

→ references

`providers.id`

`service_requests.service_id`

→ references

`services.id`

A customer can create multiple service requests.

A provider can receive multiple service requests.

 Request Status

The request can have one of these statuses:

- `pending`
- `accepted`
- `declined`
- `in_progress`
- `completed`
- `cancelled`

 Request Flow

```text
Customer
   ↓
Request Service
   ↓
Submit Request
   ↓
Pending
   ↓
Provider Response
   ├── Accepted
   │     ↓
   │  In Progress
   │     ↓
   │  Completed
   │
   └── Declined


    6. Messages

The `messages` table stores chat messages exchanged between a customer and provider for a specific service request.

 Table: `messages`

| Column | Type | Required | Description |
|---|---|---:|---|
| `id` | UUID | Yes | Unique message ID |
| `service_request_id` | UUID | Yes | References `service_requests.id` |
| `sender_id` | UUID | Yes | References `profiles.id` |
| `message` | TEXT | Yes | Message content |
| `created_at` | TIMESTAMP | Yes | Message creation time |

 Relationships

`messages.service_request_id`

→ references

`service_requests.id`

`messages.sender_id`

→ references

`profiles.id`

One service request can have many messages.

 Chat Rules

- Only the customer and provider connected to the request can participate.
- A user can only send messages as themselves.
- Messages belong to a specific service request.
- Users should not be able to access conversations belonging to unrelated requests.
- Messages can be viewed while the request is active.
- Completed, declined and cancelled requests become read-only.
- Existing messages should not be silently modified or deleted during the MVP.

 Basic Flow

```text
Service Request
      ↓
     Chat
      ↓
Customer ↔ Provider
      ↓
Request Completed / Declined / Cancelled
      ↓
Chat becomes Read-Only

 7. Reviews

The `reviews` table stores customer reviews submitted after a service request has been completed.

 Table: `reviews`

| Column | Type | Required | Description |
|---|---|---:|---|
| `id` | UUID | Yes | Unique review ID |
| `service_request_id` | UUID | Yes | References `service_requests.id` |
| `customer_id` | UUID | Yes | References `profiles.id` |
| `provider_id` | UUID | Yes | References `providers.id` |
| `rating` | INTEGER | Yes | Rating from 1 to 5 |
| `comment` | TEXT | No | Optional customer comment |
| `created_at` | TIMESTAMP | Yes | Review creation time |

 Relationships

`reviews.service_request_id`

→ references

`service_requests.id`

`reviews.customer_id`

→ references

`profiles.id`

`reviews.provider_id`

→ references

`providers.id`

 Review Rules

- Only the customer associated with the request can create the review.
- A review can only be created after the request is `completed`.
- Rating must be between 1 and 5.
- Comment is optional.
- One completed service request can have only one review.
- A review cannot be created for a declined or cancelled request.
- Reviews are treated as permanent after submission during the MVP.

 Review Flow

```text
Service Request
      ↓
   Completed
      ↓
Customer submits review
      ↓
Rating: 1–5
      ↓
Optional Comment
      ↓
Review Stored

 8. Notifications

The `notifications` table stores important updates that should be shown to users.

Notifications can be generated when something important happens to a user's account or service request.

 Table: `notifications`

| Column | Type | Required | Description |
|---|---|---:|---|
| `id` | UUID | Yes | Unique notification ID |
| `user_id` | UUID | Yes | References `profiles.id` |
| `type` | TEXT | Yes | Type of notification |
| `title` | TEXT | Yes | Notification title |
| `message` | TEXT | Yes | Notification message |
| `service_request_id` | UUID | No | Related service request |
| `is_read` | BOOLEAN | Yes | Whether the notification has been read |
| `created_at` | TIMESTAMP | Yes | Notification creation time |

 Relationships

`notifications.user_id`

→ references

`profiles.id`

`notifications.service_request_id`

→ references

`service_requests.id`

A user can have many notifications.

A notification may optionally be connected to a service request.

 Notification Types

Possible notification types include:

- `request_received`
- `request_accepted`
- `request_declined`
- `request_completed`
- `new_message`
- `review_received`
- `video_approved`
- `video_rejected`

 Notification Rules

- Users can only view their own notifications.
- Users can mark their own notifications as read.
- Notifications should not expose private information belonging to another user.
- A notification may link the user to the related request or relevant screen.
---

 9. Database Relationships

The main relationships are:

```text
auth.users
    │
    │ 1:1
    ▼
profiles
    │
    │ 1:1
    ▼
providers
    │
    ├───────────────┐
    │               │
    │ 1:N           │ 1:N
    ▼               ▼
services         videos
    │
    │
    │
    └───────────────┐
                    │
                    ▼
             service_requests
              ▲      │       │
              │      │       │
              │      │       ├──────────► messages
              │      │       │
              │      │       └──────────► reviews
              │      │
              │      └──────────► notifications
              │
              │
           profiles
           (customer)


           | Parent             | Child              | Relationship |
| ------------------ | ------------------ | ------------ |
| `auth.users`       | `profiles`         | One-to-one   |
| `profiles`         | `providers`        | One-to-one   |
| `providers`        | `services`         | One-to-many  |
| `providers`        | `videos`           | One-to-many  |
| `profiles`         | `service_requests` | One-to-many  |
| `providers`        | `service_requests` | One-to-many  |
| `services`         | `service_requests` | One-to-many  |
| `service_requests` | `messages`         | One-to-many  |
| `profiles`         | `messages`         | One-to-many  |
| `service_requests` | `reviews`          | One-to-one   |
| `profiles`         | `reviews`          | One-to-many  |
| `providers`        | `reviews`          | One-to-many  |
| `profiles`         | `notifications`    | One-to-many  |
| `service_requests` | `notifications`    | One-to-many  |


User
 ↓
Profile
 ↓
Provider Profile
 ↓
Services + Videos
 ↓
Customer discovers provider
 ↓
Service Request
 ↓
Messages
 ↓
Request Completed
 ↓
Review