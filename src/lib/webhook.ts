/**
 * Webhook n8n qui reçoit le formulaire.
 * À changer ici, ou via la variable publique PUBLIC_CONTACT_WEBHOOK.
 *
 * Ne pas envoyer de requête de test : cette URL alimente le pipeline réel.
 */
export const CONTACT_WEBHOOK_URL =
  import.meta.env.PUBLIC_CONTACT_WEBHOOK ||
  "https://n8n.jimsvault.tech/webhook/heyform-submissions";
