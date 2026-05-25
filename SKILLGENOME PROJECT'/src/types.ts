export interface UserProfile {
  name: string;
  level: "CS Student" | "Junior Dev" | "Mid-Level Dev" | "Senior Engineer";
  experienceYears: number;
  techStack: string[];
  targetRole: string;
  codingHoursPerWeek: number;
  currentScore: number;
}

export interface DNAScoreMap {
  frontend: number;
  backend: number;
  aiMl: number;
  dsa: number;
  systemDesign: number;
  devOps: number;
}

export interface WeaknessAnalysis {
  topic: string;
  description: string;
  impact: "High" | "Medium" | "Low";
}

export interface DeveloperDNAResponse {
  score: number;
  dnaSequence: string;
  hiringProbability: {
    faang: number;
    unicorns: number;
    startups: number;
  };
  salaryHelix: {
    currency: string;
    predictedMin: number;
    predictedMax: number;
    timeToMaxMonths: number;
  };
  industryFitScore: number;
  aiReadinessScore: number;
  scores: DNAScoreMap;
  strengths: string[];
  weaknesses: WeaknessAnalysis[];
  roleFitAnalysis: string;
}

export interface RoadmapPhase {
  phaseNumber: number;
  title: string;
  weeks: string;
  topics: string[];
  projectDeliverable: {
    name: string;
    description: string;
    tech: string;
  };
}

export interface RoadmapResponse {
  title: string;
  estimatedCompletion: string;
  phases: RoadmapPhase[];
}

export interface InterviewQuestion {
  id: string;
  title: string;
  type: "System Design" | "Coding" | "Behavioral";
  scenario: string;
  hints: string[];
}

export interface InterviewEvaluation {
  score: number;
  confidenceAnalysis: string;
  feedback: string;
  revisedCodeExample: string;
}

export interface ProjectSuggestion {
  title: string;
  tagline: string;
  elevatorPitch: string;
  architecture: string;
  suggestedStack: string;
  complexityTicks: number;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  role: string;
  xp: number;
  streak: number;
  rankBadge: string;
}
