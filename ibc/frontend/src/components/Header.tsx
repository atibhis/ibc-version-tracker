import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Clock, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="w-full px-6 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white overflow-hidden border border-border">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="IBC Tracker Logo" className="h-full w-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-serif text-lg font-semibold text-foreground leading-tight">
              IBC Tracker
            </h1>
            <p className="text-xs text-muted-foreground">
              Insolvency & Bankruptcy Code
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans font-medium transition-colors",
              isActive("/") && location.pathname === "/"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link
            to="/browse"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans font-medium transition-colors",
              isActive("/browse")
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Browse</span>
          </Link>
          <Link
            to="/timeline"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans font-medium transition-colors",
              isActive("/timeline")
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Timeline</span>
          </Link>
          <Link
            to="/evolution"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans font-medium transition-colors",
              isActive("/evolution")
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <GitBranch className="h-4 w-4" />
            <span className="hidden sm:inline">Evolution</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
