import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import type { Node, SectionDetail } from "@/services/api";
import { BookOpen, FileText, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TimelineLawViewProps {
  selectedDate: string;
  versionCode: string;
  hierarchy: Node[];
}

interface TimelineSectionItemProps {
  section: Node;
  versionCode: string;
  onDoubleClick: (identifier: string) => void;
  isExpanded: boolean;
}

function TimelineSectionItem({ section, versionCode, onDoubleClick, isExpanded }: TimelineSectionItemProps) {
  const [detail, setDetail] = useState<SectionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [localExpanded, setLocalExpanded] = useState(false);

  const fetchData = useCallback(async () => {
    if (!detail && !loading) {
      setLoading(true);
      try {
        const data = await api.getSectionDetail("ibc", section.identifier, versionCode);
        setDetail(data);
      } catch (err) {
        console.error("Failed to fetch section detail", err);
      } finally {
        setLoading(false);
      }
    }
  }, [detail, loading, section.identifier, versionCode]);

  useEffect(() => {
    if (isExpanded) {
      setLocalExpanded(true);
      fetchData();
    }
  }, [isExpanded, fetchData]);

  const toggleExpand = useCallback(async () => {
    const nextState = !localExpanded;
    setLocalExpanded(nextState);
    if (nextState) {
      fetchData();
    }
  }, [localExpanded, fetchData]);

  return (
    <div
      className={`p-4 rounded-xl border transition-all cursor-pointer group ${
        localExpanded ? 'border-accent/40 bg-accent/5 ring-1 ring-accent/10' : 'border-border bg-background hover:border-accent/20'
      }`}
      onDoubleClick={() => onDoubleClick(section.identifier)}
      onClick={toggleExpand}
      title="Click to expand text, Double-click to view in Explorer"
    >
      <div className="flex items-start gap-3">
        <FileText className={`h-4 w-4 mt-0.5 flex-shrink-0 transition-colors ${
          localExpanded ? 'text-accent' : 'text-muted-foreground group-hover:text-accent'
        }`} />
        <div className="flex-1">
          <h5 className={`font-serif text-sm font-bold transition-colors ${
            localExpanded ? 'text-accent' : 'text-foreground group-hover:text-accent'
          }`}>
            {section.label}
          </h5>
          
          {localExpanded && (
            <div className="mt-4 pt-4 border-t border-accent/10 animate-fade-in">
              {loading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                  <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  Fetching law text...
                </div>
              ) : detail?.current_content ? (
                <div className="legal-text text-xs sm:text-sm whitespace-pre-wrap pl-1 sm:pl-4">
                  {detail.current_content.raw_content}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground italic pl-4">
                  No content available for this version.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export function TimelineLawView({ versionCode, hierarchy }: TimelineLawViewProps) {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [allSectionsExpanded, setAllSectionsExpanded] = useState(false);



  // Initially expand first two items
  useEffect(() => {
    if (hierarchy.length > 0 && expandedItems.length === 0) {
      setExpandedItems(hierarchy.slice(0, 2).map(p => p.id));
    }
  }, [hierarchy]);

  const handleExpandAll = () => {
    setExpandedItems(hierarchy.map(p => p.id));
    setAllSectionsExpanded(true);
  };

  const handleCollapseAll = () => {
    setExpandedItems([]);
    setAllSectionsExpanded(false);
  };




  // In this dynamic version, we don't have per-section changed flags easily without fetching all
  // But we can show the hierarchy and sections.
  // The user asked for double-click to navigate to browse.

  const handleDoubleClick = (identifier: string) => {
    navigate(`/browse/ibc?identifier=${identifier}&version=${versionCode}`);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2 sticky top-[4.5rem] md:top-[5.5rem] z-30 bg-background/80 backdrop-blur-sm py-2 px-1 rounded-lg border border-border/40">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExpandAll}
            className="h-8 text-[11px] font-bold uppercase tracking-tight gap-1.5"
          >
            <Maximize2 className="h-3 w-3" />
            Expand All Parts
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCollapseAll}
            className="h-8 text-[11px] font-bold uppercase tracking-tight gap-1.5"
          >
            <Minimize2 className="h-3 w-3" />
            Collapse All
          </Button>
        </div>
      </div>

      <Accordion 
        type="multiple" 
        value={expandedItems} 
        onValueChange={setExpandedItems}
        className="space-y-4"
      >
        {hierarchy.map(part => {
          return (
            <AccordionItem
              key={part.id}
              value={part.id}
              className="border border-border rounded-2xl overflow-hidden bg-card transition-all"
            >
              <AccordionTrigger className="px-6 py-5 hover:bg-secondary/30 transition-colors [&[data-state=open]]:bg-secondary/10">
                <div className="flex items-center gap-4 text-left">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-serif text-sm font-bold flex-shrink-0">
                    {part.identifier.replace('part-', '').toUpperCase()}
                  </div>
                  <div>
                    <div className="font-serif text-lg font-bold text-foreground">
                      {part.label}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-6 pt-4">
                  {part.children?.map(child => (
                    <div key={child.id}>
                      {child.node_type === 'chapter' ? (
                        <>
                          <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="h-4 w-4 text-accent" />
                            <h4 className="font-serif text-sm font-bold text-foreground">
                              {child.label}
                            </h4>
                          </div>
                          <div className="space-y-3 pl-6">
                            {child.children?.map(section => (
                              <TimelineSectionItem
                                key={section.id}
                                section={section}
                                versionCode={versionCode}
                                onDoubleClick={handleDoubleClick}
                                isExpanded={allSectionsExpanded}
                              />
                            ))}
                          </div>
                        </>
                      ) : (
                        <TimelineSectionItem
                          key={child.id}
                          section={child}
                          versionCode={versionCode}
                          onDoubleClick={handleDoubleClick}
                          isExpanded={allSectionsExpanded}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
