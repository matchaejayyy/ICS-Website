export const PALETTE = {
  plum: "#4A214C",
  berry: "#A82D65",
  pink: "#EC0867",
  coral: "#ED6F78",
  blush: "#EFB8C6",
  cream: "#FFF6EF",
  ink: "#171024",
  aubergine: "#281332",
};

export type Mode = "dark" | "light";

// theme roles
export const THEMES: Record<Mode, Record<string, string>> = {
  dark: {
    "--bg": PALETTE.ink,
    "--bg2": PALETTE.aubergine,
    "--surface": PALETTE.aubergine,
    "--fg": PALETTE.cream,
    "--muted": PALETTE.blush,
    "--line": PALETTE.cream,
    "--dot": "rgba(239,184,198,0.18)",
    "--shadow": PALETTE.pink,
    "--accent-text": "#FF4D94",
  },
  light: {
    "--bg": PALETTE.cream,
    "--bg2": PALETTE.blush,
    "--surface": "#ffffff",
    "--fg": PALETTE.ink,
    "--muted": PALETTE.plum,
    "--line": PALETTE.ink,
    "--dot": "rgba(74,33,76,0.16)",
    "--shadow": PALETTE.berry,
    "--accent-text": "#C8075A",
  },
};

export const HALFTONE =
  "radial-gradient(circle, currentColor 1.4px, transparent 1.6px)";
