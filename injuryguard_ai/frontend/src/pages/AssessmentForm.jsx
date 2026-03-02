import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Model3D from '../components/Model3D';
import api from '../utils/api';
import {
    ChevronRight,
    Dna,
    Activity,
    History,
    Zap,
    Loader2,
    CheckCircle2,
    ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AssessmentForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Initial state check for incoming player context from location.state
    const initialPlayer = location.state?.player;

    const { user } = useAuth();

    const [formData, setFormData] = useState({
        PlayerName: initialPlayer?.name || '',
        PlayerEmail: initialPlayer?.email || (user?.role === 'player' ? user?.email : ''),
        League: initialPlayer?.profile?.league || 'Premier League',
        CompetitionLevel: 'Professional', // This will be mapped to League
        Age: initialPlayer?.profile?.age || 25,
        Position: initialPlayer?.profile?.position || 'Forward',
        Seasons_Played: initialPlayer?.profile?.seasons_played || 5,
        Matches_Per_Season: initialPlayer?.profile?.matches_per_season || 30,
        Minutes_Per_Season: initialPlayer?.profile?.minutes_per_season || 2400,
        High_Speed_Runs: initialPlayer?.profile?.high_speed_runs || 80,
        Previous_Injuries: initialPlayer?.profile?.previous_injuries || 1,
        Recurrence_Flag: initialPlayer?.profile?.recurrence_flag || 0,
        Fatigue_Index: initialPlayer?.profile?.fatigue_index || 1.5
    });

    // Auto-fill from player profile if logged in as player
    useEffect(() => {
        // If initialPlayer context was provided, we don't need to fetch from profile
        if (initialPlayer) {
            // If we have at least name and position from initialPlayer, skip to dynamics
            if (initialPlayer.name && initialPlayer.profile?.position) {
                setStep(2);
            }
            return;
        }

        // Otherwise, if a player is logged in, try to auto-fill from their profile
        if (user?.role === 'player') {
            api.get('/player_profile')
                .then(res => {
                    const userData = res.data?.user;
                    if (userData) {
                        const p = userData.profile || {};
                        const playerName = userData.name || '';

                        setFormData(prev => ({
                            ...prev,
                            PlayerName: playerName,
                            League: p.league || prev.League,
                            Age: p.age || prev.Age,
                            Position: p.position || prev.Position,
                            Seasons_Played: p.seasons_played || prev.Seasons_Played,
                            Matches_Per_Season: p.matches_per_season || prev.Matches_Per_Season,
                            Minutes_Per_Season: p.minutes_per_season || prev.Minutes_Per_Season,
                            High_Speed_Runs: p.high_speed_runs || prev.High_Speed_Runs,
                            Previous_Injuries: p.previous_injuries || prev.Previous_Injuries,
                            Recurrence_Flag: p.recurrence_flag || prev.Recurrence_Flag,
                            Fatigue_Index: p.fatigue_index || prev.Fatigue_Index
                        }));

                        // If we have at least name and position, skip to dynamics
                        if (playerName && p.position) {
                            setStep(2);
                        }
                    }
                })
                .catch(err => console.error("Error auto-filling from profile:", err));
        }
    }, [user, initialPlayer]); // Depend on user and initialPlayer to re-evaluate

    // Map friendly competition levels to internal League names the ML model expects
    const COMPETITION_MAP = {
        'Recreational': 'Ligue 1',
        'Amateur': 'Serie A',
        'Semi-Pro': 'La Liga',
        'Professional': 'Premier League',
        'Elite / Academy': 'Premier League',
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'CompetitionLevel') {
            setFormData({ ...formData, League: COMPETITION_MAP[value] || 'Premier League', CompetitionLevel: value });
        } else {
            setFormData({ ...formData, [name]: isNaN(value) ? value : Number(value) });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate AI "Scanning" time
        await new Promise(r => setTimeout(r, 2000));

        try {
            const response = await api.post('/predict', formData);
            navigate('/dashboard', { state: { prediction: response.data, input: formData } });
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const sections = [
        { title: 'Player Profile', icon: Dna },
        { title: 'Match Dynamics', icon: Activity },
        { title: 'Injury Log', icon: History },
        { title: 'Bio-Metrics', icon: Zap },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start font-['Outfit']">
            {/* Form Side */}
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="glass-card p-10 lg:p-12 relative overflow-hidden shadow-2xl min-h-[700px]"
            >
                <div className="flex items-center gap-6 mb-12">
                    <div className="h-16 w-16 bg-electric-cyan/20 rounded-2xl flex items-center justify-center border border-electric-cyan/30 shadow-[0_0_15px_rgba(0,242,255,0.1)]">
                        <ClipboardList className="text-electric-cyan w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Vanguard <span className="text-electric-cyan">Diagnostic</span></h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] leading-none mt-1">Player Physiological Stress Audit</p>
                    </div>
                </div>

                <div className="flex justify-between mb-16 relative px-4">
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2 z-0" />
                    {sections.map((sec, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center gap-3 group cursor-pointer" onClick={() => setStep(i + 1)}>
                            <div className={`h - 12 w - 12 rounded - 2xl flex items - center justify - center transition - all duration - 500 border - 2 ${step >= i + 1 ? 'bg-electric-cyan border-electric-cyan text-deep-black shadow-[0_0_20px_rgba(0,242,255,0.3)] scale-110' : 'bg-slate-900 border-white/10 text-slate-500 group-hover:border-white/20'} `}>
                                <sec.icon size={22} className={step === i + 1 ? 'animate-pulse' : ''} />
                            </div>
                            {step === i + 1 && (
                                <motion.span layoutId="stepTitle" className="text-[10px] absolute -bottom-8 font-black text-electric-cyan uppercase tracking-[0.2em] whitespace-nowrap cyan-glow">
                                    {sec.title}
                                </motion.span>
                            )}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 min-h-[350px]">
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Player Identity</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="PlayerName"
                                            value={formData.PlayerName || ''}
                                            onChange={handleChange}
                                            placeholder="Enter Player Name..."
                                            readOnly={!!formData.PlayerName}
                                            className={`w - full bg - white / 5 border border - white / 10 rounded - xl p - 4 text - white focus: ring - 2 focus: ring - electric - cyan / 50 outline - none font - bold text - lg placeholder: text - slate - 700 ${formData.PlayerName ? 'border-electric-cyan/30 text-electric-cyan/70' : ''} `}
                                            required
                                        />
                                        {formData.PlayerName && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-electric-cyan animate-pulse" />
                                                <span className="text-[10px] font-black text-electric-cyan uppercase tracking-widest">Verified</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-[0.3em]">Signature: SECURE BIOMETRIC SOURCE</p>
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Tactical Position</label>
                                    <div className="relative">
                                        <select
                                            name="Position"
                                            value={formData.Position}
                                            onChange={handleChange}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none appearance-none font-bold text-sm"
                                        >
                                            <option className="bg-slate-950 text-white">Forward</option>
                                            <option className="bg-slate-950 text-white">Midfielder</option>
                                            <option className="bg-slate-950 text-white">Defender</option>
                                            <option className="bg-slate-950 text-white">GK</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <ChevronRight className="rotate-90 w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Dominant Side</label>
                                        <div className="flex gap-2">
                                            {['L', 'R'].map(side => (
                                                <button
                                                    key={side}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, dominant_side: side })}
                                                    className={`h - 6 w - 8 rounded - md text - [10px] font - black border transition - all ${formData.dominant_side === side ? 'bg-electric-cyan border-electric-cyan text-deep-black' : 'border-white/10 text-slate-600'} `}
                                                >
                                                    {side}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Age (Years)</label>
                                        <input type="number" name="Age" value={formData.Age} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none mt-1 font-bold" min="10" max="60" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Experience (Years)</label>
                                    <input type="number" name="Seasons_Played" value={formData.Seasons_Played} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none font-bold" min="0" max="40" />
                                    <p className="text-[10px] text-slate-600 pl-1">Professional tenure</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Games / Season or Year</label>
                                    <input type="number" name="Matches_Per_Season" value={formData.Matches_Per_Season} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Total Playing Time (mins)</label>
                                    <input type="number" name="Minutes_Per_Season" value={formData.Minutes_Per_Season} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Sprint Intensity (High-Speed Runs)</label>
                                <div className="flex items-center gap-4">
                                    <input type="range" name="High_Speed_Runs" value={formData.High_Speed_Runs} onChange={handleChange} className="flex-1 accent-cyan-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer" min="0" max="200" />
                                    <span className="text-cyan-400 font-bold w-12 text-center">{formData.High_Speed_Runs}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 uppercase font-black">How often do you sprint at full speed during a game?</p>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Total Past Injuries (estimate)</label>
                                <input type="number" name="Previous_Injuries" value={formData.Previous_Injuries} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none" min="0" max="10" />
                            </div>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                                <p className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Are any conditions recurring?</p>
                                <div className="flex gap-4">
                                    {[0, 1].map(v => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, Recurrence_Flag: v })}
                                            className={`flex - 1 py - 3 rounded - xl border font - black text - xs transition - all ${formData.Recurrence_Flag === v ? 'bg-cyan-500 border-cyan-400 text-slate-900 shadow-md' : 'bg-transparent border-white/10 text-slate-500 hover:border-white/20'} `}
                                        >
                                            {v === 0 ? 'NEVER' : 'IDENTIFIED'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="space-y-4 pt-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Fatigue Accumulation Index</label>
                                    <span className={`text - 2xl font - black ${formData.Fatigue_Index > 2 ? 'text-red-500' : 'text-cyan-400'} `}>
                                        {formData.Fatigue_Index.toFixed(1)}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    name="Fatigue_Index"
                                    value={formData.Fatigue_Index}
                                    onChange={handleChange}
                                    className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                    min="0"
                                    max="3"
                                    step="0.1"
                                />
                                <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                                    <span>Peak Recovery</span>
                                    <span>Moderate Fatigue</span>
                                    <span>System Overload</span>
                                </div>
                            </div>

                            <div className="mt-10 p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/10 border-dashed">
                                <p className="text-[10px] text-cyan-400/70 text-center font-bold">READY FOR AI SIGNAL PROCESSING</p>
                            </div>
                        </motion.div>
                    )}

                    <div className="flex gap-4 pt-10">
                        {step > 1 && (
                            <button type="button" onClick={prevStep} className="px-6 py-4 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 font-bold transition-all">
                                BACK
                            </button>
                        )}

                        {step < 4 ? (
                            <button type="button" onClick={nextStep} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 group transition-all">
                                NEXT STAGE
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button
                                disabled={loading}
                                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 py-4 rounded-xl font-black flex items-center justify-center gap-3 transition-all relative overflow-hidden group shadow-lg shadow-cyan-500/20"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        ANALYZING BIOMETRICS...
                                    </>
                                ) : (
                                    <>
                                        FINALIZE ASSESSMENT
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>

                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center"
                        >
                            <div className="relative w-32 h-32 mb-8">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-4 border-cyan-500/20 rounded-full border-t-cyan-500"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Activity className="text-cyan-400 h-10 w-10 animate-pulse" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">AI Diagnostic Active</h3>
                            <p className="text-slate-400 text-sm max-w-xs font-medium uppercase tracking-widest leading-tight">Processing your activity profile and injury history to generate your risk report...</p>

                            <div className="mt-10 w-full max-w-xs h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2 }}
                                    className="h-full bg-cyan-400 shadow-[0_0_10px_#00ffff]"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <div className="hidden lg:block h-full min-h-[600px] sticky top-8">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-full h-full relative">
                        <Model3D className="bg-transparent" />
                        <div className="absolute top-0 right-0 p-6 glass-card border-cyan-500/20 text-xs font-mono text-cyan-400/80">
                            <p>SYSTEM.CALIBRATION: ACTIVE</p>
                            <p>ROTATION: AUTO_ORBIT</p>
                            <p>ANATOMY_MAPPING: LOADED</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentForm;
