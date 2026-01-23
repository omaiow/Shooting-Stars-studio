// Profile Page - View and edit profile
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Skill } from '../lib/types';
import { Plus, X, LogOut, Edit2, Save, User as UserIcon, BookOpen, Briefcase, GraduationCap } from 'lucide-react';

// Available skills to choose from
const AVAILABLE_SKILLS = [
    'Programming', 'Web Development', 'Mobile Development', 'Data Science',
    'Machine Learning', 'UI/UX Design', 'Graphic Design', 'Photography',
    'Video Editing', 'Music Production', 'Guitar', 'Piano', 'Singing',
    'Drawing', 'Painting', 'Writing', 'Public Speaking', 'Marketing',
    'Business', 'Finance', 'Cooking', 'Fitness', 'Yoga', 'Languages',
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Philosophy'
];

export function Profile() {
    const { user, signOut } = useAuth();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [school, setSchool] = useState('');
    const [bio, setBio] = useState('');
    const [offering, setOffering] = useState<Skill[]>([]);
    const [seeking, setSeeking] = useState<Skill[]>([]);

    // Skill picker state
    const [showOfferingPicker, setShowOfferingPicker] = useState(false);
    const [showSeekingPicker, setShowSeekingPicker] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setRole(user.role || '');
            setSchool(user.school || '');
            setBio(user.bio || '');
            setOffering(user.offering || []);
            setSeeking(user.seeking || []);
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;

        try {
            setSaving(true);

            // Update profile
            await supabase
                .from('profiles')
                .update({ name, role, school, bio })
                .eq('id', user.id);

            setEditing(false);
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const addSkill = async (skillName: string, type: 'offering' | 'seeking') => {
        if (!user) return;

        const existing = type === 'offering' ? offering : seeking;
        if (existing.some(s => s.name === skillName)) return;

        try {
            const { data, error } = await supabase
                .from('skills')
                .insert({
                    user_id: user.id,
                    name: skillName,
                    is_offering: type === 'offering',
                })
                .select()
                .single();

            if (error) throw error;

            const newSkill = { id: data.id, name: data.name };

            if (type === 'offering') {
                setOffering(prev => [...prev, newSkill]);
            } else {
                setSeeking(prev => [...prev, newSkill]);
            }
        } catch (error) {
            console.error('Error adding skill:', error);
        }

        setShowOfferingPicker(false);
        setShowSeekingPicker(false);
    };

    const removeSkill = async (skillId: string, type: 'offering' | 'seeking') => {
        try {
            await supabase.from('skills').delete().eq('id', skillId);

            if (type === 'offering') {
                setOffering(prev => prev.filter(s => s.id !== skillId));
            } else {
                setSeeking(prev => prev.filter(s => s.id !== skillId));
            }
        } catch (error) {
            console.error('Error removing skill:', error);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="spinner border-zinc-500 border-t-white" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 overflow-y-auto h-full bg-black text-white">
            {/* Profile Header */}
            <div className="flex items-start gap-6 mb-8">
                <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                    alt={user.name}
                    className="w-24 h-24 rounded-full border border-zinc-700 bg-zinc-800 object-cover"
                />
                <div className="flex-1 pt-1">
                    {editing ? (
                        <div className="space-y-3">
                            <input
                                type="text"
                                className="input text-2xl font-bold bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white mb-2"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Your Name"
                            />
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input
                                        type="text"
                                        className="input text-sm pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white"
                                        value={role}
                                        onChange={e => setRole(e.target.value)}
                                        placeholder="Role"
                                    />
                                </div>
                                <div className="relative flex-1">
                                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input
                                        type="text"
                                        className="input text-sm pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white"
                                        value={school}
                                        onChange={e => setSchool(e.target.value)}
                                        placeholder="School/Org"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-2xl font-bold mb-1 text-white">{user.name}</h1>
                            <p className="text-zinc-400 flex items-center gap-2 text-sm">
                                {user.role && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {user.role}</span>}
                                {user.school && <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {user.school}</span>}
                            </p>
                        </div>
                    )}
                </div>

                {editing ? (
                    <div className="flex gap-2">
                        <button onClick={() => setEditing(false)} className="btn btn-secondary border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="btn btn-primary bg-white text-black hover:bg-zinc-200 border-white flex items-center gap-2" disabled={saving}>
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setEditing(true)} className="btn btn-secondary border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 flex items-center gap-2">
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </button>
                )}
            </div>

            {/* Bio */}
            <div className="card mb-6 border-zinc-800 bg-zinc-900/30">
                <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-zinc-500" />
                    <h3 className="font-semibold text-zinc-200">About Me</h3>
                </div>
                {editing ? (
                    <textarea
                        className="input min-h-[100px] bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white resize-none"
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="Tell others about yourself..."
                    />
                ) : (
                    <p className="text-zinc-400 leading-relaxed text-sm">
                        {user.bio || 'No bio yet. Click Edit to add one!'}
                    </p>
                )}
            </div>

            {/* Skills I Offer */}
            <div className="card mb-6 relative border-zinc-800 bg-zinc-900/30">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-zinc-200">Skills I Can Offer</h3>
                    <button
                        onClick={() => setShowOfferingPicker(!showOfferingPicker)}
                        className="btn btn-secondary text-xs py-1.5 px-3 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" /> Add
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {offering.map(skill => (
                        <span key={skill.id} className="badge badge-offering flex items-center gap-1 border-zinc-700 bg-zinc-800/50 text-zinc-300 pl-3 pr-2 py-1.5">
                            {skill.name}
                            <button
                                onClick={() => removeSkill(skill.id, 'offering')}
                                className="hover:text-red-400 ml-1 p-0.5 rounded-full hover:bg-zinc-700 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    {offering.length === 0 && (
                        <p className="text-zinc-600 text-sm italic">No skills added yet</p>
                    )}
                </div>

                {/* Skill Picker Dropdown */}
                {showOfferingPicker && (
                    <div className="absolute top-full left-0 right-0 mt-2 card z-20 max-h-48 overflow-y-auto bg-zinc-950 border-zinc-800 shadow-xl">
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_SKILLS.filter(s => !offering.some(o => o.name === s)).map(skill => (
                                <button
                                    key={skill}
                                    onClick={() => addSkill(skill, 'offering')}
                                    className="badge border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 cursor-pointer transition-colors text-zinc-400 hover:text-white"
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Skills I Need */}
            <div className="card mb-6 relative border-zinc-800 bg-zinc-900/30">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-zinc-200">Skills I Need</h3>
                    <button
                        onClick={() => setShowSeekingPicker(!showSeekingPicker)}
                        className="btn btn-secondary text-xs py-1.5 px-3 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" /> Add
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {seeking.map(skill => (
                        <span key={skill.id} className="badge badge-seeking flex items-center gap-1 border-zinc-700 bg-zinc-800/50 text-zinc-400 pl-3 pr-2 py-1.5">
                            {skill.name}
                            <button
                                onClick={() => removeSkill(skill.id, 'seeking')}
                                className="hover:text-red-400 ml-1 p-0.5 rounded-full hover:bg-zinc-700 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    {seeking.length === 0 && (
                        <p className="text-zinc-600 text-sm italic">No interests added yet</p>
                    )}
                </div>

                {/* Skill Picker Dropdown */}
                {showSeekingPicker && (
                    <div className="absolute top-full left-0 right-0 mt-2 card z-20 max-h-48 overflow-y-auto bg-zinc-950 border-zinc-800 shadow-xl">
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_SKILLS.filter(s => !seeking.some(o => o.name === s)).map(skill => (
                                <button
                                    key={skill}
                                    onClick={() => addSkill(skill, 'seeking')}
                                    className="badge border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 cursor-pointer transition-colors text-zinc-400 hover:text-white"
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Account Section */}
            <div className="card border-zinc-800 bg-zinc-900/30">
                <div className="flex items-center gap-2 mb-3">
                    <UserIcon className="w-4 h-4 text-zinc-500" />
                    <h3 className="font-semibold text-zinc-200">Account</h3>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-zinc-500 text-sm">{user.email}</p>
                    <button
                        onClick={signOut}
                        className="btn btn-danger text-sm py-1.5 px-4 flex items-center gap-2 border-red-900/50 text-red-500 hover:bg-red-950/20"
                    >
                        <LogOut className="w-3 h-3" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
