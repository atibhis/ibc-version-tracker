import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { SectionViewer } from "@/components/SectionViewer";
import { api } from "../services/api";
import type { Node } from "../services/api";
import { FileText, BookOpen, Folder, Loader2, Scale, Search, X, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MIN_SIDEBAR_WIDTH = 220;
const MAX_SIDEBAR_WIDTH = 600;
const DEFAULT_SIDEBAR_WIDTH = 300;

export default function Browse() {
  const { sourceCode = "ibc" } = useParams();
  const [searchParams] = useSearchParams();
  const querySectionId = searchParams.get("section");
  const queryVersion = searchParams.get("version");

  const [hierarchy, setHierarchy] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Triple Dropdown State
  const [partId, setPartId] = useState<string>("");
  const [chapterId, setChapterId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Node[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [highlightTerm, setHighlightTerm] = useState<string | null>(null);

  // Resizable sidebar
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(DEFAULT_SIDEBAR_WIDTH);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = sidebarWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [sidebarWidth]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientX - dragStartX.current;
      const next = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, dragStartWidth.current + delta));
      setSidebarWidth(next);
    };
    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch versions first to get the latest date
        const versionsData = await api.getVersions(sourceCode);
        const latestVersion = versionsData.sort((a, b) => b.release_date.localeCompare(a.release_date))[0];
        const initialDate = latestVersion?.release_date;

        const data = await api.getHierarchy(sourceCode, initialDate);
        setHierarchy(data);
        
        if (data.length > 0) {
          if (querySectionId) {
            let found = false;
            for (const part of data) {
              if (part.id === querySectionId) {
                setPartId(part.id); setSectionId(part.id); setSelectedNode(part);
                found = true; break;
              }
              if (part.children) {
                for (const child of part.children) {
                  if (child.id === querySectionId) {
                    setPartId(part.id);
                    if (child.node_type === "chapter") setChapterId(child.id);
                    else setSectionId(child.id);
                    setSelectedNode(child); found = true; break;
                  }
                  if (child.children) {
                    for (const subChild of child.children) {
                      if (subChild.id === querySectionId) {
                        setPartId(part.id); setChapterId(child.id);
                        setSectionId(subChild.id); setSelectedNode(subChild);
                        found = true; break;
                      }
                    }
                  }
                  if (found) break;
                }
              }
              if (found) break;
            }
          } else {
            const firstPart = data[0];
            setPartId(firstPart.id);
            if (firstPart.children && firstPart.children.length > 0) {
              const firstChild = firstPart.children[0];
              if (firstChild.node_type === 'chapter') {
                setChapterId(firstChild.id);
                if (firstChild.children && firstChild.children.length > 0) {
                  setSectionId(firstChild.children[0].id);
                  setSelectedNode(firstChild.children[0]);
                }
              } else {
                setSectionId(firstChild.id);
                setSelectedNode(firstChild);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [sourceCode]);

  const parts = useMemo(() => hierarchy.filter((n: Node) => n.node_type === 'part' || n.node_type === 'schedule'), [hierarchy]);
  const currentPart = useMemo(() => parts.find((p: Node) => p.id === partId), [parts, partId]);
  const chapters = useMemo(() => currentPart?.children?.filter((n: Node) => n.node_type === 'chapter') || [], [currentPart]);
  const currentChapter = useMemo(() => chapters.find((c: Node) => c.id === chapterId), [chapters, chapterId]);
  const sections = useMemo(() => {
    if (chapters.length > 0) return currentChapter?.children || [];
    return currentPart?.children || [];
  }, [chapters, currentChapter, currentPart]);

  useEffect(() => {
    const node = sections.find((s: Node) => s.id === sectionId);
    if (node) setSelectedNode(node);
  }, [sectionId, sections]);

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); setShowResults(false); return; }
    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.search(searchQuery, sourceCode);
        setSearchResults(results); setShowResults(true);
      } catch (err) {
        console.error("Search failed", err);
      } finally { setIsSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, sourceCode]);

  const handleSearchResultClick = (node: Node) => {
    for (const part of hierarchy) {
      if (part.id === node.id) { setPartId(part.id); break; }
      if (part.children) {
        for (const child of part.children) {
          if (child.id === node.id) {
            setPartId(part.id);
            if (child.node_type === "chapter") setChapterId(child.id);
            else setSectionId(child.id);
            break;
          }
          if (child.children) {
            for (const subChild of child.children) {
              if (subChild.id === node.id) {
                setPartId(part.id); setChapterId(child.id); setSectionId(subChild.id); break;
              }
            }
          }
        }
      }
    }
    setSearchQuery(""); setShowResults(false); setHighlightTerm(searchQuery);
  };

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

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside
          className="hidden lg:flex flex-col border-r border-border bg-background flex-shrink-0 overflow-y-auto"
          style={{ width: sidebarWidth }}
        >
          <div className="px-5 pt-7 pb-4 border-b border-border/60">
            <h2 className="font-serif text-xl font-bold text-foreground tracking-tight">Explorer</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.18em] mt-0.5">Law Registry</p>
          </div>

          <div className="px-5 py-5 space-y-5 flex-1">
            {/* Search */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                {isSearching
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  : <Search className="h-3.5 w-3.5 text-muted-foreground" />
                }
              </div>
              <Input
                placeholder="Search titles or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted/50 border-border rounded-md pl-8 h-9 text-sm focus-visible:ring-1 focus-visible:ring-accent/30 focus-visible:border-accent/40"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-3 flex items-center">
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}

              {showResults && (
                <div className="absolute z-50 mt-1.5 w-full bg-popover rounded-lg border border-border shadow-xl overflow-hidden animate-fade-in">
                  <div className="max-h-[360px] overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <div className="py-1">
                        <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">
                          {searchResults.length} results
                        </div>
                        {searchResults.map((res: Node) => (
                          <button
                            key={res.id}
                            onClick={() => handleSearchResultClick(res)}
                            className="w-full px-3 py-2.5 text-left hover:bg-muted/60 flex items-start gap-2.5 transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-sm text-foreground leading-snug">{res.label}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {res.context || `${res.node_type} · ${res.identifier}`}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-sm text-muted-foreground">No results for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Part */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider">Part</label>
              <Select value={partId} onValueChange={(val) => { setPartId(val); setChapterId(""); setSectionId(""); }}>
                <SelectTrigger className="w-full min-h-9 h-auto py-2 bg-transparent border-border rounded-md text-left text-sm focus:ring-1 focus:ring-accent/30">
                  <SelectValue placeholder="Select part…" className="line-clamp-2" />
                </SelectTrigger>
                <SelectContent className="max-h-[400px] bg-popover" side="bottom" align="start">
                  {parts.map((p: Node) => (
                    <SelectItem key={p.id} value={p.id} className="py-3">
                      <div className="flex items-start gap-2.5">
                        <Folder className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm leading-snug whitespace-normal">{p.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chapter */}
            {chapters.length > 0 && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider">Chapter</label>
                <Select value={chapterId} onValueChange={(val) => { setChapterId(val); setSectionId(""); }}>
                  <SelectTrigger className="w-full min-h-9 h-auto py-2 bg-transparent border-border rounded-md text-left text-sm focus:ring-1 focus:ring-accent/30">
                    <SelectValue placeholder="Select chapter…" className="line-clamp-2" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px] bg-popover" side="bottom" align="start">
                    {chapters.map((c: Node) => (
                      <SelectItem key={c.id} value={c.id} className="py-3">
                        <div className="flex items-start gap-2.5">
                          <BookOpen className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-sm leading-snug whitespace-normal">{c.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Section */}
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider">Provision</label>
              <Select value={sectionId} onValueChange={setSectionId} disabled={!partId || (chapters.length > 0 && !chapterId)}>
                <SelectTrigger className="w-full min-h-9 h-auto py-2 bg-transparent border-border rounded-md text-left text-sm focus:ring-1 focus:ring-accent/30">
                  <SelectValue placeholder="Select provision…" />
                </SelectTrigger>
                <SelectContent className="max-h-[400px] bg-popover" side="bottom" align="start">
                  {sections.map((s: Node) => (
                    <SelectItem key={s.id} value={s.id} className="py-3">
                      <div className="flex items-start gap-2.5">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm leading-snug whitespace-normal">{s.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Watermark */}
          <div className="flex flex-col items-center justify-end p-8 opacity-[0.06] select-none pointer-events-none">
            <Scale className="h-16 w-16 text-foreground" />
          </div>
        </aside>

        {/* Drag handle */}
        <div
          className="hidden lg:flex items-center justify-center w-1 hover:w-2 bg-border/0 hover:bg-border/60 cursor-col-resize flex-shrink-0 transition-all group"
          onMouseDown={onMouseDown}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors" />
        </div>

        {/* Mobile sidebar — simple stacked selects */}
        <div className="lg:hidden px-4 py-4 border-b border-border space-y-3">
          <Select value={partId} onValueChange={(val) => { setPartId(val); setChapterId(""); setSectionId(""); }}>
            <SelectTrigger className="w-full h-10 bg-muted/50 border-border rounded-md text-sm">
              <SelectValue placeholder="Select part…" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {parts.map((p: Node) => (
                <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {chapters.length > 0 && (
            <Select value={chapterId} onValueChange={(val) => { setChapterId(val); setSectionId(""); }}>
              <SelectTrigger className="w-full h-10 bg-muted/50 border-border rounded-md text-sm">
                <SelectValue placeholder="Select chapter…" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {chapters.map((c: Node) => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={sectionId} onValueChange={setSectionId} disabled={!partId || (chapters.length > 0 && !chapterId)}>
            <SelectTrigger className="w-full h-10 bg-muted/50 border-border rounded-md text-sm">
              <SelectValue placeholder="Select provision…" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {sections.map((s: Node) => (
                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="w-full py-10 px-6 md:px-12">
            {selectedNode ? (
              <SectionViewer
                node={selectedNode}
                sourceCode={sourceCode}
                highlightTerm={highlightTerm}
                initialVersion={queryVersion}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <Scale className="h-14 w-14 text-muted-foreground/20 mb-6" />
                <p className="text-muted-foreground text-sm max-w-xs">Select a provision from the sidebar to begin.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
