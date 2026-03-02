import { Link } from "react-router-dom";
import { Scale } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto border-t border-white/5 py-8 md:py-2">
      <div className="container px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary-foreground/10 rounded-lg">
              <Scale className="h-6 w-6 text-primary-foreground/40" />
            </div>
            <div>
              <span className="block font-serif font-black text-xl tracking-tight uppercase">Insolvency and Bankruptcy Code</span>
              <span className="block text-[10px] uppercase tracking-[0.3em] opacity-40 font-mono">Version Tracker</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-12 gap-y-4 text-xs uppercase tracking-[0.2em] font-mono">
            <Link 
              to="/about" 
              className="hover:text-accent transition-colors duration-300 font-bold border-b border-transparent hover:border-accent pb-1"
            >
              About
            </Link>
            <div className="flex items-center gap-4 opacity-40">
              <span>&copy; {new Date().getFullYear()} XKDR Forum</span>
              <span className="hidden sm:inline"></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
