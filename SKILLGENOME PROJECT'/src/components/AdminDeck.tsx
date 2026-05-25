import { useState } from "react";
import { Cpu, DollarSign, Database, Server, RefreshCw } from "lucide-react";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area } from "recharts";

const SAMPLE_TELEMETRY = [
  { time: "09:00", cost: 120, load: 45 },
  { time: "10:00", cost: 180, load: 72 },
  { time: "11:00", cost: 240, load: 88 },
  { time: "12:00", cost: 310, load: 95 },
  { time: "13:00", cost: 290, load: 60 },
  { time: "14:00", cost: 350, load: 74 },
  { time: "15:00", cost: 420, load: 82 }
];

export default function AdminDeck() {
  const [apiCost, setApiCost] = useState(245.92);
  const [totalSubscribers, setTotalSubscribers] = useState(1420);
  const [serverStatus, setServerStatus] = useState("OPTIMAL_ACTIVE");

  const regenerateStats = () => {
    setApiCost(parseFloat((200 + Math.random() * 100).toFixed(2)));
    setTotalSubscribers(prev => prev + Math.floor(Math.random() * 20) - 5);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-black/40 p-5 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-400 to-purple-400">
            SkillGenome Administrative Hub
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Compute cost indexes, service latencies, subscriber growths, and global server ingress profiles.
          </p>
        </div>
        <button
          onClick={regenerateStats}
          className="p-2 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl transition text-gray-400"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase">MONTHLY REVENUE RUN rate</span>
              <h3 className="text-3xl font-black font-mono tracking-tight text-white mt-1">
                ${(totalSubscribers * 44).toLocaleString()}
              </h3>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">+12% growth week-over-week</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase">TOTAL SEQUENCED CODENAMES</span>
              <h3 className="text-3xl font-black font-mono tracking-tight text-white mt-1">
                {totalSubscribers} Nodes
              </h3>
            </div>
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Database className="h-5 w-5" />
            </div>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">Average XP accumulation: 4.5k</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase">GEMINI API RUNNING RUN-RATE</span>
              <h3 className="text-3xl font-black font-mono tracking-tight text-pink-400 mt-1 glow-text-purple">
                ${apiCost.toFixed(2)}
              </h3>
            </div>
            <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
              <Cpu className="h-5 w-5" />
            </div>
          </div>
          <span className="text-[10px] font-mono text-pink-300">Tokens tracked: 5.4M input</span>
        </div>
      </div>

      {/* Analytics Graph */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-black/30">
        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-5">
          <div>
            <span className="text-[10px] font-mono text-pink-400 block uppercase tracking-widest">
              TELEMETRY & SERVER LATENCY AGGREGATIONS
            </span>
            <p className="text-xs text-gray-500">Live profiling of container load spikes relative to running query cost index</p>
          </div>
          <span className="px-2.5 py-1 text-[9px] font-mono rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            🟢 SERVER : {serverStatus}
          </span>
        </div>

        <div className="h-64 w-full text-xs font-mono select-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SAMPLE_TELEMETRY}>
              <defs>
                <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#555" />
              <YAxis stroke="#555" />
              <Tooltip 
                contentStyle={{ background: "#060608", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                labelStyle={{ color: "#a855f7" }}
              />
              <Area type="monotone" dataKey="load" stroke="#a855f7" fillOpacity={1} fill="url(#loadGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
