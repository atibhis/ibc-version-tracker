import { useMemo } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import * as Diff from "diff";

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

interface DiffRow {
  old?: DiffLine;
  new?: DiffLine;
}

/**
 * Identifies anchor markers in legal text (e.g., "(25)", "(24A)").
 */
function getAnchor(line: string): string | null {
  const match = line.trim().match(/^\((\d+[A-Z]?)\)/);
  return match ? match[1] : null;
}

/**
 * Computes line-by-line diff with anchor-based alignment for section markers.
 */
function computeDiff(oldText: string, newText: string): DiffRow[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  
  // 1. Identify common anchors
  const oldAnchors = new Map<string, number>();
  const newAnchors = new Map<string, number>();
  
  oldLines.forEach((line, idx) => {
    const a = getAnchor(line);
    if (a && !oldAnchors.has(a)) oldAnchors.set(a, idx);
  });
  
  newLines.forEach((line, idx) => {
    const a = getAnchor(line);
    if (a && !newAnchors.has(a)) newAnchors.set(a, idx);
  });
  
  const commonAnchors = Array.from(oldAnchors.keys())
    .filter(a => newAnchors.has(a))
    .sort((a, b) => oldAnchors.get(a)! - oldAnchors.get(b)!);

  const rows: DiffRow[] = [];
  let lastOldIdx = 0;
  let lastNewIdx = 0;

  // 2. Process segments between anchors
  const processSegment = (oStart: number, oEnd: number, nStart: number, nEnd: number) => {
    const oSeg = oldLines.slice(oStart, oEnd).join("\n");
    const nSeg = newLines.slice(nStart, nEnd).join("\n");
    const segmentChanges = Diff.diffLines(oSeg, nSeg);
    
    for (let i = 0; i < segmentChanges.length; i++) {
      const change = segmentChanges[i];
      const lines = (change.value || "").split("\n");
      if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();

      if (!change.added && !change.removed) {
        lines.forEach(line => rows.push({
          old: { type: "unchanged", content: line },
          new: { type: "unchanged", content: line }
        }));
      } else if (change.removed) {
        const next = segmentChanges[i + 1];
        if (next && next.added) {
          const nextLines = (next.value || "").split("\n");
          if (nextLines.length > 0 && nextLines[nextLines.length - 1] === "") nextLines.pop();
          const max = Math.max(lines.length, nextLines.length);
          for (let j = 0; j < max; j++) {
            rows.push({
              old: j < lines.length ? { type: "removed", content: lines[j] } : undefined,
              new: j < nextLines.length ? { type: "added", content: nextLines[j] } : undefined
            });
          }
          i++;
        } else {
          lines.forEach(line => rows.push({ old: { type: "removed", content: line }, new: undefined }));
        }
      } else if (change.added) {
        lines.forEach(line => rows.push({ old: undefined, new: { type: "added", content: line } }));
      }
    }
  };

  for (const anchor of commonAnchors) {
    const oIdx = oldAnchors.get(anchor)!;
    const nIdx = newAnchors.get(anchor)!;
    
    // Process gap before anchor
    processSegment(lastOldIdx, oIdx, lastNewIdx, nIdx);
    
    // Aligned anchor line
    const isSame = oldLines[oIdx] === newLines[nIdx];
    rows.push({
      old: { type: isSame ? "unchanged" : "removed", content: oldLines[oIdx] },
      new: { type: isSame ? "unchanged" : "added", content: newLines[nIdx] }
    });
    
    lastOldIdx = oIdx + 1;
    lastNewIdx = nIdx + 1;
  }

  // Process remaining content after last anchor
  processSegment(lastOldIdx, oldLines.length, lastNewIdx, newLines.length);
  
  return rows;
}

/**
 * Computes word-level differences and returns HTML with <ins> and <del> tags.
 */
function highlightWordDiff(oldText: string, newText: string): { old: string; new: string } {
  const diff = Diff.diffWordsWithSpace(oldText, newText);
  let oldHtml = "";
  let newHtml = "";
  diff.forEach((part) => {
    if (part.added) newHtml += `<ins>${part.value}</ins>`;
    else if (part.removed) oldHtml += `<del>${part.value}</del>`;
    else {
      oldHtml += part.value;
      newHtml += part.value;
    }
  });
  return { old: oldHtml, new: newHtml };
}

/**
 * Detects level of indentation from markdown markers (*, spaces) 
 * and strips them for cleaner legal display.
 */
function parseBulletLine(content: string) {
  const match = content.match(/^(\s*)(\*+)\s+(.*)/);
  if (!match) return { cleaned: content, padding: 0 };
  
  const spaces = match[1].length;
  const stars = match[2].length;
  const level = Math.floor(spaces / 4) + stars;
  return { 
    cleaned: match[3], 
    padding: level * 1.5 
  };
}

