import assert from "node:assert/strict";
import { buildContactPayload } from "../src/lib/contact-payload.ts";

const valid = buildContactPayload({
  name: "  Camille Martin ",
  email: "camille@exemple.fr",
  phone: "",
  company: "Atelier Martin",
  offer: "site-vitrine",
  message: "Bonjour, je voudrais un site.",
  honeypot: "",
});

assert.equal(valid.ok, true);
if (valid.ok) {
  assert.deepEqual(valid.payload, {
    name: "Camille Martin",
    email: "camille@exemple.fr",
    phone: null,
    company: "Atelier Martin",
    offer: "site-vitrine",
    message: "Bonjour, je voudrais un site.",
    source: "neodesign-website",
  });
}

const spam = buildContactPayload({
  name: "Bot",
  email: "bot@exemple.fr",
  phone: "",
  company: "",
  offer: "autre",
  message: "promo",
  honeypot: "https://spam.example",
});
assert.deepEqual(spam, { ok: false, spam: true });

const badMail = buildContactPayload({
  name: "Camille",
  email: "pas-un-email",
  phone: "06",
  company: "",
  offer: "conseil",
  message: "Bonjour",
  honeypot: "  ",
});
assert.equal(badMail.ok, false);
if (!badMail.ok && !badMail.spam) {
  assert.match(badMail.error, /e-mail/);
}

const missing = buildContactPayload({
  name: "",
  email: "a@b.fr",
  phone: "",
  company: "",
  offer: "maintenance",
  message: "",
  honeypot: "",
});
assert.equal(missing.ok, false);

const tooLong = buildContactPayload({
  name: "Camille",
  email: "camille@exemple.fr",
  phone: "",
  company: "",
  offer: "autre",
  message: "a".repeat(5001),
  honeypot: "",
});
assert.equal(tooLong.ok, false);
if (!tooLong.ok && !tooLong.spam) {
  assert.match(tooLong.error, /trop long/);
}

console.log("contact payload ok");
