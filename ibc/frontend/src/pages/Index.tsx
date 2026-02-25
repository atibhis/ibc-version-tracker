import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useThemeStyle } from "@/contexts/ThemeContext";
import { api } from "@/services/api";
import type { Node, Version } from "@/services/api";
import { 
  ArrowRight, Clock, GitBranch, BookOpen, Scale, Bell, 
  Landmark, Scroll, Loader2 
} from "lucide-react";

const IBC_PREAMBLE = `An Act to consolidate and amend the laws relating to reorganisation and insolvency resolution of corporate persons, partnership firms and individuals in a time bound manner for maximisation of value of assets of such persons, to promote entrepreneurship, availability of credit and balance the interests of all the stakeholders including alteration in the order of priority of payment of Government dues and to establish an Insolvency and Bankruptcy Board of India, and for matters connected therewith or incidental thereto.`;

const Index = () => {
  const { theme } = useThemeStyle();
  const [hierarchy, setHierarchy] = useState<Node[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLandingData = async () => {
      try {
        const [hData, vData] = await Promise.all([
          api.getHierarchy("ibc"),
          api.getVersions("ibc")
        ]);
        setHierarchy(hData);
        setVersions(vData);
      } catch (err) {
        console.error("Failed to load landing data", err);
      } finally {
        setLoading(false);
      }
    };
    loadLandingData();
  }, []);

  const stats = useMemo(() => {
    const partsCount = hierarchy.length;
    const countSections = (nodes: Node[]): number => {
      return nodes.reduce((acc, n) => {
        if (!n.children || n.children.length === 0) return n.node_type === 'section' ? acc + 1 : acc;
        return acc + countSections(n.children);
      }, 0);
    };
    const sectionsCount = countSections(hierarchy);
    const amendmentsCount = Math.max(0, versions.length - 1);
    const totalChapters = hierarchy.reduce((acc, p) => acc + (p.children?.filter(c => c.node_type === 'chapter').length || 0), 0);

    return { partsCount, sectionsCount, amendmentsCount, totalChapters };
  }, [hierarchy, versions]);

  const NAV_ITEMS = [
    { to: "/browse/ibc", icon: BookOpen, title: "Browse the Code", desc: `${stats.partsCount} Parts · ${stats.sectionsCount}+ Sections` },
    { to: "/timeline", icon: Clock, title: "Law as on Date", desc: "May 2016 — Present" },
    { to: "/evolution", icon: GitBranch, title: "Amendment Journey", desc: `${stats.amendmentsCount} Amendments tracked` },
    { to: "/rules-notifications", icon: Bell, title: "Rules & Notifications", desc: "Regulations, circulars & orders" },
    { to: "/about", icon: Scale, title: "About", desc: "Mission & methodology" },
  ];

  const STAT_BLOCKS = [
    { label: "Parts", value: stats.partsCount },
    { label: "Chapters", value: stats.totalChapters },
    { label: "Sections", value: stats.sectionsCount },
    { label: "Amendments", value: stats.amendmentsCount },
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
          <section className="relative py-16 md:py-28 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />
            <div className="container px-4 relative text-center max-w-3xl mx-auto">
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
            <div className="container px-4 py-10 md:py-14 max-w-2xl mx-auto text-center">
              <p className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase mb-4">Preamble</p>
              <blockquote className="font-serif text-sm sm:text-base md:text-lg leading-relaxed text-foreground/80 italic">
                "{IBC_PREAMBLE}"
              </blockquote>
            </div>
          </section>

          <section className="container px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-center">
              {STAT_BLOCKS.map((s) => (
                <div key={s.label} className="p-4 rounded-lg bg-secondary/50">
                  <div className="font-serif text-2xl md:text-3xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground font-sans mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="container px-4 py-8 pb-16">
            <div className="grid gap-4 md:grid-cols-4 max-w-5xl mx-auto">
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

      {/* ============ MODERN ============ */}
      {theme === "modern" && (
        <>
          <section className="relative py-20 md:py-32 bg-primary overflow-hidden">
            <div className="absolute inset-0 opacity-[0.06]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary-foreground)) 1px, transparent 0)`,
              backgroundSize: '28px 28px',
            }} />
            <div className="container px-4 relative">
              <div className="max-w-2xl">
                <p className="font-mono text-xs tracking-widest text-accent uppercase mb-4">
                  India · Act 31 of 2016 · {stats.amendmentsCount} Amendments
                </p>
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground leading-[1.05] mb-5">
                  The Insolvency and Bankruptcy Code
                </h1>
                <p className="text-primary-foreground/60 font-body text-sm sm:text-base leading-relaxed mb-8 max-w-lg mb-10">
                  The definitive digital companion for India's insolvency framework. 
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/browse/ibc" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-accent text-accent-foreground font-sans text-base font-bold hover:shadow-2xl hover:shadow-accent/40 hover:-translate-y-0.5 transition-all">
                    Explore Explorer <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link to="/timeline" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-primary-foreground/20 text-primary-foreground/80 font-sans text-base hover:bg-primary-foreground/5 transition-all">
                    Time Machine
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-secondary/30 border-y border-border">
            <div className="container px-4 py-12 md:py-16 max-w-3xl mx-auto">
              <p className="font-mono text-[10px] tracking-[0.15em] text-accent uppercase mb-4">Preamble</p>
              <p className="font-body text-lg sm:text-xl text-foreground/75 leading-relaxed italic font-light">"{IBC_PREAMBLE}"</p>
            </div>
          </section>

          <section className="container px-4 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Link to="/browse/ibc" className="group col-span-1 md:col-span-2 p-10 rounded-3xl bg-primary text-primary-foreground hover:opacity-95 transition-all shadow-xl">
                <BookOpen className="h-8 w-8 text-accent mb-4" />
                <h3 className="font-serif text-2xl font-bold mb-3">Code Library</h3>
                <p className="text-primary-foreground/60 text-base font-body">{stats.partsCount} Parts · {stats.sectionsCount}+ Sections</p>
              </Link>
              {NAV_ITEMS.slice(1, 4).map((item) => (
                <Link key={item.to} to={item.to} className="group p-10 rounded-3xl border border-border bg-card hover:border-accent/40 shadow-sm hover:shadow-md transition-all">
                  <item.icon className="h-6 w-6 text-accent mb-4" />
                  <h3 className="font-serif text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-xs font-body">{item.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ============ EDITORIAL ============ */}
      {theme === "editorial" && (
        <>
          <section className="container px-4 pt-12 md:pt-24 pb-8">
            <div className="max-w-4xl mx-auto">
              <div className="border-b-2 border-foreground pb-4 mb-8">
                <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                  The Parliament of India · Act No. 31 of 2016
                </p>
              </div>
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground leading-[0.95] mb-8 tracking-tighter">
                The Insolvency<br />
                and Bankruptcy<br />
                Code
              </h1>
              <p className="text-muted-foreground font-body text-lg sm:text-xl leading-relaxed max-w-md mb-10 font-light">
                A digital reference for tracing amendments and provisions through time.
              </p>
              <div className="flex flex-wrap gap-4 mb-16">
                <Link to="/browse/ibc" className="inline-flex items-center gap-3 px-8 py-3 bg-accent text-accent-foreground rounded-none font-sans text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
                  Open Registry <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/timeline" className="inline-flex items-center gap-3 px-8 py-3 border border-foreground/20 rounded-none font-sans text-sm uppercase tracking-widest hover:bg-foreground/5 transition-colors">
                  <Clock className="h-4 w-4" /> Time Map
                </Link>
              </div>
            </div>
          </section>

          <section className="border-y border-foreground/10">
            <div className="container px-4 py-12 md:py-20 max-w-4xl mx-auto">
              <div className="columns-1 md:columns-2 gap-12">
                <p className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase mb-4 break-after-avoid">Preamble</p>
                <p className="font-body text-base leading-relaxed text-foreground/80 first-letter:text-6xl first-letter:font-serif first-letter:font-black first-letter:text-foreground first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                  {IBC_PREAMBLE}
                </p>
              </div>
            </div>
          </section>

          <section className="container px-4 py-16 md:py-24 max-w-4xl mx-auto">
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
          <section className="relative py-16 md:py-28 overflow-hidden bg-secondary/10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="container px-4 relative max-w-5xl mx-auto">
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
                <div className="hidden md:block w-px h-48 bg-border" />
                <div className="md:w-64 space-y-4">
                  {STAT_BLOCKS.map((s) => (
                    <div key={s.label} className="flex items-baseline justify-between border-b border-border/60 pb-3">
                      <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">{s.label}</span>
                      <span className="font-serif text-2xl font-black text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-border bg-card/60">
            <div className="container px-4 py-12 md:py-16 max-w-3xl mx-auto">
              <p className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase mb-4">Official Preamble</p>
              <blockquote className="font-serif text-base sm:text-lg leading-relaxed text-foreground/75 italic border-l-4 border-accent/40 pl-6 py-2">
                "{IBC_PREAMBLE}"
              </blockquote>
            </div>
          </section>

          <section className="container px-4 py-16 md:py-20">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
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
          <section className="container px-4 pt-16 md:pt-24 pb-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-10">
                <Scroll className="h-6 w-6 text-accent" />
                <div className="flex-1 h-px bg-foreground" />
                <span className="font-mono text-[10px] tracking-[0.4em] text-foreground uppercase font-black">Official Record</span>
                <div className="flex-1 h-px bg-foreground" />
              </div>
              <div className="text-center mb-12">
                <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-black text-foreground leading-[1.0] mb-4 uppercase">
                  The Insolvency and Bankruptcy Code
                </h1>
                <p className="font-serif text-xl sm:text-2xl text-accent font-bold tracking-tight italic">OF INDIA · ACT 31/2016</p>
              </div>
              <div className="flex justify-center gap-10 mb-12 py-6 border-y-2 border-foreground/10">
                {STAT_BLOCKS.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="font-mono text-3xl font-black text-foreground">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em] font-bold mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-4 mb-16">
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
            <div className="container px-4 py-16 md:py-24 max-w-3xl mx-auto">
              <p className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase mb-6 text-center font-black">Preamble</p>
              <p className="font-serif text-lg leading-relaxed text-foreground text-center font-medium">
                <span className="text-5xl float-left mr-3 mt-1 text-accent font-black">“</span>
                {IBC_PREAMBLE}
              </p>
            </div>
          </section>

          <section className="container px-4 py-16 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/10 border border-foreground/10">
              {NAV_ITEMS.map((item) => (
                <Link key={item.to} to={item.to} className="group p-8 bg-background hover:bg-secondary/10 transition-all">
                  <div className="flex items-center gap-4 mb-3 text-accent">
                    <item.icon className="h-5 w-5" />
                    <h2 className="font-serif text-lg font-black uppercase tracking-tight group-hover:underline">{item.title}</h2>
                  </div>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed pl-9">{item.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ============ PASTEL ============ */}
      {theme === "pastel" && (
        <>
          <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-secondary/40 via-background to-secondary/30">
            <div className="absolute inset-0 opacity-[0.4] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
            <div className="container px-4 relative text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-accent/10 text-accent text-[10px] font-bold tracking-[0.2em] uppercase mb-8 border border-accent/10">
                <Scale className="h-4 w-4" />
                Registry Act 2016
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black text-foreground leading-[1.1] mb-6 tracking-tight">
                The Insolvency<br />
                and Bankruptcy Code
              </h1>
              <p className="text-muted-foreground font-body text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-12 font-light">
                A seamless digital companion to India's insolvency framework. 
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/browse/ibc" className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-accent text-accent-foreground font-sans text-sm font-bold shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all">
                  Reader <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/timeline" className="inline-flex items-center gap-3 px-8 py-3 rounded-full border-2 border-border text-foreground font-sans text-sm font-bold hover:bg-white hover:border-accent transition-all">
                   Time Machine
                </Link>
              </div>
            </div>
          </section>

          <section className="container px-4 py-4 -mt-10 mb-10 relative z-10">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {STAT_BLOCKS.map((s) => (
                  <div key={s.label} className="p-6 rounded-3xl bg-secondary/80 border border-white backdrop-blur-md shadow-lg text-center">
                    <div className="font-serif text-3xl font-black text-foreground">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-widest mt-1">{s.label}</div>
                  </div>
                ))}
             </div>
          </section>

          <section className="container px-4 py-20 pb-28">
            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {NAV_ITEMS.map((card) => (
                <Link key={card.to} to={card.to} className="group flex flex-col items-center text-center p-8 rounded-[40px] border border-border bg-white/50 hover:bg-white hover:shadow-2xl hover:shadow-secondary transition-all duration-500">
                  <div className="p-4 rounded-full bg-secondary text-accent mb-4 shadow-inner">
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-lg font-black text-foreground group-hover:text-accent transition-colors mb-2 uppercase tracking-tight">{card.title}</h3>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed">{card.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ============ BOLD ============ */}
      {theme === "bold" && (
        <>
          <section className="relative py-24 md:py-40 overflow-hidden bg-background">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-secondary/20 -skew-y-3 origin-bottom-right" />
            <div className="container px-4 relative">
              <div className="max-w-4xl">
                <h1 className="font-serif text-5xl sm:text-6xl md:text-8xl font-black text-foreground leading-[0.9] mb-8 tracking-tighter uppercase p-0 m-0">
                  The Insolvency<br />and <span className="text-accent">Bankruptcy</span> Code
                </h1>
                <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
                   <div className="flex-1">
                      <p className="text-2xl md:text-3xl text-foreground font-black leading-tight mb-8 uppercase tracking-tight">
                        The ultimate digital record of India's insolvency framework.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <Link to="/browse/ibc" className="inline-flex items-center gap-4 px-10 py-4 bg-primary text-primary-foreground font-sans text-base font-black uppercase tracking-tighter hover:bg-accent transition-all skew-x-[-10deg]">
                          <span className="skew-x-[10deg]">Open Registry</span>
                        </Link>
                        <Link to="/timeline" className="inline-flex items-center gap-4 px-10 py-4 border-4 border-primary text-primary font-sans text-base font-black uppercase tracking-tighter hover:bg-primary hover:text-white transition-all skew-x-[-10deg]">
                          <span className="skew-x-[10deg]">Timeline</span>
                        </Link>
                      </div>
                   </div>
                   <div className="flex flex-wrap gap-8 items-center md:flex-col md:items-start p-8 bg-accent text-accent-foreground skew-x-[-10deg]">
                      {STAT_BLOCKS.map(s => (
                        <div key={s.label} className="skew-x-[10deg]">
                           <div className="text-4xl font-black leading-none">{s.value}</div>
                           <div className="text-[10px] font-black uppercase tracking-widest opacity-70 leading-none mt-2">{s.label}</div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </section>

          <section className="container px-4 py-24 md:py-32">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {NAV_ITEMS.map((card) => (
                <Link key={card.to} to={card.to} className="group p-10 bg-card border-l-8 border-primary hover:border-accent hover:bg-secondary/40 transition-all shadow-xl">
                  <card.icon className="h-8 w-8 text-primary group-hover:text-accent mb-6" />
                  <h3 className="font-serif text-xl font-black text-foreground mb-3 uppercase tracking-tighter leading-none">{card.title}</h3>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">{card.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-auto border-t border-white/5">
        <div className="container px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Scale className="h-6 w-6 text-accent" />
              <span className="font-serif font-black text-xl tracking-tighter">IBC VERSION TRACKER</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/40">
              <Link to="/about" className="hover:text-accent transition-colors">About</Link>
              <Link to="/privacy" className="hover:text-accent transition-colors">Methodology</Link>
              <Link to="/contact" className="hover:text-accent transition-colors">Source</Link>
            </div>
            <div className="text-[10px] text-primary-foreground/30 font-medium">
              &copy; {new Date().getFullYear()} XKDR FORUM
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
