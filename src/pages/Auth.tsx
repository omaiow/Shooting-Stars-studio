// Auth Page - Login and Sign Up
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Star, ArrowLeft } from 'lucide-react';

interface AuthProps {
    onBack: () => void;
    onSuccess: () => void;
}

export function Auth({ onBack, onSuccess }: AuthProps) {
    const { signIn, signUp } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [school, setSchool] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                await signUp(email, password, { name, role, school });
            } else {
                await signIn(email, password);
            }
            // Add a small delay to ensure auth state updates before redirecting
            setTimeout(() => {
                onSuccess();
            }, 100);
        } catch (err: any) {
            console.error('Auth error:', err);
            setError(err.message || 'Something went wrong');
            setLoading(false); // Ensure loading is reset on error
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative bg-black">
            <div className="card w-full max-w-md relative z-10 border-zinc-800 bg-zinc-950/50">
                <div className="text-center mb-8 flex flex-col items-center">
                    <Star className="w-12 h-12 mb-4 text-white fill-white" />
                    <h1 className="text-2xl font-bold mb-2 text-white">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-zinc-400">
                        {isSignUp ? 'Start your skill exchange journey' : 'Sign in to continue'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                        <>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    className="input bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Role</label>
                                    <input
                                        type="text"
                                        className="input bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white"
                                        placeholder="Student"
                                        value={role}
                                        onChange={e => setRole(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">School/Org</label>
                                    <input
                                        type="text"
                                        className="input bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white"
                                        placeholder="University"
                                        value={school}
                                        onChange={e => setSchool(e.target.value)}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Email</label>
                        <input
                            type="email"
                            className="input bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Password</label>
                        <input
                            type="password"
                            className="input bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full bg-white text-black hover:bg-zinc-200 border-white"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner border-black border-t-transparent" />
                        ) : (
                            isSignUp ? 'Sign Up' : 'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError(''); // Clear error when switching modes
                        }}
                        className="text-zinc-400 hover:text-white transition-colors text-sm"
                    >
                        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </button>
                </div>

                <button
                    onClick={onBack}
                    className="mt-6 text-zinc-500 hover:text-zinc-300 transition-colors text-sm flex items-center gap-2 mx-auto"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </button>
            </div>
        </div>
    );
}
