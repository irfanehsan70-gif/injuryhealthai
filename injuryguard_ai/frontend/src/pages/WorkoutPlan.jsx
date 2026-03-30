import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { Dumbbell, Target, ArrowLeft, Clock, ChevronRight, AlertTriangle, Activity, Zap, PlayCircle, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

// Color and label per injury type
const INJURY_META = {
    hamstring: { label: 'Hamstring Protocol', color: 'text-red-500', border: 'border-red-500/20', bg: 'bg-red-500/5' },
    knee: { label: 'Knee Architecture', color: 'text-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
    ankle: { label: 'Ankle Stabilization', color: 'text-blue-500', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
    groin: { label: 'Groin / Adductor', color: 'text-purple-500', border: 'border-purple-500/20', bg: 'bg-purple-500/5' },
    back: { label: 'Lumbar / Spine', color: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
    muscle: { label: 'Kinetic Repair', color: 'text-primary', border: 'border-primary/20', bg: 'bg-primary/5' },
    general: { label: 'Global Resilience', color: 'text-primary', border: 'border-primary/20', bg: 'bg-primary/5' },
};

/* ─── Exercise library ─── */
const EXERCISES_DATA = {
    // ── Hamstring exercises ──
    'Nordic Hamstring Curls': {
        frames: [
            { url: '/assets/instructional/nordic_curl_phase_1.png', label: 'PHASE 1: SECURED ANCHOR' },
            { url: '/assets/instructional/nordic_curl_gold.png', label: 'PHASE 2: ECCENTRIC RECRUITMENT' },
        ],
        steps: ['Anchor feet firmly.', 'Descend under control.', 'Resist using hamstrings.', 'Push off floor to return.'],
        muscles: 'HAMSTRINGS • GLUTES',
    },
    'Romanian Deadlift': {
        frames: [
            { url: '/assets/instructional/rdl_phase_1.png', label: 'PHASE 1: NEUTRAL ALIGNMENT' },
            { url: '/assets/instructional/rdl_gold.png', label: 'PHASE 2: HINGE BIOMECHANICS' },
        ],
        steps: ['Hinge at hips.', 'Lower to mid-shin.', 'Drive hips forward.', 'Squeeze glutes.'],
        muscles: 'HAMSTRINGS • ERECTORS',
    },
    'Nordic Leg Curl Isometric': {
        frames: [
            { url: '/assets/instructional/nordic_curl_phase_1.png', label: 'PHASE 1: KINETIC ANCHOR' },
            { url: '/assets/instructional/nordic_curl_gold.png', label: 'PHASE 2: ISO-HAMSTRING TENSION' },
        ],
        steps: ['Maintain fixed lean.', 'Hold contraction 30s.', 'Breathe through load.', 'Rest 60s.'],
        muscles: 'HAMSTRINGS',
    },
    'Single-Leg Glute Bridge': {
        frames: [
            { url: '/assets/instructional/glute_bridge_instructional_blueprints_1773151750864.png', label: 'PHASE 1: NEUTRAL LOAD' },
            { url: '/assets/instructional/glute_bridge_instructional_blueprints_1773151750864.png', label: 'PHASE 2: PEAK KINETIC REACH' },
        ],
        steps: ['Unilateral load.', 'Ascend to linear.', 'Pause at peak.', 'Lower slowly.'],
        muscles: 'GLUTES • HAMSTRINGS',
    },
    // ── Knee exercises ──
    'Spanish Squat (Isometric)': {
        frames: [
            { url: '/assets/instructional/spanish_squat_phase_1.png', label: 'PHASE 1: TENSION LOAD' },
            { url: '/assets/instructional/spanish_squat_gold.png', label: 'PHASE 2: ISO-PATELLAR STABILITY' },
        ],
        steps: ['Resist band tension.', '90 degree flexion.', 'VMO activation.', 'Hold duration.'],
        muscles: 'VMO • QUADS',
    },
    'Step-Down Exercise': {
        frames: [
            { url: '/assets/instructional/step_down_phase_1.png', label: 'PHASE 1: UNILATERAL BALANCE' },
            { url: '/assets/instructional/step_down_instructional_blueprints_1773151815391.png', label: 'PHASE 2: CONTROLLED DESCENT' },
        ],
        steps: ['Slow descent.', 'Touch heel lightly.', 'Pelvic stability.', 'Squeeze quad.'],
        muscles: 'QUADS • GLUTEMED',
    },
    'Terminal Knee Extension': {
        frames: [
            { url: '/assets/instructional/tke_phase_1.png', label: 'PHASE 1: ELASTIC FLEXION' },
            { url: '/assets/instructional/tke_instructional_blueprints_1773151713337.png', label: 'PHASE 2: VMO LOCKOUT' },
        ],
        steps: ['Loop band behind.', 'Drive to extension.', 'Full quad squeeze.', 'Slow release.'],
        muscles: 'VMO • KNEE',
    },
    // ── Ankle exercises ──
    'Proprioception Drills': {
        frames: [
            { url: '/assets/instructional/proprioception_phase_1.png', label: 'PHASE 1: NEURAL ANCHOR' },
            { url: '/assets/instructional/proprioception_drill_instructional_blueprints_1773151513393.png', label: 'PHASE 2: DYNAMIC STABILIZATION' },
        ],
        steps: ['Unstable balance.', 'Neutral center.', 'Soft knee flexion.', 'Hold duration.'],
        muscles: 'PERONEALS • ANKLE',
    },
    'Single-Leg Calf Raise': {
        frames: [
            { url: '/assets/instructional/calf_raise_phase_1.png', label: 'PHASE 1: ECCENTRIC STRETCH' },
            { url: '/assets/instructional/calf_raise_phase_2.png', label: 'PHASE 2: TRICEPS SURAE PEAK' },
        ],
        steps: ['Full ROM.', 'Explosive ascent.', '3s negative.', 'No assistance.'],
        muscles: 'CALVES • ACHILLES',
    },
    'Resistance Band Dorsiflexion': {
        frames: [
            { url: '/assets/instructional/dorsiflexion_phase_1.png', label: 'PHASE 1: PLANTAR NEUTRAL' },
            { url: '/assets/instructional/dorsiflexion_phase_2.png', label: 'PHASE 2: ANTERIOR TIBIALIS LOAD' },
        ],
        steps: ['Pull toes to shin.', 'Maximize dorsal.', 'Slow return.', 'Anterior tib strength.'],
        muscles: 'ANTERIOR TIBIALIS',
    },
    'Lateral Hop & Stick': {
        frames: [
            { url: '/assets/instructional/lateral_hop_phase_1.png', label: 'PHASE 1: EXPLOSIVE THRUST' },
            { url: '/assets/instructional/lateral_hop_instructional_blueprints_1773151837679.png', label: 'PHASE 2: KINETIC ABSORPTION' },
        ],
        steps: ['Lateral thrust.', 'Silent landing.', 'Hold stick 3s.', 'Neutral tracking.'],
        muscles: 'GLUTES • ANKLE',
    },
    // ── Groin/Adductor exercises ──
    'Copenhagen Plank': {
        frames: [
            { url: '/assets/instructional/copenhagen_plank_phase_1.png', label: 'PHASE 1: LATERAL ALIGNMENT' },
            { url: '/assets/instructional/copenhagen_plank_high_fidelity_1773150301365.png', label: 'PHASE 2: ADDUCTOR RECRUITMENT' },
        ],
        steps: ['Anchor top foot.', 'Lift hips neutral.', 'Adduct bottom leg.', 'Hold recruitment.'],
        muscles: 'ADDUCTORS • CORE',
    },
    'Adductor Squeeze Ball': {
        frames: [
            { url: '/assets/instructional/adductor_squeeze_phase_1.png', label: 'PHASE 1: NEUTRAL SQUEEZE' },
            { url: '/assets/instructional/copenhagen_plank_high_fidelity_1773150301365.png', label: 'PHASE 2: ISOMETRIC ADDUCTION' },
        ],
        steps: ['Maximal squeeze.', '5s iso hold.', 'Controlled release.', 'Core engagement.'],
        muscles: 'ADDUCTORS',
    },
    'Side-Lying Hip Adduction': {
        frames: [
            { url: '/assets/instructional/copenhagen_plank_phase_1.png', label: 'PHASE 1: LATERAL GROUNDING' },
            { url: '/assets/instructional/copenhagen_plank_high_fidelity_1773150301365.png', label: 'PHASE 2: UNILATERAL ADDUCTION' },
        ],
        steps: ['Internal rotate.', 'Lift to ceiling.', 'Hold peak.', 'No pelvic rotation.'],
        muscles: 'ADDUCTORS',
    },
    'Lateral Band Walk': {
        frames: [
            { url: '/assets/instructional/lateral_band_walk_phase_1.png', label: 'PHASE 1: PILLAR SETUP' },
            { url: '/assets/instructional/lateral_band_walk_instructional_blueprints_1773151497016.png', label: 'PHASE 2: GLUTE MEDIAL AURAL' },
        ],
        steps: ['Constant tension.', 'Lateral stepping.', 'Neutral patella.', 'Athletic depth.'],
        muscles: 'GLUTEMED • HIP',
    },
    // ── Back/Core exercises ──
    'Dead Bug': {
        frames: [
            { url: '/assets/instructional/dead_bug_phase_1.png', label: 'PHASE 1: CORE NEUTRAL' },
            { url: '/assets/instructional/dead_bug_gold.png', label: 'PHASE 2: CONTRALATERAL REACH' },
        ],
        steps: ['Neutral lumbar.', 'Opposite limbs.', 'Exhale on extend.', 'Controlled pace.'],
        muscles: 'CORE • LUMBAR',
    },
    'McGill Bird-Dog': {
        frames: [
            { url: '/assets/instructional/bird_dog_phase_1.png', label: 'PHASE 1: QUADRUPED ANCHOR' },
            { url: '/assets/instructional/bird_dog_instructional_blueprints_1773151856178.png', label: 'PHASE 2: LINEAR INTEGRATION' },
        ],
        steps: ['Quadruped position.', 'Limb extension.', 'Hold 10s peak.', 'Zero pelvic tilt.'],
        muscles: 'ERECTORS • CORE',
    },
    'Pallof Press': {
        frames: [
            { url: '/assets/instructional/pallof_press_phase_1.png', label: 'PHASE 1: ISO-CHEST HOLD' },
            { url: '/assets/instructional/pallof_press_instructional_blueprints_1773151880524.png', label: 'PHASE 2: ANTI-ROTATION REACH' },
        ],
        steps: ['Resist tension.', 'Press forward.', 'No rotation.', 'Hold peak 3s.'],
        muscles: 'OBLIQUES • CORE',
    },
    'Glute Bridge March': {
        frames: [
            { url: '/assets/instructional/glute_bridge_instructional_blueprints_1773151750864.png', label: 'PHASE 1: STATIC BRIDGE' },
            { url: '/assets/instructional/glute_bridge_instructional_blueprints_1773151750864.png', label: 'PHASE 2: DYNAMIC CHASSIS STABILITY' },
        ],
        steps: ['Hold static bridge.', 'Alternate feet.', 'Hips remain level.', 'Glute focus.'],
        muscles: 'GLUTES • CORE',
    },
    // ── Muscle strain exercises ──
    'Isometric Hold (Affected)': {
        frames: [
            { url: '/assets/instructional/nordic_curl_phase_1.png', label: 'PHASE 1: NEURAL SETUP' },
            { url: '/assets/instructional/nordic_curl_gold.png', label: 'PHASE 2: CONTROLLED ISO-LOAD' },
        ],
        steps: ['30% MVC only.', 'Pain-free range.', 'Hold 30s.', 'Neural drive.'],
        muscles: 'AFFECTED GROUP',
    },
    'Eccentric Contraction Drill': {
        frames: [
            { url: '/assets/instructional/nordic_curl_phase_1.png', label: 'PHASE 1: PROXIMAL LOAD' },
            { url: '/assets/instructional/nordic_curl_gold.png', label: 'PHASE 2: DISTAL LENGTHENING' },
        ],
        steps: ['Slow descent (5s).', 'Controlled reset.', 'Threshold focus.', 'Fiber repair.'],
        muscles: 'TENDONS • FIBERS',
    },
    'Biomechanical Plyos': {
        frames: [
            { url: '/assets/instructional/lateral_hop_phase_1.png', label: 'PHASE 1: RE-LOADING ENERGY' },
            { url: '/assets/instructional/plyometric_landing_instructional_blueprints_1773151532379.png', label: 'PHASE 2: PRECISION LANDING' },
        ],
        steps: ['Vertical jump.', 'Silent landing.', 'Kinetic stability.', 'Step down.'],
        muscles: 'QUADS • EXPLOSIVE',
    },
    'Progressive Loading Squat': {
        frames: [
            { url: '/assets/instructional/squat_instructional_blueprints_1773151478991.png', label: 'PHASE 1: STACKED SETUP' },
            { url: '/assets/instructional/squat_gold.png', label: 'PHASE 2: BIOMECHANICAL DESCENT' },
        ],
        steps: ['Neutral spine control.', 'Drive through mid-foot.', 'Parallel depth threshold.', 'Full hip extension.'],
        muscles: 'QUADS • GLUTES • CORE',
    },
    'Foam Roll & Mobility': {
        frames: [
            { url: '/assets/instructional/nordic_curl_phase_1.png', label: 'PHASE 1: TISSUE COMPRESSION' },
            { url: '/assets/instructional/nordic_curl_gold.png', label: 'PHASE 2: FASCIAL RELEASE' },
        ],
        steps: ['Identify trigger points.', 'Apply slow pressure.', '30s per group.', 'Maintain neutral posture.'],
        muscles: 'FASCIA • MULTIPLE',
    },
};

const ExerciseCard = ({ ex, delay }) => {
    const data = EXERCISES_DATA[ex.name];
    const [activeFrame, setActiveFrame] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        if (!isPlaying || !data || data.frames.length < 2) return;
        const interval = setInterval(() => {
            setActiveFrame(prev => (prev + 1) % data.frames.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [isPlaying, data]);

    if (!data) return (
        <div className="glass-card p-10 border border-white/5 opacity-50 italic text-zinc-600 uppercase text-xs tracking-widest">
            Protocol identification failed for {ex.name}. Awaiting neural update.
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="flex flex-col glass-card overflow-hidden shadow-4xl group hover:border-primary/30 transition-all duration-700 relative"
        >
             {/* Dynamic Scan Line */}
             {isPlaying && (
                <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-x-0 h-[1px] bg-primary/20 z-50 pointer-events-none"
                />
            )}

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-10 border-b border-white/5 relative bg-white/[0.01]">
                <div className="absolute top-0 right-0 p-6 opacity-[0.02] text-primary">
                    <Activity size={80} />
                </div>

                <div className="flex items-center gap-8 relative z-10">
                    <div className="h-24 w-24 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center border border-white/5 shrink-0 shadow-2xl group-hover:border-primary/20 transition-all">
                        <Dumbbell className="text-primary group-hover:scale-110 transition-transform" size={40} />
                    </div>
                    <div>
                        <h3 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">{ex.name}</h3>
                        <div className="flex items-center gap-6 mt-4">
                            <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                                <Target size={14} className="text-primary" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">{ex.focus}</span>
                            </div>
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest opacity-60 italic">
                                // {data.muscles}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 relative z-10">
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`h-14 w-14 rounded-2xl flex items-center justify-center border transition-all ${isPlaying ? 'bg-primary border-primary text-black' : 'bg-transparent border-white/10 text-zinc-600 hover:text-white'}`}
                    >
                        {isPlaying ? <Activity size={24} className="animate-pulse" /> : <PlayCircle size={24} />}
                    </button>
                    <div className="flex flex-col items-end shrink-0">
                        <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-1">Session Target</p>
                        <div className="px-8 py-3 bg-zinc-900 rounded-2xl border border-white/5 shadow-inner">
                            <span className="text-primary font-black text-2xl italic tracking-tighter">{ex.sets}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-white/5 bg-[#080808] relative">
                {data.frames.map((frame, fi) => (
                    <div 
                        key={fi} 
                        className={`relative overflow-hidden group/frame transition-all duration-700 ${fi === 0 ? 'border-r border-white/5' : ''} ${activeFrame === fi ? 'opacity-100 flex-1' : isPlaying ? 'opacity-30' : 'opacity-100'}`} 
                        style={{ height: '400px' }}
                    >
                        <img
                            src={frame.url}
                            alt={frame.label}
                            className={`w-full h-full object-cover transition-all duration-[2000ms] ${activeFrame === fi ? 'scale-110 opacity-100' : 'scale-100 opacity-60'}`}
                            onError={(e) => {
                                e.target.src = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/0.jpg'; // Better fallback
                                e.target.className = 'w-full h-full object-cover opacity-30';
                            }}
                        />
                        <div className={`absolute top-8 left-8 px-6 py-3 transition-all duration-500 rounded-2xl border shadow-2xl z-20 ${activeFrame === fi ? 'bg-primary/90 border-primary shadow-primary/20 translate-y-0 opacity-100' : 'bg-black/60 border-white/5 translate-y-2 opacity-0'}`}>
                            <span className="text-[10px] font-black text-black uppercase tracking-[0.2em] italic">{frame.label}</span>
                        </div>
                        
                        {fi === 0 && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-30 h-16 w-16 rounded-full bg-[#080808] border border-white/5 flex items-center justify-center">
                                <ChevronRight className={activeFrame === 0 ? 'text-primary' : 'text-zinc-800'} size={24} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-2 gap-16 relative overflow-hidden bg-white/[0.01]">
                <div className="absolute top-0 right-0 p-16 opacity-[0.01] text-primary pointer-events-none">
                    <Activity size={200} />
                </div>
                
                <div className="space-y-8">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] flex items-center gap-4 italic mb-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        Kinetic Execution Matrix
                    </h4>
                    <div className="grid grid-cols-1 gap-6">
                        {data.steps.map((step, si) => (
                            <div key={si} className={`flex items-start gap-8 p-6 rounded-[2rem] border transition-all duration-500 ${activeFrame === (si % 2) ? 'bg-primary/5 border-primary/20' : 'bg-transparent border-white/5'}`}>
                                <div className={`shrink-0 h-12 w-12 rounded-[1rem] flex items-center justify-center text-sm font-black transition-all ${activeFrame === (si % 2) ? 'bg-primary text-black' : 'bg-zinc-900 text-zinc-600'} shadow-xl italic`}>
                                    {String(si + 1).padStart(2, '0')}
                                </div>
                                <p className={`text-lg font-bold leading-tight uppercase tracking-tight italic transition-colors ${activeFrame === (si % 2) ? 'text-white' : 'text-zinc-600'}`}>{step}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-12">
                     <div className="glass-card p-10 bg-emerald-500/5 border-emerald-500/10 flex items-center gap-8 shadow-3xl">
                        <div className="h-20 w-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 shrink-0 shadow-emerald-500/5">
                            <ShieldCheck className="text-emerald-500" size={36} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-white font-black uppercase text-xs tracking-widest italic">Verification Protocol</h4>
                            <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em] leading-relaxed opacity-80 italic">Neural model confirms 100% biomechanical alignment for specific injury vector.</p>
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};

const WorkoutPlan = () => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const injuryType = location.state?.injury_type || 'general';
    const injuryKey = Object.keys(INJURY_META).find(k => injuryType.toLowerCase().includes(k)) || 'general';
    const injuryMeta = INJURY_META[injuryKey];

    useEffect(() => {
        api.get(`/workout_plan?injury_type=${encodeURIComponent(injuryType)}`)
            .then(res => setPlan(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [injuryType]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] font-['Outfit'] gap-6">
            <div className="relative w-16 h-16">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-4 border-primary/10 border-t-primary rounded-full shadow-[0_0_20px_#FF5F0122]" />
                <Dumbbell className="absolute inset-0 m-auto text-primary h-6 w-6 animate-pulse" />
            </div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] italic">Initializing Kinetic Simulator...</p>
        </div>
    );

    if (!plan) return <div className="min-h-screen flex items-center justify-center text-white">Error loading athletic protocol.</div>;

    return (
        <div className="min-h-screen p-8 lg:p-16 font-['Outfit'] bg-[#050505] space-y-16 pb-24">
            {/* Header / Nav */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="h-16 w-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 text-zinc-600 hover:text-primary hover:border-primary/20 transition-all shadow-xl group"
                    >
                        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">Kinetic <span className="text-primary italic">Resilience</span></h1>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] leading-none mt-2 opacity-60">Fleet Performance Conditioning // Bio-Mechanical Shield</p>
                    </div>
                </div>

                <div className={`inline-flex items-center gap-4 px-6 py-3 rounded-[1.5rem] border ${injuryMeta.border} ${injuryMeta.bg} shadow-2xl`}>
                    <div className={`h-2 w-2 rounded-full ${injuryMeta.color.replace('text', 'bg')} shadow-[0_0_10px_currentColor]`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${injuryMeta.color} italic`}>
                        {plan.injury_type?.toUpperCase() === 'GENERAL' ? 'Conditioning Matrix' : `${plan.injury_type?.toUpperCase()} ALGORITHM`}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Protocol Deck */}
                <div className="lg:col-span-8 space-y-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
                        <div className="space-y-4">
                            <h2 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">{plan.title}</h2>
                            <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em] italic opacity-80 border-l-2 border-primary pl-4">{plan.subtitle}</p>
                        </div>
                        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 text-right shadow-inner min-w-[150px]">
                            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1">Total Modules</p>
                            <p className="text-4xl font-black text-white italic tracking-tighter">{plan.exercises.length}</p>
                        </div>
                    </div>

                    <div className="space-y-12">
                        {plan.exercises.map((ex, idx) => (
                            <ExerciseCard key={idx} ex={ex} idx={idx} />
                        ))}
                    </div>
                </div>

                {/* Tactical Sidebar */}
                <div className="lg:col-span-4 space-y-12">
                    <div className="glass-card overflow-hidden shadow-4xl group">
                        <div className="relative h-96 overflow-hidden">
                            <img src={plan.image} alt="Ref" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 opacity-80 group-hover:opacity-100" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-8 left-8 flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest italic group-hover:text-primary transition-colors">Tactical Bio-Ref_84</span>
                            </div>
                        </div>
                        <div className="p-10 space-y-6">
                            <h4 className="text-white font-black uppercase text-xs tracking-widest italic">Clinical Directive</h4>
                            <p className="text-zinc-700 text-xs font-bold leading-relaxed uppercase tracking-widest">Execute movements with high-fidelity control. Bio-mechanical efficiency takes precedence over absolute load. Zero compromise on form.</p>
                        </div>
                    </div>

                    <div className="glass-card p-10 space-y-10 shadow-3xl bg-primary/[0.02] border-primary/5">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-glow">
                                <Clock size={20} />
                            </div>
                            <h4 className="text-white font-black uppercase text-xs tracking-widest italic">Simulation Timing</h4>
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-zinc-600 text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-4">
                                <span>Session Duration</span>
                                <span className="text-white">60 MINS</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-600 text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-4">
                                <span>High Intensity Phase</span>
                                <span className="text-primary italic">FIRST 20M</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                                <span>Rest Threshold</span>
                                <span className="text-white">60S / SET</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-10 bg-amber-500/5 border-amber-500/10 space-y-6 shadow-3xl">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                <ShieldCheck size={20} />
                            </div>
                            <h4 className="text-amber-500 font-black uppercase text-xs tracking-widest italic">System Guard</h4>
                        </div>
                        <p className="text-zinc-700 text-[10px] font-black leading-relaxed uppercase tracking-widest italic opacity-80">Stop simulation immediately if neural pain signals exceed threshold 4/10. Re-calibrate with medical staff.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkoutPlan;
