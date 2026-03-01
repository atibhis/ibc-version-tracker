import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import type { Node, SectionDetail } from "@/services/api";
import { ChevronDown, ChevronUp, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface TimelineLawViewProps {
  selectedDate: string;
  versionCode: string;
  hierarchy: Node[];
}

interface TimelineSectionItemProps {
  section: Node;
  versionCode: string;
  onNavigate: (identifier: string) => void;
  isExpanded: boolean;
}

function TimelineSectionItem({ section, versionCode, onNavigate, isExpanded }: TimelineSectionItemProps) {
  const [detail, setDetail] = useState<SectionDetail | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [localExpanded, setLocalExpanded] = useState(false);

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    try {
      const data = await api.getSectionDetail("ibc", section.identifier, versionCode, section.node_type);
      setDetail(data);
    } catch (err) {
      console.error("Failed to fetch section detail", err);
      setDetail(null);
    } finally {
      setIsFetching(false);
    }
  }, [section.identifier, versionCode]);

  useEffect(() => {
    setDetail(null);
    if (localExpanded) {
      fetchData();
    }
  }, [versionCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync with parent expand/collapse — handles both open AND close
  useEffect(() => {
    if (isExpanded && !localExpanded) {
      setLocalExpanded(true);
      fetchData();
    } else if (!isExpanded && localExpanded) {
      setLocalExpanded(false);
    }
  }, [isExpanded]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !localExpanded;
    setLocalExpanded(next);
    if (next && !detail) fetchData();
  };

  return (
    <div className="group">
      <div className="flex items-start justify-between gap-3 py-2">
        <span className={`text-sm leading-snug flex-1 transition-colors ${
          localExpanded ? "text-foreground font-medium" : "text-foreground/80 group-hover:text-foreground"
        }`}>
          {section.label}
        </span>

        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
          {/* "Evolution" button — visible on hover, navigates to browse/compare */}
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(section.id); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-accent font-medium px-1.5 py-0.5 rounded border border-transparent hover:border-border/60 hover:bg-muted/50"
            title="See how this section evolved"
          >
            Evolution
            <ExternalLink className="h-2.5 w-2.5" />
          </button>

          {/* Expand / collapse */}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={toggleExpand}
          >
            {localExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {localExpanded && (
        <div className="pb-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
          {isFetching ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground italic py-2">
              <div className="w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
              Fetching law text…
            </div>
          ) : detail?.current_content ? (
            <div className="legal-text prose prose-slate prose-sm max-w-none prose-headings:font-serif prose-p:text-foreground/80 text-sm text-foreground/75 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {detail.current_content.raw_content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No content available for this version.</p>
          )}
        </div>
      )}
    </div>
  );
}



export function TimelineLawView({ versionCode, hierarchy }: TimelineLawViewProps) {
  const navigate = useNavigate();
  const [expandedParts, setExpandedParts] = useState<Set<string>>(
    () => new Set(hierarchy.slice(0, 2).map(p => p.id))
  );
  const [allSectionsExpanded, setAllSectionsExpanded] = useState(false);
  // Per-part section text expanded state
  const [partSectionsExpanded, setPartSectionsExpanded] = useState<Set<string>>(new Set());

  const togglePartSections = (partId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPartSectionsExpanded(prev => {
      const next = new Set(prev);
      if (next.has(partId)) next.delete(partId);
      else next.add(partId);
      return next;
    });
  };

  useEffect(() => {
    if (hierarchy.length > 0 && expandedParts.size === 0) {
      setExpandedParts(new Set(hierarchy.slice(0, 2).map(p => p.id)));
    }
  }, [hierarchy]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePart = (id: string) => {
    setExpandedParts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedParts(new Set(hierarchy.map(p => p.id)));
    setAllSectionsExpanded(true);
  };

  const handleCollapseAll = () => {
    setExpandedParts(new Set());
    setAllSectionsExpanded(false);
  };

  const handleNavigate = (id: string) => {
    navigate(`/browse/ibc?section=${id}&version=${versionCode}`);
  };

  return (
    <div className="space-y-0">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleExpandAll}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Maximize2 className="h-3 w-3" />
          Expand all
        </button>
        <span className="text-border">·</span>
        <button
          onClick={handleCollapseAll}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Minimize2 className="h-3 w-3" />
          Collapse all
        </button>
      </div>

      {/* Parts */}
      {hierarchy.map((part, i) => {
        const isOpen = expandedParts.has(part.id);
        const partLabel = part.identifier.replace('part-', '').toUpperCase();

        return (
          <div key={part.id} className={i < hierarchy.length - 1 ? "border-b border-border/60" : ""}>
            {/* Part header — larger, bolder */}
            <button
              className="w-full text-left flex items-center justify-between gap-4 py-4 group"
              onClick={() => togglePart(part.id)}
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs font-semibold text-muted-foreground w-6 flex-shrink-0">
                  {partLabel}
                </span>
                <span className="font-serif text-lg font-bold text-foreground group-hover:text-foreground/80 transition-colors">
                  {part.label}
                </span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Part content */}
            {isOpen && (() => {
              const partSectionsOpen = allSectionsExpanded || partSectionsExpanded.has(part.id);
              return (
              <div className="pb-6 pl-9 animate-fade-in">
                {/* Per-part expand all sections toggle */}
                <button
                  onClick={(e) => togglePartSections(part.id, e)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mt-1 mb-3"
                >
                  {partSectionsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {partSectionsOpen ? "Hide section text" : "Show section text"}
                </button>

                <div className="space-y-0">
                  {part.children?.map(child => (
                    <div key={child.id}>
                      {child.node_type === 'chapter' ? (
                        <div>
                          <p className="text-sm font-bold text-foreground uppercase tracking-wide mt-5 mb-2">
                            {child.label}
                          </p>
                          <div className="space-y-0 border-l border-border/50 pl-4">
                            {child.children?.map(section => (
                              <TimelineSectionItem
                                key={section.id}
                                section={section}
                                versionCode={versionCode}
                                onNavigate={handleNavigate}
                                isExpanded={partSectionsOpen}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="border-l border-border/50 pl-4">
                          <TimelineSectionItem
                            key={child.id}
                            section={child}
                            versionCode={versionCode}
                            onNavigate={handleNavigate}
                            isExpanded={partSectionsOpen}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              );
            })()}
          </div>
        );
      })}
    </div>
  );
}
