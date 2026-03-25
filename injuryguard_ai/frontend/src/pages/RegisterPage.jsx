import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Mail, Lock, Loader2, ArrowRight, ArrowLeft,
    ShieldCheck, Zap, Target, User, Users, MapPin,
    Calendar, TrendingUp, Dumbbell, AlertTriangle, CheckCircle,
    ShieldAlert, BrainCircuit, Cpu, Trophy
} from 'lucide-react';

// ─── Reusable Field ──────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, children }) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] ml-2">{label}</label>
        <div className="relative group">
            {Icon && (
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-10">
                    <Icon className="h-5 w-5 text-zinc-800 group-focus-within:text-primary transition-all" />
                </div>
            )}
            {children}
        </div>
    </div>
);

const inputCls = (hasIcon = true) =>
    `w-full bg-black/40 border border-white/5 text-white rounded-[1.8rem] py-5 ${hasIcon ? 'pl-16' : 'pl-6'} pr-6 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-lg placeholder:text-zinc-900`;

const selectCls = `w-full bg-black/40 border border-white/5 text-white rounded-[1.8rem] py-5 pl-6 pr-10 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-lg appearance-none cursor-pointer`;

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepBar = ({ step, total, labels }) => (
    <div className="mb-12">
        <div className="flex items-center gap-0 mb-6">
            {Array.from({ length: total }).map((_, i) => (
                <React.Fragment key={i}>
                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-xs font-black border transition-all shrink-0 ${i < step ? 'bg-primary border-primary text-black shadow-3xl shadow-primary/20' :
                        i === step ? 'bg-primary/10 border-primary/40 text-primary' :
                            'bg-zinc-900 border-white/5 text-zinc-700'
                        }`}>
                        {i < step ? <CheckCircle size={18} /> : i + 1}
                    </div>
                    {i < total - 1 && (
                        <div className={`flex-1 h-[1px] mx-2 transition-all ${i < step ? 'bg-primary shadow-[0_0_10px_#FF5F01]' : 'bg-white/5'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] italic">{labels[step]}</p>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const RegisterPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 0: Account
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [role, setRole] = useState('player');
    const [teamName, setTeamName] = useState('');
    const [adminClearance, setAdminClearance] = useState('Level 4 - Fleet Commander');

    // Step 1: Player profile
    const [profile, setProfile] = useState({
        league: 'Premier League',
        position: 'Midfielder',
        age: '',
        seasons_played: '',
        matches_per_season: '',
        minutes_per_season: '',
        high_speed_runs: '',
        previous_injuries: '0',
        recurrence_flag: '0',
        fatigue_index: '1.0',
        jersey_number: '',
        nationality: '',
        club: '',
        height_cm: '',
        weight_kg: '',
        dominant_side: 'R'
    });

    // Step 1: Coach profile
    const [coachProfile, setCoachProfile] = useState({
        license: 'UEFA Pro',
        experience: '',
        playstyle: 'Possession-Based',
        role_type: 'Head Coach',
        previous_clubs: '',
    });

    const set = (key) => (e) => setProfile(prev => ({ ...prev, [key]: e.target.value }));
    const setCoach = (key) => (e) => setCoachProfile(prev => ({ ...prev, [key]: e.target.value }));

    const STEPS = (role === 'coach' || role === 'admin') ? ['Account Credentials', 'Professional Profile', 'Review & Deploy'] : ['Account Credentials', 'Biometric Profile', 'Review & Deploy'];

    const validateStep0 = () => {
        if (!name.trim()) { setError('Unit name required.'); return false; }
        if (!email.trim()) { setError('Intelligence channel (email) required.'); return false; }
        if (!/\S+@\S+\.\S+/.test(email)) { setError('Invalid intelligence channel.'); return false; }
        if (password.length < 6) { setError('Access key too short (min 6).'); return false; }
        if (password !== confirm) { setError('Key mismatch detected.'); return false; }
        if (!teamName.trim()) { setError('Fleet name (team) required.'); return false; }
        return true;
    };

    const validateStep1 = () => {
        if (role === 'player') {
            if (!profile.age || isNaN(profile.age) || +profile.age < 12 || +profile.age > 60) { setError('Identify valid age threshold.'); return false; }
            if (!profile.seasons_played || isNaN(profile.seasons_played)) { setError('Service duration required.'); return false; }
        } else if (role === 'coach') {
            if (!coachProfile.experience) { setError('Professional tenure required.'); return false; }
        } else if (role === 'admin') {
            if (!adminClearance) { setError('Clearance protocol required.'); return false; }
        }
        return true;
    };

    const goNext = () => {
        setError('');
        if (step === 0 && !validateStep0()) return;
        if (step === 1 && !validateStep1()) return;
        setStep(s => s + 1);
    };

    const goBack = () => {
        setError('');
        setStep(s => s - 1);
    };

    const handleSubmit = async () => {
        setError('');
        setLoading(true);
        try {
            await api.post('/register', {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                role,
                team_name: teamName.trim(),
                profile: role === 'player' ? { ...profile, age: +profile.age, seasons_played: +profile.seasons_played, matches_per_season: +profile.matches_per_season } : null,
                coach_profile: (role === 'coach' || role === 'admin') ? { ...coachProfile, clearance: adminClearance } : null
            });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Synchronization failed.');
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#050505] font-['Outfit']">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full opacity-40" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full opacity-20" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col">
                <nav className="flex items-center justify-between px-10 py-8 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-3xl shadow-primary/5 text-primary">
                            <Activity size={24} />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tighter uppercase italic">InjuryGuard <span className="text-primary italic">AI</span></span>
                    </div>
                    <Link to="/login" className="text-[10px] font-black text-zinc-700 hover:text-primary uppercase tracking-[0.4em] transition-all flex items-center gap-3">
                        <ArrowLeft size={16} /> REVERT TO LOGON
                    </Link>
                </nav>

                <div className="flex-1 flex items-center justify-center px-8 py-16">
                    <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[1fr_550px] gap-24 items-start">

                        {/* Narrative Column */}
                        <div className="hidden lg:block space-y-16 pt-12">
                            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
                                <div className="inline-flex items-center gap-4 bg-primary/5 border border-primary/10 px-5 py-2 rounded-full mb-10">
                                    <Cpu className="text-primary" size={14} />
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Unit Registration Protocol</span>
                                </div>
                                <h1 className="text-7xl font-black text-white leading-[0.85] uppercase tracking-tighter italic shadow-black mb-10">
                                    {step === 0 && <>CONSTRUCT <br /><span className="text-primary italic">IDENTITY.</span></>}
                                    {step === 1 && <>CALIBRATE <br /><span className="text-primary italic">PROFILE.</span></>}
                                    {step === 2 && <>DEPLOY <br /><span className="text-primary italic">ASSET.</span></>}
                                    {step === 3 && <>STATION <br /><span className="text-primary italic">ACTIVE.</span></>}
                                </h1>
                                <p className="text-zinc-500 text-xl max-w-lg font-bold leading-relaxed opacity-70">
                                    {step === 0 && 'Define your access point and role within the Fleet Intelligence Network.'}
                                    {step === 1 && (role === 'coach' ? 'Establishing clinical and tactical credentials for station command.' : 'Inputting biological parameters for neural risk forecasting.')}
                                    {step === 2 && 'Verify all biometric and tactical indicators before finalizing system integration.'}
                                    {step === 3 && 'Your node is now synchronized with the primary intelligence core.'}
                                </p>
                            </motion.div>

                            {/* Value Props */}
                            {step < 3 && (
                                <div className="grid grid-cols-1 gap-6">
                                    {[
                                        { icon: ShieldCheck, label: 'Neural Risk Model', desc: 'Personalized forecasting matrices' },
                                        { icon: Target, label: 'Precision Training', desc: 'Tactical load management' },
                                        { icon: BrainCircuit, label: 'Bio-Feed AI', desc: 'Real-time physiological audit' }
                                    ].map((f, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                                            className="flex items-center gap-6 p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 group hover:border-primary/20 transition-all">
                                            <div className="h-14 w-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-700 group-hover:text-primary transition-colors">
                                                <f.icon size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white uppercase tracking-widest italic">{f.label}</p>
                                                <p className="text-[9px] text-zinc-700 uppercase font-black tracking-widest mt-1">{f.desc}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Registration Card Column */}
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-12 lg:p-16 border border-white/5 relative shadow-4xl overflow-hidden"
                        >
                            <div className="absolute top-0 right-12 h-12 w-[1px] bg-gradient-to-b from-primary to-transparent animate-pulse" />

                            {step === 3 ? (
                                <div className="py-12 flex flex-col items-center text-center gap-10">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                                        className="h-28 w-28 rounded-[2.5rem] bg-primary/10 border border-primary text-primary flex items-center justify-center shadow-3xl shadow-primary/20"
                                    >
                                        <ShieldCheck size={48} />
                                    </motion.div>
                                    <div className="space-y-4">
                                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">Integration <span className="text-primary italic">Successful</span></h3>
                                        <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest max-w-sm">Your unit station for <span className="text-primary italic">"{teamName}"</span> has been successfully initialized in the network.</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="btn-premium w-full py-8 text-lg"
                                    >
                                        Launch Command Station <ArrowRight size={20} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <StepBar step={step} total={3} labels={STEPS} />

                                    {/* Step 0: Account */}
                                    {step === 0 && (
                                        <div className="space-y-8">
                                            <div className="flex gap-4 p-1 bg-black/40 rounded-[2rem] border border-white/5 mb-8">
                                                {[
                                                    { id: 'player', label: 'ATHLETE', icon: User },
                                                    { id: 'coach', label: 'STRATEGIST', icon: Users },
                                                    { id: 'admin', label: 'ADMIN', icon: ShieldCheck },
                                                ].map(r => (
                                                    <button
                                                        key={r.id}
                                                        type="button"
                                                        onClick={() => setRole(r.id)}
                                                        className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.8rem] transition-all duration-500 font-black text-[10px] tracking-widest ${role === r.id ? 'bg-primary text-black shadow-3xl shadow-primary/20 italic' : 'text-zinc-700 hover:text-zinc-500 hover:bg-white/5'}`}
                                                    >
                                                        <r.icon size={16} />
                                                        {r.label}
                                                    </button>
                                                ))}
                                            </div>

                                            <Field label="Unit Full Name" icon={User}>
                                                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls()} placeholder="Enter Name..." />
                                            </Field>
                                            <Field label="Intelligence Channel" icon={Mail}>
                                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls()} placeholder="email@fleet.ai" />
                                            </Field>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Field label="Access Key" icon={Lock}>
                                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls()} placeholder="••••••" />
                                                </Field>
                                                <Field label="Verify Key" icon={Lock}>
                                                    <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className={inputCls()} placeholder="••••••" />
                                                </Field>
                                            </div>
                                            <Field label="Fleet Hub Name" icon={Trophy}>
                                                <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} className={inputCls()} placeholder="e.g. Squad Elite" />
                                            </Field>
                                        </div>
                                    )}

                                    {/* Step 1: Profile */}
                                    {step === 1 && (
                                        role === 'coach' ? (
                                            <div className="space-y-8">
                                                <Field label="Strategic Role" icon={Zap}>
                                                    <select value={coachProfile.role_type} onChange={setCoach('role_type')} className={selectCls}>
                                                        {['Head Coach', 'Assistant Coach', 'Physiotherapist', 'Technical Analyst'].map(r => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                </Field>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Field label="Tenure (Years)" icon={TrendingUp}>
                                                        <input type="number" value={coachProfile.experience} onChange={setCoach('experience')} className={inputCls()} placeholder="10" />
                                                    </Field>
                                                    <Field label="License Level" icon={ShieldCheck}>
                                                        <select value={coachProfile.license} onChange={setCoach('license')} className={selectCls}>
                                                            {['UEFA Pro', 'UEFA A', 'National Pro', 'None'].map(l => <option key={l} value={l}>{l}</option>)}
                                                        </select>
                                                    </Field>
                                                </div>
                                                <Field label="Tactical Philosophy" icon={Target}>
                                                    <select value={coachProfile.playstyle} onChange={setCoach('playstyle')} className={selectCls}>
                                                        {['Possession-Based', 'High Press', 'Defensive', 'Counter-Attack'].map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </Field>
                                            </div>
                                        ) : role === 'admin' ? (
                                            <div className="space-y-8">
                                                <div className="p-10 bg-primary/5 border border-primary/20 rounded-[2.5rem] flex flex-col items-center text-center gap-6">
                                                    <ShieldCheck className="text-primary" size={48} />
                                                    <div>
                                                        <p className="text-white font-black uppercase tracking-widest italic text-lg">Team Administrator</p>
                                                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] mt-2">Full control over squad data & unit management for "{teamName || 'the fleet'}".</p>
                                                    </div>
                                                </div>
                                                <Field label="Admin Clearance" icon={ShieldAlert}>
                                                    <select 
                                                        value={adminClearance} 
                                                        onChange={(e) => setAdminClearance(e.target.value)} 
                                                        className={selectCls}
                                                    >
                                                        <option value="Level 4 - Fleet Commander">Level 4 - Fleet Commander</option>
                                                        <option value="Level 3 - Station Admin">Level 3 - Station Admin</option>
                                                    </select>
                                                </Field>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Field label="Club/Sub-Fleet">
                                                        <input type="text" value={profile.club} onChange={set('club')} className={inputCls(false)} placeholder="Man United" />
                                                    </Field>
                                                    <Field label="Jersey / ID">
                                                        <input type="number" value={profile.jersey_number} onChange={set('jersey_number')} className={inputCls(false)} placeholder="10" />
                                                    </Field>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Field label="Chronological Age" icon={Calendar}>
                                                        <input type="number" value={profile.age} onChange={set('age')} className={inputCls()} placeholder="24" />
                                                    </Field>
                                                    <Field label="Service Years" icon={TrendingUp}>
                                                        <input type="number" value={profile.seasons_played} onChange={set('seasons_played')} className={inputCls()} placeholder="5" />
                                                    </Field>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Field label="Tactical Site">
                                                        <select value={profile.position} onChange={set('position')} className={selectCls}>
                                                            {['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].map(p => <option key={p} value={p}>{p}</option>)}
                                                        </select>
                                                    </Field>
                                                    <Field label="Competition">
                                                        <select value={profile.league} onChange={set('league')} className={selectCls}>
                                                            {['Premier League', 'La Liga', 'Serie A', 'Ligue 1', 'Other'].map(l => <option key={l} value={l}>{l}</option>)}
                                                        </select>
                                                    </Field>
                                                </div>
                                                <Field label="Kinetic Intensity (Matches/Season)" icon={Dumbbell}>
                                                    <input type="number" value={profile.matches_per_season} onChange={set('matches_per_season')} className={inputCls()} placeholder="30" />
                                                </Field>
                                            </div>
                                        )
                                    )}

                                    {/* Step 2: Review */}
                                    {step === 2 && (
                                        <div className="space-y-6">
                                            <div className="p-8 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Core Identity</p>
                                                <div className="flex justify-between items-center text-sm font-bold">
                                                    <span className="text-zinc-700 uppercase tracking-widest text-[10px]">Name</span>
                                                    <span className="text-white uppercase italic">{name}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm font-bold">
                                                    <span className="text-zinc-700 uppercase tracking-widest text-[10px]">Fleet</span>
                                                    <span className="text-white uppercase italic">{teamName}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm font-bold">
                                                    <span className="text-zinc-700 uppercase tracking-widest text-[10px]">Role</span>
                                                    <span className="text-primary uppercase italic">{role}</span>
                                                </div>
                                            </div>

                                            <div className="p-8 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Profile Metadata</p>
                                                {role === 'player' ? (
                                                    <>
                                                        <div className="flex justify-between items-center text-sm font-bold">
                                                            <span className="text-zinc-700 uppercase tracking-widest text-[10px]">Position</span>
                                                            <span className="text-white uppercase italic">{profile.position}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm font-bold">
                                                            <span className="text-zinc-700 uppercase tracking-widest text-[10px]">Seasons</span>
                                                            <span className="text-white uppercase italic">{profile.seasons_played}</span>
                                                        </div>
                                                    </>
                                                ) : role === 'admin' ? (
                                                    <>
                                                        <div className="flex justify-between items-center text-sm font-bold">
                                                            <span className="text-zinc-700 uppercase tracking-widest text-[10px]">Clearance</span>
                                                            <span className="text-white uppercase italic">{adminClearance}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between items-center text-sm font-bold">
                                                            <span className="text-zinc-700 uppercase tracking-widest text-[10px]">Experience</span>
                                                            <span className="text-white uppercase italic">{coachProfile.experience} Yrs</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm font-bold">
                                                            <span className="text-zinc-700 uppercase tracking-widest text-[10px]">License</span>
                                                            <span className="text-white uppercase italic">{coachProfile.license}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-5 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center italic">
                                            <ShieldAlert className="inline-block mr-2" size={14} /> {error}
                                        </motion.div>
                                    )}

                                    <div className="flex gap-6 mt-12">
                                        {step > 0 && (
                                            <button type="button" onClick={goBack} className="btn-outline px-10 group">
                                                <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                                            </button>
                                        )}
                                        {step < 2 ? (
                                            <button type="button" onClick={goNext} className="flex-1 btn-premium py-6 shadow-3xl shadow-primary/20 group">
                                                Next Protocol <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                            </button>
                                        ) : (
                                            <button type="button" onClick={handleSubmit} disabled={loading} className="flex-1 btn-premium py-6 shadow-3xl shadow-primary/30 group">
                                                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                                    <><CheckCircle size={20} /> Deploy Integration</>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] mt-10">
                                        <span className="text-zinc-800">Operational already?</span> <Link to="/login" className="text-primary hover:primary-glow transition-all ml-2 border-b border-primary/20 pb-1 italic">Logon Point</Link>
                                    </p>
                                </>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
