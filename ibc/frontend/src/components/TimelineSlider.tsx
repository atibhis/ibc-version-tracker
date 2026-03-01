import { useState, useRef } from "react";
import { format } from "date-fns";
import type { Version } from "@/services/api";
import { cn } from "@/lib/utils";

interface TimelineSliderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  versions: Version[];
}

export function TimelineSlider({ selectedDate, onDateChange, versions }: TimelineSliderProps) {
  const [hoveredVersion, setHoveredVersion] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const startDate = new Date("2016-01-01");
  const endDate = new Date();
  const totalRange = endDate.getTime() - startDate.getTime();

  const getPosition = (dateStr: string) => {
    const d = new Date(dateStr);
    return Math.max(0, Math.min(100, ((d.getTime() - startDate.getTime()) / totalRange) * 100));
  };

  const selectedPosition = getPosition(selectedDate);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const ts = startDate.getTime() + pct * totalRange;
    const d = new Date(ts);
    onDateChange(format(d, "yyyy-MM-dd"));
  };

  // Generate year markers
  const years = [];
  for (let y = 2016; y <= new Date().getFullYear(); y++) {
    years.push(y);
  }

  return (
    <div className="mb-10">
      {/* Year labels */}
      <div className="relative h-6 mb-2">
        {years.map(y => (
          <div
            key={y}
            className="absolute text-xs font-mono text-muted-foreground -translate-x-1/2"
            style={{ left: `${getPosition(`${y}-01-01`)}%` }}
          >
            {y}
          </div>
        ))}
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-12 cursor-pointer group"
        onClick={handleTrackClick}
      >
        {/* Base track line */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-border rounded-full" />

        {/* Filled track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-primary rounded-full transition-all duration-200"
          style={{ width: `${selectedPosition}%` }}
        />

        {/* Year tick marks */}
        {years.map(y => (
          <div
            key={y}
            className="absolute top-1/2 -translate-y-1/2 w-px h-4 bg-border"
            style={{ left: `${getPosition(`${y}-01-01`)}%` }}
          />
        ))}

        {/* Version markers */}
        {versions.map(v => {
          const pos = getPosition(v.release_date);
          const isHovered = hoveredVersion === v.id;
          const isBeforeSelected = v.release_date <= selectedDate;

          return (
            <div
              key={v.id}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
              style={{ left: `${pos}%` }}
              onMouseEnter={() => setHoveredVersion(v.id)}
              onMouseLeave={() => setHoveredVersion(null)}
              onClick={(e) => {
                e.stopPropagation();
                onDateChange(v.release_date);
              }}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full border-2 transition-all duration-200 cursor-pointer",
                  v.is_base
                    ? "w-6 h-6 bg-stone-800 dark:bg-stone-200 border-background shadow-xl scale-125 z-20 flex items-center justify-center after:content-['★'] after:text-[10px] after:text-white dark:after:text-stone-900"
                    : isBeforeSelected
                      ? "bg-primary border-primary"
                      : "bg-background border-border",
                  isHovered && "scale-150 shadow-lg"
                )}
              />

              {/* Tooltip */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 animate-fade-in">
                  <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-sans whitespace-nowrap shadow-lg">
                    <div className="font-medium">{v.version_code}</div>
                    <div className="text-primary-foreground/70 mt-0.5">
                      {new Date(v.release_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45 -mt-1" />
                </div>
              )}
            </div>
          );
        })}

        {/* Selected date indicator (draggable thumb) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
          style={{ left: `${selectedPosition}%` }}
        >
          <div className="w-6 h-6 rounded-full bg-accent border-4 border-background shadow-lg ring-2 ring-accent/30 transition-all duration-200" />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs font-sans text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-stone-800 dark:bg-stone-200 flex items-center justify-center text-[8px] text-white dark:text-stone-900">★</div>
          <span>Original Act (First Date)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent border-2 border-accent" />
          <span>Selected date</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary" />
          <span>Amendment (click to jump)</span>
        </div>
      </div>
    </div>
  );
}
