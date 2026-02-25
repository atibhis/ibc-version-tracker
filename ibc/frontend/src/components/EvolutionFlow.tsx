import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Landmark, FileText, Shield, Users, Zap, Pause, Package } from "lucide-react";

interface EraBlock {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  impact: string;
  color: "navy" | "gold" | "accent";
  details: string[];
}

const eras: EraBlock[] = [
  {
    id: "pre-ibc",
    year: "Pre-2016",
    title: "The Fragmented Era",
    subtitle: "Multiple overlapping laws",
    description: "India's insolvency resolution was scattered across SICA (1985), Recovery of Debts Act (1993), SARFAESI (2002), and Companies Act provisions. Average resolution took 4.3 years. India ranked 136th globally in resolving insolvency.",
    icon: Landmark,
    impact: "4.3 years avg. resolution",
    color: "navy",
    details: [
      "No unified framework for corporate insolvency",
      "Creditors had limited power over resolution",
      "Board for Industrial and Financial Reconstruction (BIFR) was widely criticized",
      "Recovery rate was only 25.7 cents per dollar"
    ]
  },
  {
    id: "blrc",
    year: "2014-15",
    title: "The Blueprint",
    subtitle: "BLRC Committee & Report",
    description: "The Bankruptcy Law Reforms Committee under T.K. Viswanathan recommended a unified code. The Joint Committee of Parliament refined the Bill after detailed examination.",
    icon: FileText,
    impact: "Single unified framework proposed",
    color: "gold",
    details: [
      "Committee constituted in November 2014",
      "Report submitted November 2015",
      "Bill introduced in Lok Sabha December 2015",
      "Joint Committee report submitted April 2016"
    ]
  },
  {
    id: "enactment",
    year: "May 2016",
    title: "The Code is Born",
    subtitle: "IBC receives Presidential assent",
    description: "The Insolvency and Bankruptcy Code, 2016 was enacted on May 28, creating a paradigm shift. Time-bound resolution (180+90 days), creditor-in-control model, and the IBBI as regulator.",
    icon: Shield,
    impact: "180-day resolution timeline",
    color: "accent",
    details: [
      "255+ sections across 5 parts",
      "Established NCLT as adjudicating authority",
      "Created insolvency professional framework",
      "₹1 lakh minimum default threshold"
    ]
  },
  {
    id: "strengthening",
    year: "2017-18",
    title: "Strengthening the Code",
    subtitle: "3 amendments in quick succession",
    description: "Section 29A introduced to bar wilful defaulters from bidding. Homebuyers recognized as financial creditors. Voting thresholds clarified for the Committee of Creditors.",
    icon: Users,
    impact: "Homebuyers protected as creditors",
    color: "navy",
    details: [
      "1st Amendment (Nov 2017): Section 29A introduced",
      "2nd Amendment (Jun 2018): Personal guarantors included",
      "3rd Amendment (Aug 2018): Voting thresholds clarified",
      "Real estate allottees treated as financial creditors"
    ]
  },
  {
    id: "maturation",
    year: "2019",
    title: "Raising the Bar",
    subtitle: "4th Amendment tightens timelines",
    description: "Default threshold raised to ₹1 crore. A mandatory 330-day outer limit introduced for CIRP completion including litigation time, pushing for faster resolution.",
    icon: Zap,
    impact: "₹1 crore minimum threshold",
    color: "gold",
    details: [
      "Default threshold raised from ₹1 lakh to ₹1 crore",
      "Mandatory 330-day CIRP timeline",
      "Includes time spent in legal proceedings",
      "Commercial wisdom of CoC given primacy"
    ]
  },
  {
    id: "covid",
    year: "2020",
    title: "The Pandemic Pause",
    subtitle: "5th Amendment — COVID relief",
    description: "CIRP initiation suspended for defaults arising during the pandemic period (March 25 to March 24, 2021), protecting businesses from pandemic-related insolvency.",
    icon: Pause,
    impact: "12-month CIRP suspension",
    color: "accent",
    details: [
      "Section 10A inserted to suspend fresh filings",
      "Protected businesses from COVID-related defaults",
      "Existing cases continued to be heard",
      "Threshold remained at ₹1 crore"
    ]
  },
  {
    id: "msme",
    year: "2021",
    title: "Pre-Pack for MSMEs",
    subtitle: "6th Amendment — Faster resolution",
    description: "Introduced pre-packaged insolvency resolution for MSMEs — a hybrid informal-formal framework enabling faster, cheaper resolution while keeping debtors in control of operations.",
    icon: Package,
    impact: "120-day pre-pack timeline",
    color: "gold",
    details: [
      "Chapter IIIA inserted for pre-pack framework",
      "Debtor retains control of business",
      "Base resolution plan by debtor",
      "Swiss Challenge method for competing plans"
    ]
  }
];

