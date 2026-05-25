import { useState, useEffect, useRef } from "react";
import { Sparkles, MessageSquare, X, Volume2, VolumeX, Terminal, Cpu, Target, HelpCircle } from "lucide-react";
import { synth } from "../lib/synth";
import { motion, AnimatePresence } from "motion/react";

interface FloatingOrbProps {
  userProfile: {
    name: string;
    level: string;
    targetRole: string;
    techStack: string[];
  } | null;
}

type PersonalityType = "mentor" | "evangelist" | "recruiter";

interface Personality {
  id: PersonalityType;
  name: string;
  badge: string;
  avatarText: string;
  icon: any;
  colorClass: string;
  gradient: string;
  welcome: string;
}

const PERSONALITIES: Personality[] = [
  {
    id: "mentor",
    name: "CYBER MENTOR",
    badge: "ANOMALOUS_0x9F",
    avatarText: "CM",
    icon: Terminal,
    colorClass: "text-cyan-400",
    gradient: "from-cyan-500 via-teal-400 to-emerald-500",
    welcome: "Decrypting neural node link... System diagnostic: optimal. Ready to debug your low-level cache buffers, custom React interfaces, or PostgreSQL sharding indexes. Let's hack some code structures."
  },
  {
    id: "evangelist",
    name: "MOTIVATION ARCHITECT",
    badge: "ENERGY_WAVE_99",
    avatarText: "MA",
    icon: Cpu,
    colorClass: "text-purple-400",
    gradient: "from-purple-500 via-pink-500 to-red-500",
    welcome: "BOOM! Welcome to the peak developer matrix! Your skills are sequencing beautifully. You have absolute 10x coding power within. Ask me anything and let's deploy greatness right now!"
  },
  {
    id: "recruiter",
    name: "FAANG GATEKEEPER",
    badge: "RECRUIT_PIPELINE",
    avatarText: "FG",
    icon: Target,
    colorClass: "text-pink-400",
    gradient: "from-pink-500 via-purple-500 to-indigo-500",
    welcome: "Checking curriculum credentials... Target role: calculated. Your current DSA capability registers slightly low for direct L6 algorithmic placement. Ask me a system design query so we can evaluate your architecture limits."
  }
];

