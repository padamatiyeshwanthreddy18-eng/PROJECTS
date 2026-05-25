import { useState } from "react";
import { UserProfile } from "../types";
import { PRESET_LEADERBOARD, CHANNELS_TRIVIA } from "../data";
import { Trophy, Swords, Sparkles, Shield, Award, Play, Check, AlertCircle } from "lucide-react";

interface CommunityBattlesProps {
  userProfile: UserProfile;
}

export default function CommunityBattles({ userProfile }: CommunityBattlesProps) {
  const [battleActive, setBattleActive] = useState(false);
  const [currentTriviaIndex, setCurrentTriviaIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRoundEvaluated, setIsRoundEvaluated] = useState(false);
  const [opponentName] = useState("AlphaGenome_Bot");
  const [opponentScore, setOpponentScore] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [battleStatus, setBattleStatus] = useState("Awaiting combat matches...");

  const startBattle = () => {
    setPlayerScore(0);
    setOpponentScore(0);
    setCurrentTriviaIndex(0);
    setSelectedOption(null);
    setIsRoundEvaluated(false);
    setBattleActive(true);
    setBattleStatus("Sourcing active training nodes...");
    
    setTimeout(() => {
      setBattleStatus(`Engaged! Dueling ${opponentName} in CS fundamentals.`);
    }, 1200);
  };

  const handleNextOption = (optionIndex: number) => {
    if (isRoundEvaluated) return;
    setSelectedOption(optionIndex);
  };

  const submitTriviaAnswer = () => {
    if (selectedOption === null || isRoundEvaluated) return;

    const correctIndex = CHANNELS_TRIVIA[currentTriviaIndex].answerIndex;
    const isCorrect = selectedOption === correctIndex;

    if (isCorrect) {
      setPlayerScore(prev => prev + 100);
    }
    
    // Simulate opponent randomly scoring or missing (65% accuracy)
    const opponentCorrect = Math.random() < 0.65;
    if (opponentCorrect) {
      setOpponentScore(prev => prev + 100);
    }

    setIsRoundEvaluated(true);
  };

  const nextRound = () => {
    if (currentTriviaIndex < CHANNELS_TRIVIA.length - 1) {
      setCurrentTriviaIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsRoundEvaluated(false);
    } else {
      // Completed last trivia
      setBattleStatus(
        playerScore > opponentScore 
          ? `VICTORY! You defeated ${opponentName}. Mapped +300XP.` 
          : playerScore === opponentScore 
            ? "DRAW! Complete mechanical synchronization computed." 
            : `DEFEAT! ${opponentName} matched target anomalies faster.`
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Dynamic public leaderboard */}
      <div className="lg:col-span-5 space-y-4">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#08080c]/60 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 border-b border-white/5 pb-3 mb-4">
              <Trophy className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Public Rank Leaderboard
              </h3>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {PRESET_LEADERBOARD.map((user) => (
                <div 
                  key={user.rank} 
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                    user.rank === 1 
                      ? "bg-cyan-500/5 border-cyan-400/20" 
                      : "bg-black/30 border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 text-center font-mono font-black text-xs ${
                      user.rank === 1 ? "text-cyan-400" : user.rank === 2 ? "text-purple-400" : "text-gray-500"
                    }`}>
                      #{user.rank}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-gray-200 block">{user.name}</span>
                      <span className="text-[9px] font-mono text-gray-500">{user.role}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-purple-300 block">{user.xp} XP</span>
                    <span className="text-[9px] text-gray-500">{user.streak}D STREAK</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 text-[10px] font-mono text-gray-500 text-center uppercase tracking-widest">
            RANKS COMPILED DAILY AT 00:00 UTC
          </div>
        </div>
      </div>

      {/* Gamified Skill Dueling arena */}
      <div className="lg:col-span-7 space-y-4">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 h-full flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
              <Swords className="h-4 w-4 text-[#ec4899] animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Skill Genome Battles (Simulated Arena)
              </h3>
            </div>

            {!battleActive ? (
              <div className="h-80 flex flex-col justify-center items-center text-center p-4">
                <div className="h-3 w-3 rounded-full bg-[#ec4899] animate-ping mb-3"></div>
                <h4 className="text-sm font-mono text-cyan-200 uppercase">Skill Dueling Arena Offline</h4>
                <p className="text-xs text-gray-500 max-w-xs mt-1.5 leading-relaxed">
                  Duel a virtual diagnostic bot in real-time computer science & systems trivia battles to harvest multipliers.
                </p>
                <button
                  onClick={startBattle}
                  className="mt-6 px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-purple-600 font-mono font-bold text-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-400/15"
                >
                  <Play className="h-3 w-3 fill-black animate-pulse" />
                  INITIALIZE MATCH
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-[#ec4899]/5 p-3 rounded-xl border border-[#ec4899]/15 text-center text-xs font-mono text-pink-300">
                  ⚔️ STATUS: {battleStatus}
                </div>

                {/* Score panel */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] font-mono text-gray-500 block uppercase">YOUR TRANSCRIPT</span>
                    <span className="text-lg font-black font-mono text-cyan-400">{playerScore}</span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] font-mono text-gray-500 block uppercase">{opponentName}</span>
                    <span className="text-lg font-black font-mono text-red-400">{opponentScore}</span>
                  </div>
                </div>

                {/* Current Trivia question */}
                {currentTriviaIndex < CHANNELS_TRIVIA.length ? (
                  <div className="space-y-3">
                    <span className="text-[9px] font-mono text-[#ec4899] block uppercase">
                      TRIVIA MATCH {currentTriviaIndex + 1} OF {CHANNELS_TRIVIA.length}
                    </span>
                    <h4 className="text-xs font-bold text-white">{CHANNELS_TRIVIA[currentTriviaIndex].question}</h4>

                    <div className="space-y-2">
                      {CHANNELS_TRIVIA[currentTriviaIndex].options.map((opt, oIdx) => {
                        const isCorrect = oIdx === CHANNELS_TRIVIA[currentTriviaIndex].answerIndex;
                        const isSelected = selectedOption === oIdx;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleNextOption(oIdx)}
                            className={`w-full p-2.5 rounded-xl text-left text-xs transition border flex items-center justify-between ${
                              isRoundEvaluated 
                                ? isCorrect 
                                  ? "bg-emerald-500/10 border-emerald-400 text-emerald-200" 
                                  : isSelected 
                                    ? "bg-red-500/10 border-red-500 text-red-200" 
                                    : "bg-black/10 border-white/5 text-gray-400"
                                : isSelected 
                                  ? "bg-cyan-500/10 border-cyan-400 text-cyan-200" 
                                  : "bg-black/30 border-white/5 text-gray-300 hover:border-white/10"
                            }`}
                          >
                            <span>{opt}</span>
                            {isRoundEvaluated && isCorrect && <Check className="h-4 w-4 text-emerald-400" />}
                            {isRoundEvaluated && isSelected && !isCorrect && <AlertCircle className="h-4 w-4 text-red-400" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-end pt-2">
                      {!isRoundEvaluated ? (
                        <button
                          onClick={submitTriviaAnswer}
                          disabled={selectedOption === null}
                          className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-bold font-mono text-xs disabled:opacity-30"
                        >
                          LOCK SELECTION
                        </button>
                      ) : (
                        <button
                          onClick={nextRound}
                          className="px-4 py-2 rounded-xl bg-purple-600 text-black font-bold font-mono text-xs uppercase"
                        >
                          {currentTriviaIndex < CHANNELS_TRIVIA.length - 1 ? "NEXT ROUND →" : "COMPILE BATTLE RATING"}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Award className="h-10 w-10 text-yellow-400 mx-auto mb-2 animate-bounce" />
                    <h5 className="text-sm font-bold text-white">DUEL CONCLUDED</h5>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto mb-4 leading-normal">
                      High capacity neural battles completed database parameters sync. Reranking matrix executed.
                    </p>
                    <button
                      onClick={startBattle}
                      className="px-4 py-2 bg-white/5 border border-white/10 text-xs font-mono rounded-xl hover:bg-white/10 transition"
                    >
                      BATTLE AGAIN
                    </button>
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
