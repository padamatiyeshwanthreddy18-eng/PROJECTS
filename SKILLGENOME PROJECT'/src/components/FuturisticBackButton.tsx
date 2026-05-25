import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Sparkles, Shield, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { synth } from "../lib/synth";

interface FuturisticBackButtonProps {
  history: any[];
  onBack: () => void;
  // Trigger scan line across the host container
  onTriggerScan?: () => void;
}

export default function FuturisticBackButton({ history, onBack, onTriggerScan }: FuturisticBackButtonProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [particleBursts, setParticleBursts] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Auto-hide on scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Mobile swipe back support (swipe from left of the screen)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // If touch starts within the first 40px of the screen edge
      if (e.touches[0].clientX < 40) {
        touchStartX.current = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      const currentX = e.touches[0].clientX;
      const diffX = currentX - touchStartX.current;

      // Swipe right from the left edge by 100px or more
      if (diffX > 100 && history.length > 0) {
        touchStartX.current = null;
        triggerBack();
      }
    };

    const handleTouchEnd = () => {
      touchStartX.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [history]);

  // Depth-based hover and Cursor glow
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  const triggerBack = () => {
    synth.playClick();
    synth.playScanSwipe();

    // Trigger local particle burst logic on button coordinates
    const rect = buttonRef.current?.getBoundingClientRect();
    const burstX = rect ? rect.width / 2 : 50;
    const burstY = rect ? rect.height / 2 : 20;

    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x: burstX,
      y: burstY,
      color: i % 2 === 0 ? "#22d3ee" : "#a855f7"
    }));

    setParticleBursts(prev => [...prev, ...newParticles]);

    // Cleanup bursts after 800ms
    setTimeout(() => {
      setParticleBursts([]);
    }, 850);

    // Trigger AI Scan visual layout response if passed
    if (onTriggerScan) {
      onTriggerScan();
    }

    // Call actual navigation back action after cinematic delay for transition
    setTimeout(() => {
      onBack();
    }, 350);
  };

  // If there is no navigation potential, we do not need to fill margins
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="contents">
      {/* 2D Particle Emitters Canvas / Containers */}
      <AnimatePresence>
        {particleBursts.map((p) => {
          const angle = Math.random() * Math.PI * 2;
          const velocity = 25 + Math.random() * 50;
          const tx = Math.cos(angle) * velocity;
          const ty = Math.sin(angle) * velocity;

          return (
            <motion.div
              key={p.id}
              initial={{ x: p.x, y: p.y, scale: 1.5, opacity: 1 }}
              animate={{ x: p.x + tx, y: p.y + ty, scale: 0, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="fixed pointer-events-none z-50 w-2.5 h-2.5 rounded-full blur-[1px]"
              style={{
                backgroundColor: p.color,
                boxShadow: `0 0 8px ${p.color}`,
                left: buttonRef.current ? buttonRef.current.getBoundingClientRect().left : 0,
                top: buttonRef.current ? buttonRef.current.getBoundingClientRect().top : 0,
              }}
            />
          );
        })}
      </AnimatePresence>

      <AnimatePresence>
        {isVisible && (
          <>
            {/* DESKTOP STICKY/FLOATING GLASS pill BUTTON */}
            <div className="hidden md:block fixed top-20 left-6 z-40">
              <motion.button
                ref={buttonRef}
                onClick={triggerBack}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => { setIsHovered(true); synth.playScanSwipe(); }}
                onMouseLeave={() => setIsHovered(false)}
                initial={{ opacity: 0, x: -30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="group relative px-5 py-2.5 rounded-full bg-black/60 border border-cyan-400/20 hover:border-cyan-400/60 text-cyan-300 font-mono text-[11px] font-bold tracking-widest uppercase flex items-center gap-2.5 cursor-pointer backdrop-blur-xl select-none outline-none overflow-hidden hover:shadow-[0_0_20px_rgba(34,211,238,0.25)] transition-shadow duration-300"
                style={{
                  transform: isHovered 
                    ? `perspective(100px) rotateX(${(mousePos.y - 20) / 10}deg) rotateY(${-(mousePos.x - 50) / 12}deg)`
                    : "none"
                }}
              >
                {/* Responsive dynamic Cursor glow element */}
                <div 
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(40px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34,211,238,0.15), transparent)`
                  }}
                />

                {/* Micro holographic shine sweep line */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-[#22d3ee]/20 to-transparent group-hover:animate-shine" />

                {/* Circular AI pulse animation around arrow */}
                <div className="relative shrink-0 flex items-center justify-center">
                  <span className="absolute h-6 w-6 rounded-full border border-cyan-400/30 animate-ping group-hover:block hidden" style={{ animationDuration: "1.2s" }} />
                  <span className="absolute h-4 w-4 rounded-full border border-purple-400/40 animate-pulse" />
                  <ArrowLeft className="h-3.5 w-3.5 relative z-10 transition-transform duration-300 group-hover:-translate-x-1" />
                </div>

                <span className="relative z-10 bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent group-hover:text-white transition-colors duration-200">
                  SYSTEM_BACK
                </span>

                {/* Micro tech indicators */}
                <span className="text-[6px] text-purple-400/60 font-mono tracking-tighter">0xBD_01</span>
              </motion.button>
            </div>

            {/* MOBILE FLOATING BOTTOM-LEFT CIRCULAR BUTTON */}
            <div className="md:hidden fixed bottom-6 left-6 z-40">
              <motion.button
                onClick={triggerBack}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="w-12 h-12 rounded-full bg-black/80 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer backdrop-blur-xl shrink-0 overflow-hidden active:scale-95 transition-transform"
              >
                {/* Holographic light ring */}
                <div className="absolute inset-1 rounded-full border border-cyan-400/20 animate-spin" style={{ animationDuration: "10s" }} />
                <ArrowLeft className="h-5 w-5 text-cyan-300 animate-pulse" />
              </motion.button>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