export default function FloatingOrb({ userProfile }: FloatingOrbProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [personality, setPersonality] = useState<PersonalityType>("mentor");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string; mode: PersonalityType }[]>([
    { role: "bot", text: PERSONALITIES[0].welcome, mode: "mentor" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Speech parameters
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [synthMuted, setSynthMuted] = useState(synth.getMuted());

  // Waveform animations using raw canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);

  const activePers = PERSONALITIES.find(p => p.id === personality) || PERSONALITIES[0];

  // Draw cyber pulse wave to represent AI Core energy states
  useEffect(() => {
    if (!canvasRef.current && !isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let count = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      // Select style dependent on personality
      let color = "#22d3ee"; // Mentor
      if (personality === "evangelist") color = "#ec4899";
      if (personality === "recruiter") color = "#a855f7";

      count += isTyping ? 0.25 : 0.08;

      ctx.lineWidth = 1.5;
      
      // Ring wave 1
      ctx.strokeStyle = color + "44";
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const angle = (x / width) * Math.PI * 4 + count;
        const y = midY + Math.sin(angle) * (isTyping ? 14 : 6);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Ring wave 2 (shifted phase)
      ctx.strokeStyle = color + "98";
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const angle = (x / width) * Math.PI * 4 - count + 1.2;
        const y = midY + Math.cos(angle) * (isTyping ? 18 : 8);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Matrix vertical grid lines overlay
      ctx.strokeStyle = color + "15";
      ctx.lineWidth = 0.5;
      for (let d = 10; d < width; d += 25) {
        ctx.beginPath();
        const amplitude = Math.sin(count + d) * (isTyping ? 12 : 5);
        ctx.moveTo(d, midY - amplitude);
        ctx.lineTo(d, midY + amplitude);
        ctx.stroke();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [personality, isTyping, isOpen]);

  // Handle TTS output
  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    // Cancel existing
    window.speechSynthesis.cancel();
    
    const cleanText = text.replace(/[*#`_]/g, ""); // Strip markdown snippets
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose appropriate voice characteristics
    if (personality === "recruiter") {
      utterance.pitch = 0.85;
      utterance.rate = 1.05;
    } else if (personality === "evangelist") {
      utterance.pitch = 1.2;
      utterance.rate = 1.15;
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userText = input;
    setInput("");
    synth.playClick();

    setMessages(prev => [...prev, { role: "user", text: userText, mode: personality }]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `[Mode: ${personality}] User input: ${userText}` }],
          userProfile: userProfile ? {
            ...userProfile,
            currentRole: userProfile.targetRole,
            skills: userProfile.techStack
          } : null
        })
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.reply) {
        setMessages(prev => [...prev, { role: "bot", text: data.reply, mode: personality }]);
        speakText(data.reply);
        synth.playSuccessCadence();
      } else {
        const errAnswer = "System communication packet index failed. Decrypt route timeout.";
        setMessages(prev => [...prev, { role: "bot", text: errAnswer, mode: personality }]);
        speakText(errAnswer);
      }
    } catch (e) {
      setIsTyping(false);
      const offlineMsg = "Quantum connection offline. Restoring gateway alignment nodes...";
      setMessages(prev => [...prev, { role: "bot", text: offlineMsg, mode: personality }]);
      speakText(offlineMsg);
    }
  };

  const selectPersonality = (pId: PersonalityType) => {
    setPersonality(pId);
    synth.playClick();
    const targetPers = PERSONALITIES.find(p => p.id === pId);
    if (targetPers) {
      setMessages(prev => [...prev, { role: "bot", text: targetPers.welcome, mode: pId }]);
      speakText(targetPers.welcome);
    }
  };

  const toggleSoundMute = () => {
    const nextMuted = synth.toggleMute();
    setSynthMuted(nextMuted);
    if (nextMuted) {
      setVoiceEnabled(false);
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen ? (
          /* High-Tech Operating System Orb Button */
          <motion.button
            layoutId="orb-container"
            onClick={() => { setIsOpen(true); synth.playClick(); }}
            className="group relative w-16 h-16 rounded-full bg-black/60 border border-cyan-400/20 hover:border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_30px_rgba(34,211,238,0.35)] flex items-center justify-center cursor-pointer select-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Pulsing multi-colored ring waves */}
            <span className="absolute inset-0 rounded-full bg-cyan-500/5 animate-ping" />
            <span className="absolute inset-1.5 rounded-full border border-purple-500/10 animate-spin" style={{ animationDuration: "12s" }} />
            
            {/* Color accent center sphere */}
            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${activePers.gradient} opacity-80 blur-[6px] group-hover:opacity-100 transition absolute`} />
            
            {/* Futuristic vector pattern icon overlay */}
            <div className="relative z-10 flex flex-col items-center">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
              <span className="text-[6px] font-mono tracking-wider font-extrabold text-cyan-300 uppercase block mt-0.5">AI_OS</span>
            </div>
          </motion.button>
        ) : (
          /* Full Quantum AI Operating UI Control Center Dashboard */
          <motion.div
            layoutId="orb-container"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className={`w-[400px] h-[550px] bg-neutral-950/95 border-2 border-white/10 rounded-[28px] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative ${
              personality === "mentor" ? "shadow-cyan-500/10" : personality === "evangelist" ? "shadow-purple-500/10" : "shadow-pink-500/10"
            }`}
          >
            {/* Tech scanner background grid */}
            <div className="absolute inset-0 hologram-grid opacity-10 pointer-events-none z-0" />

            {/* AI Core Voice Monitor & Diagnostic Header */}
            <div className={`p-4 bg-gradient-to-b from-white/[0.03] to-transparent border-b border-white/5 relative z-10`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${activePers.gradient} p-0.5 flex items-center justify-center shrink-0`}>
                    <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center font-bold text-[9px] text-white">
                      {activePers.avatarText}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-mono font-black text-white">{activePers.name}</h4>
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    </div>
                    <span className="text-[8px] font-mono text-gray-500 block uppercase tracking-wider">SECURE AI_OS CORE SYSTEM : {activePers.badge}</span>
                  </div>
                </div>

                {/* Cyber HUD Control Options (Mute, Volume TTS, Close) */}
                <div className="flex items-center gap-2">
                  {/* Synthesis Audio Context status */}
                  <button 
                    onClick={toggleSoundMute}
                    className="p-1 px-1.5 rounded-lg border border-white/5 hover:border-white/10 text-gray-400 hover:text-white text-[9px] font-mono flex items-center gap-1"
                  >
                    {synthMuted ? <VolumeX className="h-3 w-3 text-red-400" /> : <Volume2 className="h-3 w-3 text-cyan-400" />}
                    <span>HUD</span>
                  </button>

                  <button 
                    onClick={() => { setVoiceEnabled(!voiceEnabled); if (voiceEnabled && typeof window !== "undefined") window.speechSynthesis.cancel(); }}
                    className={`p-1 px-1.5 rounded-lg border text-[9px] font-mono flex items-center gap-1 ${
                      voiceEnabled 
                        ? "bg-purple-950/40 border-purple-400 text-purple-300"
                        : "bg-transparent border-white/5 text-gray-500 hover:text-white"
                    }`}
                  >
                    <span>VOICE</span>
                  </button>

                  <button onClick={() => { setIsOpen(false); synth.playClick(); }} className="p-1 text-gray-400 hover:text-white bg-white/5 border border-white/5 rounded-lg transition cursor-pointer">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic Oscilloscope Simulator Canvas */}
              <div className="h-12 border border-white/5 bg-black/60 rounded-xl mt-3 relative overflow-hidden flex items-center justify-center">
                <canvas ref={canvasRef} width={360} height={40} className="w-full h-full" />
                <span className="absolute bottom-1 right-2 font-mono text-[7px] text-gray-600">COGNITIVE_HERTZ_COEFFICIENT</span>
              </div>
            </div>

            {/* Personality Matrix Rotator Selector */}
            <div className="flex bg-neutral-900/60 p-1 border-b border-white/5 text-[9px] font-mono z-10 shrink-0">
              {PERSONALITIES.map((p) => {
                const Icon = p.icon;
                const matches = personality === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => selectPersonality(p.id)}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 uppercase transition-all ${
                      matches 
                        ? "bg-white/5 border border-white/10 font-bold"
                        : "text-gray-500 hover:text-white"
                    }`}
                  >
                    <Icon className={`h-3 w-3 ${matches ? p.colorClass : "text-gray-600"}`} />
                    <span>{p.id}</span>
                  </button>
                );
              })}
            </div>

            {/* Holographic Interactive Stream Chat logs */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto font-mono text-[10px] bg-black/45 relative z-10 flex flex-col rounded-3xl">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed border flex flex-col gap-1 ${
                    msg.role === "user"
                      ? "bg-cyan-950/15 text-cyan-200 border-cyan-500/20"
                      : "bg-white/[0.02] text-slate-300 border-white/5"
                  }`}>
                    {msg.role === "bot" && (
                      <span className="text-[8px] font-bold text-gray-500 block uppercase pb-1 border-b border-white/5 mb-1 tracking-widest">
                        🤖 AI CORE SYSTEM RESPONSE
                      </span>
                    )}
                    <span className="whitespace-pre-line leading-relaxed">{msg.text}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.01] text-gray-500 border border-white/5 p-2 px-3 rounded-xl flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-ping shrink-0" />
                    <span className="text-[9px] font-mono uppercase font-bold tracking-widest">Processing query matrix...</span>
                  </div>
                </div>
              )}
            </div>

            {/* AI Operating Command Entry Frame */}
            <div className="p-3 border-t border-white/5 bg-[#05070a] text-[10px] font-mono relative z-10 shrink-0 flex gap-2">
              <input
                type="text"
                placeholder="Instruct counselor: e.g., 'Conduct a dynamic review'"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2.5 text-slate-100 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 outline-none text-xs"
              />
              <button
                onClick={handleSend}
                disabled={isTyping}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-black font-extrabold uppercase shrink-0 transition active:scale-95 disabled:opacity-50 select-none cursor-pointer"
              >
                EXECUTE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
