import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { SectionViewer } from "@/components/SectionViewer";
import { api } from "../services/api";
import type { Node } from "../services/api";
import { FileText, BookOpen, Folder, Loader2, Scale } from "lucide-react";

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-foreground overflow-hidden">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar - Clean & Extra Wide for Long Titles */}
        <aside className="w-[460px] border-r border-slate-100 bg-white flex-shrink-0 hidden lg:flex flex-col shadow-[1px_0_0_0_#f1f5f9]">
          <div className="p-10 border-b border-slate-50 space-y-10">
            <div>
              <h2 className="font-serif text-3xl font-black text-slate-900 tracking-tighter">Explorer</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Law Registry Navigator</p>
            </div>

            <div className="space-y-8">
              {/* PART */}
              <div className="space-y-2.5">
                <label className="text-[9px] uppercase font-black text-slate-400 px-1 tracking-wider">1. Select Part</label>
                <Select value={partId} onValueChange={(val) => { setPartId(val); setChapterId(""); setSectionId(""); }}>
                  <SelectTrigger className="w-full min-h-14 h-auto py-3 bg-slate-50 border-slate-100 rounded-2xl text-left focus:ring-accent/20">
                    <SelectValue placeholder="Part..." className="line-clamp-2" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[600px] w-[420px]">
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
                    <SelectContent className="max-h-[600px] w-[420px]">
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
                  <SelectContent className="max-h-[600px] w-[420px]">
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

          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-10 select-none pointer-events-none grayscale">
             <Scale className="h-24 w-24 text-slate-900 mb-6" />
             <p className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-900">Legislative Registry</p>
          </div>
        </aside>

        {/* Full-width Main Content Area - Absolute Transparency */}
        <main className="flex-1 overflow-auto bg-white">
          <div className="w-full max-w-7xl py-16 px-12 md:px-24 mx-auto">
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
