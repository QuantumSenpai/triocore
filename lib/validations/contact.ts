import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().max(20, "Phone number is too long").optional().or(z.literal("")),
  service: z.string().min(1, "Please select what you need"),
  budget: z.string().trim().max(100).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message is too long"),
  companyHp: z.string().max(0, "Bot detected").optional().or(z.literal("")),
});

export type ContactFormData = z.infer<typeof contactSchema>;
