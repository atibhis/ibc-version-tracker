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
        <>
          <section className="relative py-12 md:py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />
            <div className="container px-8 relative text-center w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-mono tracking-wide mb-6">
                <Scale className="h-3.5 w-3.5" />
                Act No. 31 of 2016
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                The Insolvency and Bankruptcy Code
              </h1>
              <p className="text-muted-foreground font-body text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8">
                Navigate India's landmark insolvency legislation — browse sections,
                trace amendments through time, and see the law as it stood on any date.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/browse/ibc" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-accent-foreground font-sans text-sm font-semibold hover:opacity-90 transition-opacity transition-transform hover:scale-105 active:scale-95 duration-200 shadow-lg shadow-accent/20">
                  Explorer <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/timeline" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-border text-foreground font-sans text-sm font-medium hover:bg-secondary transition-all">
                  <Clock className="h-4 w-4" /> Law as on Date
                </Link>
              </div>
            </div>
          </section>

          <section className="border-y border-border bg-card">
            <div className="container px-8 py-8 md:py-10 w-full text-center">
              <p className="font-sans text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Preamble</p>
              <blockquote className="font-serif text-sm sm:text-base md:text-lg leading-relaxed text-foreground/80 italic">
                "{IBC_PREAMBLE}"
              </blockquote>
            </div>
          </section>



          <section className="container px-8 py-8 pb-16 w-full">
            <div className="grid gap-4 md:grid-cols-4 w-full">
              {NAV_ITEMS.slice(0, 4).map((card) => (
                <Link key={card.to} to={card.to} className="group flex flex-col p-5 rounded-xl border border-border bg-card hover:border-accent/40 hover:shadow-md transition-all">
                  <card.icon className="h-5 w-5 text-accent mb-3" />
                  <h3 className="font-serif text-sm font-bold text-foreground group-hover:text-accent transition-colors mb-1.5">{card.title}</h3>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed flex-1">{card.desc}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent font-sans mt-3">
                    Open <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}



      {/* ============ EDITORIAL ============ */}
      {theme === "editorial" && (
        <>
          <section className="container px-8 pt-4 md:pt-6 pb-2">
            <div className="w-full">
              <div className="border-b-2 border-foreground pb-2 mb-4">
                <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                  The Parliament of India · Act No. 31 of 2016
                </p>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-[0.95] mb-4 tracking-tighter">
                The Insolvency
                and <span className="italic font-serif font-bold">Bankruptcy</span><br />
                Code
              </h1>
              <p className="text-muted-foreground font-body text-sm sm:text-base leading-relaxed max-w-md mb-6 font-light">
                A digital reference for tracing amendments and provisions through time.
              </p>
              <div className="flex flex-wrap gap-4 mb-4">
                <Link to="/browse/ibc" className="inline-flex items-center gap-3 px-8 py-3 bg-accent text-accent-foreground rounded-none font-sans text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
                  Browse <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/timeline" className="inline-flex items-center gap-3 px-8 py-3 border border-foreground/20 rounded-none font-sans text-xs uppercase tracking-widest hover:bg-foreground/5 transition-colors">
                  <Clock className="h-4 w-4" /> Version History
                </Link>
              </div>
            </div>
          </section>

          <section className="border-y border-foreground/10 bg-secondary/5">
            <div className="container px-8 py-8 md:py-10 w-full">
              <div className="columns-1 md:columns-2 gap-12">
                <p className="font-sans text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4 break-after-avoid">Preamble</p>
                <p className="font-body text-base leading-relaxed text-foreground/80 first-letter:text-5xl first-letter:font-serif first-letter:font-black first-letter:text-foreground first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                  {IBC_PREAMBLE}
                </p>
              </div>
            </div>
          </section>

          <section className="container px-8 py-16 md:py-24 w-full">
            <div className="space-y-0 divide-y divide-border border-t border-border">
              {NAV_ITEMS.map((item) => (
                <Link key={item.to} to={item.to} className="group flex items-center justify-between py-8 hover:bg-secondary/20 hover:px-4 transition-all duration-300">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-accent transition-colors">{item.title}</h3>
                    <p className="text-sm text-muted-foreground font-body mt-1">{item.desc}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-2 transition-all" />
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ============ CHAMBERS ============ */}
      {theme === "chambers" && (
        <>
          <section className="relative py-12 md:py-20 overflow-hidden bg-secondary/10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="container px-8 relative w-full">
              <div className="flex flex-col md:flex-row md:items-end gap-10 md:gap-16">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-6">
                    <Landmark className="h-5 w-5 text-accent" />
                    <span className="font-mono text-[10px] tracking-[0.3em] text-accent uppercase font-bold">Registry No. 31/2016</span>
                  </div>
                  <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black text-foreground leading-tight mb-6 tracking-tight">
                    The Insolvency <br/>and Bankruptcy Code
                  </h1>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed max-w-md mb-8 italic">
                    "An official reference for legal scholars and practitioners navigating the evolving landscape of Indian bankruptcy law."
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link to="/browse/ibc" className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-sans text-sm font-bold shadow-xl shadow-accent/20 hover:scale-105 transition-all">
                      Legal Explorer <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link to="/timeline" className="inline-flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-border text-foreground font-sans text-sm font-bold hover:bg-secondary transition-all">
                      <Clock className="h-4 w-4" /> Version History
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </section>

          <section className="border-y border-border bg-card/60">
            <div className="container px-8 py-8 md:py-12 w-full">
              <p className="font-sans text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Official Preamble</p>
              <blockquote className="font-serif text-lg sm:text-xl leading-relaxed text-foreground/75 italic border-l-4 border-accent/40 pl-6 py-2">
                "{IBC_PREAMBLE}"
              </blockquote>
            </div>
          </section>

          <section className="container px-8 py-16 md:py-20">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
              {NAV_ITEMS.map((card) => (
                <Link key={card.to} to={card.to} className="group flex items-start gap-4 p-6 rounded-2xl border border-border bg-card hover:border-accent/40 hover:bg-secondary/40 transition-all shadow-sm">
                  <div className="p-3 rounded-xl bg-accent/10 text-accent">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-sm font-black text-foreground group-hover:text-accent transition-colors mb-1 truncate">{card.title}</h3>
                    <p className="text-xs text-muted-foreground font-body leading-relaxed">{card.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ============ GAZETTE ============ */}
      {theme === "gazette" && (
        <>
          <section className="container px-8 pt-4 md:pt-6 pb-2 text-center">
            <div className="w-full">
              <div className="flex items-center gap-4 mb-6">
                <Scroll className="h-6 w-6 text-accent" />
                <div className="flex-1 h-px bg-foreground" />
                <span className="font-mono text-[10px] tracking-[0.4em] text-foreground uppercase font-black">Official Record</span>
                <div className="flex-1 h-px bg-foreground" />
              </div>
              <div className="mb-6">
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-[1.0] mb-2 uppercase">
                  The Insolvency and Bankruptcy Code
                </h1>
                <p className="font-serif text-base sm:text-lg text-accent font-bold tracking-tight italic">OF INDIA · ACT 31/2016</p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                <Link to="/browse/ibc" className="inline-flex items-center gap-3 px-8 py-3 bg-foreground text-background rounded-none font-sans text-xs font-black uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-all">
                  Read Record <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/timeline" className="inline-flex items-center gap-3 px-8 py-3 border-2 border-foreground rounded-none font-sans text-xs font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all">
                  Time Journal
                </Link>
              </div>
            </div>
          </section>

          <section className="border-y border-foreground bg-secondary/10">
            <div className="container px-8 py-8 md:py-10 w-full">
              <p className="font-sans text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3 text-center">Preamble</p>
              <p className="font-serif text-base leading-relaxed text-foreground text-center font-medium">
                <span className="text-4xl float-left mr-3 mt-1 text-accent font-black">“</span>
                {IBC_PREAMBLE}
              </p>
            </div>
          </section>

          <section className="container px-8 py-16 w-full">
            <div className="space-y-0 divide-y divide-foreground/10 border-t border-foreground/10">
              {NAV_ITEMS.map((item) => (
                <Link key={item.to} to={item.to} className="group flex items-center justify-between py-8 hover:bg-secondary/20 hover:px-4 transition-all duration-300">
                  <div className="flex items-center gap-4 text-accent">
                    <item.icon className="h-5 w-5" />
                    <div>
                      <h3 className="font-serif text-lg font-black uppercase tracking-tight group-hover:underline">{item.title}</h3>
                      <p className="text-xs text-muted-foreground font-body mt-1 lowercase italic">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-2 transition-all" />
                </Link>
              ))}
            </div>
          </section>
        </>
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
