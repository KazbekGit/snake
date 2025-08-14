import { colors } from "../constants/colors";

export const ds = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  typography: {
    heroTitle: { fontSize: 36, lineHeight: 44, fontWeight: "700" as const },
    title: { fontSize: 24, lineHeight: 32, fontWeight: "700" as const },
    subtitle: { fontSize: 20, lineHeight: 28, fontWeight: "400" as const },
    body: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
    button: { fontSize: 18, lineHeight: 24, fontWeight: "700" as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 999,
  },
  shadow: {
    soft: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    strong: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
    card: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 3,
    },
  },
  colors,
} as const;

export type DesignSystem = typeof ds;

