// App.tsx - Main Application
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Simulation } from './pages/Simulation';
import { AlertTriangle } from 'lucide-react';

type View = 'landing' | 'auth' | 'dashboard' | 'simulation';

function App() {
    const { user, loading } = useAuth();
    const [view, setView] = useState<View>('landing');

    // Debug backdoor for simulation
    useEffect(() => {
        if (window.location.hash === '#sim') {
            setView('simulation');
        }
    }, []);

    // Show configuration error if Supabase is not set up
    if (!isSupabaseConfigured) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white p-8">
                <div className="max-w-2xl w-full card bg-zinc-900 border-red-900">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
                        <div>
                            <h1 className="text-2xl font-bold mb-2 text-red-500">Configuration Required</h1>
                            <p className="text-zinc-300 mb-4">
                                The Supabase environment variables are not configured. This application requires a Supabase backend to function.
                            </p>
                            <div className="bg-black rounded-lg p-4 border border-zinc-800 mb-4">
                                <p className="text-sm text-zinc-400 mb-2">Required environment variables:</p>
                                <code className="block text-xs text-green-400 font-mono">
                                    VITE_SUPABASE_URL=your_supabase_url<br />
                                    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
                                </code>
                            </div>
                            <p className="text-sm text-zinc-400">
                                <strong>For local development:</strong> Create a <code className="text-green-400">.env</code> file in the project root with the variables above.
                            </p>
                            <p className="text-sm text-zinc-400 mt-2">
                                <strong>For production:</strong> Configure these variables in your hosting platform's environment settings (Vercel, Netlify, etc.).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="spinner border-zinc-500 border-t-white" />
            </div>
        );
    }

    // Simulation Viewer (Accessible via #sim or manual toggle)
    if (view === 'simulation') {
        return <Simulation />;
    }

    // If user is logged in, show dashboard
    if (user) {
        return <Dashboard />;
    }

    // Otherwise show landing or auth based on view state
    if (view === 'auth') {
        return (
            <Auth
                onBack={() => setView('landing')}
                onSuccess={() => { }} // Auth state change will handle redirect
            />
        );
    }

    return <Landing onEnter={() => setView('auth')} />;
}

export default App;
