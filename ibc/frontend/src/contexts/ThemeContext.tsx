import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type ThemeStyle = "classic" | "modern" | "editorial" | "chambers" | "gazette" | "pastel" | "bold";

interface ThemeContextType {
  theme: ThemeStyle;
  setTheme: (t: ThemeStyle) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "classic",
  setTheme: () => {},
});

export const useThemeStyle = () => useContext(ThemeContext);

/**
 * Seven color palettes applied via CSS variables.
 * Classic   = warm ink & parchment (charcoal + burnished gold)
 * Modern    = cool slate + steel blue, crisp white
 * Editorial = deep burgundy/wine + ivory cream
 * Chambers  = walnut brown + antique copper (Classic variant)
 * Gazette   = olive/forest + aged amber (Editorial variant)
 * Pastel    = soft sky blue & mist
 * Bold      = black & electric gold (dark mode)
 */
const PALETTES: Record<ThemeStyle, Record<string, string>> = {
  classic: {
    "--background": "40 20% 97%",
    "--foreground": "220 30% 12%",
    "--card": "40 15% 99%",
    "--card-foreground": "220 30% 12%",
    "--popover": "40 15% 99%",
    "--popover-foreground": "220 30% 12%",
    "--primary": "220 28% 14%",
    "--primary-foreground": "40 30% 96%",
    "--secondary": "35 20% 92%",
    "--secondary-foreground": "220 28% 14%",
    "--muted": "35 12% 88%",
    "--muted-foreground": "220 12% 46%",
    "--accent": "30 80% 45%",
    "--accent-foreground": "40 30% 96%",
    "--destructive": "0 65% 50%",
    "--destructive-foreground": "40 25% 96%",
    "--border": "35 15% 86%",
    "--input": "35 15% 86%",
    "--ring": "30 80% 45%",
    "--gold": "30 80% 45%",
    "--gold-light": "35 40% 92%",
    "--navy-dark": "220 30% 10%",
    "--navy-light": "220 18% 32%",
    "--cream": "40 30% 96%",
    "--cream-dark": "35 20% 92%",
  },
  modern: {
    "--background": "210 20% 98%",
    "--foreground": "215 25% 15%",
    "--card": "210 15% 100%",
    "--card-foreground": "215 25% 15%",
    "--popover": "210 15% 100%",
    "--popover-foreground": "215 25% 15%",
    "--primary": "215 30% 18%",
    "--primary-foreground": "210 20% 96%",
    "--secondary": "210 15% 93%",
    "--secondary-foreground": "215 30% 18%",
    "--muted": "210 10% 90%",
    "--muted-foreground": "215 12% 50%",
    "--accent": "215 55% 48%",
    "--accent-foreground": "210 20% 98%",
    "--destructive": "0 65% 50%",
    "--destructive-foreground": "210 20% 98%",
    "--border": "210 12% 88%",
    "--input": "210 12% 88%",
    "--ring": "215 55% 48%",
    "--gold": "215 55% 48%",
    "--gold-light": "215 25% 92%",
    "--navy-dark": "215 30% 10%",
    "--navy-light": "215 18% 32%",
    "--cream": "210 20% 96%",
    "--cream-dark": "210 15% 93%",
  },
  editorial: {
    "--background": "30 25% 96%",
    "--foreground": "350 20% 14%",
    "--card": "35 20% 98%",
    "--card-foreground": "350 20% 14%",
    "--popover": "35 20% 98%",
    "--popover-foreground": "350 20% 14%",
    "--primary": "350 35% 22%",
    "--primary-foreground": "30 30% 96%",
    "--secondary": "30 18% 91%",
    "--secondary-foreground": "350 35% 22%",
    "--muted": "30 12% 87%",
    "--muted-foreground": "350 10% 48%",
    "--accent": "350 55% 42%",
    "--accent-foreground": "30 30% 96%",
    "--destructive": "0 65% 50%",
    "--destructive-foreground": "30 30% 96%",
    "--border": "30 14% 85%",
    "--input": "30 14% 85%",
    "--ring": "350 55% 42%",
    "--gold": "350 55% 42%",
    "--gold-light": "350 20% 92%",
    "--navy-dark": "350 25% 12%",
    "--navy-light": "350 15% 30%",
    "--cream": "30 25% 96%",
    "--cream-dark": "30 18% 91%",
  },
  chambers: {
    "--background": "28 18% 96%",
    "--foreground": "25 35% 12%",
    "--card": "30 14% 98%",
    "--card-foreground": "25 35% 12%",
    "--popover": "30 14% 98%",
    "--popover-foreground": "25 35% 12%",
    "--primary": "25 40% 16%",
    "--primary-foreground": "35 25% 95%",
    "--secondary": "28 16% 90%",
    "--secondary-foreground": "25 40% 16%",
    "--muted": "28 10% 86%",
    "--muted-foreground": "25 15% 45%",
    "--accent": "18 65% 42%",
    "--accent-foreground": "35 25% 96%",
    "--destructive": "0 65% 50%",
    "--destructive-foreground": "35 25% 96%",
    "--border": "28 12% 84%",
    "--input": "28 12% 84%",
    "--ring": "18 65% 42%",
    "--gold": "18 65% 42%",
    "--gold-light": "22 30% 91%",
    "--navy-dark": "25 35% 10%",
    "--navy-light": "25 20% 28%",
    "--cream": "35 22% 95%",
    "--cream-dark": "28 16% 90%",
  },
  gazette: {
    "--background": "45 18% 95%",
    "--foreground": "80 25% 12%",
    "--card": "48 14% 97%",
    "--card-foreground": "80 25% 12%",
    "--popover": "48 14% 97%",
    "--popover-foreground": "80 25% 12%",
    "--primary": "80 30% 16%",
    "--primary-foreground": "45 22% 95%",
    "--secondary": "45 14% 90%",
    "--secondary-foreground": "80 30% 16%",
    "--muted": "48 10% 86%",
    "--muted-foreground": "80 12% 44%",
    "--accent": "38 70% 42%",
    "--accent-foreground": "45 22% 96%",
    "--destructive": "0 65% 50%",
    "--destructive-foreground": "45 22% 96%",
    "--border": "45 12% 83%",
    "--input": "45 12% 83%",
    "--ring": "38 70% 42%",
    "--gold": "38 70% 42%",
    "--gold-light": "40 28% 91%",
    "--navy-dark": "80 25% 10%",
    "--navy-light": "80 16% 28%",
    "--cream": "45 20% 95%",
    "--cream-dark": "45 14% 90%",
  },
  pastel: {
    "--background": "210 30% 97%",
    "--foreground": "220 20% 22%",
    "--card": "210 25% 98%",
    "--card-foreground": "220 20% 22%",
    "--popover": "210 25% 98%",
    "--popover-foreground": "220 20% 22%",
    "--primary": "220 22% 32%",
    "--primary-foreground": "210 30% 97%",
    "--secondary": "200 18% 93%",
    "--secondary-foreground": "220 22% 32%",
    "--muted": "210 14% 90%",
    "--muted-foreground": "220 10% 50%",
    "--accent": "195 40% 50%",
    "--accent-foreground": "0 0% 100%",
    "--destructive": "0 65% 50%",
    "--destructive-foreground": "0 0% 100%",
    "--border": "210 16% 88%",
    "--input": "210 16% 88%",
    "--ring": "195 40% 50%",
    "--gold": "195 40% 50%",
    "--gold-light": "195 25% 92%",
    "--navy-dark": "220 22% 16%",
    "--navy-light": "220 14% 36%",
    "--cream": "210 25% 96%",
    "--cream-dark": "200 18% 93%",
  },
  bold: {
    "--background": "0 0% 4%",
    "--foreground": "0 0% 95%",
    "--card": "0 0% 8%",
    "--card-foreground": "0 0% 95%",
    "--popover": "0 0% 8%",
    "--popover-foreground": "0 0% 95%",
    "--primary": "0 0% 95%",
    "--primary-foreground": "0 0% 4%",
    "--secondary": "0 0% 12%",
    "--secondary-foreground": "0 0% 92%",
    "--muted": "0 0% 15%",
    "--muted-foreground": "0 0% 55%",
    "--accent": "45 100% 55%",
    "--accent-foreground": "0 0% 4%",
    "--destructive": "0 65% 50%",
    "--destructive-foreground": "0 0% 95%",
    "--border": "0 0% 18%",
    "--input": "0 0% 18%",
    "--ring": "45 100% 55%",
    "--gold": "45 100% 55%",
    "--gold-light": "45 60% 15%",
    "--navy-dark": "0 0% 2%",
    "--navy-light": "0 0% 30%",
    "--cream": "0 0% 92%",
    "--cream-dark": "0 0% 12%",
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeStyle>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("ibc-theme-style") as ThemeStyle) || "classic";
    }
    return "classic";
  });

  useEffect(() => {
    localStorage.setItem("ibc-theme-style", theme);
    const root = document.documentElement;
    const palette = PALETTES[theme];
    Object.entries(palette).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
