import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    TrendingUp,
    ShieldCheck,
    Clock,
    Zap,
    Target,
    Trophy,
    Apple,
    Dumbbell,
    ShieldAlert,
    ArrowRight,
    ArrowUpRight,
    Shield,
    Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import RiskGauge from '../components/RiskGauge';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const PlayerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/player/assessments');
            setAssessments(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const latest = assessments[0];
    const riskTrend = [...assessments].reverse().map(a => ({
        date: new Date(a.timestamp).toLocaleDateString(),
        risk: a.risk_prob
    }));

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="h-12 w-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-16 pb-24 font-['Outfit']">
            {/* Header / Intro */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-5"
                    >
                        <div className="h-20 w-20 rounded-[2.2rem] bg-gradient-to-br from-primary to-[#FF2E00] flex items-center justify-center text-black font-black text-2xl shadow-3xl shadow-primary/10 transition-transform hover:scale-105">
                            {user?.name?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <div>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] mb-2 opacity-60">Elite Athlete Profile</p>
                            <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">Welcome, <span className="text-primary italic">{user?.name?.split(' ')[0]}</span></h1>
                        </div>
                    </motion.div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/assessment')}
                        className="btn-premium px-12 group"
                    >
                        <Zap className="group-hover:rotate-12 transition-transform" />
                        Start Daily Scan
                    </button>
                    <button className="btn-outline border-zinc-900 text-zinc-400 hover:text-white flex items-center gap-2">
                        <Settings size={18} /> Settings
                    </button>
                </div>
            </div>

            {/* Top Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                <MetricCard
                    label="Current Risk Index"
                    value={latest?.risk_prob !== undefined ? `${latest.risk_prob.toFixed(2)}%` : '0.00%'}
                    subLabel={latest?.risk_label || 'NOT SCANNED'}
                    icon={Activity}
                    color={latest?.risk_prob > 50 ? '#ef4444' : '#FF5F01'}
                />
                <MetricCard
                    label="Last Intelligence Scan"
                    value={latest ? new Date(latest.timestamp).toLocaleDateString() : 'N/A'}
                    subLabel="SOMA-PROTOCOL V4"
                    icon={Clock}
                    color="#444"
                />
                <MetricCard
                    label="Total Diagnostic Runs"
                    value={assessments.length}
                    subLabel="FULL SQUAD HISTORY"
                    icon={Target}
                    color="#FF5F01"
                />
                <MetricCard
                    label="Performance Threshold"
                    value="98.2"
                    subLabel="ELITE STATUS"
                    icon={Trophy}
                    color="#FFC107"
                />
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column: Intelligence Summary */}
                <div className="lg:col-span-12 space-y-10">
                    <div className="flex border-b border-white/5 gap-12 overflow-x-auto no-scrollbar">
                        {['overview', 'history', 'intelligence'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-6 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-primary' : 'text-zinc-600 hover:text-white'}`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_15px_#FF5F01]" />
                                )}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                            >
                                {/* Trend Chart */}
                                <div className="lg:col-span-8 glass-card p-12 shadow-3xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.01] text-primary">
                                        <TrendingUp size={200} />
                                    </div>
                                    <h3 className="text-xl font-black text-white uppercase mb-12 flex items-center gap-4 italic z-10 relative">
                                        <TrendingUp className="text-primary" size={24} />
                                        Risk Propensity Timeline
                                    </h3>
                                    <div className="h-[350px] w-full z-10 relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={riskTrend}>
                                                <defs>
                                                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#FF5F01" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#FF5F01" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="rgba(255,255,255,0.02)" />
                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#444', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}
                                                />
                                                <YAxis hide domain={[0, 100]} />
                                                <Tooltip
                                                    contentStyle={{ background: '#0a0a0a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontWeight: 'bold' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="risk"
                                                    stroke="#FF5F01"
                                                    strokeWidth={4}
                                                    fillOpacity={1}
                                                    fill="url(#colorRisk)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Detailed Scan Quick Look */}
                                <div className="lg:col-span-4 space-y-10">
                                    <div className="glass-card p-10 shadow-3xl relative overflow-hidden group flex flex-col items-center justify-center min-h-[450px]">
                                        <div className="absolute top-8 left-10 opacity-30">
                                            <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em] italic leading-none">Scanning...</p>
                                        </div>
                                        
                                        <RiskGauge value={latest?.risk_prob || 0} size={280} />
                                        
                                        {latest ? (
                                            <div className="mt-12 w-full space-y-6">
                                                <div className="flex items-center justify-center gap-4 py-4 bg-primary/5 rounded-2xl border border-primary/10">
                                                    <Shield size={18} className="text-primary" />
                                                    <span className="text-xs font-black text-white uppercase italic tracking-tighter">{latest.predicted_type} DETECTED</span>
                                                </div>
                                                <p className="text-[9px] font-bold text-zinc-600 text-center uppercase tracking-widest leading-relaxed">Neural model recommends immediate protocol engagement to mitigate high-delta variance.</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-center opacity-40 grayscale">
                                                <Target className="text-zinc-800 mb-5" size={40} />
                                                <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">AWAITING INITIAL SCAN</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="glass-card p-10 bg-primary shadow-4xl shadow-primary/10 relative overflow-hidden group cursor-pointer" onClick={() => navigate('/workout')}>
                                         <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform text-white">
                                            <Dumbbell size={120} />
                                        </div>
                                        <h3 className="text-[10px] font-black text-black/40 uppercase tracking-[0.4em] mb-4">Neural Override</h3>
                                        <h2 className="text-4xl font-black text-black uppercase tracking-tighter italic leading-none">Execute <br/>Protocol</h2>
                                        <p className="text-[9px] font-black text-black/60 uppercase tracking-widest mt-12 flex items-center gap-3">
                                            SYNC SHIELD KINETICS <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'history' && (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                {assessments.map((a, i) => (
                                    <div key={i} className="glass-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-primary/30 transition-all duration-500 shadow-xl">
                                        <div className="flex items-center gap-8">
                                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border ${a.risk_prob > 50 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                                                <ShieldCheck size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-zinc-600 uppercase tracking-widest leading-none mb-2">{new Date(a.timestamp).toLocaleDateString()} // {new Date(a.timestamp).toLocaleTimeString()}</p>
                                                <h4 className="text-xl font-black text-white uppercase tracking-tighter italic">Anomaly: {a.predicted_type}</h4>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-12">
                                            <div className="text-right">
                                                <p className={`text-3xl font-black italic tracking-tighter leading-none ${a.risk_prob > 50 ? 'text-red-500' : 'text-primary'}`}>{(a.risk_prob || 0).toFixed(2)}%</p>
                                                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mt-1">RISK INDEX</p>
                                            </div>
                                            <button
                                                onClick={() => navigate('/dashboard', { state: { prediction: a, input: a.input_data, player: { name: user.name, profile: a.input_data } } })}
                                                className="h-14 w-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-zinc-600 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all shadow-lg"
                                            >
                                                <ArrowUpRight size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'intelligence' && (
                            <motion.div
                                key="intelligence"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                            >
                                <div className="glass-card p-10 shadow-3xl">
                                    <Apple className="text-primary mb-8" size={32} />
                                    <h4 className="text-xl font-black text-white uppercase tracking-tighter italic mb-3">Biological Fuel</h4>
                                    <p className="text-zinc-500 text-sm font-bold leading-relaxed mb-8">Personalized nutrition matrices designed for rapid muscle restoration and ATP synthesis.</p>
                                    <button onClick={() => navigate('/diet')} className="btn-outline w-full py-4 text-[10px]">Access Bio-Vault</button>
                                </div>
                                <div className="glass-card p-10 shadow-3xl">
                                    <Dumbbell className="text-zinc-400 mb-8" size={32} />
                                    <h4 className="text-xl font-black text-white uppercase tracking-tighter italic mb-3">Kinetic Forge</h4>
                                    <p className="text-zinc-500 text-sm font-bold leading-relaxed mb-8">Strategic movement patterns to reinforce connective tissue and prevent load-bearing anomalies.</p>
                                    <button onClick={() => navigate('/workout')} className="btn-outline w-full py-4 text-[10px]">Open Forge Control</button>
                                </div>
                                <div className="glass-card p-10 shadow-3xl">
                                    <ShieldAlert className="text-zinc-700 mb-8" size={32} />
                                    <h4 className="text-xl font-black text-white uppercase tracking-tighter italic mb-3">ML Forensics</h4>
                                    <p className="text-zinc-500 text-sm font-bold leading-relaxed mb-8">Deep analysis of random forest vectors and feature importance weightings for your profile.</p>
                                    <button onClick={() => navigate('/models')} className="btn-outline w-full py-4 text-[10px]">Launch Forensics</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, subLabel, icon: Icon, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-card p-10 relative overflow-hidden group shadow-3xl"
    >
        <div className="absolute top-0 left-0 w-full h-1 opacity-20" style={{ background: color }} />
        <div className="flex justify-between items-start mb-8">
            <div className="h-12 w-12 rounded-2xl bg-white/[0.03] flex items-center justify-center text-zinc-600 group-hover:text-white transition-colors border border-white/5">
                <Icon size={20} />
            </div>
            <div className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em]">{subLabel}</div>
        </div>
        <div>
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{label}</h4>
            <div className="text-4xl font-black italic tracking-tighter leading-none" style={{ color: value === '0%' ? '#333' : color === '#444' ? '#fff' : color }}>
                {value}
            </div>
        </div>
    </motion.div>
);

export default PlayerDashboard;
