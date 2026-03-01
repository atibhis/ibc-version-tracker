import { useRef, useState, useEffect, useCallback } from "react";
import { Palette, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStyle, type ThemeStyle } from "@/contexts/ThemeContext";

const LABELS: Record<ThemeStyle, { name: string; desc: string }> = {
  classic: { name: "Classic", desc: "Warm ink & gold" },
  editorial: { name: "Editorial", desc: "Wine & ivory" },
  chambers: { name: "Chambers", desc: "Walnut & copper" },
  gazette: { name: "Gazette", desc: "Olive & amber" },
};

const DEFAULT_POS = { x: window.innerWidth - 340, y: window.innerHeight - 64 };

function getSavedPos() {
  try {
    const saved = localStorage.getItem("theme_switcher_pos");
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return DEFAULT_POS;
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStyle();
  const [pos, setPos] = useState<{ x: number; y: number }>(getSavedPos);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    const newX = Math.max(0, Math.min(window.innerWidth - 300, e.clientX - offset.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - offset.current.y));
    setPos({ x: newX, y: newY });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // Persist position
  useEffect(() => {
    localStorage.setItem("theme_switcher_pos", JSON.stringify(pos));
  }, [pos]);

  const onGripMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  };

  return (
    <div
      ref={ref}
      style={{ left: pos.x, top: pos.y, position: "fixed" }}
      className="z-50 flex items-center gap-1 p-1 rounded-full bg-card border border-border shadow-xl backdrop-blur select-none"
    >
      {/* Drag handle */}
      <div
        onMouseDown={onGripMouseDown}
        className="cursor-grab active:cursor-grabbing ml-1 mr-0.5 text-muted-foreground hover:text-foreground transition-colors"
        title="Drag to move"
      >
        <GripHorizontal className="h-3.5 w-3.5" />
      </div>
      <Palette className="h-4 w-4 text-muted-foreground mr-1" />
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
