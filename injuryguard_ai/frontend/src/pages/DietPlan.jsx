import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { Droplets, ArrowLeft, AlertTriangle, Flame, Activity } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// Injury badge colours — mirrors WorkoutPlan.jsx
const INJURY_META = {
    hamstring: { label: 'Hamstring Recovery', color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' },
    knee: { label: 'Knee & Cartilage', color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10' },
    ankle: { label: 'Ankle Ligament', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
    groin: { label: 'Groin / Adductor', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
    back: { label: 'Lumbar & Spine', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
    muscle: { label: 'Muscle Strain', color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10' },
    general: { label: 'General Performance', color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' },
};

// Category accent colours for variety
const CATEGORY_COLORS = [
    { dot: 'bg-electric-cyan', title: 'text-electric-cyan', border: 'border-electric-cyan/20' },
    { dot: 'bg-emerald-400', title: 'text-emerald-400', border: 'border-emerald-400/20' },
    { dot: 'bg-orange-400', title: 'text-orange-400', border: 'border-orange-400/20' },
    { dot: 'bg-violet-400', title: 'text-violet-400', border: 'border-violet-400/20' },
    { dot: 'bg-rose-400', title: 'text-rose-400', border: 'border-rose-400/20' },
];

const DietPlan = () => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imgErrors, setImgErrors] = useState({});
    const navigate = useNavigate();
    const location = useLocation();

    const injuryType = location.state?.injury_type || 'general';
    const injuryKey = Object.keys(INJURY_META).find(k => injuryType.toLowerCase().includes(k)) || 'general';
    const injuryMeta = INJURY_META[injuryKey];

    // Emoji fallback — always recognisable even without the image URL
    const FOOD_EMOJI = {
        'Grilled Salmon': '🐟', 'Chicken Breast': '🍗', 'Grilled Chicken': '🍗',
        '3 Egg whites': '🥚', 'Scrambled Eggs': '🍳', 'Whey Isolate Shake': '🥛',
        'Tuna Salad': '🐟', 'Greek Yogurt': '🫙', 'Cottage Cheese': '🧀',
        'Oatmeal with chia seeds': '🥣', 'Sweet Potato': '🍠', 'Brown Rice': '🍚',
        'Quinoa Bowl': '🍲', 'Banana': '🍌', 'Dextrose': '🍬', 'Whole Grain Toast': '🍞',
        'Blueberries': '🫐', 'Spinach': '🥬', 'Avocado Toast': '🥑', 'Broccoli': '🥦',
        'Cherry Tomatoes': '🍅', 'Orange Juice': '🍊', 'Berries Mix': '🍓',
        'Pineapple': '🍍', 'Tart Cherry Juice': '🍒', 'Asparagus': '🌿',
        'Almonds': '🌰', 'Walnuts': '🌰', 'Dark Chocolate (70%+)': '🍫',
        'Beetroot juice Shot': '🧃', 'Turmeric Latte': '☕', 'Green Smoothie': '🥤',
        'Lentil Soup': '🍲', 'Bone Broth': '🍵', 'Kefir': '🥛',
        'Collagen Peptides': '💊', 'Electrolyte Drink': '⚡', 'Magnesium Supplement': '💊',
        'Omega-3 Capsules': '🐟', 'Mixed Greens Salad': '🥗',
    };

    useEffect(() => {
        api.get(`/diet_plan?injury_type=${encodeURIComponent(injuryType)}`)
            .then(res => setPlan(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [injuryType]);

    const handleImgError = (key) => setImgErrors(prev => ({ ...prev, [key]: true }));

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-electric-cyan font-black">
            LOADING NUTRITIONAL ARCHITECTURE...
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

                {/* ── Main Content ── */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Header card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-10 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 bg-electric-cyan/10 border-b border-l border-electric-cyan/20 text-[10px] font-black text-electric-cyan uppercase tracking-widest">
                            Nutrition_V2.0
                        </div>

                        {/* Injury badge */}
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${injuryMeta.border} ${injuryMeta.bg} mb-6`}>
                            <AlertTriangle size={12} className={injuryMeta.color} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${injuryMeta.color}`}>
                                {plan.injury_type?.toUpperCase() === 'GENERAL' ? 'Standard Prevention' : `${plan.injury_type?.toUpperCase()} Recovery`} — Targeted Nutrition
                            </span>
                        </div>

                        {plan.injury_type?.toUpperCase() === 'GENERAL' && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mb-8 p-4 bg-electric-cyan/5 border border-electric-cyan/20 rounded-2xl flex items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-electric-cyan/10 flex items-center justify-center text-electric-cyan">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">No Active Injury Detected</p>
                                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Run a diagnostic scan for a personalized recovery plan.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/assessment')}
                                    className="px-4 py-2 bg-electric-cyan text-deep-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-cyan-300 transition-all"
                                >
                                    Start Scan
                                </button>
                            </motion.div>
                        )}

                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-3 italic leading-tight">
                            {plan.title}
                        </h1>
                        <p className="text-slate-400 font-bold text-xs mb-10 border-l-2 border-electric-cyan pl-4">
                            {plan.subtitle}
                        </p>

                        {/* Food sections grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {plan.sections.map((section, idx) => {
                                const c = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        className="space-y-3"
                                    >
                                        {/* Section header */}
                                        <h3 className={`${c.title} font-black uppercase text-xs tracking-[0.2em] flex items-center gap-2`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                                            {section.category}
                                        </h3>

                                        {/* Food items */}
                                        <ul className="space-y-2">
                                            {section.items.map((item, i) => {
                                                const imgKey = `${idx}-${i}`;
                                                const hasError = imgErrors[imgKey];
                                                return (
                                                    <li
                                                        key={i}
                                                        className={`flex items-center gap-3 bg-white/5 p-3 rounded-xl border ${c.border} hover:bg-white/10 transition-all`}
                                                    >
                                                        {/* Food image — TheMealDB CDN, falls back to emoji */}
                                                        <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-slate-800">
                                                            {!hasError ? (
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    className="h-full w-full object-cover"
                                                                    onError={() => handleImgError(imgKey)}
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-2xl">
                                                                    {FOOD_EMOJI[item.name] ||
                                                                        FOOD_EMOJI[Object.keys(FOOD_EMOJI).find(k => item.name.toLowerCase().includes(k.toLowerCase()))] ||
                                                                        '🍽️'}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Food name */}
                                                        <span className="text-slate-200 font-semibold text-sm">{item.name}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Hydration */}
                    <div className="glass-card p-6 bg-blue-500/5 border-blue-500/20 flex items-center gap-6">
                        <div className="h-14 w-14 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 shrink-0">
                            <Droplets className="text-blue-400" size={28} />
                        </div>
                        <div>
                            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-1">Hydration Protocol</h4>
                            <p className="text-blue-300 font-bold text-sm">{plan.hydration}</p>
                        </div>
                    </div>
                </div>

                {/* ── Sidebar ── */}
                <div className="space-y-8">
                    <div className="glass-card overflow-hidden border-electric-cyan/20">
                        <img src={plan.image} alt="Diet Plan" className="w-full h-72 object-cover opacity-80" />
                        <div className="p-6">
                            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-2">Visual Reference</h4>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                Standardized portion sizes and macro distribution calibrated by AI Nutrition Engine for your injury type.
                            </p>
                        </div>
                    </div>

                    {/* Critical alert — injury specific */}
                    <div className="glass-card p-6 border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-center gap-2 mb-3">
                            <Flame size={14} className="text-amber-500" />
                            <h4 className="text-amber-500 font-black uppercase text-xs tracking-widest">Critical Alert</h4>
                        </div>
                        <p className="text-slate-400 text-xs font-medium leading-relaxed">{plan.alert}</p>
                    </div>

                    {/* Legend */}
                    <div className="glass-card p-6">
                        <h4 className="text-white font-black uppercase text-xs tracking-widest mb-4">Meal Timing</h4>
                        <div className="space-y-3 text-xs text-slate-500 font-medium">
                            <div className="flex items-start gap-3">
                                <span className="text-electric-cyan font-black shrink-0">Breakfast</span>
                                <span>2h before morning session or 7–9 AM</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-emerald-400 font-black shrink-0">Pre-Train</span>
                                <span>60–90 min before session</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-orange-400 font-black shrink-0">Post-Train</span>
                                <span>Within 30 min of finishing</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-violet-400 font-black shrink-0">Dinner</span>
                                <span>3–4h before sleep for optimal recovery</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DietPlan;
