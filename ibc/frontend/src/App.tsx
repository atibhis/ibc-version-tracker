import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
// import { ThemeSwitcher } from "@/components/ThemeSwitcher"; // Gazette theme finalized; switcher hidden
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import Timeline from "./pages/Timeline";
import Evolution from "./pages/Evolution";
import About from "./pages/About";

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/browse/:lawCode" element={<Browse />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/evolution" element={<Evolution />} />
            <Route path="/about" element={<About />} />
            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
        {/* <ThemeSwitcher /> */} {/* Gazette theme finalized; switcher hidden */}
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
