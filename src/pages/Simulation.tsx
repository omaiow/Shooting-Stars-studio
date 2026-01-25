// Simulation Control Panel with Enhanced Visualization
import { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Activity, Database, Play, RefreshCw, AlertTriangle, Download, Trash2, UserPlus, X, Plus, Save, ArrowLeft, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { SKILLS_LIST } from '../lib/simulation';
import type { Skill } from '../lib/types';

export function Simulation() {
    const {
        stats,
        users,
        matches,
        generateUsers,
        addUser,
        resetSimulation,
        scenario,
        setScenario,
        matchProbability,
        setMatchProbability,
        simulateSwipe
    } = useSimulation();

    const [count, setCount] = useState(10);
    const [generating, setGenerating] = useState(false);

    // User Creation State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState('');
    const [newSchool, setNewSchool] = useState('');
    const [newBio, setNewBio] = useState('');
    const [newOffering, setNewOffering] = useState<Skill[]>([]);
    const [newSeeking, setNewSeeking] = useState<Skill[]>([]);
    const [skillInputOffering, setSkillInputOffering] = useState('');
    const [skillInputSeeking, setSkillInputSeeking] = useState('');
    const [simulationCount, setSimulationCount] = useState(500);
    const [simulating, setSimulating] = useState(false);

    const handleRunSimulation = async () => {
        if (users.length < 2) {
            alert("Need at least 2 users to simulate swipes!");
            return;
        }
        setSimulating(true);

        // Run simulation in a microtask to allow UI update
        setTimeout(() => {
            for (let i = 0; i < simulationCount; i++) {
                const actorIndex = Math.floor(Math.random() * users.length);
                const actor = users[actorIndex];

                let targetIndex = Math.floor(Math.random() * users.length);
                while (targetIndex === actorIndex) {
                    targetIndex = Math.floor(Math.random() * users.length);
                }
                const target = users[targetIndex];

                // Skill-based decision making
                const seekingSkills = actor.seeking.map(s => s.name);
                const offeredSkills = target.offering.map(s => s.name);

                // Do they offer something I want?
                const hasSkillMatch = seekingSkills.some(skill => offeredSkills.includes(skill));

                // Baseline behavior: heavily weighted by skill match, but with some randomness
                let likeProbability = hasSkillMatch ? 0.8 : 0.2;

                // In Scarcity scenario: 
                // 90% need Web Dev (seeking), 10% offer it.
                // If I need Web Dev and you don't have it -> No Like.
                // If I need Web Dev and you HAVE it -> HIGH Like.

                const action = Math.random() < likeProbability ? 'like' : 'pass';
                simulateSwipe(actor.id, target.id, action);
            }
            setSimulating(false);
        }, 100);
    };

    const handleGenerate = async () => {
        setGenerating(true);
        // Simulate async delay for UI feel
        await new Promise(resolve => setTimeout(resolve, 500));
        generateUsers(count, scenario);
        setGenerating(false);
    };

    const handleCreateUser = () => {
        if (!newName || !newRole) {
            alert("Name and Role are required!");
            return;
        }

        const newUser = {
            id: `manual-${Date.now()}`,
            name: newName,
            role: newRole,
            school: newSchool,
            bio: newBio,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`, // Consistent avatar gen
            offering: newOffering,
            seeking: newSeeking,
            created_at: new Date().toISOString()
        };

        addUser(newUser);
        setShowCreateModal(false);
        resetForm();
    };

    const resetForm = () => {
        setNewName('');
        setNewRole('');
        setNewSchool('');
        setNewBio('');
        setNewOffering([]);
        setNewSeeking([]);
        setSkillInputOffering('');
        setSkillInputSeeking('');
    };

    const addSkill = (type: 'offering' | 'seeking', skillName: string) => {
        if (!skillName) return;
        const list = type === 'offering' ? newOffering : newSeeking;
        if (list.some(s => s.name === skillName)) return;

        const newSkill = { id: `manual-skill-${Date.now()}-${Math.random()}`, name: skillName };
        if (type === 'offering') setNewOffering([...newOffering, newSkill]);
        else setNewSeeking([...newSeeking, newSkill]);
    };

    const removeSkill = (type: 'offering' | 'seeking', id: string) => {
        if (type === 'offering') setNewOffering(newOffering.filter(s => s.id !== id));
        else setNewSeeking(newSeeking.filter(s => s.id !== id));
    };

    const handleExport = () => {
        const data = {
            timestamp: new Date().toISOString(),
            stats,
            scenario,
            matchProbability,
            populationSize: users.length,
            matches: matches.length,
            users: users, // Export full user data for analysis
            matchData: matches // Export match details
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `simulation_report_${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Prepare data for charts
    const roleDistribution = users.reduce((acc, user) => {
        const role = user.role || 'Unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const roleData = Object.entries(roleDistribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5 roles

    const skillDemandDistribution = users.reduce((acc, user) => {
        user.seeking.forEach(skill => {
            acc[skill.name] = (acc[skill.name] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    const skillData = Object.entries(skillDemandDistribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8); // Top 8 sought skills

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="min-h-screen bg-black/80 backdrop-blur-md text-white p-8 overflow-y-auto">
            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="card w-full max-w-2xl bg-zinc-950 border-zinc-700 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-blue-500" />
                                Create Simulated User
                            </h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-zinc-300 border-b border-zinc-800 pb-2">Profile Info</h3>
                                <div>
                                    <label className="text-xs text-zinc-500 block mb-1">Name</label>
                                    <input
                                        type="text"
                                        className="input w-full bg-zinc-900 border-zinc-800"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500 block mb-1">Role/Major</label>
                                    <input
                                        type="text"
                                        className="input w-full bg-zinc-900 border-zinc-800"
                                        value={newRole}
                                        onChange={e => setNewRole(e.target.value)}
                                        placeholder="e.g. CS Student"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500 block mb-1">School (Optional)</label>
                                    <input
                                        type="text"
                                        className="input w-full bg-zinc-900 border-zinc-800"
                                        value={newSchool}
                                        onChange={e => setNewSchool(e.target.value)}
                                        placeholder="e.g. Tech University"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500 block mb-1">Bio (Optional)</label>
                                    <textarea
                                        className="input w-full bg-zinc-900 border-zinc-800 resize-none h-20"
                                        value={newBio}
                                        onChange={e => setNewBio(e.target.value)}
                                        placeholder="Brief description..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-zinc-300 border-b border-zinc-800 pb-2 mb-3">Skills Offered</h3>
                                    <div className="flex gap-2 mb-2">
                                        <select
                                            className="input flex-1 bg-zinc-900 border-zinc-800"
                                            value={skillInputOffering}
                                            onChange={e => setSkillInputOffering(e.target.value)}
                                        >
                                            <option value="">Select Skill...</option>
                                            {SKILLS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <button
                                            onClick={() => { addSkill('offering', skillInputOffering); setSkillInputOffering(''); }}
                                            className="btn btn-secondary py-1 px-3"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 min-h-[50px] bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
                                        {newOffering.map(s => (
                                            <span key={s.id} className="badge badge-offering text-zinc-300 flex items-center gap-1">
                                                {s.name}
                                                <button onClick={() => removeSkill('offering', s.id)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-zinc-300 border-b border-zinc-800 pb-2 mb-3">Skills Sought</h3>
                                    <div className="flex gap-2 mb-2">
                                        <select
                                            className="input flex-1 bg-zinc-900 border-zinc-800"
                                            value={skillInputSeeking}
                                            onChange={e => setSkillInputSeeking(e.target.value)}
                                        >
                                            <option value="">Select Skill...</option>
                                            {SKILLS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <button
                                            onClick={() => { addSkill('seeking', skillInputSeeking); setSkillInputSeeking(''); }}
                                            className="btn btn-secondary py-1 px-3"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 min-h-[50px] bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
                                        {newSeeking.map(s => (
                                            <span key={s.id} className="badge badge-seeking text-zinc-400 flex items-center gap-1">
                                                {s.name}
                                                <button onClick={() => removeSkill('seeking', s.id)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-zinc-800 flex justify-end gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary text-zinc-400 hover:text-white">Cancel</button>
                            <button onClick={handleCreateUser} className="btn btn-primary bg-blue-600 hover:bg-blue-500 text-white border-none flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                Create User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="mb-8 border-b border-zinc-800 pb-4 flex justify-between items-end">
                <div>
                    <button
                        onClick={() => window.location.hash = '#dashboard'}
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4 text-sm transition-colors group bg-transparent border-none cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-8 h-8 text-blue-500" />
                        <h1 className="text-3xl font-bold">Simulation Control & Analytics</h1>
                    </div>
                    <p className="text-zinc-400">Manage synthetic population and visualize matching performance.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary bg-zinc-800 hover:bg-zinc-700 border-zinc-700 hover:border-zinc-500 flex items-center gap-2"
                        title="Manually Create User"
                    >
                        <UserPlus className="w-4 h-4" />
                        Create User
                    </button>
                    <button
                        onClick={handleExport}
                        className="btn btn-secondary border-zinc-700 hover:border-zinc-500 flex items-center gap-2"
                        title="Download JSON Report"
                    >
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to reset the entire simulation?")) resetSimulation();
                        }}
                        className="btn btn-danger border-red-900/50 hover:bg-red-950/30 text-red-500 flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Reset
                    </button>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Controls */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="card bg-zinc-900 border-zinc-800 p-4">
                            <p className="text-xs text-zinc-500 uppercase">Match Rate</p>
                            <p className="text-2xl font-bold text-green-400">{stats.matchRate.toFixed(1)}%</p>
                            <p className="text-xs text-zinc-600">{stats.rightSwipes} likes / {stats.totalMatches} matches</p>
                        </div>
                        <div className="card bg-zinc-900 border-zinc-800 p-4">
                            <p className="text-xs text-zinc-500 uppercase">Utilization</p>
                            <p className="text-2xl font-bold text-blue-400">{stats.userUtilization.toFixed(1)}%</p>
                            <p className="text-xs text-zinc-600">Matched Users / Total</p>
                        </div>
                    </div>

                    {/* Population Generator */}
                    <div className="card bg-zinc-900 border-zinc-800">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Database className="w-5 h-5" /> Generator
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
                                        <span className="block text-xs font-normal opacity-60 mt-1">Balanced</span>
                                    </button>
                                    <button
                                        onClick={() => setScenario('scarcity')}
                                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${scenario === 'scarcity'
                                            ? 'bg-white text-black border-white'
                                            : 'bg-black text-zinc-400 border-zinc-700 hover:border-zinc-500'
                                            }`}
                                    >
                                        Scarcity
                                        <span className="block text-xs font-normal opacity-60 mt-1">High Demand</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Generate Count: {count}</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={count}
                                    onChange={e => setCount(parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="btn btn-primary w-full bg-blue-600 hover:bg-blue-500 text-white border-none flex items-center justify-center gap-2"
                            >
                                {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                {generating ? 'Generating...' : 'Add Users'}
                            </button>
                        </div>
                    </div>

                    {/* Probability Control */}
                    <div className="card bg-zinc-900 border-zinc-800">
                        <h2 className="text-xl font-bold mb-2">Match Probability</h2>
                        <p className="text-xs text-zinc-500 mb-4">Chance of a "Like" resulting in a Match (simulating other user's interest).</p>

                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={matchProbability}
                                onChange={e => setMatchProbability(parseFloat(e.target.value))}
                                className="flex-1"
                            />
                            <span className="font-mono font-bold w-12 text-right">
                                {(matchProbability * 100).toFixed(0)}%
                            </span>
                        </div>
                    </div>


                    {/* Automated Simulation */}
                    <div className="card bg-zinc-900 border-zinc-800">
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" /> Auto-Swipe
                        </h2>
                        <p className="text-xs text-zinc-500 mb-4">Simulate random user activity.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Simulate Swipes: {simulationCount}</label>
                                <input
                                    type="range"
                                    min="10"
                                    max="1000"
                                    step="10"
                                    value={simulationCount}
                                    onChange={e => setSimulationCount(parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            <button
                                onClick={handleRunSimulation}
                                disabled={simulating || users.length < 2}
                                className="btn w-full bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-500 border border-yellow-600/50 flex items-center justify-center gap-2"
                            >
                                {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                {simulating ? 'Simulating...' : 'Run Simulation'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visualizations */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Top Roles Chart */}
                    <div className="card bg-zinc-900 border-zinc-800 p-6">
                        <h3 className="font-semibold mb-6">Population Distribution (Top Roles)</h3>
                        <div className="h-64 w-full">
                            {roleData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={roleData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }: { name?: string | number; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {roleData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-zinc-600">
                                    No data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Skill Demand Chart */}
                    <div className="card bg-zinc-900 border-zinc-800 p-6">
                        <h3 className="font-semibold mb-6">Most Sought Skills (Demand)</h3>
                        <div className="h-64 w-full">
                            {skillData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={skillData} layout="vertical" margin={{ left: 40 }}>
                                        <XAxis type="number" stroke="#52525b" />
                                        <YAxis dataKey="name" type="category" width={100} stroke="#a1a1aa" fontSize={12} />
                                        <Tooltip
                                            cursor={{ fill: '#27272a' }}
                                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                                        />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-zinc-600">
                                    No data available
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="card bg-zinc-900 border-zinc-800 p-4">
                            <h4 className="text-zinc-400 text-sm mb-1">Total Simulated Swipes</h4>
                            <p className="text-3xl font-mono">{stats.totalSwipes}</p>
                        </div>
                        <div className="card bg-zinc-900 border-zinc-800 p-4">
                            <h4 className="text-zinc-400 text-sm mb-1">Population Size</h4>
                            <p className="text-3xl font-mono">{stats.totalUsers}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
