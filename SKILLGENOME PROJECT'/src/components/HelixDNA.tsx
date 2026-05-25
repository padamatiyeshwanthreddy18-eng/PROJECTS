import { useState, useEffect } from "react";

interface NodeProps {
  key?: number;
  delay: number;
  colorClass: string;
  char: string;
}

function HelixNode({ delay, colorClass, char }: NodeProps) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Strand A */}
      <div 
        className={`w-3.5 h-3.5 rounded-full ${colorClass} shadow-lg absolute`}
        style={{
          animation: "orbit 3s ease-in-out infinite",
          animationDelay: `${delay}s`,
        }}
      >
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-gray-400 font-bold">
          {char}
        </span>
      </div>
      
      {/* Connector line */}
      <div 
        className="w-[1px] h-16 bg-gradient-to-b from-cyan-500/30 to-purple-500/30 font-mono text-[8px] flex items-center justify-center text-white/10"
        style={{
          animation: "pulse 3s infinite ease-in-out",
          animationDelay: `${delay}s`
        }}
      >
        |
      </div>

      {/* Strand B */}
      <div 
        className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] absolute"
        style={{
          animation: "orbit 3s ease-in-out infinite",
          animationDelay: `${delay + 1.5}s`,
        }}
      >
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-gray-500 font-bold">
          {char === "A" ? "T" : char === "C" ? "G" : "A"}
        </span>
      </div>
    </div>
  );
}

export default function HelixDNA({ dnaString }: { dnaString: string }) {
  const [activeSegment, setActiveSegment] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSegment((prev) => (prev + 1) % 6);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Use dnaString characters or default to ACTG
  const characters = (dnaString || "ACTGAT").replace(/[^ACTG]/gi, "").substring(0, 10).toUpperCase().split("");
  while (characters.length < 6) {
    characters.push("A", "C", "T", "G");
  }

  const colors = [
    "bg-purple-500 shadow-[0_0_12px_#a855f7]",
    "bg-cyan-400 shadow-[0_0_12px_#22d3ee]",
    "bg-fuchsia-500 shadow-[0_0_12px_#d946ef]",
    "bg-emerald-400 shadow-[0_0_12px_#34d399]",
    "bg-pink-500 shadow-[0_0_12px_#ec4899]",
    "bg-indigo-400 shadow-[0_0_12px_#818cf8]"
  ];

  return (
    <div className="relative p-6 rounded-2xl border border-white/5 bg-black/40 overflow-hidden min-h-[190px] flex flex-col justify-between">
      {/* Absolute futuristic decoration */}
      <div className="absolute top-2 right-3 font-mono text-[9px] text-cyan-400/50 tracking-widest animate-pulse">
        DNA_SEQ: {dnaString || "FORMULATING..."}
      </div>

      <div className="flex-1 flex items-center justify-around px-8 mt-5 h-20">
        {characters.slice(0, 6).map((char, index) => (
          <HelixNode 
            key={index} 
            delay={index * 0.4} 
            colorClass={colors[index % colors.length]} 
            char={char} 
          />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-2 text-center text-[10px] font-mono border-t border-white/5 pt-3">
        <div>
          <span className="text-gray-500 block">NUCLEOBASE</span>
          <span className="text-cyan-400 font-bold tracking-wider">A-T BOUND</span>
        </div>
        <div>
          <span className="text-gray-500 block">SYNCHRONY</span>
          <span className="text-purple-400 font-bold">144 FPS</span>
        </div>
        <div>
          <span className="text-gray-500 block">DENSITY</span>
          <span className="text-fuchsia-400 font-bold">ALPHA PRIME</span>
        </div>
      </div>
    </div>
  );
}
