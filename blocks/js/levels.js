// Level Definitions

// Level Definitions - Expanded to 25 Levels
export const Levels = [];

// Base 5 levels
const baseLevels = [
    { theme: 'stone', wall: '#3a2a1a', floor: '#1a1008' },
    { theme: 'stone', wall: '#2a2a2a', floor: '#1a1008' },
    { theme: 'metal', wall: '#1a2a3a', floor: '#0a101a' },
    { theme: 'metal', wall: '#2a1a3a', floor: '#1a0a2a' },
    { theme: 'hell', wall: '#3a0a0a', floor: '#1a0000' }
];

for (let i = 1; i <= 25; i++) {
    const base = baseLevels[(i - 1) % baseLevels.length];
    let size = 11 + (Math.floor((i-1)/2) * 4);
    
    // Increase difficulty for Levels 1-5 only
    if (i === 1) size = 23;
    if (i === 2) size = 29;
    if (i === 3) size = 35;
    if (i === 4) size = 41;
    if (i === 5) size = 47;

    Levels.push({
        id: i,
        size: size,
        theme: base.theme,
        wallColor: base.wall,
        floorColor: base.floor,
        difficulty: i <= 5 ? 'Hardened' : (i <= 15 ? 'Intermediate' : 'Expert')
    });
}
