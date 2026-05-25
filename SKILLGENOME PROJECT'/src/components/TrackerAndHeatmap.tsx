import { useState, useEffect } from "react";
import { Play, Square, Award, Flame, FlameKindling, Check, Swords, ShieldAlert, Sparkles, Code2, Terminal, CheckCircle } from "lucide-react";
import { synth } from "../lib/synth";

interface CodingMission {
  id: string;
  title: string;
  category: "backend" | "security" | "algo";
  expReward: number;
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
}

const MISSIONS_LIST: CodingMission[] = [
  {
    id: "shard-join",
    title: "SQL N+1 Join Query Optimization",
    category: "backend",
    expReward: 150,
    question: "A high-traffic repository handles joint queries across User and Skills profiles but suffers from N+1 query limits. Which Prisma schema query pattern fetches relations concurrently?",
    options: [
      { key: "A", text: "prisma.user.findMany({ include: { skills: true } })" },
      { key: "B", text: "prisma.user.findMany().then(users => users.forEach(u => prisma.skill.find(u.id))" }
    ],
    correctAnswer: "A"
  },
  {
    id: "ingress-jwt",
    title: "Patch Authorization Bearer Token Parse",
    category: "security",
    expReward: 250,
    question: "You identified an unauthorized credential parsing breach in the backend API router. How should standard Bearer signature tokens be cleanly extracted from network authorization headers?",
    options: [
      { key: "A", text: "req.headers.authorization.split(' ')[1]" },
      { key: "B", text: "req.body.authorization_signature" }
    ],
    correctAnswer: "A"
  },
  {
    id: "lru-speed",
    title: "Implement O(1) Evicting Cache Matrix",
    category: "algo",
    expReward: 400,
    question: "Which native client-side double-linked keyed dictionary structure maintains O(1) item inserts/lookups while preserving active node eviction order?",
    options: [
      { key: "A", text: "JS Map (which inherently reserves insertion sequence order)" },
      { key: "B", text: "A standard unsorted Object index with timestamp list filters" }
    ],
    correctAnswer: "A"
  }
];

