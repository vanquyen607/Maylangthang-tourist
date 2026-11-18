# Security Specification — Mây Lang Thang Firestore

## Phase 0: Data Invariants & PII Boundaries

1. **Public Intake Without Public PII Exposure**:
   - Any visitor may create a document in `/booking_inquiries/{inquiryId}` ONLY when `status == 'pending'`, `createdAt == request.time`, and every field matches exact key, type, regex, and byte/character limits.
   - Because `BookingInquiry` contains PII (`fullName`, `phone`, `note`), unauthenticated visitors and unrelated signed-in users MUST NEVER be able to `get` or `list` other travelers' inquiries.
2. **Ownership Integrity**:
   - If `userId` is included on `/booking_inquiries/{inquiryId}`, the caller MUST be authenticated with a verified email and `incoming().userId == request.auth.uid`.
   - Signed-in users may only `list` documents where `resource.data.userId == request.auth.uid`.
3. **Immutable Audit & Controlled Workflow Transitions**:
   - `createdAt`, `fullName`, `phone`, `tourId`, `tourTitle`, `packageId`, `packageLabel`, `lang`, `note`, and `userId` are immutable once created.
   - Only verified admins (`vanquyen607@gmail.com` with `email_verified == true` or `/admins/{uid}`) may update `/booking_inquiries/{inquiryId}`, and updates are restricted to `['status', 'updatedAt']` with `updatedAt == request.time`.
   - Non-admin updates on terminal status `'archived'` are strictly blocked.
4. **No Self-Promoted Admins**:
   - Clients can never write to `/admins/{userId}` unless already a verified primary admin.

## The "Dirty Dozen" Adversarial Payloads (Must All Return PERMISSION_DENIED)

1. **Ghost/Shadow Field Injection (Create)**: `{ ...validInquiry, isVerified: true, discount: 99 }` -> Rejected by `keys().hasOnly(...)`.
2. **Pre-Confirmed Status Forgery (Create)**: `{ ...validInquiry, status: 'confirmed' }` -> Rejected by `data.status == 'pending'`.
3. **Spoofed Timestamp (Create)**: `{ ...validInquiry, createdAt: '2025-01-01T00:00:00Z' }` -> Rejected by `data.createdAt == request.time`.
4. **UID Impersonation (Create)**: Unauthenticated or UID-A sending `{ ...validInquiry, userId: 'victim-uid' }` -> Rejected by `userId == request.auth.uid`.
5. **Malicious Document ID / Path Poisoning (Create)**: Creating at `/booking_inquiries/../../admins/hacker` or 500-char ID -> Rejected by `isValidId(inquiryId)`.
6. **1MB Payload / Denial-of-Wallet Exhaustion (Create)**: `{ ...validInquiry, note: 'A'.repeat(10000) }` -> Rejected by `note.size() <= 1000`.
7. **Invalid Phone Format Injection (Create)**: `{ ...validInquiry, phone: 'not-a-phone' }` -> Rejected by regex `^(0|\+84)[0-9]{8,10}$`.
8. **Cross-User PII Read (Get)**: Signed-in non-admin User B reads `/booking_inquiries/userA_inquiry` -> Rejected by PII isolation rule.
9. **Blanket Collection Scrape (List)**: Unauthenticated or User B runs `getDocs(collection(db, 'booking_inquiries'))` without `where('userId', '==', uid)` -> Rejected by `allow list`.
10. **Email Spoofing Attack (Admin)**: Account with `email == 'vanquyen607@gmail.com'` and `email_verified == false` attempts admin `list`/`update` -> Rejected by `request.auth.token.email_verified == true`.
11. **Privilege Escalation (Admins Collection)**: Non-admin user attempts `setDoc(doc(db, 'admins', auth.uid), { email: 'attacker@example.com', role: 'admin', createdAt: serverTimestamp() })` -> Rejected by `isPrimaryAdmin()`.
12. **Immutable Field Tampering / Value Poisoning (Update)**: Admin or user attempts `{ status: 'confirmed', phone: '0999999999' }` or `{ status: 12345 }` -> Rejected by `affectedKeys().hasOnly(['status', 'updatedAt'])` and `isValidBookingInquiryUpdate(incoming())`.
