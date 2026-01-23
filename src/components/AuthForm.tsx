import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "./ui/dialog";
import { supabase } from "../lib/supabase";
import { useAuth } from "../features/auth/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowLeft, Plus, X } from "lucide-react";
import { skills, Skill } from "../lib/data";

interface AuthFormProps {
  onSuccess: () => void;
}

type AuthMode = "login" | "signup" | "forgot-password";

export function AuthForm({ onSuccess }: AuthFormProps) {
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [school, setSchool] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [offering, setOffering] = useState<Skill[]>([]);
  const [seeking, setSeeking] = useState<Skill[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [isSeekDialogOpen, setIsSeekDialogOpen] = useState(false);

  // Auto-preview avatar when URL changes
  useEffect(() => {
    if (avatarUrl.trim()) {
      setAvatarPreview(avatarUrl);
    } else {
      setAvatarPreview(null);
    }
  }, [avatarUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trimmedEmail = email.trim();

      if (mode === "login") {
        await signIn({ email: trimmedEmail, password });
        onSuccess();
      } else if (mode === "signup") {
        // Validate skills
        if (offering.length === 0) {
          toast.error("Please select at least one skill you can offer");
          setLoading(false);
          return;
        }
        if (seeking.length === 0) {
          toast.error("Please select at least one skill you want to learn");
          setLoading(false);
          return;
        }

        // Show creating account message
        toast.loading("Creating your account...", { id: "signup-loading" });

        await signUp({
          email: trimmedEmail,
          password,
          name,
          role,
          school,
          avatar: avatarUrl || undefined,
          offering,
          seeking,
        });

        // Dismiss loading toast
        toast.dismiss("signup-loading");

        onSuccess();
      } else if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        toast.success("Password reset email sent!");
        setMode("login");
      }
    } catch (error: any) {
      // Dismiss any loading toasts
      toast.dismiss("signup-loading");

      const msg = error.message || error.toString();

      if (!msg.includes("Invalid login credentials") && !msg.includes("User already registered") && !msg.includes("unique constraint")) {
        console.error("Auth error:", error);
      }

      if (msg.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else if (msg.includes("User already registered") || msg.includes("unique constraint")) {
        toast.error("Account already exists. Please log in.");
        setMode("login");
      } else {
        toast.error(msg || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "login": return "Welcome Back";
      case "signup": return "Join Shooting Stars";
      case "forgot-password": return "Reset Password";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "login": return "Login to continue matching";
      case "signup": return "Start trading skills today";
      case "forgot-password": return "Enter your email to receive a reset link";
    }
  };

  return (
    <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="mb-6 text-center">
        {mode === "forgot-password" && (
          <div className="flex justify-start mb-2">
            <Button variant="ghost" size="sm" onClick={() => setMode("login")} className="p-0 hover:bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </div>
        )}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-2xl">
            ⭐
          </div>
        </div>
        <h2 className="text-2xl font-bold">{getTitle()}</h2>
        <p className="text-slate-500 text-sm mt-1">
          {getSubtitle()}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="Alex Chen" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Input placeholder="Designer" value={role} onChange={(e) => setRole(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>School</Label>
                <Input placeholder="University" value={school} onChange={(e) => setSchool(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Profile Picture URL</Label>
              <Input
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
              {avatarPreview && (
                <div className="flex justify-center mt-2">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
                    onError={() => setAvatarPreview(null)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>I Can Teach / Offer</Label>
              <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border border-slate-200 rounded-md">
                {offering.map(skill => (
                  <Badge key={skill.id} variant="outline" className="pl-2 pr-1 py-1 text-xs gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
                    {skill.name}
                    <button
                      type="button"
                      onClick={() => setOffering(offering.filter(s => s.id !== skill.id))}
                      className="p-0.5 hover:bg-emerald-500/30 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="h-6 rounded-full border-dashed text-xs">
                      <Plus className="w-3 h-3 mr-1" /> Add Skill
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white text-slate-900 sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add a Skill</DialogTitle>
                      <DialogDescription>What can you teach others?</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {skills.filter(s => !offering.some(o => o.id === s.id)).map(skill => (
                        <Button
                          key={skill.id}
                          type="button"
                          variant="outline"
                          className="justify-start text-sm"
                          onClick={() => {
                            setOffering([...offering, skill]);
                            setIsOfferDialogOpen(false);
                          }}
                        >
                          {skill.name}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="space-y-2">
              <Label>I Want to Learn</Label>
              <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border border-slate-200 rounded-md">
                {seeking.map(skill => (
                  <Badge key={skill.id} variant="outline" className="pl-2 pr-1 py-1 text-xs gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700">
                    {skill.name}
                    <button
                      type="button"
                      onClick={() => setSeeking(seeking.filter(s => s.id !== skill.id))}
                      className="p-0.5 hover:bg-amber-500/30 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <Dialog open={isSeekDialogOpen} onOpenChange={setIsSeekDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="h-6 rounded-full border-dashed text-xs">
                      <Plus className="w-3 h-3 mr-1" /> Add Interest
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white text-slate-900 sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add an Interest</DialogTitle>
                      <DialogDescription>What do you want to learn?</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {skills.filter(s => !seeking.some(sk => sk.id === s.id)).map(skill => (
                        <Button
                          key={skill.id}
                          type="button"
                          variant="outline"
                          className="justify-start text-sm"
                          onClick={() => {
                            setSeeking([...seeking, skill]);
                            setIsSeekDialogOpen(false);
                          }}
                        >
                          {skill.name}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" placeholder="student@edu.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        {mode !== "forgot-password" && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Password</Label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot-password")}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === "signup" && <p className="text-[10px] text-slate-400">Must be at least 6 characters</p>}
          </div>
        )}

        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {mode === "login" ? "Login" : mode === "signup" ? "Sign Up" : "Send Reset Link"}
        </Button>
      </form>

      {mode !== "forgot-password" && (
        <div className="mt-6 text-center text-sm">
          <span className="text-slate-500">{mode === "login" ? "New here? " : "Already have an account? "}</span>
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="font-semibold text-blue-600 hover:underline"
          >
            {mode === "login" ? "Create Account" : "Login"}
          </button>
        </div>
      )}
    </Card>
  );
}
