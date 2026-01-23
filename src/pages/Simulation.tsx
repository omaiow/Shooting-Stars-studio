// Simulation Control Panel
import { useState } from 'react';
import { seedPopulation, ScenarioType } from '../lib/simulation';
import { Activity, Database, Play, RefreshCw, AlertTriangle } from 'lucide-react';

export function Simulation() {
    const [scenario, setScenario] = useState<ScenarioType>('baseline');
    const [count, setCount] = useState(10);
    const [generating, setGenerating] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [msg, ...prev]);

    const handleGenerate = async () => {
        setGenerating(true);
        addLog(`Starting generation: ${count} users (${scenario})...`);

        try {
            const created = await seedPopulation(count, scenario);
            addLog(`Success! Created ${created} new users.`);
        } catch (error) {
            addLog(`Error: ${error}`);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <header className="mb-8 border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-8 h-8 text-blue-500" />
                    <h1 className="text-3xl font-bold">Simulation Control</h1>
                </div>
                <p className="text-zinc-400">Manage synthetic population and run matching scenarios.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-6">
                    <div className="card bg-zinc-900 border-zinc-800">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Database className="w-5 h-5" /> Population Generator
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Scenario</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setScenario('baseline')}
                                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${scenario === 'baseline'
                                            ? 'bg-white text-black border-white'
                                            : 'bg-black text-zinc-400 border-zinc-700 hover:border-zinc-500'
                                            }`}
                                    >
                                        Baseline
                                        <span className="block text-xs font-normal opacity-60 mt-1">Balanced distribution</span>
                                    </button>
                                    <button
                                        onClick={() => setScenario('scarcity')}
                                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${scenario === 'scarcity'
                                            ? 'bg-white text-black border-white'
                                            : 'bg-black text-zinc-400 border-zinc-700 hover:border-zinc-500'
                                            }`}
                                    >
                                        High Scarcity
                                        <span className="block text-xs font-normal opacity-60 mt-1">90% Demand / 10% Supply</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Population Size: {count}</label>
                                <input
                                    type="range"
                                    min="5"
                                    max="50"
                                    value={count}
                                    onChange={e => setCount(parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                                    <span>5</span>
                                    <span>50</span>
                                </div>
                                <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Warning: High values may take time (Rate Limits)
                                </p>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="btn btn-primary w-full bg-blue-600 hover:bg-blue-500 text-white border-none flex items-center justify-center gap-2"
                            >
                                {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                {generating ? 'Generating...' : 'Generate Population'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Logs / Stats */}
                <div className="space-y-6">
                    <div className="card bg-zinc-900 border-zinc-800 h-full flex flex-col">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5" /> Activity Log
                        </h2>
                        <div className="flex-1 bg-black rounded-lg p-4 font-mono text-sm text-green-400 overflow-y-auto max-h-[400px]">
                            {logs.length === 0 ? (
                                <span className="text-zinc-600 opacity-50">Ready to simulate...</span>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="mb-1 border-b border-white/5 pb-1 last:border-0">
                                        <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
