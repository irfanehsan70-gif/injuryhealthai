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
        { name: 'Profile', icon: User, path: '/player' },
        { name: 'Assessment', icon: ClipboardList, path: '/assessment' },
        { name: 'Nutrition', icon: Apple, path: '/diet' },
        { name: 'Training', icon: Dumbbell, path: '/workout' },
        { name: 'Intelligence', icon: ShieldAlert, path: '/models' },
    ];

    const coachLinks = [
        { name: 'Intelligence', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Squad List', icon: Users, path: '/team' },
        { name: 'ML Insights', icon: ShieldAlert, path: '/models' },
    ];

    const links = isPlayer ? playerLinks : coachLinks;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.div
            animate={{ width: isCollapsed ? 100 : 300 }}
            className="h-screen bg-[#080808]/95 backdrop-blur-3xl border-r border-white/5 flex flex-col transition-all duration-500 relative z-50 sticky top-0"
        >
            {/* Logo Section */}
            <div className="p-10 flex items-center gap-5">
                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shrink-0 shadow-2xl shadow-primary/10">
                    <Activity className="h-6 w-6 text-primary" />
                </div>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col"
                    >
                        <span className="text-xl font-black text-white leading-none uppercase tracking-tighter italic">InjuryGuard <span className="text-primary italic">AI</span></span>
                        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.4em] mt-1.5 opacity-60">Precision Health</span>
                    </motion.div>
                )}
            </div>

            {/* Navigation Section */}
            <div className="flex-1 px-6 mt-16">
                <div className="space-y-4">
                    {links.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            className={({ isActive }) => `
                                flex items-center gap-5 p-5 rounded-[1.5rem] transition-all duration-500 group relative
                                ${isActive
                                    ? 'bg-primary/5 text-primary border border-primary/10 shadow-[0_20px_40px_rgba(255,95,1,0.05)]'
                                    : 'text-zinc-500 hover:text-white hover:bg-white/[0.03] border border-transparent'}
                            `}
                        >
                            {(navProps) => {
                                const active = navProps.isActive;
                                return (
                                    <>
                                        <link.icon className={`h-5 w-5 shrink-0 transition-all duration-500 ${active ? 'scale-110 drop-shadow-[0_0_12px_rgba(255,95,1,0.4)]' : 'group-hover:text-white group-hover:scale-105'}`} />
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="font-bold text-xs uppercase tracking-[0.15em]"
                                            >
                                                {link.name}
                                            </motion.span>
                                        )}
                                        {active && !isCollapsed && (
                                            <motion.div layoutId="activeInd" className="absolute right-4 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_#FF5F01]" />
                                        )}
                                        {isCollapsed && (
                                            <div className="absolute left-[calc(100%+20px)] top-4 py-2.5 px-4 bg-[#121212] text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none border border-white/5 shadow-3xl z-50">
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

            {/* User Footer Section */}
            <div className="p-8 border-t border-white/5 space-y-8">
                {!isCollapsed && user && (
                    <div className="flex items-center gap-5 p-5 bg-white/[0.02] rounded-[1.8rem] border border-white/5 overflow-hidden group hover:border-white/10 transition-colors">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-[#FF2E00] flex items-center justify-center text-black font-black text-xs shrink-0 shadow-lg shadow-primary/10 transition-transform group-hover:scale-105">
                            {user.email?.[0].toUpperCase() || 'P'}
                        </div>
                        <div className="truncate">
                            <p className="text-xs font-black truncate text-white uppercase tracking-tight">{user.name || 'Pro Elite'}</p>
                            <div className="flex flex-col gap-1 mt-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <p className="text-[9px] text-zinc-500 truncate uppercase font-black tracking-widest leading-none">{user.team_name || 'GLOBAL SQUAD'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-5 p-5 rounded-[1.5rem] w-full text-zinc-600 hover:bg-red-500/5 hover:text-red-500 transition-all duration-500 group relative"
                >
                    <LogOut className="h-5 w-5 shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-all" />
                    {!isCollapsed && <span className="font-bold text-xs uppercase tracking-widest">Sign Out</span>}
                </button>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-28 h-7 w-7 bg-[#1A1A1A] text-zinc-500 rounded-full flex items-center justify-center border border-white/10 hover:border-primary hover:text-primary transition-all duration-300 cursor-pointer shadow-3xl group"
                >
                    {isCollapsed ? <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />}
                </button>
            </div>
        </motion.div>
    );
};

export default Sidebar;
