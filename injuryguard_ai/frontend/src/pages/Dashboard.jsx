import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import RiskGauge from '../components/RiskGauge';
import Model3D from '../components/Model3D';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import {
    Target,
    TriangleAlert,
    ShieldCheck,
    Lightbulb,
    ArrowUpRight,
    ClipboardList,
    History,
    Info,
    Zap,
    Users,
    Trophy,
    GraduationCap,
    CheckCircle,
    Apple,
    Dumbbell,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState(location.state?.prediction || null);
    const [input, setInput] = useState(location.state?.input || null);
    const [player, setPlayer] = useState(location.state?.player || null);
    const [playerCount, setPlayerCount] = useState(0);

    useEffect(() => {
        if (!data && user?.role === 'coach') {
            api.get('/players')
                .then(res => setPlayerCount(res.data.length))
                .catch(err => console.error(err));
        }
    }, [data, user]);

    // If no data, show Coach Console / Global Stats
    if (!data) {
        return (
            <div className="space-y-16 pb-20 font-['Outfit']">
                {/* Header */}
                <div className="flex items-center gap-8">
                    <motion.div
                        initial={{ scale: 0, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="h-20 w-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-3xl shadow-primary/5"
                    >
                        <ShieldCheck size={40} />
                    </motion.div>
                    <div>
                        <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">Fleet <span className="text-primary italic">Intelligence</span></h1>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.6em] leading-none mt-2 opacity-60">Operational Protocol 4.2 // {user?.team_name || 'ELITE SQUAD'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {/* Coach Identity Card */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-12 border-l-4 border-l-primary relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform">
                            <GraduationCap size={120} />
                        </div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase mb-5 tracking-[0.4em]">Director of Performance</p>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-3 italic">{user?.name}</h2>
                        <div className="space-y-2 border-t border-white/5 pt-5">
                            <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">{user?.coach_profile?.role_type || 'ELITE STRATEGIST'}</p>
                            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tight italic">LICENSE: {user?.coach_profile?.license || 'PRO'} // PLATFORM AUTHORITY</p>
                        </div>
                    </motion.div>

                    {/* Tactics Card */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-12 border-l-4 border-l-zinc-700 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                            <Trophy size={120} />
                        </div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase mb-5 tracking-[0.4em]">Tactical Philosophy</p>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-3 italic">{user?.coach_profile?.playstyle || 'MODERN'}</h2>
                        <div className="space-y-2 border-t border-white/5 pt-5">
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">STRATEGY: {user?.coach_profile?.playstyle}</p>
                        </div>
                    </motion.div>

                    {/* Squad Strength Card */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-12 border-l-4 border-l-[#FF2E00] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:-rotate-12 transition-transform text-white">
                            <Users size={120} />
                        </div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase mb-5 tracking-[0.4em]">Network Active Units</p>
                        <h2 className="text-7xl font-black text-white uppercase tracking-tighter italic">{playerCount}</h2>
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mt-5">REGISTERED ATHLETE PROFILES</p>
                    </motion.div>
                </div>

                {/* CTA */}
                <div className="flex flex-col items-center justify-center py-16 bg-radial-glow rounded-[4rem]">
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <button
                            onClick={() => navigate('/assessment')}
                            className="btn-premium px-16 py-6"
                        >
                            <Target size={24} />
                            Initiate Intelligence Scan
                        </button>
                    </motion.div>
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] mt-10 opacity-50">Ingesting Biometric data from local squad fleet</p>
                </div>
            </div>
        );
    }

    const chartData = Object.entries(data.prob_breakdown).map(([name, value]) => ({ name, value }));
    const sortedFactors = data.key_factors;

    return (
        <div className="space-y-12 pb-20 font-['Outfit']">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div className="flex items-center gap-8">
                    <motion.div
                        initial={{ scale: 0, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl shadow-primary/10"
                    >
                        <ShieldCheck size={32} />
                    </motion.div>
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Soma <span className="text-primary italic">Diagnostic</span></h1>
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        </div>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] leading-none">{data.player_name || 'Individual Profile'} // {input.Position} // AG-{input.Age} // INTEL-V4</p>
                    </div>
                </div>
                <div className="flex gap-4 flex-wrap">
                    <button
                        onClick={() => {
                            const topInjury = Object.entries(data.prob_breakdown)
                                .sort(([, a], [, b]) => b - a)[0]?.[0] || 'general';
                            navigate('/diet', { state: { injury_type: topInjury } });
                        }}
                        className="btn-outline border-zinc-800 hover:border-primary/50 text-zinc-400 hover:text-white flex items-center gap-2"
                    >
                        <Apple size={16} /> Nutrition Intel
                    </button>
                    <button
                        onClick={() => {
                            const topInjury = Object.entries(data.prob_breakdown)
                                .sort(([, a], [, b]) => b - a)[0]?.[0] || 'general';
                            navigate('/workout', { state: { injury_type: topInjury } });
                        }}
                        className="btn-outline border-zinc-800 hover:border-primary/50 text-zinc-400 hover:text-white flex items-center gap-2"
                    >
                        <Dumbbell size={16} /> Strategy Plan
                    </button>
                    <button
                        onClick={() => navigate('/assessment', { state: { player: player || (data ? { name: data.player_name, profile: input } : null) } })}
                        className="btn-premium px-8"
                    >
                        <RefreshCw size={18} /> Re-Diagnose
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">

                {/* Risk Gauge Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-4 glass-card p-12 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-3xl"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                    <RiskGauge value={data.risk_prob} size={280} color="#FF5F01" />
                    <div className="mt-12 space-y-3">
                        <h3 className={`text-4xl font-black uppercase tracking-tighter italic ${data.risk_label === 'High' ? 'text-red-500' : 'text-primary primary-glow'}`}>
                            {data.risk_label} RISK LEVEL
                        </h3>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">STATION_CONFIDENCE: 94.2%</p>
                    </div>
                </motion.div>

                {/* 3D Model Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-8 glass-card p-0 relative min-h-[550px] overflow-hidden group shadow-3xl"
                >
                    <div className="absolute inset-0 bg-radial-at-c from-primary/5 to-transparent pointer-events-none" />
                    <div className="absolute top-12 left-12 z-10 pointer-events-none">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-3 italic">Anatomical <span className="text-primary italic">Mapping</span></h3>
                        <div className={`p-2 px-5 rounded-2xl text-[10px] font-black uppercase inline-flex items-center gap-4 border ${data.predicted_type !== 'None' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-primary/10 border-primary/30 text-primary'}`}>
                            <div className={`h-2 w-2 rounded-full animate-pulse ${data.predicted_type !== 'None' ? 'bg-red-500 shadow-[0_0_12px_#ef4444]' : 'bg-primary shadow-[0_0_12px_#FF5F01]'}`} />
                            {data.predicted_type !== 'None' ? `CRITICAL ZONE: ${data.predicted_type}` : 'NO ANOMALIES DETECTED'}
                        </div>
                    </div>

                    <Model3D highlightedPart={data.predicted_type} className="w-full h-full scale-110 transition-all duration-1000" />

                    <div className="absolute bottom-12 right-12 text-right font-mono text-[9px] text-zinc-700 font-bold tracking-[0.4em] uppercase opacity-60">
                        ANALYTICS: RF_V4_PRO
                        <br />
                        PROTOCOL: INTEL_MAPPING_2.8
                    </div>
                </motion.div>

                {/* Probability Breakdown Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-6 glass-card p-12 shadow-3xl"
                >
                    <h3 className="text-xl font-black text-white uppercase mb-12 flex items-center gap-4 italic tracking-tight">
                        <Target className="text-primary" size={24} />
                        Probability Spectrum
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 40 }}>
                                <CartesianGrid strokeDasharray="8 8" horizontal={false} stroke="rgba(255,255,255,0.02)" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#555', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    width={100}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.01)' }}
                                    contentStyle={{ background: '#0a0a0a', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={28}>
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.value > 50 ? '#ef4444' : entry.value > 20 ? '#FF5F01' : '#444'}
                                            fillOpacity={0.9}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Feature Importance / Key Factors */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-6 glass-card p-12 shadow-3xl"
                >
                    <h3 className="text-xl font-black text-white uppercase mb-12 flex items-center gap-4 italic tracking-tight">
                        <TriangleAlert className="text-primary" size={24} />
                        Primary Stress Indicators
                    </h3>
                    <div className="space-y-4">
                        {sortedFactors.map((factor, i) => (
                            <div key={i} className="flex items-center justify-between p-6 bg-white/[0.01] rounded-3xl border border-white/5 group hover:border-primary/20 transition-all duration-300">
                                <div className="flex items-center gap-5">
                                    <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                    <span className="text-xs font-black text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">{factor.replace('_', ' ')}</span>
                                </div>
                                <ArrowUpRight className="text-zinc-800 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={20} />
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Recommendations Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-12 glass-card p-12 bg-gradient-to-br from-primary/[0.03] to-transparent border-primary/10 shadow-3xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                        <Zap size={150} className="text-primary" />
                    </div>
                    <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                        <div className="h-32 w-32 rounded-[3.5rem] bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-4xl shadow-primary/5">
                            <Lightbulb className="text-primary h-14 w-14 animate-pulse" />
                        </div>
                        <div className="flex-1 space-y-8 text-center lg:text-left">
                            <div>
                                <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-2">Protocol <span className="text-primary italic">Recommendations</span></h3>
                                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em]">AI-Generated Recovery Framework</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {data.recommendations.map((rec, i) => (
                                    <div key={i} className="flex items-center gap-5 p-6 bg-black/40 rounded-3xl border border-white/5 hover:border-primary/20 transition-all">
                                        <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                            <ShieldCheck className="text-primary" size={18} />
                                        </div>
                                        <p className="text-sm text-zinc-300 font-bold leading-relaxed">"{rec}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default Dashboard;
