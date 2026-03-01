import { useState, useMemo, useEffect, useRef } from "react";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { Header } from "@/components/Header";
import { TimelineSlider } from "@/components/TimelineSlider";
import { TimelineLawView } from "@/components/TimelineLawView";
import { api } from "@/services/api";
import type { Version, Node } from "@/services/api";
import { CalendarDays, CalendarIcon, Loader2, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MIN_DATE = new Date("2016-01-01");
const MAX_DATE = new Date();

const YEARS: number[] = [];
for (let y = 2016; y <= new Date().getFullYear(); y++) YEARS.push(y);

export default function Timeline() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [versions, setVersions] = useState<Version[]>([]);
  const [hierarchy, setHierarchy] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJumpToTop, setShowJumpToTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vData, hData] = await Promise.all([
          api.getVersions("ibc"),
          api.getHierarchy("ibc", selectedDate)
        ]);
        setVersions(vData);
        setHierarchy(hData);
      } catch (error) {
        console.error("Failed to fetch timeline data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  // Sync calendar display month when selectedDate changes
  useEffect(() => {
    setCalendarMonth(parseISO(selectedDate));
  }, [selectedDate]);

  // Jump to Top
  useEffect(() => {
    const handleWindowScroll = () => {
      if (window.scrollY > 200) setShowJumpToTop(true);
    };
    const handleContainerScroll = () => {
      const el = scrollContainerRef.current;
      if (el && el.scrollTop > 200) setShowJumpToTop(true);
    };
    const checkBothScrolls = () => {
      const winOk = window.scrollY <= 200;
      const elOk = !scrollContainerRef.current || scrollContainerRef.current.scrollTop <= 200;
      if (winOk && elOk) setShowJumpToTop(false);
    };
    const combinedHandler = () => { handleWindowScroll(); checkBothScrolls(); };
    const containerCombined = () => { handleContainerScroll(); checkBothScrolls(); };

    window.addEventListener("scroll", combinedHandler, { passive: true });
    const container = scrollContainerRef.current;
    if (container) container.addEventListener("scroll", containerCombined, { passive: true });
    return () => {
      window.removeEventListener("scroll", combinedHandler);
      if (container) container.removeEventListener("scroll", containerCombined);
    };
  }, []);

  // Keyboard shortcut: press 'T' to jump to top
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          jumpToTop();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const jumpToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeVersion = useMemo(() => {
    const sorted = [...versions].sort((a, b) => b.release_date.localeCompare(a.release_date));
    return sorted.find(v => v.release_date <= selectedDate) || sorted[sorted.length - 1];
  }, [selectedDate, versions]);

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(format(date, "yyyy-MM-dd"));
    }
  };

  const parsedDate = parseISO(selectedDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <main
          ref={scrollContainerRef}
          className="flex-1 overflow-auto scroll-smooth"
        >
          <div className="w-full max-w-5xl mx-auto py-14 px-6 md:px-10">

            {/* Page heading */}
            <div className="mb-10">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">
                Law as on Date
              </h1>
              <p className="text-muted-foreground font-body text-sm md:text-base leading-relaxed max-w-xl">
                Navigate the temporal dimensions of the code to see the law at any point in its history.
              </p>
            </div>

            {/* Date line — open text, no box */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <CalendarDays className="h-4 w-4 flex-shrink-0" />
              <span>
                Viewing as on{" "}
                <strong className="text-foreground font-semibold">
                  {format(parsedDate, "d MMMM yyyy")}
                </strong>
                {activeVersion && (
                  <>
                    <span className="mx-2 text-border">·</span>
                    <span className="text-foreground/70 font-medium">{activeVersion.version_code}</span>
                  </>
                )}
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-muted text-muted-foreground ml-1"
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl border-border shadow-xl overflow-hidden" align="start">
                  <Calendar
                    mode="single"
                    selected={parsedDate}
                    onSelect={handleCalendarSelect}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    captionLayout="dropdown"
                    startMonth={MIN_DATE}
                    endMonth={MAX_DATE}
                    disabled={(date: Date) => isBefore(date, MIN_DATE) || isAfter(date, MAX_DATE)}
                    initialFocus
                    className={cn("pointer-events-auto font-sans")}
                    classNames={{
                      caption_label: "hidden",
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <TimelineSlider
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              versions={versions}
            />

            {/* Law content — no wrapping card box */}
            <div className="mt-12 w-full">
              <TimelineLawView
                selectedDate={selectedDate}
                versionCode={activeVersion?.version_code || "base"}
                hierarchy={hierarchy}
              />
            </div>
          </div>

          {/* Floating Jump to Top */}
          {showJumpToTop && (
            <Button
              onClick={jumpToTop}
              className="fixed bottom-8 right-8 h-10 px-4 rounded-full shadow-lg border border-border bg-background/90 backdrop-blur-sm animate-fade-in z-50 hover:scale-105 active:scale-95 transition-all text-muted-foreground text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <ChevronUp className="h-4 w-4" />
              Top
              <span className="text-[9px] font-mono border border-muted-foreground/30 rounded px-1 py-0.5 hidden md:inline">T</span>
            </Button>
          )}
        </main>
      </div>
    </div>
  );
}
