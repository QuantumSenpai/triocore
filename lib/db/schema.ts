import { pgTable, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";

// =============================================================================
// Better-Auth Core Tables
// =============================================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  issuer: text("issuer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =============================================================================
// Admin Access & RBAC
// =============================================================================

export const adminMembers = pgTable("admin_members", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // 'owner' | 'member'
  canViewFinance: boolean("can_view_finance").notNull().default(false),
  status: text("status").notNull().default("active"), // 'active' | 'disabled'
  invitedBy: text("invited_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adminInvites = pgTable("admin_invites", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull(),
  role: text("role").notNull().default("member"),
  canViewFinance: boolean("can_view_finance").notNull().default(false),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdById: text("created_by_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================================================
// Security: DB-backed Rate Limiter / Auth Lockouts
// =============================================================================

export const authLockouts = pgTable("auth_lockouts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(), // HMAC(RATE_LIMIT_SECRET, IP+email) or HMAC(RATE_LIMIT_SECRET, IP)
  ipHash: text("ip_hash").notNull(),
  emailHash: text("email_hash"),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until"),
  lastAttemptAt: timestamp("last_attempt_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================================================
// Public Website & CMS Content Engine
// =============================================================================

export const siteContent = pgTable("site_content", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  section: text("section").notNull(), // 'hero' | 'about' | 'services' | 'pricing' | 'showcase' | 'team' | 'faq' | 'contact' | 'footer' | 'seo' | 'cta'
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  label: text("label").notNull(),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const siteStats = pgTable("site_stats", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  section: text("section").notNull().default("hero"),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  label: text("label").notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  desc: text("desc").notNull(),
  badge: text("badge").notNull(),
  colSpan: text("col_span").notNull().default("lg:col-span-1"),
  features: jsonb("features").$type<string[]>().notNull(),
  accent: text("accent").notNull().default("from-[#374BFF] to-[#14141A]"),
  iconName: text("icon_name").notNull().default("Globe"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pricingPlans = pgTable("pricing_plans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  price: text("price").notNull(),
  originalPrice: text("original_price"),
  savings: text("savings"),
  period: text("period"),
  badge: text("badge"),
  isPopular: boolean("is_popular").notNull().default(false),
  isBestValue: boolean("is_best_value").notNull().default(false),
  desc: text("desc").notNull(),
  features: jsonb("features").$type<string[]>().notNull(),
  category: text("category").notNull().default("websites"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const showcaseProjects = pgTable("showcase_projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  liveUrl: text("live_url"),
  tech: jsonb("tech").$type<string[]>().notNull(),
  status: text("status").notNull().default("Completed"),
  category: text("category").notNull().default("Web"), // 'Web' | 'Apps' | 'NFC' | 'QR menu' | 'ML' | 'Robotics' | 'Other'
  isPublished: boolean("is_published").notNull().default(true),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teamMembers = pgTable("team_members", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  role: text("role").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  skills: jsonb("skills").$type<string[]>().notNull(),
  projects: jsonb("projects").$type<{ title: string; desc?: string; url?: string }[]>().notNull(),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const employees = pgTable("employees", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  role: text("role").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  skills: jsonb("skills").$type<string[]>().notNull(),
  projects: jsonb("projects").$type<{ title: string; desc?: string; url?: string }[]>().notNull(),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const faqs = pgTable("faqs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull().default("general"),
  isHome: boolean("is_home").notNull().default(true),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const legalDocuments = pgTable("legal_documents", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(), // 'privacy-policy' | 'cookie-policy' | 'terms'
  title: text("title").notNull(),
  content: text("content").notNull(),
  version: text("version").notNull().default("2026.1"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  updatedBy: text("updated_by"),
});

export const contentRevisions = pgTable("content_revisions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  section: text("section").notNull(),
  data: jsonb("data").notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================================================
// TrioCore OS: CRM, Projects, Money, Tasks & Feedback
// =============================================================================

export const clients = pgTable("clients", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  businessName: text("business_name"),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  city: text("city"),
  source: text("source"),
  status: text("status").notNull().default("active"), // 'lead' | 'active' | 'completed' | 'archived'
  notes: text("notes"),
  isSample: boolean("is_sample").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clientId: text("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").notNull().default("Web"), // 'Web' | 'Apps' | 'NFC' | 'QR menu' | 'ML' | 'Robotics' | 'Other'
  status: text("status").notNull().default("planning"), // 'planning' | 'design' | 'development' | 'review' | 'delivered' | 'on_hold' | 'cancelled'
  progress: integer("progress").notNull().default(0), // 0 to 100
  startDate: text("start_date"),
  deadline: text("deadline"),
  quotedAmountPaise: integer("quoted_amount_paise").notNull().default(0), // integer paise
  receivedPaise: integer("received_paise").notNull().default(0), // integer paise
  pendingPaise: integer("pending_paise").notNull().default(0), // integer paise
  isPublishedToPortfolio: boolean("is_published_to_portfolio").notNull().default(false),
  isSample: boolean("is_sample").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectMembers = pgTable("project_members", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: text("role").default("developer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const milestones = pgTable("milestones", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: text("due_date"),
  status: text("status").notNull().default("pending"), // 'pending' | 'in_progress' | 'completed'
  order: integer("order").default(0).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clientId: text("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  amountPaise: integer("amount_paise").notNull().default(0), // integer paise
  method: text("method").notNull().default("UPI"), // 'UPI' | 'bank' | 'cash' | 'card' | 'other'
  type: text("type").notNull().default("advance"), // 'advance' | 'milestone' | 'final' | 'retainer'
  status: text("status").notNull().default("pending"), // 'pending' | 'received' | 'overdue'
  dueDate: text("due_date"),
  receivedDate: text("received_date"),
  reference: text("reference"),
  invoiceNumber: text("invoice_number"),
  notes: text("notes"),
  isSample: boolean("is_sample").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  amountPaise: integer("amount_paise").notNull().default(0), // integer paise
  category: text("category").notNull().default("tools"), // 'hosting' | 'domain' | 'tools' | 'software' | 'marketing' | 'travel' | 'other'
  date: text("date").notNull(),
  paidBy: text("paid_by"),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  notes: text("notes"),
  isSample: boolean("is_sample").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: text("priority").notNull().default("medium"), // 'low' | 'medium' | 'high' | 'urgent'
  status: text("status").notNull().default("todo"), // 'todo' | 'in_progress' | 'review' | 'done'
  assigneeId: text("assignee_id").references(() => user.id, { onDelete: "set null" }),
  clientId: text("client_id").references(() => clients.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notes = pgTable("notes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").notNull().default(false),
  category: text("category").notNull().default("general"),
  createdById: text("created_by_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(), // e.g. 'earnings_goal'
  value: jsonb("value").notNull(), // e.g. { targetPaise: 10000000, period: 'monthly', year: 2026, month: 9 }
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  service: text("service").notNull(),
  budget: text("budget"),
  deadline: text("deadline"),
  message: text("message").notNull(),
  status: text("status").notNull().default("Unread"),
  consentAt: timestamp("consent_at"),
  policyVersion: text("policy_version"),
  internalNotes: text("internal_notes"),
  clientId: text("client_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feedbackReports = pgTable("feedback_reports", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  type: text("type").notNull().default("feedback"), // 'bug' | 'feature' | 'feedback' | 'inquiry'
  message: text("message").notNull(),
  email: text("email"),
  status: text("status").notNull().default("unread"), // 'unread' | 'resolved'
  internalNotes: text("internal_notes"),
  forwardedToFormspree: boolean("forwarded_to_formspree").notNull().default(false),
  consentAt: timestamp("consent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
