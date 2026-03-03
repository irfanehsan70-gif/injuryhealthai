import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Activity, Mail, Lock, Loader2, ArrowRight, ShieldCheck, Zap, Target, ShieldAlert, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [activeRole, setActiveRole] = useState('coach');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/login', { email, password });
            login(response.data.user, response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#050505] font-['Outfit']">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full opacity-50" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full opacity-30" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
            </div>

            <div className="relative z-10 container mx-auto px-8 py-12 lg:py-16 min-h-screen flex flex-col">
                {/* Brand */}
                <div className="flex justify-between items-center mb-16 lg:mb-12">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-3xl shadow-primary/5 group-hover:scale-110 transition-transform">
                            <Activity className="h-8 w-8 text-primary shadow-glow" />
                        </div>
                        <span className="text-3xl font-black text-white tracking-tighter uppercase italic">InjuryGuard <span className="text-primary italic">AI</span></span>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
                    {/* Left: Narrative */}
                    <div className="space-y-16">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        >
                            <div className="inline-flex items-center gap-4 bg-primary/5 border border-primary/10 px-5 py-2 rounded-full mb-10">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#FF5F01]" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Neural Network Active</span>
                            </div>

                            <h1 className="text-7xl lg:text-9xl font-black text-white leading-[0.85] uppercase tracking-tighter italic">
                                LEAVE NO <br />
                                <span className="text-primary italic">CHANCE.</span>
                            </h1>

                            <p className="text-zinc-500 text-xl max-w-lg mt-12 font-bold leading-relaxed opacity-70">
                                Elite performance diagnostic system for the modern era. We synthesize millions of data points to ensure your squad stays at peak kinetic capacity.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {[
                                { icon: ShieldCheck, label: "Pro-Scan", sub: "Clinical Diagnostics" },
                                { icon: Zap, label: "Bio-Feed", sub: "Telemetry Intake" },
                                { icon: Cpu, label: "Neural Core", sub: "Decision Support" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                    className="space-y-5 group"
                                >
                                    <div className="h-14 w-14 bg-zinc-900 rounded-[1.8rem] border border-white/5 flex items-center justify-center text-zinc-600 group-hover:text-primary group-hover:border-primary/20 transition-all shadow-xl">
                                        <item.icon size={28} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black uppercase text-xs tracking-widest leading-none mb-2 italic">{item.label}</h4>
                                        <p className="text-zinc-700 text-[9px] uppercase font-black tracking-widest leading-none">{item.sub}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Auth Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="glass-card p-12 lg:p-16 max-w-xl mx-auto lg:ml-auto w-full shadow-4xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                        <div className="mb-16 text-center lg:text-left flex justify-between items-end">
                            <div>
                                <h3 className="text-5xl font-black text-white uppercase tracking-tighter italic mb-2">Gate <span className="text-primary italic">Access</span></h3>
                                <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em]">PROTOCOL_V4.0 // ENCRYPTED</p>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-10">
                            <div className="flex gap-4 p-1 bg-black/40 rounded-[2rem] border border-white/5">
                                {[
                                    { id: 'coach', label: 'COACH', icon: ShieldCheck },
                                    { id: 'player', label: 'PLAYER', icon: Target }
                                ].map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setActiveRole(r.id)}
                                        className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.8rem] transition-all duration-500 font-black text-xs tracking-widest ${activeRole === r.id ? 'bg-primary text-black shadow-3xl shadow-primary/20 italic' : 'text-zinc-700 hover:text-zinc-500 hover:bg-white/5'}`}
                                    >
                                        <r.icon size={18} />
                                        {r.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] ml-2">Identity Channel</label>
                                <div className="relative group">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within:text-primary transition-all" size={20} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 text-white rounded-3xl py-6 pl-16 pr-6 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-xl placeholder:text-zinc-900"
                                        placeholder="stadium@fleet.ai"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] ml-2">Secure Key</label>
                                <div className="relative group">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within:text-primary transition-all" size={20} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 text-white rounded-3xl py-6 pl-16 pr-6 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-xl placeholder:text-zinc-900"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-5 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center"
                                >
                                    <ShieldAlert className="inline-block mr-2" size={14} /> {error}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-premium w-full py-8 text-xl shadow-4xl shadow-primary/20 group"
                            >
                                {loading ? <Loader2 className="animate-spin h-8 w-8 mx-auto" /> : (
                                    <>
                                        INITIALIZE SESSION
                                        <ArrowRight className="h-6 w-6 group-hover:translate-x-3 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-16 pt-10 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[10px] text-zinc-800 font-black uppercase tracking-[0.3em]">Build ID: 8.4.1-AURA</span>
                            <Link
                                to="/register"
                                className="text-primary text-xs font-black uppercase tracking-widest hover:primary-glow transition-all italic border-b border-primary/20 pb-1"
                            >
                                Construct Feed →
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
