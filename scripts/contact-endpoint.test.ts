import assert from "node:assert/strict";
import { handleContactRequest, type ContactEnv } from "../src/lib/contact-endpoint.ts";
import { createRateLimiter } from "../src/lib/rate-limit.ts";

const webhookUrl = "https://n8n.example.test/webhook/contact";
const secret = "secret-de-test";

const validBody = {
  name: "  Camille Martin ",
  email: "camille@exemple.fr",
  phone: "",
  company: "Atelier Martin",
  offer: "site-vitrine",
  message: "Bonjour, je voudrais un site.",
  nd_hp: "",
  source: "autre-source",
  webhookUrl: "https://evil.example/hook",
};

function env(partial: Partial<ContactEnv> = {}): ContactEnv {
  return {
    webhookUrl,
    authHeader: "",
    authSecret: "",
    ...partial,
  };
}

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://www.agenceneodesign.com/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function submit(
  body: unknown,
  partial: Partial<ContactEnv> = {},
  extra: {
    headers?: Record<string, string>;
    ip?: string;
    limit?: number;
    now?: number;
    status?: number;
    throw?: boolean;
  } = {},
) {
  const calls: { url: string; init: RequestInit }[] = [];
  const limiter = createRateLimiter(extra.limit ?? 5, 10 * 60 * 1000);
  const response = await handleContactRequest(post(body, extra.headers), {
    clientAddress: extra.ip ?? "203.0.113.10",
    env: env(partial),
    now: extra.now ?? 1_700_000_000_000,
    limiter,
    fetchImpl: async (input, init) => {
      calls.push({ url: String(input), init: init ?? {} });
      if (extra.throw) throw new Error("réseau coupé");
      return new Response("réponse interne", { status: extra.status ?? 200 });
    },
  });
  const json = (await response.json()) as { ok: boolean; error?: string };
  return { response, json, calls };
}

const sent = await submit(validBody, { authHeader: "X-Webhook-Token", authSecret: secret });
assert.equal(sent.response.status, 200);
assert.deepEqual(sent.json, { ok: true });
assert.equal(sent.calls.length, 1);
assert.equal(sent.calls[0].url, webhookUrl);
assert.equal(sent.calls[0].url.includes("jimsvault"), false);
const forwarded = JSON.parse(String(sent.calls[0].init.body));
assert.deepEqual(forwarded, {
  name: "Camille Martin",
  email: "camille@exemple.fr",
  phone: null,
  company: "Atelier Martin",
  offer: "site-vitrine",
  message: "Bonjour, je voudrais un site.",
  source: "neodesign-website",
});
assert.equal("nd_hp" in forwarded, false);
assert.equal(String(sent.calls[0].init.body).includes("autre-source"), false);
const headers = sent.calls[0].init.headers as Record<string, string>;
assert.equal(headers["content-type"], "application/json");
assert.equal(headers.accept, "application/json");
assert.equal(headers["X-Webhook-Token"], secret);
assert.equal(sent.calls[0].init.redirect, "error");
assert.equal(JSON.stringify(sent.json).includes(secret), false);
assert.equal(JSON.stringify(sent.json).includes(webhookUrl), false);

const noAuth = await submit(validBody);
assert.equal(noAuth.response.status, 200);
const noAuthHeaders = noAuth.calls[0].init.headers as Record<string, string>;
assert.equal(noAuthHeaders.Authorization, undefined);
assert.equal(Object.keys(noAuthHeaders).some((key) => key.toLowerCase().includes("auth")), false);

const defaultHeader = await submit(validBody, { authSecret: secret });
const defaultHeaders = defaultHeader.calls[0].init.headers as Record<string, string>;
assert.equal(defaultHeaders.Authorization, secret);

const spam = await submit({ ...validBody, nd_hp: "https://spam.example" });
assert.equal(spam.response.status, 200);
assert.deepEqual(spam.json, { ok: true });
assert.equal(spam.calls.length, 0);

const badOffer = await submit({ ...validBody, offer: "emploi" });
assert.equal(badOffer.response.status, 400);
assert.match(badOffer.json.error ?? "", /offre/);
assert.equal(badOffer.calls.length, 0);

const badMail = await submit({ ...validBody, email: "pas-un-email" });
assert.equal(badMail.response.status, 400);
assert.equal(badMail.calls.length, 0);

const tooLong = await submit({ ...validBody, message: "a".repeat(5001) });
assert.equal(tooLong.response.status, 400);
assert.match(tooLong.json.error ?? "", /trop long/);
assert.equal(tooLong.calls.length, 0);

