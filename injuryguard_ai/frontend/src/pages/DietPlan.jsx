import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { Droplets, ArrowLeft, AlertTriangle, Flame, Activity, Utensils, Zap, Clock, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// Injury badge colours — mirrors WorkoutPlan.jsx
const INJURY_META = {
    hamstring: { label: 'Hamstring Recovery', color: 'text-red-500', border: 'border-red-500/20', bg: 'bg-red-500/5' },
    knee: { label: 'Knee & Cartilage', color: 'text-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
    ankle: { label: 'Ankle Ligament', color: 'text-blue-500', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
    groin: { label: 'Groin / Adductor', color: 'text-purple-500', border: 'border-purple-500/20', bg: 'bg-purple-500/5' },
    back: { label: 'Lumbar & Spine', color: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
    muscle: { label: 'Muscle Strain', color: 'text-primary', border: 'border-primary/20', bg: 'bg-primary/5' },
    general: { label: 'General Performance', color: 'text-primary', border: 'border-primary/20', bg: 'bg-primary/5' },
};

// Category accent colours for variety
const CATEGORY_COLORS = [
    { dot: 'bg-primary', title: 'text-primary', border: 'border-primary/10' },
    { dot: 'bg-emerald-500', title: 'text-emerald-500', border: 'border-emerald-500/10' },
    { dot: 'bg-orange-500', title: 'text-orange-500', border: 'border-orange-500/10' },
    { dot: 'bg-violet-500', title: 'text-violet-500', border: 'border-violet-500/10' },
    { dot: 'bg-rose-500', title: 'text-rose-500', border: 'border-rose-500/10' },
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

    // Emoji fallback
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] font-['Outfit'] gap-6">
            <div className="relative w-16 h-16">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-primary/10 border-t-primary rounded-full shadow-[0_0_20px_#FF5F0122]"
                />
                <Utensils className="absolute inset-0 m-auto text-primary h-6 w-6 animate-pulse" />
            </div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] italic">Synthesizing Macro-Architecture...</p>
        </div>
    );

    if (!plan) return <div className="min-h-screen flex items-center justify-center text-white">Error loading nutritional protocol.</div>;

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
                        <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">Nutritional <span className="text-primary italic">Intelligence</span></h1>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] leading-none mt-2 opacity-60">Fleet Biological Support // Optimized Consumption</p>
                    </div>
                </div>

                <div className={`inline-flex items-center gap-4 px-6 py-3 rounded-[1.5rem] border ${injuryMeta.border} ${injuryMeta.bg}`}>
                    <div className={`h-2 w-2 rounded-full ${injuryMeta.color.replace('text', 'bg')} shadow-[0_0_10px_currentColor]`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${injuryMeta.color}`}>
                        {plan.injury_type?.toUpperCase() === 'GENERAL' ? 'Conditioning Target' : `${plan.injury_type?.toUpperCase()} PROTOCOL`}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Intel */}
                <div className="lg:col-span-8 space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-12 lg:p-16 relative overflow-hidden shadow-4xl"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary">
                            <Utensils size={120} />
                        </div>

                        <div className="space-y-4 mb-16 relative z-10">
                            <h2 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter italic leading-none max-w-2xl">{plan.title}</h2>
                            <p className="text-zinc-600 text-lg font-bold italic leading-relaxed max-w-xl opacity-80">{plan.subtitle}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-16 relative z-10">
                            {plan.sections.map((section, idx) => {
                                const c = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                                return (
                                    <div key={idx} className="space-y-8">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                            <h3 className={`${c.title} font-black uppercase text-sm lg:text-base tracking-[0.5em] flex items-center gap-6 italic`}>
                                                <div className={`h-3 w-3 rounded-full ${c.dot} shadow-[0_0_12px_currentColor]`} />
                                                {section.category}
                                            </h3>
                                            <div className="px-4 py-1 bg-white/[0.02] rounded-full border border-white/5">
                                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Phase Control</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {section.items.map((item, i) => {
                                                const imgKey = `${idx}-${i}`;
                                                return (
                                                    <div key={i} className={`flex flex-col gap-6 p-8 bg-zinc-900/40 backdrop-blur-md rounded-[2.5rem] border ${c.border} hover:border-primary/30 transition-all duration-700 group cursor-default shadow-2xl relative overflow-hidden`}>
                                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 blur-[50px] rounded-full group-hover:bg-primary/10 transition-colors" />
                                                        
                                                        <div className="h-56 w-full rounded-[2rem] overflow-hidden border border-white/10 bg-zinc-950 flex items-center justify-center text-6xl group-hover:scale-[1.05] transition-all duration-1000 shadow-2xl relative">
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            {!imgErrors[imgKey] ? (
                                                                <img 
                                                                    src={item.image} 
                                                                    alt={item.name} 
                                                                    className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700" 
                                                                    onError={() => handleImgError(imgKey)} 
                                                                />
                                                            ) : (
                                                                <span className="drop-shadow-2xl">{FOOD_EMOJI[item.name] || '🍽️'}</span>
                                                            )}
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic leading-none">Molecular Target</p>
                                                            </div>
                                                            <h4 className="text-white font-black text-2xl lg:text-3xl uppercase tracking-tighter group-hover:text-primary transition-colors italic leading-[0.9]">{item.name}</h4>
                                                        </div>
                                                        
                                                        <div className="pt-4 mt-auto">
                                                            <div className="h-px w-full bg-gradient-to-r from-white/5 to-transparent mb-4" />
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest italic">Bio-Availability: High</span>
                                                                <Zap size={14} className="text-primary opacity-40" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Hydration Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-10 bg-blue-500/5 border-blue-500/10 flex items-center gap-8 shadow-3xl">
                        <div className="h-20 w-20 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/20 shrink-0 shadow-blue-500/5">
                            <Droplets className="text-blue-500" size={36} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-white font-black uppercase text-xs tracking-widest italic">Phase-Specific Hydration</h4>
                            <p className="text-blue-400 text-lg font-bold italic tracking-tight italic">{plan.hydration}</p>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar Visuals */}
                <div className="lg:col-span-4 space-y-12">
                    <div className="glass-card overflow-hidden shadow-4xl group">
                        <div className="relative h-80 overflow-hidden">
                            <img src={plan.image} alt="Plate" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 opacity-80 group-hover:opacity-100" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                            <div className="absolute bottom-6 left-6 flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Biological Sample_01</span>
                            </div>
                        </div>
                        <div className="p-10 space-y-4">
                            <h4 className="text-white font-black uppercase text-xs tracking-widest italic">Reference Architecture</h4>
                            <p className="text-zinc-700 text-xs font-bold leading-relaxed opacity-80 uppercase tracking-widest">Macro-nutrient dispersion tailored for accelerated kinetic repair. Adhere to volume specifications strictly.</p>
                        </div>
                    </div>

                    {/* Timing Schedule */}
                    <div className="glass-card p-10 space-y-8 shadow-3xl border-primary/5">
                        <h4 className="text-white font-black uppercase text-xs tracking-widest italic flex items-center gap-3">
                            <Clock className="text-primary" size={16} />
                            Chronological Schedule
                        </h4>
                        <div className="space-y-6">
                            {[
                                { t: 'Dawn Phase', d: '7-9 AM: Pre-Kinetic Load', c: 'text-zinc-600' },
                                { t: 'Prime Load', d: '90m Prior: Sustained Energy', c: 'text-primary' },
                                { t: 'Recode Phase', d: 'Inside 30m: Anabolic Window', c: 'text-emerald-500' },
                                { t: 'Rest Cycle', d: '3h Prior: Deep Cycle Repair', c: 'text-zinc-600' }
                            ].map((s, i) => (
                                <div key={i} className="flex gap-6 items-start">
                                    <div className="h-10 w-px bg-zinc-900 relative">
                                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full ${s.c.replace('text', 'bg')}`} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest italic">{s.t}</p>
                                        <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest mt-1">{s.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Alert */}
                    <div className="glass-card p-10 bg-amber-500/5 border-amber-500/10 space-y-4 shadow-3xl">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="text-amber-500" size={24} />
                            <h4 className="text-amber-500 font-black uppercase text-xs tracking-widest italic">Safety Protocol</h4>
                        </div>
                        <p className="text-zinc-600 text-[10px] font-black leading-relaxed uppercase tracking-widest italic opacity-80">{plan.alert}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DietPlan;
