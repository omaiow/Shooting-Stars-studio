import { useState } from "react";
import { Button } from "./ui/button";
import { LayoutGrid, MessageSquare, UserCircle, LogOut, Sparkles, Home } from "lucide-react";
import { cn } from "./ui/utils";
import { ShootingStarsBackground } from "./ShootingStarsBackground";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: "discover" | "matches" | "profile";
  onTabChange: (tab: "discover" | "matches" | "profile") => void;
  onLogout: () => void;
  isGuest?: boolean;
  onRequireAuth?: () => void;
}

export function DashboardLayout({ children, activeTab, onTabChange, onLogout, isGuest, onRequireAuth }: DashboardLayoutProps) {

  const handleTabChange = (tab: "discover" | "matches" | "profile") => {
    if (isGuest && (tab === "matches" || tab === "profile")) {
      onRequireAuth?.();
      return;
    }
    onTabChange(tab);
  };

  return (
    <div className="flex h-screen bg-[#020817] text-white overflow-hidden relative">
      <ShootingStarsBackground />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/40 backdrop-blur-xl border-r border-slate-800 p-6 z-20 relative">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Shooting Stars</span>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem
            icon={<LayoutGrid />}
            label="Discover"
            isActive={activeTab === "discover"}
            onClick={() => handleTabChange("discover")}
          />
          <NavItem
            icon={<MessageSquare />}
            label="Matches"
            isActive={activeTab === "matches"}
            onClick={() => handleTabChange("matches")}
          />
          <NavItem
            icon={<UserCircle />}
            label="Profile"
            isActive={activeTab === "profile"}
            onClick={() => handleTabChange("profile")}
          />
        </nav>

        <div className="pt-6 border-t border-slate-800 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all" onClick={onLogout}>
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#020817]/80 backdrop-blur-lg border-b border-slate-800 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onLogout} className="text-slate-400 hover:text-white hover:bg-slate-800 -ml-2">
            <Home className="w-5 h-5" />
          </Button>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white">Shooting Stars</span>
        </div>
        {/* Spacer to balance the header */}
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative z-10 flex flex-col">
        <div className="flex-1 h-full w-full overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0 scrollbar-hide">
          <div className="min-h-full max-w-5xl mx-auto md:p-6">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#020817]/90 backdrop-blur-xl border-t border-slate-800 z-50 flex justify-around items-center px-2 pb-safe">
        <MobileNavItem
          icon={<LayoutGrid />}
          label="Discover"
          isActive={activeTab === "discover"}
          onClick={() => handleTabChange("discover")}
        />
        <MobileNavItem
          icon={<MessageSquare />}
          label="Matches"
          isActive={activeTab === "matches"}
          onClick={() => handleTabChange("matches")}
        />
        <MobileNavItem
          icon={<UserCircle />}
          label="Profile"
          isActive={activeTab === "profile"}
          onClick={() => handleTabChange("profile")}
        />
      </div>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
          : "text-slate-400 hover:text-white hover:bg-slate-800/50"
      )}
    >
      <div className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")}>{icon}</div>
      {label}
    </button>
  );
}

function MobileNavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] font-medium transition-all duration-200",
        isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
      )}
    >
      <div className={cn("w-6 h-6", isActive ? "stroke-2 scale-110" : "stroke-1 scale-100")}>{icon}</div>
      {label}
    </button>
  );
}
