import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { 
  Sparkles, ShieldCheck, Flame, Swords, ArrowRight, Code2, 
  Terminal, BarChart3, HelpCircle, Activity, LayoutDashboard, 
  User, Database, Layers, MessageSquare, Menu, X, LogOut, Lock, 
  Briefcase, Compass 
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

import { UserProfile, DeveloperDNAResponse } from "./types";
import { INITIAL_DNA_DUMMY } from "./data";
import { SupportedLanguage, LOCALES } from "./locales";

// Extracted Submodules
import ThreeBackground from "./components/ThreeBackground";
import HelixDNA from "./components/HelixDNA";
import Onboarding from "./components/Onboarding";
import MockInterview from "./components/MockInterview";
import RoadmapAndMentor from "./components/RoadmapAndMentor";
import ResumeOptimizer from "./components/ResumeOptimizer";
import TrackerAndHeatmap from "./components/TrackerAndHeatmap";
import CommunityBattles from "./components/CommunityBattles";
import AdminDeck from "./components/AdminDeck";
import FloatingOrb from "./components/FloatingOrb";
import FuturisticBackButton from "./components/FuturisticBackButton";
import { motion, AnimatePresence } from "motion/react";
import { synth } from "./lib/synth";

export default function App() {
  // Session / Navigation state
  const [lang, setLang] = useState<SupportedLanguage>("en");
  const dict = LOCALES[lang];

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dnaProfile, setDnaProfile] = useState<DeveloperDNAResponse | null>(null);
  const [activeTab, setActiveTab] = useState<string>("genome");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingTabDefaultLogin, setOnboardingTabDefaultLogin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDnaScanning, setIsDnaScanning] = useState(false);

  const [navHistory, setNavHistory] = useState<{ view: "landing" | "onboarding" | "dashboard"; tab?: string }[]>([]);
  const [isScanActive, setIsScanActive] = useState(false);

  const startOnboarding = (isLogin = false) => {
    setOnboardingTabDefaultLogin(isLogin);
    setNavHistory(prev => [...prev, { view: "landing" }]);
    setShowOnboarding(true);
  };

  // Floating Chatbot state
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [botMessages, setBotMessages] = useState<{ role: "user" | "bot", text: string }[]>([]);
  const [botInput, setBotInput] = useState("");

  // Update initial message when language rotates
  useEffect(() => {
    setBotMessages([
      { role: "bot", text: dict.botWelcome }
    ]);
  }, [lang]);

  // Live developer feeds
  const [newsfeed, setNewsfeed] = useState<string>("Initializing quantum telemetry channels...");

  // Load database user profile using access signatures
  const loadUserProfile = async (token: string) => {
    try {
      const response = await fetch("/api/user/me", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.user) {
        const dbUser = data.user;
        const mappedProfile: UserProfile = {
          name: dbUser.fullName,
          level: dbUser.experienceLevel as UserProfile["level"],
          experienceYears: dbUser.experienceLevel === "Senior Engineer" ? 6 : dbUser.experienceLevel === "Mid-Level Dev" ? 3 : 1,
          techStack: dbUser.skills && dbUser.skills.length > 0 ? dbUser.skills.map((s: any) => s.skillName) : ["React / Next.js", "TypeScript"],
          targetRole: dbUser.aiAnalysis?.careerPrediction ? "Lead Software Systems Architect" : "Software Engineer",
          codingHoursPerWeek: dbUser.codingTracker?.codingHours || 35,
          currentScore: dbUser.aiAnalysis?.developerDnaScore || 72
        };

        setUserProfile(mappedProfile);
        setNavHistory(prev => prev.length === 0 ? [{ view: "landing" }] : prev);

        if (dbUser.aiAnalysis) {
          const rawAnalysis = dbUser.aiAnalysis;
          const mappedDna: DeveloperDNAResponse = {
            score: rawAnalysis.developerDnaScore,
            dnaSequence: rawAnalysis.dnaSequence,
            hiringProbability: JSON.parse(rawAnalysis.hiringProbability),
            salaryHelix: JSON.parse(rawAnalysis.salaryPrediction),
            industryFitScore: rawAnalysis.developerDnaScore + 5,
            aiReadinessScore: rawAnalysis.aiReadiness,
            scores: {
              frontend: 80,
              backend: 85,
              aiMl: rawAnalysis.aiReadiness,
              dsa: dbUser.codingTracker?.dsaScore || 65,
              systemDesign: 70,
              devOps: 60
            },
            strengths: [
              "Balanced computer science credentials mapped.",
              "Excellent standard relational backend schemas setup.",
              "Consistent coding telemetry metrics record."
            ],
            weaknesses: JSON.parse(rawAnalysis.weaknessReport),
            roleFitAnalysis: rawAnalysis.careerPrediction
          };
          setDnaProfile(mappedDna);
        }
      } else {
        localStorage.removeItem("sg_access_token");
        localStorage.removeItem("sg_refresh_token");
      }
    } catch (e) {
      console.error("Failed loading persistent identity profiles:", e);
    }
  };

  // 1. Mount Effects: JWT persistence loader and Socket.io active listener
  useEffect(() => {
    const token = localStorage.getItem("sg_access_token");
    if (token) {
      loadUserProfile(token);
    }

    // Connect socket on same domain
    const socket = io();
    socket.on("connect", () => {
      console.log("[Socket.io-Client] Quantum link online.");
    });

    socket.on("realtime_dev_ticks", (data: { text: string }) => {
      setNewsfeed(data.text);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOnboardingComplete = async (profile: UserProfile, token?: string) => {
    setIsDnaScanning(true);
    setShowOnboarding(false);
    
    setNavHistory(prev => [...prev, { view: "onboarding" }]);

    if (token) {
      await loadUserProfile(token);
    } else {
      // Simulator Fallback
      setUserProfile(profile);
      setDnaProfile(INITIAL_DNA_DUMMY);
    }
    setIsDnaScanning(false);
  };

  // Chat counselor endpoint handler
  const sendBotQuickMessage = async () => {
    if (!botInput.trim()) return;
    const userText = botInput;
    setBotInput("");
    setBotMessages(prev => [...prev, { role: "user", text: userText }]);

    try {
      const response = await fetch("/api/chat-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userText }],
          userProfile
        })
      });
      const data = await response.json();
      if (data.reply) {
        setBotMessages(prev => [...prev, { role: "bot", text: data.reply }]);
      }
    } catch (e) {
      console.error("Error communicating with bot counselor:", e);
    }
  };

  const handleBack = () => {
    if (navHistory.length === 0) return;
    
    const previousState = navHistory[navHistory.length - 1];
    setNavHistory(prev => prev.slice(0, -1));

    // Trigger full screen scan line sweep transition
    setIsScanActive(true);
    setTimeout(() => {
      setIsScanActive(false);
    }, 1200);

    // Apply previous state parameters
    if (previousState.view === "landing") {
      setUserProfile(null);
      setDnaProfile(null);
      setShowOnboarding(false);
    } else if (previousState.view === "onboarding") {
      setUserProfile(null);
      setDnaProfile(null);
      setShowOnboarding(true);
    } else if (previousState.view === "dashboard") {
      setShowOnboarding(false);
      if (previousState.tab) {
        setActiveTab(previousState.tab);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("sg_access_token");
    localStorage.removeItem("sg_refresh_token");
    setUserProfile(null);
    setDnaProfile(null);
    setActiveTab("genome");
    setShowOnboarding(false);
    setNavHistory([]);
  };

  // Transform radar scoring metrics dynamically
  const getRadarData = () => {
    if (!dnaProfile) return [];
    return [
      { subject: "Frontend", score: dnaProfile.scores.frontend, fullMark: 100 },
      { subject: "Backend", score: dnaProfile.scores.backend, fullMark: 100 },
      { subject: "DSA / Logic", score: dnaProfile.scores.dsa, fullMark: 100 },
      { subject: "System Design", score: dnaProfile.scores.systemDesign, fullMark: 100 },
      { subject: "DevOps / Ingress", score: dnaProfile.scores.devOps, fullMark: 100 },
      { subject: "AI / ML Integrations", score: dnaProfile.scores.aiMl, fullMark: 100 }
    ];
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col relative hologram-grid overflow-hidden">
      {/* Interactive Premium 3D WebGL Background */}
      <ThreeBackground />

      {/* Futuristic Back Navigation System */}
      <FuturisticBackButton 
        history={navHistory} 
        onBack={handleBack} 
        onTriggerScan={() => {
          setIsScanActive(true);
          setTimeout(() => setIsScanActive(false), 1200);
        }} 
      />

      {/* Cinematic AI Scan Line Animation Sweeper */}
      <AnimatePresence>
        {isScanActive && (
          <motion.div
            initial={{ y: "-10vh", opacity: 0.8 }}
            animate={{ y: "110vh", opacity: [0.8, 1, 0.8] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            className="fixed inset-x-0 h-1.5 z-50 pointer-events-none bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee,0_0_40px_rgba(34,211,238,0.7)]"
          />
        )}
      </AnimatePresence>

      {/* Immersive UI Ambient Glow Backdrops */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-cyan-500/5 rounded-full blur-[150px]"></div>
      </div>

      {/* Scanning laser visual across screen */}
      <div className="absolute top-0 left-0 w-full pointer-events-none overflow-hidden h-[600px] z-20">
        <div className="scanning-line opacity-20"></div>
      </div>

      {/* Primary Header */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-md border-b border-white/5 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-500 p-1 flex items-center justify-center">
            <Layers className="h-full w-full text-black" />
          </div>
          <div>
            <h1 className="text-md font-black tracking-tight font-sans">
              SkillGenome <span className="text-cyan-400">AI</span>
            </h1>
          </div>
        </div>

        {/* Live News tickers */}
        <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-1 rounded-full border border-white/5 max-w-sm overflow-hidden text-[10px] font-mono">
          <Activity className="h-3 w-3 text-[#ec4899] animate-pulse shrink-0" />
          <span className="text-gray-500 uppercase tracking-wider block shrink-0 font-bold">{dict.eventFeed}:</span>
          <span className="text-cyan-300 truncate w-60">{newsfeed}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Immersive Theme Language Dropdown */}
          <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-full px-3 py-1.5 transition hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(34,211,238,0.2)]">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as SupportedLanguage)}
              className="bg-transparent text-[11px] font-mono font-bold text-slate-100 outline-none cursor-pointer border-none select-none appearance-none pr-1 focus:ring-0"
              style={{ WebkitAppearance: 'none' }}
              id="language-selector"
            >
              <option value="en" className="bg-[#05070a] text-slate-100">🇬🇧 ENG</option>
              <option value="it" className="bg-[#05070a] text-slate-100">🇮🇹 ITA</option>
              <option value="es" className="bg-[#05070a] text-slate-100">🇪🇸 ESP</option>
              <option value="de" className="bg-[#05070a] text-slate-100">🇩🇪 DEU</option>
              <option value="fr" className="bg-[#05070a] text-slate-100">🇫🇷 FRA</option>
              <option value="ja" className="bg-[#05070a] text-slate-100">🇯🇵 JPN</option>
              <option value="hi" className="bg-[#05070a] text-slate-100">🇮🇳 HIN</option>
            </select>
          </div>

          {userProfile ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[11px] font-mono px-2.5 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300">
                🧬 {userProfile.name} • XP {userProfile.currentScore * 10 || 720}
              </span>
              <button
                onClick={logout}
                className="p-2 bg-white/5 hover:bg-neutral-800 rounded-xl transition border border-white/5 cursor-pointer"
                title={dict.logoutButton}
                id="logout_btn"
              >
                <LogOut className="h-3.5 w-3.5 text-red-400" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => startOnboarding(true)}
                className="px-3.5 py-1.5 border border-purple-500/30 hover:border-purple-400 bg-purple-500/5 hover:bg-purple-500/10 text-purple-300 rounded-full font-mono text-[11px] transition cursor-pointer select-none font-bold"
                id="login_header_btn"
              >
                LOGIN
              </button>
              <button
                id="sequence_dna_btn"
                onClick={() => startOnboarding(false)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 font-mono text-[11px] text-black font-bold uppercase rounded-full transition hover:scale-[1.02] active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
              >
                {dict.sequenceProfile}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col">
        {/* LANDING PAGE (No profile yet and not in onboarding) */}
        {!userProfile && !showOnboarding && !isDnaScanning && (
          <div className="space-y-24 py-16 px-6 max-w-7xl mx-auto flex-1 flex flex-col justify-center">
            {/* Cinematic Hero */}
            <div className="text-center space-y-6 relative max-w-3xl mx-auto">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1 rounded-full text-[10px] font-mono text-purple-300">
                <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-spin" />
                PREMIUM ECOSYSTEM READY FOR INTEGRATION
              </div>

              <h2 className="text-4xl sm:text-7xl font-black tracking-tighter leading-none pt-4">
                {dict.heroTitle} <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent glow-text-blue">{dict.heroHighlight}</span>
              </h2>

              <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
                {dict.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => startOnboarding(false)}
                  className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-bold text-xs font-mono tracking-wider items-center gap-1.5 rounded-xl hover:opacity-95 transition shadow-lg shadow-cyan-500/25 flex cursor-pointer hover:scale-[1.01]"
                >
                  {dict.startAnalysis}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    // Simulate an exploration view profile
                    setUserProfile({
                      name: "Maya_Hyperion",
                      level: "CS Student",
                      experienceYears: 1,
                      techStack: ["React / Next.js", "TypeScript"],
                      targetRole: "Full Stack Engineer",
                      codingHoursPerWeek: 15,
                      currentScore: 68
                    });
                    setDnaProfile(INITIAL_DNA_DUMMY);
                  }}
                  className="px-6 py-3.5 bg-white/5 border border-white/10 hover:border-cyan-400/30 text-xs font-mono rounded-xl transition text-cyan-400 flex cursor-pointer"
                >
                  {dict.exploreDashboard}
                </button>
              </div>
            </div>

            {/* Visual Bento Demo Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-cyan-500/10 hover:border-cyan-500/25 transition">
                <Code2 className="h-8 w-8 text-cyan-400 mb-4" />
                <h3 className="text-md font-bold text-white mb-2">Architectural Helix Rating</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Sequence your competencies across backend spikes, UI density, algorithms, systems cloud operations, and automated CI/CD configurations.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-purple-500/10 hover:border-purple-500/25 transition">
                <Terminal className="h-8 w-8 text-purple-400 mb-4" />
                <h3 className="text-md font-bold text-white mb-2">Automated Roadmap Evolution</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Produce strict periodic target roadmaps aligned with target FAANG levels. Address weaknesses cleanly with simulated structural advice.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-pink-500/10 hover:border-pink-500/25 transition">
                <Swords className="h-8 w-8 text-pink-400 mb-4" />
                <h3 className="text-md font-bold text-white mb-2">Holographic Dueling Arenas</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Engage sharded virtual matching nodes in rapid-fire system design and programming trivia duels to accelerate your global standing.
                </p>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="pt-10 border-t border-white/5 space-y-12">
              <div className="text-center space-y-3">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block font-bold">SAAS TIERS</span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">{dict.pricingMatrix}</h3>
                <p className="text-xs text-gray-400">Unlock high priority diagnostic limits and global recruitment pipeline matchings.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Tier 1 */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-5">
                  <div>
                    <span className="text-xs font-mono text-gray-500 block uppercase">SANDBOX</span>
                    <h4 className="text-lg font-bold text-white">{dict.starterNode}</h4>
                    <span className="text-2xl font-black font-mono text-cyan-400 mt-2 block">$0 <span className="text-xs text-gray-500 font-sans">/ forever</span></span>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-400">
                    <li>• {dict.starterDesc}</li>
                    <li>• Basic DNA sequency charts</li>
                    <li>• Limited ATS resume optimizes</li>
                  </ul>
                  <button 
                    onClick={() => startOnboarding()}
                    className="w-full py-2 bg-white/5 hover:bg-neutral-800 transition rounded-xl font-mono text-[10px] cursor-pointer"
                  >
                    DEPLOY Starter
                  </button>
                </div>

                {/* Tier 2 (Highlighted) */}
                <div className="glass-panel p-6 rounded-2xl border border-cyan-400/30 transform scale-105 bg-[#05070a]/80 shadow-xl shadow-cyan-400/5 space-y-5">
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-cyan-400 text-black font-mono text-[9px] font-bold">
                    RECOMMENDED PRESET
                  </div>
                  <div>
                    <span className="text-xs font-mono text-cyan-400 block uppercase">PRO DENSITY</span>
                    <h4 className="text-lg font-bold text-white">{dict.genomeEngineer}</h4>
                    <span className="text-2xl font-black font-mono text-cyan-400 mt-2 block">$44 <span className="text-xs text-gray-500 font-sans">/ month</span></span>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-300">
                    <li>• {dict.proDesc}</li>
                    <li>• Unrestricted AI mock technical interviews</li>
                    <li>• Custom STAR resume comparisons</li>
                  </ul>
                  <button 
                    onClick={() => startOnboarding()}
                    className="w-full py-2 bg-cyan-400 text-black hover:opacity-90 transition rounded-xl font-mono text-[10px] font-bold shadow-lg shadow-cyan-400/20 cursor-pointer"
                  >
                    SUBSCRIBE PRO TRACK
                  </button>
                </div>

                {/* Tier 3 */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-5">
                  <div>
                    <span className="text-xs font-mono text-gray-500 block uppercase">ENTERPRISE HUB</span>
                    <h4 className="text-lg font-bold text-white">{dict.genomeEnterprise}</h4>
                    <span className="text-2xl font-black font-mono text-purple-400 mt-2 block">$149 <span className="text-xs text-slate-500 font-sans">/ month</span></span>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-400">
                    <li>• {dict.enterpriseDesc}</li>
                    <li>• Global recruitment pipeline listings</li>
                    <li>• SLA backed telemetry diagnostics</li>
                  </ul>
                  <button 
                    onClick={() => startOnboarding()}
                    className="w-full py-2 bg-white/5 hover:bg-neutral-800 transition rounded-xl font-mono text-[10px] cursor-pointer"
                  >
                    CONTACT SALES
                  </button>
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div className="pt-10 border-t border-white/5 space-y-10 max-w-4xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-center text-white">{dict.solutionsTitle}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-cyan-400">How is my Developer DNA score calculated?</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    We aggregate parameters like current professional standing, reported weekly coding volume, algorithmic selections in battles, and active whiteboards to compute suitability curves out of 100.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-cyan-400">Can I connect real GitHub commits?</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Yes. Mappings are queried through public platform profiles dynamically synced on target role indexes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ONBOARDING MODAL INSTRUCTIONS */}
        {showOnboarding && !isDnaScanning && (
          <div className="py-12 px-6 flex-1 flex items-center justify-center">
            <Onboarding onComplete={handleOnboardingComplete} defaultLoginMode={onboardingTabDefaultLogin} />
          </div>
        )}

        {/* LOADING SEQUENCING SCREEN */}
        {isDnaScanning && (
          <div className="flex-1 flex flex-col justify-center items-center text-center py-20">
            <div className="relative w-28 h-28 mb-6">
              <div className="absolute inset-0 rounded-full border border-cyan-400/20 border-t-cyan-400 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border border-purple-400/10 border-b-purple-400 animate-spin" style={{ animationDirection: "reverse" }}></div>
            </div>
            <h4 className="text-md font-mono text-cyan-300 uppercase tracking-widest animate-pulse">
              Synthesizing Custom Developer Matrix...
            </h4>
            <p className="text-xs text-gray-500 mt-2">Connecting to SkillGenome Cloud Engine</p>
          </div>
        )}

        {/* PRIMARY DASHBOARD (User profile loaded) */}
        {userProfile && dnaProfile && !showOnboarding && !isDnaScanning && (
          <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-65px)]">
            
            {/* Sidebar Navigation */}
            <aside className={`lg:w-64 border-r border-white/5 p-4 flex flex-col justify-between transition-all duration-300 shrink-0 bg-black/40 backdrop-blur-2xl z-10 ${
              isSidebarOpen ? "block" : "hidden lg:block lg:w-16"
            }`}>
              <div className="space-y-4">
                {/* Sidebar Header toggle */}
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4 text-cyan-400" />
                    <span className={`text-[11px] font-mono tracking-wider text-cyan-400/80 uppercase font-bold transition-opacity ${
                      isSidebarOpen ? "opacity-100" : "lg:opacity-0"
                    }`}>
                      {dict.workspaceHub}
                    </span>
                  </div>
                </div>

                {/* Nav Links */}
                <nav className="space-y-1">
                  {[
                    { id: "genome", label: dict.dnaSequence, icon: Layers },
                    { id: "roadmap", label: dict.evolutionTrack, icon: Compass },
                    { id: "interview", label: dict.whiteboardRoom, icon: Terminal },
                    { id: "tracker", label: dict.focusTracker, icon: Flame },
                    { id: "resume", label: dict.atsOptimizer, icon: Briefcase },
                    { id: "battles", label: dict.duelingRank, icon: Swords },
                    { id: "admin", label: dict.adminDeck, icon: LayoutDashboard }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          if (activeTab !== tab.id) {
                            setNavHistory(prev => [...prev, { view: "dashboard", tab: activeTab }]);
                            setActiveTab(tab.id);
                          }
                          synth.playClick();
                        }}
                        onMouseEnter={() => synth.playScanSwipe()}
                        className={`w-full flex items-center gap-2.5 p-3 rounded-xl text-xs font-mono font-medium transition cursor-pointer select-none ${
                          isActive 
                            ? "bg-white/5 border border-white/10 text-cyan-400 shadow-lg" 
                            : "bg-transparent border border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-cyan-400" : ""}`} />
                        <span className={`truncate transition-opacity ${isSidebarOpen ? "opacity-100" : "lg:hidden"}`}>
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar Profile Card footer */}
              {isSidebarOpen && (
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-gray-500">OPERATOR:</span>
                    <span className="text-cyan-400 font-bold">{userProfile.name}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-gray-500">TARGET:</span>
                    <span className="text-purple-400 text-right truncate w-24">{userProfile.targetRole}</span>
                  </div>
                </div>
              )}
            </aside>

            {/* Dashboard Contents Section */}
            <section className="flex-1 p-6 md:p-8 bg-black/40 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === "genome" && (
                  <motion.div
                    key="genome"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                  {/* Performance Indicators Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4 bg-[#05070a]/40">
                      <div className="p-3 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold tracking-wider">{dict.suitabilityScore}</span>
                        <span className="text-2xl font-black font-mono text-white tracking-tight">
                          {dnaProfile.score} / 100
                        </span>
                      </div>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4 bg-[#05070a]/40">
                      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                        <Flame className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold tracking-wider">{dict.aiReadiness}</span>
                        <span className="text-2xl font-black font-mono text-white tracking-tight">
                          {dnaProfile.aiReadinessScore}%
                        </span>
                      </div>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4 bg-[#05070a]/40">
                      <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold tracking-wider">{dict.predictedSalary}</span>
                        <span className="text-lg sm:text-lg font-black font-mono text-[#22d3ee] tracking-tight">
                          ${(dnaProfile.salaryHelix.predictedMin / 1000).toFixed(0)}k - ${(dnaProfile.salaryHelix.predictedMax / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4 bg-[#05070a]/40">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold tracking-wider">{dict.industryFit}</span>
                        <span className="text-2xl font-black font-mono text-white tracking-tight">
                          {dnaProfile.industryFitScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual helix sequence row and Radar indicators */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Helix visual block */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="glass-panel p-6 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                          <span className="text-xs font-mono tracking-widest text-[#ec4899] font-bold uppercase">🧬 {dict.sequenceStrand}</span>
                          <span className="text-[9px] font-mono text-gray-500">{dict.realtimeDecoder}: SYNCHRONIZED</span>
                        </div>
                        <HelixDNA dnaString={dnaProfile.dnaSequence} />
                      </div>

                      {/* Strengths & Role Advisor Advisory */}
                      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 bg-gradient-to-tr from-slate-950/70 to-neutral-900/40">
                        <div>
                          <span className="text-[10px] font-mono text-cyan-400 block uppercase font-bold tracking-widest">{dict.targetRoleSuitability}:</span>
                          <p className="text-xs text-gray-300 mt-1 leading-relaxed font-sans border-l-2 border-cyan-400 pl-3 py-0.5">
                            {dnaProfile.roleFitAnalysis}
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <span className="text-[10px] font-mono text-purple-400 block uppercase font-bold tracking-widest">{dict.identifiedStrengths}:</span>
                          <div className="grid grid-cols-1 gap-2">
                            {dnaProfile.strengths.map((strength, i) => (
                              <div key={i} className="flex gap-2 text-xs text-gray-300 items-start">
                                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0 animate-pulse"></span>
                                <span>{strength}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Radar Ratings chart block */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[360px]">
                        <div>
                          <span className="text-xs font-mono tracking-widest text-cyan-400 font-bold uppercase block pb-2 border-b border-white/5 mb-4">
                            {dict.competencyMap}
                          </span>
                          <div className="h-64 w-full text-xs font-mono selection-transparent">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData()}>
                                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                <PolarAngleAxis dataKey="subject" stroke="#888" tick={{ fontSize: 9 }} />
                                <PolarRadiusAxis stroke="#555" angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                                <Radar 
                                  name="Competency" 
                                  dataKey="score" 
                                  stroke="#a855f7" 
                                  fill="#a855f7" 
                                  fillOpacity={0.25} 
                                  strokeWidth={2}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hiring Probability statistics */}
                  <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#05070a]/20">
                    <span className="text-xs font-mono tracking-widest text-purple-400 font-bold uppercase block pb-2 border-b border-white/5 mb-4">
                      {dict.hiringMeters}
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1.5">
                          <span>FAANG Suitability</span>
                          <span className="text-cyan-400 font-bold">{dnaProfile.hiringProbability.faang}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full" style={{ width: `${dnaProfile.hiringProbability.faang}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1.5">
                          <span>Unicorn Scale Growth suitability</span>
                          <span className="text-cyan-400 font-bold">{dnaProfile.hiringProbability.unicorns}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full" style={{ width: `${dnaProfile.hiringProbability.unicorns}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1.5">
                          <span>Early-Stage agile Startups suitability</span>
                          <span className="text-cyan-400 font-bold">{dnaProfile.hiringProbability.startups}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full" style={{ width: `${dnaProfile.hiringProbability.startups}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weakness analysis blocks */}
                  {dnaProfile.weaknesses && dnaProfile.weaknesses.length > 0 && (
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#05070a]/20">
                      <span className="text-xs font-mono tracking-widest text-[#ec4899] font-bold uppercase block pb-2 border-b border-white/5 mb-4">
                        {dict.weaknessMappings}
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dnaProfile.weaknesses.map((weak, i) => (
                          <div key={i} className="p-4 bg-black/45 border border-white/5 rounded-xl space-y-1.5 relative overflow-hidden">
                            <span className="absolute top-2 right-3 font-mono text-[8px] px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 font-bold uppercase block">
                              Impact: {weak.impact}
                            </span>
                            <h4 className="text-xs font-mono font-bold text-white uppercase">{weak.topic}</h4>
                            <p className="text-[11px] text-gray-400 leading-normal">{weak.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "roadmap" && (
                <motion.div
                  key="roadmap"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <RoadmapAndMentor userProfile={userProfile} />
                </motion.div>
              )}
              {activeTab === "interview" && (
                <motion.div
                  key="interview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <MockInterview userProfile={userProfile} />
                </motion.div>
              )}
              {activeTab === "tracker" && (
                <motion.div
                  key="tracker"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <TrackerAndHeatmap />
                </motion.div>
              )}
              {activeTab === "resume" && (
                <motion.div
                  key="resume"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ResumeOptimizer userProfile={userProfile} />
                </motion.div>
              )}
              {activeTab === "battles" && (
                <motion.div
                  key="battles"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <CommunityBattles userProfile={userProfile} />
                </motion.div>
              )}
              {activeTab === "admin" && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <AdminDeck />
                </motion.div>
              )}
              </AnimatePresence>
            </section>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-black/80 py-8 px-6 border-t border-white/5 text-center text-xs text-gray-600 font-mono">
        <div>© 2026 SKILLGENOME AI. COMPILED WITH PURE MATHEMATICAL DENSITY. ALL PARAMETERS SYNCED EXCLUSIVELY ON INGRESS PORT 3000.</div>
      </footer>

      {/* FLOATING AI ASSISTANT CHATBOT OVERLAY (Only visible for on-boarded users) */}
      {userProfile && (
        <FloatingOrb userProfile={userProfile} />
      )}
    </div>
  );
}