export function DiffView({ oldText, newText, mode, oldLabel, newLabel }: DiffViewProps) {
  const rows = useMemo(() => computeDiff(oldText, newText), [oldText, newText]);
  
  if (mode === "side-by-side") {
    return (
      <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm font-body text-sm">
        {(oldLabel || newLabel) && (
          <div className="grid grid-cols-2 divide-x divide-border border-b border-border bg-secondary/30">
            <div className="px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{oldLabel}</div>
            <div className="px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/80">{newLabel}</div>
          </div>
        )}
        <div className="divide-y divide-border">
          {rows.map((row, i) => {
            const renderCell = (line?: DiffLine, otherLine?: DiffLine, _isOld?: boolean) => {
              if (!line) return <div className="px-5 py-2 bg-secondary/20 h-full border-l-2 border-transparent" />;
              
              const { cleaned, padding } = parseBulletLine(line.content);
              let finalContent = cleaned;

              if (line.type === "removed" && otherLine?.type === "added") {
                const h = highlightWordDiff(cleaned, parseBulletLine(otherLine.content).cleaned);
                finalContent = h.old;
              } else if (line.type === "added" && otherLine?.type === "removed") {
                const h = highlightWordDiff(parseBulletLine(otherLine.content).cleaned, cleaned);
                finalContent = h.new;
              }

              const bgColor = line.type === "added" ? "bg-amendment-add/[0.03]" : line.type === "removed" ? "bg-amendment-remove/[0.03]" : "";
              const borderClass = line.type === "added" ? "border-l-2 border-amendment-add" : line.type === "removed" ? "border-l-2 border-amendment-remove" : "border-l-2 border-transparent";

              return (
                <div className={cn("px-5 py-2 transition-colors duration-200", bgColor, borderClass)}>
                  <div 
                    className="legal-text prose-sm max-w-none break-words"
                    style={{ paddingLeft: `${padding}rem` }}
                  >
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        p: ({node, ...props}) => <span {...props} />,
                        ins: ({node, ...props}) => <ins className="bg-amendment-add-bg text-amendment-add px-0.5 rounded-sm no-underline font-semibold" {...props} />,
                        del: ({node, ...props}) => <del className="bg-amendment-remove-bg text-amendment-remove px-0.5 rounded-sm no-underline" {...props} />
                      }}
                    >
                      {"\n" + (finalContent || "")}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            };

            return (
              <div key={i} className="grid grid-cols-2 divide-x divide-border group transition-colors hover:bg-secondary/10">
                {renderCell(row.old, row.new, true)}
                {renderCell(row.new, row.old, false)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  // Inline Mode
  const inlineLines: { type: "unchanged" | "added" | "removed"; content: string; otherContent?: string }[] = [];
  rows.forEach(row => {
    if (row.old?.type === "removed" && row.new?.type === "added") {
      inlineLines.push({ type: "removed", content: row.old.content, otherContent: row.new.content });
      inlineLines.push({ type: "added", content: row.new.content, otherContent: row.old.content });
    } else {
      if (row.old?.type === "removed") inlineLines.push(row.old);
      if (row.new?.type === "added") inlineLines.push(row.new);
      if (row.old?.type === "unchanged" && row.new?.type === "unchanged") inlineLines.push(row.old);
    }
  });
  
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm font-body text-sm divide-y divide-border">
      {inlineLines.map((line, i) => {
        const { cleaned, padding } = parseBulletLine(line.content);
        let finalContent = cleaned;
        if (line.type === "removed" && line.otherContent) {
           finalContent = highlightWordDiff(cleaned, parseBulletLine(line.otherContent).cleaned).old;
        } else if (line.type === "added" && line.otherContent) {
           finalContent = highlightWordDiff(parseBulletLine(line.otherContent).cleaned, cleaned).new;
        }

        return (
          <div
            key={i}
            className={cn(
              "px-6 py-2.5 border-l-4",
              line.type === "added" && "bg-amendment-add/[0.03] border-l-amendment-add",
              line.type === "removed" && "bg-amendment-remove/[0.03] border-l-amendment-remove",
              line.type === "unchanged" && "border-l-transparent"
            )}
          >
            <span className="mr-3 font-mono text-xs text-muted-foreground inline-block w-4 text-center">
              {line.type === "added" && "+"}
              {line.type === "removed" && "−"}
              {line.type === "unchanged" && " "}
            </span>
            <div className={cn(
              "legal-text prose-sm max-w-none inline-block align-middle",
              line.type === "added" && "text-foreground/90",
              line.type === "removed" && "text-muted-foreground opacity-90"
            )} style={{ paddingLeft: `${padding}rem` }}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({node, ...props}) => <span {...props} />,
                  ins: ({node, ...props}) => <ins className="bg-amendment-add-bg text-amendment-add px-0.5 rounded-sm no-underline font-semibold" {...props} />,
                  del: ({node, ...props}) => <del className="bg-amendment-remove-bg text-amendment-remove px-0.5 rounded-sm no-underline" {...props} />
                }}
              >
                {"\n" + (finalContent || "")}
              </ReactMarkdown>
            </div>
          </div>
        );
      })}
    </div>
  );
}
