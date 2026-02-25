import { FileText } from "lucide-react";

interface JourneyEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "milestone" | "discussion" | "amendment";
}

const journeyEvents: JourneyEvent[] = [
  {
    id: "discussion-1",
    date: "2014",
    title: "The Need for Reform",
    description: "India's insolvency resolution process was fragmented across multiple laws including SICA, Companies Act, and provincial insolvency laws. The World Bank ranked India 136th in resolving insolvency, with an average resolution time of 4.3 years.",
    type: "discussion"
  },
  {
    id: "discussion-2",
    date: "November 2014",
    title: "Bankruptcy Law Reforms Committee",
    description: "The Ministry of Finance constitutes the Bankruptcy Law Reforms Committee (BLRC) under the chairmanship of T.K. Viswanathan to study and recommend reforms to the existing framework.",
    type: "discussion"
  },
  {
    id: "discussion-3",
    date: "November 2015",
    title: "BLRC Report Submitted",
    description: "The Committee submits its report recommending a unified Insolvency and Bankruptcy Code consolidating all existing laws into a single legislation with time-bound resolution.",
    type: "milestone"
  },
  {
    id: "discussion-4",
    date: "December 2015",
    title: "Bill Introduced in Lok Sabha",
    description: "The Insolvency and Bankruptcy Bill, 2015 is introduced in the Lok Sabha and referred to the Joint Committee of Parliament for detailed examination.",
    type: "discussion"
  },
  {
    id: "discussion-5",
    date: "April 2016",
    title: "Joint Committee Report",
    description: "The Joint Committee submits its report with several amendments to strengthen creditor rights and improve the resolution framework.",
    type: "discussion"
  },
  {
    id: "enactment",
    date: "May 28, 2016",
    title: "The Code Comes Into Force",
    description: "The Insolvency and Bankruptcy Code, 2016 receives Presidential assent and is published in the Official Gazette, marking a paradigm shift in India's insolvency regime.",
    type: "milestone"
  },
  {
    id: "amendment-1",
    date: "November 2017",
    title: "1st Amendment",
    description: "The Insolvency and Bankruptcy Code (Amendment) Ordinance, 2017 introduces Section 29A to bar certain persons from submitting resolution plans.",
    type: "amendment"
  },
  {
    id: "amendment-2",
    date: "June 2018",
    title: "2nd Amendment",
    description: "Expands the scope of the Code to include personal guarantors to corporate debtors and partnership firms. Introduces provisions for homebuyers as financial creditors.",
    type: "amendment"
  },
  {
    id: "amendment-3",
    date: "August 2018",
    title: "3rd Amendment",
    description: "Insolvency and Bankruptcy Code (Second Amendment) Act, 2018 further clarifies the voting thresholds and committee of creditors provisions.",
    type: "amendment"
  },
  {
    id: "amendment-4",
    date: "August 2019",
    title: "4th Amendment",
    description: "Raises the minimum default threshold to ₹1 crore and introduces a mandatory 330-day timeline for completion of CIRP including litigation time.",
    type: "amendment"
  },
  {
    id: "amendment-5",
    date: "March 2020",
    title: "5th Amendment",
    description: "COVID-19 related amendments suspending initiation of CIRP for defaults arising during the pandemic period to protect businesses.",
    type: "amendment"
  },
  {
    id: "amendment-6",
    date: "April 2021",
    title: "6th Amendment",
    description: "Introduces pre-packaged insolvency resolution process for MSMEs, providing a faster and cost-effective resolution mechanism.",
    type: "milestone"
  }
];

export const JourneyTimeline = () => {
  return (
    <div className="relative">
      {/* Decorative curved path SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
        preserveAspectRatio="none"
        viewBox="0 0 1200 2000"
      >
        <path
          d="M 100 0 Q 300 200, 200 400 T 400 800 T 200 1200 T 400 1600 T 200 2000"
          fill="none"
          stroke="hsl(var(--gold))"
          strokeWidth="2"
          strokeDasharray="8 4"
        />
      </svg>

      <div className="space-y-0">
        {journeyEvents.map((event, index) => {
          const isEven = index % 2 === 0;
          const isMilestone = event.type === "milestone";

          return (
            <div
              key={event.id}
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Connecting curve */}
              {index < journeyEvents.length - 1 && (
                <svg
                  className="absolute left-1/2 -translate-x-1/2 w-48 h-24 top-full -mt-2 z-0"
                  viewBox="0 0 200 100"
                  preserveAspectRatio="none"
                >
                  <path
                    d={isEven 
                      ? "M 100 0 Q 150 50, 100 100"
                      : "M 100 0 Q 50 50, 100 100"
                    }
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                  />
                </svg>
              )}

              <div
                className={`
                  flex items-start gap-6 md:gap-12 
                  ${isEven ? "md:flex-row" : "md:flex-row-reverse"}
                  flex-col md:items-center
                `}
              >
                {/* Content Card */}
                <div
                  className={`
                    flex-1 max-w-xl
                    ${isEven ? "md:text-right" : "md:text-left"}
                  `}
                >
                  <div
                    className={`
                      p-6 rounded-lg border transition-all duration-300
                      ${isMilestone
                        ? "bg-gold-light border-gold shadow-lg shadow-gold/10"
                        : "bg-card border-border hover:border-accent/50"
                      }
                    `}
                  >
                    <span
                      className={`
                        inline-block text-sm font-mono mb-2
                        ${isMilestone ? "text-gold" : "text-muted-foreground"}
                      `}
                    >
                      {event.date}
                    </span>
                    <h3
                      className={`
                        font-serif text-xl font-semibold mb-3
                        ${isMilestone ? "text-gold" : "text-foreground"}
                      `}
                    >
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground font-body leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>

                {/* Center Node */}
                <div className="relative flex-shrink-0 z-10">
                  <div
                    className={`
                      flex items-center justify-center rounded-full
                      transition-all duration-300
                      ${isMilestone
                        ? "w-14 h-14 bg-gold shadow-lg shadow-gold/30"
                        : "w-10 h-10 bg-accent ring-4 ring-gold-light"
                      }
                    `}
                  >
                    {event.type === "amendment" && (
                      <FileText className={`
                        ${isMilestone ? "h-6 w-6" : "h-4 w-4"} 
                        text-primary-foreground
                      `} />
                    )}
                    {event.type === "milestone" && (
                       <span className="font-serif font-bold text-primary-foreground text-lg">★</span>
                    )}
                    {event.type === "discussion" && (
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                  
                  {/* Vertical line */}
                  {index < journeyEvents.length - 1 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-8 bg-border" />
                  )}
                </div>

                {/* Spacer for alternating layout */}
                <div className="flex-1 max-w-xl hidden md:block" />
              </div>

              {/* Spacing between events */}
              <div className="h-8" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
