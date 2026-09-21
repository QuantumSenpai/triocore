import type { ContactFormData } from "./validations/contact";

export async function sendContactNotification(data: ContactFormData) {
  const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT?.trim();
  if (!formspreeEndpoint) {
    return { success: false, error: "FORMSPREE_ENDPOINT not configured in environment" };
  }

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
        budget: data.budget || "Not provided",
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
