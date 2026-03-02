import React, { useEffect, useRef } from 'react';

const INJURY_COLORS = {
    Hamstring: '#ef4444',
    ACL: '#f97316',
    Ankle: '#eab308',
    Groin: '#a855f7',
    Shoulder: '#3b82f6',
    None: '#22d3ee',
};

const BodyPartSVG = ({ part, highlighted }) => {
    const color = highlighted ? INJURY_COLORS[highlighted] || '#22d3ee' : '#334155';
    const glowColor = INJURY_COLORS[highlighted] || 'transparent';

    // Map which SVG parts to highlight
    const isHamstring = highlighted === 'Hamstring';
    const isACL = highlighted === 'ACL';
    const isAnkle = highlighted === 'Ankle';
    const isGroin = highlighted === 'Groin';
    const isShoulder = highlighted === 'Shoulder';

    return (
        <svg
            viewBox="0 0 120 320"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: '100%', maxHeight: '380px', filter: 'drop-shadow(0 0 20px rgba(0,200,255,0.15))' }}
        >
            <defs>
                <radialGradient id="bodyGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#1e293b" />
                </radialGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <style>{`
          .body-part { transition: fill 0.5s ease, filter 0.5s ease; }
          .highlighted { animation: pulse 1.2s ease-in-out infinite; }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
            </defs>

            {/* HEAD */}
            <ellipse cx="60" cy="24" rx="18" ry="22" fill="url(#bodyGrad)" className="body-part" />

            {/* NECK */}
            <rect x="53" y="44" width="14" height="12" rx="4" fill="#334155" className="body-part" />

            {/* SHOULDERS */}
            <rect x="20" y="54" width="80" height="14" rx="7"
                fill={isShoulder ? glowColor : '#334155'}
                className={`body-part ${isShoulder ? 'highlighted' : ''}`}
                filter={isShoulder ? 'url(#glow)' : undefined}
            />

            {/* TORSO */}
            <rect x="34" y="66" width="52" height="60" rx="8" fill="url(#bodyGrad)" className="body-part" />

            {/* ARMS */}
            <rect x="17" y="54" width="14" height="70" rx="7"
                fill={isShoulder ? glowColor : '#2d3f55'}
                className={`body-part ${isShoulder ? 'highlighted' : ''}`}
                filter={isShoulder ? 'url(#glow)' : undefined}
            />
            <rect x="89" y="54" width="14" height="70" rx="7"
                fill={isShoulder ? glowColor : '#2d3f55'}
                className={`body-part ${isShoulder ? 'highlighted' : ''}`}
                filter={isShoulder ? 'url(#glow)' : undefined}
            />

            {/* GROIN / HIPS */}
            <rect x="32" y="124" width="56" height="22" rx="8"
                fill={isGroin ? glowColor : '#2d3f55'}
                className={`body-part ${isGroin ? 'highlighted' : ''}`}
                filter={isGroin ? 'url(#glow)' : undefined}
            />

            {/* LEFT UPPER LEG / HAMSTRING */}
            <rect x="33" y="144" width="22" height="70" rx="8"
                fill={isHamstring ? glowColor : '#334155'}
                className={`body-part ${isHamstring ? 'highlighted' : ''}`}
                filter={isHamstring ? 'url(#glow)' : undefined}
            />
            {/* RIGHT UPPER LEG / HAMSTRING */}
            <rect x="65" y="144" width="22" height="70" rx="8"
                fill={isHamstring ? glowColor : '#334155'}
                className={`body-part ${isHamstring ? 'highlighted' : ''}`}
                filter={isHamstring ? 'url(#glow)' : undefined}
            />

            {/* LEFT KNEE / ACL */}
            <ellipse cx="44" cy="218" rx="13" ry="10"
                fill={isACL ? glowColor : '#2d3f55'}
                className={`body-part ${isACL ? 'highlighted' : ''}`}
                filter={isACL ? 'url(#glow)' : undefined}
            />
            {/* RIGHT KNEE / ACL */}
            <ellipse cx="76" cy="218" rx="13" ry="10"
                fill={isACL ? glowColor : '#2d3f55'}
                className={`body-part ${isACL ? 'highlighted' : ''}`}
                filter={isACL ? 'url(#glow)' : undefined}
            />

            {/* LEFT LOWER LEG */}
            <rect x="35" y="226" width="18" height="60" rx="7" fill="#334155" className="body-part" />
            {/* RIGHT LOWER LEG */}
            <rect x="67" y="226" width="18" height="60" rx="7" fill="#334155" className="body-part" />

            {/* LEFT ANKLE */}
            <ellipse cx="44" cy="288" rx="12" ry="8"
                fill={isAnkle ? glowColor : '#2d3f55'}
                className={`body-part ${isAnkle ? 'highlighted' : ''}`}
                filter={isAnkle ? 'url(#glow)' : undefined}
            />
            {/* RIGHT ANKLE */}
            <ellipse cx="76" cy="288" rx="12" ry="8"
                fill={isAnkle ? glowColor : '#2d3f55'}
                className={`body-part ${isAnkle ? 'highlighted' : ''}`}
                filter={isAnkle ? 'url(#glow)' : undefined}
            />

            {/* FEET */}
            <rect x="36" y="294" width="20" height="10" rx="5" fill="#1e293b" className="body-part" />
            <rect x="64" y="294" width="20" height="10" rx="5" fill="#1e293b" className="body-part" />
        </svg>
    );
};

const Model3D = ({ highlightedPart = 'None' }) => {
    const color = INJURY_COLORS[highlightedPart] || '#22d3ee';
    const hasInjury = highlightedPart && highlightedPart !== 'None';

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'transparent' }}>
            {/* Animated background glow */}
            <div style={{
                position: 'absolute', inset: 0, borderRadius: '1.5rem',
                background: hasInjury ? `radial-gradient(ellipse at center, ${color}15, transparent 70%)` : 'radial-gradient(ellipse at center, #22d3ee10, transparent 70%)',
                transition: 'background 0.8s ease'
            }} />

            {/* Label */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '10px', color: '#475569', fontFamily: 'monospace', textAlign: 'right' }}>
                ANATOMICAL SCAN v1.0<br />
                <span style={{ color: '#334155' }}>RENDER_MODE: SVG</span>
            </div>

            {/* Legend */}
            {hasInjury && (
                <div style={{
                    position: 'absolute', top: '16px', left: '16px',
                    background: `${color}20`, border: `1px solid ${color}50`,
                    borderRadius: '8px', padding: '6px 12px', fontSize: '11px',
                    color: color, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, animation: 'pulse 1s ease-in-out infinite' }} />
                    {highlightedPart} RISK ZONE
                </div>
            )}

            {/* Body SVG */}
            <div style={{ width: '180px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0 20px' }}>
                <BodyPartSVG highlighted={highlightedPart !== 'None' ? highlightedPart : null} />
            </div>

            {/* Injury type color legend at bottom */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', padding: '0 16px 16px', position: 'absolute', bottom: 0, width: '100%' }}>
                {Object.entries(INJURY_COLORS).filter(([k]) => k !== 'None').map(([type, clr]) => (
                    <div key={type} style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '9px', color: highlightedPart === type ? clr : '#475569',
                        fontWeight: highlightedPart === type ? 'bold' : 'normal',
                        transition: 'color 0.3s'
                    }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: clr, opacity: highlightedPart === type ? 1 : 0.4 }} />
                        {type}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Model3D;
