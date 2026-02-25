import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStyle, type ThemeStyle } from "@/contexts/ThemeContext";

const LABELS: Record<ThemeStyle, { name: string; desc: string }> = {
  classic: { name: "Classic", desc: "Warm ink & gold" },
  modern: { name: "Modern", desc: "Cool slate & steel blue" },
  editorial: { name: "Editorial", desc: "Wine & ivory" },
  chambers: { name: "Chambers", desc: "Walnut & copper" },
  gazette: { name: "Gazette", desc: "Olive & amber" },
  pastel: { name: "Pastel", desc: "Soft sky blue & mist" },
  bold: { name: "Bold", desc: "Black & electric gold" },
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStyle();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-1 p-1 rounded-full bg-card border border-border shadow-xl backdrop-blur">
      <Palette className="h-4 w-4 text-muted-foreground ml-2 mr-1" />
      {(Object.keys(LABELS) as ThemeStyle[]).map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          title={LABELS[t].desc}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all",
            theme === t
              ? "bg-accent text-accent-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {LABELS[t].name}
        </button>
      ))}
    </div>
  );
}
