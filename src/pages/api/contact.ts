import type { APIRoute } from "astro";
import { contactEnvFrom, handleContactRequest, sharedContactLimiter } from "../../lib/contact-endpoint";

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let address = "";
  try {
    address = clientAddress;
  } catch {
    address = "";
  }

  return handleContactRequest(request, {
    clientAddress: address,
    env: contactEnvFrom({
      N8N_WEBHOOK_URL: process.env["N8N_WEBHOOK_URL"],
      N8N_WEBHOOK_SECRET: process.env["N8N_WEBHOOK_SECRET"],
      N8N_WEBHOOK_AUTH_HEADER: process.env["N8N_WEBHOOK_AUTH_HEADER"],
    }),
    limiter: sharedContactLimiter,
  });
};
