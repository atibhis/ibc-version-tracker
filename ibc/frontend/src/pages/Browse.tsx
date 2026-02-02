import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { SectionViewer } from "@/components/SectionViewer";
import { api } from "../services/api";
import type { Node } from "../services/api";
import { FileText, BookOpen, Folder, Loader2, Scale, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Browse() {
  const { sourceCode = "ibc" } = useParams();
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

  useEffect(() => {
    const loadHierarchy = async () => {
      setLoading(true);
      try {
        const data = await api.getHierarchy(sourceCode);
        setHierarchy(data);
        
        // Auto-select first node path
        if (data.length > 0) {
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
      } catch (err) {
        console.error("Failed to load hierarchy", err);
      } finally {
        setLoading(false);
      }
    };
    loadHierarchy();
  }, [sourceCode]);

  // Derived Data
  const parts = useMemo(() => hierarchy.filter(n => n.node_type === 'part' || n.node_type === 'schedule'), [hierarchy]);
  const currentPart = useMemo(() => parts.find(p => p.id === partId), [parts, partId]);
  
  const chapters = useMemo(() => {
    return currentPart?.children?.filter(n => n.node_type === 'chapter') || [];
  }, [currentPart]);
  
  const currentChapter = useMemo(() => chapters.find(c => c.id === chapterId), [chapters, chapterId]);

  const sections = useMemo(() => {
    if (chapters.length > 0) return currentChapter?.children || [];
    return currentPart?.children || [];
  }, [chapters, currentChapter, currentPart]);

  // Sync section content immediately
  useEffect(() => {
    const node = sections.find(s => s.id === sectionId);
    if (node) setSelectedNode(node);
  }, [sectionId, sections]);

  // Handle Search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.search(searchQuery, sourceCode);
        setSearchResults(results);
        setShowResults(true);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, sourceCode]);

  // Helper to find path to node
  const handleSearchResultClick = (node: Node) => {
    // Find absolute path
    for (const part of hierarchy) {
      if (part.id === node.id) {
        setPartId(part.id);
        break;
      }
      if (part.children) {
        for (const child of part.children) {
          if (child.id === node.id) {
            setPartId(part.id);
            if (child.node_type === "chapter") {
              setChapterId(child.id);
            } else {
              setSectionId(child.id);
            }
            break;
          }
          if (child.children) {
            for (const subChild of child.children) {
              if (subChild.id === node.id) {
                setPartId(part.id);
                setChapterId(child.id);
                setSectionId(subChild.id);
                break;
              }
            }
          }
        }
      }
    }
    setSearchQuery("");
    setShowResults(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-foreground">
      <Header />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Navigation Sidebar - Clean & Extra Wide for Long Titles */}
        <aside className="w-full lg:w-[460px] border-b lg:border-b-0 lg:border-r border-slate-100 bg-white flex-shrink-0 flex flex-col shadow-[0_1px_0_0_#f1f5f9] lg:shadow-[1px_0_0_0_#f1f5f9] overflow-y-auto">
          <div className="p-8 border-b border-slate-50 space-y-6 pb-60">
            <div>
              <h2 className="font-serif text-3xl font-black text-slate-900 tracking-tighter">Explorer</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Law Registry Navigator</p>
            </div>

            <div className="space-y-6">
              {/* SEARCH BAR */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  ) : (
                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-accent transition-colors" />
                  )}
                </div>
                <Input
                  placeholder="Search titles or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border-slate-100 rounded-2xl pl-11 h-12 focus-visible:ring-accent/20 focus-visible:border-accent text-sm"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-4 flex items-center"
                  >
                    <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  </button>
                )}

                {/* Search Results Overlay */}
                {showResults && (
                  <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[400px] overflow-y-auto">
                      {searchResults.length > 0 ? (
                        <div className="py-2">
                          <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                            Search Results ({searchResults.length})
                          </div>
                          {searchResults.map((res) => (
                            <button
                              key={res.id}
                              onClick={() => handleSearchResultClick(res)}
                              className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-start gap-3 transition-colors group"
                            >
                              <FileText className="h-4 w-4 text-slate-400 mt-1 flex-shrink-0 group-hover:text-accent" />
                              <div className="space-y-0.5">
                                <div className="text-sm font-bold text-slate-900 leading-snug">{res.label}</div>
                                <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                                  {res.context || `${res.node_type} ${res.identifier}`}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 text-center">
                          <Search className="h-8 w-8 text-slate-100 mx-auto mb-4" />
                          <p className="text-sm text-slate-400">No results found for "{searchQuery}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* PART */}
              <div className="space-y-2.5">
                <label className="text-[9px] uppercase font-black text-slate-400 px-1 tracking-wider">1. Select Part</label>
                <Select value={partId} onValueChange={(val) => { setPartId(val); setChapterId(""); setSectionId(""); }}>
                  <SelectTrigger className="w-full min-h-14 h-auto py-3 bg-slate-50 border-slate-100 rounded-2xl text-left focus:ring-accent/20">
                    <SelectValue placeholder="Part..." className="line-clamp-2" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px] w-[420px]" side="bottom" align="start">
                    {parts.map(p => (
                      <SelectItem key={p.id} value={p.id} className="py-4">
                        <div className="flex items-start gap-3">
                          <Folder className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm font-bold leading-snug whitespace-normal">{p.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CHAPTER (If exists) */}
              {chapters.length > 0 && (
                <div className="space-y-2.5 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[9px] uppercase font-black text-slate-400 px-1 tracking-wider">2. Select Chapter</label>
                  <Select value={chapterId} onValueChange={(val) => { setChapterId(val); setSectionId(""); }}>
                    <SelectTrigger className="w-full min-h-14 h-auto py-3 bg-slate-50 border-slate-100 rounded-2xl text-left focus:ring-accent/20">
                      <SelectValue placeholder="Chapter..." className="line-clamp-2" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[400px] w-[420px]" side="bottom" align="start">
                      {chapters.map(c => (
                        <SelectItem key={c.id} value={c.id} className="py-4">
                          <div className="flex items-start gap-3">
                            <BookOpen className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm font-bold leading-snug whitespace-normal">{c.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* SECTION */}
              <div className="space-y-2.5 animate-in fade-in slide-in-from-top-2">
                <label className="text-[9px] uppercase font-black text-slate-400 px-1 tracking-wider">
                  {chapters.length > 0 ? "3. Select Provision" : "2. Select Provision"}
                </label>
                <Select value={sectionId} onValueChange={setSectionId} disabled={!partId || (chapters.length > 0 && !chapterId)}>
                  <SelectTrigger className="w-full h-14 bg-slate-50 border-slate-100 rounded-2xl text-left focus:ring-gold/20">
                    <SelectValue placeholder="Provision..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px] w-[420px]" side="bottom" align="start">
                    {sections.map(s => (
                      <SelectItem key={s.id} value={s.id} className="py-4">
                        <div className="flex items-start gap-3">
                          <FileText className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                          <span className="text-sm font-bold leading-snug whitespace-normal">{s.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-10 select-none pointer-events-none grayscale hidden lg:flex">
             <Scale className="h-24 w-24 text-slate-900 mb-6" />
             <p className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-900">Legislative Registry</p>
          </div>
        </aside>

        {/* Full-width Main Content Area - Greyer Background for Contrast */}
        <main className="flex-1 overflow-auto bg-[#F1F5F9]/60">
          <div className="w-full max-w-[1600px] py-16 px-6 md:px-12 mx-auto">
            {selectedNode ? (
              <SectionViewer
                node={selectedNode}
                sourceCode={sourceCode}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                 <div className="w-40 h-40 bg-slate-50 rounded-full flex items-center justify-center mb-10 border border-slate-100">
                    <Scale className="h-20 w-20 text-slate-200" />
                 </div>
                 <h2 className="text-5xl font-serif font-black mb-6 text-slate-900 tracking-tight">Access Registry</h2>
                 <p className="max-w-md text-xl text-slate-400 font-light leading-relaxed">Please select a provision from the explorer sidebar to begin your review.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
