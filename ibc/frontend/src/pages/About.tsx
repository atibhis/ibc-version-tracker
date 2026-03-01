import { Header } from "@/components/Header";
import { Scale, BookOpen, GitBranch, Users, FileText, ExternalLink } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 md:px-10 py-14">
        {/* Title */}
        <div className="mb-12">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
            About IBC Tracker
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-xl">
            A living digital reference for the Insolvency and Bankruptcy Code, 2016 — built for
            researchers, practitioners, and students who need to trace how the law has changed over time.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-12" />

        {/* Mission */}
        <section className="mb-12">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Mission</h2>
          <p className="text-foreground/80 leading-relaxed mb-4">
            Indian insolvency law moved quickly after its enactment in 2016. Amendments from Parliament
            and delegated legislation from the Insolvency and Bankruptcy Board of India (IBBI) have
            substantially reshaped the Code. Tracking what the law said on a given date — for purposes
            of litigation, research, or due diligence — has historically required painstaking manual work.
          </p>
          <p className="text-foreground/80 leading-relaxed">
            IBC Tracker automates that work. Every version of each provision is stored, diff-indexed,
            and made browsable. You can read the Code as it stood on any date between May 2016 and today,
            and compare any two versions side by side.
          </p>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-6">What you can do</h2>
          <div className="space-y-5">
            {[
              {
                icon: BookOpen,
                title: "Browse the Code",
                desc: "Navigate the full text of the IBC — Parts, Chapters, Schedules, and every provision — in a clean structured view.",
              },
              {
                icon: Scale,
                title: "Law as on Date",
                desc: "Select any date and see exactly what the Code said on that day. The timeline slider maps every amendment event visually.",
              },
              {
                icon: GitBranch,
                title: "Amendment Journey",
                desc: "Trace how a specific provision evolved through successive amendments. Word-level diffs highlight exactly what changed.",
              },
              {
                icon: FileText,
                title: "Full-text search",
                desc: "Search across all provisions by title or content. Results link directly to the relevant section and highlight your search term.",
              },
            ].map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <f.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-foreground text-sm mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Methodology */}
        <section className="mb-12">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Methodology</h2>
          <p className="text-foreground/80 leading-relaxed mb-4">
            Each version of the Code is sourced from official Government of India gazettes and IBBI
            circulars. Amendments are applied sequentially to build a complete timeline of every
            provision's text. Content is stored in Markdown and rendered server-side, with diff
            computation done at query time to keep the data model simple.
          </p>
          <p className="text-foreground/80 leading-relaxed">
            The platform is non-authoritative — it is intended as a research aid, not a substitute for
            official legal texts. Users are encouraged to verify critical provisions against official
            gazette notifications.
          </p>
        </section>

        {/* Team */}
        <section className="mb-12">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Team</h2>
          <div className="flex items-start gap-4">
            <Users className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-foreground/80 leading-relaxed text-sm">
              IBC Tracker is a project of the{" "}
              <a
                href="https://xkdr.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2 hover:opacity-80 transition-opacity inline-flex items-center gap-1"
              >
                XKDR Forum <ExternalLink className="h-3 w-3" />
              </a>
              , an economics research organisation based in Mumbai. The team works at the intersection
              of law, finance, and data, with a focus on Indian regulatory and market reform.
            </p>
          </div>
        </section>

        <div className="border-t border-border pt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} XKDR Forum. Content sourced from official Government of India gazettes.
          This platform is not a substitute for professional legal advice.
        </div>
      </main>
    </div>
  );
}
