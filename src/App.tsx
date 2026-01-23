// App.tsx - Main Application
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Simulation } from './pages/Simulation';

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
