export const siteConfig = {
  // Replace these placeholders or update them from Admin → Settings after Supabase setup.
  title: "Our Story",
  personOne: "Milan",
  personTwo: "[PARTNER_NAME]",
  relationshipStartDate: "2024-02-14",
  tagline: "A collection of moments, memories, and everything between us.",
  description:
    "A small corner of the internet where we keep the memories we never want to forget.",
  openingMessage: "The story began quietly, then became the place we wanted to return to.",
  closingMessage: "Still choosing each other, one ordinary day at a time.",
  quote: "Some moments become memories. Some memories become a home.",
  accentColor: "#8f6659",
  heroImage: "/placeholders/hero.webp",
  coupleImage: "/placeholders/couple.webp",
  placesVisited: 8,
  noIndex: true,
} as const;

export const uploadConfig = {
  bucket: "relationship-media",
  maxBytes: 10 * 1024 * 1024,
  acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
} as const;
