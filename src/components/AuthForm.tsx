import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";
import { Loader2, Sparkles, Eye, EyeOff, ArrowLeft } from "lucide-react";

interface AuthFormProps {
  onSuccess: () => void;
}

type AuthMode = "login" | "signup" | "forgot-password";

export function AuthForm({ onSuccess }: AuthFormProps) {
  const { signUp, loginAsDemo } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [school, setSchool] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trimmedEmail = email.trim();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) throw error;
        onSuccess();
      } else if (mode === "signup") {
        // Sign Up via AuthProvider
        await signUp({ email: trimmedEmail, password, name, role, school });
        toast.success("Account created successfully!");
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
      const msg = error.message || error.toString();

      if (!msg.includes("Invalid login credentials") && !msg.includes("User already registered") && !msg.includes("unique constraint")) {
        console.error("Auth error:", error);
      }

      if (msg.includes("Invalid login credentials")) {
        toast.error("Wrong password");
      } else if (msg.includes("User already registered") || msg.includes("unique constraint")) {
        toast.error("Account already exists. Please log in.");
        setMode("login");
      } else {
        toast.error(msg);
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
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
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
        <>
          <div className="text-center my-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or</span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            onClick={() => {
              loginAsDemo();
              onSuccess();
            }}
          >
            <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
            Try Demo Account
          </Button>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500">{mode === "login" ? "New here? " : "Already have an account? "}</span>
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-semibold text-blue-600 hover:underline"
            >
              {mode === "login" ? "Create Account" : "Login"}
            </button>
          </div>
        </>
      )}
    </Card>
  );
}
