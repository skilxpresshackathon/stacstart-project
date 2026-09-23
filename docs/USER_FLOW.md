 Discover — MVP User Flow

 1. Marketplace Entry

User opens Discover.

        ↓

Discover / Marketplace

        ↓

Browse provider videos and service cards

        ↓

Search / Filter

        ↓

Provider Results

        ↓

Provider Profile

        ↓

Book / Request Service


 2. Guest User Flow

Guest

  ↓

Discover

  ↓

Search / Filter

  ↓

View Provider

  ↓

Watch Provider Video

  ↓

View Provider Profile

  ↓

Book / Request Service

  ↓

Login Required

  ↓

Sign In / Sign Up

  ↓

Continue Booking

  ↓

Submit Request


 3. Customer Flow

Customer signs in

        ↓

Discover

        ↓

Find Provider

        ↓

Provider Profile

        ↓

Book / Request Service

        ↓

Booking Form

        ↓

Submit Request

        ↓

Pending

        ↓

Provider Response

        ↓

Accepted / In Progress
        OR
Declined + Rejection Reason

 If Accepted

Pending

  ↓

In Progress

  ↓

Completed

  ↓

Customer Review

  ↓

Rating + Optional Comment


 4. Customer Booking Management

My Bookings

        ↓

View Bookings

        ↓

Select Booking

        ↓

Booking Details

        ↓

View Status

        ↓

Comments / Communication

        ↓

Track Progress


 5. Customer → Provider Conversion

Customer

  ↓

Account

  ↓

Become a Provider

  ↓

Provide Additional Provider Information

  ↓

Complete Provider Setup

  ↓

Provider Experience

  ↓

Provider Dashboard


 6. Provider Flow

Provider signs in

        ↓

Provider Dashboard

        ↓

View Incoming Requests

        ↓

Open Booking

        ↓

Review Customer Request

        ↓

Accept
  OR
Decline


 If Accepted

Accepted

  ↓

In Progress

  ↓

Communicate with Customer

  ↓

Complete Service

  ↓

Completed


 If Declined

Decline

  ↓

Enter Rejection Reason

  ↓

Submit

  ↓

Customer sees Declined status + reason


 7. Provider Dashboard

Provider Dashboard

        ├── Service Requests
        │
        ├── Videos
        │
        ├── Profile
        │
        ├── Reviews
        │
        └── Verification


 8. Provider Video Flow

Provider Dashboard

        ↓

Videos

        ↓

Upload Video

        ↓

Manage Videos

        ↓

Video Approval / Moderation Flow

        ↓

Approved

        ↓

Discover Marketplace

        ↓

Provider Profile


 9. Tier 1 Verification Flow

Provider

  ↓

Account Settings

  ↓

Verification

  ↓

Tier 1 Verification

  ↓

Provide:

- Business Name
- Identification Document
- Location
- Phone Number

  ↓

Submit

  ↓

Admin Review

  ↓

Approved / Rejected


 If Approved

Approved

  ↓

Verification Badge


 If Rejected

Rejected

  ↓

Provider sees verification status

  ↓

Provider can correct information and resubmit where supported


 10. Admin Verification Flow

Admin

  ↓

Admin Dashboard

  ↓

Verification Requests

  ↓

Open Provider Submission

  ↓

Review:

- Business Name
- Identification Document
- Location
- Phone Number

  ↓

Approve
  OR
Reject


 Approve

Approve

  ↓

Provider becomes verified

  ↓

Verification Badge


 Reject

Reject

  ↓

Provider remains unverified


 11. Review Flow

Completed Booking

        ↓

Customer can review provider

        ↓

Select 1–5 Stars

        ↓

Optional Comment

        ↓

Submit Review

        ↓

Review Stored


 12. Comments

Comments are part of the product's engagement experience.

Comments should support the marketplace's focus on:

- Provider work
- Reviews
- Booking workflows

Social sharing is not part of the MVP.


 13. Navigation

 Customer

Discover
My Bookings
Alerts
Account


 Provider

Discover
My Bookings
Provider Dashboard
Account


 Admin

Admin Dashboard
Verification Requests
Other required administrative functions


 14. Booking State Flow

```text
                 ┌───────────┐
                 │  Pending  │
                 └─────┬─────┘
                       │
              ┌────────┴────────┐
              ↓                 ↓
        In Progress          Declined
              │                 │
              ↓                 ↓
          Completed       Rejection Reason
              │
              ↓
           Review

           Discover
   ↓
Search / Filter
   ↓
Provider Profile
   ↓
Book / Request Service
   ↓
Sign In / Sign Up
   ↓
Submit Booking
   ↓
Pending
   ↓
Provider Response
   ↓
In Progress
   ↓
Completed
   ↓
Review