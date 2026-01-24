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
import { Columns, AlignLeft, Eye, GitCompare, ArrowRight, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SectionViewerProps {
  node: Node;
  sourceCode: string;
}

export function SectionViewer({ node, sourceCode }: SectionViewerProps) {
  const [versionA, setVersionA] = useState<string>("201611");
  const [versionB, setVersionB] = useState<string | null>(null);
  const [diffMode, setDiffMode] = useState<"inline" | "side-by-side">("side-by-side");
  const [viewMode, setViewMode] = useState<"current" | "compare">("current");
  const [versions, setVersions] = useState<Version[]>([]);
  const [contentA, setContentA] = useState<string>("");
  const [contentB, setContentB] = useState<string | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

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
        const detail = await api.getSectionDetail(sourceCode, node.identifier, versionA);
        setContentA(detail.current_content?.raw_content || "Content not available for this version.");
      } catch (err) {
        console.error("Failed to fetch content A", err);
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
        setContentB(detail.current_content?.raw_content || "Content not available for this version.");
      } catch (err) {
        console.error("Failed to fetch content B", err);
      } finally {
        setLoadingB(false);
      }
    };
    fetchContentB();
  }, [node.id, versionB, sourceCode, viewMode, node.identifier, node.node_type]);

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
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            <span>{node.node_type} {node.identifier}</span>
          </div>
          <h2 className="font-serif text-3xl font-black text-slate-900 tracking-tight">
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

            <div className="flex items-center gap-1 p-1 bg-background rounded-lg ml-auto">
              <Button
                variant={diffMode === "inline" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDiffMode("inline")}
                className="gap-2"
              >
                <AlignLeft className="h-4 w-4" />
                Inline
              </Button>
              <Button
                variant={diffMode === "side-by-side" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDiffMode("side-by-side")}
                className="gap-2"
              >
                <Columns className="h-4 w-4" />
                Side by Side
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="min-h-[400px] py-4">
        {(loadingA || loadingB) ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : viewMode === "current" || !versionB ? (
          <div className="legal-text prose prose-slate max-w-none prose-headings:font-serif prose-headings:font-black prose-p:leading-relaxed prose-p:text-slate-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {contentA}
            </ReactMarkdown>
          </div>
        ) : (
          <>
            {diffMode === "side-by-side" && (
              <div className="flex gap-4 mb-4 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
                <div className="flex-1 px-3 underline decoration-muted-foreground/30 underline-offset-4">{getVersionLabel(versionA)}</div>
                <div className="flex-1 px-3 underline decoration-muted-foreground/30 underline-offset-4 font-bold text-foreground">{getVersionLabel(versionB)}</div>
              </div>
            )}
            <DiffView
              oldText={contentA}
              newText={contentB || ""}
              mode={diffMode}
              oldLabel={diffMode === "side-by-side" ? undefined : getVersionLabel(versionA)}
              newLabel={diffMode === "side-by-side" ? undefined : getVersionLabel(versionB)}
            />
          </>
        )}
      </div>

      {viewMode === "compare" && versionB && !loadingA && !loadingB && (
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-sans text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-amendment-add border border-amendment-add/50" />
            <span>Added in {getVersionLabel(versionB)}</span>
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
