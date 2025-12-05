import React from 'react';

interface SlashCharacterProps {
    expression?: 'happy' | 'smart' | 'focus';
    className?: string;
    onClick?: () => void;
    size?: number;
}

// Exact SVG from app.jsx
export const SlashCharacter: React.FC<SlashCharacterProps> = ({
    expression = 'happy',
    className = '',
    onClick,
    size
}) => (
    <svg
        viewBox="0 0 100 100"
        className={`${className} cursor-pointer hover:scale-105 transition-transform select-none`}
        onClick={onClick}
        width={size}
        height={size}
    >
        <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>

        {/* Lightning Bolt Body - exact from app.jsx */}
        <path
            d="M45 5 L90 5 L65 45 L95 45 L35 95 L50 50 L15 50 Z"
            fill="#50A65C"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
        />

        {/* Face - shifted up by 5 */}
        <g transform="translate(0, -5)">
            {expression === 'happy' && (
                <>
                    <ellipse cx="45" cy="40" rx="4" ry="6" fill="#232323" />
                    <ellipse cx="70" cy="40" rx="4" ry="6" fill="#232323" />
                    <path d="M50 55 Q60 65 70 55" fill="none" stroke="#232323" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="38" cy="48" r="3" fill="#E91E63" opacity="0.4" />
                    <circle cx="78" cy="48" r="3" fill="#E91E63" opacity="0.4" />
                </>
            )}
            {expression === 'smart' && (
                <>
                    <circle cx="45" cy="40" r="4" fill="#232323" />
                    <circle cx="70" cy="40" r="4" fill="#232323" />
                    <circle cx="45" cy="40" r="9" fill="none" stroke="#232323" strokeWidth="2" />
                    <circle cx="70" cy="40" r="9" fill="none" stroke="#232323" strokeWidth="2" />
                    <line x1="54" y1="40" x2="61" y2="40" stroke="#232323" strokeWidth="2" />
                    <path d="M55 58 Q60 60 65 58" fill="none" stroke="#232323" strokeWidth="2" strokeLinecap="round" />
                </>
            )}
            {expression === 'focus' && (
                <>
                    <path d="M40 42 L50 42" stroke="#232323" strokeWidth="3" strokeLinecap="round" />
                    <path d="M65 42 L75 42" stroke="#232323" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="58" cy="55" r="3" fill="#232323" />
                    <path d="M80 25 Q80 35 75 35 Q70 35 70 25 Q70 15 75 15 Q80 15 80 25" fill="#A0D0FF" />
                </>
            )}
        </g>
    </svg>
);

export default SlashCharacter;
