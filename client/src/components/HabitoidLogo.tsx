import React from 'react';

interface HabitoidLogoProps {
    size?: number;
    className?: string;
}

// Exact logo from app.jsx
export const HabitoidLogo: React.FC<HabitoidLogoProps> = ({ size = 40, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <rect x="0" y="0" width="100" height="100" rx="22" fill="#50A65C" />
        <g transform="translate(10, 10) scale(0.8)">
            <path d="M20 65 Q45 80 55 65 L80 25" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="65" r="7" fill="white" />
            <circle cx="45" cy="72" r="7" fill="white" />
        </g>
    </svg>
);

export default HabitoidLogo;
