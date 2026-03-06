import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import type { Node } from "@/services/api";
import { SectionViewer } from "@/components/SectionViewer";
import { Input } from "@/components/ui/input";
import { X, Search, Loader2 } from "lucide-react";

interface SectionPanelProps {
  node: Node;
  versionCode: string;
  sourceCode: string;
  onClose: () => void;
}

export function SectionPanel({ node, versionCode, sourceCode, onClose }: SectionPanelProps) {
  const [selectedNode, setSelectedNode] = useState<Node>(node);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Node[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Sync if parent passes a different node
  useEffect(() => {
    setSelectedNode(node);
    setSearchQuery("");
    setShowResults(false);
  }, [node]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); setShowResults(false); return; }
    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.search(searchQuery, sourceCode);
        setSearchResults(results);
        setShowResults(true);
      } catch (err) {
        console.error("Search failed", err);
      } finally { setIsSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, sourceCode]);

  const handleResultClick = useCallback((result: Node) => {
    // Massage result into a minimal Node shape SectionViewer accepts
    setSelectedNode(result);
    setSearchQuery("");
    setShowResults(false);
  }, []);

  return (
    <div className="flex flex-col h-full border-l border-border bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
            {isSearching
              ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              : <Search className="h-3.5 w-3.5 text-muted-foreground" />
            }
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sections..."
            className="pl-8 h-8 text-xs bg-muted/40 border-border/60 rounded-md"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setShowResults(false); }}
              className="absolute inset-y-0 right-2.5 flex items-center text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          title="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search results dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="flex-shrink-0 border-b border-border bg-background max-h-48 overflow-y-auto">
          {searchResults.map((r) => (
            <button
              key={r.id}
              onClick={() => handleResultClick(r)}
              className="w-full text-left px-4 py-2 text-xs hover:bg-muted transition-colors"
            >
              <span className="font-medium text-foreground">{r.label}</span>
              {r.context && (
                <span className="block text-muted-foreground truncate mt-0.5">{r.context}</span>
              )}
            </button>
          ))}
        </div>
      )}
      {showResults && searchResults.length === 0 && !isSearching && (
        <div className="px-4 py-3 text-xs text-muted-foreground italic border-b border-border flex-shrink-0">
          No results for "{searchQuery}"
        </div>
      )}

      {/* Section Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <SectionViewer
          node={selectedNode}
          sourceCode={sourceCode}
          initialVersion={versionCode}
        />
      </div>
    </div>
  );
}
