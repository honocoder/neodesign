export const site = {
  name: "NeoDesign",
  tagline: "Développeur freelance près d'Amiens",
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
    from: "60\u202f€",
    unit: "/mois",
    cadence: "",
    summary:
      "Trois forfaits, de 60 à 100 € par mois : le site reste à jour, sauvegardé, surveillé, et peut évoluer.",
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
      "Formulaires, devis, relances et réservations s'enchaînent avec n8n, et l'IA seulement là où elle fait gagner du temps.",
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

export const maintenanceTiers = [
  {
    name: "Essentiel",
    price: "60\u202f€",
    unit: "/mois",
    points: ["Mises à jour du site", "Sauvegardes", "Surveillance de la disponibilité"],
  },
  {
    name: "Sérénité",
    price: "80\u202f€",
    unit: "/mois",
    points: ["Tout l'Essentiel", "2 h de modifications sur le site par mois"],
  },
  {
    name: "Pro",
    price: "100\u202f€",
    unit: "/mois",
    points: [
      "Tout l'Essentiel",
      "5 h de mon temps par mois, pour le site ou au-delà",
      "Plus réactif",
      "Priorité de prise en charge",
    ],
  },
] as const;

export const mobileService = {
  href: "/services/applications-mobiles",
  name: "Applications mobiles",
  summary: "Une application pour le téléphone, quand le site ne suffit plus. Le périmètre se décide au devis.",
} as const;

export const serviceLinks = [
  ...offers.map((offer) => ({ href: offer.href, label: offer.name })),
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
