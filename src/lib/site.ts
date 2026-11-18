export const site = {
  name: "NeoDesign",
  tagline: "Sites web et automatisation près d'Amiens",
  url: "https://www.agenceneodesign.com",
  email: "bonjour@agenceneodesign.com",
  phoneDisplay: "07 82 73 22 79",
  phoneHref: "tel:+33782732279",
  phoneSchema: "+33782732279",
  street: "4 rue du Bâtonnier Mahiu",
  postalCode: "80000",
  city: "Amiens",
  siren: "980 377 220",
  /** Délai repris de l'ancienne page tarifs. À confirmer. */
  responseTime: "48 h ouvrées",
  owner: "Jimy Marletta",
} as const;

const maintenanceCommonPoints = [
  "Mises à jour du CMS, des extensions et des thèmes",
  "Sécurité",
  "Surveillance de la disponibilité du site",
] as const;

const weeklyBackups = "Sauvegardes hebdomadaires du site et de la base de données";

const maintenancePlans = [
  {
    name: "Essentiel",
    monthlyPrice: 70,
    points: [
      ...maintenanceCommonPoints,
      "1 h de modifications par mois",
      weeklyBackups,
      "Prise en charge sous 72 h ouvrées",
    ],
  },
  {
    name: "Sérénité",
    monthlyPrice: 120,
    points: [
      ...maintenanceCommonPoints,
      "2 h de modifications par mois",
      weeklyBackups,
      "Prise en charge sous 48 h ouvrées",
      "Petit bilan mensuel",
    ],
  },
  {
    name: "Pro",
    monthlyPrice: 240,
    points: [
      ...maintenanceCommonPoints,
      "4 h de modifications par mois sur le site ou les automatisations",
      "Sauvegardes quotidiennes du site et de la base de données",
      "Prise en charge prioritaire sous 24 h ouvrées",
      "Bilan mensuel",
      "Point trimestriel de 30 min",
      "Suivi de la fiche Google Business Profile (horaires, infos, photos)",
    ],
  },
] as const;

export const maintenanceTiers = maintenancePlans.map(({ name, monthlyPrice, points }) => ({
  name,
  price: `${monthlyPrice}\u202f€`,
  unit: "/mois",
  points,
}));

export const maintenanceNotes = [
  "Temps supplémentaire hors forfait à 70\u202f€/h.",
  "Les heures non utilisées ne se reportent pas d'un mois sur l'autre.",
  "Engagement minimum de 3 mois.",
  "Pour un site non réalisé par NeoDesign, audit de reprise à 150\u202f€ avant souscription.",
  "Google Ads est hors forfait. La conception et la gestion sont sur devis, et vous payez directement le budget publicitaire.",
] as const;

const maintenancePrices = maintenanceTiers.map(({ name, price }) => `${name} ${price}`).join(", ");

export const offers = [
  {
    id: "site-vitrine",
    index: "01",
    name: "Site Web",
    href: "/services/site-vitrine",
    contact: "/contact?offre=site-vitrine",
    from: "1\u202f200\u202f€",
    unit: "",
    cadence: "",
    summary:
      "Vitrine ou boutique : un site rapide, clair, facile à mettre à jour, pensé pour être trouvé et pour recevoir des demandes.",
  },
  {
    id: "maintenance",
    index: "02",
    name: "Maintenance et sécurité",
    href: "/services/maintenance",
    contact: "/contact?offre=maintenance",
    from: maintenanceTiers[0].price,
    unit: maintenanceTiers[0].unit,
    cadence: "",
    summary: `${maintenancePrices} par mois. Mises à jour, sécurité, surveillance et sauvegardes.`,
  },
  {
    id: "automatisation",
    index: "03",
    name: "Automatisation et IA",
    href: "/services/automatisation",
    contact: "/contact?offre=automatisation",
    from: "500\u202f€",
    unit: "",
    cadence: "",
    summary:
      "Demandes, devis, relances et documents qui se traitent presque tout seuls, avec l'IA là où elle fait gagner du temps.",
  },
  {
    id: "conseil",
    index: "04",
    name: "Conseil technique",
    href: "/services/consulting",
    contact: "/contact?offre=conseil",
    from: "250\u202f€",
    unit: "",
    cadence: "la demi-journée",
    summary:
      "VPS, Docker, n8n auto-hébergé, Notion : choisir les bons outils, les installer, et savoir s'en servir.",
  },
] as const;

