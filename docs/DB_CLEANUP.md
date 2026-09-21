# Database Deprecation Plan & Clean-up Architecture (TrioCore OS)

## Executive Summary
This document defines the schema governance, model deprecations, source-of-truth delineations, and future contract migration steps for TrioCore's PostgreSQL database (Neon Serverless).

Following strict production safety standards, **zero destructive changes (no DROP TABLE, DROP COLUMN, or breaking type rewrites) are executed in this pass**. All schema enhancements in Part 8 Step 3 are additive-only and idempotent.

---

## 1. Overlapping Models & Sources of Truth

| Model A | Model B | Active Source of Truth | Legacy / Secondary Role | Current Code Usage | Proposed Future Contract |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `showcase_projects` | `projects` | **Divergent Concerns**: <br>• `showcase_projects` = Public Portfolio <br>• `projects` = Internal CRM Delivery | Neither is legacy; they serve separate domains (Marketing CMS vs. Business Operations). | `showcase_projects`: `components/sections/showcase-grid.tsx`, `lib/dal/content.ts`, `/api/admin/projects`<br>`projects`: `app/admin/dashboard/components/crm-tab.tsx`, `/api/admin/business-projects` | Keep both distinct. Rename `projects` to `client_projects` in future contract for clarity. |
| `team_members` | `employees` | **Divergent Concerns**: <br>• `team_members` = Core Founders (3) <br>• `employees` = Staff / Contractors | Neither is legacy. Marketing site renders founders first, then optionally hired employees. | `team_members`: `components/sections/team-bento.tsx`, `/api/admin/team`<br>`employees`: `components/sections/team-bento.tsx`, `/api/admin/employees` | Retain both. Both editable from Admin CMS. |
| `admin_members` | `user` | **Divergent Concerns**: <br>• `user` = Better-Auth Identity <br>• `admin_members` = RBAC & Access Status | `user` stores credentials; `admin_members` stores role (`owner`, `admin`, `member`) and `status` (`active`, `disabled`). | `user`: `lib/auth.ts`, `lib/auth-guard.ts`<br>`admin_members`: `app/api/admin/team-access`, `lib/auth-guard.ts` | Retain 1:1 foreign key relationship. |
| `contacts` | `clients` | **CRM Pipeline**: <br>• `contacts` = Inbound Inquiries (Leads) <br>• `clients` = Converted Accounts | Inquiries convert to clients via `/api/admin/inquiries/[id]/convert`. | `contacts`: `app/api/contact/route.ts`, `/api/admin/inquiries`<br>`clients`: `/api/admin/clients`, `/api/admin/business-projects` | Retain pipeline relationship (`contacts.client_id` FK). |
| `faqs.category` (text) | `faq_categories` | **`faq_categories` is Source of Truth** | `faqs.category` (text) is legacy static string. | `lib/dal/content.ts` resolves via `COALESCE(faq_categories.name, faqs.category)`. Admin CMS allows selecting category. | In next contract phase: backfill all `category_id`, then drop column `faqs.category`. |
| `site_stats` | `site_content` / `site_settings` | **Specialized Key-Values**: <br>• `site_stats` = Why-Us numbers <br>• `site_content` = Marketing copy <br>• `site_settings` = Operational config | All three serve specialized caching and admin controls. | `site_stats`: `/api/admin/stats`<br>`site_content`: `/api/admin/content`<br>`site_settings`: `/api/admin/settings` | Retain separate tables for isolation. |

---

## 2. Legacy / Unused Tables & Columns

### A. Unused Tables (0 rows, 0 code references)
1. **`tasks`**:
   - **Status**: Dormant table created during initial TrioCore OS schema design.
   - **Current Rows**: 0
   - **Code Reads/Writes**: 0
   - **Recommendation**: Retain in schema as dormant until the task management roadmap is finalized or explicitly approved for removal.
2. **`project_members`**:
   - **Status**: Dormant join table for multi-user project assignment.
   - **Current Rows**: 0
   - **Code Reads/Writes**: 0
   - **Recommendation**: Retain dormant. Future feature can connect `admin_members` to `projects`.

### B. Columns Slated for Contract Modernization
1. **`faqs.category` (text)**:
   - Deprecated in favor of `faqs.category_id -> faq_categories.id`.
   - DAL gracefully handles missing FK with fallback.
2. **`pricing_plans.price` and `original_price` (text)**:
   - Stored as strings (e.g., `"₹9,999"`).
   - Slated for addition of `price_paise` (integer) for automated discount/tax calculations.
3. **Naive `timestamp` columns (52 columns)**:
   - Postgres `timestamp without time zone` columns should be migrated to `timestamp with time zone` (`timestamptz`) in a planned maintenance window to prevent multi-region temporal ambiguity.

---

## 3. Production Data Retention Policy (Audit Logs & Sessions)

1. **Production Audit Logs (`audit_logs`)**:
   - **Policy**: Strictly append-only in production.
   - **Retention Horizon**: 90-day active database retention.
   - **Archival**: Prior to 90-day purge, stream historical logs to S3/Cloudflare R2 cold storage in compressed JSONL format.
   - **Test Clean-up**: Synthetic test runs on DEV (`example.test`, `TEST-*`) must be scrubbed after test runs without touching genuine admin audit entries.
2. **Expired Sessions & Verifications**:
   - Automated weekly cron job: `DELETE FROM verification WHERE expires_at <= NOW() - INTERVAL '7 days'`.
   - Better-Auth sessions: `DELETE FROM session WHERE expires_at <= NOW() - INTERVAL '30 days'`.
3. **Auth Lockouts (`auth_lockouts`)**:
   - Expired lockout records older than 24 hours can be safely purged: `DELETE FROM auth_lockouts WHERE locked_until <= NOW() - INTERVAL '1 day'`.

---

## 4. Future "Contract" Migration Checklist

Do NOT execute without explicit project owner approval:

- [ ] **Phase 1: Dual-Write & Backfill**
  - [ ] Add `price_paise` and `original_price_paise` to `pricing_plans`.
  - [ ] Run migration script to parse string prices into integer paise.
  - [ ] Backfill all `faqs.category_id` from existing `faq_categories` where category names match.
- [ ] **Phase 2: Code Switchover**
  - [ ] Switch pricing DAL to read from `price_paise`.
  - [ ] Switch FAQ queries to exclusively inner join `faq_categories`.
  - [ ] Verify 0 application references to deprecated columns.
- [ ] **Phase 3: Drop Deprecated Artifacts (Contract)**
  - [ ] `ALTER TABLE faqs DROP COLUMN category;`
  - [ ] `ALTER TABLE pricing_plans DROP COLUMN price;`
  - [ ] `ALTER TABLE pricing_plans DROP COLUMN original_price;`
  - [ ] If task management is canceled: `DROP TABLE tasks; DROP TABLE project_members;`
