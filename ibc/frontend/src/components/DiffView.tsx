import { useMemo } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DiffViewProps {
  oldText: string;
  newText: string;
  mode: "inline" | "side-by-side";
  oldLabel?: string;
  newLabel?: string;
}

interface DiffLine {
  type: "unchanged" | "added" | "removed";
  content: string;
}

function computeDiff(oldText: string, newText: string): { old: DiffLine[]; new: DiffLine[] } {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  
  const oldDiff: DiffLine[] = [];
  const newDiff: DiffLine[] = [];
  
  let oldIndex = 0;
  let newIndex = 0;
  
  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    const oldLine = oldLines[oldIndex];
    const newLine = newLines[newIndex];
    
    if (oldLine === newLine) {
      oldDiff.push({ type: "unchanged", content: oldLine || "" });
      newDiff.push({ type: "unchanged", content: newLine || "" });
      oldIndex++;
      newIndex++;
    } else if (oldIndex >= oldLines.length) {
      oldDiff.push({ type: "unchanged", content: "" });
      newDiff.push({ type: "added", content: newLine });
      newIndex++;
    } else if (newIndex >= newLines.length) {
      oldDiff.push({ type: "removed", content: oldLine });
      newDiff.push({ type: "unchanged", content: "" });
      oldIndex++;
    } else {
      // Check if old line appears later in new
      const oldInNew = newLines.slice(newIndex).indexOf(oldLine);
      const newInOld = oldLines.slice(oldIndex).indexOf(newLine);
      
      if (oldInNew !== -1 && (newInOld === -1 || oldInNew <= newInOld)) {
        // Lines were added
        oldDiff.push({ type: "unchanged", content: "" });
        newDiff.push({ type: "added", content: newLine });
        newIndex++;
      } else if (newInOld !== -1) {
        // Lines were removed
        oldDiff.push({ type: "removed", content: oldLine });
        newDiff.push({ type: "unchanged", content: "" });
        oldIndex++;
      } else {
        // Line was changed
        oldDiff.push({ type: "removed", content: oldLine });
        newDiff.push({ type: "added", content: newLine });
        oldIndex++;
        newIndex++;
      }
    }
  }
  
  return { old: oldDiff, new: newDiff };
}

export function DiffView({ oldText, newText, mode, oldLabel, newLabel }: DiffViewProps) {
  const diff = useMemo(() => computeDiff(oldText, newText), [oldText, newText]);
  
  if (mode === "side-by-side") {
    return (
      <div className="grid grid-cols-2 gap-4 font-body text-sm">
        <div className="space-y-0.5">
          {oldLabel && (
            <div className="text-xs font-sans font-medium text-muted-foreground mb-2 uppercase tracking-wider">
              {oldLabel}
            </div>
          )}
          <div className="rounded-md border border-border overflow-hidden">
            {diff.old.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "px-3 py-1 border-l-2",
                  line.type === "removed" && "bg-amendment-remove border-l-amendment-remove",
                  line.type === "unchanged" && "border-l-transparent",
                  !line.content && "h-6"
                )}
              >
                <div className={cn(
                  "legal-text prose-sm max-w-none break-words",
                  line.type === "removed" && "text-amendment-remove line-through opacity-70"
                )}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <span {...props} />
                    }}
                  >
                    {line.content || ""}
                  </ReactMarkdown>
                  {!line.content && <span className="block h-5" />}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-0.5">
          {newLabel && (
            <div className="text-xs font-sans font-medium text-muted-foreground mb-2 uppercase tracking-wider">
              {newLabel}
            </div>
          )}
          <div className="rounded-md border border-border overflow-hidden">
            {diff.new.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "px-3 py-1 border-l-2",
                  line.type === "added" && "bg-amendment-add border-l-amendment-add",
                  line.type === "unchanged" && "border-l-transparent",
                  !line.content && "h-6"
                )}
              >
                <div className={cn(
                  "legal-text prose-sm max-w-none break-words",
                  line.type === "added" && "text-amendment-add"
                )}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <span {...props} />
                    }}
                  >
                    {line.content || ""}
                  </ReactMarkdown>
                  {!line.content && <span className="block h-5" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Inline mode
  const inlineLines: DiffLine[] = [];
  for (let i = 0; i < Math.max(diff.old.length, diff.new.length); i++) {
    const oldLine = diff.old[i];
    const newLine = diff.new[i];
    
    if (oldLine?.type === "removed" && oldLine.content) {
      inlineLines.push(oldLine);
    }
    if (newLine?.type === "added" && newLine.content) {
      inlineLines.push(newLine);
    }
    if (oldLine?.type === "unchanged" && oldLine.content) {
      inlineLines.push(oldLine);
    }
  }
  
  return (
    <div className="rounded-md border border-border overflow-hidden font-body text-sm">
      {inlineLines.map((line, i) => (
        <div
          key={i}
          className={cn(
            "px-4 py-1.5 border-l-4",
            line.type === "added" && "bg-amendment-add border-l-amendment-add",
            line.type === "removed" && "bg-amendment-remove border-l-amendment-remove",
            line.type === "unchanged" && "border-l-transparent"
          )}
        >
          <span className="mr-2 font-mono text-xs text-muted-foreground">
            {line.type === "added" && "+"}
            {line.type === "removed" && "−"}
            {line.type === "unchanged" && " "}
          </span>
          <div className={cn(
            "legal-text prose-sm max-w-none inline-block align-middle",
            line.type === "added" && "text-amendment-add",
            line.type === "removed" && "text-amendment-remove line-through opacity-70"
          )}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({node, ...props}) => <span {...props} />
              }}
            >
              {line.content || ""}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
}
