import React from 'react';
import { motion } from 'framer-motion';

const INJURY_COLORS = {
    Hamstring: '#ff0000', // Critical Red
    ACL: '#ff4400',       // Deep Orange
    Knee: '#ff4400',
    Ankle: '#3b82f6',     // Blue
    Groin: '#a855f7',     // Purple
    Shoulder: '#ec4899',  // Pink
    Back: '#f59e0b',      // Amber
    Muscle: '#10b981',    // Emerald
    None: '#27272a',      // Zinc
};

const BodyPartSVG = ({ highlighted }) => {
    const part = String(highlighted || '').toLowerCase();
    const isMuscle = part === 'muscle';
    const isHamstring = part === 'hamstring' || isMuscle;
    const isACL = part === 'acl' || part === 'knee';
    const isAnkle = part === 'ankle';
    const isGroin = part === 'groin';
    const isShoulder = part === 'shoulder' || isMuscle;
    const isBack = part === 'back';

    const blinkAnimation = {
        initial: { opacity: 0.8 },
        animate: {
            opacity: [0.8, 0.4, 0.8],
            transition: {
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const getPartStyle = (isHighlighted) => ({
        fill: isHighlighted ? INJURY_COLORS[highlighted] : '#18181b',
        filter: isHighlighted ? `drop-shadow(0 0 15px ${INJURY_COLORS[highlighted]})` : 'none',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        stroke: isHighlighted ? INJURY_COLORS[highlighted] : 'rgba(255,255,255,0.03)',
        strokeWidth: isHighlighted ? '1.5' : '1',
    });

    return (
        <svg
            viewBox="0 0 120 320"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full max-h-[380px] drop-shadow-2xl"
        >
            <defs>
                <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#27272a" />
                    <stop offset="100%" stopColor="#09090b" />
                </linearGradient>
            </defs>

            {/* HEAD */}
            <ellipse cx="60" cy="24" rx="16" ry="20" style={getPartStyle(false)} />

            {/* NECK */}
            <rect x="54" y="44" width="12" height="10" rx="3" style={getPartStyle(false)} />

            {/* SHOULDERS & ARMS */}
            <motion.rect x="20" y="54" width="80" height="14" rx="7" style={getPartStyle(isShoulder)} {...(isShoulder ? blinkAnimation : {})} />
            <motion.rect x="17" y="54" width="14" height="70" rx="7" style={getPartStyle(isShoulder)} {...(isShoulder ? blinkAnimation : {})} />
            <motion.rect x="89" y="54" width="14" height="70" rx="7" style={getPartStyle(isShoulder)} {...(isShoulder ? blinkAnimation : {})} />

            {/* TORSO / BACK */}
            <motion.rect x="34" y="66" width="52" height="60" rx="12" style={getPartStyle(isBack)} {...(isBack ? blinkAnimation : {})} />

            {/* GROIN / HIPS */}
            <motion.rect x="32" y="124" width="56" height="22" rx="11" style={getPartStyle(isGroin)} {...(isGroin ? blinkAnimation : {})} />

            {/* UPPER LEGS */}
            <motion.rect x="33" y="146" width="22" height="72" rx="11" style={getPartStyle(isHamstring)} {...(isHamstring ? blinkAnimation : {})} />
            <motion.rect x="65" y="146" width="22" height="72" rx="11" style={getPartStyle(isHamstring)} {...(isHamstring ? blinkAnimation : {})} />

            {/* KNEES / ACL */}
            <motion.ellipse cx="44" cy="222" rx="12" ry="10" style={getPartStyle(isACL)} {...(isACL ? blinkAnimation : {})} />
            <motion.ellipse cx="76" cy="222" rx="12" ry="10" style={getPartStyle(isACL)} {...(isACL ? blinkAnimation : {})} />

            {/* LOWER LEGS */}
            <rect x="35" y="232" width="18" height="58" rx="9" style={getPartStyle(false)} />
            <rect x="67" y="232" width="18" height="58" rx="9" style={getPartStyle(false)} />

            {/* ANKLES */}
            <motion.ellipse cx="44" cy="292" rx="12" ry="8" style={getPartStyle(isAnkle)} {...(isAnkle ? blinkAnimation : {})} />
            <motion.ellipse cx="76" cy="292" rx="12" ry="8" style={getPartStyle(isAnkle)} {...(isAnkle ? blinkAnimation : {})} />

            {/* FEET */}
            <rect x="34" y="302" width="22" height="8" rx="4" style={getPartStyle(false)} />
            <rect x="64" y="302" width="22" height="8" rx="4" style={getPartStyle(false)} />
        </svg>
    );
};

const Model3D = ({ highlightedPart = 'None' }) => {
    // Case-insensitive lookup
    const partKey = Object.keys(INJURY_COLORS).find(
        k => k.toLowerCase() === String(highlightedPart || 'None').toLowerCase()
    ) || 'None';

    const currentColor = INJURY_COLORS[partKey];
    const hasActiveHighlight = partKey !== 'None';

    return (
        <div className="relative w-full h-full min-h-[450px] flex flex-col items-center justify-center font-['Outfit'] overflow-hidden rounded-[2.5rem] bg-black/20 border border-white/5">
            {/* Background Atmosphere */}
            <div
                className="absolute inset-0 transition-all duration-1000 opacity-20 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at center, ${currentColor}33 0%, transparent 70%)`,
                    transform: hasActiveHighlight ? 'scale(1.2)' : 'scale(1)'
                }}
            />

            {/* System Status Headers */}
            {/* System Status - Cleaned up to avoid overlap with Dashboard */}
            <div className="absolute top-8 left-10 opacity-30 pointer-events-none">
                <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em] italic leading-none">Scanning Engine Active</p>
                <div className="h-[1px] w-12 bg-primary/20 mt-2" />
            </div>

            <div className="absolute top-8 right-10 text-right opacity-30">
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">Node_ID: ATHLETE_V4</p>
                <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em]">RENDER: VECTOR_MODEL</p>
            </div>

            {/* Body Model */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-48 relative z-10 py-12"
            >
                <BodyPartSVG highlighted={hasActiveHighlight ? highlightedPart : null} />
            </motion.div>

            {/* Legend Matrix */}
            <div className="absolute bottom-8 left-0 w-full px-10 flex flex-wrap justify-center gap-4">
                {Object.entries(INJURY_COLORS).filter(([k]) => k !== 'None').map(([type, clr]) => (
                    <div key={type} className={`flex items-center gap-3 transition-all duration-500 ${highlightedPart === type ? 'opacity-100 scale-105' : 'opacity-30 grayscale'}`}>
                        <div className="h-1.5 w-4 rounded-full" style={{ backgroundColor: clr }} />
                        <span className={`text-[8px] font-black uppercase tracking-widest ${highlightedPart === type ? 'text-white' : 'text-zinc-600'}`}>{type}</span>
                    </div>
                ))}
            </div>

            {/* Visual Decoration */}
            <div className="absolute top-0 right-0 h-20 w-px bg-gradient-to-b from-primary/20 to-transparent" />
            <div className="absolute bottom-0 left-0 h-20 w-px bg-gradient-to-t from-primary/20 to-transparent" />
        </div>
    );
};

export default Model3D;
