import { buildContactPayload, type ContactPayload } from "./contact-payload.ts";
import { createRateLimiter, type RateLimiter } from "./rate-limit.ts";
import { site } from "./site.ts";

const MAX_BODY = 12_000;
const WEBHOOK_HEADER = "X-NeoDesign-Webhook-Token";
const HEADER_VALUE = /^[\t\x20-\x7e]{1,512}$/;

const ALLOWED_ORIGINS = new Set([
  "https://www.agenceneodesign.com",
  "https://agenceneodesign.com",
]);

const unavailable =
  `Le formulaire est momentanément indisponible. Écrivez à ${site.email} ou appelez le ${site.phoneDisplay}.`;
const upstreamError =
  `L'envoi n'a pas abouti. Écrivez à ${site.email} ou appelez le ${site.phoneDisplay}.`;
const rejectedRequest =
  "Le message n'a pas été accepté. Vérifiez les informations saisies, puis réessayez.";
const rateLimited =
  `Trop de messages ont été envoyés depuis cette connexion. Réessayez dans quelques minutes, ou écrivez à ${site.email}.`;

export type ContactEnv = {
  webhookUrl: string;
  authSecret: string;
};

export function contactEnvFrom(source: {
  N8N_WEBHOOK_URL?: string;
  N8N_WEBHOOK_SECRET?: string;
}): ContactEnv {
  return {
    webhookUrl: source.N8N_WEBHOOK_URL?.trim() ?? "",
    authSecret: source.N8N_WEBHOOK_SECRET?.trim() ?? "",
  };
}

export const sharedContactLimiter = createRateLimiter(5, 10 * 60 * 1000);

type JsonBody = { ok: true } | { ok: false; error: string };

type Options = {
  clientAddress?: string;
  env?: ContactEnv;
  fetchImpl?: typeof fetch;
  now?: number;
  limiter?: RateLimiter;
};

