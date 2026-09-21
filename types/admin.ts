export interface AdminInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  service?: string | null;
  budget?: string | null;
  deadline?: string | null;
  message: string;
  status?: string;
  createdAt?: string | Date;
}

export interface AdminClient {
  id: string;
  name: string;
  businessName?: string | null;
  company?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  address?: string | null;
  source?: string | null;
  status?: string;
  notes?: string | null;
  isSample?: boolean;
  createdAt?: string | Date;
}

export interface AdminMilestone {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: string;
  order?: number;
  completedAt?: string | Date | null;
}

export interface AdminProject {
  id: string;
  clientId: string;
  clientName?: string;
  name?: string;
  title?: string;
  category?: string;
  status?: string;
  progress?: number;
  startDate?: string | null;
  deadline?: string | null;
  quotedAmountPaise: number;
  receivedPaise: number;
  earnedPaise?: number;
  pendingPaise: number;
  isPublishedToPortfolio?: boolean;
  isSample?: boolean;
  isOverdue?: boolean;
  milestoneProgressPercent?: number;
  createdAt?: string | Date;
  milestones?: AdminMilestone[];
}

export interface AdminPayment {
  id: string;
  clientId: string;
  clientName?: string;
  projectId?: string | null;
  projectName?: string;
  projectTitle?: string;
  amountPaise: number;
  formattedAmount?: string;
  amountRupees?: number;
  method: string;
  type: string;
  status: string;
  isOverdue?: boolean;
  dueDate?: string | null;
  receivedDate?: string | null;
  paidAt?: string | Date | null;
  reference?: string | null;
  invoiceNumber?: string | null;
  notes?: string | null;
  description?: string | null;
  isSample?: boolean;
  createdAt?: string | Date;
}

export interface AdminExpense {
  id: string;
  title: string;
  description?: string | null;
  amountPaise: number;
  formattedAmount?: string;
  amountRupees?: number;
  category: string;
  date?: string | null;
  paidAt?: string | Date | null;
  paidBy?: string | null;
  projectId?: string | null;
  notes?: string | null;
  isSample?: boolean;
  createdAt?: string | Date;
}

export interface AdminTeamMember {
  id: string;
  userId?: string;
  name: string;
  email?: string | null;
  role: string;
  status?: string;
  canViewFinance?: boolean;
  avatarUrl?: string;
  skills?: string[] | string;
  projects?: { title: string; desc?: string; url?: string }[];
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  order?: number;
  createdAt?: string | Date;
}

export interface AdminEmployee {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  skills?: string[] | string;
  projects?: { title: string; desc?: string; url?: string }[];
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  order?: number;
  createdAt?: string | Date;
}

export interface AdminStat {
  id: string;
  key: string;
  value: string;
  label: string;
  section?: string;
  order?: number;
}

export interface AdminService {
  id: string;
  title: string;
  desc: string;
  badge: string;
  colSpan?: string;
  features: string[];
  accent?: string;
  iconName?: string;
  order?: number;
}

export interface AdminPricingPlan {
  id: string;
  name: string;
  price: string;
  originalPrice?: string | null;
  savings?: string | null;
  period?: string | null;
  badge?: string | null;
  isPopular?: boolean;
  isBestValue?: boolean;
  desc: string;
  features: string[];
  category?: string;
  order?: number;
}

export interface AdminShowcaseProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  liveUrl?: string | null;
  tech: string[];
  status: string;
  category?: string;
  isPublished?: boolean;
  order?: number;
}

export interface AdminFaq {
  id: string;
  question: string;
  answer: string;
  category?: string;
  isHome?: boolean;
  order?: number;
}

export interface AdminLegalDoc {
  id: string;
  slug: string;
  title: string;
  content: string;
  version: string;
  lastUpdated: string | Date;
  updatedBy?: string | null;
}

export interface AdminNote {
  id: string;
  title: string;
  content: string;
  isPinned?: boolean;
  category?: string;
  createdById?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date | null;
}

export interface AdminFeedbackReport {
  id: string;
  type: string;
  message: string;
  email?: string | null;
  status: string;
  internalNotes?: string | null;
  forwardedToFormspree?: boolean;
  consentAt?: string | Date | null;
  createdAt?: string | Date;
}

export interface AdminInvite {
  id: string;
  email: string;
  role: string;
  canViewFinance: boolean;
  tokenHash: string;
  expiresAt: string | Date;
  usedAt?: string | Date | null;
  createdById?: string | null;
  createdAt?: string | Date;
}

export interface AdminSiteContent {
  id: string;
  section: string;
  key: string;
  value: string;
  label: string;
  updatedBy?: string | null;
  updatedAt?: string | Date;
}