const badType = await submit({ ...validBody, phone: 612345678 });
assert.equal(badType.response.status, 400);
assert.equal(badType.calls.length, 0);

const missingUrl = await submit(validBody, { webhookUrl: "" });
assert.equal(missingUrl.response.status, 503);
assert.equal(missingUrl.calls.length, 0);
assert.match(missingUrl.json.error ?? "", /indisponible/);

const httpUrl = await submit(validBody, { webhookUrl: "http://n8n.example.test/webhook/contact" });
assert.equal(httpUrl.response.status, 500);
assert.equal(httpUrl.calls.length, 0);

const headerWithoutSecret = await submit(validBody, { authHeader: "X-Webhook-Token", authSecret: "" });
assert.equal(headerWithoutSecret.response.status, 500);
assert.equal(headerWithoutSecret.calls.length, 0);

const badHeader = await submit(validBody, { authHeader: "X-Bad\nHeader", authSecret: secret });
assert.equal(badHeader.response.status, 500);
assert.equal(badHeader.calls.length, 0);

const upstream = await submit(validBody, {}, { status: 500 });
assert.equal(upstream.response.status, 502);
assert.match(upstream.json.error ?? "", /n'a pas abouti/);
assert.equal(JSON.stringify(upstream.json).includes("réponse interne"), false);

const offline = await submit(validBody, {}, { throw: true });
assert.equal(offline.response.status, 502);
assert.equal(offline.calls.length, 1);

const foreign = await submit(validBody, {}, { headers: { origin: "https://evil.example" } });
assert.equal(foreign.response.status, 403);
assert.equal(foreign.calls.length, 0);

const sameOrigin = await submit(validBody, {}, { headers: { origin: "https://www.agenceneodesign.com" } });
assert.equal(sameOrigin.response.status, 200);

const calls: string[] = [];
const limiter = createRateLimiter(2, 60_000);
const now = 1_700_000_000_000;
for (let i = 0; i < 3; i += 1) {
  const response = await handleContactRequest(post(validBody), {
    clientAddress: "203.0.113.44",
    env: env(),
    now: now + i,
    limiter,
    fetchImpl: async (input) => {
      calls.push(String(input));
      return new Response(null, { status: 200 });
    },
  });
  if (i < 2) assert.equal(response.status, 200);
  else {
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("retry-after"), "60");
    const json = (await response.json()) as { ok: boolean };
    assert.equal(json.ok, false);
  }
}
assert.deepEqual(calls, [webhookUrl, webhookUrl]);

const otherIp = await handleContactRequest(post(validBody), {
  clientAddress: "203.0.113.45",
  env: env(),
  now,
  limiter,
  fetchImpl: async () => new Response(null, { status: 200 }),
});
assert.equal(otherIp.status, 200);

const form = new Request("http://127.0.0.1:4321/api/contact", {
  method: "POST",
  headers: {
    "content-type": "application/x-www-form-urlencoded",
    accept: "text/html",
    origin: "http://127.0.0.1:4321",
  },
  body: new URLSearchParams({
    name: "Camille",
    email: "camille@exemple.fr",
    phone: "06 00 00 00 00",
    company: "",
    offer: "conseil",
    message: "Bonjour",
    nd_hp: "",
  }),
});
let formUrl = "";
const formResponse = await handleContactRequest(form, {
  clientAddress: "127.0.0.1",
  env: env(),
  limiter: createRateLimiter(5, 60_000),
  fetchImpl: async (input, init) => {
    formUrl = String(input);
    const payload = JSON.parse(String(init?.body));
    assert.equal(payload.phone, "06 00 00 00 00");
    assert.equal(payload.offer, "conseil");
    assert.equal(payload.company, null);
    assert.equal(payload.source, "neodesign-website");
    return new Response(null, { status: 200 });
  },
});
assert.equal(formResponse.status, 200);
assert.match(formResponse.headers.get("content-type") ?? "", /text\/html/);
assert.match(await formResponse.text(), /Message envoyé/);
assert.equal(formUrl, webhookUrl);

const get = await handleContactRequest(new Request("https://www.agenceneodesign.com/api/contact"), {
  env: env(),
  limiter: createRateLimiter(5, 60_000),
  fetchImpl: async () => {
    throw new Error("ne doit pas être appelé");
  },
});
assert.equal(get.status, 405);

console.log("contact endpoint ok");
