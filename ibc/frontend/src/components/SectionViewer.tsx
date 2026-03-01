import { useState, useEffect } from "react";
import { api } from "../services/api";
import type { Node, Version } from "../services/api";
import { DiffView } from "./DiffView";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, GitCompare, ArrowRight, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface SectionViewerProps {
  node: Node;
  sourceCode: string;
  highlightTerm?: string | null;
  initialVersion?: string | null;
}

export function SectionViewer({ node, sourceCode, highlightTerm, initialVersion }: SectionViewerProps) {
  const [versionA, setVersionA] = useState<string>(initialVersion || "A6");
  const [versionB, setVersionB] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"current" | "compare">("current");
  const [versions, setVersions] = useState<Version[]>([]);
  const [contentA, setContentA] = useState<string>("");
  const [contentB, setContentB] = useState<string | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const [isHighlightFading, setIsHighlightFading] = useState(false);

  // Fetch available versions
  useEffect(() => {
    const loadVersions = async () => {
      try {
        const vData = await api.getVersions(sourceCode);
        setVersions(vData);
      } catch (err) {
        console.error("Failed to load versions", err);
      }
    };
    loadVersions();
  }, [sourceCode]);

  // Fetch Content A
  useEffect(() => {
    const fetchContentA = async () => {
      setLoadingA(true);
      try {
        const detail = await api.getSectionDetail(sourceCode, node.identifier, versionA, node.node_type);
        setContentA(detail.current_content?.raw_content || `> [!NOTE]\n> This provision was not yet introduced or had no content in the ${getVersionLabel(versionA)} version.`);
      } catch (err) {
        setContentA(`> [!WARNING]\n> Provision not found in the ${getVersionLabel(versionA)} version. It may have been introduced in a later amendment.`);
      } finally {
        setLoadingA(false);
      }
    };
    fetchContentA();
  }, [node.id, versionA, sourceCode, node.identifier, node.node_type]);

  // Fetch Content B (only in compare mode)
  useEffect(() => {
    if (viewMode !== "compare" || !versionB) {
      setContentB(null);
      return;
    }
    const fetchContentB = async () => {
      setLoadingB(true);
      try {
        const detail = await api.getSectionDetail(sourceCode, node.identifier, versionB, node.node_type);
        setContentB(detail.current_content?.raw_content || `> [!NOTE]\n> This provision was not yet introduced or had no content in the ${getVersionLabel(versionB)} version.`);
      } catch (err) {
        setContentB(`> [!WARNING]\n> Provision not found in the ${getVersionLabel(versionB)} version. It may have been introduced in a later amendment.`);
      } finally {
        setLoadingB(false);
      }
    };
    fetchContentB();
  }, [node.id, versionB, sourceCode, viewMode, node.identifier, node.node_type]);
  useEffect(() => {
    if (highlightTerm) {
      setActiveHighlight(highlightTerm);
      setIsHighlightFading(false);
      
      // Start fading after 8 seconds
      const fadeTimer = setTimeout(() => setIsHighlightFading(true), 8000);
      // Remove completely after 10 seconds
      const removeTimer = setTimeout(() => setActiveHighlight(null), 10000);
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    } else {
      setActiveHighlight(null);
      setIsHighlightFading(false);
    }
  }, [highlightTerm, node.id]);

  useEffect(() => {
    if (initialVersion) {
      setVersionA(initialVersion);
    }
  }, [initialVersion, node.id]);

  const getVersionLabel = (versionCode: string) => {
    const v = versions.find(v => v.version_code === versionCode);
    if (!v) return versionCode;
    const date = new Date(v.release_date);
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="animate-fade-in">
      {/* Section title */}
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-6">
        {node.label}
      </h2>

      {/* Toolbar: version left — View/Compare far right */}
      <div className="flex items-center mb-8 border border-border rounded-lg overflow-hidden text-sm divide-x divide-border w-full">
        {/* Version selector — left */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-background text-muted-foreground flex-shrink-0">
          {viewMode === "current" ? (
            <>
              <span>Version:</span>
              <Select value={versionA} onValueChange={setVersionA}>
                <SelectTrigger className="h-auto py-0 px-0 border-0 shadow-none bg-transparent font-medium text-foreground focus:ring-0 w-auto gap-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  {versions.map((v) => (
                    <SelectItem key={v.version_code} value={v.version_code}>
                      {getVersionLabel(v.version_code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : (
            <>
              <Select value={versionA} onValueChange={setVersionA}>
                <SelectTrigger className="h-auto py-0 px-0 border-0 shadow-none bg-transparent font-medium text-foreground focus:ring-0 w-auto gap-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  {versions.map((v) => (
                    <SelectItem key={v.version_code} value={v.version_code}>
                      {getVersionLabel(v.version_code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ArrowRight className="h-3.5 w-3.5 mx-1" />
              <Select value={versionB || ""} onValueChange={setVersionB}>
                <SelectTrigger className="h-auto py-0 px-0 border-0 shadow-none bg-transparent font-medium text-foreground focus:ring-0 w-auto gap-1">
                  <SelectValue placeholder="select version…" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  {versions.map((v) => (
                    <SelectItem key={v.version_code} value={v.version_code} disabled={v.version_code === versionA}>
                      {getVersionLabel(v.version_code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {/* Spacer pushes View/Compare to the far right */}
        <div className="flex-1" />

        {/* View button — right side */}
        <button
          onClick={() => { setViewMode("current"); setVersionB(null); }}
          className={`flex items-center gap-1.5 px-4 py-2.5 transition-colors border-l border-border ${
            viewMode === "current"
              ? "bg-muted text-foreground font-medium"
              : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </button>

        {/* Compare button — right side */}
        <button
          onClick={() => setViewMode("compare")}
          className={`flex items-center gap-1.5 px-4 py-2.5 transition-colors border-l border-border ${
            viewMode === "compare"
              ? "bg-muted text-foreground font-medium"
              : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <GitCompare className="h-3.5 w-3.5" />
          Compare
        </button>
      </div>

      <div className="min-h-[300px]">
        {(loadingA || loadingB) ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : viewMode === "current" || !versionB ? (
          <div className="legal-text prose prose-slate max-w-none prose-headings:font-serif prose-headings:font-black prose-p:leading-relaxed prose-p:text-foreground/80 prose-p:my-0">
            {(() => {
              const lines = contentA.split('\n');
              let currentPadding = 0;
              
              return lines.map((line, idx) => {
                const trimmed = line.trim();
                
                // Handle empty lines - reset padding and provide space
                if (!trimmed) {
                  currentPadding = 0;
                  return <div key={idx} className="h-4" />;
                }

                // Handle headers
                if (trimmed.startsWith('#')) {
                  currentPadding = 0;
                  return (
                    <div key={idx} className="mb-4">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {line}
                      </ReactMarkdown>
                    </div>
                  );
                }

                // Detect bullet points (stars)
                const match = line.match(/^(\s*)(\*+)\s+(.*)/);
                let cleaned = line;

                if (match) {
                  const spaces = match[1].length;
                  const stars = match[2].length;
                  const level = Math.floor(spaces / 4) + stars;
                  currentPadding = level * 1.5;
                  cleaned = match[3];
                } else {
                  // Inheritance logic: keep currentPadding for lines that obviously follow a bullet
                  // if there was no blank line.
                }

                return (
                  <div 
                    key={idx} 
                    style={{ paddingLeft: `${currentPadding}rem` }} 
                    className="py-0.5 min-h-[1.5rem]"
                  >
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        p: ({ children }) => <p className="m-0 leading-relaxed text-foreground/80">{children}</p>
                      }}
                    >
                      {activeHighlight && activeHighlight.length > 2
                        ? `\n${cleaned}`.replace(
                            new RegExp(`(${activeHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                            `<mark class="transition-all duration-1000 rounded px-0.5 font-bold ${
                              isHighlightFading 
                                ? 'bg-transparent text-inherit' 
                                : 'bg-amber-200/80 text-amber-900 animate-pulse'
                            }">$1</mark>`
                          )
                        : `\n${cleaned}`
                      }
                    </ReactMarkdown>
                  </div>
                );
              });
            })()}
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-4 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
              <div className="flex-1 px-3 underline decoration-muted-foreground/30 underline-offset-4">{getVersionLabel(versionA)}</div>
              <div className="flex-1 px-3 underline decoration-muted-foreground/30 underline-offset-4 font-bold text-foreground">{versionB ? getVersionLabel(versionB) : ""}</div>
            </div>
            <DiffView
              oldText={contentA}
              newText={contentB || ""}
              mode="side-by-side"
              oldLabel={undefined}
              newLabel={undefined}
            />
          </>
        )}
      </div>

      {viewMode === "compare" && versionB && !loadingA && !loadingB && (
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-t border-border/40 pt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-amendment-add" />
            <span>Added in {getVersionLabel(versionB)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-amendment-remove" />
            <span>Removed from {getVersionLabel(versionA)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
