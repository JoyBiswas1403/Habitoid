/**
 * Habitoid - Build Better Habits
 * Copyright (c) 2025 Habitoid Team
 * Owner: Joy Biswas (bjoy1403@gmail.com)
 * Licensed under the MIT License
 */

import React from 'react';

interface HabitoidLogoProps {
    size?: number;
    className?: string;
}

// Use the icon-only version of the logo
export const HabitoidLogo: React.FC<HabitoidLogoProps> = ({ size = 40, className = '' }) => (
    <img
        src="/icon.png"
        alt="Habitoid"
        width={size}
        height={size}
        className={className}
        style={{ borderRadius: size > 30 ? '8px' : '4px' }}
    />
);

export default HabitoidLogo;
