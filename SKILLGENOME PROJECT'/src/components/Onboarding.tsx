import { useState } from "react";
import { UserProfile } from "../types";
import { 
  Sparkles, ArrowRight, Check, Code2, Database, Brain, Cpu, 
  Lock, Mail, User, ShieldAlert, Monitor, Upload, 
  Github, KeyRound, CheckCircle2, Chrome 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { synth } from "../lib/synth";

interface OnboardingProps {
  onComplete: (profile: UserProfile, token?: string) => void;
  defaultLoginMode?: boolean;
}

const POPULAR_TECHS = [
  { name: "React / Next.js", category: "frontend", icon: Code2 },
  { name: "TypeScript", category: "frontend", icon: Code2 },
  { name: "Tailwind CSS", category: "frontend", icon: Code2 },
  { name: "Node.js / Express", category: "backend", icon: Database },
  { name: "PostgreSQL", category: "backend", icon: Database },
  { name: "Python / FastAPI", category: "backend", icon: Database },
  { name: "TensorFlow / PyTorch", category: "ai", icon: Brain },
  { name: "Gemini / OpenAI SDK", category: "ai", icon: Sparkles },
  { name: "Docker / Kubernetes", category: "devops", icon: Cpu }
];

export default function Onboarding({ onComplete, defaultLoginMode = false }: OnboardingProps) {
  const [isLoginMode, setIsLoginMode] = useState(defaultLoginMode);
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Registration Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [level, setLevel] = useState<UserProfile["level"]>("CS Student");
  const [targetRole, setTargetRole] = useState("Full Stack Engineer");
  const [codingHours, setCodingHours] = useState(15);
  const [selectedTech, setSelectedTech] = useState<string[]>(["React / Next.js", "TypeScript"]);
  const [bio, setBio] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [isResumeDragging, setIsResumeDragging] = useState(false);

  // Login Inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // MFA OTP Handshake State
  const [mfaRequired, setMfaRequired] = useState(false);
  const [pendingMfaUserId, setPendingMfaUserId] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [simulatedOtp, setSimulatedOtp] = useState("");

  // Forgotten credential recovery option
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryOtp, setRecoveryOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoveryStep, setRecoveryStep] = useState(1); // 1 = input email, 2 = verify and reset

  // Holographic Sequencing Status
  const [isSequencing, setIsSequencing] = useState(false);
  const [sequenceStatus, setSequenceStatus] = useState("");

  // Interactive Social OAuth Dialog States
  const [activeOAuthProvider, setActiveOAuthProvider] = useState<"Google" | "Apple" | "GitHub" | null>(null);
  const [customOauthEmail, setCustomOauthEmail] = useState("");
  const [customOauthName, setCustomOauthName] = useState("");

  const toggleTech = (tech: string) => {
    setSelectedTech(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech) 
        : [...prev, tech]
    );
  };

  const handleNextStep = () => {
    setErrorMessage("");
    synth.playClick();
    if (step === 1) {
      if (!email.trim() || !password.trim() || !fullName.trim() || !username.trim()) {
        setErrorMessage("Please fill all core credentials to sequence your security index.");
        return;
      }
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      triggerSignupSequence();
    }
  };

  // 1. Submit Multi-step Sign up to DB
  const triggerSignupSequence = async () => {
    setErrorMessage("");
    setIsSequencing(true);
    setSequenceStatus("Starting neural nucleobase aligner...");

    const timeline = [
      { text: "Registering decentralized metadata nodes...", delay: 600 },
      { text: "Validating secure crypt password signatures...", delay: 1400 },
      { text: "Sequencing initial Developer DNA double helix...", delay: 2400 },
      { text: "Aligning workspace pipeline configurations...", delay: 3400 }
    ];

    timeline.forEach(({ text, delay }) => {
      setTimeout(() => setSequenceStatus(text), delay);
    });

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          username,
          experienceLevel: level,
          techStack: selectedTech,
          targetRole,
          codingHours,
          bio,
          githubUsername: githubUrl || username,
          dsaLevel: level === "Senior Engineer" ? "Advanced" : "Intermediate"
        })
      });

      const data = await response.json();
      
      setTimeout(() => {
        if (!response.ok) {
          setIsSequencing(false);
          setErrorMessage(data.error || "Signup sequencing disengaged.");
          return;
        }

        // Save tokens
        localStorage.setItem("sg_access_token", data.accessToken);
        localStorage.setItem("sg_refresh_token", data.refreshToken);
        synth.playLevelUpChime();

        onComplete({
          name: fullName,
          level,
          experienceYears: level === "Senior Engineer" ? 6 : level === "Mid-Level Dev" ? 3 : 1,
          techStack: selectedTech,
          targetRole,
          codingHoursPerWeek: codingHours,
          currentScore: 72
        }, data.accessToken);
      }, 4200);

    } catch (err: any) {
      setTimeout(() => {
        setIsSequencing(false);
        setErrorMessage("Workspace gateway offline. Please retry credential sequencing.");
      }, 4200);
    }
  };

  // 2. Submit Sign-In Creds
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!loginEmail || !loginPassword) {
      setErrorMessage("Enter registered email and password.");
      return;
    }

    setIsSequencing(true);
    setSequenceStatus("Authenticating core security nodes...");
    synth.playScanSwipe();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await response.json();

      setTimeout(() => {
        setIsSequencing(false);

        if (!response.ok) {
          setErrorMessage(data.error || "Authentication decryption mismatched.");
          return;
        }

        localStorage.setItem("sg_access_token", data.accessToken);
        localStorage.setItem("sg_refresh_token", data.refreshToken);
        synth.playLevelUpChime();

        onComplete({
          name: data.user.fullName,
          level: "Mid-Level Dev",
          experienceYears: 3,
          techStack: ["React / Next.js", "TypeScript", "Node.js / Express"],
          targetRole: "Full Stack Engineer",
          codingHoursPerWeek: 40,
          currentScore: 84
        }, data.accessToken);
      }, 1200);
    } catch (err) {
      setIsSequencing(false);
      setErrorMessage("Workspace connectivity offline.");
    }
  };

  // 3. Confirm MFA Handshake OTP
  const handleValidateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!otpInput) return;

    setIsSequencing(true);
    setSequenceStatus("Validating system security passcodes...");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pendingMfaUserId, otp: otpInput })
      });

      const data = await response.json();

      setTimeout(() => {
        if (!response.ok) {
          setIsSequencing(false);
          setErrorMessage(data.error || "Handshake rejected.");
          return;
        }

        localStorage.setItem("sg_access_token", data.accessToken);
        localStorage.setItem("sg_refresh_token", data.refreshToken);
        synth.playLevelUpChime();

        onComplete({
          name: data.user.fullName,
          level: "Mid-Level Dev",
          experienceYears: 3,
          techStack: ["React / Next.js", "TypeScript", "Node.js / Express"],
          targetRole: "Full Stack Engineer",
          codingHoursPerWeek: 40,
          currentScore: 84
        }, data.accessToken);
      }, 1500);

    } catch (err) {
      setIsSequencing(false);
      setErrorMessage("Handshake verification failed.");
    }
  };

  // 4. Trigger recovery credentials
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!recoveryEmail) return;

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail })
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Recovery trigger disengaged.");
        return;
      }

      setRecoveryOtp(data.simulatedRecoveryOtp);
      setPendingMfaUserId(data.userId);
      setRecoveryStep(2);
    } catch (err) {
      setErrorMessage("System fail recovery handshake.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!otpInput || !newPassword) return;

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: pendingMfaUserId,
          otp: otpInput,
          newPassword
        })
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Passkey reset mismatched.");
        return;
      }

      setRecoveryMode(false);
      setRecoveryStep(1);
      setOtpInput("");
      setNewPassword("");
      setIsLoginMode(true);
      setErrorMessage("Passphrase decrypted and updated successfully! Decrypt key again.");
    } catch (err) {
      setErrorMessage("Critical passkey reset cycle disengaged.");
    }
  };

  const handleOAuthLogin = (provider: string) => {
    setErrorMessage("");
    setActiveOAuthProvider(provider as any);
  };

  const executeDatabaseOAuth = async (emailVal: string, nameVal: string, providerVal: string) => {
    setErrorMessage("");
    setActiveOAuthProvider(null);
    setIsSequencing(true);
    setSequenceStatus(`Establishing secure ${providerVal} cloud sync link...`);
    synth.playScanSwipe();

    try {
      const response = await fetch("/api/auth/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailVal,
          fullName: nameVal,
          provider: providerVal
        })
      });

      const data = await response.json();
      
      setTimeout(() => {
        setIsSequencing(false);

        if (!response.ok) {
          setErrorMessage(data.error || "Decryption signature mismatched via OAuth.");
          return;
        }

        localStorage.setItem("sg_access_token", data.accessToken);
        localStorage.setItem("sg_refresh_token", data.refreshToken);
        synth.playLevelUpChime();

        onComplete({
          name: data.user.fullName,
          level: "Mid-Level Dev",
          experienceYears: 3,
          techStack: ["React / Next.js", "TypeScript", "Node.js / Express"],
          targetRole: "Full Stack Engineer",
          codingHoursPerWeek: 40,
          currentScore: 84
        }, data.accessToken);
      }, 1200);
    } catch (err) {
      setIsSequencing(false);
      setErrorMessage("Secure OAuth core validation disengaged.");
    }
  };

  const simulateDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsResumeDragging(true);
  };

  const simulateDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsResumeDragging(false);
    setResumeText(`
      MAYA HYPERION
      E-mail: maya@hyperion.io | Portfolio: hyperion.io
      
      RELEVANT EXPERIENCE:
      Full Stack Engineer at Cyberspace Inc (2023 - Present)
      * Formulated real-time microservices in Node.js, Express, and SQLite.
      * Built beautiful React Vite dashboards with high-contrast UI matrices.
      
      TECHNICAL COMPETENCIES:
      TypeScript, React, Next.js, Node.js, Tailwind CSS, Python, Docker
    `);
    // Seed target role automatically on resume analyzes
    setTargetRole("Senior Cyber Architect");
    setBio("Cyberspace stack specialist engineering atomic interfaces.");
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 bg-black/40 backdrop-blur-3xl rounded-[32px] border border-white/5 shadow-[0_0_80px_rgba(34,211,238,0.06)] overflow-hidden min-h-[580px]">
      
      {/* Cinematic Left Side: Interactive 3D Holographic Info Panel */}
      <div className="lg:col-span-5 bg-gradient-to-br from-cyan-950/25 via-slate-950/80 to-purple-950/20 p-8 flex flex-col justify-between border-r border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 hologram-grid opacity-10"></div>
        
        {/* Animated laser line scanner sweep */}
        {isSequencing && (
          <div className="absolute left-0 w-full bg-cyan-500/30 h-[2px] shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-[scan_2.5s_ease-in-out_infinite]"></div>
        )}

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono text-cyan-400 font-extrabold tracking-widest uppercase">COGNITIVE ENGINE TERMINAL</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight text-white font-sans">
              Decode Your <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 bg-clip-text text-transparent font-extrabold uppercase">
                Developer DNA
              </span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              AI-powered intelligence platform that sequences your technologies, commits, and engineering capabilities into a live 3D genetic profile.
            </p>
          </div>
        </div>

        {/* Dynamic Telemetry stats / Bio visual scans */}
        <div className="relative z-10 bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-3 font-mono">
          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <span>HELIX REPLICA ID</span>
            <span className="text-cyan-400">#SG-99X-INITIATING</span>
          </div>
          
          <div className="space-y-1.5 border-t border-white/5 pt-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <ShieldAlert className="h-3 w-3 text-cyan-400" /> Security Status
              </span>
              <span className="text-cyan-300 font-bold font-mono">ENCRYPTED</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Monitor className="h-3 w-3 text-purple-400" /> Connection Gateway
              </span>
              <span className="text-purple-300 font-bold">WSS://PORT-3000</span>
            </div>
          </div>

          <div className="h-8 bg-neutral-900/40 rounded border border-white/5 flex items-center px-2 text-[9px] text-[#22d3ee] gap-1.5">
            <KeyRound className="h-4 w-4 animate-pulse shrink-0 text-cyan-400" />
            <span className="truncate">SYSTEM AUTHENTICATOR NODES: SYNCED</span>
          </div>
        </div>

        <div className="relative z-10 pt-4 flex gap-4 text-[9px] text-gray-500 font-mono">
          <span>AES-GCM SECURE</span>
          <span>•</span>
          <span>POSTGRES SHARDED</span>
        </div>
      </div>

      {/* Cinematic Right Side: Functional Auth and Registration Wizard forms */}
      <div className="lg:col-span-7 p-8 md:p-10 flex flex-col justify-center relative">
        
        {/* Holographic background visual effects */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/[0.02] via-transparent to-purple-500/[0.02] pointer-events-none"></div>

        <AnimatePresence mode="wait">
          {isSequencing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[380px] flex flex-col justify-center items-center text-center"
              id="sequencing-visualizer"
            >
              <div className="relative w-36 h-36 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400/30 animate-spin" style={{ animationDuration: "10s" }}></div>
                <div className="absolute inset-3 rounded-full border border-purple-500/20 animate-spin" style={{ animationDuration: "6s" }}></div>
                <div className="absolute inset-6 rounded-full border border-dotted border-pink-500/40 animate-spin" style={{ animationDuration: "3s" }}></div>
                <KeyRound className="h-8 w-8 text-cyan-400 animate-pulse" />
              </div>
              <h4 className="text-md font-black uppercase tracking-widest text-[#22d3ee]">SYNCING DATABASE GENOME</h4>
              <p className="text-xs font-mono text-slate-400 mt-2 max-w-xs">{sequenceStatus}</p>
            </motion.div>
          )}

          {!isSequencing && recoveryMode && (
            <motion.div 
              key="recovery-flow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto w-full space-y-5"
            >
              <div className="text-center space-y-1">
                <h4 className="text-lg font-black text-white">Credential Key Reconstruction</h4>
                <p className="text-xs text-slate-400">Secure automated cycle to reset credentials.</p>
              </div>

              {recoveryStep === 1 ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="flex flex-col gap-1.5 font-mono">
                    <label className="text-xs text-cyan-400 uppercase font-bold">DNA Matcher Email</label>
                    <input 
                      type="email"
                      placeholder="e.g. user@domain.com"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full bg-[#05070a]/90 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                  {errorMessage && <p className="text-[11px] font-mono text-pink-500 bg-pink-950/20 p-2.5 rounded border border-pink-500/30">{errorMessage}</p>}
                  
                  <div className="flex justify-between items-center gap-4 pt-2">
                    <button type="button" onClick={() => setRecoveryMode(false)} className="text-[11px] font-mono text-gray-500 hover:text-gray-300">
                      ← BACK
                    </button>
                    <button type="submit" className="px-5 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-400">
                      TRANSMIT KEY
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4 font-mono">
                  <div className="border border-purple-500/20 bg-purple-950/20 p-3 rounded-xl text-center space-y-1">
                    <span className="text-[9px] text-purple-400 uppercase block font-bold">SIMULATED RECOVERY PASSCODE</span>
                    <span className="text-lg font-black text-purple-300 tracking-widest">{recoveryOtp}</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-cyan-400 uppercase font-bold">Passcode OTP</label>
                    <input 
                      type="text"
                      placeholder="6-Digit OTP"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-purple-400 uppercase font-bold">New system cred passkey</label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none"
                      required
                    />
                  </div>
                  {errorMessage && <p className="text-[11px] font-mono text-pink-500 bg-pink-950/20 p-2 text-center rounded border border-pink-500/30">{errorMessage}</p>}

                  <div className="flex justify-between items-center gap-4 pt-2">
                    <button type="button" onClick={() => setRecoveryStep(1)} className="text-[11px] text-gray-500 hover:text-gray-300">
                      RE-SEND OTP
                    </button>
                    <button type="submit" className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-bold text-xs text-black">
                      RESET PASSKEY
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {!isSequencing && !recoveryMode && (
            <motion.div 
              key="auth-wizard-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Core Mode Switcher Tabs */}
              <div className="flex bg-white/[0.03] border border-white/5 p-1 rounded-2xl max-w-sm font-mono text-xs">
                <button
                  type="button"
                  onClick={() => { setIsLoginMode(false); setErrorMessage(""); }}
                  className={`flex-1 py-2.5 rounded-xl text-center font-bold uppercase transition-all ${
                    !isLoginMode
                      ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-extrabold"
                      : "text-slate-400"
                  }`}
                  id="tab-seq-dna"
                >
                  Sequence DNA
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLoginMode(true); setErrorMessage(""); }}
                  className={`flex-1 py-2.5 rounded-xl text-center font-bold uppercase transition-all ${
                    isLoginMode
                      ? "bg-purple-500/10 border border-purple-500/20 text-purple-300 font-extrabold"
                      : "text-slate-400"
                  }`}
                  id="tab-login"
                >
                  Login Decrypt
                </button>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 border border-pink-500/20 bg-pink-950/20 p-3.5 rounded-2xl text-[11px] font-mono text-pink-400">
                  <span className="h-1.5 w-1.5 bg-pink-500 rounded-full animate-ping shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {isLoginMode ? (
                /* Dynamic Cyberpunk Login Panel form */
                <form onSubmit={handleLoginSubmit} className="space-y-4 font-mono max-w-md">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-cyan-400 uppercase font-bold">Email Shard Target</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input 
                        type="email" 
                        placeholder="e.g. codemaster@genome.ai"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full bg-neutral-900/60 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-purple-400 uppercase font-bold">Passphrase Signature</label>
                      <button type="button" onClick={() => { setRecoveryMode(true); setRecoveryStep(1); }} className="text-[10px] text-purple-400 hover:text-purple-300 hover:underline">
                        RECONSTRUCT CREDENTIALS?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-neutral-900/60 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-xs text-slate-100 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* OAuth Mock login pathways */}
                  <div className="grid grid-cols-3 gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin("GitHub")}
                      className="border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition px-2 py-3.5 rounded-xl flex flex-col items-center justify-center gap-1.5 text-[10px] text-gray-400 font-mono hover:border-cyan-500/30 cursor-pointer"
                    >
                      <Github className="h-4 w-4 text-cyan-400 shrink-0 animate-pulse" />
                      <span>GitHub</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin("Google")}
                      className="border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition px-2 py-3.5 rounded-xl flex flex-col items-center justify-center gap-1.5 text-[10px] text-gray-400 font-mono hover:border-red-500/30 cursor-pointer"
                    >
                      <Chrome className="h-4 w-4 text-[#ea4335] shrink-0 fill-[#ea4335]/10 animate-pulse" />
                      <span>Google</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin("Apple")}
                      className="border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition px-2 py-3.5 rounded-xl flex flex-col items-center justify-center gap-1.5 text-[10px] text-gray-400 font-mono hover:border-purple-500/30 cursor-pointer"
                    >
                      <KeyRound className="h-4 w-4 text-purple-400 shrink-0 animate-pulse" />
                      <span>Apple ID</span>
                    </button>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <Lock className="h-4 w-4 text-cyan-400 shrink-0" />
                      <span>DECRYPTION SAFE MODE ACTIVE</span>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-95 shadow-[0_0_20px_rgba(168,85,247,0.3)] text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                      id="btn-login"
                    >
                      DECRYPT SYNCED WORKSPACE <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </form>
              ) : (
                /* Step-by-Step interactive modular signup */
                <div className="font-mono">
                  {/* Step indicators */}
                  <div className="flex items-center gap-3 mb-6">
                    {[1, 2, 3, 4].map((s) => (
                      <div 
                        key={s}
                        className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                          s === step ? "bg-gradient-to-r from-cyan-400 to-purple-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]" : s < step ? "bg-cyan-500/30" : "bg-white/5"
                        }`}
                      />
                    ))}
                    <span className="text-[10px] font-bold text-cyan-400 text-right">0{step}_STEP</span>
                  </div>

                  <div className="min-h-[240px] max-w-xl">
                    {/* STEP 1: Core Credentials & identity */}
                    {step === 1 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-cyan-400 uppercase font-bold">DNA Name/Codename</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                              <input 
                                type="text" 
                                placeholder="e.g. Maya Hyperion" 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs"
                                required
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-cyan-400 uppercase font-bold">System Username Alias</label>
                            <input 
                              type="text" 
                              placeholder="e.g. maya_x" 
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-xs"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-cyan-400 uppercase font-bold">Registration Shard Email</label>
                          <input 
                            type="email" 
                            placeholder="e.g. maya@hyperion.io" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-xs"
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-purple-400 uppercase font-bold">New system cred passkey</label>
                          <input 
                            type="password" 
                            placeholder="Password: At least 8-chars" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-xs"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Standing Core Profile calibrators */}
                    {step === 2 && (
                      <div className="space-y-5 animate-fadeIn">
                        <div className="space-y-2">
                          <label className="text-xs text-cyan-400 uppercase font-bold">Sequencing developer level</label>
                          <div className="grid grid-cols-2 gap-3">
                            {(["CS Student", "Junior Dev", "Mid-Level Dev", "Senior Engineer"] as const).map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => setLevel(lvl)}
                                className={`p-3 rounded-xl border text-xs text-left transition ${
                                  level === lvl 
                                    ? "bg-purple-950/40 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.15)]" 
                                    : "bg-neutral-900/40 border-white/5 text-gray-500 hover:border-white/10"
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-cyan-400 uppercase font-bold">Weekly coding intensity</span>
                            <span className="text-purple-300 font-bold">{codingHours} Hours/Week</span>
                          </div>
                          <input 
                            type="range"
                            min={5}
                            max={80}
                            step={5}
                            value={codingHours}
                            onChange={(e) => setCodingHours(Number(e.target.value))}
                            className="w-full accent-cyan-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-[9px] text-gray-600 pt-0.5">
                            <span>5H/WK (Casual)</span>
                            <span>40H/WK (Standard)</span>
                            <span>80H/WK (Hardcore)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Technologies Stack Helix alignments */}
                    {step === 3 && (
                      <div className="space-y-3 animate-fadeIn">
                        <label className="text-xs text-cyan-400 uppercase font-bold block">Integrate technology stack</label>
                        <div className="grid grid-cols-3 gap-2">
                          {POPULAR_TECHS.map((tech) => {
                            const Icon = tech.icon;
                            const isSelected = selectedTech.includes(tech.name);
                            return (
                              <button
                                key={tech.name}
                                type="button"
                                onClick={() => toggleTech(tech.name)}
                                className={`p-3 rounded-xl border text-[10px] flex items-center gap-2 transition ${
                                  isSelected
                                    ? "bg-cyan-500/10 border-cyan-400/80 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                                    : "bg-neutral-900/50 border-white/5 text-gray-500 hover:border-white/10"
                                }`}
                              >
                                <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-cyan-400" : "text-gray-600"}`} />
                                <span className="truncate">{tech.name}</span>
                                {isSelected && <CheckCircle2 className="h-3 w-3 ml-auto text-cyan-400" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Resume analyze simulation drag/drop + target goals */}
                    {step === 4 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-cyan-400 uppercase font-bold">Resume ATS Analysis integration</label>
                            <div 
                              onDragOver={simulateDragOver}
                              onDragLeave={() => setIsResumeDragging(false)}
                              onDrop={simulateDrop}
                              onClick={() => {
                                setResumeText("Loaded: CV Resume (Maya Hyperion). ATS match score updated.");
                                setTargetRole("Lead DevOps Architect");
                              }}
                              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                                isResumeDragging ? "bg-cyan-500/10 border-cyan-400" : resumeText ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300" : "bg-neutral-900 border-white/10 hover:border-white/20"
                              }`}
                            >
                              <Upload className={`h-6 w-6 mb-1.5 ${resumeText ? "text-emerald-400 animate-pulse" : "text-gray-500"}`} />
                              <span className="text-[10px] font-bold uppercase select-none">
                                {resumeText ? "ATS PARSED SUCCESS" : "DRAG RESUME HERE OR CLICK"}
                              </span>
                              <span className="text-[8px] text-gray-500 block leading-tight mt-0.5 pointer-events-none">PDF/DOCX simulated uploader</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 justify-between">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-cyan-400 uppercase font-bold">Target Career role</label>
                              <input 
                                type="text"
                                placeholder="e.g. Lead DevOps Engineer"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-purple-400 uppercase font-bold">Developer custom biography</label>
                              <input 
                                type="text"
                                placeholder="Short profile quote..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-cyan-400 uppercase flex items-center gap-1">
                            <Github className="h-3.5 w-3.5" /> Optional GitHub profile identifier
                          </label>
                          <input 
                            type="text"
                            placeholder="e.g. github.com/maya-codes"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions footer for stepper signup */}
                  <div className="pt-5 border-t border-white/5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => step > 1 && setStep(step - 1)}
                      disabled={step === 1}
                      className="text-[11px] text-slate-500 hover:text-slate-300 disabled:opacity-0 transition cursor-pointer"
                    >
                      ← DECREMENT LEVEL
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-95 shadow-[0_0_20px_rgba(6,182,212,0.25)] text-xs font-bold text-black flex items-center gap-1.5 cursor-pointer"
                      id="btn-signup-next"
                    >
                      {step === 4 ? "SEQUENCE DEVELOPER DNA" : "ALIGN NEXT LEVEL"} <ArrowRight className="h-3.5 w-3.5 text-black" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {activeOAuthProvider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 rounded-[32px] overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-full max-w-md bg-[#080b10] border border-white/10 rounded-2xl p-6 shadow-2xl relative font-mono text-left"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    activeOAuthProvider === "Google" ? "bg-red-500/10 text-red-400" :
                    activeOAuthProvider === "Apple" ? "bg-purple-500/10 text-purple-400" :
                    "bg-cyan-500/10 text-cyan-400"
                  }`}>
                    {activeOAuthProvider === "GitHub" && <Github className="h-5 w-5" />}
                    {activeOAuthProvider === "Google" && <Chrome className="h-5 w-5" />}
                    {activeOAuthProvider === "Apple" && <KeyRound className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-100 tracking-tight">{activeOAuthProvider.toUpperCase()} HANDSHAKE</h3>
                    <p className="text-[10px] text-gray-500">SECURE QUANTUM LINK</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveOAuthProvider(null)}
                  className="text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition px-2.5 py-1 rounded cursor-pointer"
                >
                  ABORT
                </button>
              </div>

              {/* GOOGLE HANDSHAKE */}
              {activeOAuthProvider === "Google" && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Select an active Google identity container to instantly link your Developer genome with the SQLite database pool:
                  </p>
                  <div className="space-y-2.5">
                    {/* Dynamic profile pulling the actual user's email */}
                    <button
                      type="button"
                      onClick={() => executeDatabaseOAuth("padamatiyeshwanthreddy18@gmail.com", "Padamati Yeshwanth Reddy", "Google")}
                      className="w-full text-left p-3.5 bg-cyan-950/10 hover:bg-cyan-950/20 border border-cyan-500/20 hover:border-cyan-400 rounded-xl transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-cyan-900/40 border border-cyan-500/30 flex items-center justify-center text-xs text-cyan-400 font-bold uppercase">
                          PY
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300">Padamati Yeshwanth Reddy</div>
                          <div className="text-[10px] text-gray-500">padamatiyeshwanthreddy18@gmail.com</div>
                        </div>
                      </div>
                      <span className="text-[9px] text-cyan-450 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full uppercase scale-90">PRIMARY DECPYTOR</span>
                    </button>

                    {/* Standard testing profile */}
                    <button
                      type="button"
                      onClick={() => executeDatabaseOAuth("ai.nexus@google.com", "Nexus AI Engineer", "Google")}
                      className="w-full text-left p-3.5 bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-purple-500/30 rounded-xl transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-xs text-purple-400 font-bold uppercase">
                          NX
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-100 group-hover:text-purple-300">Nexus AI Engineer</div>
                          <div className="text-[10px] text-gray-500">ai.nexus@google.com</div>
                        </div>
                      </div>
                      <span className="text-[9px] text-purple-500 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full uppercase scale-90">SANDBOX</span>
                    </button>
                  </div>

                  {/* CUSTOM DEVELOPER EMAIL FOR PERSISTENT LOGINS */}
                  <div className="border border-white/5 bg-white/[0.01] p-3 rounded-xl space-y-3">
                    <div className="text-[9px] text-cyan-400 font-black tracking-wider uppercase">DYNAMIC IDENTITY REGISTER / LOGIN</div>
                    
                    <div className="grid grid-cols-2 gap-2">
                       <div className="flex flex-col gap-1">
                         <label className="text-[9px] text-gray-400 uppercase font-black">Email</label>
                         <input
                           type="email"
                           placeholder="john.doe@gmail.com"
                           value={customOauthEmail}
                           onChange={(e) => setCustomOauthEmail(e.target.value)}
                           className="w-full bg-neutral-900 text-[11px] font-bold border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-slate-200"
                         />
                       </div>
                       <div className="flex flex-col gap-1">
                         <label className="text-[9px] text-gray-400 uppercase font-black">Full Name</label>
                         <input
                           type="text"
                           placeholder="John Doe"
                           value={customOauthName}
                           onChange={(e) => setCustomOauthName(e.target.value)}
                           className="w-full bg-neutral-900 text-[11px] font-bold border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-slate-200"
                         />
                       </div>
                    </div>

                    <button
                      type="button"
                      disabled={!customOauthEmail || !customOauthName}
                      onClick={() => executeDatabaseOAuth(customOauthEmail, customOauthName, "Google")}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-black text-[10px] font-bold uppercase hover:opacity-90 transition cursor-pointer"
                    >
                      SECURE DB INSTANT HANDSHAKE
                    </button>
                  </div>
                </div>
              )}

              {/* APPLE SECURE ID */}
              {activeOAuthProvider === "Apple" && (
                <div className="space-y-4 text-center">
                  <p className="text-xs text-slate-300">
                    Authenticate via Apple Secure Identity validation protocol to link your Developer credentials instantly:
                  </p>

                  <div className="py-6 flex flex-col items-center justify-center">
                    <button
                      type="button"
                      onClick={() => executeDatabaseOAuth("apple.developer@apple.com", "Apple Core Architect", "Apple")}
                      className="h-20 w-20 rounded-full bg-gradient-to-tr from-[#8b5cf6]/20 to-[#a855f7]/30 border border-purple-500/30 flex items-center justify-center relative cursor-pointer group hover:scale-105 transition-transform duration-300"
                    >
                      <span className="absolute inset-0 rounded-full bg-purple-500/10 animate-pulse" />
                      <KeyRound className="h-10 w-10 text-purple-400 animate-pulse" />
                    </button>
                    <span className="text-[9px] text-purple-400 font-bold tracking-widest mt-4 animate-pulse">
                      CLICK TO LAUNCH SECURE CONNECTION
                    </span>
                  </div>

                  <div className="text-[10px] text-gray-500 border-t border-white/5 pt-3">
                    Fast, secure, instant credentials mapping linked directly to SQLite.
                  </div>
                </div>
              )}

              {/* GITHUB OAUTH */}
              {activeOAuthProvider === "GitHub" && (
                <div className="space-y-4">
                  <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span>DECENTRALIZED ACCESS PRIVILEGES</span>
                    </div>
                    <p className="text-xs text-slate-350 leading-relaxed">
                      Authorize SkillGenome workspace tool directly to index repository commits, star frequencies, and technology stacks:
                    </p>
                    <ul className="text-[10px] text-cyan-400 space-y-1 pl-1">
                      <li>✔ Align commits rate telemetry</li>
                      <li>✔ Extract workspace statistics</li>
                      <li>✔ Build persistent developer score</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => executeDatabaseOAuth("github.terminal@gmail.com", "GitHub Senior Dev", "GitHub")}
                      className="w-full py-3 bg-[#24292e] text-white rounded-xl hover:bg-neutral-800 transition flex items-center justify-center gap-2 text-xs font-black cursor-pointer shadow-lg border border-white/10"
                    >
                      <Github className="h-4 w-4 text-cyan-400 animate-bounce" /> AUTHORIZE WORKSPACE ACCESS
                    </button>
                    
                    <p className="text-[9px] text-gray-500 text-center uppercase tracking-wide">
                      Instant profile setup using persistent SQLite records
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
