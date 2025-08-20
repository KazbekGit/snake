import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors as baseColors } from "../constants/colors";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "theme_mode";

function applyTheme(mode: ThemeMode) {
  if (mode === "dark") {
    baseColors.background = baseColors.backgroundDark as any;
    baseColors.card = "#0F172A" as any;
    baseColors.text = "#E2E8F0" as any;
    baseColors.textSecondary = "#94A3B8" as any;
    baseColors.border = "#334155" as any;
  } else {
    // Light defaults
    baseColors.background = "#FFFFFF" as any;
    baseColors.card = "#FFFFFF" as any;
    baseColors.text = "#1E293B" as any;
    baseColors.textSecondary = "#475569" as any;
    baseColors.border = "#E2E8F0" as any;
  }
}

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<ThemeMode>("light");
  const initializedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const m = (saved === "dark" ? "dark" : "light") as ThemeMode;
        if (!initializedRef.current) {
          applyTheme(m);
          setMode(m);
          initializedRef.current = true;
        }
      } catch {
        applyTheme("light");
      }
    })();
  }, []);

  const toggle = async () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    applyTheme(next);
    setMode(next);
    initializedRef.current = true;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  const value = useMemo(() => ({ mode, toggle }), [mode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within AppThemeProvider");
  return ctx;
}