export function EvolutionFlow() {
  const [expandedId, setExpandedId] = useState<string | null>("enactment");

  const colorMap = {
    navy: {
      bg: "bg-primary/5",
      border: "border-primary/30",
      activeBg: "bg-primary/10",
      activeBorder: "border-primary",
      icon: "bg-primary text-primary-foreground",
      badge: "text-primary",
    },
    gold: {
      bg: "bg-secondary/30",
      border: "border-accent/30",
      activeBg: "bg-secondary/50",
      activeBorder: "border-accent",
      icon: "bg-accent text-accent-foreground",
      badge: "text-accent",
    },
    accent: {
      bg: "bg-accent/5",
      border: "border-accent/30",
      activeBg: "bg-accent/10",
      activeBorder: "border-accent",
      icon: "bg-accent text-accent-foreground",
      badge: "text-accent",
    },
  };

  return (
    <div className="relative">
      {/* Vertical spine */}
      <div className="absolute left-8 top-0 bottom-0 w-px bg-border hidden md:block" />

      <div className="space-y-4">
        {eras.map((era, index) => {
          const isExpanded = expandedId === era.id;
          const colors = colorMap[era.color];
          const Icon = era.icon;

          return (
            <div
              key={era.id}
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Timeline node (desktop) */}
              <div className="absolute left-8 top-6 -translate-x-1/2 hidden md:block z-10">
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 transition-all duration-300",
                  isExpanded
                    ? `${colors.activeBorder} bg-background scale-125`
                    : "border-border bg-background"
                )} />
              </div>

              {/* Card */}
              <div
                className={cn(
                  "md:ml-16 rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden",
                  isExpanded
                    ? `${colors.activeBg} ${colors.activeBorder} shadow-lg`
                    : `${colors.bg} ${colors.border} hover:shadow-md`
                )}
                onClick={() => setExpandedId(isExpanded ? null : era.id)}
              >
                {/* Header row */}
                <div className="flex items-center gap-4 p-5">
                  <div className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 transition-transform duration-300",
                    colors.icon,
                    isExpanded && "scale-110"
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={cn("font-mono text-sm font-medium", colors.badge)}>
                        {era.year}
                      </span>
                      <span className="text-xs font-sans text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        {era.impact}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">
                      {era.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-body">
                      {era.subtitle}
                    </p>
                  </div>

                  <ChevronRight className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-300 flex-shrink-0",
                    isExpanded && "rotate-90"
                  )} />
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 animate-fade-in">
                    <div className="border-t border-border/50 pt-4">
                      <p className="font-body text-foreground/90 leading-relaxed mb-4">
                        {era.description}
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {era.details.map((detail, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-sm font-body text-muted-foreground"
                          >
                            <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", colors.icon)} />
                            {detail}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary bar */}
      <div className="mt-12 p-6 rounded-xl bg-primary text-primary-foreground">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="font-serif text-2xl font-bold mb-1">7+</div>
            <div className="text-sm text-primary-foreground/70 font-sans">Years of Evolution</div>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold mb-1">6</div>
            <div className="text-sm text-primary-foreground/70 font-sans">Major Amendments</div>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold mb-1">255+</div>
            <div className="text-sm text-primary-foreground/70 font-sans">Sections</div>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-accent mb-1">71%</div>
            <div className="text-sm text-primary-foreground/70 font-sans">Recovery Rate Improvement</div>
          </div>
        </div>
      </div>
    </div>
  );
}
