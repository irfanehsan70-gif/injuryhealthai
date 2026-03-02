import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, BarChart, Bar, PieChart, Pie
} from 'recharts';
import {
    User, ShieldCheck, ShieldAlert, Zap, Target, Activity,
    Calendar, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
    Clock, ClipboardList, Apple, Dumbbell, ChevronRight, Loader2,
    Award, BarChart2, RefreshCw, ArrowUpRight, MapPin, Flag, Trophy
} from 'lucide-react';
import RiskGauge from '../components/RiskGauge';

// ─── Helpers ──────────────────────────────────────────────────────────────
const riskColor = (label) => {
    if (label === 'High') return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400', hex: '#ef4444' };
    if (label === 'Medium') return { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-400', hex: '#fbbf24' };
    return { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', dot: 'bg-cyan-400', hex: '#00f2ff' };
};

const fmtDate = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

// ─── Sub-components ────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = 'cyan' }) => {
    const colors = {
        cyan: 'text-electric-cyan bg-electric-cyan/10 border-electric-cyan/20 shadow-electric-cyan/5',
        red: 'text-red-400 bg-red-500/10 border-red-500/20 shadow-red-500/5',
        yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20 shadow-yellow-500/5',
        green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5',
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 flex items-center gap-5 border border-white/5 hover:border-white/10 transition-all group"
        >
            <div className={`h-14 w-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg ${colors[color]}`}>
                <Icon size={24} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-2xl font-black text-white leading-none">{value}</p>
                {sub && <p className="text-[10px] text-slate-500 mt-1 font-bold truncate">{sub}</p>}
            </div>
        </motion.div>
    );
};

const RiskBadge = ({ label }) => {
    const c = riskColor(label);
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${c.text} ${c.bg} border ${c.border}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
            {label}
        </span>
    );
};

// ─── Custom Tooltip for chart ──────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        const v = payload[0].value;
        const lbl = v > 60 ? 'High' : v > 30 ? 'Medium' : 'Low';
        const c = riskColor(lbl);
        return (
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl font-['Outfit']">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">{label}</p>
                <p className={`text-xl font-black ${c.text}`}>{v}%</p>
                <RiskBadge label={lbl} />
            </div>
        );
    }
    return null;
};