function mediaType(request: Request) {
  return (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
}

function wantsHtml(request: Request) {
  if (mediaType(request) === "application/json") return false;
  return (request.headers.get("accept") ?? "").includes("text/html");
}

function originAllowed(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    return origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function reply(html: boolean, status: number, body: JsonBody, extra?: Record<string, string>) {
  const headers: Record<string, string> = {
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    ...extra,
  };

  if (!html) {
    headers["content-type"] = "application/json; charset=utf-8";
    return new Response(JSON.stringify(body), { status, headers });
  }

  const title = body.ok ? "Message envoyé" : "Envoi impossible";
  const text = body.ok
    ? `Message envoyé. Je vous réponds sous ${site.responseTime}. Si c'est urgent, appelez-moi au ${site.phoneDisplay}.`
    : body.error;
  headers["content-type"] = "text/html; charset=utf-8";
  return new Response(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${title} | NeoDesign</title></head><body><main><h1>${title}</h1><p>${text}</p><p><a href="/contact">Retour au formulaire</a></p></main></body></html>`,
    { status, headers },
  );
}

function asField(value: unknown) {
  if (value == null) return "";
  if (typeof value !== "string") return null;
  return value;
}

function fromRecord(record: Record<string, unknown>) {
  const name = asField(record.name);
  const email = asField(record.email);
  const phone = asField(record.phone);
  const company = asField(record.company);
  const offer = asField(record.offer);
  const message = asField(record.message);
  const honeypot = asField(record.nd_hp);
  if (
    name == null ||
    email == null ||
    phone == null ||
    company == null ||
    offer == null ||
    message == null ||
    honeypot == null
  ) {
    return { error: "Le message envoyé n'est pas valide.", status: 400 as const };
  }
  return { name, email, phone, company, offer, message, honeypot };
}

function parseBody(raw: string, type: string) {
  if (type === "application/x-www-form-urlencoded") {
    const params = new URLSearchParams(raw);
    return fromRecord({
      name: params.get("name"),
      email: params.get("email"),
      phone: params.get("phone"),
      company: params.get("company"),
      offer: params.get("offer"),
      message: params.get("message"),
      nd_hp: params.get("nd_hp"),
    });
  }

  if (type !== "application/json" && type !== "") {
    return { error: "Le message envoyé n'est pas valide.", status: 415 as const };
  }

  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { error: "Le message envoyé n'est pas valide.", status: 400 as const };
    }
    return fromRecord(data as Record<string, unknown>);
  } catch {
    return { error: "Le message envoyé n'est pas valide.", status: 400 as const };
  }
}

function resolveWebhook(env: ContactEnv) {
  if (!env.webhookUrl || !env.authSecret) {
    return { ok: false as const, status: 503 as const, log: "contact: configuration incomplète" };
  }

  let url: URL;
  try {
    url = new URL(env.webhookUrl);
  } catch {
    return { ok: false as const, status: 500 as const, log: "contact: webhook invalide" };
  }
  if (url.protocol !== "https:" || !HEADER_VALUE.test(env.authSecret)) {
    return { ok: false as const, status: 500 as const, log: "contact: webhook invalide" };
  }

  return {
    ok: true as const,
    url: url.href,
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      [WEBHOOK_HEADER]: env.authSecret,
    },
  };
}

async function readWebhookResult(upstream: Response) {
  let text = "";
  try {
    text = await upstream.text();
  } catch {
    return "down" as const;
  }
  if (text.length > 4_000) text = text.slice(0, 4_000);

  let data: unknown = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  const record = data && typeof data === "object" && !Array.isArray(data) ? (data as { ok?: unknown; error?: unknown }) : null;
  if (upstream.status === 200 && record?.ok === true) return "sent" as const;
  if (upstream.status === 400 && record?.ok === false && record.error === "invalid_request") return "rejected" as const;
  return "down" as const;
}

export async function handleContactRequest(request: Request, options: Options = {}) {
  const env = options.env ?? contactEnvFrom(process.env);
  const limiter = options.limiter ?? sharedContactLimiter;
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now();
  const html = wantsHtml(request);

  if (request.method !== "POST") {
    return reply(html, 405, { ok: false, error: "Méthode non autorisée." });
  }

  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BODY) {
    return reply(html, 413, { ok: false, error: "Le message est trop long." });
  }

  if (!originAllowed(request)) {
    return reply(html, 403, { ok: false, error: "Le message n'a pas pu être envoyé." });
  }

  const ip = options.clientAddress?.trim() || "unknown";
  const attempt = limiter.attempt(ip, now);
  if (!attempt.ok) {
    return reply(html, 429, { ok: false, error: rateLimited }, {
      "retry-after": String(attempt.retryAfterSeconds),
    });
  }

  let raw = "";
  try {
    raw = await request.text();
  } catch {
    return reply(html, 400, { ok: false, error: "Le message envoyé n'est pas valide." });
  }
  if (raw.length > MAX_BODY) {
    return reply(html, 413, { ok: false, error: "Le message est trop long." });
  }

  const incoming = parseBody(raw, mediaType(request));
  if ("error" in incoming) {
    return reply(html, incoming.status, { ok: false, error: incoming.error });
  }

  const result = buildContactPayload(incoming);
  if (!result.ok && result.spam) {
    return reply(html, 200, { ok: true });
  }
  if (!result.ok) {
    return reply(html, 400, { ok: false, error: result.error });
  }

  const webhook = resolveWebhook(env);
  if (!webhook.ok) {
    console.error(webhook.log);
    return reply(html, webhook.status, { ok: false, error: unavailable });
  }

  const payload: ContactPayload = result.payload;
  try {
    const upstream = await fetchImpl(webhook.url, {
      method: "POST",
      headers: webhook.headers,
      body: JSON.stringify(payload),
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
    const outcome = await readWebhookResult(upstream);
    if (outcome === "rejected") {
      console.error("contact: demande refusée");
      return reply(html, 400, { ok: false, error: rejectedRequest });
    }
    if (outcome !== "sent") {
      console.error("contact: webhook indisponible");
      return reply(html, 502, { ok: false, error: upstreamError });
    }
  } catch {
    console.error("contact: webhook indisponible");
    return reply(html, 502, { ok: false, error: upstreamError });
  }

  return reply(html, 200, { ok: true });
}
