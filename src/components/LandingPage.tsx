import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ShootingStarsBackground } from "./ShootingStarsBackground";

interface LandingPageProps {
  onEnter: () => void;
}

interface Spark {
  id: number;
  x: number;
  y: number;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const [sparks, setSparks] = useState<Spark[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Add a new spark at the click coordinates
    const newSpark = { id: Date.now(), x: e.pageX, y: e.pageY };
    setSparks((prev) => [...prev, newSpark]);

    // Cleanup logic is handled by the timeout removing it from state,
    // which triggers the AnimatePresence exit animation.
    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => s.id !== newSpark.id));
    }, 1000);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-[#020817] min-h-screen w-full relative overflow-x-hidden font-sans flex flex-col cursor-pointer"
    >
      <ShootingStarsBackground />
      <style>{`
        .animate-gradient-text {
          background-size: 200% auto;
          animation: gradient-flow 8s ease infinite;
        }
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .text-glow {
            filter: drop-shadow(0 0 15px rgba(56, 189, 248, 0.5));
        }
      `}</style>

      {/* Click Sparkles */}
      <AnimatePresence>
        {sparks.map((spark) => (
          <motion.div
            key={spark.id}
            initial={{ scale: 0, opacity: 1, rotate: 0 }}
            animate={{ scale: 1.5, opacity: 0, rotate: 45 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute pointer-events-none z-50"
            style={{ 
              left: spark.x, 
              top: spark.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
             {/* Custom Star Shape */}
             <div className="relative flex items-center justify-center">
                {/* Center Core */}
                <div className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] blur-[1px]" />
                
                {/* Horizontal Ray */}
                <div className="absolute w-8 h-[2px] bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                
                {/* Vertical Ray */}
                <div className="absolute w-[2px] h-8 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
             </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center relative overflow-hidden shrink-0">
             <div className="absolute inset-0 bg-black/10"></div>
             <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span className="text-white text-lg font-medium tracking-tight">
            Shooting Stars
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button className="hidden sm:block text-slate-400 text-sm font-medium hover:text-white transition-colors">
            Manifesto
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent spark on button click if desired, but user probably wants it everywhere? 
              // Actually, allowing spark on buttons is fun. I'll remove stopPropagation for consistency with "everytime you click".
              // But if onEnter navigates away immediately, spark won't be seen. 
              // Assuming onEnter changes view state in parent. 
              onEnter();
            }}
            className="text-white text-sm font-medium hover:text-blue-400 transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 text-center pb-20 mt-10">
          
        {/* Heading */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-medium text-white tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
            Don’t Wish Upon a Star.
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                Build With One.
            </span>
        </h1>

        {/* Paragraph */}
        <p className="text-slate-300 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto drop-shadow-md">
            Bridging the gap between online talent and offline connection.
            <br className="hidden sm:block" />
            Where real bonds are forged and skills are nurtured.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={(e) => {
                 // onEnter(); 
                 // Let the parent handle it, but allow the bubble?
                 onEnter();
              }}
              className="bg-white text-black rounded-full px-8 py-4 text-base font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all transform hover:scale-105"
            >
              Meet a star
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 11L11 1M11 1H3.5M11 1V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
        </div>
      </main>
    </div>
  );
}