// ─── Main Component ─────────────────────────────────────────────────────────
const PlayerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'history'

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get('/player_profile');
            setProfile(data);
        } catch (err) {
            setError('Could not load your profile. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []);

    // ── Loading ───────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
                <div className="relative h-20 w-20">
                    <div className="absolute inset-0 border-4 border-electric-cyan/20 border-t-electric-cyan rounded-full animate-spin" />
                    <div className="absolute inset-3 border-2 border-electric-cyan/10 border-b-electric-cyan rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Loading Player Profile…</p>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <AlertTriangle className="h-16 w-16 text-red-500 opacity-60" />
                <p className="text-red-400 font-black uppercase text-sm tracking-widest">{error}</p>
                <button onClick={fetchProfile} className="btn-primary flex items-center gap-3 px-8 py-4">
                    <RefreshCw size={16} /> Retry
                </button>
            </div>
        );
    }

    const { stats, history, risk_trend, latest } = profile || {};
    const latestResult = latest?.result;
    const latestInput = latest?.input;
    const latestRiskC = latestResult ? riskColor(latestResult.risk_label) : riskColor('Low');
    const hasHistory = history?.length > 0;

    // risk trend formatted for recharts
    const trendData = (risk_trend || []).map((r, i) => ({
        idx: i + 1,
        date: r.date,
        risk: r.risk,
        label: r.label,
        injury: r.injury_type,
        name: r.player_name,
    }));

    // injury type pie data
    const injuryFreq = {};
    (history || []).forEach(h => {
        const t = h.result?.predicted_type;
        if (t && t !== 'None') injuryFreq[t] = (injuryFreq[t] || 0) + 1;
    });
    const pieData = Object.entries(injuryFreq).map(([name, value]) => ({ name, value }));
    const PIE_COLORS = ['#ef4444', '#fbbf24', '#00f2ff', '#8b5cf6', '#10b981', '#f97316'];

    return (
        <div className="space-y-10 pb-20 font-['Outfit']">

            {/* ══ HEADER ══════════════════════════════════════════════════════ */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    {/* Avatar */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="h-16 w-16 rounded-2xl bg-gradient-to-br from-electric-cyan to-blue-600 flex items-center justify-center text-2xl font-black text-deep-black shadow-2xl shadow-electric-cyan/20 shrink-0"
                    >
                        {(profile?.user?.name || user?.name || 'P')[0].toUpperCase()}
                    </motion.div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic">
                                {profile?.user?.name || user?.name || 'Pro Athlete'}
                            </h1>
                            <span className="text-[9px] font-black uppercase tracking-widest text-electric-cyan bg-electric-cyan/10 border border-electric-cyan/20 px-2.5 py-1 rounded-lg">
                                {profile?.user?.role || 'player'}
                            </span>
                        </div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-3">
                            {profile?.user?.email} · Member since {profile?.user?.created_at ? fmtDate(profile.user.created_at) : 'N/A'}
                        </p>

                        {/* Athlete Badges */}
                        {profile?.user?.profile && (
                            <div className="flex flex-wrap gap-2">
                                {profile.user.profile.club && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                        <Trophy size={12} className="text-electric-cyan" />
                                        {profile.user.profile.club}
                                    </span>
                                )}
                                {profile.user.profile.nationality && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                        <Flag size={12} className="text-electric-cyan" />
                                        {profile.user.profile.nationality}
                                    </span>
                                )}
                                {profile.user.profile.jersey_number && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                        <span className="text-electric-cyan">#</span>
                                        {profile.user.profile.jersey_number}
                                    </span>
                                )}
                                {profile.user.profile.position && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-electric-cyan/10 border border-electric-cyan/20 rounded-full text-[10px] font-black text-electric-cyan uppercase tracking-widest">
                                        {profile.user.profile.position}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => navigate('/assessment')}
                        className="flex items-center gap-2 text-white font-black text-[10px] bg-electric-cyan hover:bg-cyan-300 text-deep-black px-6 py-3 rounded-2xl transition-all uppercase tracking-widest shadow-xl shadow-electric-cyan/20"
                    >
                        <ClipboardList size={16} /> New Scan
                    </button>
                    {latestResult && (
                        <>
                            <button
                                onClick={() => navigate('/diet', { state: { injury_type: latestResult.predicted_type || 'general' } })}
                                className="flex items-center gap-2 text-emerald-400 font-black text-[10px] bg-emerald-500/10 px-5 py-3 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-deep-black transition-all uppercase tracking-widest"
                            >
                                <Apple size={14} /> Diet Plan
                            </button>
                            <button
                                onClick={() => navigate('/workout', { state: { injury_type: latestResult.predicted_type || 'general' } })}
                                className="flex items-center gap-2 text-orange-400 font-black text-[10px] bg-orange-500/10 px-5 py-3 rounded-2xl border border-orange-500/20 hover:bg-orange-500 hover:text-deep-black transition-all uppercase tracking-widest"
                            >
                                <Dumbbell size={14} /> Workout
                            </button>
                        </>
                    )}
                    <button onClick={fetchProfile} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* ══ STAT CARDS ══════════════════════════════════════════════════ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard icon={BarChart2} label="Total Scans" value={stats?.total_scans ?? 0} sub="Lifetime assessments" color="cyan" />
                <StatCard icon={Activity} label="Avg Risk" value={`${stats?.avg_risk ?? 0}%`} sub="Across all assessments" color={stats?.avg_risk > 60 ? 'red' : stats?.avg_risk > 30 ? 'yellow' : 'green'} />
                <StatCard icon={TrendingUp} label="Peak Risk" value={`${stats?.highest_risk ?? 0}%`} sub="Highest recorded scan" color="red" />
                <StatCard icon={Award} label="Best Reading" value={`${stats?.lowest_risk !== undefined && stats.total_scans > 0 ? stats.lowest_risk : '—'}%`} sub="Lowest recorded risk" color="green" />
            </div>

            {/* ══ TAB NAVIGATION ══════════════════════════════════════════════ */}
            <div className="flex gap-2 border-b border-white/5 pb-0">
                {['overview', 'history'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-t-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                            ? 'bg-electric-cyan/10 text-electric-cyan border border-b-0 border-electric-cyan/20'
                            : 'text-slate-500 hover:text-white'
                            }`}
                    >
                        {tab === 'overview' ? '⚡ Overview' : '📋 Scan History'}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">

                {/* ══ OVERVIEW TAB ═══════════════════════════════════════════ */}
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        {/* ── Athlete Profile Summary (New) ── */}
                        {profile?.user?.profile && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                            >
                                {[
                                    { label: 'Height', value: profile.user.profile.height_cm ? `${profile.user.profile.height_cm} cm` : '—', icon: TrendingUp },
                                    { label: 'Weight', value: profile.user.profile.weight_kg ? `${profile.user.profile.weight_kg} kg` : '—', icon: Activity },
                                    { label: 'Age', value: profile.user.profile.age ? `${profile.user.profile.age} YRS` : '—', icon: Calendar },
                                    { label: 'League', value: profile.user.profile.league || '—', icon: Trophy },
                                ].map((item, i) => (
                                    <div key={i} className="glass-card p-4 border-white/5 flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500">
                                            <item.icon size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                                            <p className="text-sm font-black text-white">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {!hasHistory ? (
                            /* ── No data yet ── */
                            <div className="flex flex-col items-center justify-center py-24 gap-6 text-center glass-card">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="p-8 bg-white/5 rounded-full border border-white/10"
                                >
                                    <Target className="h-16 w-16 text-slate-500" />
                                </motion.div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase mb-2">No Scans Yet</h2>
                                    <p className="text-slate-400 max-w-sm text-sm">Run your first diagnostic scan to see your personal injury risk profile and body analytics.</p>
                                </div>
                                <button
                                    onClick={() => navigate('/assessment')}
                                    className="flex items-center gap-2 bg-electric-cyan text-deep-black font-black px-8 py-4 rounded-2xl shadow-xl shadow-electric-cyan/20 hover:bg-cyan-300 transition-all uppercase tracking-widest"
                                >
                                    <ClipboardList size={18} /> Start First Scan
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                                {/* ── Latest Risk Gauge ── */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="lg:col-span-4 glass-card p-8 flex flex-col items-center text-center border-white/5 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-electric-cyan/40 to-transparent" />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Latest Risk Score</p>
                                    <RiskGauge value={latestResult?.risk_prob || 0} size={200} />
                                    <div className="mt-6 space-y-2">
                                        <h3 className={`text-2xl font-black uppercase tracking-tighter italic ${latestRiskC.text}`}>
                                            {latestResult?.risk_label || '—'} RISK
                                        </h3>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                            {latestResult?.predicted_type && latestResult.predicted_type !== 'None'
                                                ? `⚠ ${latestResult.predicted_type} Injury Risk`
                                                : '✓ No Specific Injury Zone'}
                                        </p>
                                        <p className="text-slate-600 text-[9px] uppercase tracking-widest">
                                            {latest?.timestamp ? fmtDate(latest.timestamp) + ' · ' + fmtTime(latest.timestamp) : ''}
                                        </p>
                                    </div>

                                    {/* Risk distribution bar */}
                                    <div className="mt-8 w-full space-y-3 border-t border-white/5 pt-6">
                                        {[
                                            { label: 'High Risk', count: stats?.high_risk_scans, color: 'bg-red-500' },
                                            { label: 'Medium Risk', count: stats?.medium_risk_scans, color: 'bg-yellow-400' },
                                            { label: 'Low Risk', count: stats?.low_risk_scans, color: 'bg-cyan-400' },
                                        ].map(({ label, count, color }) => (
                                            <div key={label} className="flex items-center gap-3">
                                                <div className={`h-2 w-2 rounded-full shrink-0 ${color}`} />
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex-1 text-left">{label}</span>
                                                <span className="text-xs font-black text-white">{count}</span>
                                                <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${color}`}
                                                        style={{ width: stats?.total_scans ? `${(count / stats.total_scans) * 100}%` : '0%' }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* ── Risk Trend Chart ── */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="lg:col-span-8 glass-card p-8 border-white/5"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-lg font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                                            <TrendingUp className="text-electric-cyan" size={20} />
                                            Risk Trend Over Time
                                        </h3>
                                        <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{trendData.length} points</span>
                                    </div>
                                    {trendData.length > 1 ? (
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={trendData}>
                                                    <defs>
                                                        <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#00f2ff" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                                    <XAxis
                                                        dataKey="date"
                                                        tick={{ fill: '#475569', fontSize: 9, fontWeight: 900 }}
                                                        axisLine={false}
                                                        tickLine={false}
                                                    />
                                                    <YAxis
                                                        domain={[0, 100]}
                                                        tick={{ fill: '#475569', fontSize: 9, fontWeight: 900 }}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tickFormatter={v => `${v}%`}
                                                    />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    {/* danger zone */}
                                                    <Area type="monotone" dataKey={() => 60} stroke="none" fill="rgba(239,68,68,0.04)" />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="risk"
                                                        stroke="#00f2ff"
                                                        strokeWidth={2.5}
                                                        fill="url(#riskGrad)"
                                                        dot={{ fill: '#00f2ff', r: 4, strokeWidth: 0 }}
                                                        activeDot={{ r: 7, fill: '#00f2ff', stroke: '#020617', strokeWidth: 3 }}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                                            Run at least 2 scans to see your risk trend.
                                        </div>
                                    )}
                                </motion.div>

                                {/* ── Latest Recommendations ── */}
                                {latestResult?.recommendations?.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="lg:col-span-7 glass-card p-8 border-white/5 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-5">
                                            <Zap size={80} className="text-electric-cyan" />
                                        </div>
                                        <h3 className="text-lg font-black text-white uppercase mb-6 flex items-center gap-3 italic">
                                            <ShieldCheck className="text-electric-cyan" size={20} />
                                            Latest AI Recommendations
                                        </h3>
                                        <div className="space-y-3">
                                            {latestResult.recommendations.map((rec, i) => (
                                                <div key={i} className="flex items-center gap-4 p-4 bg-deep-black/60 rounded-2xl border border-white/5 hover:border-electric-cyan/20 transition-all">
                                                    <div className="h-7 w-7 rounded-lg bg-electric-cyan/20 flex items-center justify-center shrink-0">
                                                        <CheckCircle className="text-electric-cyan" size={14} />
                                                    </div>
                                                    <p className="text-sm text-slate-300 font-bold leading-relaxed">{rec}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── Injury Type Breakdown ── */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className={`${latestResult?.recommendations?.length > 0 ? 'lg:col-span-5' : 'lg:col-span-6'} glass-card p-8 border-white/5`}
                                >
                                    <h3 className="text-lg font-black text-white uppercase mb-6 flex items-center gap-3 italic">
                                        <AlertTriangle className="text-yellow-400" size={20} />
                                        Injury Type Frequency
                                    </h3>
                                    {pieData.length > 0 ? (
                                        <div className="flex items-center gap-6">
                                            <div className="h-40 w-40 shrink-0">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={pieData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={35}
                                                            outerRadius={65}
                                                            paddingAngle={3}
                                                            dataKey="value"
                                                        >
                                                            {pieData.map((_, index) => (
                                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontFamily: 'Outfit', fontWeight: 900 }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="flex-1 space-y-2.5">
                                                {pieData.map((entry, i) => (
                                                    <div key={entry.name} className="flex items-center gap-3">
                                                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex-1">{entry.name}</span>
                                                        <span className="text-xs font-black text-white">{entry.value}×</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-40 flex items-center justify-center">
                                            <p className="text-slate-600 text-sm text-center">No specific injury zones detected across your scans.</p>
                                        </div>
                                    )}
                                </motion.div>

                                {/* ── Medical Status Summary (New) ── */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                    className="lg:col-span-12 glass-card p-8 border-white/5 bg-gradient-to-br from-red-500/[0.02] to-transparent"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                                                <ShieldAlert size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-1">Clinical Injury Summary</h3>
                                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Historical Vulnerability Assessment</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Primary Zone</p>
                                                <p className="text-sm font-black text-red-400 uppercase">{stats?.most_common_injury || 'None Detected'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Risk Severity</p>
                                                <p className={`text-sm font-black uppercase ${stats?.avg_risk > 60 ? 'text-red-400' : stats?.avg_risk > 30 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                                                    {stats?.avg_risk > 60 ? 'Critical' : stats?.avg_risk > 30 ? 'Elevated' : 'Sub-Clinical'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Prior Episodes</p>
                                                <p className="text-sm font-black text-white">{profile?.user?.profile?.previous_injuries || 0} Incident(s)</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Assessment Count</p>
                                                <p className="text-sm font-black text-white">{stats?.total_scans || 0} Scans</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* ── Latest Input Details ── */}
                                {latestInput && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="lg:col-span-12 glass-card p-8 border-white/5"
                                    >
                                        <h3 className="text-lg font-black text-white uppercase mb-6 flex items-center gap-3 italic">
                                            <User className="text-electric-cyan" size={20} />
                                            Latest Assessment Details
                                            <span className="text-[9px] text-slate-600 font-normal ml-auto">{fmtDate(latest?.timestamp)}</span>
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                            {[
                                                { label: 'Position', value: latestInput?.Position || latestInput?.position || '—' },
                                                { label: 'Age', value: latestInput?.Age ?? latestInput?.age ?? '—' },
                                                { label: 'Seasons Played', value: latestInput?.Seasons_Played ?? latestInput?.seasons_played ?? '—' },
                                                { label: 'Matches / Season', value: latestInput?.Matches_Per_Season ?? latestInput?.matches_per_season ?? '—' },
                                                { label: 'Prev. Injuries', value: latestInput?.Previous_Injuries ?? latestInput?.previous_injuries ?? '—' },
                                                { label: 'Fatigue Index', value: latestInput?.Fatigue_Index ?? latestInput?.fatigue_index ?? '—' },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="p-5 bg-white/[0.02] rounded-2xl border border-white/5 text-center hover:border-electric-cyan/20 transition-all">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
                                                    <p className="text-xl font-black text-white">{value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ══ HISTORY TAB ════════════════════════════════════════════ */}
                {activeTab === 'history' && (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {!hasHistory ? (
                            <div className="glass-card p-16 flex flex-col items-center text-center gap-6">
                                <Clock className="h-16 w-16 text-slate-600" />
                                <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No scan history yet.</p>
                                <button onClick={() => navigate('/assessment')} className="btn-primary flex items-center gap-2 px-8 py-4">
                                    <ClipboardList size={16} /> Run First Scan
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{history.length} scans found</p>
                                </div>
                                <div className="space-y-3">
                                    {history.map((scan, i) => {
                                        const res = scan.result;
                                        const c = riskColor(res?.risk_label);
                                        return (
                                            <motion.div
                                                key={scan._id || i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                className={`glass-card p-5 border ${c.border} bg-gradient-to-r from-transparent to-transparent hover:to-white/[0.01] transition-all group cursor-pointer`}
                                                onClick={() => {
                                                    // navigate to dashboard with this scan's data
                                                    navigate('/dashboard', {
                                                        state: { prediction: res, input: scan.input }
                                                    });
                                                }}
                                            >
                                                <div className="flex items-center gap-5">
                                                    {/* Index */}
                                                    <div className={`h-10 w-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
                                                        <span className={`text-xs font-black ${c.text}`}>#{history.length - i}</span>
                                                    </div>

                                                    {/* Player name + date */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black text-white truncate">{scan.player_name || 'Self Assessment'}</p>
                                                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-0.5">
                                                            {fmtDate(scan.timestamp)} · {fmtTime(scan.timestamp)}
                                                        </p>
                                                    </div>

                                                    {/* Injury type */}
                                                    <div className="hidden sm:block">
                                                        <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Injury Zone</p>
                                                        <p className="text-xs font-black text-white">{res?.predicted_type || '—'}</p>
                                                    </div>

                                                    {/* Risk */}
                                                    <div className="text-right">
                                                        <p className={`text-2xl font-black ${c.text}`}>{res?.risk_prob ?? '—'}%</p>
                                                        <RiskBadge label={res?.risk_label} />
                                                    </div>

                                                    {/* Arrow */}
                                                    <ChevronRight className="text-slate-600 group-hover:text-electric-cyan group-hover:translate-x-1 transition-all shrink-0" size={20} />
                                                </div>

                                                {/* Risk bar */}
                                                <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${res?.risk_prob > 60 ? 'bg-red-500' : res?.risk_prob > 30 ? 'bg-yellow-400' : 'bg-cyan-400'}`}
                                                        style={{ width: `${res?.risk_prob || 0}%` }}
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
};

export default PlayerDashboard;
