export const ORG = {
  name: "Institute of Computer Science", // PLACEHOLDER
  fullName: "Institute of Computer Science", // PLACEHOLDER
  handle: "ICS", // PLACEHOLDER (logo text in the nav)
  school: "University of San Agustin", // PLACEHOLDER
  term: "A.Y. 2026–2027", // PLACEHOLDER
  tagline: "Code together. Build loud. Leave nothing boring.",
  shortDescription:
    "The student organization for everyone who codes, designs, tinkers, or is curious about how computers work.",
} as const;

// Both point at ICSLink until the page has its own events section.
export const LINKS = {
  join: "https://icslink.pages.dev/",
  events: "https://icslink.pages.dev/",
} as const;
