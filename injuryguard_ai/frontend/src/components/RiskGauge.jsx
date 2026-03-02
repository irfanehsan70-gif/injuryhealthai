import React from 'react';
import { motion } from 'framer-motion';

const RiskGauge = ({ value = 0, size = 200 }) => {
    const radius = size * 0.4;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    const getColor = (val) => {
        if (val < 40) return '#00f2ff'; // Electric Cyan
        if (val < 70) return '#fbbf24'; // Yellow
        return '#ef4444'; // Red
    };

    const color = getColor(value);

    return (
        <div className="relative flex items-center justify-center pt-5" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                {/* Background track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="15"
                    fill="transparent"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth="15"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-['Outfit']">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-5xl font-black italic tracking-tighter"
                    style={{ color }}
                >
                    {Math.round(value)}%
                </motion.span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mt-1">Risk Profile</span>
            </div>

            {/* Glow effect */}
            <div
                className="absolute w-full h-full blur-[40px] opacity-20"
                style={{ backgroundColor: color, borderRadius: '50%' }}
            />
        </div>
    );
};

export default RiskGauge;
