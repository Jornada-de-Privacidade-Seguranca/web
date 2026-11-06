"use client";

import { THEME_STORAGE_KEY } from "@/shared/providers/theme";
import { useServerInsertedHTML } from "next/navigation";

export function ThemeScript() {
  useServerInsertedHTML(() => {
    return (
      <script
        id="theme-script"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
                var theme = (stored === 'dark' || stored === 'light' || stored === 'high-contrast')
                  ? stored
                  : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.remove('dark', 'light', 'high-contrast');
                document.documentElement.classList.add(theme);
              } catch (e) {}
            })();
          `,
        }}
      />
    );
  });

  return null;
}
