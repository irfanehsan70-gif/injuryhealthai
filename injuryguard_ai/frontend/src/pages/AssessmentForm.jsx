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
    ShieldCheck,
    ClipboardList,
    ArrowRight,
    ArrowLeft,
    BrainCircuit,
    Crosshair
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AssessmentForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const initialPlayer = location.state?.player;
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        PlayerName: initialPlayer?.name || (user?.role === 'player' ? user.name : ''),
        PlayerEmail: initialPlayer?.email || (user?.role === 'player' ? user?.email : ''),
        League: initialPlayer?.profile?.league || 'Premier League',
        CompetitionLevel: 'Professional',
        Age: initialPlayer?.profile?.age || 25,
        Position: initialPlayer?.profile?.position || 'Forward',
        Seasons_Played: initialPlayer?.profile?.seasons_played || 5,
        Matches_Per_Season: initialPlayer?.profile?.matches_per_season || 30,
        Minutes_Per_Season: initialPlayer?.profile?.minutes_per_season || 2400,
        High_Speed_Runs: initialPlayer?.profile?.high_speed_runs || 80,
        Previous_Injuries: initialPlayer?.profile?.previous_injuries || 1,
        Recurrence_Flag: initialPlayer?.profile?.recurrence_flag || 0,
        Fatigue_Index: initialPlayer?.profile?.fatigue_index || 1.5,
        dominant_side: initialPlayer?.profile?.dominant_side || 'R'
    });

    useEffect(() => {
        if (initialPlayer) {
            if (initialPlayer.name && initialPlayer.profile?.position) {
                setStep(2);
            }
            return;
        }

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
                            Fatigue_Index: p.fatigue_index || prev.Fatigue_Index,
                            dominant_side: p.dominant_side || prev.dominant_side
                        }));

                        if (playerName && p.position) {
                            setStep(1); // Stay at step 1 but it's filled
                        }
                    }
                })
                .catch(err => console.error("Error auto-filling from profile:", err));
        }
    }, [user, initialPlayer]);

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

        // Artificial delay for premium feels
        await new Promise(r => setTimeout(r, 2500));

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
        { title: 'Identity', icon: Dna },
        { title: 'Dynamics', icon: Activity },
        { title: 'History', icon: History },
        { title: 'Fatigue', icon: Zap },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start font-['Outfit'] pb-20">
            {/* Form Side */}
            <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="glass-card p-12 lg:p-16 relative overflow-hidden shadow-4xl min-h-[750px]"
            >
                <div className="flex items-center gap-8 mb-16">
                    <div className="h-20 w-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center border border-primary/20 shadow-3xl shadow-primary/5">
                        <ClipboardList className="text-primary w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic">Vanguard <span className="text-primary italic">Intelligence</span></h2>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.6em] leading-none mt-2 opacity-60">Soma-Protocol V4.0 // PRE-MATCH SCAN</p>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-between mb-20 relative px-6">
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2 z-0" />
                    {sections.map((sec, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center gap-4 group cursor-pointer" onClick={() => setStep(i + 1)}>
                            <div className={`h-14 w-14 rounded-[1.8rem] flex items-center justify-center transition-all duration-700 border ${step >= i + 1 ? 'bg-primary border-primary text-black shadow-3xl shadow-primary/20 scale-110' : 'bg-[#0a0a0a] border-white/5 text-zinc-600 hover:border-white/20'}`}>
                                <sec.icon size={22} className={step === i + 1 ? 'animate-pulse' : ''} />
                            </div>
                            <AnimatePresence>
                                {step === i + 1 && (
                                    <motion.span
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="text-[10px] absolute -bottom-10 font-black text-primary uppercase tracking-[0.3em] whitespace-nowrap primary-glow"
                                    >
                                        {sec.title}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-10 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-5">
                                    <label className="text-xs font-black text-zinc-600 uppercase tracking-[0.4em] pl-1">Biological Identity</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="PlayerName"
                                            value={formData.PlayerName || ''}
                                            onChange={handleChange}
                                            placeholder="Enter Full Name..."
                                            readOnly={!!formData.PlayerName}
                                            className={`w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-white focus:ring-2 focus:ring-primary/30 outline-none font-bold text-xl placeholder:text-zinc-800 transition-all ${formData.PlayerName ? 'border-primary/20 text-primary/70' : 'hover:border-white/10'}`}
                                            required
                                        />
                                        {formData.PlayerName && (
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#FF5F01]" />
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Authenticated</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mt-10">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-zinc-600 uppercase tracking-widest pl-1">Tactical Position</label>
                                        <select
                                            name="Position"
                                            value={formData.Position}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-zinc-300 font-bold outline-none focus:border-primary/30 transition-all"
                                        >
                                            <option value="Forward">Forward / Multi-Intensity</option>
                                            <option value="Midfielder">Midfielder / High Latency</option>
                                            <option value="Defender">Defender / Rapid Impact</option>
                                            <option value="GK">Goal Keeper / Precision</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-zinc-600 uppercase tracking-widest pl-1">Athlete Age</label>
                                        <input
                                            type="number"
                                            name="Age"
                                            value={formData.Age}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-zinc-300 font-bold outline-none focus:border-primary/30"
                                            min="10"
                                            max="60"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-zinc-600 uppercase tracking-widest pl-1">Squad Tenure (Yrs)</label>
                                        <input type="number" name="Seasons_Played" value={formData.Seasons_Played} onChange={handleChange} className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-zinc-300 font-bold outline-none focus:border-primary/30" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-zinc-600 uppercase tracking-widest pl-1">Match Frequency</label>
                                        <input type="number" name="Matches_Per_Season" value={formData.Matches_Per_Season} onChange={handleChange} className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-zinc-300 font-bold outline-none focus:border-primary/30" />
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-xs font-black text-zinc-600 uppercase tracking-widest">Sprint Velocity Intensity</label>
                                        <span className="text-primary font-black text-xl italic">{formData.High_Speed_Runs}</span>
                                    </div>
                                    <input
                                        type="range"
                                        name="High_Speed_Runs"
                                        value={formData.High_Speed_Runs}
                                        onChange={handleChange}
                                        className="w-full accent-primary h-2 bg-zinc-900 rounded-full appearance-none cursor-pointer"
                                        min="0"
                                        max="200"
                                    />
                                    <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.4em] text-center">ANALYTICS: LOAD-BALANCING ALGORITHM ACTIVE</p>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-zinc-600 uppercase tracking-widest pl-1">Historical Trauma Count</label>
                                    <input type="number" name="Previous_Injuries" value={formData.Previous_Injuries} onChange={handleChange} className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-zinc-300 font-bold outline-none focus:border-primary/30" min="0" />
                                </div>
                                <div className="p-8 bg-black/40 rounded-3xl border border-white/5 space-y-6">
                                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Pathological Recurrence</p>
                                    <div className="flex gap-4">
                                        {[0, 1].map(v => (
                                            <button
                                                key={v}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, Recurrence_Flag: v })}
                                                className={`flex-1 py-5 rounded-2xl border font-black text-[10px] tracking-widest transition-all ${formData.Recurrence_Flag === v ? 'bg-primary border-primary text-black shadow-3xl shadow-primary/20' : 'bg-transparent border-white/5 text-zinc-600 hover:border-white/20'}`}
                                            >
                                                {v === 0 ? 'NO RECURRENCE' : 'RECURRING ANOMALY'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-12"
                            >
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end px-1">
                                        <label className="text-xs font-black text-zinc-600 uppercase tracking-widest">Metabolic Fatigue Index</label>
                                        <span className={`text-4xl font-black italic tracking-tighter ${formData.Fatigue_Index > 2 ? 'text-red-500' : 'text-primary'}`}>
                                            {formData.Fatigue_Index.toFixed(1)}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        name="Fatigue_Index"
                                        value={formData.Fatigue_Index}
                                        onChange={handleChange}
                                        className="w-full accent-primary h-2 bg-zinc-900 rounded-full appearance-none cursor-pointer"
                                        min="0"
                                        max="3"
                                        step="0.1"
                                    />
                                    <div className="grid grid-cols-3 gap-1 px-1">
                                        <span className="text-[8px] font-black text-zinc-700 uppercase tracking-tighter">Peak Restoration</span>
                                        <span className="text-[8px] font-black text-zinc-700 uppercase tracking-tighter text-center">Operational Load</span>
                                        <span className="text-[8px] font-black text-zinc-700 uppercase tracking-tighter text-right">System Overload</span>
                                    </div>
                                </div>

                                <div className="bg-primary/5 rounded-3xl border border-primary/20 border-dashed p-8 text-center flex flex-col items-center gap-4">
                                    <BrainCircuit className="text-primary/40 animate-pulse" size={40} />
                                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em]">ML Neural Core Ready for Feed</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Controls */}
                    <div className="flex gap-6 pt-12">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="btn-outline px-10 group"
                            >
                                <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                        )}

                        {step < 4 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex-1 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 py-6 rounded-[2rem] font-black text-white flex items-center justify-center gap-4 group transition-all text-xs tracking-widest uppercase italic"
                            >
                                Next Observation
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button
                                disabled={loading}
                                className="btn-premium flex-1 py-6 shadow-3xl shadow-primary/30"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Processing Intelligence...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={20} />
                                        Finalize Diagnosis
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>

                {/* Scanning Overlay */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-[#050505]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-20 text-center"
                        >
                            <div className="relative w-48 h-48 mb-12">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-[1px] border-primary/10 rounded-full border-t-primary shadow-[0_0_50px_rgba(255,95,1,0.1)]"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <BrainCircuit className="text-primary h-12 w-12 animate-pulse" />
                                </div>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-[-20px] bg-primary/20 rounded-full blur-[40px]"
                                />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">Neural Scanning Active</h3>
                            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] max-w-sm mx-auto leading-relaxed">Synthesizing random forest matrices and physiological indicators...</p>

                            <div className="mt-16 w-full max-w-xs h-1 bg-white/5 rounded-full overflow-hidden relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2.5 }}
                                    className="h-full bg-primary shadow-[0_0_20px_#FF5F01]"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Model Side */}
            <div className="hidden lg:block h-full min-h-[700px] sticky top-8">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-full h-full relative group">
                        <div className="absolute inset-0 bg-radial-glow opacity-50 pointer-events-none" />
                        <Model3D className="bg-transparent scale-110" />

                        <div className="absolute top-10 right-10 p-8 glass-card border-primary/10 text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] space-y-2 pointer-events-none">
                            <p className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> SENSOR_INPUT: ACTIVE</p>
                            <p className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-zinc-800" /> CALIBRATION: PRO_RF_4</p>
                            <p className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-zinc-800" /> ANATOMY_MAP: VERIFIED</p>
                        </div>

                        <div className="absolute bottom-10 left-10 p-8 flex items-center gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Crosshair className="text-primary animate-spin-slow" size={24} />
                            </div>
                            <div className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.5em]">
                                Tracking Kinetic Vectors
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentForm;
