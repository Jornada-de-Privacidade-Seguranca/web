"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ThemeMode } from "@/shared/theme";

export const THEME_STORAGE_KEY = "theme";

interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  isLight: boolean;
  mounted: boolean; // use para evitar flash de hidratação
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): ThemeMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): ThemeMode | null {
  try {
    // Tema configurado por cookies agora, pode puxar direto do root
    const theme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";

    return theme;
  } catch {
    // localStorage indisponível (SSR ou modo privado restrito)
  }
  return null;
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(mode);
}

function setThemeCookie(mode: ThemeMode) {
  const maxAge = 60 * 60 * 24 * 365; // 1 ano
  document.cookie = `${THEME_STORAGE_KEY}=${mode}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    const resolved = stored ?? getSystemTheme();
    setTheme(resolved);
    // applyTheme(resolved);
    setMounted(true);

    // Escuta mudanças na preferência do sistema quando não há preferência salva
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (!getStoredTheme()) {
        const next = media.matches ? "dark" : "light";
        setTheme(next);
        applyTheme(next);
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  function toggleTheme() {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    setThemeCookie(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
  }

  function setThemeMode(mode: ThemeMode) {
    setTheme(mode);
    applyTheme(mode);
    setThemeCookie(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {}
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        isLight: theme === "light",
        mounted,
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext deve ser usado dentro de ThemeProvider");
  }
  return context;
}