export default function TrackerAndHeatmap() {
  const [isTracking, setIsTracking] = useState(false);
  const [sessionSecs, setSessionSecs] = useState(0);
  const [totalFocusHours, setTotalFocusHours] = useState(24.5);
  const [streak, setStreak] = useState(12);
  const [xpPoints, setXpPoints] = useState(1240);
  const [logs, setLogs] = useState<string[]>([
    "Initial diagnostic server synchronization completed.",
    "Mapped 3 sharded clusters in database simulation."
  ]);

  // Mission States
  const [selectedMission, setSelectedMission] = useState<CodingMission | null>(null);
  const [chosenAnswer, setChosenAnswer] = useState<string | null>(null);
  const [missionStatus, setMissionStatus] = useState<"idle" | "active" | "solved" | "failed">("idle");
  const [solvedMissions, setSolvedMissions] = useState<string[]>([]);


  // Heatmap generation: 7 rows (days) x 24 columns (weeks)
  // Fill with mock activity levels: 0 (no block), 1, 2, 3 (deep dark glowing green)
  const [heatmap, setHeatmap] = useState<number[][]>(() => {
    return Array.from({ length: 7 }, () => 
      Array.from({ length: 26 }, () => Math.floor(Math.random() * 4))
    );
  });

  useEffect(() => {
    let interval: any = null;
    if (isTracking) {
      interval = setInterval(() => {
        setSessionSecs(prev => {
          // Grant XP points periodically for active focus
          if ((prev + 1) % 15 === 0) {
            setXpPoints(p => p + 25);
            setLogs(current => [
              `Focus synchronization pulse. +25XP mapped. Current Session: ${Math.floor((prev + 1) / 60)}m`,
              ...current.slice(0, 4)
            ]);
            // Increment total hours slightly
            setTotalFocusHours(h => parseFloat((h + 0.1).toFixed(1)));
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const toggleTracking = () => {
    if (isTracking) {
      // Stopped session
      setLogs(curr => [`Ended focus epoch. Total duration: ${formatSecs(sessionSecs)}`, ...curr]);
      setIsTracking(false);
    } else {
      setSessionSecs(0);
      setIsTracking(true);
      setLogs(curr => ["Initiated focus session micro-tracker.", ...curr]);
    }
  };

  const formatSecs = (total: number) => {
    const m = Math.floor(total / 60).toString().padStart(2, "0");
    const s = (total % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const cellColors = [
    "bg-[#111] hover:bg-neutral-800 border border-neutral-900/40", 
    "bg-emerald-900/40 border border-emerald-800/10 hover:bg-emerald-800/20", 
    "bg-emerald-700/60 border border-emerald-600/10 hover:bg-emerald-600/30 shadow-[0_0_4px_rgba(16,185,129,0.1)]", 
    "bg-emerald-400 border border-emerald-300/30 hover:bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Timer and active tracking stats */}
      <div className="lg:col-span-5 space-y-4">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#07070a]/90 min-h-[460px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                COGNITIVE DENSITY TRACKER
              </span>
              <span className="flex items-center gap-1 text-[#f43f5e] font-mono font-bold text-xs">
                <Flame className="h-4 w-4 animate-bounce" /> {streak} DAY STREAK
              </span>
            </div>

            {/* Huge StopWatch Timer display */}
            <div className="text-center py-6">
              <span className="text-[10px] font-mono text-gray-500 block uppercase tracking-widest mb-1">
                Active Focus Term
              </span>
              <h3 className="text-5xl font-black font-mono tracking-tight text-white glow-text-blue">
                {formatSecs(sessionSecs)}
              </h3>
              <p className="text-[11px] font-mono text-gray-400 mt-2">
                {isTracking ? "🟢 SEQUENCING INTEGRATION STATE" : "🔴 ENGINE STANDBY"}
              </p>
            </div>

            {/* Stats list */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-[9px] font-mono text-gray-500 block uppercase">COGNITIVE XP</span>
                <span className="text-lg font-bold font-mono text-cyan-400">{xpPoints} P</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-[9px] font-mono text-gray-500 block uppercase">TOTAL HOURS</span>
                <span className="text-lg font-bold font-mono text-purple-400">{totalFocusHours} HRS</span>
              </div>
            </div>

            {/* Control buttons */}
            <button
              onClick={toggleTracking}
              className={`w-full mt-6 py-3 rounded-xl font-bold font-mono text-xs tracking-wider flex items-center justify-center gap-2 transition ${
                isTracking 
                  ? "bg-red-500/20 border border-red-500/30 text-red-200 hover:bg-red-500/30" 
                  : "bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              }`}
            >
              {isTracking ? (
                <>
                  <Square className="h-3.5 w-3.5 fill-current" />
                  TERMINATE FOCUS EPOCH
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  INITIATE FOCUS TIMER
                </>
              )}
            </button>
          </div>

          {/* Core Telemetry logs */}
          <div className="pt-4 border-t border-white/5">
            <span className="text-[9px] font-mono text-gray-500 block uppercase mb-1.5">TELEMETRY DEPLOYMENT LOG</span>
            <div className="font-mono text-[10px] text-gray-400/80 space-y-1 h-20 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="truncate">
                  <span className="text-purple-400 font-bold">&gt;&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Heatmap */}
      <div className="lg:col-span-12 xl:col-span-7 space-y-4">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-black/40">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-mono tracking-wider uppercase flex items-center gap-2">
                <span>CYBER-GENOME ACTIVITY HEATMAP</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 animate-pulse">LIVE FEED</span>
              </h3>
              <p className="text-[10px] text-gray-500">Synchronized matrix mapping of system coding events and database commits.</p>
            </div>
          </div>

          {/* Grid visual */}
          <div className="overflow-x-auto">
            <div className="flex flex-col gap-1 min-w-[500px]">
              {heatmap.map((row, rowIdx) => (
                <div key={rowIdx} className="flex gap-1 items-center">
                  <span className="text-[9px] font-mono text-gray-500 w-6 self-center select-none">
                    {rowIdx === 1 ? "Mon" : rowIdx === 3 ? "Wed" : rowIdx === 5 ? "Fri" : ""}
                  </span>
                  {row.map((val, colIdx) => (
                    <div 
                      key={colIdx} 
                      className={`h-4.5 w-4.5 rounded-[3px] transition-all cursor-pointer ${cellColors[val]}`}
                      title={`Commit factor: ${val}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mt-4 border-t border-white/5 pt-3">
            <span>26 WEEKS RETROSPECTIVE</span>
            <div className="flex gap-1 items-center">
              <span>Less</span>
              <div className="h-3 w-3 bg-[#111] rounded"></div>
              <div className="h-3 w-3 bg-emerald-950 rounded"></div>
              <div className="h-3 w-3 bg-emerald-700 rounded"></div>
              <div className="h-3 w-3 bg-emerald-400 rounded"></div>
              <span>More</span>
            </div>
          </div>
        </div>

        {/* ULTRA-PREMIUM GAMIFIED HUD MISSIONS BLOCK */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 bg-[#07050d]/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex justify-between items-start border-b border-white/5 pb-3 mb-4">
            <div>
              <span className="text-xs font-mono tracking-widest text-purple-400 font-bold uppercase block">
                🧬 QUANTUM COGNITIVE QUEST MATRIX
              </span>
              <span className="text-[10px] text-gray-400">Deploy high-performance patches to secure neural developer matrices.</span>
            </div>
            <Award className="h-5 w-5 text-purple-400 animate-pulse" />
          </div>

          {/* List of selectable missions */}
          {missionStatus === "idle" && (
            <div className="space-y-3">
              {MISSIONS_LIST.map((m) => {
                const isSolved = solvedMissions.includes(m.id);
                return (
                  <div 
                    key={m.id} 
                    className={`p-4 rounded-xl border transition-all ${
                      isSolved 
                        ? "bg-emerald-950/20 border-emerald-500/20 opacity-70"
                        : "bg-black/50 border-white/5 hover:border-purple-400/40 cursor-pointer"
                    }`}
                    onClick={() => {
                      if (!isSolved) {
                        setSelectedMission(m);
                        setMissionStatus("active");
                        setChosenAnswer(null);
                        synth.playScanSwipe();
                      }
                    }}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9px] font-mono uppercase bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold">
                        {m.category}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300 font-bold">
                        +{m.expReward} EXP
                      </span>
                    </div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase">{m.title}</h4>
                    <p className="text-[10px] text-gray-500 mt-1 truncate">Click to decipher shard nodes...</p>
                    {isSolved && (
                      <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1.5 mt-2 font-bold uppercase">
                        <CheckCircle className="h-3.5 w-3.5" /> DEPLOY COMPLETE
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Active solving layout */}
          {missionStatus === "active" && selectedMission && (
            <div className="p-4 bg-black/60 border border-purple-400/20 rounded-xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[9px] font-mono font-bold text-purple-400 tracking-wider">RESOLVING: {selectedMission.title}</span>
                <span className="text-[10px] font-mono font-bold text-cyan-300">{selectedMission.expReward} XP</span>
              </div>
              
              <div className="text-xs font-sans text-gray-200 leading-relaxed bg-black/80 p-3 rounded-lg border border-white/5 font-mono">
                {selectedMission.question}
              </div>

              {/* Choices list */}
              <div className="space-y-2">
                {selectedMission.options.map(o => (
                  <button
                    key={o.key}
                    onClick={() => {
                      setChosenAnswer(o.key);
                      synth.playClick();
                    }}
                    className={`w-full text-left p-3 rounded-lg border text-[11px] font-mono transition-all flex items-center justify-between ${
                      chosenAnswer === o.key
                        ? "bg-purple-500/10 border-purple-400 text-purple-200"
                        : "bg-black/40 border-white/5 text-gray-400 hover:border-white/10"
                    }`}
                  >
                    <span>{o.key}: {o.text}</span>
                    <span className="h-2 w-2 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                      {chosenAnswer === o.key && <span className="h-1 w-1 bg-purple-400 rounded-full" />}
                    </span>
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMissionStatus("idle");
                    setSelectedMission(null);
                    synth.playClick();
                  }}
                  className="flex-1 py-2 rounded-lg border border-white/5 bg-transparent text-gray-500 hover:text-white text-xs font-mono transition"
                >
                  ABORT
                </button>
                <button
                  disabled={!chosenAnswer}
                  onClick={() => {
                    if (chosenAnswer === selectedMission.correctAnswer) {
                      setMissionStatus("solved");
                      setSolvedMissions(prev => [...prev, selectedMission.id]);
                      setXpPoints(prev => prev + selectedMission.expReward);
                      setLogs(prev => [
                        `🟢 DEPLOY SUCCESS: Verified ${selectedMission.title}. Mapped +${selectedMission.expReward}XP`,
                        ...prev.slice(0, 4)
                      ]);
                      synth.playSuccessCadence();
                    } else {
                      setMissionStatus("failed");
                      setLogs(prev => [
                        `🔴 DEPLOY LEAK DETECTED: Failed verification on ${selectedMission.title}. Signature mismatch.`,
                        ...prev.slice(0, 4)
                      ]);
                      synth.playClick();
                    }
                  }}
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-black font-extrabold text-xs font-mono transition uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer disabled:opacity-40"
                >
                  SUBMIT SCAN
                </button>
              </div>
            </div>
          )}

          {/* Solved state animation */}
          {missionStatus === "solved" && selectedMission && (
            <div className="p-6 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-center space-y-4">
              <Sparkles className="h-8 w-8 text-emerald-400 mx-auto animate-bounce" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider">QUANTUM SIGNATURE COMPILING COMPLETE</h4>
                <p className="text-[10px] text-gray-400 mt-1">Successfully deployed high-performance optimizations.</p>
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">+{selectedMission.expReward} XP GAINED</div>
              <button
                onClick={() => {
                  setMissionStatus("idle");
                  setSelectedMission(null);
                  synth.playClick();
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black font-mono font-bold text-xs"
              >
                PROCEED TO MATRIX
              </button>
            </div>
          )}

          {/* Failed state notification */}
          {missionStatus === "failed" && selectedMission && (
            <div className="p-6 bg-red-950/20 border border-red-500/20 rounded-xl text-center space-y-4">
              <ShieldAlert className="h-8 w-8 text-red-500 mx-auto animate-bounce" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider">SECURITY COMPLIANCE REJECTED</h4>
                <p className="text-[10px] text-gray-400 mt-1">Incorrect parameters passed to gateway node authorization sequence.</p>
              </div>
              <div className="text-xs text-red-400 font-mono">STATUS: LEAK THREAT NOT PLACED</div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => {
                    setMissionStatus("active");
                    setChosenAnswer(null);
                    synth.playClick();
                  }}
                  className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-300 font-mono font-bold text-[10px] bg-red-800/20 uppercase"
                >
                  RETRY SEQUENCE
                </button>
                <button
                  onClick={() => {
                    setMissionStatus("idle");
                    setSelectedMission(null);
                    synth.playClick();
                  }}
                  className="px-3 py-1.5 rounded-lg border border-white/5 text-gray-400 font-mono font-bold text-[10px] bg-white/5 uppercase"
                >
                  ABORT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
