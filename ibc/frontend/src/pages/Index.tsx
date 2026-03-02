import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Footer } from "@/components/Footer";
import { useThemeStyle } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { 
  Clock, GitBranch, BookOpen, Scale, 
  Landmark, Loader2 
} from "lucide-react";

/**
 * IBC Registry: A tool to trace the journey and temporal evolution 
 * of the Insolvency and Bankruptcy Code.
 */

const IBC_PREAMBLE = `An Act to consolidate and amend the laws relating to reorganisation and insolvency resolution of corporate persons, partnership firms and individuals in a time bound manner for maximisation of value of assets of such persons, to promote entrepreneurship, availability of credit and balance the interests of all the stakeholders including alteration in the order of priority of payment of Government dues and to establish an Insolvency and Bankruptcy Board of India, and for matters connected therewith or incidental thereto.

BE it enacted by Parliament in the Sixty-seventh Year of the Republic of India as follows.`;

const Index = () => {
  const { theme } = useThemeStyle();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(t);
  }, []);

  const NAV_ITEMS = [
    { to: "/browse/ibc", icon: BookOpen, title: "Browse the Code", desc: "Parts, chapters and provisions" },
    { to: "/timeline", icon: Clock, title: "Law as on Date", desc: "May 2016 — Present" },
    { to: "/evolution", icon: GitBranch, title: "Amendment Journey", desc: "Trace changes through time" },
    { to: "/about", icon: Scale, title: "About", desc: "Mission & methodology" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
        <p className="text-muted-foreground font-sans tracking-tight">Syncing with Registry...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-h-screen overflow-hidden">
      <Header />
      <ThemeSwitcher />

      {/* ============ CLASSIC ============ */}
      {theme === "classic" && (
        <section className="flex flex-col items-center justify-start pt-10 pb-2 px-8 relative text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 via-background to-background" />
          <div className="relative w-full max-w-6xl">
            <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-mono tracking-[0.2em] uppercase mb-3">
              Act No. 31 of 2016
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl font-black text-foreground leading-[1.05] tracking-tight mb-5">
              The Insolvency and <br/> Bankruptcy Code
            </h1>
            
            <div className="w-full max-w-4xl mx-auto h-px bg-foreground/10 mb-5" />
            
            <div className="space-y-2">
              <p className="font-mono text-[12px] uppercase tracking-[0.5em] text-accent font-black">Preamble</p>
              <p className="font-body text-xs sm:text-base leading-relaxed text-muted-foreground italic max-w-6xl mx-auto px-20">
                "{IBC_PREAMBLE}"
              </p>
            </div>

            <div className="w-full max-w-4xl mx-auto h-px bg-foreground/10 mt-5" />

            
          </div>
        </section>
      )}

      {/* ============ EDITORIAL ============ */}
      {theme === "editorial" && (
        <section className="flex flex-col items-center justify-start pt-6 px-12 text-center">
          <div className="w-full max-w-6xl border-y-2 border-foreground py-6 md:py-6">
            <p className="font-mono text-[12px] tracking-[0.4em] text-muted-foreground uppercase mb-4">
              Act 31 of 2016
            </p>
            <h1 className="font-serif text-3xl sm:text-6xl md:text-6xl font-black text-foreground leading-[0.8] mb-6 tracking-tighter uppercase">
              The Insolvency and<br/>
             Bankruptcy Code
            </h1>
            
            {/* <div className="w-full h-px bg-foreground/20 mb-6" /> */}
            
            <div className="space-y-3">
              <p className="font-mono text-[12px] uppercase tracking-[0.5em] text-accent font-black">Preamble</p>
              <p className="font-body text-sm md:text-xl leading-relaxed text-foreground/90 font-medium max-w-5xl mx-auto">
                {IBC_PREAMBLE}
              </p>
            </div>

            {/* <div className="w-full h-px bg-foreground/20 mt-6" /> */}

          </div>
        </section>
      )}

      {/* ============ CHAMBERS ============ */}
      {theme === "chambers" && (
        <section className="flex flex-col items-start justify-start pt-12 px-16 bg-secondary/5 text-left">
          <div className="w-full max-w-6xl">
            <div className="flex items-center justify-start gap-4 mb-4">
              <Landmark className="h-5 w-5 text-accent" />
              <div className="h-px w-24 bg-accent/20" />
            </div>
            <h1 className="font-serif text-4xl sm:text-7xl font-black text-foreground leading-tight mb-6 tracking-tight">
              The Insolvency and <br/> Bankruptcy Code
            </h1>

            <div className="w-full max-w-5xl h-px bg-foreground/10 mb-6" />

            <div className="space-y-4">
              <p className="font-serif text-[10px] uppercase tracking-[0.5em] text-accent font-black italic">Preamble</p>
              <p className="font-serif text-sm sm:text-2xl leading-relaxed text-foreground/75 italic border-l border-accent/20 pl-8 pr-12 py-3">
                "{IBC_PREAMBLE}"
              </p>
            </div>

            <div className="w-full max-w-5xl h-px bg-foreground/10 mt-6" />
          </div>
        </section>
      )}

      {/* ============ GAZETTE ============ */}
      {theme === "gazette" && (
        <section className="flex flex-col items-center justify-start pt-6 px-8 text-center bg-white">
          <div className="w-full max-w-6xl">
            <div className="flex items-center gap-6 mb-3">
              <div className="flex-1 h-px bg-foreground/20" />
              <span className="font-mono text-[11px] tracking-[0.6em] text-foreground uppercase font-black">Act No. 31/2016</span>
              <div className="flex-1 h-px bg-foreground/20" />
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black text-foreground leading-[0.9] mb-8 uppercase tracking-[-0.05em]">
              The Insolvency and <br/> Bankruptcy Code
            </h1>
            
            {/* <div className="w-full h-px bg-foreground mb-20" /> */}
            
            <div className="space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.7em] text-accent font-black">Preamble</p>
              <div className="relative px-12 group">
                <span className="text-4xl absolute -left-2 -top-6 text-accent font-black opacity-30 select-none">“</span>
                <p className="font-serif text-xs sm:text-xl leading-relaxed text-foreground font-medium italic">
                  {IBC_PREAMBLE}
                </p>
                <span className="text-4xl absolute -right-2 -bottom-8 text-accent font-black opacity-30 select-none rotate-180 inline-block">“</span>
              </div>
            </div>

            {/* <div className="w-full h-px bg-foreground mt-20" /> */}

            
          </div>
        </section>
      )}

      {/* ============ Universal Footer Navigation Blocks ============ */}
      {/* 
          STYLE CONTROLS:
          - Whitespace: Use 'pt-...' (padding-top), 'pb-...' (padding-bottom), 'mb-...' (margin-bottom), 'gap-...' (spacing between grid items).
          - Font Sizes: Use 'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', etc.
          - Container Width: 'max-w-6xl', 'max-w-5xl', etc. control the content spread.
      */}
      <section className={cn(
        "px-8 pb-4 w-full",
        theme === "chambers" ? "px-16 text-left" : "container mx-auto",
        theme === "gazette" && "pt-40",
        theme === "editorial" && "pt-36",
        theme === "chambers" && "pt-2",
        theme === "classic" && "pt-36"
      )}>
        <div className={cn(
          "grid gap-4 w-full",
          theme === "chambers" ? "max-w-5xl" : "",
          theme === "gazette" ? "grid-cols-2 md:grid-cols-4" : 
          theme === "editorial" ? "grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border" : "md:grid-cols-4"
        )}>
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.to} 
              to={item.to} 
              className={cn(
                "group relative flex flex-col p-4 transition-all duration-300",
                theme === "classic" && "rounded-xl border border-border bg-card/80 backdrop-blur hover:border-accent/40 hover:shadow-md hover:-translate-y-1",
                theme === "chambers" && "rounded-lg border border-border bg-card/30 hover:bg-secondary/40 hover:border-accent/30",
                theme === "editorial" && "px-6 py-4 hover:bg-secondary/30",
                theme === "gazette" && "border border-foreground p-6 hover:bg-foreground hover:text-background flex-1"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 mb-2 transition-transform group-hover:scale-110",
                theme === "gazette" ? "text-accent group-hover:text-background" : "text-accent"
              )} />
              <h3 className={cn(
                "font-serif font-bold transition-colors mb-1 leading-tight",
                theme === "gazette" ? "text-sm uppercase tracking-wider" : 
                theme === "editorial" ? "text-base uppercase tracking-widest" : "text-sm",
                (theme === "gazette" ) ? "group-hover:text-background" : "group-hover:text-accent"
              )}>
                {item.title}
              </h3>
              <p className={cn(
                "leading-relaxed opacity-70 flex-1",
                theme === "gazette" ? "text-[10px] font-mono leading-tight" :
                theme === "editorial" ? "text-xs italic" : "text-[10px] font-body"
              )}>
                {item.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
