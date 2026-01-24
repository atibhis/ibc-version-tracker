import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { PartCard } from "@/components/PartCard";
import { JourneyTimeline } from "@/components/JourneyTimeline";
import { Scale, ArrowRight, CalendarDays, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "../services/api";
import type { Node, Version } from "../services/api";

const Index = () => {
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
        if (!n.children || n.children.length === 0) return acc + 1;
        return acc + countSections(n.children);
      }, 0);
    };
    
    const sectionsCount = countSections(hierarchy);
    const amendmentsCount = versions.length - 1; 
    const latestVersion = versions[versions.length - 1];
    
    let latestDate = "Original Act";
    if (latestVersion) {
      const date = new Date(latestVersion.release_date);
      latestDate = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    }

    return { partsCount, sectionsCount, amendmentsCount, latestDate };
  }, [hierarchy, versions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
        <p className="text-slate-400 font-sans tracking-tight">Syncing with Registry...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      {/* Hero Section - Clean & Compact */}
      <section className="relative py-16 md:py-24 bg-[#F8FAFC] border-b border-slate-100 overflow-hidden">
        <div className="container relative mx-auto px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 text-gold text-[9px] font-black uppercase tracking-[0.2em] mb-8 border border-gold/20">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Registry Status: {stats.latestDate}</span>
            </div>

            <h1 className="font-serif text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-[0.95] tracking-tighter">
              Insolvency & <br/> 
              <span className="text-gold">Bankruptcy Code</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl font-light">
              Navigate the complete legislative framework of India's insolvency law. 
              Review original enactments, track amendments, and compare versions with surgical precision.
            </p>

            <div className="flex flex-wrap gap-6">
              <Button asChild size="lg" className="h-16 px-10 text-xl bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-2xl shadow-slate-900/20 transition-all font-serif">
                <Link to="/browse/ibc" className="gap-4">
                  <Scale className="h-6 w-6 text-gold" />
                  Browse Provisions
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Subtle background graphic */}
        <div className="absolute -right-20 top-20 opacity-[0.03] pointer-events-none select-none hidden lg:block">
           <Scale className="w-[600px] h-[600px]" />
        </div>
      </section>

      {/* Structure Section - Minimalism */}
      <section className="py-32">
        <div className="container mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-12 mb-24">
            <div className="max-w-2xl">
              <h2 className="font-serif text-5xl font-black text-slate-900 mb-6 tracking-tight">
                Code Structure
              </h2>
              <p className="text-xl text-slate-400 font-light leading-relaxed">
                The Code is organized into {stats.partsCount} parts and {stats.sectionsCount} provisions. 
                Each card below provides a gateway into the specific branch of the legal text.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {hierarchy.map((node, index) => (
              <PartCard key={node.id} part={node} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-32 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-8 text-center">
            <h2 className="font-serif text-5xl font-black text-slate-900 mb-10 tracking-tight">Legislative Journey</h2>
            <div className="w-32 h-1.5 bg-gold mx-auto mb-12 rounded-full"></div>
            <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto mb-20">
               Tracing the reform from its 2016 inception through significant regulatory and statutory milestones.
            </p>

          <JourneyTimeline />
        </div>
      </section>

      {/* Legal Footer */}
      <footer className="bg-slate-900 py-24 text-white">
        <div className="container mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 border-b border-white/5 pb-16 mb-16">
            <div className="flex items-center gap-4">
               <div className="bg-gold p-3 rounded-2xl">
                  <Scale className="h-10 w-10 text-slate-900" />
               </div>
               <div>
                  <span className="font-serif font-black text-3xl block tracking-tighter">IBC Registry</span>
                  <span className="text-gold text-[10px] uppercase font-bold tracking-[0.3em]">Version Control System</span>
               </div>
            </div>
            
            <nav className="flex gap-12 text-sm uppercase font-bold tracking-widest text-slate-400">
               <Link to="/" className="hover:text-gold transition-colors">Framework</Link>
               <Link to="/browse/ibc" className="hover:text-gold transition-colors">Explorer</Link>
               <Link to="#" className="hover:text-gold transition-colors">Resources</Link>
            </nav>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-[0.1em]">
             <p>&copy; {new Date().getFullYear()} IBC Version Tracker. Official Legislative Registry.</p>
             <p>Developed for Legal Research & Compliance.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
