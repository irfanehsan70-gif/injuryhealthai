import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Activity, Mail, Lock, Loader2, ArrowRight, ShieldCheck, Zap, Target } from 'lucide-react';
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
        <div className="min-h-screen relative overflow-hidden bg-deep-black font-['Outfit']">
            {/* Background Hero */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center scale-105 opacity-50 blur-[1px]"
                    style={{ backgroundImage: 'url("/hero.png")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-deep-black/30 via-deep-black/70 to-deep-black" />
                <div className="absolute inset-0 bg-radial-at-tl from-electric-cyan/10 to-transparent" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-12 lg:py-20 min-h-screen flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-16 lg:mb-24">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-electric-cyan/20 rounded-xl border border-electric-cyan/30">
                            <Activity className="h-6 w-6 text-electric-cyan" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight uppercase italic">InjuryGuard <span className="text-electric-cyan">AI</span></span>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    {/* Left Side: Content */}
                    <div className="space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-electric-cyan font-black text-sm uppercase tracking-[0.4em] mb-6 inline-block border-l-2 border-electric-cyan pl-4">Pro Performance Hub</h2>
                            <h1 className="text-6xl lg:text-8xl font-black text-white leading-tight uppercase tracking-tighter shadow-black">
                                PUSH LIMITS. <br />
                                <span className="text-electric-cyan cyan-glow">BUILD POWER.</span>
                            </h1>
                            <p className="text-slate-400 text-lg lg:text-xl max-w-lg mt-8 font-medium leading-relaxed">
                                Next-generation injury prevention for elite football teams. Predict physiological stress, optimize individual load, and keep your squad game-ready.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {[
                                { icon: ShieldCheck, label: "Injury Risk", sub: "Clinical AI Analytics" },
                                { icon: Zap, label: "Bio-Metrics", sub: "Load Management" },
                                { icon: Target, label: "Optimization", sub: "Tactical Assessment" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + i * 0.1 }}
                                    className="space-y-4"
                                >
                                    <div className="h-12 w-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-electric-cyan shadow-lg shadow-electric-cyan/5">
                                        <item.icon size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black uppercase text-xs tracking-widest leading-none mb-1">{item.label}</h4>
                                        <p className="text-slate-500 text-[10px] uppercase font-black tracking-tighter">{item.sub}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Login Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="glass-card p-10 lg:p-12 max-w-lg mx-auto lg:ml-auto w-full border-t border-l border-white/10 relative"
                    >
                        <div className="absolute top-0 right-10 h-10 w-[1px] bg-gradient-to-b from-electric-cyan to-transparent animate-pulse" />

                        <div className="mb-12 text-center lg:text-left">
                            <h3 className="text-4xl font-black text-white uppercase tracking-tight mb-3">Login</h3>
                            <p className="text-slate-400 text-sm font-black uppercase tracking-[0.2em]">Authorized Access Only</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="flex gap-4 mb-8">
                                {[
                                    { id: 'coach', label: 'Coach', icon: ShieldCheck },
                                    { id: 'player', label: 'Player', icon: Target }
                                ].map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setActiveRole(r.id)}
                                        className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${activeRole === r.id ? 'bg-electric-cyan/10 border-electric-cyan shadow-[0_0_15px_rgba(0,242,255,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/10 opacity-60'}`}
                                    >
                                        <r.icon className={activeRole === r.id ? 'text-electric-cyan' : 'text-slate-500'} size={20} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${activeRole === r.id ? 'text-white' : 'text-slate-500'}`}>{r.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Identity Gateway</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-electric-cyan transition-all" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-deep-black/50 border border-white/10 text-white rounded-2xl py-5 pl-14 pr-4 focus:ring-2 focus:ring-electric-cyan/50 outline-none transition-all font-medium text-lg"
                                        placeholder="stadium@league.ai"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Access Protocol</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-electric-cyan transition-all" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-deep-black/50 border border-white/10 text-white rounded-2xl py-5 pl-14 pr-4 focus:ring-2 focus:ring-electric-cyan/50 outline-none transition-all font-medium text-lg"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-black uppercase tracking-widest text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary flex items-center justify-center gap-4 active:scale-[0.98] group mt-6 h-16 text-lg"
                            >
                                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                                    <>
                                        ACCESS STATION
                                        <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">Protocol v8.4.1</span>
                            <Link
                                to="/register"
                                className="text-electric-cyan text-xs font-black uppercase tracking-widest hover:underline transition-all"
                            >
                                Create Account →
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-electric-cyan/40 to-transparent" />
        </div>
    );
};

export default LoginPage;
