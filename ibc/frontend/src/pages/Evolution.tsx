import { Header } from "@/components/Header";
import { EvolutionFlow } from "@/components/EvolutionFlow";

export default function Evolution() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="container py-12 md:py-20 flex-1">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <h1 className="font-serif text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight">
              The Evolution of IBC
            </h1>
            <p className="text-muted-foreground font-body text-xl max-w-2xl mx-auto font-light leading-relaxed">
              From fragmented insolvency laws to a unified modern code — trace the transformation
              of India's bankruptcy framework.
            </p>
          </div>

          <EvolutionFlow />
        </div>
      </div>
    </div>
  );
}
