"use client";

import { useEffect, useState } from "react";
import type { ThemeMode } from "@/shared/theme";

const STORAGE_KEY = "theme";

function getSystemTheme(): ThemeMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): ThemeMode | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
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

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    const resolved = stored ?? getSystemTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(resolved);
    applyTheme(resolved);
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
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }

  function setThemeMode(mode: ThemeMode) {
    setTheme(mode);
    applyTheme(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  }

  return {
    theme,
    isDark: theme === "dark",
    isLight: theme === "light",
    mounted, // use para evitar flash de hidratação
    toggleTheme,
    setThemeMode,
  };
}
