import { useState, useEffect } from "react";
import { api } from "../services/api";
import type { Node, Version } from "../services/api";
import { DiffView } from "./DiffView";
import { Button } from "@/components/ui/button";
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
  const [versionA, setVersionA] = useState<string>(initialVersion || "A0");
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
        const detail = await api.getSectionDetail(sourceCode, node.identifier, versionB);
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-3xl font-black text-foreground tracking-tight">
            {node.label}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 p-1 bg-secondary rounded-lg">
            <Button
              variant={viewMode === "current" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setViewMode("current");
                setVersionB(null);
              }}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            <Button
              variant={viewMode === "compare" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("compare")}
              className="gap-2"
            >
              <GitCompare className="h-4 w-4" />
              Compare
            </Button>
          </div>
        </div>
      </div>

      {/* Version Selectors */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-secondary/50 rounded-lg border border-border">
        {viewMode === "current" ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-sans font-medium text-muted-foreground">Version:</span>
            <Select value={versionA} onValueChange={setVersionA}>
              <SelectTrigger className="w-[200px] font-sans bg-background">
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
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="text-sm font-sans font-medium text-muted-foreground">From:</span>
              <Select value={versionA} onValueChange={setVersionA}>
                <SelectTrigger className="w-[180px] font-sans bg-background">
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
            </div>

            <ArrowRight className="h-4 w-4 text-muted-foreground" />

            <div className="flex items-center gap-3">
              <span className="text-sm font-sans font-medium text-muted-foreground">To:</span>
              <Select value={versionB || ""} onValueChange={setVersionB}>
                <SelectTrigger className="w-[180px] font-sans bg-background">
                  <SelectValue placeholder="Select version..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  {versions.map((v) => (
                    <SelectItem 
                      key={v.version_code} 
                      value={v.version_code}
                      disabled={v.version_code === versionA}
                    >
                      {getVersionLabel(v.version_code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      <div className="min-h-[400px] py-8 px-6 md:px-10 bg-secondary/30 rounded-3xl border border-border/50 shadow-inner">
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
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-sans text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-amendment-add border border-amendment-add/50" />
            <span>Added in {versionB ? getVersionLabel(versionB) : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-amendment-remove border border-amendment-remove/50" />
            <span>Removed from {getVersionLabel(versionA)}</span>
          </div>
          <div className="ml-auto text-xs italic">
            Computed by Diff Algorithm
          </div>
        </div>
      )}
    </div>
  );
}
