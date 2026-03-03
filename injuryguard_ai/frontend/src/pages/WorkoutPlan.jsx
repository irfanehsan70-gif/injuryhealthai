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
            { url: `${BASE}/Seated_Hamstring/0.jpg`, label: 'START' },
            { url: `${BASE}/Seated_Hamstring/1.jpg`, label: 'EXTEND' },
        ],
        steps: [
            'Anchor feet firmly, maintain linear trunk alignment.',
            'Descend under maximal eccentric control.',
            'Resist using hamstring tension throughout.',
            'Push off floor to return to vertical position.',
        ],
        muscles: 'HAMSTRINGS • GLUTES • CORE',
    },
    'Romanian Deadlift': {
        frames: [
            { url: `${BASE}/Barbell_Deadlift/0.jpg`, label: 'HINGE' },
            { url: `${BASE}/Barbell_Deadlift/1.jpg`, label: 'DRIVE' },
        ],
        steps: [
            'Hinge at hips, maintain neutral spinal curvature.',
            'Lower load to mid-shin level, feel hamstring stretch.',
            'Drive hips forward, squeezing glutes at terminal point.',
            'Control rate of descent strictly.',
        ],
        muscles: 'HAMSTRINGS • ERECTORS • GLUTES',
    },
    'Nordic Leg Curl Isometric': {
        frames: [
            { url: `${BASE}/Lying_Hamstring/0.jpg`, label: 'TENSION' },
            { url: `${BASE}/Lying_Hamstring/1.jpg`, label: 'HOLD' },
        ],
        steps: [
            'Maintain fixed lean at a pain-free threshold.',
            'Hold isometric contraction for 30s.',
            'Breathe through the load, maintain trunk rigidity.',
            'Rest 60s between sets.',
        ],
        muscles: 'HAMSTRINGS • LUMBAR',
    },
    'Single-Leg Glute Bridge': {
        frames: [
            { url: `${BASE}/Single_Leg_Glute_Bridge/0.jpg`, label: 'GROUND' },
            { url: `${BASE}/Single_Leg_Glute_Bridge/1.jpg`, label: 'PEAK' },
        ],
        steps: [
            'Unilateral load, drive through the heel.',
            'Ascend until pelvis is linear with torso.',
            'Pause at peak contraction.',
            'Lower slowly, do not rest on floor.',
        ],
        muscles: 'GLUTES • HAMSTRINGS • CORE',
    },
    // ── Knee exercises ──
    'Spanish Squat (Isometric)': {
        frames: [
            { url: `${BASE}/Barbell_Squat/0.jpg`, label: 'BANDED' },
            { url: `${BASE}/Barbell_Squat/1.jpg`, label: 'SIT' },
        ],
        steps: [
            'Resist band at knee joint, shins vertical.',
            'Maintain 90 degree flexion.',
            'Focus on VMO activation.',
            'Hold for designated duration.',
        ],
        muscles: 'VMO • QUADS • HIP FLEXORS',
    },
    'Step-Down Exercise': {
        frames: [
            { url: `${BASE}/Single-Leg_High_Box_Squat/0.jpg`, label: 'UNILATERAL' },
            { url: `${BASE}/Single-Leg_High_Box_Squat/1.jpg`, label: 'TOUCH' },
        ],
        steps: [
            'Slow descent on single leg, neutral patellar tracking.',
            'Lightly touch distal heel to floor.',
            'Maintain pelvic stability (no drop).',
            'Squeeze quad on ascent.',
        ],
        muscles: 'QUADS • VMO • GLUTEMED',
    },
    'Terminal Knee Extension': {
        frames: [
            { url: `${BASE}/Single_Leg_Glute_Bridge/0.jpg`, label: 'FLEX' },
            { url: `${BASE}/Single_Leg_Glute_Bridge/1.jpg`, label: 'LOCK' },
        ],
        steps: [
            'Loop band behind joint, drive into extension.',
            'Full terminal extension with quad squeeze.',
            'Slow eccentric release.',
            'Maximize tension in last 15 degrees.',
        ],
        muscles: 'VMO • KNEE STABILIZERS',
    },
    // ── Ankle exercises ──
    'Proprioception Drills': {
        frames: [
            { url: `${BASE}/Balance_Board/0.jpg`, label: 'ANCHOR' },
            { url: `${BASE}/Balance_Board/1.jpg`, label: 'STABILIZE' },
        ],
        steps: [
            'Unstable surface balance, micro-adjustments required.',
            'Maintain neutral center of mass.',
            'Soft knee flexion at all times.',
            'Hold for specified duration.',
        ],
        muscles: 'PERONEALS • ANKLE STABILIZERS',
    },
    'Single-Leg Calf Raise': {
        frames: [
            { url: `${BASE}/Standing_Calf_Raises/0.jpg`, label: 'STRETCH' },
            { url: `${BASE}/Standing_Calf_Raises/1.jpg`, label: 'PEAK' },
        ],
        steps: [
            'Full range of motion including negative.',
            'Explosive ascent to peak plantarflexion.',
            '3 second controlled negative.',
            'No manual assistance.',
        ],
        muscles: 'CALVES • ACHILLES',
    },
    'Resistance Band Dorsiflexion': {
        frames: [
            { url: `${BASE}/Adductor_Groin/0.jpg`, label: 'POINT' },
            { url: `${BASE}/Adductor_Groin/1.jpg`, label: 'PULL' },
        ],
        steps: [
            'Pull toes toward shin against band.',
            'Maximize dorsal range.',
            'Slow return to neutral.',
            'Strengthen anterior tibialis.',
        ],
        muscles: 'ANTERIOR TIBIALIS',
    },
    'Lateral Hop & Stick': {
        frames: [
            { url: `${BASE}/Single-Leg_Lateral_Hop/0.jpg`, label: 'EXPLODE' },
            { url: `${BASE}/Single-Leg_Lateral_Hop/1.jpg`, label: 'STICK' },
        ],
        steps: [
            'Lateral plyometric thrust.',
            'Silent landing, immediate stabilization.',
            'Hold stick for 3 seconds.',
            'Neutral knee tracking on impact.',
        ],
        muscles: 'GLUTES • ANKLE STABILIZERS',
    },
    // ── Groin/Adductor exercises ──
    'Copenhagen Plank': {
        frames: [
            { url: `${BASE}/Push_Up_to_Side_Plank/0.jpg`, label: 'ELEVATE' },
            { url: `${BASE}/Push_Up_to_Side_Plank/1.jpg`, label: 'RECRUIT' },
        ],
        steps: [
            'Top foot anchored on elevated station.',
            'Lift hips to neutral plane.',
            'Adduct bottom leg toward station.',
            'Hold peak recruitment.',
        ],
        muscles: 'ADDUCTORS • OBLIQUES • CORE',
    },
    'Adductor Squeeze Ball': {
        frames: [
            { url: `${BASE}/Adductor_Groin/0.jpg`, label: 'RELAX' },
            { url: `${BASE}/Adductor_Groin/1.jpg`, label: 'SQUEEZE' },
        ],
        steps: [
            'Maximal squeeze against resistance.',
            '5 second isometric hold.',
            'Controlled release.',
            'Maintain deep core engagement.',
        ],
        muscles: 'ADDUCTORS • PELVIC FLOOR',
    },
    'Side-Lying Hip Adduction': {
        frames: [
            { url: `${BASE}/Adductor_Groin/0.jpg`, label: 'NEUTRAL' },
            { url: `${BASE}/Adductor_Groin/1.jpg`, label: 'ELEVATE' },
        ],
        steps: [
            'Internal rotation of bottom leg.',
            'Lift toward ceiling strictly.',
            'Hold peak adduction.',
            'Avoid pelvic rotation.',
        ],
        muscles: 'ADDUCTORS',
    },
    'Lateral Band Walk': {
        frames: [
            { url: `${BASE}/Single-Leg_Lateral_Hop/0.jpg`, label: 'TENSION' },
            { url: `${BASE}/Single-Leg_Lateral_Hop/1.jpg`, label: 'STEP' },
        ],
        steps: [
            'Constant tension on kinetic band.',
            'Lateral stepping at athletic depth.',
            'Maintain neutral patellar alignment.',
            'No friction between feet.',
        ],
        muscles: 'GLUTEMED • HIP ABDUCTORS',
    },
    // ── Back/Core exercises ──
    'Dead Bug': {
        frames: [
            { url: `${BASE}/Dead_Bug/0.jpg`, label: 'PROTO' },
            { url: `${BASE}/Dead_Bug/1.jpg`, label: 'EXTEND' },
        ],
        steps: [
            'Neutral lumbar pressed to floor.',
            'Opposite limb extension strictly.',
            'Control pace via core tension.',
            'Exhale on extension.',
        ],
        muscles: 'TRANSVERSE ABDOMINIS • LUMBAR',
    },
    'McGill Bird-Dog': {
        frames: [
            { url: `${BASE}/Dead_Bug/0.jpg`, label: 'QUADRUPED' },
            { url: `${BASE}/Dead_Bug/1.jpg`, label: 'LINEAR' },
        ],
        steps: [
            'Neutral quad position, braced core.',
            'Simultaneous limb extension.',
            'Hold 10s at terminal point.',
            'Zero pelvic tilt allowed.',
        ],
        muscles: 'ERECTORS • CORE • GLUTES',
    },
    'Pallof Press': {
        frames: [
            { url: `${BASE}/Pallof_Press/0.jpg`, label: 'CHEST' },
            { url: `${BASE}/Pallof_Press/1.jpg`, label: 'PRESS' },
        ],
        steps: [
            'Resist lateral band rotation.',
            'Press strictly forward.',
            'Hold 3s at peak extension.',
            'Slow return to sternum.',
        ],
        muscles: 'OBLIQUES • ANTI-ROTATION',
    },
    'Glute Bridge March': {
        frames: [
            { url: `${BASE}/Single_Leg_Glute_Bridge/0.jpg`, label: 'GLUTE' },
            { url: `${BASE}/Single_Leg_Glute_Bridge/1.jpg`, label: 'MARCH' },
        ],
        steps: [
            'Elevation of pelvis, static bridge.',
            'Unilateral limb lift, alternating.',
            'Zero pelvic drop during march.',
            'Maximize glute recruitment.',
        ],
        muscles: 'GLUTES • CORE',
    },
    // ── Muscle strain exercises ──
    'Isometric Hold (Affected)': {
        frames: [
            { url: `${BASE}/Lying_Hamstring/0.jpg`, label: 'ISO' },
            { url: `${BASE}/Lying_Hamstring/1.jpg`, label: 'CONTRACTION' },
        ],
        steps: [
            '30% maximal voluntary contraction.',
            'Pain-free range only.',
            'Hold 30s for neural activation.',
            'Iterative daily progress.',
        ],
        muscles: 'AFFECTED GROUP • NEURAL CORE',
    },
    'Eccentric Contraction Drill': {
        frames: [
            { url: `${BASE}/Seated_Hamstring/0.jpg`, label: 'LOAD' },
            { url: `${BASE}/Seated_Hamstring/1.jpg`, label: 'LENGTHEN' },
        ],
        steps: [
            'Slow eccentric lengthening (5s).',
            'Controlled concentric reset.',
            'Maintain threshold under pain limit.',
            'Architectural fiber repair focus.',
        ],
        muscles: 'TENDONS • INJURED FIBERS',
    },
    'Foam Roll & Mobility': {
        frames: [
            { url: `${BASE}/Hamstring-SMR/0.jpg`, label: 'FASCIA' },
            { url: `${BASE}/Hamstring-SMR/1.jpg`, label: 'RELEASE' },
        ],
        steps: [
            'Moderate pressure, slow rolling rate.',
            'Pause on trigger points for 30s.',
            'Mobilize adjacent joints gently.',
            'Hydrate following session.',
        ],
        muscles: 'FASCIA • CONNECTIVE',
    },
    'Progressive Loading Squat': {
        frames: [
            { url: `${BASE}/Single-Leg_High_Box_Squat/0.jpg`, label: 'DEPTH' },
            { url: `${BASE}/Single-Leg_High_Box_Squat/1.jpg`, label: 'DRIVE' },
        ],
        steps: [
            'Bodyweight only, neutral spine.',
            'Assess pain-free depth threshold.',
            'Drive through mid-foot to vertical.',
            'Progress only when 3x12 is clear.',
        ],
        muscles: 'QUADS • GLUTES • HAMSTRINGS',
    },
    'Biomechanical Plyos': {
        frames: [
            { url: `${BASE}/Front_Box_Jump/0.jpg`, label: 'LOAD' },
            { url: `${BASE}/Front_Box_Jump/1.jpg`, label: 'PLATFORM' },
        ],
        steps: [
            'Explosive vertical jump to platform.',
            'Silent, soft landing mechanism.',
            'Immediate kinetic stabilization.',
            'Step down, never jump back.',
        ],
        muscles: 'QUADS • GLUTES • EXPLOSIVE CORE',
    },
};

