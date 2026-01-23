import { useState, useEffect } from "react";
import { SwipeCard } from "./SwipeCard";
import { Button } from "./ui/button";
import { X, Check, MessageCircle, RefreshCw, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useMatching } from "../features/matching/hooks/useMatching";
import type { User } from "../shared/types/database";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "./ui/carousel";

export function SkillMatcher({ isGuest, onRequireAuth, onMatchChat }: { isGuest?: boolean; onRequireAuth?: () => void, onMatchChat?: (id: string) => void }) {
  const { candidates, currentCandidate, swipe: swipeAction, fetchCandidates, loading } = useMatching();
  const [apiRef, setApiRef] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  useEffect(() => {
    if (!apiRef) return;

    apiRef.on("select", () => {
      setCurrent(apiRef.selectedScrollSnap());
    });
  }, [apiRef]);

  const handleAction = async (direction: "left" | "right") => {
    const currentUser = candidates[current];
    if (!currentUser) return;

    // Advance carousel if possible
    if (apiRef?.canScrollNext()) {
      apiRef.scrollNext();
    }

    try {
      const result = await swipeAction(currentUser.id, direction === 'right' ? 'like' : 'pass');
      if (direction === 'right') {
        if (result.matched) {
          toast.success(`It's a Match! You and ${currentUser.name} can now chat.`);
          if (result.matchId && onMatchChat) {
            onMatchChat(result.matchId);
          }
        } else {
          toast.success(`Request sent to ${currentUser.name}`);
        }
      } else {
        toast("Passed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full flex items-center justify-center relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-50"></div>
          <Sparkles className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">No more stars nearby</h2>
          <p className="text-slate-400 mt-2 max-w-xs mx-auto">You've seen everyone in your orbit. Check back later for more potential skill swaps.</p>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            onClick={fetchCandidates}
            variant="outline"
            className="border-slate-700 bg-slate-900/50 text-white hover:bg-slate-800 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Orbit
          </Button>
          <Button
            onClick={async () => {
              try {
                // Seed function would need to be added to API if needed
                toast.info("Seed feature needs backend implementation");
                await fetchCandidates();
              } catch (e: any) {
                toast.error(e.message || "Failed to refresh");
              }
            }}
            variant="ghost"
            className="text-slate-500 hover:text-slate-300 text-xs"
          >
            (Dev) Reset & Seed Test Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full py-4 relative">
      <div className="w-full max-w-5xl flex-1 flex items-center justify-center relative z-10 px-12">
        <Carousel
          setApi={setApiRef}
          className="w-full max-w-md"
          opts={{
            align: "center",
            loop: false,
          }}
        >
          <CarouselContent>
            {candidates.map((user) => (
              <CarouselItem key={user.id}>
                <div className="p-1">
                  <SwipeCard
                    user={{
                      ...user,
                      offering: (user.offering || []) as any,
                      seeking: (user.seeking || []) as any
                    }}
                    onSwipe={(dir) => handleAction(dir)}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-16 h-12 w-12 border-slate-700 bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800" />
          <CarouselNext className="hidden md:flex -right-16 h-12 w-12 border-slate-700 bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800" />
        </Carousel>
      </div>

      <div className="flex items-center gap-6 mt-8 mb-4 z-10">
        <Button
          size="lg"
          variant="outline"
          className="h-16 w-16 rounded-full border-2 border-slate-700 bg-slate-900/40 text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-950/30 transition-all backdrop-blur-sm"
          onClick={() => handleAction("left")}
        >
          <X className="w-8 h-8" />
        </Button>

        <Button
          size="icon"
          className="h-12 w-12 rounded-full bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 hover:scale-105 transition-all shadow-lg backdrop-blur-sm"
          onClick={async () => {
            const currentUser = candidates[current];
            if (!currentUser) return;

            try {
              // "Message" implies strong interest -> Instant Match
              const result = await swipeAction(currentUser.id, 'like');

              if (result.matched) {
                toast.success(`Connected with ${currentUser.name}!`);
                onMatchChat?.(currentUser.id);
              } else {
                // Fallback if not matched (unlikely in demo)
                handleAction('right');
              }
            } catch (e) {
              toast.error("Could not connect");
            }
          }}
        >
          <MessageCircle className="w-5 h-5" />
        </Button>

        <Button
          size="lg"
          className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:scale-110 transition-all border-0"
          onClick={() => handleAction("right")}
        >
          <Check className="w-8 h-8" />
        </Button>
      </div>
    </div>
  );
}
