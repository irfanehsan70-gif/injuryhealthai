import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Mail, Lock, Loader2, ArrowRight, ArrowLeft,
    ShieldCheck, Zap, Target, User, Users, MapPin,
    Calendar, TrendingUp, Dumbbell, AlertTriangle, CheckCircle
} from 'lucide-react';

// ─── Reusable Field ──────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, children }) => (
    <div className="space-y-2">
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            {Icon && (
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                    <Icon className="h-4 w-4 text-slate-500 group-focus-within:text-electric-cyan transition-all" />
                </div>
            )}
            {children}
        </div>
    </div>
);

const inputCls = (hasIcon = true) =>
    `w-full bg-deep-black/50 border border-white/10 text-white rounded-2xl py-4 ${hasIcon ? 'pl-12' : 'pl-5'} pr-4 focus:ring-2 focus:ring-electric-cyan/50 outline-none transition-all font-medium text-sm`;

const selectCls = `w-full bg-deep-black/50 border border-white/10 text-white rounded-2xl py-4 pl-5 pr-4 focus:ring-2 focus:ring-electric-cyan/50 outline-none transition-all font-medium text-sm appearance-none`;

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepBar = ({ step, total, labels }) => (
    <div className="mb-8">
        <div className="flex items-center gap-0 mb-3">
            {Array.from({ length: total }).map((_, i) => (
                <React.Fragment key={i}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all shrink-0 ${i < step ? 'bg-electric-cyan border-electric-cyan text-deep-black' :
                        i === step ? 'bg-electric-cyan/20 border-electric-cyan text-electric-cyan' :
                            'bg-white/5 border-white/10 text-slate-600'
                        }`}>
                        {i < step ? <CheckCircle size={14} /> : i + 1}
                    </div>
                    {i < total - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 transition-all ${i < step ? 'bg-electric-cyan' : 'bg-white/10'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{labels[step]}</p>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const RegisterPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0); // 0 = account, 1 = player profile, 2 = confirm
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 0: Account
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [role, setRole] = useState('player'); // player | coach
    const [teamName, setTeamName] = useState('');

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

    const STEPS = role === 'coach' ? ['Account Setup', 'Coach Credentials', 'Review & Launch'] : ['Account Setup', 'Athletic Profile', 'Confirm & Launch'];

    // ── Validate step 0 ────────────────────────────────────────────────────
    const validateStep0 = () => {
        if (!name.trim()) { setError('Full name is required.'); return false; }
        if (!email.trim()) { setError('Email is required.'); return false; }
        if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email.'); return false; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return false; }
        if (password !== confirm) { setError('Passwords do not match.'); return false; }
        if (!teamName.trim()) { setError('Team Name is required.'); return false; }
        return true;
    };

    // ── Validate step 1 ────────────────────────────────────────────────────
    const validateStep1 = () => {
        if (!profile.age || isNaN(profile.age) || +profile.age < 14 || +profile.age > 50) { setError('Enter a valid age (14–50).'); return false; }
        if (!profile.seasons_played || isNaN(profile.seasons_played)) { setError('Seasons played is required.'); return false; }
        if (!profile.matches_per_season || isNaN(profile.matches_per_season)) { setError('Matches per season is required.'); return false; }
        return true;
    };

    const goNext = () => {
        setError('');
        if (step === 0 && !validateStep0()) return;
        if (step === 1 && role === 'player' && !validateStep1()) return;
        if (step === 1 && role === 'coach') {
            if (!coachProfile.experience) { setError('Experience years required.'); return false; }
        }
        setStep(s => s + 1);
    };

    const goBack = () => {
        setError('');
        setStep(s => s - 1);
    };

    // ── Submit ─────────────────────────────────────────────────────────────
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
                profile: role === 'player' ? {
                    league: profile.league,
                    position: profile.position,
                    age: +profile.age,
                    seasons_played: +profile.seasons_played,
                    matches_per_season: +profile.matches_per_season,
                    minutes_per_season: +profile.minutes_per_season || 0,
                    high_speed_runs: +profile.high_speed_runs || 0,
                    previous_injuries: +profile.previous_injuries || 0,
                    recurrence_flag: +profile.recurrence_flag || 0,
                    fatigue_index: +profile.fatigue_index || 1.0,
                    jersey_number: profile.jersey_number,
                    nationality: profile.nationality,
                    club: profile.club,
                    height_cm: +profile.height_cm || null,
                    weight_kg: +profile.weight_kg || null,
                } : null,
                coach_profile: role === 'coach' ? coachProfile : null
            });
            setStep(3); // success screen
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            setStep(2); // stay on confirm
        } finally {
            setLoading(false);
        }
    };

    // ── Shared layout wrapper ──────────────────────────────────────────────
    return (
        <div className="min-h-screen relative overflow-hidden bg-deep-black font-['Outfit']">
            {/* Background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center scale-105 opacity-40 blur-[2px]" style={{ backgroundImage: 'url("/hero.png")' }} />
                <div className="absolute inset-0 bg-gradient-to-br from-deep-black/60 via-deep-black/80 to-deep-black" />
                <div className="absolute inset-0 bg-radial-at-tl from-electric-cyan/8 to-transparent" />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Top nav */}
                <nav className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-electric-cyan/20 rounded-xl border border-electric-cyan/30">
                            <Activity className="h-5 w-5 text-electric-cyan" />
                        </div>
                        <span className="text-xl font-black text-white tracking-tight uppercase italic">InjuryGuard <span className="text-electric-cyan">AI</span></span>
                    </div>
                    <Link to="/login" className="text-xs font-black text-slate-500 hover:text-electric-cyan uppercase tracking-widest transition-all flex items-center gap-2">
                        <ArrowLeft size={14} /> Back to Login
                    </Link>
                </nav>

                <div className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 items-start">

                        {/* Left info panel */}
                        <div className="hidden lg:block space-y-10 pt-8">
                            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                                <span className="text-electric-cyan font-black text-xs uppercase tracking-[0.4em] border-l-2 border-electric-cyan pl-4">Elite Athlete Onboarding</span>
                                <h1 className="text-6xl font-black text-white leading-tight uppercase tracking-tighter mt-6">
                                    {step === 0 && <><span className="text-electric-cyan">{role === 'coach' ? 'Coach' : 'Athlete'}</span><br />Identity Setup.</>}
                                    {step === 1 && (
                                        role === 'coach'
                                            ? <>Tactical &<br /><span className="text-electric-cyan">Clinical Profile.</span></>
                                            : <>Your Athletic<br /><span className="text-electric-cyan">Profile.</span></>
                                    )}
                                    {step === 2 && <>Final<br /><span className="text-electric-cyan">Confirmation.</span></>}
                                    {step === 3 && <>System<br /><span className="text-electric-cyan">Activated.</span></>}
                                </h1>
                                <p className="text-slate-400 text-base max-w-md mt-6 leading-relaxed">
                                    {step === 0 && 'Set up your account credentials to access the InjuryGuard AI platform.'}
                                    {step === 1 && (
                                        role === 'coach'
                                            ? 'Tell us about your clinical and tactical background. This data identifies your coaching station and specialization.'
                                            : 'Tell us about your athletic background. This data powers your personal injury risk model from day one.'
                                    )}
                                    {step === 2 && 'Review your details before activating your station. Your profile will be pre-loaded on the dashboard.'}
                                    {step === 3 && 'Your profile is live. Log in and see your personalized dashboard instantly.'}
                                </p>
                            </motion.div>

                            {/* Feature pills */}
                            {step <= 1 && (
                                <div className="space-y-4">
                                    {[
                                        { icon: ShieldCheck, label: 'Personal Risk Model', sub: 'Powered by your own biometric data' },
                                        { icon: Zap, label: 'Instant Dashboard', sub: 'Profile pre-populated on first login' },
                                        { icon: Target, label: 'Tailored Plans', sub: 'Diet & workout plans based on your needs' },
                                    ].map((f, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                                            className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                            <div className="h-10 w-10 rounded-xl bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center text-electric-cyan shrink-0">
                                                <f.icon size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-white uppercase tracking-widest">{f.label}</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{f.sub}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: form card */}
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="glass-card p-8 border border-white/10 relative"
                        >
                            <div className="absolute top-0 right-8 h-8 w-[1px] bg-gradient-to-b from-electric-cyan to-transparent animate-pulse" />

                            {/* SUCCESS screen */}
                            {step === 3 ? (
                                <div className="py-8 flex flex-col items-center text-center gap-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                        className="h-20 w-20 rounded-full bg-electric-cyan/20 border-2 border-electric-cyan flex items-center justify-center shadow-[0_0_30px_rgba(0,242,255,0.3)]"
                                    >
                                        <ShieldCheck className="text-electric-cyan" size={36} />
                                    </motion.div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                                            Station Active
                                        </h3>
                                        <p className="text-slate-400 text-sm mt-2">
                                            Your account for <span className="text-electric-cyan font-bold">"{teamName}"</span> is ready.
                                            {role === 'coach' ? ' Players joining this team will be visible in your dashboard.' : ' You are now part of the squad.'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="w-full btn-primary flex items-center justify-center gap-3 h-14 text-base"
                                    >
                                        Go to Login <ArrowRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <StepBar step={step} total={3} labels={STEPS} />

                                    {/* ── STEP 0: Account ── */}
                                    {step === 0 && (
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6">Account Setup</h3>

                                            {/* Role selector */}
                                            <div className="flex gap-3 mb-2">
                                                {[
                                                    { id: 'player', label: 'Player', icon: User },
                                                    { id: 'coach', label: 'Coach', icon: Users },
                                                ].map(r => (
                                                    <button
                                                        key={r.id}
                                                        type="button"
                                                        onClick={() => setRole(r.id)}
                                                        className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all ${role === r.id
                                                            ? 'bg-electric-cyan/10 border-electric-cyan text-electric-cyan'
                                                            : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
                                                            }`}
                                                    >
                                                        <r.icon size={20} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{r.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <Field label="Full Name" icon={User}>
                                                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls()} placeholder="John Smith" />
                                            </Field>
                                            <Field label="Email" icon={Mail}>
                                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls()} placeholder="you@team.ai" />
                                            </Field>
                                            <Field label="Password" icon={Lock}>
                                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls()} placeholder="Min. 6 characters" />
                                            </Field>
                                            <Field label="Confirm Password" icon={Lock}>
                                                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className={inputCls()} placeholder="Repeat password" />
                                            </Field>

                                            <div className="mt-2 pt-4 border-t border-white/5">
                                                <Field label="Team Name" icon={Users}>
                                                    <input
                                                        type="text"
                                                        value={teamName}
                                                        onChange={e => setTeamName(e.target.value)}
                                                        className={inputCls()}
                                                        placeholder="e.g. Manchester City"
                                                    />
                                                </Field>
                                                <p className="text-[8px] text-slate-600 font-bold uppercase mt-2 italic px-1">
                                                    {role === 'coach' ? 'Define your team name for players to join.' : 'Must exactly match the name defined by your coach.'}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── STEP 1: Player profile ── */}
                                    {step === 1 && (
                                        role === 'coach' ? (
                                            <div className="space-y-4">
                                                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6">Coach Credentials</h3>

                                                <Field label="Coaching Role *" icon={User}>
                                                    <select value={coachProfile.role_type} onChange={setCoach('role_type')} className={selectCls}>
                                                        {['Head Coach', 'Assistant Coach', 'Physiotherapist', 'Fitness Coach', 'Technical Analyst', 'Goalkeeper Coach'].map(r => (
                                                            <option key={r} value={r}>{r}</option>
                                                        ))}
                                                    </select>
                                                </Field>

                                                <Field label="Preferred Playstyle *" icon={Target}>
                                                    <select value={coachProfile.playstyle} onChange={setCoach('playstyle')} className={selectCls}>
                                                        {['Possession-Based', 'Counter-Attack', 'High Press', 'Defensive', 'Direct Ball', 'Total Football'].map(s => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </Field>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <Field label="Experience (Years) *" icon={TrendingUp}>
                                                        <input type="number" min="0" value={coachProfile.experience} onChange={setCoach('experience')} className={inputCls()} placeholder="e.g. 10" />
                                                    </Field>
                                                    <Field label="Coaching License" icon={ShieldCheck}>
                                                        <select value={coachProfile.license} onChange={setCoach('license')} className={selectCls}>
                                                            {['UEFA Pro', 'UEFA A', 'UEFA B', 'UEFA C', 'National Pro', 'Grassroots', 'None'].map(l => (
                                                                <option key={l} value={l}>{l}</option>
                                                            ))}
                                                        </select>
                                                    </Field>
                                                </div>

                                                <Field label="Previous Clubs / Teams" icon={Users}>
                                                    <input
                                                        type="text"
                                                        value={coachProfile.previous_clubs}
                                                        onChange={setCoach('previous_clubs')}
                                                        className={inputCls()}
                                                        placeholder="e.g. AFC Ajax, FC Porto"
                                                    />
                                                </Field>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6">Athletic Profile</h3>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <Field label="Club / Team">
                                                        <input type="text" value={profile.club} onChange={set('club')} className={inputCls(false)} placeholder="e.g. Man United" />
                                                    </Field>
                                                    <Field label="Nationality">
                                                        <input type="text" value={profile.nationality} onChange={set('nationality')} className={inputCls(false)} placeholder="e.g. England" />
                                                    </Field>
                                                    <Field label="Jersey Number">
                                                        <input type="number" min="1" max="99" value={profile.jersey_number} onChange={set('jersey_number')} className={inputCls(false)} placeholder="e.g. 10" />
                                                    </Field>
                                                    <Field label="Age *" icon={Calendar}>
                                                        <input type="number" min="14" max="50" value={profile.age} onChange={set('age')} className={inputCls()} placeholder="e.g. 24" />
                                                    </Field>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <Field label="Height (cm)">
                                                        <input type="number" value={profile.height_cm} onChange={set('height_cm')} className={inputCls(false)} placeholder="e.g. 183" />
                                                    </Field>
                                                    <Field label="Weight (kg)">
                                                        <input type="number" value={profile.weight_kg} onChange={set('weight_kg')} className={inputCls(false)} placeholder="e.g. 78" />
                                                    </Field>
                                                </div>

                                                <Field label="League *">
                                                    <select value={profile.league} onChange={set('league')} className={selectCls}>
                                                        {['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'MLS', 'Champions League', 'Eredivisie', 'Primeira Liga', 'Other'].map(l => (
                                                            <option key={l} value={l}>{l}</option>
                                                        ))}
                                                    </select>
                                                </Field>

                                                <Field label="Position *">
                                                    <select value={profile.position} onChange={set('position')} className={selectCls}>
                                                        {['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Winger', 'Striker'].map(p => (
                                                            <option key={p} value={p}>{p}</option>
                                                        ))}
                                                    </select>
                                                </Field>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <Field label="Seasons Played *" icon={TrendingUp}>
                                                        <input type="number" min="0" max="30" value={profile.seasons_played} onChange={set('seasons_played')} className={inputCls()} placeholder="e.g. 5" />
                                                    </Field>
                                                    <Field label="Matches / Season *" icon={Dumbbell}>
                                                        <input type="number" min="0" max="70" value={profile.matches_per_season} onChange={set('matches_per_season')} className={inputCls()} placeholder="e.g. 30" />
                                                    </Field>
                                                    <Field label="Minutes / Season">
                                                        <input type="number" min="0" value={profile.minutes_per_season} onChange={set('minutes_per_season')} className={inputCls(false)} placeholder="e.g. 2400" />
                                                    </Field>
                                                    <Field label="High Speed Runs">
                                                        <input type="number" min="0" value={profile.high_speed_runs} onChange={set('high_speed_runs')} className={inputCls(false)} placeholder="e.g. 80" />
                                                    </Field>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <Field label="Previous Injuries" icon={AlertTriangle}>
                                                        <input type="number" min="0" max="20" value={profile.previous_injuries} onChange={set('previous_injuries')} className={inputCls()} placeholder="e.g. 2" />
                                                    </Field>
                                                    <Field label="Recurring Injury?">
                                                        <select value={profile.recurrence_flag} onChange={set('recurrence_flag')} className={selectCls}>
                                                            <option value="0">No</option>
                                                            <option value="1">Yes</option>
                                                        </select>
                                                    </Field>
                                                </div>

                                                <Field label="Fatigue Index (1–5)">
                                                    <select value={profile.fatigue_index} onChange={set('fatigue_index')} className={selectCls}>
                                                        {['1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0'].map(f => (
                                                            <option key={f} value={f}>{f} — {+f <= 1.5 ? 'Fresh' : +f <= 2.5 ? 'Moderate' : +f <= 3.5 ? 'Fatigued' : 'High Load'}</option>
                                                        ))}
                                                    </select>
                                                </Field>
                                            </div>
                                        )
                                    )}

                                    {/* ── STEP 2: Confirmation ── */}
                                    {step === 2 && (
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6">Confirm & Launch</h3>

                                            {/* Account summary */}
                                            <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 space-y-3">
                                                <p className="text-[10px] font-black text-electric-cyan uppercase tracking-widest mb-3">Account</p>
                                                {[
                                                    ['Name', name],
                                                    ['Email', email],
                                                    ['Role', role.charAt(0).toUpperCase() + role.slice(1)],
                                                ].map(([k, v]) => (
                                                    <div key={k} className="flex justify-between">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{k}</span>
                                                        <span className="text-xs font-black text-white">{v}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Profile summary - Only if player */}
                                            {role === 'player' && (
                                                <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 space-y-3">
                                                    <p className="text-[10px] font-black text-electric-cyan uppercase tracking-widest mb-3">Athletic Profile</p>
                                                    {[
                                                        ['Club', profile.club || '—'],
                                                        ['Nationality', profile.nationality || '—'],
                                                        ['Jersey #', profile.jersey_number || '—'],
                                                        ['Position', profile.position],
                                                        ['League', profile.league],
                                                        ['Age', profile.age],
                                                        ['Seasons', profile.seasons_played],
                                                        ['Matches/Season', profile.matches_per_season],
                                                        ['Prev. Injuries', profile.previous_injuries],
                                                        ['Fatigue Index', profile.fatigue_index],
                                                    ].map(([k, v]) => (
                                                        <div key={k} className="flex justify-between">
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{k}</span>
                                                            <span className="text-xs font-black text-white">{v}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Profile summary - Only if coach */}
                                            {role === 'coach' && (
                                                <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 space-y-3">
                                                    <p className="text-[10px] font-black text-electric-cyan uppercase tracking-widest mb-3">Professional Credentials</p>
                                                    {[
                                                        ['Role', coachProfile.role_type],
                                                        ['Playstyle', coachProfile.playstyle],
                                                        ['Experience', `${coachProfile.experience} Years`],
                                                        ['License', coachProfile.license],
                                                        ['Prev. Clubs', coachProfile.previous_clubs || '—'],
                                                    ].map(([k, v]) => (
                                                        <div key={k} className="flex justify-between">
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{k}</span>
                                                            <span className="text-xs font-black text-white">{v}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Error */}
                                    {error && (
                                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-black uppercase tracking-widest text-center">
                                            {error}
                                        </div>
                                    )}

                                    {/* Navigation buttons */}
                                    <div className={`flex gap-3 mt-6 ${step > 0 ? 'justify-between' : ''}`}>
                                        {step > 0 && (
                                            <button
                                                type="button"
                                                onClick={goBack}
                                                className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black text-xs uppercase tracking-widest"
                                            >
                                                <ArrowLeft size={16} /> Back
                                            </button>
                                        )}
                                        {step < 2 ? (
                                            <button
                                                type="button"
                                                onClick={goNext}
                                                className="flex-1 btn-primary flex items-center justify-center gap-3 h-14 text-sm"
                                            >
                                                Continue <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleSubmit}
                                                disabled={loading}
                                                className="flex-1 btn-primary flex items-center justify-center gap-3 h-14 text-sm"
                                            >
                                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                                    <><CheckCircle size={18} /> Activate Station</>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-center text-[10px] text-slate-600 font-black uppercase tracking-widest mt-4">
                                        Already have an account? <Link to="/login" className="text-electric-cyan hover:underline">Log In</Link>
                                    </p>
                                </>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-electric-cyan/40 to-transparent" />
        </div>
    );
};

export default RegisterPage;
