
import React, { useState, useEffect } from 'react';
import { 
    Flame, Scroll, Heart, MessageCircle, Share2, 
    Bookmark, Gamepad2, ChevronRight, Search, Filter, X, Check, SlidersHorizontal
} from 'lucide-react';
import { Legend, Game } from '../types';
import { GAMES } from '../constants';

interface DiscoverFeedProps {
    legends: Legend[];
    onOpenLegend: (legend: Legend) => void;
    activeFilterId: string | null;
}

type ContentType = 'all' | 'moments' | 'legends';
type FeedTab = 'foryou' | 'following';

const DiscoverFeed: React.FC<DiscoverFeedProps> = ({ legends, onOpenLegend, activeFilterId }) => {
    // --- STATE ---
    const [activeTab, setActiveTab] = useState<FeedTab>('foryou');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    // Scroll State for Animation
    const [scrollY, setScrollY] = useState(0);
    
    // Filters
    const [filterType, setFilterType] = useState<ContentType>('all');
    const [selectedGames, setSelectedGames] = useState<string[]>([]);
    const [gameSearch, setGameSearch] = useState('');

    // --- SCROLL LISTENER ---
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // --- ANIMATION CALCULATIONS ---
    const largeTitleOpacity = Math.max(1 - scrollY / 60, 0);
    const largeTitleTranslateY = -(scrollY * 0.2); 
    const smallTitleOpacity = Math.max((scrollY - 40) / 40, 0);

    // --- DATA PREPARATION ---
    const allMoments = legends.flatMap(legend => 
        legend.memories.map(memory => ({
            ...memory,
            legendId: legend.id,
            legendName: legend.name,
            legendGame: legend.game,
            legendVisage: legend.visage,
            legendColor: legend.color
        }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const sortedLegends = [...legends].sort((a, b) => {
        const dateA = a.memories[0] ? new Date(a.memories[0].date).getTime() : 0;
        const dateB = b.memories[0] ? new Date(b.memories[0].date).getTime() : 0;
        return dateB - dateA;
    });

    const gameFilteredMoments = selectedGames.length > 0 
        ? allMoments.filter(m => selectedGames.includes(m.legendGame))
        : allMoments;

    const gameFilteredLegends = selectedGames.length > 0
        ? sortedLegends.filter(l => selectedGames.includes(l.game))
        : sortedLegends;

    const finalMoments = activeTab === 'following' ? gameFilteredMoments.slice(0, 2) : gameFilteredMoments;
    const finalLegends = activeTab === 'following' ? gameFilteredLegends.slice(0, 1) : gameFilteredLegends;

    const toggleGameFilter = (gameName: string) => {
        if (selectedGames.includes(gameName)) {
            setSelectedGames(prev => prev.filter(g => g !== gameName));
        } else {
            setSelectedGames(prev => [...prev, gameName]);
        }
    };

    const clearFilters = () => {
        setFilterType('all');
        setSelectedGames([]);
        setGameSearch('');
        setIsFilterOpen(false);
    };

    // Shared Tabs Component
    const FeedTabs = () => (
        <div className="flex items-center justify-between pb-3 px-4 md:px-0 w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-6 md:gap-10">
                <button 
                    onClick={() => setActiveTab('foryou')}
                    className={`text-sm md:text-base font-bold uppercase tracking-widest transition-all relative py-2 ${activeTab === 'foryou' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    For You
                    {activeTab === 'foryou' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F5B800] shadow-[0_0_10px_#F5B800]"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('following')}
                    className={`text-sm md:text-base font-bold uppercase tracking-widest transition-all relative py-2 ${activeTab === 'following' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Following
                    {activeTab === 'following' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F5B800] shadow-[0_0_10px_#F5B800]"></div>}
                </button>
            </div>

            <div className="flex-shrink-0">
                <button 
                    onClick={() => setIsFilterOpen(true)}
                    className={`p-2 rounded-full transition-all ${selectedGames.length > 0 || filterType !== 'all' ? 'text-[#F5B800] bg-[#F5B800]/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                >
                    <SlidersHorizontal size={20} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto pb-32 min-h-screen">
            
            {/* DESKTOP HEADER */}
            <div className="hidden md:block sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 pt-safe">
                <div className="max-w-4xl mx-auto flex flex-col">
                    <div className="h-24 flex items-center">
                         <h2 className="text-6xl font-display font-black uppercase text-white tracking-normal">
                            Discover
                        </h2>
                    </div>
                    <FeedTabs />
                </div>
            </div>

            {/* MOBILE HEADER LAYOUT */}
            <div className="md:hidden sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 h-[64px] flex items-center transition-all shadow-md">
                <div 
                    className="pl-16 transition-opacity duration-200 flex items-center h-full"
                    style={{ opacity: smallTitleOpacity }}
                >
                    <h2 className="text-2xl font-display font-black uppercase text-white tracking-wide">
                        Discover
                    </h2>
                </div>
            </div>

            <div 
                className="md:hidden px-4 pt-6 pb-2 pointer-events-none transition-all duration-75 origin-top-left"
                style={{ 
                    opacity: largeTitleOpacity,
                    transform: `translateY(${largeTitleTranslateY}px)`
                }}
            >
                <h1 className="text-5xl font-display font-black uppercase text-white tracking-normal">
                    Discover
                </h1>
            </div>

            <div className="md:hidden sticky top-[64px] z-30 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 py-2">
                <FeedTabs />
            </div>

            {/* --- FEED CONTENT --- */}
            <div className="max-w-4xl mx-auto px-4 md:px-0 pt-6">
                
                {/* 1. MOMENTS FEED */}
                {(filterType === 'all' || filterType === 'moments') && (
                    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {finalMoments.length === 0 ? (
                            <div className="text-center py-20 opacity-50">No moments found.</div>
                        ) : finalMoments.map((moment) => (
                            <div key={`${moment.legendId}-${moment.id}`} className="group bg-[#121212] border border-white/10 rounded-2xl overflow-hidden hover:border-[#F5B800]/50 hover:shadow-[0_0_30px_rgba(245,184,0,0.3)] transition-all duration-300 flex flex-col md:flex-row h-auto md:h-56">
                                {/* Thumbnail */}
                                <div 
                                    className="w-full md:w-1/3 shrink-0 relative cursor-pointer overflow-hidden border-b md:border-b-0 md:border-r border-white/5 h-48 md:h-auto"
                                    onClick={() => onOpenLegend(legends.find(l => l.id === moment.legendId)!)}
                                >
                                    {(moment.type === 'image' || moment.type === 'video') && moment.src ? (
                                        <img src={moment.src} className="w-full h-full object-cover transition-opacity duration-700 hover:opacity-90" alt="Moment" />
                                    ) : (
                                        <div className={`w-full h-full bg-gradient-to-br ${moment.legendColor} flex items-center justify-center`}>
                                            <Scroll size={40} className="text-white/20" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-2 py-1 rounded-md border border-white/10">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">{moment.type}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-grow p-6 flex flex-col justify-between">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-5 w-5 rounded bg-gray-800 overflow-hidden">
                                            {moment.legendVisage && <img src={moment.legendVisage} className="w-full h-full object-cover" />}
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#F5B800] cursor-pointer hover:underline" onClick={() => onOpenLegend(legends.find(l => l.id === moment.legendId)!)}>
                                            {moment.legendName}
                                        </span>
                                        <ChevronRight size={12} className="text-gray-600" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{moment.legendGame}</span>
                                        <span className="text-[10px] text-gray-600 ml-auto">{moment.date}</span>
                                    </div>
                                    <div className="cursor-pointer" onClick={() => onOpenLegend(legends.find(l => l.id === moment.legendId)!)}>
                                        <h3 className="text-xl font-bold font-display tracking-wide text-white mb-2 line-clamp-1 group-hover:text-[#F5B800] transition-colors">{moment.caption || "Untitled Memory"}</h3>
                                        <p className="text-sm text-gray-400 font-serif leading-relaxed line-clamp-2 md:line-clamp-3">{moment.note || moment.description || "No description provided..."}</p>
                                    </div>
                                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
                                        <button className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors group/btn"><Heart size={16} className="group-hover/btn:fill-current" /><span className="text-xs font-bold">{moment.likes || 0}</span></button>
                                        <button className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"><MessageCircle size={16} /><span className="text-xs font-bold">{moment.comments || 0}</span></button>
                                        <div className="flex-grow"></div>
                                        <button className="text-gray-500 hover:text-[#F5B800] transition-colors"><Bookmark size={18} /></button>
                                        <button className="text-gray-500 hover:text-white transition-colors"><Share2 size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 2. LEGENDS FEED */}
                {(filterType === 'legends') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
                        {finalLegends.map((legend) => (
                             <div key={legend.id} onClick={() => onOpenLegend(legend)} className="group relative aspect-video cursor-pointer overflow-hidden rounded-2xl bg-[#121212] border border-white/10 hover:border-[#F5B800]/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(245,184,0,0.3)]">
                                <div className={`absolute inset-0 bg-gradient-to-br ${legend.color} opacity-40`}></div>
                                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors"></div>
                                {legend.visage && <img src={legend.visage} className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay transition-opacity duration-700" />}
                                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                    <div className="flex justify-between items-end z-10">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Gamepad2 size={12} className="text-[#F5B800]" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#F5B800]">{legend.game}</span>
                                            </div>
                                            {/* Matching Card Style: Bold, Uppercase, No Italic */}
                                            <h3 className="text-4xl font-display font-bold uppercase text-white leading-none tracking-tight">{legend.name}</h3>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-xl font-bold text-white">{legend.memories.length}</span>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Moments</span>
                                        </div>
                                    </div>
                                    {/* Inner Border Overlay */}
                                    <div className="absolute inset-0 border-2 border-[#F5B800]/0 transition-all duration-300 group-hover:border-[#F5B800]/20 rounded-2xl pointer-events-none" />
                                </div>
                             </div>
                        ))}
                    </div>
                )}
                
                <div className="text-center mt-24 pb-12 opacity-50">
                    <Flame size={24} className="mx-auto text-gray-700 mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">End of the Stream</p>
                </div>
            </div>

            {/* --- FILTER MODAL (SHEET) --- */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={() => setIsFilterOpen(false)}></div>
                    <div className="bg-[#111] w-full md:max-w-md rounded-t-3xl md:rounded-2xl border-t md:border border-white/10 shadow-2xl pointer-events-auto animate-slide-up md:animate-zoom-in-95 max-h-[85vh] flex flex-col">
                        
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-lg font-bold uppercase tracking-widest text-white flex items-center gap-2">
                                <Filter size={18} className="text-[#F5B800]" /> Filter Feed
                            </h3>
                            <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Content Type</label>
                                <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                                    {(['all', 'moments', 'legends'] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setFilterType(type)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${filterType === type ? 'bg-[#F5B800] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Game</label>
                                <div className="relative group mb-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                    <input 
                                        value={gameSearch}
                                        onChange={(e) => setGameSearch(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-[#F5B800]/50 transition-all placeholder:text-gray-600"
                                        placeholder="Search games..."
                                    />
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                    {GAMES.filter(g => g.name.toLowerCase().includes(gameSearch.toLowerCase())).map(game => (
                                        <button 
                                            key={game.id}
                                            onClick={() => toggleGameFilter(game.name)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedGames.includes(game.name) ? 'bg-[#F5B800]/10 border-[#F5B800] text-white' : 'bg-transparent border-white/5 text-gray-400 hover:bg-white/5'}`}
                                        >
                                            <span className="text-sm font-bold">{game.name}</span>
                                            {selectedGames.includes(game.name) && <Check size={14} className="text-[#F5B800]" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-black/50 backdrop-blur-sm flex gap-4">
                            <button 
                                onClick={clearFilters}
                                className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                            >
                                Clear All
                            </button>
                            <button 
                                onClick={() => setIsFilterOpen(false)}
                                className="flex-[2] py-3 rounded-xl bg-[#F5B800] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#ffc94d] transition-colors shadow-[0_0_20px_rgba(251,189,35,0.2)]"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscoverFeed;
