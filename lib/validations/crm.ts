import { z } from "zod";

// =============================================================================
// Inquiries Validations
// =============================================================================

export const inquiryEditSchema = z.object({
  id: z.string().min(1, "Inquiry ID is required"),
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().max(20).optional().nullable(),
  service: z.string().trim().min(1, "Service is required"),
  budget: z.string().trim().max(100).optional().nullable(),
  message: z.string().trim().min(1, "Message is required").max(5000),
  status: z.enum(["Unread", "Contacted", "Converted", "Archived", "unread", "contacted", "converted", "archived"]),
});

export type InquiryEditData = z.infer<typeof inquiryEditSchema>;

// =============================================================================
// Projects Validations
// =============================================================================

export const projectStatusValues = [
  "planning",
  "design",
  "development",
  "review",
  "delivered",
  "on_hold",
  "cancelled",
] as const;

export const projectEditSchema = z.object({
  id: z.string().min(1, "Project ID is required"),
  clientId: z.string().min(1, "Client ID is required"),
  name: z.string().trim().min(1, "Project name is required").max(150),
  category: z.string().trim().min(1, "Category is required"),
  quotedAmountPaise: z.number().int().nonnegative("Quoted amount must be non-negative"),
  deadline: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  status: z.enum(projectStatusValues),
  assignedMemberIds: z.array(z.string()).optional(),
});

export type ProjectEditData = z.infer<typeof projectEditSchema>;

// =============================================================================
// Milestones Validations
// =============================================================================

export const milestoneEditSchema = z.object({
  id: z.string().min(1, "Milestone ID is required"),
  title: z.string().trim().min(1, "Milestone title is required").max(200).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  dueDate: z.string().nullable().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  order: z.number().int().optional(),
});

export type MilestoneEditData = z.infer<typeof milestoneEditSchema>;

// =============================================================================
// Payments Validations
// =============================================================================

export const paymentEditSchema = z.object({
  id: z.string().min(1, "Payment ID is required"),
  amountPaise: z.number().int().positive("Payment amount must be greater than zero"),
  method: z.string().trim().min(1, "Payment method is required"),
  receivedDate: z.string().nullable().optional(),
  reference: z.string().trim().max(100).optional().nullable(),
  projectId: z.string().nullable().optional(),
  clientId: z.string().nullable().optional(),
  status: z.enum(["received", "pending", "overdue"]),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export type PaymentEditData = z.infer<typeof paymentEditSchema>;

// =============================================================================
// Expenses Validations
// =============================================================================

export const expenseTypeValues = ["studio", "personal"] as const;

export const expenseCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  category: z.string().trim().min(1, "Category is required"),
  amountPaise: z.number().int().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  paidBy: z.string().trim().optional().nullable(),
  projectId: z.string().optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  expenseType: z.enum(expenseTypeValues).default("studio"),
  memberId: z.string().optional().nullable(),
  isReimbursed: z.boolean().default(false),
}).refine(
  (data) => {
    if (data.expenseType === "personal" && !data.memberId) {
      return false;
    }
    return true;
  },
  {
    message: "memberId is required for personal expenses",
    path: ["memberId"],
  }
);

export const expenseEditSchema = z.object({
  id: z.string().min(1, "Expense ID is required"),
  title: z.string().trim().min(1, "Title is required").max(200).optional(),
  category: z.string().trim().min(1, "Category is required").optional(),
  amountPaise: z.number().int().positive("Amount must be positive").optional(),
  date: z.string().min(1, "Date is required").optional(),
  paidBy: z.string().trim().optional().nullable(),
  projectId: z.string().optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  expenseType: z.enum(expenseTypeValues).optional(),
  memberId: z.string().optional().nullable(),
  isReimbursed: z.boolean().optional(),
});

export type ExpenseCreateData = z.infer<typeof expenseCreateSchema>;
export type ExpenseEditData = z.infer<typeof expenseEditSchema>;

// =============================================================================
// Clients Validations
// =============================================================================

export const clientTypeValues = ["Company", "Brand", "Startup", "Individual"] as const;

export const clientCreateSchema = z.object({
  name: z.string().trim().min(1, "Client name is required").max(100),
  email: z.string().trim().email("Invalid email").optional().nullable().or(z.literal("")),
  phone: z.string().trim().optional().nullable(),
  company: z.enum(clientTypeValues).optional().nullable().or(z.literal("")),
  businessName: z.enum(clientTypeValues).optional().nullable().or(z.literal("")),
  address: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  status: z.enum(["active", "inactive", "lead", "completed", "archived"]).default("active"),
});

export const clientEditSchema = z.object({
  id: z.string().min(1, "Client ID is required"),
  name: z.string().trim().min(1, "Client name is required").max(100),
  email: z.string().trim().email("Invalid email").optional().nullable().or(z.literal("")),
  phone: z.string().trim().optional().nullable(),
  company: z.enum(clientTypeValues).optional().nullable().or(z.literal("")),
  businessName: z.enum(clientTypeValues).optional().nullable().or(z.literal("")),
  address: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  status: z.enum(["active", "inactive", "lead", "completed", "archived"]).default("active"),
});


export type ClientCreateData = z.infer<typeof clientCreateSchema>;
export type ClientEditData = z.infer<typeof clientEditSchema>;

