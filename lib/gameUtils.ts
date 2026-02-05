export const GRADIENT_PAIRS = [
    "from-red-600 to-red-950",
    "from-blue-600 to-blue-950",
    "from-emerald-600 to-emerald-950",
    "from-amber-600 to-amber-950",
    "from-purple-600 to-purple-950",
    "from-indigo-600 to-indigo-950",
    "from-pink-600 to-pink-950",
    "from-cyan-600 to-cyan-950",
    "from-orange-600 to-orange-950",
    "from-slate-600 to-slate-950",
];

export const getGameGradient = (gameName: string) => {
    const hash = gameName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % GRADIENT_PAIRS.length;
    return `bg-gradient-to-br ${GRADIENT_PAIRS[index]}`;
};

export const getGameThemeColor = (gameName: string) => {
    const hash = gameName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
        "#ef4444", // red-500
        "#3b82f6", // blue-500
        "#10b981", // emerald-500
        "#f59e0b", // amber-500
        "#8b5cf6", // purple-500
        "#6366f1", // indigo-500
        "#ec4899", // pink-500
        "#06b6d4", // cyan-500
        "#f97316", // orange-500
        "#64748b", // slate-500
    ];
    return colors[hash % colors.length];
};
