# Novr Academy API Reference

Backend: Express.js at `http://localhost:4000`
Frontend proxy: `/api/proxy/[...path]` (forwards cookies to backend)

## Authentication

- Server-side: `apiFetch()` in `lib/api.ts` — forwards cookies from Next.js request
- Client-side: `useApi()` / `apiMutate()` in `lib/useApi.ts` — calls `/api/proxy`
- JWT validated via `NEXTAUTH_SECRET` shared between Next.js and Express

---

## Courses

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `GET` | `/courses` | Auth | `?status, search, page, pageSize` | Paginated courses |
| `GET` | `/courses/:id` | Auth | — | Course object |
| `POST` | `/courses` | Admin | `title, description?, thumbnailUrl?, priceCents?, passMarkPct?, allowForwardScrub?, defaultValidityDays?` | Course (201) |
| `PATCH` | `/courses/:id` | Admin | Partial course fields + `status?` | Updated course |
| `DELETE` | `/courses/:id` | Admin | — | 204 |
| `GET` | `/courses/:id/progress` | Auth | — | Lesson unlock/completion state |
| `GET` | `/courses/:id/certificate` | Auth | — | Certificate object |

## Enrollments

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `POST` | `/courses/:id/enroll/free` | Auth | — | Enrollment (201) |
| `POST` | `/courses/:id/enroll/checkout` | Auth | `{ provider }` | `{ checkoutUrl }` |
| `POST` | `/courses/:id/enroll/assign` | Manager+ | `{ email, validityDays? }` | Enrollment (201) |
| `POST` | `/courses/:id/enroll/bulk` | Admin | `{ emails[], validityDays? }` | Bulk result (201) |
| `POST` | `/courses/:id/enroll/cohort` | Admin | `{ cohortId, validityDays? }` | Cohort result (201) |
| `GET` | `/courses/:id/enroll` | Admin | — | Enrollments list |

## Lessons

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `GET` | `/courses/:id/lessons/:lid` | Auth | — | Lesson object |
| `POST` | `/courses/:id/lessons` | Admin | `title, type, contentUrl?, minWatchPct?, durationSeconds?` | Lesson (201) |
| `PATCH` | `/courses/:id/lessons/:lid` | Admin | Partial fields | Updated lesson |
| `DELETE` | `/courses/:id/lessons/:lid` | Admin | — | 204 |
| `POST` | `.../video/upload-url` | Admin | — | `{ uploadId, uploadUrl }` |
| `GET` | `.../video/playback-token` | Auth | — | `{ playbackId, token }` |
| `POST` | `.../heartbeat` | Auth | `{ positionSeconds, durationSeconds }` | Progress |
| `POST` | `.../pdf/upload-url` | Admin | — | `{ uploadUrl }` |
| `GET` | `.../pdf/view-url` | Auth | — | `{ viewUrl, allowDownload }` |
| `POST` | `.../pdf/complete` | Auth | — | Progress |
| `PATCH` | `.../quiz` | Admin | `title?, passMarkPct?, maxAttempts?` | Updated quiz |
| `POST` | `.../quiz/questions` | Admin | `{ type, prompt, ... }` | Question (201) |
| `POST` | `.../quiz/attempts` | Auth | `{ answers }` | Attempt result (201) |
| `GET` | `.../live/join` | Auth | — | `{ roomUrl, token }` |
| `POST` | `.../live/rsvp` | Auth | `{ going }` | RSVP |

## Users

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `GET` | `/users` | Admin/Mgr | `?role, status, search, page, pageSize` | Paginated users |
| `GET` | `/users/:id` | Self/Admin | — | User object |
| `POST` | `/users` | Admin | `email, name?, role?, password?` | User (201) |
| `PATCH` | `/users/:id` | Self/Admin | `name?, role?, status?, bio?` | Updated user |
| `DELETE` | `/users/:id` | Admin | — | 204 |

## Cohorts

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `GET` | `/cohorts` | Admin | — | Cohorts list |
| `POST` | `/cohorts` | Admin | `name, year?, description?` | Cohort (201) |
| `PATCH` | `/cohorts/:id` | Admin | Partial fields | Updated cohort |
| `DELETE` | `/cohorts/:id` | Admin | — | 204 |

## Alumni

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `POST` | `/alumni/import` | Admin | `{ records[] }` | Import result |
| `POST` | `/alumni` | Admin | `fullName, courseName, ...` | Record (201) |
| `GET` | `/alumni` | Admin | `?claimed, search, page` | Paginated list |
| `GET` | `/alumni/claim/:token` | Public | — | Claim info |
| `POST` | `/alumni/claim` | Optional | `{ claimToken, password? }` | `{ userId, email }` |