import type { OfferId } from "./contact-payload";

export type { OfferId };

export const offerChoices: { id: OfferId; label: string }[] = [
  ...offers.map((offer) => ({ id: offer.id, label: offer.name })),
  { id: "autre", label: "Autre / projet sur mesure" },
];

export function getOffer(id: (typeof offers)[number]["id"]) {
  const offer = offers.find((item) => item.id === id);
  if (!offer) throw new Error(`Offre inconnue : ${id}`);
  return offer;
}

export const vitrineIncludes = [
  "Conception et intégration",
  "Affichage adapté au téléphone",
  "Formulaire de contact",
  "Balises de référencement (titres et descriptions)",
  "Mentions légales",
  "Trois séries de retouches",
  "Deux heures de prise en main",
  "Un mois de maintenance offert",
];

export const vitrineOptions = [
  "Pages supplémentaires",
  "Rédaction des textes",
  "Logo ou identité visuelle",
  "Prise de rendez-vous en ligne",
  "Boutique en ligne",
  "Référencement plus poussé",
];

export const mobileService = {
  href: "/services/applications-mobiles",
  name: "Applications mobiles",
  summary: "Une application pour le téléphone, quand le site ne suffit plus. Le périmètre se décide au devis.",
} as const;

export const iaTpe = {
  href: "/ia-tpe",
  name: "IA pour les TPE",
  summary: "Diagnostic Gain de temps : une demi-journée pour repérer ce qui peut s'automatiser chez vous.",
  price: "290\u202f€",
} as const;

export const serviceLinks = [
  ...offers.flatMap((offer) => [
    { href: offer.href, label: offer.name },
    ...(offer.id === "automatisation" ? [{ href: iaTpe.href, label: iaTpe.name }] : []),
  ]),
  { href: mobileService.href, label: mobileService.name },
] as const;

export const tools = [
  "Astro",
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "WordPress",
  "WooCommerce",
  "Webflow",
  "n8n",
  "Docker",
  "VPS Linux",
  "Vercel",
  "Zendesk",
  "Notion",
  "Git",
];

export function priceLabel(offer: (typeof offers)[number]) {
  const cadence = offer.cadence ? ` ${offer.cadence}` : "";
  return `à partir de ${offer.from}${offer.unit}${cadence}`;
}

const maintenanceOffer = getOffer("maintenance");
const maintenanceStartingPrice = `à partir de ${maintenanceOffer.from} par mois`;

export const pricingDescription =
  `Sites web ${priceLabel(getOffer("site-vitrine"))}. Maintenance ${maintenanceStartingPrice} : ${maintenancePrices}. ` +
  `Automatisation ${priceLabel(getOffer("automatisation"))}, conseil ${priceLabel(getOffer("conseil"))}. ` +
  "Prix finaux, TVA non applicable.";

export const maintenanceDescription = `Trois forfaits de maintenance. ${maintenanceOffer.summary} Prix finaux, TVA non applicable.`;

export const maintenanceStructuredOffer = {
  "@type": "Offer",
  priceCurrency: "EUR",
  priceSpecification: {
    "@type": "PriceSpecification",
    minPrice: maintenancePlans[0].monthlyPrice,
    priceCurrency: "EUR",
    unitText: "mois",
  },
  description: `Maintenance ${maintenanceStartingPrice}. ${maintenanceOffer.summary} Prix finaux. TVA non applicable, art. 293 B du CGI.`,
} as const;
