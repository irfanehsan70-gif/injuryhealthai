import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Activity,
    ShieldAlert,
    User,
    Apple,
    Dumbbell,
    ClipboardList
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const isPlayer = user?.role === 'player';

    const playerLinks = [
        { name: 'My Profile', icon: User, path: '/player' },
        { name: 'Risk Assessment', icon: ClipboardList, path: '/assessment' },
        { name: 'Diet Plan', icon: Apple, path: '/diet' },
        { name: 'Workout Plan', icon: Dumbbell, path: '/workout' },
        { name: 'Model Insights', icon: ShieldAlert, path: '/models' },
    ];

    const coachLinks = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Team Overview', icon: Users, path: '/team' },
        { name: 'Model Insights', icon: ShieldAlert, path: '/models' },
    ];

    const links = isPlayer ? playerLinks : coachLinks;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.div
            animate={{ width: isCollapsed ? 80 : 280 }}
            className="h-screen bg-deep-black/80 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-all duration-300 relative z-50 sticky top-0"
        >
            <div className="p-8 flex items-center gap-4">
                <div className="h-10 w-10 bg-electric-cyan/20 rounded-xl flex items-center justify-center border border-electric-cyan/30 shrink-0 shadow-lg shadow-electric-cyan/10">
                    <Activity className="h-6 w-6 text-electric-cyan" />
                </div>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col"
                    >
                        <span className="text-lg font-black text-white leading-none uppercase tracking-tighter italic">InjuryGuard <span className="text-electric-cyan">AI</span></span>
                        <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Bio-Metric Control</span>
                    </motion.div>
                )}
            </div>

            <div className="flex-1 px-4 mt-12">
                <div className="space-y-3">
                    {links.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            className={({ isActive }) => `
                                flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative
                                ${isActive
                                    ? 'bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/20 shadow-[0_0_20px_rgba(0,242,255,0.1)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}
                            `}
                        >
                            {(navProps) => {
                                const active = navProps.isActive;
                                return (
                                    <>
                                        <link.icon className={`h-5 w-5 shrink-0 transition-all duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]' : 'group-hover:text-white'}`} />
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="font-black text-xs uppercase tracking-widest"
                                            >
                                                {link.name}
                                            </motion.span>
                                        )}
                                        {isCollapsed && (
                                            <div className="absolute left-[calc(100%+16px)] top-3 py-2 px-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/5 shadow-2xl z-50">
                                                {link.name}
                                            </div>
                                        )}
                                    </>
                                );
                            }}
                        </NavLink>
                    ))}
                </div>
            </div>

            <div className="p-6 border-t border-white/5 space-y-6">
                {!isCollapsed && user && (
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-electric-cyan to-blue-600 flex items-center justify-center text-deep-black font-black text-xs shrink-0">
                            {user.email?.[0].toUpperCase() || 'P'}
                        </div>
                        <div className="truncate">
                            <p className="text-xs font-black truncate text-white uppercase tracking-tight">{user.name || 'Elite Coach'}</p>
                            <div className="flex flex-col gap-0.5 mt-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-electric-cyan animate-pulse" />
                                    <p className="text-[8px] text-electric-cyan/70 truncate uppercase font-black tracking-widest">{user.team_name || 'GLOBAL'}</p>
                                </div>
                                {user.role === 'coach' && user.coach_profile?.license && (
                                    <p className="text-[7px] text-slate-500 truncate uppercase font-bold tracking-tight pl-3 italic">
                                        {user.coach_profile.license} // {user.coach_profile.role_type || 'PRO'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 p-4 rounded-2xl w-full text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group relative"
                >
                    <LogOut className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
                    {!isCollapsed && <span className="font-black text-xs uppercase tracking-widest">Terminate Session</span>}
                </button>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-24 h-6 w-6 bg-electric-cyan rounded-full flex items-center justify-center text-deep-black border-2 border-deep-black hover:scale-110 transition-transform cursor-pointer shadow-[0_0_10px_rgba(0,242,255,0.3)]"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>
        </motion.div>

    );
};

export default Sidebar;
