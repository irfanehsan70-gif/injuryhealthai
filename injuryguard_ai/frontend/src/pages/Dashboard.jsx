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
    CheckCircle
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
            <div className="space-y-12 pb-16 font-['Outfit']">
                {/* Header */}
                <div className="flex items-center gap-6 justify-center text-center">
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="h-20 w-20 rounded-3xl bg-electric-cyan/20 border border-electric-cyan/30 flex items-center justify-center text-electric-cyan shadow-[0_0_30px_rgba(0,242,255,0.2)]"
                    >
                        <ShieldCheck size={48} />
                    </motion.div>
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Station <span className="text-electric-cyan cyan-glow">Command</span></h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] leading-none mt-1">Operational Protocol V4.2 // {user?.team_name || 'GLOBAL SQUAD'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Coach Identity Card */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-10 border-l-4 border-l-electric-cyan relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:rotate-12 transition-transform">
                            <GraduationCap size={100} />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-[0.3em]">Commanding Officer</p>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2 italic shadow-text">{user?.name}</h2>
                        <div className="space-y-1.5 border-t border-white/5 pt-4">
                            <p className="text-[9px] font-black text-electric-cyan uppercase tracking-widest">{user?.coach_profile?.role_type || 'Elite Coach'}</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight italic opacity-60">LICENSE: {user?.coach_profile?.license || 'PRO'} // AG-STATION</p>
                        </div>
                    </motion.div>

                    {/* Tactics Card */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-10 border-l-4 border-l-emerald-500 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform text-emerald-500">
                            <Trophy size={100} />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-[0.3em]">Tactical Strategy</p>
                        <h2 className="text-3xl font-black text-emerald-400 uppercase tracking-tight mb-2 italic shadow-text">{user?.coach_profile?.playstyle || 'Tactical'}</h2>
                        <div className="space-y-1.5 border-t border-white/5 pt-4">
                            <p className="text-[9px] font-black text-emerald-400/70 uppercase tracking-widest">PHILOSOPHY: {user?.coach_profile?.playstyle}</p>
                        </div>
                    </motion.div>

                    {/* Squad Strength Card */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-10 border-l-4 border-l-orange-500 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:-rotate-12 transition-transform text-orange-500">
                            <Users size={100} />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-[0.3em]">Squad Strength</p>
                        <h2 className="text-6xl font-black text-white uppercase tracking-tighter italic shadow-text">{playerCount}</h2>
                        <p className="text-[9px] font-black text-orange-500/70 uppercase tracking-widest mt-4">ACTIVE PROFILES REGISTERED</p>
                    </motion.div>
                </div>

                {/* CTA */}
                <div className="flex flex-col items-center justify-center py-10">
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="mb-8"
                    >
                        <button
                            onClick={() => navigate('/assessment')}
                            className="bg-electric-cyan hover:bg-cyan-400 text-slate-900 font-black px-12 py-5 rounded-2xl shadow-[0_0_40px_rgba(0,242,255,0.4)] transition-all uppercase tracking-[0.2em] italic flex items-center gap-4 group"
                        >
                            <Target className="group-hover:rotate-90 transition-transform" />
                            Initialize New Scan
                        </button>
                    </motion.div>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Ready to ingest biometric data from squad athletes</p>
                </div>
            </div>
        );
    }

    const chartData = Object.entries(data.prob_breakdown).map(([name, value]) => ({ name, value }));
    const sortedFactors = data.key_factors;

    return (
        <div className="space-y-10 pb-16 font-['Outfit']">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-6">
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="h-16 w-16 rounded-2xl bg-electric-cyan/20 border border-electric-cyan/30 flex items-center justify-center text-electric-cyan shadow-[0_0_20px_rgba(0,242,255,0.2)]"
                    >
                        <ShieldCheck size={36} />
                    </motion.div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Diagnostic <span className="text-electric-cyan cyan-glow">Report</span></h1>
                            <div className="h-2 w-2 rounded-full bg-electric-cyan animate-pulse mt-1" />
                        </div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] leading-none">{data.player_name || 'Individual Profile'} // {input.Position} // AG-{input.Age} // LOAD-V2</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            const topInjury = Object.entries(data.prob_breakdown)
                                .sort(([, a], [, b]) => b - a)[0]?.[0] || 'general';
                            navigate('/diet', { state: { injury_type: topInjury } });
                        }}
                        className="flex items-center gap-2 text-emerald-400 font-black text-[10px] bg-emerald-500/10 px-6 py-4 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-deep-black transition-all uppercase tracking-widest"
                    >
                        <Zap size={14} />
                        Diet Plan
                    </button>
                    <button
                        onClick={() => {
                            // Pass the top predicted injury type so WorkoutPlan serves injury-specific exercises
                            const topInjury = Object.entries(data.prob_breakdown)
                                .sort(([, a], [, b]) => b - a)[0]?.[0] || 'general';
                            navigate('/workout', { state: { injury_type: topInjury } });
                        }}
                        className="flex items-center gap-2 text-orange-400 font-black text-[10px] bg-orange-500/10 px-6 py-4 rounded-2xl border border-orange-500/20 hover:bg-orange-500 hover:text-deep-black transition-all uppercase tracking-widest"
                    >
                        <Zap size={14} />
                        Workout Plan
                    </button>
                    <button
                        onClick={() => navigate('/assessment', { state: { player: player || (data ? { name: data.player_name, profile: input } : null) } })}
                        className="flex items-center gap-3 text-white font-black text-[10px] bg-white/5 px-6 py-4 rounded-2xl border border-white/10 hover:bg-electric-cyan hover:text-deep-black hover:border-electric-cyan transition-all uppercase tracking-widest shadow-xl group"
                    >
                        <ClipboardList size={18} className="group-hover:scale-110 transition-transform" />
                        RE-INITIALIZE
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                {/* Risk Gauge Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-4 glass-card p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-2xl"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-electric-cyan/40 to-transparent" />
                    <RiskGauge value={data.risk_prob} size={260} />
                    <div className="mt-8 space-y-2">
                        <h3 className={`text-3xl font-black uppercase tracking-tighter italic ${data.risk_label === 'High' ? 'text-red-500' : 'text-electric-cyan cyan-glow'}`}>
                            {data.risk_label} RISK STATUS
                        </h3>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">STATION_CONFIDENCE: 94.2%</p>
                    </div>
                    <div className="absolute top-6 right-6 text-white/5 group-hover:text-electric-cyan/10 transition-colors">
                        <Info size={48} />
                    </div>
                </motion.div>

                {/* 3D Model Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-8 glass-card p-0 relative min-h-[500px] border-white/5 overflow-hidden group shadow-2xl"
                >
                    <div className="absolute inset-0 bg-radial-at-c from-electric-cyan/5 to-transparent pointer-events-none" />
                    <div className="absolute top-10 left-10 z-10 pointer-events-none">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 italic">Anatomical <span className="text-electric-cyan">Engine</span></h3>
                        <div className={`p-1.5 px-4 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-3 border ${data.predicted_type !== 'None' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-electric-cyan/10 border-electric-cyan/30 text-electric-cyan'}`}>
                            <div className={`h-2 w-2 rounded-full animate-pulse ${data.predicted_type !== 'None' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-electric-cyan shadow-[0_0_8px_#00f2ff]'}`} />
                            {data.predicted_type !== 'None' ? `CRITICAL SITE: ${data.predicted_type}` : 'NO ANOMALIES DETECTED'}
                        </div>
                    </div>

                    <Model3D highlightedPart={data.predicted_type} className="w-full h-full scale-110" />

                    <div className="absolute bottom-10 right-10 text-right font-mono text-[9px] text-slate-600 font-bold tracking-widest uppercase">
                        ANALYTICS: RF_V4_STABLE
                        <br />
                        PROTOCOL: ANAT_MAPPING_2.4
                    </div>
                </motion.div>

                {/* Probability Breakdown Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-6 glass-card p-10 border-white/5 shadow-2xl"
                >
                    <h3 className="text-xl font-black text-white uppercase mb-10 flex items-center gap-3 italic">
                        <Target className="text-electric-cyan" />
                        Probability Breakdown
                    </h3>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                                <CartesianGrid strokeDasharray="5 5" horizontal={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}
                                    width={90}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ background: '#020617', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.value > 50 ? '#ef4444' : entry.value > 20 ? '#fbbf24' : '#00f2ff'}
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
                    className="lg:col-span-6 glass-card p-10 border-white/5 shadow-2xl"
                >
                    <h3 className="text-xl font-black text-white uppercase mb-10 flex items-center gap-3 italic">
                        <TriangleAlert className="text-yellow-500" />
                        Key Stress Indicators
                    </h3>
                    <div className="space-y-5">
                        {sortedFactors.map((factor, i) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-white/[0.02] rounded-2xl border border-white/5 group hover:border-electric-cyan/30 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="h-2 w-2 rounded-full bg-electric-cyan shadow-[0_0_10px_#00f2ff]" />
                                    <span className="text-xs font-black text-slate-300 uppercase tracking-widest group-hover:text-electric-cyan transition-colors">{factor.replace('_', ' ')}</span>
                                </div>
                                <ArrowUpRight className="text-slate-700 group-hover:text-electric-cyan group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={20} />
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Recommendations Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-12 glass-card p-10 bg-gradient-to-br from-electric-cyan/[0.02] to-blue-500/[0.02] border-electric-cyan/10 shadow-3xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <Zap size={120} className="text-electric-cyan" />
                    </div>
                    <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
                        <div className="h-28 w-28 rounded-[2.5rem] bg-electric-cyan/10 flex items-center justify-center shrink-0 border border-electric-cyan/20 shadow-2xl shadow-electric-cyan/10">
                            <Lightbulb className="text-electric-cyan h-12 w-12 animate-pulse" />
                        </div>
                        <div className="flex-1 space-y-6 text-center lg:text-left">
                            <div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-1">Station <span className="text-electric-cyan">Recommendations</span></h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">AI-Generated Protocol for Rapid Recovery</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {data.recommendations.map((rec, i) => (
                                    <div key={i} className="flex items-center gap-4 p-5 bg-deep-black/60 rounded-2xl border border-white/5 hover:border-electric-cyan/20 transition-all">
                                        <div className="h-8 w-8 rounded-lg bg-electric-cyan/20 flex items-center justify-center shrink-0">
                                            <ShieldCheck className="text-electric-cyan" size={16} />
                                        </div>
                                        <p className="text-sm text-slate-300 font-bold leading-relaxed tracking-tight">"{rec}"</p>
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
