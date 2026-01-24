// App.tsx - Simulation-Powered Application
import { SimulationProvider } from './context/SimulationContext';
import { Dashboard } from './pages/Dashboard';
import { Simulation } from './pages/Simulation';
import { useState, useEffect } from 'react';

import { StarBackground } from './components/StarBackground';
import { Landing } from './pages/Landing';

type View = 'landing' | 'dashboard' | 'simulation';

function App() {
    const [view, setView] = useState<View>('landing');

    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash === '#sim') {
                setView('simulation');
            } else if (window.location.hash === '#dashboard') {
                setView('dashboard');
            } else {
                setView('landing');
            }
        };

        // Initial check
        handleHashChange();

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const enterApp = () => {
        setView('dashboard');
    };

    return (
        <SimulationProvider>
            <StarBackground />
            <div className="relative z-10 w-full h-full">
                {view === 'landing' && <Landing onEnter={enterApp} />}
                {view === 'simulation' && <Simulation />}
                {view === 'dashboard' && <Dashboard />}
            </div>
        </SimulationProvider>
    );
}

export default App;
