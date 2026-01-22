import { motion } from "motion/react";
import { User, Skill } from "../lib/data";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { MapPin, GraduationCap, Briefcase } from "lucide-react";

interface SwipeCardProps {
  user: User;
  onSwipe: (direction: "left" | "right") => void;
}

export function SwipeCard({ user, onSwipe }: SwipeCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.05, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto h-[600px] relative perspective-1000"
    >
      <Card className="w-full h-full overflow-hidden rounded-[32px] border border-slate-800/50 shadow-2xl shadow-black/50 relative bg-[#0f172a] select-none cursor-grab active:cursor-grabbing group isolate transform-gpu">
        
        {/* Image Section - Taller & Immersive */}
        <div className="h-[65%] w-full relative overflow-hidden rounded-t-[32px]">
          {/* Subtle top gradient for depth */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/40 to-transparent z-10" />
          
          {/* Bottom gradient for text readability */}
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent z-10" />
          
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <h2 className="text-3xl font-bold text-white mb-1 drop-shadow-md">{user.name}</h2>
            
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <span>{user.school}</span>
                </div>
                {user.role && (
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Briefcase className="w-4 h-4 text-slate-500" />
                        <span>{user.role}</span>
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="h-[35%] px-6 pb-6 flex flex-col relative z-20 bg-[#0f172a]">
          <div className="space-y-5">
            <p className="text-slate-300 text-sm leading-relaxed line-clamp-2 italic border-l-2 border-slate-700 pl-3">
              "{user.bio}"
            </p>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2.5 flex items-center gap-1">
                    Offers
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {user.offering.map((skill) => (
                    <Badge 
                        key={skill.id} 
                        variant="outline" 
                        className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-[10px] py-0.5 px-2 transition-colors font-medium"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2.5 flex items-center gap-1">
                    Needs
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {user.seeking.map((skill) => (
                    <Badge 
                        key={skill.id} 
                        variant="outline" 
                        className="bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 text-[10px] py-0.5 px-2 transition-colors font-medium"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
