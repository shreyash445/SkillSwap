import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../theme";

export interface ThemeSettings {
  accent: string;
  accentDim: string;
  reduceMotion: boolean;
  haptics: boolean;
  notifications: boolean;
}

const DEFAULT_SETTINGS: ThemeSettings = {
  accent: "#CDFF57",
  accentDim: "#8FB433",
  reduceMotion: false,
  haptics: true,
  notifications: true,
};

const ACCENT_OPTIONS: { label: string; accent: string; accentDim: string }[] = [
  { label: "Lime", accent: "#CDFF57", accentDim: "#8FB433" },
  { label: "Cyan", accent: "#5AC8FA", accentDim: "#2E86B3" },
  { label: "Violet", accent: "#A78BFA", accentDim: "#7C5CFF" },
  { label: "Pink", accent: "#F472B6", accentDim: "#B6498A" },
  { label: "Orange", accent: "#FFA94D", accentDim: "#CC7A2E" },
  { label: "Blue", accent: "#60A5FA", accentDim: "#3B72C4" },
];

const STORAGE_KEY = "skillswap.settings.v1";

interface ThemeContextValue {
  settings: ThemeSettings;
  accentOptions: typeof ACCENT_OPTIONS;
  setAccent: (accent: string) => void;
  toggle: (key: "reduceMotion" | "haptics" | "notifications") => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
      } catch {
        /* ignore */
      }
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
    colors.accent = settings.accent;
    colors.accentDim = settings.accentDim;
  }, [settings, hydrated]);

  const setAccent = useCallback((accent: string) => {
    const opt = ACCENT_OPTIONS.find((o) => o.accent === accent);
    setSettings((prev) => ({
      ...prev,
      accent,
      accentDim: opt?.accentDim ?? prev.accentDim,
    }));
  }, []);

  const toggle = useCallback((key: "reduceMotion" | "haptics" | "notifications") => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const value = useMemo(
    () => ({ settings, accentOptions: ACCENT_OPTIONS, setAccent, toggle }),
    [settings, setAccent, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}