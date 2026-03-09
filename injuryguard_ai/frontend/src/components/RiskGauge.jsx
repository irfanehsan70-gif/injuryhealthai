import React from 'react';
import { motion } from 'framer-motion';

const RiskGauge = ({ value = 0, size = 200 }) => {
    const radius = size * 0.45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    const getColor = (val) => {
        if (val < 40) return '#FF5F01'; // Sunset Orange (Healthy)
        if (val < 70) return '#f59e0b'; // Amber (Caution)
        return '#ef4444'; // Red (Critical)
    };

    const color = getColor(value);

    return (
        <div className="relative flex items-center justify-center pt-8" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 overflow-visible" width={size} height={size}>
                {/* Outer decorative ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius + 15}
                    stroke="rgba(255,255,255,0.02)"
                    strokeWidth="1"
                    fill="transparent"
                />

                {/* Background track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="20"
                    fill="transparent"
                />

                {/* Progress arc */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth="20"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 2, ease: "circOut" }}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ filter: `drop-shadow(0 0 15px ${color}33)` }}
                />

                {/* Inner progress markers (simulated) */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius - 20}
                    stroke="rgba(255,255,255,0.01)"
                    strokeWidth="1"
                    strokeDasharray="4 8"
                    fill="transparent"
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center font-['Outfit'] pb-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center"
                >
                    <span
                        className="text-6xl font-black italic tracking-tighter leading-none"
                        style={{ color }}
                    >
                        {value.toFixed(2)}<span className="text-2xl ml-1 opacity-60">%</span>
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-600 mt-4 opacity-80">Risk Matrix</span>
                </motion.div>
            </div>

            {/* Subtle glow container */}
            <div
                className="absolute inset-0 blur-[60px] opacity-10 pointer-events-none"
                style={{ backgroundColor: color, borderRadius: '50%', transform: 'scale(0.8)' }}
            />
        </div>
    );
};

export default RiskGauge;
