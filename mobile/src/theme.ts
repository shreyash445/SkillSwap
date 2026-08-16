export const colors = {
  bg: "#000000",
  surface: "#0D0D0D",
  card: "#141414",
  cardBorder: "#1F1F1F",
  elevated: "#1A1A1A",
  text: "#FAFAFA",
  textDim: "#9A9A9A",
  textFaint: "#666666",
  accent: "#CDFF57",
  accentDim: "#8FB433",
  star: "#FFC94D",
  danger: "#FF5C5C",
  success: "#4ADE80",
  info: "#5AC8FA",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

export const font = {
  display: "Sora_600SemiBold",
  displayBold: "Sora_700Bold",
  body: "InstrumentSans_400Regular",
  bodyMedium: "InstrumentSans_500Medium",
  bodySemi: "InstrumentSans_600SemiBold",
  mono: "SpaceMono_400Regular",
};

export const avatarPalette = [
  "#6C5CE7",
  "#00B894",
  "#E17055",
  "#0984E3",
  "#E84393",
  "#00CEC9",
  "#FDCB6E",
  "#6D214F",
];

export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}