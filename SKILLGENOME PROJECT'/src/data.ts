import { LeaderboardUser, DeveloperDNAResponse } from "./types";

export const PRESET_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: "NeonByte_X", role: "AI Infrastructure Architect", xp: 14500, streak: 34, rankBadge: "L9_GENOME" },
  { rank: 2, name: "Aria_CodeStream", role: "Prism Systems Engineer", xp: 13200, streak: 21, rankBadge: "L8_HEURISTIC" },
  { rank: 3, name: "Kaelen_Node", role: "Senior Distributed Engineer", xp: 12900, streak: 18, rankBadge: "L8_HEURISTIC" },
  { rank: 4, name: "CyberDNA", role: "Smart Agent Orchestrator", xp: 11450, streak: 45, rankBadge: "L7_SYNAPSE" },
  { rank: 5, name: "Zane_AlgoMaster", role: "DSA Competitive Lead", xp: 10800, streak: 56, rankBadge: "L7_SYNAPSE" },
  { rank: 6, name: "Sora_Vite", role: "Frontend Visual Craft Lead", xp: 9750, streak: 14, rankBadge: "L6_NUCLEUS" },
  { rank: 7, name: "Dev_Genesis", role: "Full Stack CS Student", xp: 8200, streak: 9, rankBadge: "L5_NUCLEUS" },
  { rank: 8, name: "Maya_Hyperion", role: "Quantum Software Intern", xp: 7500, streak: 6, rankBadge: "L4_HELIX" }
];

export const INITIAL_DNA_DUMMY: DeveloperDNAResponse = {
  score: 68,
  dnaSequence: "ACTG-TTA-GGC-JS-MID-99X",
  hiringProbability: {
    faang: 48,
    unicorns: 58,
    startups: 74
  },
  salaryHelix: {
    currency: "USD",
    predictedMin: 72000,
    predictedMax: 115000,
    timeToMaxMonths: 24
  },
  industryFitScore: 71,
  aiReadinessScore: 55,
  scores: {
    frontend: 75,
    backend: 65,
    aiMl: 40,
    dsa: 60,
    systemDesign: 50,
    devOps: 45
  },
  strengths: [
    "Proficient visual assembly of components and basic responsive states.",
    "Good understanding of fundamental Node.js server flows and API requests.",
    "Committed learning consistency (reports high Weekly Coding hours)."
  ],
  weaknesses: [
    { topic: "CI/CD Orchestration", description: "Minimal exposure to automated integration routines and Docker runtime setups.", impact: "Medium" },
    { topic: "Advanced DSA Optimization", description: "Needs performance improvements during spatial memory assignments in recursive logic.", impact: "High" }
  ],
  roleFitAnalysis: "You possess a highly active visual mindset matching modern Full Stack requirements. Hardening backend scaling concepts will double key recruiter call volumes."
};

export const CHANNELS_TRIVIA = [
  {
    id: "q1",
    question: "Which of the following describes the difference between an optimistic lock and a pessimistic lock?",
    options: [
      "Optimistic locking assumes collisions are rare and checks on commit; pessimistic locking locks rows immediately.",
      "Optimistic locking uses direct thread suspension; pessimistic locking relies exclusively on external memory-fences.",
      "Optimistic locking is only available in NoSQL; pessimistic locking is exclusively for SQL transactions."
    ],
    answerIndex: 0,
    explanation: "Optimistic locking assumes multiple transactions can complete without affecting each other. It check on write. Pessimistic locking locks the resource immediately, preventing any concurrent access."
  },
  {
    id: "q2",
    question: "To prevent browser main thread congestion when processing complex matrix calculations, what approach should you adopt?",
    options: [
      "Incorporate microtasks via Promise.resolve().",
      "Offload calculations to a background Web Worker thread.",
      "Incorporate requestAnimationFrame loops dynamically."
    ],
    answerIndex: 1,
    explanation: "Web Workers allow you to run JavaScript files in background threads, completely isolated from the main browser render loop, preventing UI freezing."
  },
  {
    id: "q3",
    question: "When deploying real-time bidirectionality with multi-node clusters, what is critical to ensure connection state sync?",
    options: [
      "A pub/sub adapter (like Redis) to propagate socket events across servers.",
      "Forced migration to stateless HTTP short-polling protocols.",
      "Dynamic browser memory-maps connected to internal state channels."
    ],
    answerIndex: 0,
    explanation: "Using an event-driven pub/sub proxy adapter allows distinct server nodes to coordinate message alerts to client channels connected elsewhere."
  }
];

export const PRESET_CHALLENGES = [
  { id: 1, title: "Optimizing Sharded DB Clusters", difficulty: "Hard", xp: 500, type: "System Design" },
  { id: 2, title: "LRU Buffer Frame Invalidator", difficulty: "Medium", xp: 300, type: "Coding & Algorithmic" },
  { id: 3, title: "Atomic State Synchronization", difficulty: "Medium", xp: 250, type: "Web Engineering" },
  { id: 4, title: "Multi-Agent Decision Core", difficulty: "Hard", xp: 600, type: "AI & Heuristics" }
];
