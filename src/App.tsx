import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { SkillMatcher } from "./components/SkillMatcher";
import { MatchesList } from "./components/MatchesList";
import { ProfileView } from "./components/ProfileView";
import { AuthForm } from "./components/AuthForm";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "./components/AuthProvider";

function AppContent() {
  const { session, loading: authLoading, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<"discover" | "matches" | "profile">("discover");
  const [targetMatchId, setTargetMatchId] = useState<string | undefined>(undefined);

  const handleNavigateToChat = (matchId: string) => {
    setTargetMatchId(matchId);
    setActiveTab("matches");
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#020817]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Show auth form if specifically requested
  if (showAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817] p-4 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-900 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-900 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-900 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="z-10 w-full flex flex-col items-center">
          <AuthForm onSuccess={() => setShowAuth(false)} />
          <button
            onClick={() => setShowAuth(false)}
            className="mt-8 text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
          </button>
        </div>
        <Toaster />
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!session) {
    return (
      <>
        <LandingPage onEnter={() => setShowAuth(true)} />
        <Toaster />
      </>
    );
  }

  // Main App (Authenticated users only)
  return (
    <TooltipProvider>
      <DashboardLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={() => {
          signOut();
          setActiveTab("discover");
          setShowAuth(false);
        }}
        isGuest={false}
        onRequireAuth={() => setShowAuth(true)}
      >
        {activeTab === "discover" && (
          <SkillMatcher
            isGuest={false}
            onMatchChat={handleNavigateToChat}
          />
        )}
        {activeTab === "matches" && <MatchesList initialMatchId={targetMatchId} />}
        {activeTab === "profile" && <ProfileView />}
      </DashboardLayout>
      <Toaster />
    </TooltipProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
