# Security Specification for ZenPet

## Data Invariants
1. A user can only access their own profile data, pets, and sessions.
2. Pet health must be between 0 and 100.
3. Timestamps like `createdAt` must be set to the server time during creation and remain immutable.
4. `updatedAt` must be updated to the server time on every write.

## The Dirty Dozen Payloads
1. **Unauthorized Access:** Try to read another user's profile.
2. **Identity Spoofing:** Create a pet with a different `userId`.
3. **Ghost Field Injection:** Add `isAdmin: true` to a user profile.
4. **Invalid Range:** Set pet health to `150`.
5. **Path Poisoning:** Use a long string with special characters as `userId`.
6. **Future Entry:** Set `createdAt` to a future date.
7. **Bypass Relational Auth:** Move a pet from one user to another.
8. **Malicious Query:** List all sessions across all users.
9. **State Shortcut:** Directly level up a pet without earning EXP.
10. **Type Poisoning:** Send a string for `duration` in a session.
11. **Shadow Update:** Update `email` on a session document (field doesn't exist).
12. **Denial of Wallet:** Create a 1MB string in the `name` field of a pet.

## Test Runner (Draft)
```typescript
import { assertFails, assertSucceeds, initializeTestApp } from '@firebase/rules-unit-testing';

// ... tests for the above payloads ...
```
