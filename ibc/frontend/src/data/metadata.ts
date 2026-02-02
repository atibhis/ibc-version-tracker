export interface TimelineEvent {
  title: string;
  date: string;
  description: string;
  type: "milestone" | "amendment" | "regulatory";
}

export const journeyEvents: TimelineEvent[] = [
  {
    title: "BLRC Report",
    date: "Nov 2015",
    description: "The Bankruptcy Law Reforms Committee submitted its report, recommending a unified insolvency code.",
    type: "milestone"
  },
  {
    title: "Code Enacted",
    date: "May 2016",
    description: "Parliament passed the Insolvency and Bankruptcy Code, 2016.",
    type: "milestone"
  },
  {
    title: "1st Amendment",
    date: "Nov 2017",
    description: "Introduced Section 29A, setting eligibility criteria for resolution applicants.",
    type: "amendment"
  },
  {
    title: "Homebuyers as Creditors",
    date: "Jun 2018",
    description: "Second amendment recognized homebuyers as financial creditors.",
    type: "amendment"
  },
  {
    title: "Pre-pack for MSMEs",
    date: "Apr 2021",
    description: "Introduced Pre-packaged Insolvency Resolution Process (PIRP) for MSMEs.",
    type: "amendment"
  }
];

export const partMetadata: Record<string, { description: string }> = {
  "P1": {
    description: "Establishes the foundational definitions, scope, and application of the Code across India."
  },
  "P2": {
    description: "Comprehensive framework for corporate insolvency resolution process (CIRP) and liquidation proceedings."
  },
  "P3": {
    description: "Framework for individual insolvency resolution, fresh start process, and bankruptcy proceedings."
  },
  "P4": {
    description: "Regulatory framework for insolvency professionals, professional agencies, and information utilities."
  },
  "P5": {
    description: "General provisions including offences, penalties, appeals, and transitional provisions."
  },
  "SCH": {
    description: "Amendments to other laws and procedural details supplementary to the main Code."
  }
};
