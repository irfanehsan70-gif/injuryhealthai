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
    Dumbbell,
    Apple,
    RefreshCw,
    ShieldAlert,
    ArrowUpRight,
    ArrowRight,
    Search,
    Filter,
    LayoutGrid,
    LayoutList,
    Shield
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
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredPlayers = registeredPlayers.filter(p =>
        (p.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (p.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    const pieData = results ? [
        { name: 'Low', value: results.risk_distribution.Low, color: '#FF5F01' },
        { name: 'Medium', value: results.risk_distribution.Medium, color: '#FFC107' },
        { name: 'High', value: results.risk_distribution.High, color: '#ef4444' },
    ] : [];

    return (
        <div className="space-y-16 pb-24 font-['Outfit']">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                <div className="flex items-center gap-8">
                    <div className="h-20 w-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center border border-primary/20 shadow-3xl shadow-primary/5">
                        <Users className="text-primary h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">Squad <span className="text-primary italic">Intelligence</span></h1>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] leading-none mt-2 opacity-60">Fleet Performance Hub // {currentUser?.team_name || 'Global'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Filter Units..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] py-4 pl-14 pr-6 text-zinc-300 font-bold text-xs outline-none focus:border-primary/30 w-[250px] transition-all"
                        />
                    </div>
                    <button className="h-14 w-14 bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] flex items-center justify-center text-zinc-600 hover:text-white transition-all">
                        <Filter size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-14 bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] flex p-1 gap-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`h-full px-4 rounded-2xl flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`h-full px-4 rounded-2xl flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            <LayoutList size={16} />
                        </button>
                    </div>

                    <div className="hidden xl:flex flex-col items-end gap-3 translate-y-[-10px]">
                        <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] italic mb-1">Squad Assignment</p>
                        <div className="h-16 w-16 bg-[#00e6ff] rounded-2xl flex items-center justify-center text-black shadow-[0_0_30px_#00e6ff44]">
                            <div className="flex gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-black" />
                                <span className="h-1.5 w-1.5 rounded-full bg-black" />
                                <span className="h-1.5 w-1.5 rounded-full bg-black" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-[500px] flex flex-col items-center justify-center text-center gap-10"
                    >
                        <div className="relative w-24 h-24">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full shadow-[0_0_30px_#FF5F0133]"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Activity className="text-primary h-10 w-10 animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black text-white uppercase tracking-widest italic">Synchronizing Neural Data...</h3>
                            <p className="text-zinc-600 text-[10px] uppercase font-black tracking-[0.6em] opacity-60">Mapping Biometric Identifiers to Squad Context</p>
                        </div>
                    </motion.div>
                ) : results ? (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                    >
                        {/* Summary Metrics */}
                        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="glass-card p-10 relative overflow-hidden group shadow-3xl">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform">
                                    <TrendingUp size={100} />
                                </div>
                                <h4 className="text-[10px] font-black text-zinc-600 uppercase mb-5 tracking-[0.4em]">Fleet Mean Stress</h4>
                                <div className="flex items-end gap-5">
                                    <h2 className="text-6xl font-black text-primary italic tracking-tighter">{results?.avg_risk?.toFixed(2) || 0}%</h2>
                                    <TrendingUp className="text-primary/40 mb-3" size={32} />
                                </div>
                                <div className="mt-8 flex items-center gap-3">
                                    <div className="h-1 w-1 rounded-full bg-primary animate-pulse shadow-primary" />
                                    <p className="text-[9px] text-zinc-700 uppercase font-black tracking-widest leading-none">SYSTEM.DELTA: +2.1% (30D HISTORY)</p>
                                </div>
                            </div>

                            <div className="glass-card p-10 relative overflow-hidden group shadow-3xl border-t-red-500/20">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                                    <AlertTriangle size={100} />
                                </div>
                                <h4 className="text-[10px] font-black text-zinc-600 uppercase mb-5 tracking-[0.4em]">Critical Anomaly Units</h4>
                                <div className="flex items-end gap-5">
                                    <h2 className="text-6xl font-black text-red-500 italic tracking-tighter">{results?.risk_distribution?.High || 0}</h2>
                                    <ShieldAlert className="text-red-500/40 mb-3 animate-pulse" size={32} />
                                </div>
                                <div className="mt-8">
                                    <span className="text-[9px] text-red-500/60 uppercase font-black tracking-widest bg-red-500/5 py-2 px-4 rounded-xl border border-red-500/10 inline-block">
                                        ACTIONABLE THRESHOLD EXCEEDED
                                    </span>
                                </div>
                            </div>

                            <div className="glass-card p-10 relative overflow-hidden group shadow-3xl">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:-rotate-6 transition-transform">
                                    <CheckCircle2 size={100} />
                                </div>
                                <h4 className="text-[10px] font-black text-zinc-600 uppercase mb-5 tracking-[0.4em]">Overall Squad Health</h4>
                                <div className="flex items-end gap-5">
                                    <h2 className="text-6xl font-black text-emerald-500 italic tracking-tighter">89.4%</h2>
                                    <Shield className="text-emerald-500/40 mb-3" size={32} />
                                </div>
                                <div className="mt-8">
                                    <p className="text-[9px] text-zinc-700 uppercase font-black tracking-widest">CURRENT OPERATIONAL CAPACITY</p>
                                </div>
                            </div>
                        </div>

                        {/* Distribution Chart */}
                        <div className="lg:col-span-12 glass-card p-12 shadow-3xl relative overflow-hidden">
                            <h3 className="text-xl font-black text-white uppercase mb-12 tracking-tighter italic flex items-center gap-5">
                                <Activity className="text-primary" size={24} />
                                Stress Stratification Analysis
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                                <div className="h-[350px] w-full relative">
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={90}
                                                outerRadius={140}
                                                paddingAngle={10}
                                                stroke="none"
                                            >
                                                {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ background: '#0a0a0a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontWeight: 900, textTransform: 'uppercase', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">SQUAD TOTAL</p>
                                        <p className="text-4xl font-black text-white italic">{results?.total_players || 0}</p>
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    {pieData.map(d => (
                                        <div key={d.name} className="flex items-center justify-between p-6 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-white/10 transition-all">
                                            <div className="flex items-center gap-5">
                                                <div className="h-4 w-4 rounded-full shadow-lg" style={{ background: d.color, boxShadow: `0 0 15px ${d.color}44` }} />
                                                <span className="text-xl font-black text-white uppercase italic tracking-tighter">{d.name} Alert Area</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-zinc-400 italic">{d.value}</span>
                                                <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mt-1">PERCENTILE: {Math.round((d.value / (results?.total_players || 1)) * 100)}%</p>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setResults(null)}
                                        className="btn-outline w-full py-5 text-[10px]"
                                    >
                                        Clear Intelligence Forecast
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* High Risk Units List */}
                        <div className="lg:col-span-12 space-y-8">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-5 italic">
                                <UserX size={24} className="text-red-500" />
                                High Variance Personnel
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                { (results?.top_risk_players || []).map((p, i) => (
                                    <div key={i} className="glass-card p-10 relative overflow-hidden group hover:border-red-500/30 transition-all duration-500 shadow-3xl">
                                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform text-red-500">
                                            <ShieldAlert size={60} />
                                        </div>
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-600/20 to-black flex items-center justify-center text-red-500 font-black text-xs border border-red-500/20 shadow-xl">
                                                U-{i + 1}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-red-500 italic leading-none">{p.risk_prob ? p.risk_prob.toFixed(2) : Math.round((1 - (p.Injury_Risk === 0 ? 0.3 : 0.7)) * 100).toFixed(2)}%</p>
                                                <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mt-1">STRESS</p>
                                            </div>
                                        </div>
                                        <h4 className="text-xl font-black text-white uppercase tracking-tighter italic mb-4 group-hover:text-red-400 transition-colors leading-tight">{p.PlayerName || 'Elite Unit Delta'}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="bg-white/5 border border-white/5 px-2 py-1 rounded-md text-[8px] font-black text-zinc-500 uppercase">{p.Position}</span>
                                            <span className="bg-white/5 border border-white/5 px-2 py-1 rounded-md text-[8px] font-black text-zinc-500 uppercase">AGE_{p.Age}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="squad"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-12"
                    >
                        {/* Empty/Roster State */}
                        {filteredPlayers.length === 0 ? (
                            <div className="glass-card min-h-[500px] flex flex-col items-center justify-center text-center p-20 border-zinc-900 border-dashed shadow-3xl">
                                <div className="h-40 w-40 bg-zinc-900 rounded-[3rem] flex items-center justify-center border border-dashed border-zinc-800 mb-10 group relative">
                                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Users className="text-zinc-800 h-20 w-20 relative z-10" />
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase mb-4 tracking-tighter italic">Squad Database <span className="text-primary">Stalled</span></h3>
                                <p className="text-zinc-600 max-w-sm font-bold text-lg leading-relaxed mb-12">No registered athletes found. Inject a roster database or await unit activation.</p>

                                <div className="flex gap-4">
                                    <label className="btn-premium px-12 group cursor-pointer inline-flex items-center gap-3">
                                        <Upload className="group-hover:-translate-y-1 transition-transform" />
                                        Inject Roster CSV
                                        <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                                    </label>
                                    <button className="btn-outline px-10">Manual Entry</button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                <div className="flex items-center gap-4">
                                    <Users className="text-primary" size={20} />
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Active Squad <span className="text-zinc-600 font-mono text-xl">({filteredPlayers.length})</span></h2>
                                </div>
                                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10" : "space-y-6"}>
                                    {filteredPlayers.map((player, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`glass-card relative overflow-hidden group hover:border-primary/40 transition-all duration-700 shadow-3xl ${viewMode === 'list' ? 'p-6 flex items-center justify-between' : 'p-10'}`}
                                        >
                                            {/* Grid View Content */}
                                            {viewMode === 'grid' ? (
                                                <>
                                                    <div className="flex justify-between items-start mb-10">
                                                        <div className="h-16 w-16 bg-zinc-900 rounded-[1.8rem] flex items-center justify-center font-black text-primary text-2xl border border-white/5 transition-all group-hover:border-primary/30 group-hover:shadow-[0_0_20px_#FF5F0122]">
                                                            {player.name?.[0]?.toUpperCase() || 'P'}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest leading-none mb-2">Status</p>
                                                            <div className={`px-3 py-1.5 rounded-xl border text-[9px] font-black tracking-widest uppercase ${player.latest_assessment ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-900 border-white/5 text-zinc-600'}`}>
                                                                {player.latest_assessment ? 'Scanned' : 'Pending'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 mb-10">
                                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic group-hover:text-primary transition-all duration-500">{player.name}</h3>
                                                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">{player.email}</p>
                                                    </div>

                                                    {player.profile && (
                                                        <div className="flex flex-wrap gap-3 mb-12">
                                                            <span className="bg-white/[0.03] px-3 py-1.5 rounded-xl text-[9px] font-black text-zinc-500 border border-white/5 uppercase tracking-widest">{player.profile.position}</span>
                                                            <span className="bg-white/[0.03] px-3 py-1.5 rounded-xl text-[9px] font-black text-zinc-500 border border-white/5 uppercase tracking-widest">AGE_{player.profile.age}</span>
                                                        </div>
                                                    )}

                                                    {player.latest_assessment ? (
                                                        <>
                                                            <div className="grid grid-cols-2 gap-10 mb-8 border-t border-white/5 pt-8">
                                                                <div>
                                                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Current Risk</p>
                                                                    <p className="text-3xl font-black text-red-500 italic tracking-tighter">{player.latest_assessment.result.risk_prob.toFixed(2)}%</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Primary Site</p>
                                                                    <p className="text-xl font-black text-white uppercase tracking-tighter italic">{player.latest_assessment.result.predicted_type || 'None'}</p>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-3">
                                                                <button
                                                                    onClick={() => navigate('/diet', { state: { player, injury_type: player.latest_assessment.result.predicted_type } })}
                                                                    className="flex items-center justify-center gap-2 py-4 bg-[#00f5ab]/10 hover:bg-[#00f5ab]/20 border border-[#00f5ab]/20 rounded-2xl text-[#00f5ab] text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#00f5ab]/5"
                                                                >
                                                                    <Apple size={14} /> DIET
                                                                </button>
                                                                <button
                                                                    onClick={() => navigate('/workout', { state: { player, injury_type: player.latest_assessment.result.predicted_type } })}
                                                                    className="flex items-center justify-center gap-2 py-4 bg-[#ff5f01]/10 hover:bg-[#ff5f01]/20 border border-[#ff5f01]/20 rounded-2xl text-[#ff5f01] text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#ff5f01]/5"
                                                                >
                                                                    <Dumbbell size={14} /> WORKOUT
                                                                </button>
                                                                <button
                                                                    onClick={() => navigate('/dashboard', { state: { prediction: player.latest_assessment.result, input: player.latest_assessment.input, player } })}
                                                                    className="flex items-center justify-center py-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-2xl text-cyan-400 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-cyan-500/5"
                                                                >
                                                                    View Diagnostics
                                                                </button>
                                                                <button
                                                                    onClick={() => navigate('/assessment', { state: { player } })}
                                                                    className="flex items-center justify-center py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-zinc-500 text-[10px] font-black uppercase tracking-widest transition-all"
                                                                >
                                                                    Re-scan
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="pt-8 border-t border-white/5">
                                                            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-6 italic">Awaiting first diagnostic scan...</p>
                                                            <button
                                                                onClick={() => navigate('/assessment', { state: { player } })}
                                                                className="w-full py-5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl"
                                                            >
                                                                Run New Assessment
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                /* List View Content */
                                                <>
                                                    <div className="flex items-center gap-6 flex-1">
                                                        <div className="h-12 w-12 bg-zinc-900 rounded-2xl flex items-center justify-center font-black text-primary border border-white/5">
                                                            {player.name?.[0]?.toUpperCase() || 'P'}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">{player.name}</h3>
                                                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{player.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-12 flex-1">
                                                        <div className="flex gap-4">
                                                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">{player.profile?.position || 'N/A'}</span>
                                                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">AGE_{player.profile?.age || '??'}</span>
                                                        </div>
                                                        <div className={`px-4 py-2 rounded-2xl border text-[10px] font-black tracking-widest uppercase ${player.latest_assessment ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-900 border-white/5 text-zinc-700'}`}>
                                                            {player.latest_assessment ? 'ACTIVE Intel' : 'SCAN PENDING'}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(player.latest_assessment ? '/dashboard' : '/assessment', { state: { player, prediction: player.latest_assessment?.result, input: player.latest_assessment?.input } })}
                                                        className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-zinc-600 hover:text-primary transition-all hover:bg-primary/10 hover:border-primary/20"
                                                    >
                                                        <ArrowUpRight size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Float Action for Roster Upload */}
            {
                !results && registeredPlayers.length > 0 && (
                    <div className="fixed bottom-12 right-12 z-50">
                        <label className="h-20 px-10 bg-primary text-black rounded-[2.5rem] shadow-[0_30px_60px_#FF5F0144] flex items-center gap-4 cursor-pointer hover:scale-105 transition-transform active:scale-95 duration-500 font-black uppercase text-xs tracking-widest italic group">
                            <Upload className="group-hover:-translate-y-1 transition-transform" />
                            Inject Roster Delta
                            <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                        </label>
                    </div>
                )
            }
        </div >
    );
};

export default TeamOverview;
