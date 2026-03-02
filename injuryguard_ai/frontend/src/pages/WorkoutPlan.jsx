import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { Dumbbell, Target, ArrowLeft, Clock, ChevronRight, AlertTriangle, Activity } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

// Color and label per injury type
const INJURY_META = {
    hamstring: { label: 'Hamstring Strain', color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' },
    knee: { label: 'Knee Injury', color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10' },
    ankle: { label: 'Ankle Sprain', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
    groin: { label: 'Groin / Adductor', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
    back: { label: 'Back / Lumbar', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
    muscle: { label: 'Muscle Strain', color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10' },
    general: { label: 'General Prevention', color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' },
};

/* ─── Exercise library: images + steps for every injury-specific exercise ─── */
const EXERCISES_DATA = {
    // ── Hamstring exercises ──
    'Nordic Hamstring Curls': {
        frames: [
            { url: `${BASE}/Seated_Hamstring/0.jpg`, label: 'Start' },
            { url: `${BASE}/Seated_Hamstring/1.jpg`, label: 'Finish' },
        ],
        steps: [
            'Kneel on a padded surface, anchor your feet firmly under a bar or have a partner hold them',
            'Keep your body in a straight line from knee to shoulder — do not let hips bend',
            'Slowly lower your torso toward the floor under full control, resisting with your hamstrings',
            'When you can no longer control the descent, push off the ground with your hands to assist',
            'Use your hamstrings to pull yourself back up to the kneeling start position',
        ],
        muscles: 'Hamstrings • Glutes • Core',
    },
    'Romanian Deadlift': {
        frames: [
            { url: `${BASE}/Barbell_Deadlift/0.jpg`, label: 'Hip Hinge' },
            { url: `${BASE}/Barbell_Deadlift/1.jpg`, label: 'Extend' },
        ],
        steps: [
            'Stand with feet hip-width apart, hold a barbell or dumbbells in front of your thighs',
            'Push your hips back and hinge forward, keeping a neutral spine — feel the hamstring stretch',
            'Lower the weight until you feel a deep stretch in the hamstrings (typically shin level)',
            'Drive your hips forward to return to standing — squeeze your glutes at the top',
            'Keep the weight close to your body throughout the full movement',
        ],
        muscles: 'Hamstrings • Glutes • Erector Spinae',
    },
    'Nordic Leg Curl Isometric': {
        frames: [
            { url: `${BASE}/Lying_Hamstring/0.jpg`, label: 'Hold' },
            { url: `${BASE}/Lying_Hamstring/1.jpg`, label: 'Contract' },
        ],
        steps: [
            'Kneel with feet anchored, lean slightly forward to create tension in the hamstrings',
            'Hold this position isometrically for 30 seconds — do not move up or down',
            'Breathe steadily throughout — focus on feeling the hamstrings under load',
            'Rest for 60 seconds between sets',
            'Gradually increase hold time as strength improves',
        ],
        muscles: 'Hamstrings • Core Stabilisers',
    },
    'Single-Leg Glute Bridge': {
        frames: [
            { url: `${BASE}/Single_Leg_Glute_Bridge/0.jpg`, label: 'Start' },
            { url: `${BASE}/Single_Leg_Glute_Bridge/1.jpg`, label: 'Bridge' },
        ],
        steps: [
            'Lie on your back, knees bent, one foot flat on the floor — raise the other leg',
            'Press through your heel and lift your hips off the floor until your body is straight',
            'Squeeze your glute firmly at the top — hold for 2 seconds',
            'Lower slowly back to the floor — do not let your hips drop to one side',
            'Complete all reps on one leg before switching',
        ],
        muscles: 'Glutes • Hamstrings • Core',
    },
    // ── Knee exercises ──
    'Spanish Squat (Isometric)': {
        frames: [
            { url: `${BASE}/Barbell_Squat/0.jpg`, label: 'Setup' },
            { url: `${BASE}/Barbell_Squat/1.jpg`, label: 'Hold' },
        ],
        steps: [
            'Loop a resistance band around a pole at knee height and step back inside it',
            'Bend your knees to 90° — keep shins vertical with knees pushed into the band',
            'Hold this seated position — focus on activating the VMO (inner quad) muscle',
            'Keep your back upright and your weight evenly distributed across both feet',
            'Hold for 45 seconds. Rest and repeat — increase hold time as pain allows',
        ],
        muscles: 'VMO (Inner Quad) • Quads • Core',
    },
    'Step-Down Exercise': {
        frames: [
            { url: `${BASE}/Single-Leg_High_Box_Squat/0.jpg`, label: 'Stand' },
            { url: `${BASE}/Single-Leg_High_Box_Squat/1.jpg`, label: 'Lower' },
        ],
        steps: [
            'Stand on a step or box on ONE leg, the other leg hanging free',
            'Slowly lower your free heel toward the floor by bending the standing knee',
            'Control the descent — your knee should track over your 2nd toe, not collapse inward',
            'Touch the heel lightly to the floor then press back up to standing',
            'Keep your pelvis level — do not let the hip drop on the free-leg side',
        ],
        muscles: 'Quads • VMO • Glutes • Hip Stabilisers',
    },
    'Terminal Knee Extension': {
        frames: [
            { url: `${BASE}/Single_Leg_Glute_Bridge/0.jpg`, label: 'Flex' },
            { url: `${BASE}/Single_Leg_Glute_Bridge/1.jpg`, label: 'Extend' },
        ],
        steps: [
            'Attach a resistance band behind you at knee height and step forward to create tension',
            'Stand on one leg with knee slightly bent — let the band pull the knee forward gently',
            'Straighten (extend) your knee fully, resisting the band — squeeze the quad at full extension',
            'Slowly allow the knee to bend back to the start position under control',
            'Focus on the last 15° of extension — this activates the VMO most effectively',
        ],
        muscles: 'VMO • Quadriceps • Knee Stabilisers',
    },
    // ── Ankle exercises ──
    'Proprioception Drills': {
        frames: [
            { url: `${BASE}/Balance_Board/0.jpg`, label: 'Stand' },
            { url: `${BASE}/Balance_Board/1.jpg`, label: 'Balance' },
        ],
        steps: [
            'Stand on one leg on an unstable surface (BOSU ball, wobble board, or folded mat)',
            'Raise the opposite knee to hip height — keep arms slightly out for balance',
            'Your standing knee should be very slightly bent — never fully locked',
            'Focus on a fixed point ahead — this anchors your vestibular system',
            'Hold 30–60s per leg. Progress: eyes closed, ball catch, or add arm movements',
        ],
        muscles: 'Ankle Stabilisers • Peroneals • Calves • Core',
    },
    'Single-Leg Calf Raise': {
        frames: [
            { url: `${BASE}/Standing_Calf_Raises/0.jpg`, label: 'Start' },
            { url: `${BASE}/Standing_Calf_Raises/1.jpg`, label: 'Rise' },
        ],
        steps: [
            'Stand on the edge of a step on ONE foot with the heel hanging off',
            'Let your heel drop below the step level to stretch the calf fully',
            'Rise up onto the ball of your foot as high as possible — full plantarflexion',
            'Lower slowly back down — take 3 seconds to descend (eccentric phase)',
            'Use a wall for fingertip balance only — do not rely on arm support',
        ],
        muscles: 'Soleus • Gastrocnemius • Achilles Tendon',
    },
    'Resistance Band Dorsiflexion': {
        frames: [
            { url: `${BASE}/Adductor_Groin/0.jpg`, label: 'Point' },
            { url: `${BASE}/Adductor_Groin/1.jpg`, label: 'Flex' },
        ],
        steps: [
            'Sit on the floor with legs extended — loop a band around your foot and anchor it ahead',
            'Point your foot away (plantarflexion) against the band resistance',
            'Then pull your toes toward your shin (dorsiflexion) against the band',
            'Control both directions — do not let the band snap back',
            'Perform slow, controlled reps — strengthen the tibialis anterior (shin muscle)',
        ],
        muscles: 'Tibialis Anterior • Ankle Dorsiflexors',
    },
    'Lateral Hop & Stick': {
        frames: [
            { url: `${BASE}/Single-Leg_Lateral_Hop/0.jpg`, label: 'Hop' },
            { url: `${BASE}/Single-Leg_Lateral_Hop/1.jpg`, label: 'Stick' },
        ],
        steps: [
            'Stand on ONE leg — hop sideways onto the same leg about 30–50 cm',
            'LAND and freeze immediately — hold the position for 3 full seconds',
            'Your landing must be soft and quiet — absorb through ankle, knee, and hip',
            'Do not let the knee collapse inward or the foot roll outward on landing',
            'Alternate directions (left/right) each rep',
        ],
        muscles: 'Ankle Stabilisers • Glutes • Lateral Hip • Core',
    },
    // ── Groin/Adductor exercises ──
    'Copenhagen Plank': {
        frames: [
            { url: `${BASE}/Push_Up_to_Side_Plank/0.jpg`, label: 'Start' },
            { url: `${BASE}/Push_Up_to_Side_Plank/1.jpg`, label: 'Hold' },
        ],
        steps: [
            'Lie on your side, top foot on a bench at knee height — support on your forearm',
            'Lift your hips — form a straight line from head to foot',
            'Raise your BOTTOM leg up toward the bench (adductor squeeze motion)',
            'Hold the top position for 2 seconds, then lower under control',
            'Keep hips stacked — do not rotate or let them drop',
        ],
        muscles: 'Adductors • Core • Obliques',
    },
    'Adductor Squeeze Ball': {
        frames: [
            { url: `${BASE}/Adductor_Groin/0.jpg`, label: 'Start' },
            { url: `${BASE}/Adductor_Groin/1.jpg`, label: 'Squeeze' },
        ],
        steps: [
            'Lie on your back, knees bent at 90°, a ball/pillow between your knees',
            'Squeeze the ball with both knees as hard as is comfortable — hold 5 seconds',
            'Maintain normal breathing — keep your lower back flat on the floor',
            'Release slowly — do not let the knees spring apart',
            'Build to 3 sets of 20 reps as groin pain reduces',
        ],
        muscles: 'Adductors • Inner Thigh • Pelvic Floor',
    },
    'Side-Lying Hip Adduction': {
        frames: [
            { url: `${BASE}/Adductor_Groin/0.jpg`, label: 'Rest' },
            { url: `${BASE}/Adductor_Groin/1.jpg`, label: 'Raise' },
        ],
        steps: [
            'Lie on your side with your BOTTOM leg straight — top leg bent and foot on floor',
            'Raise your BOTTOM (straight) leg upward toward the ceiling',
            'Keep your foot flexed and leg internally rotated slightly to target adductors',
            'Hold 2 seconds at the top — lower slowly back to the floor',
            'Avoid rolling back — keep your pelvis stable throughout',
        ],
        muscles: 'Adductors • Inner Thigh',
    },
    'Lateral Band Walk': {
        frames: [
            { url: `${BASE}/Single-Leg_Lateral_Hop/0.jpg`, label: 'Start' },
            { url: `${BASE}/Single-Leg_Lateral_Hop/1.jpg`, label: 'Step' },
        ],
        steps: [
            'Place a resistance band just above your knees — stand with feet shoulder-width',
            'Bend knees into a slight squat — keep your chest up and core braced',
            'Step sideways — move one foot out then bring the other to shoulder-width',
            'Maintain constant tension on the band — never let feet come together',
            'Walk 20 meters in each direction without standing fully upright',
        ],
        muscles: 'Hip Abductors • Glute Medius • Lateral Hip Stabilisers',
    },
    // ── Back/Core exercises ──
    'Dead Bug': {
        frames: [
            { url: `${BASE}/Dead_Bug/0.jpg`, label: 'Neutral' },
            { url: `${BASE}/Dead_Bug/1.jpg`, label: 'Extend' },
        ],
        steps: [
            'Lie on your back — arms pointing straight up, knees bent at 90° in the air',
            'Press your lower back firmly into the floor — maintain this throughout',
            'SLOWLY lower opposite arm and leg toward the floor simultaneously',
            'Stop just before your lower back arches — return to start under control',
            'Exhale as you extend, inhale to return — keep the movement slow and deliberate',
        ],
        muscles: 'Deep Core • Transverse Abdominis • Lumbar Stabilisers',
    },
    'McGill Bird-Dog': {
        frames: [
            { url: `${BASE}/Dead_Bug/0.jpg`, label: 'Ready' },
            { url: `${BASE}/Dead_Bug/1.jpg`, label: 'Extend' },
        ],
        steps: [
            'Start on hands and knees — spine neutral, wrists under shoulders, knees under hips',
            'Tighten your core as if bracing for a punch — do not hold your breath',
            'Extend your RIGHT arm forward and LEFT leg back simultaneously',
            'Hold for 8–10 seconds — keep hips perfectly level (use a water bottle on your back as feedback)',
            'Return slowly and switch sides. Quality over speed — this is about stability not movement',
        ],
        muscles: 'Erector Spinae • Glutes • Deep Core',
    },
    'Pallof Press': {
        frames: [
            { url: `${BASE}/Pallof_Press/0.jpg`, label: 'Hold' },
            { url: `${BASE}/Pallof_Press/1.jpg`, label: 'Press' },
        ],
        steps: [
            'Attach a resistance band to a fixed point at chest height — stand sideways to it',
            'Hold the band with both hands at your chest — feet shoulder-width apart',
            'Brace your core and PUSH the band straight out in front of you (arms fully extended)',
            'Hold for 2 seconds — resist the rotational pull of the band',
            'Slowly return hands to chest. Do all reps then switch sides',
        ],
        muscles: 'Obliques • Transverse Abdominis • Anti-Rotation Core',
    },
    'Glute Bridge March': {
        frames: [
            { url: `${BASE}/Single_Leg_Glute_Bridge/0.jpg`, label: 'Bridge' },
            { url: `${BASE}/Single_Leg_Glute_Bridge/1.jpg`, label: 'March' },
        ],
        steps: [
            'Lie on your back, press into a standard glute bridge — hold hips elevated',
            'Without dropping your hips, lift ONE knee toward your chest (90°)',
            'Without dropping your hips, lower it back and repeat with the other leg',
            'Keep your pelvis completely level — do not let either hip dip',
            'Move slowly and steadily — the challenge is maintaining the bridge while marching',
        ],
        muscles: 'Glutes • Core • Hip Flexors',
    },
    // ── Muscle strain exercises ──
    'Isometric Hold (Affected)': {
        frames: [
            { url: `${BASE}/Lying_Hamstring/0.jpg`, label: 'Contract' },
            { url: `${BASE}/Lying_Hamstring/1.jpg`, label: 'Hold' },
        ],
        steps: [
            'Find a pain-free position for the affected muscle — typically mid-range (not stretched or fully contracted)',
            'Gently contract the muscle against a fixed surface — use 30–40% of maximum effort only',
            'Hold for 30 seconds — do not push through any sharp or stabbing pain',
            'Breathe steadily throughout — this is about neural re-activation, not loading',
            'Progress to longer holds or more reps as pain allows over the following days',
        ],
        muscles: 'Affected Muscle Group • Neuromuscular Re-activation',
    },
    'Eccentric Contraction Drill': {
        frames: [
            { url: `${BASE}/Seated_Hamstring/0.jpg`, label: 'Load' },
            { url: `${BASE}/Seated_Hamstring/1.jpg`, label: 'Lengthen' },
        ],
        steps: [
            'Choose a resistance that allows pain-free movement — start light',
            'Shorten the muscle (concentric phase) — this is the easy part',
            'SLOWLY lengthen the muscle under load (eccentric phase) taking 4–6 full seconds',
            'The eccentric phase is where healing fibres are strengthened — control is everything',
            'Stop if you feel sharp pain — mild discomfort (3/10) during eccentric is acceptable',
        ],
        muscles: 'Injured Muscle Fibres • Tendon',
    },
    'Foam Roll & Mobility': {
        frames: [
            { url: `${BASE}/Hamstring-SMR/0.jpg`, label: 'Roll' },
            { url: `${BASE}/Hamstring-SMR/1.jpg`, label: 'Hold' },
        ],
        steps: [
            'Place the foam roller under the affected muscle group',
            'Use your arms to control your weight — apply moderate pressure, not maximum',
            'Roll slowly (2-3 cm/second) — pause for 30 seconds on any tender spots',
            'Breathe slowly and let the tension release — do not roll over joints or bones',
            'Follow with gentle static stretching to the same area for 30–60 seconds',
        ],
        muscles: 'Fascia • Connective Tissue • Local Blood Flow',
    },
    'Progressive Loading Squat': {
        frames: [
            { url: `${BASE}/Single-Leg_High_Box_Squat/0.jpg`, label: 'Descend' },
            { url: `${BASE}/Single-Leg_High_Box_Squat/1.jpg`, label: 'Stand' },
        ],
        steps: [
            'Start with bodyweight only — feet shoulder-width, toes slightly out',
            'Lower to a PAIN-FREE depth — do not force range of motion into discomfort',
            'Keep knees tracking over toes — maintain a neutral spine throughout',
            'Drive through the full foot to stand — squeeze glutes at the top',
            'Increase depth or add resistance only when 3x12 reps are pain-free with good form',
        ],
        muscles: 'Quads • Glutes • Hamstrings • Core',
    },
    // ── General / fallback ──
    'Biomechanical Plyos': {
        frames: [
            { url: `${BASE}/Front_Box_Jump/0.jpg`, label: 'Load' },
            { url: `${BASE}/Front_Box_Jump/1.jpg`, label: 'Land' },
        ],
        steps: [
            'Stand facing the box, feet shoulder-width apart — about 30 cm away',
            'Bend your knees into a quarter-squat, swing your arms back for momentum',
            'Drive your arms up and explode off both feet simultaneously',
            'Land softly on the box with BOTH feet — knees bent, hips pushed back',
            'Absorb the landing quietly — step down carefully. Never jump back down',
        ],
        muscles: 'Quads • Glutes • Calves • Core',
    },
};

/* ─── ExerciseCard ─── */
const ExerciseCard = ({ ex, idx }) => {
    const data = EXERCISES_DATA[ex.name];
    const [activeFrame, setActiveFrame] = useState(0);

    useEffect(() => {
        if (!data) return;
        const id = setInterval(() => setActiveFrame(f => (f + 1) % data.frames.length), 5000);
        return () => clearInterval(id);
    }, [data]);

    return (
        <motion.div
            key={idx}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.12 }}
            className="flex flex-col bg-white/5 border border-white/5 rounded-3xl overflow-hidden hover:border-orange-500/30 transition-all"
        >
            {/* Card Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-white/5">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-slate-900 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                        <Dumbbell className="text-orange-500" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">{ex.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <Target size={10} className="text-orange-500" /> {ex.focus}
                            </span>
                            {data && (
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                    · {data.muscles}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="px-5 py-2 bg-orange-500/10 rounded-full border border-orange-500/20 shrink-0">
                    <span className="text-orange-500 font-black text-sm uppercase tracking-widest">{ex.sets}</span>
                </div>
            </div>

            {/* Image Section — Side by Side */}
            {data && (
                <div className="grid grid-cols-2 gap-0 border-b border-white/5 bg-slate-900/40 relative">
                    {data.frames.map((frame, fi) => (
                        <div key={fi} className={`relative overflow-hidden ${fi === 0 ? 'border-r border-white/5' : ''}`} style={{ height: '320px' }}>
                            <img
                                src={frame.url}
                                alt={`${ex.name} — ${frame.label}`}
                                className="w-full h-full object-cover object-center"
                                loading="lazy"
                                style={{ filter: 'brightness(0.9)' }}
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800'; // Fallback to generic fitness image
                                    e.target.className = 'w-full h-full object-cover grayscale opacity-30';
                                }}
                            />
                            {/* Frame label */}
                            <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur rounded-xl border border-orange-500/30">
                                <span className="text-[10px] font-black text-orange-300 uppercase tracking-widest">{frame.label}</span>
                            </div>

                            {/* Arrow between frames */}
                            {fi === 0 && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/40 border-2 border-slate-900">
                                    <ChevronRight size={20} className="text-white" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Step-by-step instructions */}
            {data && (
                <div className="p-6">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4">Step-by-Step Guide</p>
                    <ol className="space-y-2.5">
                        {data.steps.map((step, si) => (
                            <li key={si} className="flex items-start gap-3">
                                <span className="shrink-0 h-5 w-5 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-[9px] font-black text-orange-400 mt-0.5">
                                    {si + 1}
                                </span>
                                <p className="text-slate-400 text-xs leading-relaxed font-medium">{step}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </motion.div>
    );
};

/* ─── Main Page ─── */
const WorkoutPlan = () => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Injury type passed from Dashboard via navigate state
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
        <div className="min-h-screen flex items-center justify-center text-electric-cyan font-black">
            CALIBRATING TRAINING MODULES...
        </div>
    );
    if (!plan) return <div>Error loading plan.</div>;

    return (
        <div className="min-h-screen p-6 lg:p-12 font-['Outfit']">
            <button
                onClick={() => navigate(-1)}
                className="mb-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-xs tracking-widest"
            >
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* ── Exercise Cards ── */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        {/* Injury type badge */}
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${injuryMeta.border} ${injuryMeta.bg} mb-6`}>
                            <AlertTriangle size={12} className={injuryMeta.color} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${injuryMeta.color}`}>
                                {plan.injury_type?.toUpperCase() === 'GENERAL' ? 'Standard Prevention' : `${plan.injury_type?.toUpperCase()} Recovery`} — Targeted Protocol
                            </span>
                        </div>

                        {plan.injury_type?.toUpperCase() === 'GENERAL' && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mb-8 p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl flex items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">No Active Injury Target</p>
                                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Run a clinical scan to unlock targeted training modules.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/assessment')}
                                    className="px-4 py-2 bg-orange-500 text-deep-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-400 transition-all"
                                >
                                    Start Scan
                                </button>
                            </motion.div>
                        )}

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-tight">{plan.title}</h1>
                                <p className="text-slate-500 font-bold text-xs mt-2 border-l-2 border-orange-500 pl-3">
                                    {plan.subtitle}
                                </p>
                            </div>
                            <div className="text-right hidden md:block">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Exercises</p>
                                <p className="text-3xl font-black text-orange-500">{plan.exercises.length}</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {plan.exercises.map((ex, idx) => (
                                <ExerciseCard key={idx} ex={ex} idx={idx} />
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* ── Sidebar ── */}
                <div className="space-y-8">
                    <div className="glass-card overflow-hidden border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                        <img src={plan.image} alt="Workout Visual" className="w-full h-80 object-cover opacity-80" />
                        <div className="p-6">
                            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-2">Technical Analysis</h4>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                Each exercise targets a key injury-prevention zone. Focus on quality of movement — never sacrifice form for speed or reps.
                            </p>
                        </div>
                    </div>

                    <div className="glass-card p-8 border-cyan-500/20 bg-cyan-500/5">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock size={16} className="text-cyan-400" />
                            <h4 className="text-cyan-400 font-black uppercase text-xs tracking-widest">Protocol Timing</h4>
                        </div>
                        <p className="text-slate-400 text-xs font-bold uppercase leading-relaxed">
                            Session duration: 45-60 mins. High intensity focus on first 20 mins. Followed by stability recovery.
                        </p>
                    </div>

                    {/* Legend */}
                    <div className="glass-card p-6">
                        <h4 className="text-white font-black uppercase text-xs tracking-widest mb-4">How to Read Each Card</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-[9px] font-black text-orange-400">1</div>
                                <p className="text-slate-500 text-xs">Follow the numbered steps in order</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-5 px-2 rounded bg-black/50 border border-orange-500/30 flex items-center">
                                    <span className="text-[8px] font-black text-orange-300">START</span>
                                </div>
                                <p className="text-slate-500 text-xs">Left image = starting position</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-5 px-2 rounded bg-black/50 border border-orange-500/30 flex items-center">
                                    <span className="text-[8px] font-black text-orange-300">FINISH</span>
                                </div>
                                <p className="text-slate-500 text-xs">Right image = end position</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkoutPlan;
