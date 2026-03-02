import React from 'react';
import { motion } from 'framer-motion';

const ExerciseAnimation = ({ type, className = "" }) => {
    // Basic stickman skeleton with improved aesthetics
    const skeleton = {
        head: { cx: 50, cy: 20, r: 8 },
        spine: { x1: 50, y1: 28, x2: 50, y2: 60 },
        arms: { left: { x1: 50, y1: 35, x2: 25, y2: 45 }, right: { x1: 50, y1: 35, x2: 75, y2: 45 } },
        legs: { left: { x1: 50, y1: 60, x2: 35, y2: 90 }, right: { x1: 50, y1: 60, x2: 65, y2: 90 } }
    };

    const renderAnimation = () => {
        switch (type?.toLowerCase()) {
            case 'hamstring':
            case 'nordic hamstring curls':
                return (
                    <motion.g
                        animate={{
                            rotate: [0, 45, 0],
                            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                        style={{ originX: "50px", originY: "90px" }}
                    >
                        {/* Body */}
                        <circle cx="50" cy="20" r="8" className="fill-electric-cyan" />
                        <line x1="50" y1="28" x2="50" y2="60" className="stroke-electric-cyan stroke-[4]" />
                        <line x1="50" y1="35" x2="30" y2="25" className="stroke-electric-cyan stroke-[3]" />
                        <line x1="50" y1="35" x2="70" y2="25" className="stroke-electric-cyan stroke-[3]" />
                        {/* Legs (kneeling) */}
                        <line x1="50" y1="60" x2="50" y2="90" className="stroke-slate-600 stroke-[4]" />
                        <line x1="50" y1="90" x2="30" y2="90" className="stroke-slate-700 stroke-[5] stroke-round" />
                    </motion.g>
                );
            case 'knee':
            case 'spanish squat (isometric)':
                return (
                    <motion.g
                        animate={{
                            y: [0, 10, 0],
                            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                        }}
                    >
                        <circle cx="50" cy="25" r="8" className="fill-yellow-400" />
                        <line x1="50" y1="33" x2="50" y2="60" className="stroke-yellow-400 stroke-[4]" />
                        <line x1="50" y1="40" x2="25" y2="50" className="stroke-yellow-400 stroke-[3]" />
                        <line x1="50" y1="40" x2="75" y2="50" className="stroke-yellow-400 stroke-[3]" />
                        {/* Squatting legs */}
                        <line x1="50" y1="60" x2="30" y2="75" className="stroke-yellow-400 stroke-[4]" />
                        <line x1="30" y1="75" x2="35" y2="95" className="stroke-yellow-400 stroke-[4]" />
                        <line x1="50" y1="60" x2="70" y2="75" className="stroke-yellow-400 stroke-[4]" />
                        <line x1="70" y1="75" x2="65" y2="95" className="stroke-yellow-400 stroke-[4]" />
                    </motion.g>
                );
            case 'ankle':
            case 'proprioception drills':
                return (
                    <motion.g>
                        <circle cx="50" cy="20" r="8" className="fill-blue-400" />
                        <line x1="50" y1="28" x2="50" y2="60" className="stroke-blue-400 stroke-[4]" />
                        {/* Arms out for balance */}
                        <motion.line
                            x1="50" y1="35" x2="20" y2="30"
                            animate={{ y2: [25, 35, 25] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="stroke-blue-400 stroke-[3]"
                        />
                        <motion.line
                            x1="50" y1="35" x2="80" y2="30"
                            animate={{ y2: [35, 25, 35] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="stroke-blue-400 stroke-[3]"
                        />
                        {/* Single leg balance */}
                        <line x1="50" y1="60" x2="50" y2="95" className="stroke-blue-400 stroke-[5]" />
                        <motion.line
                            x1="50" y1="60" x2="70" y2="80"
                            animate={{ rotate: [-5, 5, -5] }}
                            className="stroke-slate-600 stroke-[4]"
                        />
                    </motion.g>
                );
            case 'groin':
            case 'copenhagen plank':
                return (
                    <motion.g
                        animate={{
                            y: [0, -5, 0],
                            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                        }}
                    >
                        {/* Horizontal body */}
                        <circle cx="80" cy="50" r="8" className="fill-purple-400" />
                        <line x1="20" y1="60" x2="72" y2="52" className="stroke-purple-400 stroke-[5]" />
                        <line x1="72" y1="52" x2="75" y2="70" className="stroke-purple-400 stroke-[3]" />
                        {/* Bench support */}
                        <rect x="10" y="70" width="30" height="5" className="fill-slate-700" />
                        <line x1="20" y1="60" x2="25" y2="70" className="stroke-purple-400 stroke-[4]" />
                    </motion.g>
                );
            case 'back':
            case 'dead bug':
                return (
                    <motion.g>
                        {/* Flat on back */}
                        <circle cx="20" cy="80" r="8" className="fill-emerald-400" />
                        <line x1="20" y1="88" x2="80" y2="88" className="stroke-emerald-400 stroke-[5]" />
                        {/* Moving limbs */}
                        <motion.line
                            x1="40" y1="88" x2="40" y2="50"
                            animate={{ x2: [40, 70, 40], y2: [50, 85, 50] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="stroke-emerald-400 stroke-[4]"
                        />
                        <motion.line
                            x1="60" y1="88" x2="90" y2="60"
                            animate={{ x2: [90, 60, 90], y2: [60, 85, 60] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="stroke-emerald-400 stroke-[4]"
                        />
                    </motion.g>
                );
            default:
                return (
                    <motion.g
                        animate={{
                            scale: [1, 1.05, 1],
                            transition: { duration: 2, repeat: Infinity }
                        }}
                    >
                        <circle cx="50" cy="30" r="10" className="fill-electric-cyan opacity-20" />
                        <path d="M30 70 L50 40 L70 70 Z" className="fill-electric-cyan" />
                        <circle cx="50" cy="30" r="5" className="fill-electric-cyan" />
                    </motion.g>
                );
        }
    };

    return (
        <div className={`w-full h-full bg-slate-900/50 flex items-center justify-center p-4 ${className}`}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(0,242,255,0.2)]">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {/* Background grid */}
                <path d="M0 20 H100 M0 40 H100 M0 60 H100 M0 80 H100 M20 0 V100 M40 0 V100 M60 0 V100 M80 0 V100"
                    className="stroke-white/5 stroke-[0.5]" />

                {renderAnimation()}
            </svg>
        </div>
    );
};

export default ExerciseAnimation;
