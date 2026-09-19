# Security Specification - Cervejaria Guanandi

## Data Invariants
- Leads must have a valid name, WhatsApp, and date.
- Only users listed in the `admins` collection can access the dashboard and manage data.
- Leads are initially created with status 'novo'.
- Timestamps (createdAt, updatedAt) must be server-side.

## The "Dirty Dozen" Payloads (Denial Scenarios)
1. **Lead Spoofing**: Attempting to create a lead with a fake `createdAt` timestamp.
2. **Unauthorized Lead Read**: A non-admin user trying to list all leads.
3. **Admin Privilege Escalation**: A user trying to create a document in the `admins` collection for themselves.
4. **Invalid Lead Status**: Creating a lead with status 'concluido' directly.
5. **Setting Sabotage**: A non-admin trying to change the company WhatsApp number.
6. **Malicious ID Injection**: Using a 2KB string as a lead ID.
7. **Bypassing Validation**: Submitting a lead with a 5000-character name.
8. **Catalog Vandalism**: Deleting a beer product as an unauthenticated user.
9. **Lead Data Modification**: An attacker trying to change the email of an existing lead.
10. **Query Scraping**: Attempting to query all leads without being an admin.
11. **Timestamp Manipulation**: Updating `updatedAt` to a past date.
12. **Enum Violation**: Setting a lead `contactPreference` to "telepathy".

## Rules Logic
- `match /leads/{leadId}`: `allow create: if isValidLead(incoming())`; `allow read, update, delete: if isAdmin()`.
- `match /beers/{beerId}`: `allow read: if true`; `allow write: if isAdmin()`.
- `match /tents/{tentId}`: `allow read: if true`; `allow write: if isAdmin()`.
- `match /settings/config`: `allow read: if true`; `allow write: if isAdmin()`.
- `match /admins/{userId}`: `allow read: if isSignedIn() && request.auth.uid == userId`; `allow write: if false`.
