# NexLMS — Multi-Tenant EdTech & Tuition Management SaaS

**NexLMS** is a modern, multi-tenant Learning & Class Management System engineered for Sri Lankan tuition teachers (solo tutors, undergraduate educators, and small-to-mega tuition institutes). It streamlines classroom attendance, monthly fee collection, financial profit allocation, tutorial distribution, and direct parent engagement from both mobile and desktop devices.

---

## Key Features

### 1. Multi-Tenant Architecture & Security
- **Strict Tenant Isolation:** Every tutor or institute operates within an isolated tenant namespace (`tenantId`), enforced at both the API and MongoDB Atlas Prisma layers.
- **Role-Based Access Control (RBAC):** Edge middleware (`src/middleware.ts`) using `jose` JWT cookies protects routes across roles (`SOLO_TEACHER`, `CLASS_ASSISTANT`, `INSTITUTE_ADMIN`, `CASHIER`, `ATTENDANCE_CHECKER`, `STUDENT`, `PARENT`).
- **Granular Class Assistant Permissions:** Tutors can onboard card-markers or class helpers (`CLASS_ASSISTANT`) with explicit checkboxes for Attendance, Fees, or Tutes while strictly blocking access to financial profit dashboards.
- **Hardened Validation & Rate Limiting:** Zod schema validation with 24-character hex ObjectId verification, Sri Lankan phone normalization (`07X XXX XXXX`), sliding-window rate limiting on auth endpoints, and 30-day non-destructive staff archiving.

### 2. Solo Tutor & Small-Class Management (`/portal/teacher`)
- **Class Cards Grid:** Organize classes (e.g., *Grade 8 - English*, *Grade 9 - Maths*) with real-time student counts, collected fees, and pending dues.
- **Quick Student Enrollment:** Instant `+` modal generates a unique student code (`STU-XXXX`) and a shareable zero-trust Parent Portal URL.
- **Dual Attendance System:**
  - **One-Tap Manual Checklist:** Designed for younger students without mobile phones or forgotten ID cards, complete with instant search and `Absent Only` / `Present Only` filters.
  - **QR / Student Code Scan:** Fast gate/door check-in via student code or QR scan.
- **One-Tap Fee Collection & WhatsApp Reminders:** Mark monthly cash payments in a single tap and send pre-filled `+94` WhatsApp payment reminders to parents with zero SMS gateway fees.

### 3. Optional Tute Hub & Absentee Access Workflow (`/portal/teacher/tutes`)
- Publish monthly or unit-based tutorial PDFs for classes with tutes enabled.
- Parents of absent students can request digital tute access via the Parent Portal; tutors approve requests with a single click to unlock the file for that student.

### 4. Finance & Goal Allocation Planner (`/portal/teacher/finance`)
- Track gross monthly fee income against class expenses (hall rent, tute printing) and personal financial allocations (vehicle leasing, monthly savings).
- Visual breakdown bar calculates **Exact Remaining Net Cash-in-Hand** in real time.

### 5. Two-Way Parent Appointments & Teacher Summons (`/portal/teacher/appointments`)
- **Parent Meeting Requests:** Parents request consultation dates; tutors approve with a confirmed time or propose an alternative date/time.
- **Teacher-Initiated Summons:** Tutors can summon parents regarding academic progress or discipline with an official Parent Portal alert and 1-click WhatsApp notification.

### 6. Zero-Trust Public Parent Portal (`/parent/[studentCode]`)
- Parents access their child's live attendance history, monthly fee status, teacher notices, approved tutes, and appointment booking directly from the Home Page (**Parent View** tab) or via a direct link—verified using the student's code and the parent's registered mobile number (or last 4 digits), requiring no complex password setup.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5 & React 19
- **Database & ORM:** MongoDB Atlas (Replica Set) + Prisma ORM (`v6.4.1`)
- **Styling & UI:** Tailwind CSS v4, Lucide Icons, Full Light & Dark Mode support, Mobile Thumb-Zone Bottom Navigation
- **Security & Validation:** `jose` (Edge JWT), `bcryptjs`, `zod`

---

## Getting Started

### 1. Clone the Repository
```bash
git clone [https://github.com/GayanGC/nexlms.git](https://github.com/GayanGC/nexlms.git)
cd nexlms
