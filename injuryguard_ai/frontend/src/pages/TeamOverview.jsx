import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import {
    Upload,
    Users,
    AlertTriangle,
    TrendingUp,
    FileText,
    Loader2,
    CheckCircle2,
    UserX,
    Activity,
    Zap,
    Dumbbell
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const TeamOverview = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [registeredPlayers, setRegisteredPlayers] = useState([]);

    useEffect(() => {
        api.get('/players')
            .then(res => setRegisteredPlayers(res.data))
            .catch(err => console.error("Error fetching squad:", err));
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        handleUpload(e.target.files[0]);
    };

    const handleUpload = async (fileObj) => {
        if (!fileObj) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('file', fileObj);

        try {
            const response = await api.post('/upload_team', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResults(response.data);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || 'Ensure CSV matches player schema.';
            alert(`Error processing league data: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const pieData = results ? [
        { name: 'Low', value: results.risk_distribution.Low, color: '#00f2ff' },
        { name: 'Medium', value: results.risk_distribution.Medium, color: '#fbbf24' },
        { name: 'High', value: results.risk_distribution.High, color: '#ef4444' },
    ] : [];

    return (
        <div className="space-y-12 pb-16 font-['Outfit']">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-electric-cyan/20 rounded-2xl flex items-center justify-center border border-electric-cyan/30 shadow-[0_0_20px_rgba(0,242,255,0.2)]">
                        <Users className="text-electric-cyan h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Squad <span className="text-electric-cyan cyan-glow">Intelligence</span></h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] leading-none mt-1">Regional Performance Control Hub</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Squad Assignment</p>
                        <div className="bg-electric-cyan px-4 py-2 rounded-xl text-deep-black font-black text-sm tracking-tight shadow-[0_0_15px_rgba(0,242,255,0.3)] border border-electric-cyan/50 uppercase italic">
                            {currentUser?.team_name || '---'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Registered Squad Section (Shown if no CSV results) */}
            {!results && registeredPlayers.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                        <Users className="text-electric-cyan" size={20} />
                        Active Squad <span className="text-slate-600">({registeredPlayers.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {registeredPlayers.map((player, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-card p-6 border-l-2 border-l-electric-cyan group hover:bg-white/[0.03] transition-all"
                            >
                                <div
                                    className="cursor-pointer group/header"
                                    onClick={() => {
                                        if (player.latest_assessment) {
                                            navigate('/dashboard', {
                                                state: {
                                                    prediction: { ...player.latest_assessment.result, player_name: player.name },
                                                    input: player.latest_assessment.input,
                                                    player: player
                                                }
                                            });
                                        } else {
                                            navigate('/assessment', { state: { player } });
                                        }
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-12 w-12 bg-slate-800 rounded-xl flex items-center justify-center font-black text-electric-cyan border border-white/5 transition-all group-hover/header:border-electric-cyan/50 group-hover/header:shadow-[0_0_15px_rgba(0,242,255,0.2)]">
                                            {player.name?.[0]?.toUpperCase() || 'P'}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Status</p>
                                            <p className={`text-[10px] font-black uppercase mt-1 ${player.latest_assessment ? 'text-emerald-400' : 'text-slate-600'}`}>
                                                {player.latest_assessment ? 'SCANNED' : 'PENDING'}
                                            </p>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover/header:text-electric-cyan transition-colors">{player.name}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold mb-4">{player.email}</p>

                                    {player.profile && (
                                        <div className="flex gap-3 mb-6">
                                            <span className="bg-white/5 px-2 py-1 rounded text-[8px] font-black text-slate-400 border border-white/5 uppercase">{player.profile.position}</span>
                                            <span className="bg-white/5 px-2 py-1 rounded text-[8px] font-black text-slate-400 border border-white/5 uppercase">AGE_{player.profile.age}</span>
                                            <span className="bg-white/5 px-2 py-1 rounded text-[8px] font-black text-slate-400 border border-white/5 uppercase">{player.profile.league}</span>
                                        </div>
                                    )}
                                </div>

                                {player.latest_assessment ? (
                                    <div className="border-t border-white/5 pt-4">
                                        <div
                                            onClick={() => navigate('/dashboard', {
                                                state: {
                                                    prediction: { ...player.latest_assessment.result, player_name: player.name },
                                                    input: player.latest_assessment.input,
                                                    player: player
                                                }
                                            })}
                                            className="flex justify-between items-center mb-4 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors group/stats"
                                        >
                                            <div>
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Current Risk</p>
                                                <p className={`text-xl font-black italic ${player.latest_assessment.result.risk_label === 'High' ? 'text-red-500' : 'text-electric-cyan'} group-hover/stats:scale-110 transition-transform origin-left`}>
                                                    {player.latest_assessment.result.risk_prob}%
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Primary Site</p>
                                                <p className="text-[10px] font-black text-white uppercase group-hover/stats:text-electric-cyan transition-colors">{player.latest_assessment.result.predicted_type}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => {
                                                    const topInjury = player.latest_assessment.result.predicted_type || 'general';
                                                    navigate('/diet', { state: { injury_type: topInjury } });
                                                }}
                                                className="flex-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-deep-black py-2 rounded-lg border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1"
                                            >
                                                <Zap size={10} /> DIET
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const topInjury = player.latest_assessment.result.predicted_type || 'general';
                                                    navigate('/workout', { state: { injury_type: topInjury } });
                                                }}
                                                className="flex-1 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-deep-black py-2 rounded-lg border border-orange-500/20 text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1"
                                            >
                                                <Dumbbell size={10} /> WORKOUT
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <button
                                                onClick={() => navigate('/dashboard', {
                                                    state: {
                                                        prediction: { ...player.latest_assessment.result, player_name: player.name },
                                                        input: player.latest_assessment.input,
                                                        player: player
                                                    }
                                                })}
                                                className="bg-electric-cyan/10 hover:bg-electric-cyan text-electric-cyan hover:text-deep-black py-3 rounded-xl border border-electric-cyan/20 hover:border-electric-cyan text-[10px] font-black uppercase tracking-widest transition-all"
                                            >
                                                VIEW DIAGNOSTICS
                                            </button>
                                            <button
                                                onClick={() => navigate('/assessment', { state: { player } })}
                                                className="bg-white/5 hover:bg-white/10 text-slate-400 py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
                                            >
                                                RE-SCAN
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-t border-white/5 pt-4">
                                        <p className="text-[9px] font-black text-slate-600 uppercase italic mb-4">Awaiting first diagnostic scan...</p>
                                        <button
                                            onClick={() => navigate('/assessment', { state: { player } })}
                                            className="w-full bg-white/5 hover:bg-white/10 text-slate-400 py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            RUN NEW ASSESSMENT
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {!results && !loading && registeredPlayers.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card min-h-[500px] flex flex-col items-center justify-center text-center p-20 border-dashed border-electric-cyan/20 shadow-2xl"
                >
                    <div className="h-40 w-40 bg-electric-cyan/5 rounded-[3rem] flex items-center justify-center border border-dashed border-electric-cyan/20 mb-10 relative">
                        <div className="absolute inset-0 bg-electric-cyan/5 blur-3xl animate-pulse" />
                        <Users className="text-electric-cyan/20 h-20 w-20 relative z-10" />
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase mb-4 tracking-tighter italic">Squad Database <span className="text-electric-cyan">Empty</span></h3>
                    <p className="text-slate-500 max-w-md font-medium text-lg leading-relaxed">No registered athletes found. Use the 'Inject Roster' tool to upload local data or wait for players to activate their stations.</p>
                </motion.div>
            )}

            {loading && (
                <div className="h-[500px] flex flex-col items-center justify-center text-center gap-8">
                    <div className="relative w-24 h-24">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-4 border-electric-cyan/20 border-t-electric-cyan rounded-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Activity className="text-electric-cyan h-10 w-10 animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-white uppercase tracking-widest animate-pulse italic">Scanning Roster Database...</h3>
                        <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.5em]">Processing Biometric Identifiers</p>
                    </div>
                </div>
            )}

            {results && !loading && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Key Metrics */}
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-10 border-t-2 border-t-electric-cyan relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:rotate-12 transition-transform">
                                <TrendingUp size={80} />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-[0.3em]">Squad Average Risk</p>
                            <div className="flex items-end gap-4">
                                <h2 className="text-6xl font-black text-electric-cyan italic tracking-tighter cyan-glow">{results.avg_risk}%</h2>
                                <TrendingUp className="text-electric-cyan/50 mb-2" size={32} />
                            </div>
                            <p className="text-[8px] text-slate-600 mt-6 uppercase font-black tracking-widest flex items-center gap-2">
                                <div className="h-1 w-1 rounded-full bg-electric-cyan animate-pulse" />
                                PERFORMANCE DELTA: +2.1% (30D)
                            </p>
                        </motion.div>

                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-10 border-t-2 border-t-red-500 relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                                <AlertTriangle size={80} />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-[0.3em]">Hyper-Critical Units</p>
                            <div className="flex items-end gap-4">
                                <h2 className="text-6xl font-black text-red-500 italic tracking-tighter shadow-red-500/20">{results.risk_distribution.High}</h2>
                                <AlertTriangle className="text-red-500/50 mb-2 animate-bounce" size={32} />
                            </div>
                            <p className="text-[8px] text-red-500/70 mt-6 uppercase font-black tracking-widest bg-red-500/5 py-1 px-3 rounded-full inline-block">
                                IMMEDIATE ACTION REQUIRED
                            </p>
                        </motion.div>

                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-10 border-t-2 border-t-emerald-500 relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:-rotate-6 transition-transform">
                                <CheckCircle2 size={80} />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-[0.3em]">Squad Readiness</p>
                            <div className="flex items-end gap-4">
                                <h2 className="text-6xl font-black text-emerald-500 italic tracking-tighter">89.4%</h2>
                                <CheckCircle2 className="text-emerald-500/50 mb-2" size={32} />
                            </div>
                            <p className="text-[8px] text-slate-600 mt-6 uppercase font-black tracking-widest">CURRENT OPERATIONAL CAPACITY</p>
                        </motion.div>
                    </div>

                    {/* Charts Row */}
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-5 glass-card p-10 flex flex-col items-center justify-center shadow-2xl overflow-hidden relative">
                        <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-electric-cyan/20 to-transparent" />
                        <h3 className="text-xl font-black text-white uppercase self-start mb-12 tracking-tighter italic flex items-center gap-3">
                            <Activity className="text-electric-cyan" size={20} />
                            Risk Stratification
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={8}>
                                        {pieData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#020617', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 900, textTransform: 'uppercase' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-6 justify-center mt-6">
                            {pieData.map(d => (
                                <div key={d.name} className="flex items-center gap-3 bg-white/[0.02] py-2 px-4 rounded-xl border border-white/5">
                                    <div className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: d.color, color: d.color }} />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.name}: {d.value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Top Risk Players */}
                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-7 glass-card p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-red-500/20 to-transparent" />
                        <h3 className="text-xl font-black text-white uppercase mb-12 tracking-tighter flex items-center gap-4 italic">
                            <UserX size={24} className="text-red-500" />
                            Personnel Under Watch
                        </h3>
                        <div className="space-y-5">
                            {results.top_risk_players.map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-red-500/30 transition-all duration-300 group hover:-translate-y-1">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-600/20 to-deep-black flex items-center justify-center text-red-500 font-black text-sm border border-red-500/20 tracking-tighter">
                                            ID-{i + 1}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-white uppercase tracking-tight group-hover:text-red-400 transition-colors italic">{p.PlayerName || 'Elite Unit Delta'}</p>
                                            <div className="flex items-center gap-3 text-[9px] text-slate-500 font-black uppercase mt-2 tracking-widest">
                                                <span className="text-slate-400">{p.Position}</span>
                                                <div className="h-1 w-1 rounded-full bg-slate-800" />
                                                <span className="text-slate-400">{p.League}</span>
                                                <div className="h-1 w-1 rounded-full bg-slate-800" />
                                                <span className="text-slate-400">AGE_{p.Age}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-red-500 italic tracking-tighter">{Math.round((1 - (p.Injury_Risk === 0 ? 0.3 : 0.7)) * 100)}%</p>
                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[.3em] mt-1">Stress Index</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            )}
        </div>
    );

};

export default TeamOverview;
