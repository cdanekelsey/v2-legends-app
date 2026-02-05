
import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, X, Filter, List, Grid, ChevronRight, GripVertical,
    Feather, Plus, User, Sparkles, ArrowUpDown, Move, Gamepad2, SlidersHorizontal, Check, Star
} from 'lucide-react';
import { Legend, Moment, Game } from './types';
import { INITIAL_DATA, GAMES, DEFAULT_TAGS } from './constants';
import GlobalStyles from './components/GlobalStyles';
import FoundryModal from './components/FoundryModal';
import MomentViewer from './components/MemoryViewer';
import LegendTapestry from './components/LegendTapestry';
import NavigationSidebar from './components/NavigationSidebar';

// --- CONTEXT AWARE FAB (Mobile Only) ---

interface SmartFABProps {
    isLegendSelected: boolean;
    onInscribe: () => void;
    onForge: () => void;
    visible: boolean;
}

const SmartFAB: React.FC<SmartFABProps> = ({ isLegendSelected, onInscribe, onForge, visible }) => {
    const [isOpen, setIsOpen] = useState(false);

    // TOP-RIGHT POSITIONING
    const baseClasses = "md:hidden fixed top-4 right-4 z-50 transition-all duration-500 ease-in-out";
    const visibilityClass = visible ? "translate-y-0 opacity-100" : "-translate-y-32 opacity-0";

    // CASE 1: Legend Selected -> Single Action (Inscribe)
    if (isLegendSelected) {
        return (
            <div className={`${baseClasses} ${visibilityClass}`}>
                <button
                    onClick={onInscribe}
                    className="flex h-10 w-10 items-center justify-center rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all hover:scale-110 active:scale-95 bg-[#F5B800] text-black border border-white/10"
                    title="Inscribe Moment"
                >
                    <Feather size={20} />
                </button>
            </div>
        );
    }

    // CASE 2: Home Screen -> Menu (Forge vs Inscribe) via Bottom Sheet
    return (
        <>
            <div className={`${baseClasses} ${visibilityClass}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all active:scale-95 border border-white/10 z-20 bg-[#F5B800] text-black`}
                    title="Actions"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* BOTTOM SHEET MODAL */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end md:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
                    <div className="w-full bg-[#18181b] rounded-t-2xl p-6 relative z-10 animate-slide-up border-t border-white/10 pb-10">
                        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Quick Actions</h3>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => { onForge(); setIsOpen(false); }}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 active:scale-[0.98] transition-all"
                            >
                                <div className="h-10 w-10 rounded-full bg-[#F5B800] text-black flex items-center justify-center">
                                    <Plus size={20} />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-white uppercase tracking-wider">Forge Legend</h4>
                                    <p className="text-[10px] text-gray-400">Create a new character profile</p>
                                </div>
                            </button>

                            <button
                                onClick={() => { onInscribe(); setIsOpen(false); }}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 active:scale-[0.98] transition-all"
                            >
                                <div className="h-10 w-10 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center">
                                    <Feather size={20} />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-white uppercase tracking-wider">Inscribe Moment</h4>
                                    <p className="text-[10px] text-gray-400">Log a note, image, or stat</p>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full mt-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-gray-500"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

// --- MAIN APP ---

export default function App() {
    const [isGameView, setIsGameView] = useState(false);

    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [activeGameName, setActiveGameName] = useState<string | null>(null);

    // Data State
    const [legendsData, setLegendsData] = useState<Legend[]>(INITIAL_DATA.legends);
    const [worldsData, setWorldsData] = useState<Game[]>(GAMES);

    // Custom Order State (Persistence)
    const [customLegendOrder, setCustomLegendOrder] = useState<number[]>([]);
    const [customGameOrder, setCustomGameOrder] = useState<string[]>([]);

    const [selectedLegend, setSelectedLegend] = useState<Legend | null>(null);
    const [viewingMemory, setViewingMemory] = useState<Moment | null>(null);

    const [isFoundryOpen, setIsFoundryOpen] = useState(false);
    const [foundryTargetId, setFoundryTargetId] = useState<number | null>(null);
    const [foundryMode, setFoundryMode] = useState('log');
    const [foundryInitialType, setFoundryInitialType] = useState<Moment['type'] | null>(null);

    const [isGridLayout, setIsGridLayout] = useState(true);
    const [availableTags, setAvailableTags] = useState(DEFAULT_TAGS);

    // Sorting & Reorder State
    const [isReorderMode, setIsReorderMode] = useState(false);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    // Mobile UI State
    const [isUiVisible, setIsUiVisible] = useState(true);
    const lastScrollY = useRef(0);

    // Initialize custom orders on load if empty
    useEffect(() => {
        if (customLegendOrder.length === 0) {
            setCustomLegendOrder(legendsData.map(l => l.id));
        }
        if (customGameOrder.length === 0) {
            setCustomGameOrder(worldsData.map(g => g.id));
        }
    }, []);

    // --- SCROLL LISTENER FOR UI VISIBILITY ---
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Threshold of 10px to prevent jitter
            if (currentScrollY > lastScrollY.current + 10 && currentScrollY > 100) {
                setIsUiVisible(false); // Scrolling DOWN -> Hide
            } else if (currentScrollY < lastScrollY.current - 10) {
                setIsUiVisible(true); // Scrolling UP -> Show
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // --- FILTERING ---
    const filteredLegends = activeFilter ? legendsData.filter(l => l.game === worldsData.find(g => g.id === activeFilter)?.name) : legendsData;

    // --- SORTING LOGIC (ALWAYS CUSTOM ORDER) ---
    const getSortedLegends = () => {
        let sorted = [...filteredLegends];
        sorted.sort((a, b) => {
            const indexA = customLegendOrder.indexOf(a.id);
            const indexB = customLegendOrder.indexOf(b.id);
            return (indexA === -1 ? 9999 : indexA) - (indexB === -1 ? 9999 : indexB);
        });
        return sorted;
    };

    const getSortedGames = () => {
        let sorted = [...worldsData];
        sorted.sort((a, b) => {
            const indexA = customGameOrder.indexOf(a.id);
            const indexB = customGameOrder.indexOf(b.id);
            return (indexA === -1 ? 9999 : indexA) - (indexB === -1 ? 9999 : indexB);
        });
        return sorted;
    };

    const sortedLegends = getSortedLegends();
    const sortedGames = getSortedGames();

    // --- DRAG AND DROP HANDLERS (DESKTOP) ---
    const onDragStart = (e: React.DragEvent, index: number) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const onDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        handleMove(index);
    };

    // --- TOUCH HANDLERS (MOBILE REORDER) ---
    const onTouchStart = (index: number) => {
        // NOTE: We do not check isReorderMode here because mobile handles are always visible in list view
        setDraggedItemIndex(index);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (draggedItemIndex === null) return;

        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);

        const row = target?.closest('[data-reorder-index]');
        if (row) {
            const targetIndex = parseInt(row.getAttribute('data-reorder-index') || '-1');
            if (targetIndex !== -1) {
                handleMove(targetIndex);
            }
        }
    };

    const onTouchEnd = () => {
        setDraggedItemIndex(null);
    };

    // Shared Move Logic
    const handleMove = (targetIndex: number) => {
        if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

        if (isGameView) {
            // Reorder Games
            const newGames = [...sortedGames];
            const draggedItem = newGames[draggedItemIndex];
            newGames.splice(draggedItemIndex, 1);
            newGames.splice(targetIndex, 0, draggedItem);

            const newOrder = newGames.map(g => g.id);
            setCustomGameOrder(newOrder);
            setDraggedItemIndex(targetIndex);
        } else {
            // Reorder Legends
            const newLegends = [...sortedLegends];
            const draggedItem = newLegends[draggedItemIndex];
            newLegends.splice(draggedItemIndex, 1);
            newLegends.splice(targetIndex, 0, draggedItem);

            const newOrder = newLegends.map(l => l.id);
            setCustomLegendOrder(newOrder);
            setDraggedItemIndex(targetIndex);
        }
    };

    const onDragEnd = () => {
        setDraggedItemIndex(null);
    };

    // --- ACTIONS ---

    const handleWorldSelect = (worldId: string | null) => {
        if (worldId === null) {
            setActiveFilter(null);
            setActiveGameName(null);
        } else {
            setActiveFilter(worldId);
            setActiveGameName(worldsData.find(g => g.id === worldId)?.name || null);
            setIsGameView(false);
        }
    };

    const openFoundry = (mode = 'log', legendId: number | null = null, type: Moment['type'] | null = null) => {
        setFoundryMode(mode);
        setFoundryTargetId(legendId);
        setFoundryInitialType(type);
        setIsFoundryOpen(true);
    };

    const handleInscribeMemory = (legendId: number, newMemory: Moment) => {
        setLegendsData(prev => {
            const memoryToAdd = { id: newMemory.id || Date.now(), ...newMemory };
            const updated = prev.map(l => l.id === legendId ? { ...l, memories: [memoryToAdd, ...l.memories] } : l);
            if (selectedLegend?.id === legendId) setSelectedLegend(updated.find(l => l.id === legendId) || null);
            return updated;
        });
        setViewingMemory({ id: newMemory.id || Date.now(), ...newMemory });
    };

    const handleUpdateMemory = (legendId: number, updatedMemory: Moment) => {
        setLegendsData(prev => {
            const updated = prev.map(l => {
                if (l.id === legendId) {
                    return {
                        ...l,
                        memories: l.memories.map(m => m.id === updatedMemory.id ? { ...m, ...updatedMemory } : m)
                    };
                }
                return l;
            });
            if (selectedLegend?.id === legendId) {
                setSelectedLegend(updated.find(l => l.id === legendId) || null);
            }
            return updated;
        });
    };

    const handleDeleteMemory = (memoryId: number) => {
        if (!selectedLegend) return;
        const updatedLegend = { ...selectedLegend, memories: selectedLegend.memories.filter(m => m.id !== memoryId) };
        setLegendsData(prev => prev.map(l => l.id === selectedLegend.id ? updatedLegend : l));
        setSelectedLegend(updatedLegend);
    };

    const handleCreateLegend = (newLegend: Partial<Legend>) => {
        // @ts-expect-error - TS expects all fields but we fill them
        const completeLegend: Legend = {
            id: Date.now(),
            gallery: [],
            memories: [],
            visage: null,
            imagePosition: "center",
            epitaph: "",
            tags: [],
            color: "bg-gray-800",
            ...newLegend
        };
        const newLegendsData = [completeLegend, ...legendsData];
        setLegendsData(newLegendsData);
        // Add to custom order
        setCustomLegendOrder([completeLegend.id, ...customLegendOrder]);
        // Note: We don't call setSelectedLegend(completeLegend) here anymore
        // because the user wants to see the card slot into the home page instead.
    };

    const handleUpdateLegend = (updatedLegend: Legend) => {
        if (updatedLegend.tags) {
            const newTags = updatedLegend.tags.filter(t => !availableTags.includes(t));
            if (newTags.length > 0) setAvailableTags([...availableTags, ...newTags]);
        }
        setLegendsData(prev => prev.map(l => l.id === updatedLegend.id ? updatedLegend : l));
        setSelectedLegend(updatedLegend);
    };

    const handleDeleteLegend = (id: number) => {
        setLegendsData(prev => prev.filter(l => l.id !== id));
        setCustomLegendOrder(prev => prev.filter(lid => lid !== id));
        setSelectedLegend(null);
    }

    const handleDeleteTagFromDb = (tagToDelete: string) => {
        setAvailableTags(prev => prev.filter(t => t !== tagToDelete));
    }

    const handleHome = () => {
        setIsGameView(false);
        setActiveFilter(null);
        setActiveGameName(null);
        setSelectedLegend(null);
    }

    // --- HELPER FOR CONTROL DECK ALIGNMENT ---
    const getControlDeckClasses = () => {
        if (!isGridLayout) return "max-w-4xl mx-auto"; // List View: Centered matching list width
        if (isGameView) return "md:px-12"; // Game Grid: Matches grid padding
        return ""; // Legend Grid: Full width (no extra padding)
    };

    return (
        <div className="min-h-screen bg-[#0f1115] text-gray-100 font-sans selection:bg-[#F5B800]/30 relative">
            <GlobalStyles />
            <NavigationSidebar
                onForge={() => openFoundry('create')}
                onInscribe={() => openFoundry('log', selectedLegend?.id)}
                onHome={handleHome}
                visible={isUiVisible}
            />

            {/* Main Content Area - Responsive Layout */}
            <main className="w-full pl-0 md:pl-20 transition-all duration-300">
                <div className="mx-auto max-w-7xl p-4 md:p-6 min-h-[100vh] pt-24 md:pt-16 pb-32">

                    {/* VIEW: LEGENDS (LIBRARY) */}
                    <>
                        {/* Header */}
                        <header className="mb-10 mt-2 md:mt-8 relative animate-in fade-in slide-in-from-top-4 duration-700">
                            <div className="text-center">
                                <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-normal text-white drop-shadow-2xl mb-2 leading-none transition-all">{isGameView ? 'Games' : 'Legends'}</h1>
                                <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-[#F5B800] to-transparent shadow-[0_0_15px_rgba(245,184,0,0.6)] mx-auto mb-4"></div>
                            </div>
                        </header>

                        {/* CONTROL DECK (Sticky Top on Mobile & Desktop) */}
                        <div
                            className={`
                        sticky top-16 z-30 mb-8 px-4 md:px-0 transition-all duration-500 ease-in-out
                        md:top-6
                        ${isUiVisible
                                    ? 'translate-y-0 opacity-100 pointer-events-auto'
                                    : '-translate-y-20 opacity-0 pointer-events-none md:translate-y-0 md:opacity-100 md:pointer-events-auto'}
                    `}
                        >
                            <div className={`w-full flex items-center justify-between gap-3 md:gap-4 relative transition-all duration-300 ${getControlDeckClasses()}`}>

                                {/* --- MOBILE CONTROL OVERLAY (Simplified - No Reorder Button) --- */}
                                <div className="md:hidden flex w-full justify-center pointer-events-none relative z-20">
                                    <div className="pointer-events-auto bg-[#18181b] border border-white/10 rounded-full p-1.5 pl-3 pr-3 flex items-center shadow-2xl gap-3">
                                        {/* FILTER */}
                                        {activeFilter ? (
                                            <button
                                                onClick={() => handleWorldSelect(null)}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5B800]/20 text-[#F5B800] text-[10px] font-bold uppercase tracking-widest hover:bg-[#F5B800]/30 transition-all"
                                            >
                                                {activeGameName} <X size={12} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setIsGameView(!isGameView)}
                                                className={`text-gray-400 hover:text-white transition-colors p-1`}
                                            >
                                                <Filter size={20} />
                                            </button>
                                        )}

                                        {/* DIVIDER */}
                                        <div className="w-px h-5 bg-white/10"></div>

                                        {/* VIEW TOGGLE */}
                                        <button
                                            onClick={() => setIsGridLayout(!isGridLayout)}
                                            className={`p-1 text-gray-400 hover:text-white transition-colors`}
                                        >
                                            {isGridLayout ? <List size={20} /> : <Grid size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* --- DESKTOP CONTROLS (With Reorder) --- */}
                                <div className="hidden md:flex w-full items-center justify-between gap-4">
                                    {/* Filter (Left) */}
                                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-xl flex items-center gap-2">
                                        {activeFilter ? (
                                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                                                <button onClick={() => handleWorldSelect(null)} className="group flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5B800]/10 border border-[#F5B800]/30 text-[#F5B800] text-xs font-bold uppercase tracking-widest hover:bg-[#F5B800]/20 transition-all font-sans">{activeGameName} <X size={12} className="opacity-50 group-hover:opacity-100" /></button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setIsGameView(!isGameView)}
                                                disabled={isReorderMode}
                                                className={`flex items-center justify-center gap-3 px-6 h-10 rounded-full transition-all duration-300 ${isGameView ? 'bg-[#F5B800] text-black shadow-[0_0_15px_rgba(245,184,0,0.5)]' : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5'} ${isReorderMode ? 'opacity-30 cursor-not-allowed' : ''}`}
                                            >
                                                <Filter size={16} />
                                                <span className="text-xs font-bold uppercase tracking-widest">Filter</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Right Group: Reorder + View */}
                                    <div className="flex items-center gap-3">
                                        {/* Reorder Actions (Desktop Only) */}
                                        <div className="flex items-center gap-2">
                                            {isReorderMode ? (
                                                <button
                                                    onClick={() => setIsReorderMode(false)}
                                                    className="h-12 px-8 bg-[#F5B800] text-black rounded-full shadow-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs animate-in zoom-in"
                                                >
                                                    <Check size={18} /> Done
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setIsReorderMode(true)}
                                                    className={`h-12 w-12 flex items-center justify-center rounded-full border shadow-xl transition-all backdrop-blur-xl bg-black/60 text-gray-400 border-white/10 hover:text-white`}
                                                    title="Reorder Mode"
                                                >
                                                    <Move size={18} />
                                                </button>
                                            )}
                                        </div>

                                        {/* View */}
                                        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-xl flex items-center">
                                            <button
                                                onClick={() => setIsGridLayout(false)}
                                                className={`h-10 w-10 flex items-center justify-center rounded-full transition-all ${!isGridLayout ? 'bg-white/20 text-white shadow-inner' : 'text-gray-500 hover:text-white'}`}
                                            >
                                                <List size={18} />
                                            </button>
                                            <button
                                                onClick={() => setIsGridLayout(true)}
                                                className={`h-10 w-10 flex items-center justify-center rounded-full transition-all ${isGridLayout ? 'bg-white/20 text-white shadow-inner' : 'text-gray-500 hover:text-white'}`}
                                            >
                                                <Grid size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isGameView ? (
                            /* GAMES GRID */
                            isGridLayout ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-2 md:px-12 animate-in zoom-in-95 duration-500">
                                    {sortedGames.map((game, index) => (
                                        <div
                                            key={game.id}
                                            data-reorder-index={index}
                                            draggable={isReorderMode}
                                            onDragStart={(e) => onDragStart(e, index)}
                                            onDragOver={(e) => onDragOver(e, index)}
                                            onDragEnd={onDragEnd}
                                            onTouchStart={() => isReorderMode && onTouchStart(index)} // Desktop Grid Reorder only via toggle
                                            onTouchMove={onTouchMove}
                                            onTouchEnd={onTouchEnd}
                                            className={`transition-all duration-300 ${draggedItemIndex === index ? 'opacity-50 scale-95' : 'opacity-100'}`}
                                        >
                                            <button
                                                onClick={() => !isReorderMode && handleWorldSelect(game.id)}
                                                className={`group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#18181b] shadow-2xl transition-all duration-300 gpu-accelerated text-left
                                            ${isReorderMode ? 'hover:scale-[1.02] cursor-grab active:cursor-grabbing ring-2 ring-white/10 border-2 border-dashed border-white/20 touch-none' : 'hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/5 hover:ring-[#F5B800]/50'}
                                        `}
                                            >
                                                {/* --- REORDER HANDLE (Desktop Mode) --- */}
                                                {isReorderMode && (
                                                    <div className="absolute top-4 right-4 z-50 bg-black/60 backdrop-blur rounded-full p-2 text-white border border-white/20 shadow-lg pointer-events-none">
                                                        <GripVertical size={20} />
                                                    </div>
                                                )}

                                                {/* Real Image with Grayscale Filter by Default */}
                                                {game.image ? (
                                                    <img
                                                        src={game.image}
                                                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100`}
                                                        alt={game.name}
                                                    />
                                                ) : (
                                                    <div className={`absolute inset-0 ${game.cover} opacity-60 group-hover:opacity-80 transition-all duration-700`}></div>
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-60 transition-opacity pointer-events-none"></div>

                                                <div className="absolute bottom-0 left-0 right-0 p-8 text-center transform translate-y-2 group-hover:translate-y-0 transition-transform pointer-events-none">
                                                    <span className="text-2xl font-display font-bold uppercase tracking-wide text-white shadow-black drop-shadow-lg leading-tight block">{game.name}</span>
                                                </div>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 pb-20 max-w-4xl mx-auto animate-in fade-in duration-500">
                                    {sortedGames.map((game, index) => (
                                        <div
                                            key={game.id}
                                            data-reorder-index={index}
                                            draggable={isReorderMode}
                                            onDragStart={(e) => onDragStart(e, index)}
                                            onDragOver={(e) => onDragOver(e, index)}
                                            onDragEnd={onDragEnd}
                                            className={`group flex items-center gap-6 rounded-2xl border border-white/10 bg-[#18181b] p-4 shadow-lg shadow-black/40 transition-all duration-300 hover:border-[#F5B800]/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] cursor-default relative
                                        ${draggedItemIndex === index ? 'opacity-50' : 'opacity-100'}
                                        ${isReorderMode ? 'cursor-grab active:cursor-grabbing border-dashed border-white/20 touch-none' : ''}
                                    `}
                                        >
                                            <div onClick={() => !isReorderMode && handleWorldSelect(game.id)} className={`h-20 w-16 shrink-0 rounded-xl overflow-hidden shadow-lg transition-transform cursor-pointer relative`}>
                                                {game.image ? <img src={game.image} className="w-full h-full object-cover" /> : <div className={`w-full h-full ${game.cover}`}></div>}
                                            </div>

                                            <div onClick={() => !isReorderMode && handleWorldSelect(game.id)} className="flex-grow cursor-pointer">
                                                <h3 className="text-lg md:text-2xl font-display font-bold uppercase tracking-wide text-white">{game.name}</h3>
                                            </div>

                                            {!isReorderMode && <div className="flex items-center gap-4 border-l border-white/10 pl-4"><button onClick={() => handleWorldSelect(game.id)} className="p-2 text-gray-500 hover:text-[#F5B800] hover:bg-[#F5B800]/10 rounded-full transition-all"><ChevronRight size={24} /></button></div>}

                                            {/* --- REORDER HANDLE --- */}
                                            {/* Visible if isReorderMode (Desktop) OR always on mobile list view (Persistent) */}
                                            <div
                                                className={`text-gray-500 pl-2 cursor-grab active:cursor-grabbing touch-none p-4 -mr-2 hover:text-[#F5B800]
                                            ${isReorderMode ? 'flex' : 'flex md:hidden'}
                                        `}
                                                onClick={(e) => e.stopPropagation()}
                                                onTouchStart={() => onTouchStart(index)}
                                                onTouchMove={onTouchMove}
                                                onTouchEnd={onTouchEnd}
                                            >
                                                <GripVertical size={24} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            /* LEGENDS GRID */
                            isGridLayout ? (
                                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 px-2 md:px-0 animate-in fade-in duration-700">
                                    {sortedLegends.map((legend, index) => (
                                        <div
                                            key={legend.id}
                                            data-reorder-index={index}
                                            onClick={() => !isReorderMode && setSelectedLegend(legend)}
                                            draggable={isReorderMode}
                                            onDragStart={(e) => onDragStart(e, index)}
                                            onDragOver={(e) => onDragOver(e, index)}
                                            onDragEnd={onDragEnd}
                                            onTouchStart={() => isReorderMode && onTouchStart(index)}
                                            onTouchMove={onTouchMove}
                                            onTouchEnd={onTouchEnd}
                                            className={`break-inside-avoid mb-6 group relative w-full min-h-[250px] cursor-pointer overflow-hidden rounded-2xl bg-[#18181b] shadow-2xl shadow-black/60 transition-all duration-300 gpu-accelerated
                                        ${index % 4 === 0 ? 'aspect-[3/4]' : index % 3 === 0 ? 'aspect-square' : 'aspect-video'}
                                        ${isReorderMode ? 'hover:scale-[1.02] cursor-grab active:cursor-grabbing ring-2 ring-white/10 border-2 border-dashed border-white/20 touch-none' : 'hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(245,184,0,0.25)]'}
                                        ${draggedItemIndex === index ? 'opacity-50' : 'opacity-100'}
                                    `}
                                        >
                                            {/* --- REORDER HANDLE --- */}
                                            {isReorderMode && (
                                                <div className="absolute top-4 right-4 z-50 bg-black/60 backdrop-blur rounded-full p-2 text-white border border-white/20 shadow-lg pointer-events-none">
                                                    <GripVertical size={20} />
                                                </div>
                                            )}

                                            {/* Card BG (Image) */}
                                            {legend.visage && <img src={legend.visage} className="absolute inset-0 w-full h-full object-cover transition-none" alt="Visage" />}

                                            {/* Standard Dim Layer (Removed on Hover for Spotlight effect) */}
                                            <div className="absolute inset-0 bg-black/20 group-hover:opacity-0 transition-opacity duration-300"></div>

                                            {/* HEAVY GRADIENT OVERLAY (Bottom 60%) */}
                                            <div className="absolute inset-0 card-gradient-overlay pointer-events-none"></div>

                                            {/* Content */}
                                            <div className="absolute inset-0 p-8 flex flex-col justify-end overflow-hidden">
                                                <div className="z-20 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                                                    {/* NAME FIRST */}
                                                    <h3 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tight text-white drop-shadow-lg leading-[0.9] mb-1">{legend.name}</h3>

                                                    {/* GAME SECOND - Styled as text */}
                                                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5B800] drop-shadow-md">
                                                        {legend.game}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Empty State */}
                                    {sortedLegends.length === 0 && (
                                        <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                                            <Feather size={48} className="mb-4 text-gray-600" />
                                            <p className="text-xl font-display uppercase tracking-widest text-gray-500">No Legends Found</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 max-w-4xl mx-auto pb-20 animate-in fade-in duration-700">
                                    {sortedLegends.map((legend, index) => (
                                        <div
                                            key={legend.id}
                                            data-reorder-index={index}
                                            onClick={() => !isReorderMode && setSelectedLegend(legend)}
                                            draggable={isReorderMode}
                                            onDragStart={(e) => onDragStart(e, index)}
                                            onDragOver={(e) => onDragOver(e, index)}
                                            onDragEnd={onDragEnd}
                                            className={`group relative flex items-center gap-6 rounded-2xl border border-white/10 bg-[#18181b] p-4 shadow-lg shadow-black/40 transition-all duration-300 hover:border-[#F5B800]/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] cursor-pointer
                                        ${draggedItemIndex === index ? 'opacity-50' : 'opacity-100'}
                                        ${isReorderMode ? 'cursor-grab active:cursor-grabbing border-dashed border-white/20 touch-none' : ''}
                                    `}
                                        >
                                            <div className={`h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 ${legend.color}`}>
                                                {legend.visage && <img src={legend.visage} className="h-full w-full object-cover" alt="Visage" />}
                                            </div>
                                            {/* FIXED HIERARCHY: NAME > GAME */}
                                            <div className="flex-grow">
                                                <h3 className="text-3xl font-display font-bold uppercase tracking-tight text-white leading-none mb-1">{legend.name}</h3>
                                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5B800] mb-1 flex items-center gap-2">
                                                    <span className="w-4 h-0.5 bg-[#F5B800]/50 rounded-full"></span>
                                                    {legend.game}
                                                </div>
                                                {/* EPITAPH HIDDEN ON MOBILE */}
                                                <p className="hidden md:block text-sm text-gray-500 font-serif italic truncate mt-1 max-w-md">"{legend.epitaph}"</p>
                                            </div>
                                            <div className="flex items-center gap-4 pr-4">
                                                {/* REMOVED MOMENTS COUNT ON MOBILE */}
                                                <div className="hidden md:block text-right">
                                                    <span className="block text-xl font-bold text-white">{legend.memories.length}</span>
                                                    <span className="text-[10px] text-gray-600 uppercase tracking-widest">Moments</span>
                                                </div>
                                                {/* REMOVE CHEVRON ON MOBILE FOR LEGEND LIST */}
                                                {!isReorderMode && <ChevronRight size={24} className="hidden md:block text-gray-600 group-hover:text-white transition-colors" />}
                                            </div>

                                            {/* --- REORDER HANDLE --- */}
                                            {/* Visible if isReorderMode (Desktop) OR always on mobile list view (Persistent) */}
                                            <div
                                                className={`text-gray-500 pl-2 cursor-grab active:cursor-grabbing touch-none p-4 -mr-2 hover:text-[#F5B800]
                                            ${isReorderMode ? 'flex' : 'flex md:hidden'}
                                        `}
                                                onClick={(e) => e.stopPropagation()}
                                                onTouchStart={() => onTouchStart(index)}
                                                onTouchMove={onTouchMove}
                                                onTouchEnd={onTouchEnd}
                                            >
                                                <GripVertical size={24} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </>
                </div>
            </main>

            {/* --- MODALS & OVERLAYS --- */}

            {/* Legend Detail View */}
            {selectedLegend && (
                <LegendTapestry
                    legend={selectedLegend}
                    onClose={() => setSelectedLegend(null)}
                    onUpdateLegend={handleUpdateLegend}
                    onAddMemory={(type) => openFoundry('log', selectedLegend.id, type)}
                    onDeleteLegend={handleDeleteLegend}
                    availableTags={availableTags}
                    onDeleteTagFromDb={handleDeleteTagFromDb}
                    setViewingMemory={setViewingMemory}
                    worldsData={worldsData}
                />
            )}

            {/* Memory Viewer */}
            {viewingMemory && (
                <MomentViewer
                    memory={viewingMemory}
                    onClose={() => setViewingMemory(null)}
                    onSave={(updated) => handleUpdateMemory(selectedLegend!.id, updated)}
                    handleCopy={(text) => navigator.clipboard.writeText(text)}
                    onDelete={handleDeleteMemory}
                />
            )}

            {/* Foundry (Create/Log) */}
            {isFoundryOpen && (
                <FoundryModal
                    legends={legendsData}
                    onClose={() => setIsFoundryOpen(false)}
                    onInscribe={handleInscribeMemory}
                    onCreateLegend={handleCreateLegend}
                    initialLegendId={foundryTargetId}
                    initialMode={foundryMode}
                    initialInscribeType={foundryInitialType}
                    worldsData={worldsData}
                    availableTags={availableTags}
                />
            )}

            {/* Mobile FAB */}
            <SmartFAB
                isLegendSelected={!!selectedLegend}
                onInscribe={() => openFoundry('log', selectedLegend?.id)}
                onForge={() => openFoundry('create')}
                visible={isUiVisible}
            />

        </div>
    );
}