## Analytics

| Method | Path | Auth | Response |
|--------|------|------|----------|
| `GET` | `/analytics/overview` | Admin | Overview metrics |
| `GET` | `/analytics/lms/course-health` | Admin | Course health data |
| `GET` | `/analytics/lms/drop-off/:courseId` | Admin | Drop-off per lesson |
| `GET` | `/analytics/lms/cohort-performance` | Admin | Cohort metrics |
| `GET` | `/analytics/lms/enrollment-validity` | Admin | Validity data |
| `GET` | `/analytics/community` | Admin | Community data |
| `GET` | `/analytics/revenue` | Admin | Revenue data |

## Groups

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `GET` | `/groups` | Auth | `?type, includeArchived` | Groups list |
| `POST` | `/groups` | Admin | `name, type, courseId?` | Group (201) |
| `POST` | `/groups/:id/join` | Auth | — | Membership |
| `POST` | `/groups/:id/leave` | Auth | — | 204 |

## Posts

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `GET` | `/posts` | Auth | `?groupId, page` | Paginated posts |
| `POST` | `/posts` | Auth | `content, groupId?, visibility?` | Post (201) |
| `POST` | `/posts/:id/react` | Auth | `{ type }` | Toggle result |
| `POST` | `/posts/:id/comments` | Auth | `content` | Comment (201) |

## Messages

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `GET` | `/messages/threads` | Auth | — | Threads list |
| `POST` | `/messages/threads/direct` | Auth | `{ userId }` | Thread (201) |
| `GET` | `/messages/threads/:id/messages` | Auth | — | Messages list |
| `POST` | `/messages/threads/:id/messages` | Auth | `content` | Message (201) |

## Mentors

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `GET` | `/mentors` | Auth | `?topic` | Mentors list |
| `PUT` | `/mentors/me` | Auth | `topics[], availability?` | Mentor profile |
| `POST` | `/mentors/sessions` | Auth | `{ mentorId, topic }` | Session (201) |
| `POST` | `/mentors/sessions/:id/respond` | Auth | `{ accept }` | Updated session |

## Jobs

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `GET` | `/jobs` | Auth | `?status` | Listings list |
| `POST` | `/jobs` | Auth | `title, company, locationType` | Listing (201) |
| `PATCH` | `/jobs/:id/status` | Admin | `{ status }` | Updated listing |

## Events

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `GET` | `/events` | Auth | — | Events list |
| `POST` | `/events` | Auth | `title, startAt` | Event (201) |
| `POST` | `/events/:id/rsvp` | Auth | — | RSVP (201) |

## Notifications

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `GET` | `/notifications` | Auth | — | Notifications list |
| `GET` | `/notifications/unread-count` | Auth | — | `{ count }` |
| `POST` | `/notifications/:id/read` | Auth | — | 204 |
| `POST` | `/notifications/read-all` | Auth | — | 204 |
| `POST` | `/notifications/compose` | Admin | `segment, title, content, channels[]` | Result (201) |

## Bulk Actions

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `POST` | `/bulk/unenroll` | Admin | `{ enrollmentIds[] }` | `{ count }` |
| `POST` | `/bulk/extend-validity` | Admin | `{ enrollmentIds[], additionalDays }` | `{ count }` |
| `POST` | `/bulk/user-status` | Admin | `{ userIds[], status }` | `{ count }` |
| `POST` | `/bulk/assign-cohort` | Admin | `{ userIds[], cohortId }` | `{ count }` |
| `POST` | `/bulk/award-xp` | Admin | `{ userIds[], xpAmount }` | `{ count }` |
| `GET` | `/bulk/export-users` | Admin | `?userIds` | CSV file |

## Reports (CSV downloads)

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/reports/quiz-results` | Admin |
| `GET` | `/reports/course-completion` | Admin |
| `GET` | `/reports/enrollments` | Admin |
| `GET` | `/reports/time-spent` | Admin |
| `GET` | `/reports/revenue` | Admin |
| `GET` | `/reports/community-engagement` | Admin |

## Certificates (Public)

| Method | Path | Auth | Response |
|--------|------|------|----------|
| `GET` | `/certificates/:certUid` | Public | Cert data |
| `GET` | `/certificates/:certUid/pdf` | Public | PDF redirect |

## Badges

| Method | Path | Auth | Response |
|--------|------|------|----------|
| `GET` | `/badges` | Auth | Badges list |
