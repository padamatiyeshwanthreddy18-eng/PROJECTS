import { useState } from "react";
import { UserProfile } from "../types";
import { FileText, Check, AlertTriangle, ArrowRight, ShieldCheck, Cpu } from "lucide-react";

interface ResumeOptimizerProps {
  userProfile: UserProfile;
}

export default function ResumeOptimizer({ userProfile }: ResumeOptimizerProps) {
  const [resumeText, setResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  const triggerAnalysis = async () => {
    if (!resumeText.trim()) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          targetRole: userProfile.targetRole
        })
      });
      const data = await response.json();
      if (data.resumeAnalysis) {
        setAnalysisResult(data.resumeAnalysis);
      }
    } catch (e) {
      console.error("Failed to analyze resume:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden min-h-[440px] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
                <FileText className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  ATS Scanner & Optimizer
                </h3>
              </div>

              <p className="text-xs text-gray-400 mb-4 leading-relaxed font-sans">
                Paste your raw resume markdown, plain text, or job experience blocks below. Our ATS engine runs heuristic analysis and rewrites sub-optimal bullet points according to the STAR protocol.
              </p>

              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here...&#10;&#10;E.g.:&#10;- Created react elements and did form validation.&#10;- Connected database to express server and monitored bugs."
                className="w-full h-72 bg-black/60 border border-white/5 rounded-2xl p-4 font-mono text-xs text-cyan-200 focus:outline-none focus:border-cyan-500/50 transition resize-none"
              />
            </div>

            <div className="pt-3 border-t border-white/5 flex justify-end">
              <button
                onClick={triggerAnalysis}
                disabled={isAnalyzing || !resumeText.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-mono text-xs font-bold text-black tracking-wider flex items-center gap-1.5 hover:opacity-90 transition disabled:opacity-40"
              >
                {isAnalyzing ? (
                  <>
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-black border-r-transparent rounded-full mr-1"></span>
                    HEURISTIC ATS SCAN...
                  </>
                ) : (
                  <>
                    <Cpu className="h-3.5 w-3.5" />
                    DECONSTRUCT RESUME
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Diagnostics Showcase */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-950/40 min-h-[440px]">
            {!analysisResult ? (
              <div className="h-96 flex flex-col justify-center items-center text-center p-4">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ec4899] animate-ping mb-3"></span>
                <h4 className="text-sm font-mono text-gray-400">Diag Core Offline</h4>
                <p className="text-xs text-gray-500 max-w-xs mt-1 leading-relaxed">
                  Supply experience statements on the left workspace to trigger candidate suitability modeling.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                {/* Score Section */}
                <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl">
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 block uppercase">ATS COMPLIANCY SCALE</span>
                    <span className="text-3xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                      {analysisResult.atsScore}%
                    </span>
                    <span className="text-[11px] font-medium text-gray-400 block mt-1">
                      Verdict: <strong className="text-cyan-400">{analysisResult.verdict}</strong>
                    </span>
                  </div>
                  <div className="h-12 w-12 rounded-full border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center">
                    <ShieldCheck className="h-7 w-7 text-emerald-400" />
                  </div>
                </div>

                {/* Missing keywords */}
                {analysisResult.missingKeywords && analysisResult.missingKeywords.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-purple-400 block uppercase tracking-widest">
                      Missing Target Keywords:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.missingKeywords.map((kw: string, i: number) => (
                        <span 
                          key={i} 
                          className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono text-purple-300"
                        >
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Structural Improvements */}
                {analysisResult.improvements && analysisResult.improvements.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-cyan-400 block uppercase tracking-widest">
                      Critical Structural Action points:
                    </span>
                    <div className="space-y-1">
                      {analysisResult.improvements.map((imp: string, i: number) => (
                        <div key={i} className="flex gap-2 text-xs text-gray-300 items-start">
                          <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>{imp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STAR bullet Optimizer comparison grid */}
                {analysisResult.optimizedBullets && analysisResult.optimizedBullets.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] font-mono text-pink-400 block uppercase tracking-widest">
                      STAR Protocol Optimization Model:
                    </span>
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      {analysisResult.optimizedBullets.map((item: any, i: number) => (
                        <div key={i} className="p-3 bg-black/50 border border-white/5 rounded-xl space-y-1.5 text-[11px]">
                          <div>
                            <span className="text-red-400/70 font-mono text-[9px] block uppercase">ORIGINAL EXPRESSION</span>
                            <span className="text-gray-400">{item.original}</span>
                          </div>
                          <div>
                            <span className="text-emerald-400 font-mono text-[9px] block uppercase font-bold flex items-center gap-1">
                              <Check className="h-3 w-3 text-emerald-400" /> STAR REWRITE (OPTIMAL MATCH)
                            </span>
                            <span className="text-white font-medium">{item.starOptimized}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
