import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from "./ui/dialog";
import { Plus, Loader2, Save, X, Camera } from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { skills, Skill } from "../lib/data";
import { useAuth } from "./AuthProvider";

export function ProfileView() {
    const { profile: authProfile, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [school, setSchool] = useState("");
    const [bio, setBio] = useState("");
    const [offering, setOffering] = useState<Skill[]>([]);
    const [seeking, setSeeking] = useState<Skill[]>([]);
    const [avatarLoading, setAvatarLoading] = useState(false);

    // Dialog State
    const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
    const [isSeekDialogOpen, setIsSeekDialogOpen] = useState(false);
    const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
    const [avatarUrlInput, setAvatarUrlInput] = useState("");

    useEffect(() => {
        if (authProfile) {
            setName(authProfile.name || "");
            setRole(authProfile.role || "");
            setSchool(authProfile.school || "");
            setBio(authProfile.bio || "");
            setOffering(authProfile.offering || []);
            setSeeking(authProfile.seeking || []);
        }
    }, [authProfile]);

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            await api.updateProfile({ name, role, school, bio });
            await refreshProfile();
            setEditing(false);
            toast.success("Profile updated");
        } catch (e) {
            toast.error("Failed to save profile");
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = async (skill: Skill, type: 'offering' | 'seeking') => {
        try {
            const currentList = type === 'offering' ? offering : seeking;
            if (currentList.some(s => s.id === skill.id)) {
                toast.error("Skill already added");
                return;
            }

            const newList = [...currentList, skill];

            // Optimistic update
            if (type === 'offering') setOffering(newList);
            else setSeeking(newList);

            if (type === 'offering') setIsOfferDialogOpen(false);
            else setIsSeekDialogOpen(false);

            await api.updateProfile({ [type]: newList });
            await refreshProfile();
            toast.success(`${skill.name} added`);
        } catch (e) {
            toast.error("Failed to add skill");
            // Revert on error would be ideal here
        }
    };

    const handleRemoveSkill = async (skillId: string, type: 'offering' | 'seeking') => {
        try {
            const currentList = type === 'offering' ? offering : seeking;
            const newList = currentList.filter(s => s.id !== skillId);

            if (type === 'offering') setOffering(newList);
            else setSeeking(newList);

            await api.updateProfile({ [type]: newList });
            await refreshProfile();
        } catch (e) {
            toast.error("Failed to remove skill");
        }
    };

    const handleAvatarSave = async () => {
        try {
            if (!avatarUrlInput.trim()) return;
            setAvatarLoading(true);
            await api.updateProfile({ avatar: avatarUrlInput });
            await refreshProfile();
            setIsAvatarDialogOpen(false);
            toast.success("Profile picture updated");
        } catch (e) {
            toast.error("Failed to update avatar");
        } finally {
            setAvatarLoading(false);
        }
    };

    if (!authProfile) {
        return (
            <div className="flex flex-col items-center justify-center p-8 min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                <p className="text-slate-400">Loading profile...</p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshProfile()}
                    className="mt-4 border-slate-700 text-slate-400 hover:text-white"
                >
                    Retry
                </Button>
            </div>
        );
    }

    // Filter skills for dialogs (exclude already selected)
    const availableOffering = skills.filter(s => !offering.some(o => o.id === s.id));
    const availableSeeking = skills.filter(s => !seeking.some(o => o.id === s.id));

    return (
        <div className="max-w-2xl mx-auto space-y-8 p-4 pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-slate-800 overflow-hidden border-4 border-slate-700 shadow-xl shadow-black/30 relative">
                        <img src={authProfile?.avatar} alt="Profile" className="w-full h-full object-cover" />
                        {avatarLoading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg border-2 border-slate-900 group-hover:scale-110 transition-transform bg-blue-600 hover:bg-blue-500 text-white border-slate-900"
                        onClick={() => {
                            setAvatarUrlInput(authProfile?.avatar || "");
                            setIsAvatarDialogOpen(true);
                        }}
                        disabled={avatarLoading}
                    >
                        <Camera className="w-5 h-5" />
                    </Button>
                </div>
                <div className="text-center md:text-left flex-1 space-y-2">
                    {!editing ? (
                        <>
                            <h1 className="text-3xl font-bold text-white mb-1">{authProfile?.name}</h1>
                            <p className="text-slate-400 text-lg">{authProfile?.role} at {authProfile?.school}</p>
                        </>
                    ) : (
                        <div className="space-y-3 max-w-md">
                            <div>
                                <Label htmlFor="name" className="text-xs text-slate-400">Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-slate-900 border-slate-700 text-white font-bold text-lg h-10"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor="role" className="text-xs text-slate-400">Role</Label>
                                    <Input
                                        id="role"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="bg-slate-900 border-slate-700 text-white h-9"
                                        placeholder="Student, Developer..."
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="school" className="text-xs text-slate-400">School / Org</Label>
                                    <Input
                                        id="school"
                                        value={school}
                                        onChange={(e) => setSchool(e.target.value)}
                                        className="bg-slate-900 border-slate-700 text-white h-9"
                                        placeholder="University..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-6">
                <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                    <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Change Profile Picture</DialogTitle>
                            <DialogDescription>Paste a URL to an image to update your avatar.</DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="avatar-url">Image URL</Label>
                                <Input
                                    id="avatar-url"
                                    value={avatarUrlInput}
                                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                                    placeholder="https://example.com/image.png"
                                    className="bg-slate-950 border-slate-700 text-white"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsAvatarDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAvatarSave} disabled={avatarLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {avatarLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Save Picture
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Bio Section */}
                <Card className="p-6 bg-slate-900/60 backdrop-blur-md border-slate-800 shadow-lg relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4 relative z-10">
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                            About Me
                        </h3>
                        {!editing ? (
                            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-slate-800" onClick={() => setEditing(true)}>Edit Profile</Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setEditing(false);
                                    // Reset
                                    if (authProfile) {
                                        setName(authProfile.name || "");
                                        setRole(authProfile.role || "");
                                        setSchool(authProfile.school || "");
                                        setBio(authProfile.bio || "");
                                    }
                                }}>Cancel</Button>
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSaveProfile}>
                                    {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />} Save Changes
                                </Button>
                            </div>
                        )}
                    </div>
                    {editing ? (
                        <Textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            className="bg-slate-950/50 border-slate-700 text-slate-200 focus:border-blue-500 relative z-10"
                            placeholder="Tell everyone a bit about yourself..."
                        />
                    ) : (
                        <p className="text-slate-300 text-base leading-relaxed border-l-2 border-slate-700 pl-4 py-1 relative z-10">
                            {bio || "No bio yet. Click edit to add one!"}
                        </p>
                    )}

                    {/* Decoration */}
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl z-0"></div>
                </Card>

                {/* Skills Section */}
                <Card className="p-6 bg-slate-900/60 backdrop-blur-md border-slate-800 shadow-lg relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl z-0"></div>

                    <div className="space-y-8 relative z-10">
                        {/* Offering */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">I Can Teach / Offer</Label>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {offering.map(skill => {
                                    // Lookup the original skill definition to get the Icon component
                                    // because the profile data from Supabase/JSON strips the function
                                    const originalSkill = skills.find(s => s.id === skill.id);
                                    const Icon = originalSkill?.icon;

                                    return (
                                        <Badge key={skill.id} variant="outline" className="pl-3 pr-1 py-1.5 text-sm gap-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors group">
                                            {Icon && <Icon className="w-3 h-3" />}
                                            {skill.name}
                                            <button
                                                onClick={() => handleRemoveSkill(skill.id, 'offering')}
                                                className="p-0.5 hover:bg-emerald-500/30 rounded-full transition-colors"
                                            >
                                                <X className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                                            </button>
                                        </Badge>
                                    );
                                })}

                                <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 rounded-full border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 hover:bg-transparent">
                                            <Plus className="w-3 h-3 mr-1" /> Add Skill
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Add a Skill</DialogTitle>
                                            <DialogDescription>What can you teach others?</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            {availableOffering.map(skill => (
                                                <Button
                                                    key={skill.id}
                                                    variant="outline"
                                                    className="justify-start border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white"
                                                    onClick={() => handleAddSkill(skill, 'offering')}
                                                >
                                                    <span className="mr-2">{skill.name}</span>
                                                </Button>
                                            ))}
                                            {availableOffering.length === 0 && (
                                                <p className="col-span-2 text-center text-slate-500 py-4">You've added all available skills!</p>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <div className="h-px bg-slate-800/50" />

                        {/* Seeking */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">I Want to Learn</Label>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {seeking.map(skill => {
                                    const originalSkill = skills.find(s => s.id === skill.id);
                                    const Icon = originalSkill?.icon;

                                    return (
                                        <Badge key={skill.id} variant="outline" className="pl-3 pr-1 py-1.5 text-sm gap-2 border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors group">
                                            {Icon && <Icon className="w-3 h-3" />}
                                            {skill.name}
                                            <button
                                                onClick={() => handleRemoveSkill(skill.id, 'seeking')}
                                                className="p-0.5 hover:bg-amber-500/30 rounded-full transition-colors"
                                            >
                                                <X className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                                            </button>
                                        </Badge>
                                    );
                                })}

                                <Dialog open={isSeekDialogOpen} onOpenChange={setIsSeekDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 rounded-full border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 hover:bg-transparent">
                                            <Plus className="w-3 h-3 mr-1" /> Add Interest
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Add an Interest</DialogTitle>
                                            <DialogDescription>What do you want to learn?</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            {availableSeeking.map(skill => (
                                                <Button
                                                    key={skill.id}
                                                    variant="outline"
                                                    className="justify-start border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white"
                                                    onClick={() => handleAddSkill(skill, 'seeking')}
                                                >
                                                    <span className="mr-2">{skill.name}</span>
                                                </Button>
                                            ))}
                                            {availableSeeking.length === 0 && (
                                                <p className="col-span-2 text-center text-slate-500 py-4">You've selected all available interests!</p>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
