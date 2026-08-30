import { Resend } from "resend";
import type { ContactFormData } from "./validations/contact";
import { siteConfig } from "./data/site-content";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT || "https://formspree.io/f/meewpbrw";

export async function sendContactNotification(data: ContactFormData) {
  if (resend) {
    try {
      const response = await resend.emails.send({
        from: "TrioCore Contact <onboarding@resend.dev>",
        to: [siteConfig.email],
        subject: `New Lead: ${data.name} - ${data.service}`,
        text: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || "N/A"}\nRequirement: ${data.service}\nMessage:\n${data.message}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #14141A; background-color: #F5F6FC;">
            <h2 style="color: #374BFF;">New Inquiry from TrioCore Website</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone || "N/A"}</p>
            <p><strong>Requirement / Project Type:</strong> ${data.service}</p>
            <p><strong>Project Scope & Goals:</strong></p>
            <blockquote style="background: #FFFFFF; padding: 15px; border-left: 4px solid #374BFF; color: #14141A;">
              ${data.message.replace(/\n/g, "<br/>")}
            </blockquote>
          </div>
        `,
      });
      return { success: true, provider: "resend", id: response.data?.id };
    } catch {
      return sendToFormspree(data);
    }
  }

  return sendToFormspree(data);
}

async function sendToFormspree(data: ContactFormData) {
  try {
    const res = await fetch(formspreeEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone || "Not provided",
        service: data.service,
        message: data.message,
      }),
    });

    if (res.ok) {
      return { success: true, provider: "formspree" };
    }
    return { success: false, error: "Formspree submission failed" };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
