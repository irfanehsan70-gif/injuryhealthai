import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { ShieldCheck, UserPlus, X, Check, Users, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';

const VerificationPage = () => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await api.get('/admin/pending_players');
            setPending(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (email, action) => {
        setActionLoading(email);
        try {
            await api.post('/admin/verify_player', { email, action });
            setPending(prev => prev.filter(p => p.email !== email));
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505] font-['Outfit']">
                <Loader2 className="animate-spin text-primary h-12 w-12" />
            </div>
        );
    }

    return (
        <div className="space-y-16 pb-20 font-['Outfit']">
            {/* Header */}
            <div className="flex items-center gap-8">
                <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="h-20 w-20 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-3xl shadow-primary/10"
                >
                    <ShieldCheck size={40} />
                </motion.div>
                <div>
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">Player <span className="text-primary italic">Verification</span></h1>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.6em] leading-none mt-2 opacity-60">Neural Authorization Level 4 // Access Control</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-8">
                    {pending.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-20 flex flex-col items-center justify-center text-center space-y-8 border-dashed border-zinc-900"
                        >
                            <div className="h-20 w-20 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-700">
                                <Users size={40} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Clear Queue</h3>
                                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mt-2">All units authorized</p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            {pending.map((p, i) => (
                                <motion.div
                                    key={p.email}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card p-8 flex items-center justify-between group hover:bg-white/[0.02] transition-all"
                                >
                                    <div className="flex items-center gap-8">
                                        <div className="h-16 w-16 rounded-3xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:scale-110 transition-transform">
                                            <UserPlus size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black text-white uppercase tracking-tight italic leading-none">{p.name}</h4>
                                            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mt-2">{p.email} // {p.team_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleAction(p.email, 'reject')}
                                            disabled={actionLoading === p.email}
                                            className="h-12 w-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/5 group"
                                        >
                                            <X size={20} className="group-hover:rotate-90 transition-transform" />
                                        </button>
                                        <button
                                            onClick={() => handleAction(p.email, 'approve')}
                                            disabled={actionLoading === p.email}
                                            className="h-12 px-8 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 hover:bg-primary hover:text-black transition-all font-black text-[10px] tracking-widest uppercase italic shadow-xl shadow-primary/5 gap-3"
                                        >
                                            {actionLoading === p.email ? <Loader2 className="animate-spin" size={16} /> : (
                                                <>
                                                    Authorize <Check size={16} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-10">
                    <div className="glass-card p-10 space-y-6 bg-primary/5 border-primary/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                            <ShieldAlert size={100} className="text-primary" />
                        </div>
                        <h4 className="text-white font-black uppercase text-xs tracking-[0.3em] flex items-center gap-4 italic leading-none">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            Security Directive
                        </h4>
                        <p className="text-zinc-600 text-[10px] font-black leading-relaxed uppercase tracking-widest italic">
                            Authorization requests are generated upon player registration. Admins must verify identity and team affiliation before granting access to neural intelligence data.
                        </p>
                    </div>

                    <div className="glass-card p-10 bg-zinc-900/50 border-white/5 space-y-6">
                        <h4 className="text-white font-black uppercase text-xs tracking-[0.3em] italic">Current Queue</h4>
                        <div className="flex items-end justify-between">
                            <span className="text-6xl font-black text-white italic">{pending.length}</span>
                            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-3 italic">Pending Units</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationPage;