const ExerciseCard = ({ ex, idx }) => {
    const data = EXERCISES_DATA[ex.name];

    return (
        <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex flex-col glass-card overflow-hidden shadow-4xl group hover:border-primary/30 transition-all duration-700"
        >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-10 border-b border-white/5 relative bg-white/[0.01]">
                <div className="absolute top-0 right-0 p-6 opacity-[0.02] text-primary">
                    <Activity size={80} />
                </div>

                <div className="flex items-center gap-8 relative z-10">
                    <div className="h-20 w-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center border border-white/5 shrink-0 shadow-2xl group-hover:border-primary/20 transition-all">
                        <Dumbbell className="text-primary group-hover:scale-110 transition-transform" size={32} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">{ex.name}</h3>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2 bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                                <Target size={12} className="text-primary" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">{ex.focus}</span>
                            </div>
                            {data && (
                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest opacity-60 italic">
                                    // {data.muscles}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end shrink-0 relative z-10">
                    <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-1">Session Target</p>
                    <div className="px-8 py-3 bg-zinc-900 rounded-2xl border border-white/5 shadow-inner">
                        <span className="text-primary font-black text-2xl italic tracking-tighter">{ex.sets}</span>
                    </div>
                </div>
            </div>

            {data && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-white/5 bg-[#080808] relative">
                    {data.frames.map((frame, fi) => (
                        <div key={fi} className={`relative overflow-hidden group/frame ${fi === 0 ? 'border-r border-white/5' : ''}`} style={{ height: '400px' }}>
                            <img
                                src={frame.url}
                                alt={frame.label}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105"
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800';
                                    e.target.className = 'w-full h-full object-cover opacity-40';
                                }}
                            />
                            <div className="absolute top-6 left-6 px-4 py-2 bg-black/80 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-2xl">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">{frame.label}</span>
                            </div>
                            {fi === 0 && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 h-14 w-14 rounded-full bg-primary flex items-center justify-center shadow-4xl shadow-primary/30 border-4 border-[#080808] group-hover:scale-110 transition-transform">
                                    <ChevronRight className="text-black" size={28} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {data && (
                <div className="p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] text-zinc-600 pointer-events-none">
                        <PlayCircle size={150} />
                    </div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-10 italic">Kinetic Protocol Steps</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 relative z-10">
                        {data.steps.map((step, si) => (
                            <div key={si} className="flex items-start gap-6 group/step">
                                <div className="shrink-0 h-10 w-10 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-[10px] font-black text-zinc-600 group-hover/step:text-primary group-hover/step:border-primary/20 transition-all duration-500 italic">
                                    0{si + 1}
                                </div>
                                <p className="text-zinc-500 text-sm leading-relaxed font-bold uppercase tracking-tight italic group-hover:text-zinc-300 transition-colors opacity-80">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
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
