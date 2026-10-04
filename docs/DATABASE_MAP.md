# TrioCore Database Architecture & Table Map

This document provides a comprehensive, read-only map of all PostgreSQL tables in the TrioCore database schema, their real-world business representations, and an explanation of the DEV versus PRODUCTION branch architecture.

> [!NOTE]
> In accordance with standing rules and database safety standards: **Zero tables, columns, or constraints are renamed, merged, or dropped in this pass.** This map is purely descriptive for architectural clarity.

---

## 1. Table Map by Business Domain

### Content / CMS (Public Site Marketing & Dynamic Content)
- **`site_content`** — Editable marketing copy, hero headlines, subtext, and section blurbs across the public site.
- **`site_stats`** — Numerical studio performance metrics and counter numbers (e.g. 15+ Builds Delivered, 100% Client Code Ownership).
- **`services`** — Core engineering service capabilities with icon identifier, title, description, and feature lists.
- **`pricing_categories`** — Grouping categories for public pricing plans and offerings (e.g. Web Apps, Micro-SaaS, Hardware).
- **`pricing_plans`** — Individual pricing plan tiers, feature checklists, and quoted amounts displayed on the pricing section.
- **`showcase_projects`** — Public portfolio case studies, live demo links, taglines, and showcase grid cards.
- **`team_members`** — Core founder & studio leader profiles, roles, engineering biographies, and avatar image media.
- **`employees`** — Extended contractor and engineering collective roster displayed on the public team section.
- **`faq_categories`** — Categorization buckets for client questions and knowledge base items.
- **`faqs`** — Client questions and answers displayed in accordion format on the public FAQ section.
- **`legal_documents`** — Formal legal policies (Privacy Policy, Terms of Service, Cookie Policy) with markdown content and effective dates.
- **`content_revisions`** — Immutable revision history of past marketing copy changes for instant audit and rollback.
- **`site_settings`** — Global dynamic studio configuration (roadmap milestone progression, launch offer banner, company contact info, monthly revenue goals).

### CRM & Business Operations (TrioCore OS)
- **`clients`** — Client contact information, business name, phone number, email address, and business type classification.
- **`projects`** — Internal client project contracts, quoted amounts, delivery deadlines, and active execution status.
- **`project_members`** — Many-to-many junction assigning studio engineers to specific client projects.
- **`milestones`** — Project delivery phases with percentage weights and status tracking (Done / In Progress / Pending).
- **`payments`** — Financial ledger of incoming client payment tranches with payment method, date, and transaction reference numbers.
- **`expenses`** — Studio operational expenses AND personal member expenses, split by `expense_type` column with reimbursement tracking.
- **`tasks`** — Operational action items and to-do tasks linked to studio delivery projects.
- **`notes`** — Private markdown notes with pinning support for executive reminders and studio documentation.
- **`contacts`** — Inbound customer leads and inquiries submitted through the public website contact forms.
- **`feedback_reports`** — User feedback submissions and bug reports received from the public feedback modal.

### Commercial Billing
- **`bills`** — Formal commercial invoices and printable bills with itemized line items, subtotals, tax/discount tranches, and void states.

### Authentication & Access Control
- **`user`** — Authenticated admin user accounts with primary email, display name, and profile timestamps (Better-Auth).
- **`session`** — Active Better-Auth session tokens with cryptographically signed tokens and expiration timestamps.
- **`account`** — OAuth provider and credential linkage records for user authentication.
- **`verification`** — Email verification tokens and one-time password hashes with expiration timestamps.
- **`admin_members`** — Role-based access control flags (`owner`, `admin`, `member`), finance access permissions (`can_view_finance`), and status.
- **`admin_invites`** — 48-hour single-use cryptographically hashed invite tokens for onboarding new studio engineers.
- **`auth_lockouts`** — IP address and account rate-limiting records to enforce temporary lockouts against brute-force attacks.

### System Auditing
- **`audit_logs`** — Immutable chronological trail of administrative mutations, entity IDs, before/after details, and acting user IDs.

---

## 2. DEV vs PRODUCTION Database Architecture

### What the DEV Branch is For
- **Purpose**: A safe, fully functional clone of the database schema used exclusively during local development, test runs, and continuous validation.
- **Safety Guarantee**: Eliminates the risk of corrupting real commercial ledger data, modifying live client invoices, or generating test notifications to genuine customers.
- **Data Lifecycle**: Frequently receives synthetic fixture data (e.g. test projects, test expense reimbursements, test inquiries). Test scripts automatically scrub synthetic data after execution, but benign testing artifacts may occasionally exist in DEV.

### What the PRODUCTION Branch is For
- **Purpose**: The live, authoritative database backing `triocore.vercel.app` and production TrioCore OS.
- **Contents**: Stores actual commercial client records, genuine payment receipts, approved legal documents, live customer inquiries, and production administrator credentials.
- **Integrity Guarantee**: Zero synthetic test data is ever committed to production. All mutations are subject to strict authentication (`requireAdmin`) and validation schemas (Zod).

---

## 3. Schema Synchronization & Drift Report

| Dimension | DEV Branch | PRODUCTION Branch | Status |
| :--- | :--- | :--- | :--- |
| **Total Tables** | 32 tables | 32 tables | In Sync (1:1 Match) |
| **Applied Migrations** | 0000 through 0007 | 0000 through 0007 | In Sync |
| **Primary Keys & Constraints** | Standardized UUID/text PKs | Standardized UUID/text PKs | In Sync |
| **Personal Expense Split** | `expenses.expense_type` present | `expenses.expense_type` present | In Sync |
| **Allocated Amount Tracking** | `expenses.allocated_amount_paise` | `expenses.allocated_amount_paise` | In Sync |
| **Running Balance Tracking** | `expenses.amount_left_paise` | `expenses.amount_left_paise` | In Sync |
| **Client Classification** | `clients.business_type` constraint | `clients.business_type` constraint | In Sync |
| **Roadmap Storage** | `site_settings` (`key: "roadmap"`) | `site_settings` (`key: "roadmap"`) | In Sync |
| **Company Contact Source** | `site_settings` (`key: "company_email"`) | `site_settings` (`key: "company_email"`) | In Sync |

### Drift Findings
- **Schema Drift**: **None detected.** Both DEV and PRODUCTION have the exact same 32 tables, column schemas, foreign keys, and indexes.
- **Data Drift**: **Intentional and expected.** DEV contains staging test accounts and baseline test fixtures, whereas PRODUCTION contains only real-world studio records.
- **Structural Modernization Recommendation**: Retain current 32-table topology without breaking changes. Any future consolidation (e.g., merging dormant `tasks` or dropping legacy static `faqs.category`) is documented in `docs/DB_CLEANUP.md` and safely deferred until explicit owner sign-off.
