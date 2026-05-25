import { useState } from "react";
import { UserProfile, RoadmapResponse } from "../types";
import { Bot, RefreshCw, Send, CheckCircle, HelpCircle, Terminal, Flag, Calendar } from "lucide-react";

interface RoadmapAndMentorProps {
  userProfile: UserProfile;
}

export default function RoadmapAndMentor({ userProfile }: RoadmapAndMentorProps) {
  // Roadmap states
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [targetMonths, setTargetMonths] = useState(3);

  // Mentor Chat states
  const [mentorChat, setMentorChat] = useState<{ role: "user" | "bot", text: string }[]>([
    { role: "bot", text: `Greetings, ${userProfile.name}. I am your Cyber-Genome Code Mentor. Drop any compilation diagnostics, recursive arrays, or optimizing queries here. Let's build.` }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);

  const generateRoadmap = async () => {
    setIsGeneratingRoadmap(true);
    try {
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          techStack: userProfile.techStack,
          goal: `Optimize skill index matching for ${userProfile.targetRole} track`,
          months: targetMonths
        })
      });
      const data = await response.json();
      if (data.roadmap) {
        setRoadmap(data.roadmap);
      }
    } catch (e) {
      console.error("Failed to generate learning path:", e);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const sendMentorMessage = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatInput("");
    setMentorChat(prev => [...prev, { role: "user", text: userText }]);
    setIsSendingChat(true);

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
        setMentorChat(prev => [...prev, { role: "bot", text: data.reply }]);
      }
    } catch (e) {
      console.error("Coding mentor contact error:", e);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Personalized Learning Roadmap */}
      <div className="lg:col-span-7 space-y-4">
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Evolution Track & Roadmap
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={targetMonths} 
                  onChange={(e) => setTargetMonths(Number(e.target.value))}
                  className="bg-black/60 border border-white/5 px-2 py-1 rounded text-[10px] font-mono text-cyan-400"
                >
                  <option value={2}>2 Months Pathway</option>
                  <option value={3}>3 Months Pathway</option>
                  <option value={6}>6 Months Pathway</option>
                </select>
                <button
                  onClick={generateRoadmap}
                  disabled={isGeneratingRoadmap}
                  className="p-1 px-2 text-[10px] font-mono font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded flex items-center gap-1 transition"
                >
                  <RefreshCw className={`h-2.5 w-2.5 ${isGeneratingRoadmap ? 'animate-spin' : ''}`} />
                  GENERATE
                </button>
              </div>
            </div>

            {!roadmap ? (
              <div className="h-96 flex flex-col justify-center items-center text-center p-4">
                <div className="h-3.5 w-3.5 rounded-full bg-cyan-400 animate-ping mb-3"></div>
                <h4 className="text-sm font-mono text-cyan-200">System Ready for Sequencing</h4>
                <p className="text-xs text-gray-500 max-w-xs mt-1 leading-relaxed">
                  Generate an AI-optimized milestone schedule tailored to your stacks ({userProfile.techStack.join(", ")}).
                </p>
                <button
                  onClick={generateRoadmap}
                  className="mt-4 px-4 py-2 bg-white/5 border border-white/10 hover:border-cyan-400/30 text-xs font-mono rounded-xl transition text-cyan-400"
                >
                  Initiate Milestone Generator
                </button>
              </div>
            ) : (
              <div className="space-y-5 animate-fadeIn">
                <div className="bg-cyan-500/5 p-3 rounded-xl border border-cyan-500/10 mb-2">
                  <span className="text-[10px] font-mono text-cyan-400 block tracking-widest uppercase">TRACK TITLE</span>
                  <h4 className="text-sm font-bold text-white">{roadmap.title}</h4>
                  <span className="text-[9px] font-mono text-gray-400">{roadmap.estimatedCompletion}</span>
                </div>

                {/* Milestones timeline */}
                <div className="space-y-6 relative pl-4 border-l border-white/10 ml-2">
                  {roadmap.phases.map((phase) => (
                    <div key={phase.phaseNumber} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-cyan-400 border-2 border-slate-950 group-hover:scale-125 transition-all"></span>

                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-400/5 px-2 py-0.5 rounded border border-cyan-500/10">
                          PHASE {phase.phaseNumber} • {phase.weeks}
                        </span>
                      </div>

                      <h5 className="text-xs font-bold text-white">{phase.title}</h5>
                      
                      <ul className="mt-1.5 space-y-1">
                        {phase.topics.map((topic, i) => (
                          <li key={i} className="text-[11px] text-gray-400 flex items-start gap-1">
                            <CheckCircle className="h-3 w-3 text-cyan-400/50 mt-0.5 flex-shrink-0" />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Deliverable info */}
                      <div className="mt-2.5 p-2 bg-black/60 rounded-lg border border-white/5 text-[10px] font-sans">
                        <span className="text-[#ec4899] font-mono font-bold block uppercase tracking-wider text-[8px]">🎯 REQUIRED DELIVERABLE</span>
                        <span className="text-gray-300 font-bold">{phase.projectDeliverable.name}</span>
                        <p className="text-gray-500 mt-0.5">{phase.projectDeliverable.description}</p>
                        <span className="inline-block mt-1 font-mono text-[9px] text-[#22d3ee] bg-[#22d3ee]/5 px-1.5 py-0.5 rounded">
                          {phase.projectDeliverable.tech}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: AI Coding Mentor terminal */}
      <div className="lg:col-span-5 space-y-4">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-950/80 min-h-[500px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 border-b border-white/5 pb-3 mb-4">
              <Terminal className="h-4 w-4 text-purple-400 animate-pulse" />
              <h3 className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold">
                Cyber-Genome Diagnostic Console
              </h3>
            </div>

            {/* Chat Area */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1 pb-4">
              {mentorChat.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex gap-2.5 text-xs animate-fadeIn ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 font-mono font-bold ${
                    msg.role === "user" ? "bg-cyan-500 text-black text-[10px]" : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  }`}>
                    {msg.role === "user" ? "DEV" : "MNT"}
                  </div>
                  <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-cyan-500/10 text-cyan-200 border border-cyan-500/20 rounded-tr-none font-mono text-[11px]"
                      : "bg-white/5 text-gray-300 rounded-tl-none font-sans"
                  }`}>
                    {msg.role === "bot" ? (
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    ) : (
                      <span className="block font-medium">{msg.text}</span>
                    )}
                  </div>
                </div>
              ))}
              {isSendingChat && (
                <div className="flex gap-2.5 text-xs">
                  <div className="h-7 w-7 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-mono font-bold animate-pulse">
                    MNT
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl max-w-[85%] text-gray-500 font-mono animate-pulse">
                    Decoding callstack diagnostics...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Inputs */}
          <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask coding logic, syntax benchmarks, or optimize code..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMentorMessage()}
              className="flex-1 bg-black/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-400 transition text-gray-200 font-mono"
            />
            <button
              onClick={sendMentorMessage}
              disabled={isSendingChat || !chatInput.trim()}
              className="p-2.5 rounded-xl bg-purple-600 text-black hover:bg-purple-500 transition disabled:opacity-30"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
