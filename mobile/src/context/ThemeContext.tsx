import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "@/theme";

export interface ThemeSettings {
  accent: string;
  accentName: string;
  reduceMotion: boolean;
  haptics: boolean;
  notifications: boolean;
}

const DEFAULT_SETTINGS: ThemeSettings = {
  accent: "#ff7a1a",
  accentName: "Orange",
  reduceMotion: false,
  haptics: true,
  notifications: true,
};

export const ACCENT_OPTIONS: { label: string; color: string }[] = [
  { label: "Orange", color: "#ff7a1a" },
  { label: "Emerald", color: "#34d399" },
  { label: "Sky", color: "#38bdf8" },
  { label: "Coral", color: "#ff4d5a" },
  { label: "Gold", color: "#ffc93c" },
  { label: "Purple", color: "#a78bfa" },
];

const STORAGE_KEY = "skillswap.theme.v1";

interface ThemeContextValue {
  settings: ThemeSettings;
  accentOptions: typeof ACCENT_OPTIONS;
  setAccent: (color: string) => void;
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
  }, [settings, hydrated]);

  const setAccent = useCallback((color: string) => {
    const opt = ACCENT_OPTIONS.find((o) => o.color === color);
    setSettings((prev) => ({
      ...prev,
      accent: color,
      accentName: opt?.label ?? prev.accentName,
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
