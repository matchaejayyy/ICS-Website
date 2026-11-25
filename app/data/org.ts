export const ORG = {
  name: "Institute of Computer Science",
  fullName: "Institute of Computer Science",
  handle: "ICS",
  school: "University of San Agustin",
  term: "A.Y. 2026–2027",
  tagline: "Code together. Build loud. Leave nothing boring.",
  shortDescription:
    "The student organization for everyone who codes, designs, tinkers, or is curious about how computers work.",
} as const;

export const NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "showcase", label: "Showcase" },
  { id: "officers", label: "Officers" },
  { id: "contact", label: "Contact" },
] as const;

export const LINKS = {
  join: "https://icslink.pages.dev/",
  events: "https://icslink.pages.dev/",
} as const;
