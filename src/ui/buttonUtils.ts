import { ds } from "./theme";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export const getGradientByVariant = (variant: ButtonVariant): string[] => {
  switch (variant) {
    case "primary":
      return ds.colors.gradients.success as unknown as string[];
    case "secondary":
      return ds.colors.gradients.warning as unknown as string[];
    case "danger":
      return ds.colors.gradients.secondary as unknown as string[];
    case "ghost":
    default:
      return ds.colors.gradients.accent as unknown as string[];
  }
};


