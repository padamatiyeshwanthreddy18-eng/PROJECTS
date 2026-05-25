import { useState } from "react";
import { UserProfile, InterviewQuestion, InterviewEvaluation } from "../types";
import { Play, Sparkles, Send, Lightbulb, User, Bot, Award, CheckCircle2 } from "lucide-react";

interface MockInterviewProps {
  userProfile: UserProfile;
}

export default function MockInterview({ userProfile }: MockInterviewProps) {
  const [sessionActive, setSessionActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [shownHintIndex, setShownHintIndex] = useState<number | null>(null);
  const [interviewHistory, setInterviewHistory] = useState<{ role: "question" | "answer" | "system", content: string }[]>([]);

  const startInterview = async () => {
    setIsLoadingQuestion(true);
    setEvaluation(null);
    setUserAnswer("");
    setShownHintIndex(null);
    try {
      const response = await fetch("/api/interview-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "start", targetRole: userProfile.targetRole })
      });
      const data = await response.json();
      if (data.question) {
        setCurrentQuestion(data.question);
        setSessionActive(true);
        setInterviewHistory([
          { role: "system", content: `Mock session initiated for ${userProfile.targetRole} track.` },
          { role: "question", content: data.question.scenario }
        ]);
      }
    } catch (e) {
      console.error("Failed to fetch interview questions:", e);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || !currentQuestion) return;
    setIsSubmittingAnswer(true);
    try {
      const response = await fetch("/api/interview-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "answer",
          questionId: currentQuestion.id,
          chatHistory: interviewHistory,
          currentAnswer: userAnswer,
          targetRole: userProfile.targetRole
        })
      });
      const data = await response.json();
      if (data.evaluation) {
        setEvaluation(data.evaluation);
        setInterviewHistory(prev => [
          ...prev, 
          { role: "answer", content: userAnswer }
        ]);
      }
    } catch (e) {
      console.error("Failed to submit interview answer:", e);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-panel rounded-2xl border border-white/5 bg-gradient-to-r from-black via-slate-950 to-neutral-900">
        <div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
            Smart Neural Interview Room
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Simulate a high-stress live architectural whiteboard or algorithmic interview aligned on your target: <strong className="text-cyan-400 font-mono text-[11px]">{userProfile.targetRole}</strong>.
          </p>
        </div>
        {!sessionActive && (
          <button
            onClick={startInterview}
            disabled={isLoadingQuestion}
            className="px-5 py-2.5 rounded-xl bg-cyan-400 text-black text-xs font-bold font-mono tracking-wider flex items-center gap-2 hover:bg-cyan-300 transition shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
          >
            {isLoadingQuestion ? (
              <>
                <span className="animate-spin h-3.5 w-3.5 border-2 border-black border-r-transparent rounded-full mr-1"></span>
                FORMULATING SCENARIO...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-black" />
                START MOCK SESSION
              </>
            )}
          </button>
        )}
      </div>

      {sessionActive && currentQuestion && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Question Panel */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-3 right-4 font-mono text-[9px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {currentQuestion.type}
              </div>

              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-3">
                <Bot className="h-4 w-4" />
                <span>INTERVIEWER: MOCK_SYS_{currentQuestion.id}</span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{currentQuestion.title}</h3>
              <p className="text-sm text-gray-300 leading-relaxed font-sans border-l-2 border-cyan-500/30 pl-3 py-1">
                {currentQuestion.scenario}
              </p>

              {/* Hints Drawer */}
              <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3 text-yellow-400" /> Need pointers?
                </span>
                {currentQuestion.hints.map((hint, idx) => (
                  <button
                    key={idx}
                    onClick={() => setShownHintIndex(shownHintIndex === idx ? null : idx)}
                    className="px-2.5 py-1 rounded bg-white/5 border border-white/10 hover:border-white/20 transition text-[9px] font-mono text-gray-400"
                  >
                    {shownHintIndex === idx ? "Hide Hint" : `Reveal Hint ${idx + 1}`}
                  </button>
                ))}
              </div>

              {shownHintIndex !== null && (
                <p className="mt-3 p-3 bg-yellow-500/5 rounded-xl border border-yellow-500/10 text-xs font-mono text-yellow-200/90 leading-normal animate-fadeIn">
                  💡 {currentQuestion.hints[shownHintIndex]}
                </p>
              )}
            </div>

            {/* Answer Input and Sandbox */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-gray-400 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-cyan-400" /> YOUR RESPONSE WORKSPACE
                </span>
                <span className="text-gray-500 select-none">JetBrains Mono / Code Compliant</span>
              </div>

              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="// Write your system design, behavioral, or code-syntactical draft here...&#10;// Detail your scaling paradigms and trade-offs."
                className="w-full h-64 bg-black/60 border border-white/5 rounded-2xl p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition shadow-inner"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={startInterview}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-mono text-gray-400 hover:bg-white/10 transition"
                >
                  RESET PROBLEM
                </button>
                <button
                  onClick={submitAnswer}
                  disabled={isSubmittingAnswer || !userAnswer.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 hover:opacity-90 transition disabled:opacity-40"
                >
                  {isSubmittingAnswer ? (
                    <>
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-black border-r-transparent rounded-full mr-1"></span>
                      EVALUATING GENOME...
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3" />
                      SUBMIT TRANSCRIPT
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Diagnostics / Evaluation Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel p-6 rounded-2xl min-h-[460px] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 border-b border-white/5 pb-3 mb-4">
                  <Award className="h-4 w-4 text-purple-400 animate-pulse" />
                  <h4 className="text-xs font-mono uppercase tracking-widest text-purple-400">
                    Neural Evaluation Diagnostics
                  </h4>
                </div>

                {!evaluation ? (
                  <div className="h-64 flex flex-col justify-center items-center text-center opacity-60">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping mb-3"></span>
                    <p className="text-xs font-mono text-gray-500 max-w-xs leading-relaxed">
                      SUBMIT YOUR WORKPLACE TRANSCRIPT. THE AI ENGINE WILL INTERCEPT YOUR RESPONSE TO COMPILE A FAANG READY RATING MATRIX.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between bg-black/40 p-3.5 rounded-xl border border-white/5">
                      <div>
                        <span className="text-[10px] font-mono text-gray-500 block uppercase">STRESS GRADE</span>
                        <span className={`text-2xl font-black font-mono tracking-tighter ${evaluation.score >= 75 ? "text-emerald-400 glow-blue" : "text-yellow-400"}`}>
                          {evaluation.score} / 100
                        </span>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                        <CheckCircle2 className={`h-6 w-6 ${evaluation.score >= 75 ? "text-emerald-400" : "text-yellow-400"}`} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-cyan-400 block uppercase">CONFIDENCE INDICATOR</span>
                      <p className="text-xs text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5 leading-relaxed font-sans">
                        {evaluation.confidenceAnalysis}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-purple-400 block uppercase">ACTIONABLE POINTERS</span>
                      <p className="text-xs text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5 leading-relaxed font-sans">
                        {evaluation.feedback}
                      </p>
                    </div>

                    {evaluation.revisedCodeExample && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-pink-400 block uppercase">REVISED ARCHITECTURE EXAMPLE</span>
                        <pre className="p-3 bg-black/80 rounded-lg text-[10.5px] font-mono text-pink-200 overflow-x-auto leading-normal whitespace-pre border border-pink-500/10 max-h-48 overflow-y-auto">
                          {evaluation.revisedCodeExample}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {evaluation && (
                <div className="pt-4 border-t border-white/5 text-center">
                  <button
                    onClick={startInterview}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold transition uppercase tracking-wider block w-full text-center"
                  >
                    NEXT WHITEBOARD CASE →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
