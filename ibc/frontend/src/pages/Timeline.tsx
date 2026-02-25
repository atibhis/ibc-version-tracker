import { useState, useMemo, useEffect, useRef } from "react";
import { format, setMonth, setYear, parseISO, isAfter, isBefore } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const MIN_DATE = new Date("2016-01-01");
const MAX_DATE = new Date();

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const YEARS: number[] = [];
for (let y = 2016; y <= new Date().getFullYear(); y++) YEARS.push(y);

export default function Timeline() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
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
          api.getHierarchy("ibc")
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
  }, []);

  // Sync calendar display month when selectedDate changes
  useEffect(() => {
    setCalendarMonth(parseISO(selectedDate));
  }, [selectedDate]);

  // Content scroll listener for Jump to Top
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowJumpToTop(container.scrollTop > 400);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loading]);

  const jumpToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeVersion = useMemo(() => {
    const sorted = [...versions].sort((a, b) => b.release_date.localeCompare(a.release_date));
    return sorted.find(v => v.release_date <= selectedDate) || sorted[sorted.length - 1];
  }, [selectedDate, versions]);

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date.toISOString().split("T")[0]);
    }
  };

  const parsedDate = parseISO(selectedDate);

  const handleMonthChange = (month: string) => {
    setCalendarMonth(setMonth(calendarMonth, parseInt(month)));
  };

  const handleYearChange = (year: string) => {
    setCalendarMonth(setYear(calendarMonth, parseInt(year)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content: Law View */}
        <main 
          ref={scrollContainerRef}
          className="flex-1 overflow-auto bg-secondary/5 scroll-smooth"
        >
          <div className="container max-w-5xl py-12 px-6">
            <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex-1">
                <h1 className="font-serif text-4xl md:text-5xl font-black text-foreground mb-3 tracking-tight">
                  Law as on Date
                </h1>
                <p className="text-muted-foreground font-body text-base md:text-lg font-light leading-relaxed max-w-lg">
                  Navigate the temporal dimensions of the code to see the law at any point in its history.
                </p>
              </div>

              {/* Advanced Calendar Picker */}
              <div className="flex-shrink-0">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full md:w-[240px] h-16 justify-between text-left font-sans px-6 text-base rounded-2xl",
                        "border-accent/30 hover:border-accent hover:bg-accent/5 transition-all shadow-md group"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
                        <span className="font-bold">{format(parsedDate, "dd MMM yyyy")}</span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-3xl border-border shadow-2xl overflow-hidden" align="end">
                    <div className="bg-muted/30 p-4 pb-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Select
                          value={String(calendarMonth.getMonth())}
                          onValueChange={handleMonthChange}
                        >
                          <SelectTrigger className="h-10 text-xs flex-1 rounded-xl bg-background border-accent/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover rounded-xl">
                            {MONTHS.map((m, i) => (
                              <SelectItem key={m} value={String(i)} className="text-xs rounded-lg">
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={String(calendarMonth.getFullYear())}
                          onValueChange={handleYearChange}
                        >
                          <SelectTrigger className="h-10 text-xs w-[100px] rounded-xl bg-background border-accent/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover rounded-xl">
                            {YEARS.map(y => (
                              <SelectItem key={y} value={String(y)} className="text-xs rounded-lg">
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Calendar
                      mode="single"
                      selected={parsedDate}
                      onSelect={handleCalendarSelect}
                      month={calendarMonth}
                      onMonthChange={setCalendarMonth}
                      disabled={(date: Date) => isBefore(date, MIN_DATE) || isAfter(date, MAX_DATE)}
                      initialFocus
                      className={cn("p-4 pointer-events-auto font-sans")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Current selection summary */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-secondary/50 border border-accent/10 text-sm font-sans font-medium text-foreground mb-8 shadow-sm">
              <CalendarDays className="h-4 w-4 text-accent" />
              <span>
                Viewing as on <strong className="font-black">{format(parsedDate, "d MMMM yyyy")}</strong>
              </span>
              {activeVersion && (
                <>
                  <span className="text-muted-foreground mx-1">/</span>
                  <span className="text-accent font-bold">
                    {activeVersion.version_code}
                  </span>
                </>
              )}
            </div>

            <TimelineSlider
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              versions={versions}
            />

            <div className="mt-12 bg-card rounded-3xl border border-border p-8 md:p-12 shadow-sm min-h-[600px]">
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
              variant="secondary"
              size="icon"
              onClick={jumpToTop}
              className="fixed bottom-8 right-8 h-12 w-12 rounded-full shadow-2xl border border-accent/20 bg-background/80 backdrop-blur-sm animate-fade-in z-50 hover:scale-110 transition-transform"
            >
              <ChevronUp className="h-6 w-6 text-accent" />
            </Button>
          )}
        </main>
      </div>
    </div>
  );
}
