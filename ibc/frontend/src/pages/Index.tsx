import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useThemeStyle } from "@/contexts/ThemeContext";
import { 
  ArrowRight, Clock, GitBranch, BookOpen, Scale, 
  Landmark, Scroll, Loader2 
} from "lucide-react";

const IBC_PREAMBLE = `An Act to consolidate and amend the laws relating to reorganisation and insolvency resolution of corporate persons, partnership firms and individuals in a time bound manner for maximisation of value of assets of such persons, to promote entrepreneurship, availability of credit and balance the interests of all the stakeholders including alteration in the order of priority of payment of Government dues and to establish an Insolvency and Bankruptcy Board of India, and for matters connected therewith or incidental thereto.

BE it enacted by Parliament in the Sixty-seventh Year of the Republic of India as follows`;

const Index = () => {
  const { theme } = useThemeStyle();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Brief delay to let fonts/styles settle before render
    const t = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(t);
  }, []);

  const NAV_ITEMS = [
    { to: "/browse/ibc", icon: BookOpen, title: "Browse the Code", desc: "Parts, chapters and provisions" },
    { to: "/timeline", icon: Clock, title: "Law as on Date", desc: "May 2016 — Present" },
    { to: "/evolution", icon: GitBranch, title: "Amendment Journey", desc: "Trace changes through time" },
    // { to: "/rules-notifications", icon: Bell, title: "Rules & Notifications", desc: "Regulations, circulars & orders" },
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <ThemeSwitcher />

      {/* ============ CLASSIC ============ */}
      {theme === "classic" && (
        <section className="flex-1 flex flex-col items-center justify-center py-20 px-8 relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-background to-background" />
          <div className="relative max-w-2xl transform -translate-y-8">
            <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-mono tracking-[0.2em] uppercase mb-6">
              Act No. 31 of 2016
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground leading-[1.1] mb-8 tracking-tight">
              The Insolvency and <br/> Bankruptcy Code
            </h1>
            <p className="font-body text-base sm:text-lg leading-relaxed text-muted-foreground italic">
              "{IBC_PREAMBLE}"
            </p>
          </div>
        </section>
      )}

      {/* ============ EDITORIAL ============ */}
      {theme === "editorial" && (
        <section className="flex-1 flex flex-col items-center justify-center py-20 px-12 text-center">
          <div className="max-w-3xl border-y-2 border-foreground py-16">
            <p className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase mb-10">
              The Parliament of India · 2016
            </p>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-black text-foreground leading-[0.85] mb-12 tracking-tighter uppercase">
              The <span className="italic">Insolvency</span><br/>
              & <span className="text-accent underline underline-offset-[10px] decoration-4">Bankruptcy</span><br/>
              Code
            </h1>
            <p className="font-body text-base md:text-xl leading-relaxed text-foreground/80 font-medium max-w-2xl mx-auto">
              {IBC_PREAMBLE}
            </p>
          </div>
        </section>
      )}

      {/* ============ CHAMBERS ============ */}
      {theme === "chambers" && (
        <section className="flex-1 flex flex-col items-center justify-center py-20 px-8 bg-secondary/5 text-center">
          <div className="max-w-2xl">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-8 bg-accent/40" />
              <Landmark className="h-5 w-5 text-accent" />
              <div className="h-px w-8 bg-accent/40" />
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl font-black text-foreground leading-tight mb-8 tracking-tight">
              The Insolvency <br/> & Bankruptcy Code
            </h1>
            <p className="font-serif text-base sm:text-lg leading-relaxed text-foreground/75 italic border-x border-accent/20 px-10 py-2">
              "{IBC_PREAMBLE}"
            </p>
          </div>
        </section>
      )}

      {/* ============ GAZETTE ============ */}
      {theme === "gazette" && (
        <section className="flex-1 flex flex-col items-center justify-center py-20 px-8 text-center bg-[radial-gradient(circle_at_center,var(--secondary)_0%,transparent_100%)]">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-12">
              <div className="flex-1 h-px bg-foreground" />
              <span className="font-mono text-[10px] tracking-[0.5em] text-foreground uppercase font-black">Official Record</span>
              <div className="flex-1 h-px bg-foreground" />
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-black text-foreground leading-[1.0] mb-8 uppercase tracking-[-0.04em]">
              The Insolvency and <br/> Bankruptcy Code
            </h1>
            <div className="relative px-12 group">
              <span className="text-5xl absolute -left-2 -top-4 text-accent font-black opacity-30 select-none">“</span>
              <p className="font-serif text-base sm:text-lg leading-relaxed text-foreground font-medium italic">
                {IBC_PREAMBLE}
              </p>
              <span className="text-5xl absolute -right-2 -bottom-6 text-accent font-black opacity-30 select-none rotate-180 inline-block">“</span>
            </div>
            <div className="mt-16 pt-4 border-t border-foreground inline-block px-12">
              <p className="font-serif text-[10px] tracking-widest text-accent font-bold uppercase">OF INDIA · ACT 31/2016</p>
            </div>
          </div>
        </section>
      )}






      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-auto border-t border-white/5">
        <div className="container px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Scale className="h-5 w-5 text-primary-foreground/50" />
              <span className="font-serif font-semibold text-base tracking-tight">IBC Tracker</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-primary-foreground/40">
              <Link to="/about" className="hover:text-primary-foreground/80 transition-colors">About</Link>
              <span>&copy; {new Date().getFullYear()} XKDR Forum</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
