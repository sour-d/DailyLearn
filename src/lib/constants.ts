export const CATEGORY_COLORS = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#ec4899", label: "Pink" },
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#22c55e", label: "Green" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#64748b", label: "Slate" },
  { value: "#78716c", label: "Stone" },
];

export const CATEGORY_ICONS = [
  "book",
  "code",
  "brain",
  "globe",
  "database",
  "server",
  "layout",
  "terminal",
  "cpu",
  "layers",
  "puzzle",
  "lightbulb",
  "pencil",
  "file-text",
  "bookmark",
  "hash",
] as const;

export type CategoryIconName = (typeof CATEGORY_ICONS)[number];
