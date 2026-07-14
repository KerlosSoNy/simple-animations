type Panel = {
    label: string;
    title: string;
    description: string;
    image: string;
    color: string;
};

export const PANELS: Panel[] = [
    {
        label: 'Discovery',
        title: 'The Beginning',
        description: 'Every great story starts with a single step into the unknown.',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        color: 'from-indigo-600/40 to-purple-700/40',
    },
    {
        label: 'Journey',
        title: 'The Adventure',
        description: 'Through mountains and valleys, the path reveals its secrets.',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
        color: 'from-blue-600/40 to-cyan-700/40',
    },
    {
        label: 'Challenge',
        title: 'The Storm',
        description: 'Darkness tests our resolve, but we emerge stronger.',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        color: 'from-gray-700/40 to-slate-900/40',
    },
    {
        label: 'Triumph',
        title: 'The Victory',
        description: 'Against all odds, we find our way to the light.',
        image: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=800&q=80',
        color: 'from-amber-500/40 to-orange-700/40',
    },
    {
        label: 'Reflection',
        title: 'The Wisdom',
        description: 'Looking back, every moment was worth the journey.',
        image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
        color: 'from-emerald-600/40 to-teal-800/40',
    },
];