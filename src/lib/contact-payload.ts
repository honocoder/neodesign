export const contactOfferIds = [
  "site-vitrine",
  "maintenance",
  "automatisation",
  "conseil",
  "autre",
] as const;

export type OfferId = (typeof contactOfferIds)[number];

/**
 * Corps JSON envoyé en POST au webhook n8n.
 * Les champs facultatifs vides partent en `null` (pas en chaîne vide).
 *
 * {
 *   "name": "string",
 *   "email": "string",
 *   "phone": "string | null",
 *   "company": "string | null",
 *   "offer": "site-vitrine | maintenance | automatisation | conseil | autre",
 *   "message": "string",
 *   "source": "neodesign-website"
 * }
 *
 * Le champ piège (honeypot) n'est jamais inclus. S'il est rempli, aucun envoi.
 */
export interface ContactPayload {
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  offer: OfferId;
  message: string;
  source: "neodesign-website";
}

export type ContactResult =
  | { ok: true; payload: ContactPayload }
  | { ok: false; spam: true }
  | { ok: false; spam: false; error: string };

const offerIds = new Set<string>(contactOfferIds);

function clean(value: string) {
  return value.trim();
}

export function buildContactPayload(input: {
  name: string;
  email: string;
  phone: string;
  company: string;
  offer: string;
  message: string;
  honeypot: string;
}): ContactResult {
  if (clean(input.honeypot) !== "") {
    return { ok: false, spam: true };
  }

  const name = clean(input.name);
  const email = clean(input.email);
  const phone = clean(input.phone);
  const company = clean(input.company);
  const message = clean(input.message);
  const offer = clean(input.offer);

  if (!name || !email || !message || !offer) {
    return {
      ok: false,
      spam: false,
      error: "Merci de remplir les champs obligatoires.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      ok: false,
      spam: false,
      error: "L'adresse e-mail ne semble pas valide.",
    };
  }

  if (!offerIds.has(offer)) {
    return {
      ok: false,
      spam: false,
      error: "Merci de choisir une offre.",
    };
  }

  return {
    ok: true,
    payload: {
      name,
      email,
      phone: phone || null,
      company: company || null,
      offer: offer as OfferId,
      message,
      source: "neodesign-website",
    },
  };
}
