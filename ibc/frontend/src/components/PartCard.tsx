import { Link } from "react-router-dom";
import { ChevronRight, BookOpen, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { partMetadata } from "@/data/metadata";
import type { Node } from "../services/api";

interface PartCardProps {
  part: Node;
  index: number;
}

export function PartCard({ part, index }: PartCardProps) {
  // Count total leaf nodes (sections)
  const countLeafNodes = (node: Node): number => {
    if (!node.children || node.children.length === 0) return 1;
    return node.children.reduce((acc, child) => acc + countLeafNodes(child), 0);
  };

  const totalSections = countLeafNodes(part);
  const metadata = partMetadata[part.identifier] || { description: "Explore the consolidated legal framework of this part." };
  
  const chapterCount = part.children?.filter(n => n.node_type === 'chapter').length || 0;

  // Extract part number or ID carefully
  // Label example: "Part I: Preliminary" -> "I"
  const getShortId = (label: string, identifier: string) => {
    if (identifier.toLowerCase() === 'schedules') return "SCH";
    const partMatch = label.match(/Part\s+([IVXLCDM]+)/i);
    if (partMatch) return partMatch[1].toUpperCase();
    return identifier.replace('part-', '').toUpperCase().split('-')[0];
  };

  const shortId = getShortId(part.label, part.identifier);

  return (
    <Link
      to={`/browse/ibc`}
      className={cn(
        "group block bg-card rounded-3xl border border-border p-8",
        "hover:border-accent/40 hover:shadow-2xl transition-all duration-500",
        "animate-fade-in relative"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground font-serif text-xl font-black shadow-xl ring-4 ring-background transition-transform group-hover:scale-110 duration-500">
             {shortId}
          </div>
          <div className="p-2 rounded-full border border-border group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-all duration-300 text-muted-foreground/30">
             <ChevronRight className="h-5 w-5" />
          </div>
        </div>

        <div>
          <h3 className="font-serif text-2xl font-black text-foreground mb-3 leading-tight group-hover:text-accent transition-colors">
            {part.label}
          </h3>
          <p className="text-sm text-muted-foreground font-light leading-relaxed line-clamp-3">
            {metadata.description}
          </p>
        </div>

        <div className="flex items-center gap-6 pt-6 border-t border-border">
          {chapterCount > 0 && (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground">
              <BookOpen className="h-4 w-4 text-accent" />
              <span>{chapterCount} Chapters</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground">
            <Layers className="h-4 w-4 text-gold" />
            <span>{totalSections} Provisions</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
