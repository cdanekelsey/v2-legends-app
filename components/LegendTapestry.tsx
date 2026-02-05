
import React, { useState, useRef, useEffect } from 'react';
import {
    ChevronLeft, MoreHorizontal, Trash2,
    PlayCircle, Quote, Shield, ExternalLink,
    Image as ImageIcon, Feather, Plus, Share2, Tag, X,
    Edit3, ChevronRight, Gamepad2, Sparkles, ChevronDown, Link as LinkIcon, Edit2
} from 'lucide-react';
import { Legend, Moment, Game } from '../types';
import EditDrawer from './EditDrawer';
import FoundryModal from './FoundryModal';

interface LegendTapestryProps {
    legend: Legend;
    onClose: () => void;
    onUpdateLegend: (legend: Legend) => void;
    onAddMemory: (type?: Moment['type']) => void;
    onDeleteLegend: (id: number) => void;
    availableTags?: string[];
    onDeleteTagFromDb?: (tag: string) => void;
    setViewingMemory: (memory: Moment) => void;
    worldsData: Game[];
}

const LegendTapestry: React.FC<LegendTapestryProps> = ({ legend, onClose, onUpdateLegend, onAddMemory, onDeleteLegend, setViewingMemory, worldsData, availableTags, onDeleteTagFromDb }) => {
    // STATE
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

    // Inline Edit State
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEpitaph, setIsEditingEpitaph] = useState(false);
    const [name, setName] = useState(legend.name);
    const [epitaph, setEpitaph] = useState(legend.epitaph);
    const [gameName, setGameName] = useState(legend.game);

    // Inline Tags State
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [newTag, setNewTag] = useState("");
    const [showAllTags, setShowAllTags] = useState(false);
    const MAX_VISIBLE_TAGS = 5;

    // References
    const carouselRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const epitaphInputRef = useRef<HTMLTextAreaElement>(null);
    const tagInputRef = useRef<HTMLInputElement>(null);
    const mobileTagInputRef = useRef<HTMLInputElement>(null);

    // Desktop Name Ref for Scroll Calculation
    const desktopNameRef = useRef<HTMLDivElement>(null);

    // Scroll State
    const [isPastHero, setIsPastHero] = useState(false);

    // Sync State
    useEffect(() => {
        setName(legend.name);
        setEpitaph(legend.epitaph);
        setGameName(legend.game);
    }, [legend]);

    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, [isEditingName]);

    useEffect(() => {
        if (isEditingEpitaph && epitaphInputRef.current) {
            epitaphInputRef.current.focus();
        }
    }, [isEditingEpitaph]);

    useEffect(() => {
        if (isAddingTag) {
            setTimeout(() => {
                if (tagInputRef.current) tagInputRef.current.focus();
                if (mobileTagInputRef.current) mobileTagInputRef.current.focus();
            }, 50);
        }
    }, [isAddingTag]);

    const handleScroll = () => {
        // Desktop Sticky Name Logic
        // We use getBoundingClientRect to check if the main Legend Name has scrolled 
        // past the top header area (approx 100px from top of viewport).
        if (desktopNameRef.current) {
            const rect = desktopNameRef.current.getBoundingClientRect();
            // isPastHero becomes true only when the BOTTOM of the name element 
            // is higher than 100px from the top of the screen (i.e. covered by header)
            setIsPastHero(rect.bottom < 100);
        }
    };

    const handleSave = () => {
        setIsEditingName(false);
        setIsEditingEpitaph(false);
        if (name !== legend.name || epitaph !== legend.epitaph || gameName !== legend.game) {
            onUpdateLegend({ ...legend, name, epitaph, game: gameName });
        }
    };

    const handleAddTag = () => {
        if (newTag.trim() && !legend.tags.includes(newTag.trim())) {
            const updatedTags = [...legend.tags, newTag.trim()];
            onUpdateLegend({ ...legend, tags: updatedTags });
            setNewTag("");
            setIsAddingTag(false);
        } else {
            setIsAddingTag(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: legend.name,
                text: `Check out ${legend.name} in Legends.`,
                url: window.location.href,
            }).catch(console.error);
        }
    };

    const scrollCarousel = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = carouselRef.current.offsetWidth * 0.8;
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Filter Memories
    const visualMemories = legend.memories.filter(m => m.type === 'image' || m.type === 'video');
    const noteMemories = legend.memories.filter(m => ['note', 'stat', 'link', 'quote'].includes(m.type));
    const sortedNotes = [...noteMemories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Fallback Image
    const activeImage = legend.visage || (legend.gallery && legend.gallery.length > 0 ? legend.gallery[0] : null);

    // Tag Display Logic
    const visibleTags = showAllTags ? legend.tags : legend.tags.slice(0, MAX_VISIBLE_TAGS);
    const hasMoreTags = legend.tags.length > MAX_VISIBLE_TAGS;

    // --- CARD RENDERER ---
    const renderNoteCard = (note: Moment) => {
        if (note.type === 'stat') {
            return (
                <div key={note.id} onClick={() => setViewingMemory(note)} className="group relative p-6 bg-[#1a1d23] border border-white/10 hover:border-[#F5B800]/50 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="p-2 rounded bg-[#F5B800]/10 text-[#F5B800]"><Shield size={18} /></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#F5B800]">System Log</span>
                        <span className="ml-auto text-[10px] text-gray-600 font-mono">{note.date}</span>
                    </div>
                    <h4 className="font-bold text-white uppercase tracking-wide mb-3">{note.caption || "Build Data"}</h4>
                    <p className="font-mono text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{note.note}</p>
                    {note.rating && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Efficiency</span>
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (<div key={i} className={`h-1.5 w-4 rounded-full ${i < Math.round((note.rating || 0) / 2) ? 'bg-[#F5B800]' : 'bg-gray-800'}`}></div>))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        if (note.type === 'link') {
            return (
                <div key={note.id} onClick={() => setViewingMemory(note)} className="group p-6 bg-blue-950/10 border border-blue-500/20 hover:bg-blue-900/20 hover:border-blue-400/50 rounded-2xl cursor-pointer transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-2 rounded-full bg-blue-500/20 text-blue-400"><LinkIcon size={20} /></div>
                        <ExternalLink size={16} className="text-blue-400/50 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <h4 className="font-bold text-blue-100 text-lg mb-2 group-hover:underline decoration-blue-400/50 underline-offset-4">{note.caption || "External Uplink"}</h4>
                    <p className="text-sm text-blue-200/60 line-clamp-2 mb-4">{note.url}</p>
                    {note.note && <p className="text-xs text-gray-400 border-t border-blue-500/10 pt-4 mt-4">{note.note}</p>}
                </div>
            )
        }
        if (note.type === 'quote') {
            return (
                <div key={note.id} onClick={() => setViewingMemory(note)} className="group p-6 bg-white/5 border border-white/10 hover:border-white/30 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[160px]">
                    <Quote size={24} className="text-[#F5B800] mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <p className="font-serif italic text-lg text-gray-200 leading-relaxed">"{note.note}"</p>
                    {note.caption && <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">— {note.caption}</p>}
                </div>
            )
        }
        return (
            <div key={note.id} onClick={() => setViewingMemory(note)} className="group relative p-6 glass-card bg-[#1a1d23]/40 border border-white/5 hover:border-[#F5B800]/30 rounded-2xl cursor-pointer transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#F5B800] transition-colors">
                            <Feather size={16} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-white group-hover:text-[#F5B800] transition-colors font-display tracking-wide text-sm md:text-base">{note.caption || "Journal Entry"}</h4>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{note.date}</p>
                        </div>
                    </div>
                </div>
                <div className="text-gray-400 leading-relaxed pl-3 border-l border-white/10 group-hover:border-[#F5B800]/30 transition-colors">
                    <p className="line-clamp-3 font-serif italic text-base md:text-lg">{note.note}</p>
                </div>
            </div>
        );
    };

    return (
        <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="fixed inset-0 z-[100] bg-[#0f1115] overflow-y-auto scrollbar-hide md:custom-scrollbar md:pl-20"
        >

            {/* --- DESKTOP HEADER --- */}
            <header className="hidden md:flex w-full z-50 px-12 py-4 items-center justify-between sticky top-0 bg-[#0f1115]/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="group flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors relative z-10">
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Return to Library</span>
                    </button>
                </div>

                {/* Desktop Sticky Name */}
                <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500 ${isPastHero ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                    <span className="font-display font-bold uppercase text-xl text-white tracking-widest drop-shadow-lg">{name}</span>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <button onClick={handleShare} className="p-2.5 rounded-full border border-white/10 bg-black/40 hover:bg-black/60 text-white transition-all"><Share2 size={18} /></button>
                    <button onClick={() => setIsEditDrawerOpen(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-black/40 hover:bg-black/60 text-white transition-all">
                        <Edit3 size={16} className="text-[#F5B800]" /> <span>Update Dossier</span>
                    </button>
                </div>
            </header>

            {/* --- MOBILE ACTION BUTTONS (Floating, No Header) --- */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-start pointer-events-none">
                <button onClick={onClose} className="pointer-events-auto h-10 w-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-lg active:scale-95 transition-transform">
                    <ChevronLeft size={24} />
                </button>
                <button onClick={() => setIsEditDrawerOpen(true)} className="pointer-events-auto h-10 w-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-lg active:scale-95 transition-transform">
                    <Edit3 size={18} className="text-[#F5B800]" />
                </button>
            </div>

            {/* --- MOBILE CINEMATIC VIEW --- */}
            <div className="md:hidden relative w-full">

                {/* 1. FIXED BACKGROUND LAYER */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    {activeImage ? (
                        <img src={activeImage} className="w-full h-full object-cover" style={{ objectPosition: legend.imagePosition || 'center' }} alt={legend.name} />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${legend.color}`}></div>
                    )}
                    {/* Scrim: Transparent top -> Black bottom. Critical for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/30 to-transparent opacity-95"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#0f1115] to-transparent"></div>
                </div>

                {/* 2. SCROLLABLE CONTENT LAYER */}
                <div className="relative z-10 w-full">
                    {/* HERO SECTION - Takes 85% viewport initially to allow peek */}
                    <div className="min-h-[85vh] flex flex-col justify-end pb-12 px-6 items-center text-center">

                        {/* Game Badge */}
                        <div className="mb-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#F5B800] bg-black/60 backdrop-blur-md border border-[#F5B800]/20 rounded-full shadow-lg">
                                <Gamepad2 size={12} className="text-[#F5B800]" />
                                {gameName}
                            </div>
                        </div>

                        {/* Legend Name */}
                        <h1 className="text-6xl font-display font-black uppercase text-white leading-[0.85] tracking-tight drop-shadow-2xl mb-5 break-words">
                            {name}
                        </h1>

                        {/* Epitaph */}
                        <div className="mb-8 max-w-[85%] mx-auto">
                            <p className="text-white/90 font-serif italic text-lg leading-relaxed drop-shadow-lg">"{epitaph}"</p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {legend.tags.map(tag => (
                                <span key={tag} className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-widest text-gray-200">
                                    {tag}
                                </span>
                            ))}
                            {/* Mobile Add Tag Button */}
                            {isAddingTag ? (
                                <input
                                    ref={mobileTagInputRef}
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                    onBlur={handleAddTag}
                                    className="px-3 py-1.5 rounded-full bg-black/50 border border-[#F5B800] text-[10px] font-bold uppercase tracking-widest text-white w-24 focus:outline-none backdrop-blur-md"
                                    placeholder="Tag..."
                                />
                            ) : (
                                <button
                                    onClick={() => setIsAddingTag(true)}
                                    className="h-8 w-8 rounded-full border border-dashed border-white/30 flex items-center justify-center text-white/70 hover:text-white hover:border-white/60 transition-colors backdrop-blur-md bg-white/5"
                                >
                                    <Plus size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* CONTENT SECTION - Background kicks in here */}
                    <div className="bg-[#0f1115] relative z-20 pb-32">

                        {/* Edge-to-Edge Carousel */}
                        <div className="mb-12 pt-8">
                            <div className="px-6 flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Visual Feed</h3>
                                {visualMemories.length > 0 && <span className="text-[10px] font-bold text-gray-600">{visualMemories.length} Captured</span>}
                            </div>

                            <div className="w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory flex gap-4 px-6 pb-4">
                                {/* Add Button First if Empty */}
                                {visualMemories.length === 0 && (
                                    <div className="min-w-[40%] snap-center flex items-center justify-center">
                                        <button onClick={() => onAddMemory('image')} className="w-full aspect-video rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-gray-500 hover:text-[#F5B800] hover:bg-[#F5B800]/5 transition-all gap-2">
                                            <div className="p-3 rounded-full bg-white/5"><Plus size={20} /></div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Add Visual</span>
                                        </button>
                                    </div>
                                )}

                                {visualMemories.map(memory => (
                                    <div key={memory.id} onClick={() => setViewingMemory(memory)} className="min-w-[85vw] snap-center cursor-pointer">
                                        <div className="aspect-video glass-card overflow-hidden rounded-2xl relative border border-white/5 shadow-lg bg-[#1a1d23]">
                                            <img src={memory.src} className="w-full h-full object-cover" alt="Surveillance" />
                                            {memory.type === 'video' && <div className="absolute inset-0 flex items-center justify-center"><PlayCircle size={48} className="text-white/80" /></div>}
                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"><p className="text-white font-bold uppercase tracking-widest text-xs">{memory.caption}</p></div>
                                        </div>
                                    </div>
                                ))}

                                {visualMemories.length > 0 && (
                                    <div className="min-w-[20%] snap-center flex items-center justify-center">
                                        <button onClick={() => onAddMemory('image')} className="h-12 w-12 rounded-full border border-dashed border-gray-700 flex items-center justify-center text-gray-500 hover:text-[#F5B800]"><Plus size={20} /></button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* List Feed (Padded) */}
                        <div className="px-6 space-y-6">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Log Entries</h3>
                                <span className="text-[10px] font-bold text-gray-600">{sortedNotes.length} Records</span>
                            </div>

                            <div className="space-y-4">
                                {sortedNotes.length > 0 ? (
                                    sortedNotes.map(note => renderNoteCard(note))
                                ) : (
                                    <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
                                        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">No inscriptions recorded</p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4">
                                <button onClick={() => onAddMemory('note')} className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                                    <Plus size={16} /> Record New Entry
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* --- DESKTOP HERO (STANDARD DOSSIER) --- */}
            <div className="hidden md:block pt-24 pb-8 max-w-7xl mx-auto px-12 relative z-10 bg-[#0f1115]">
                <section className="grid grid-cols-12 gap-16 items-center py-8">
                    {/* LEFT: VISAGE CARD (RESTORED MASSIVE ASPECT) */}
                    <div className="col-span-6 relative group animate-in slide-in-from-left-4 fade-in duration-700 flex justify-center">
                        <div className={`absolute -inset-4 bg-gradient-to-br ${legend.color} blur-3xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-700`}></div>
                        <div className="w-full aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-[#1a1d23]">
                            {activeImage ? (
                                <img src={activeImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: legend.imagePosition || 'center' }} alt={legend.name} />
                            ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${legend.color} flex items-center justify-center`}>
                                    <div className="text-white/20 font-display text-9xl uppercase font-black tracking-tighter opacity-50 mix-blend-overlay">{legend.name.substring(0, 2)}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: DETAILS */}
                    <div className="col-span-6 space-y-6 animate-in slide-in-from-right-4 fade-in duration-700 delay-100">
                        {/* Game Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#F5B800] bg-black/40 backdrop-blur-md border border-[#F5B800]/20 rounded-full shadow-lg">
                            <Gamepad2 size={12} className="text-[#F5B800]" />
                            {gameName}
                        </div>

                        {/* Inline Editable Name */}
                        <div className="relative group/name" ref={desktopNameRef}>
                            {isEditingName ? (
                                <input
                                    ref={nameInputRef}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onBlur={handleSave}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                    className="w-full bg-transparent text-7xl font-display font-black text-white mb-4 editable-field focus:outline-none focus:bg-white/5 rounded-lg -ml-2 px-2 py-1 transition-colors uppercase leading-[0.9] border border-transparent focus:border-white/20"
                                />
                            ) : (
                                <h1
                                    onClick={() => setIsEditingName(true)}
                                    className="text-7xl font-display font-black text-white mb-4 -ml-2 px-2 py-1 leading-[0.9] uppercase cursor-pointer relative"
                                >
                                    {name}
                                    <span className="absolute top-1/2 -right-8 -translate-y-1/2 opacity-0 group-hover/name:opacity-100 transition-opacity text-gray-500">
                                        <Edit2 size={20} />
                                    </span>
                                </h1>
                            )}
                        </div>

                        <div className="relative pl-6 border-l-2 border-[#F5B800]/30 group/epitaph">
                            {isEditingEpitaph ? (
                                <textarea
                                    ref={epitaphInputRef}
                                    value={epitaph}
                                    onChange={(e) => setEpitaph(e.target.value)}
                                    onBlur={handleSave}
                                    rows={5}
                                    className="w-full bg-transparent text-2xl font-serif italic text-gray-300 leading-relaxed editable-field focus:outline-none focus:bg-white/5 rounded-lg p-2 transition-colors resize-none border border-transparent focus:border-white/20"
                                />
                            ) : (
                                <div>
                                    <p
                                        onClick={() => setIsEditingEpitaph(true)}
                                        className="text-2xl font-serif italic text-gray-300 leading-relaxed cursor-pointer line-clamp-3 hover:text-white transition-colors"
                                    >
                                        "{epitaph}"
                                    </p>
                                    <button
                                        onClick={() => setIsEditingEpitaph(true)}
                                        className="text-xs font-bold uppercase tracking-widest text-[#F5B800] mt-2 opacity-50 hover:opacity-100"
                                    >
                                        Read Full & Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Inline Tags */}
                        <div className="flex flex-wrap gap-2 pt-4 items-center">
                            {visibleTags.map(tag => (
                                <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:border-white/30 transition-all cursor-default">
                                    {tag}
                                </span>
                            ))}

                            {hasMoreTags && (
                                <button onClick={() => setShowAllTags(!showAllTags)} className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white">
                                    {showAllTags ? "Show Less" : `+${legend.tags.length - MAX_VISIBLE_TAGS} More`}
                                </button>
                            )}

                            {isAddingTag ? (
                                <input
                                    ref={tagInputRef}
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                    onBlur={handleAddTag}
                                    className="px-3 py-1 rounded-full bg-white/10 border border-[#F5B800] text-[10px] font-bold uppercase tracking-widest text-white w-24 focus:outline-none"
                                    placeholder="New Tag..."
                                />
                            ) : (
                                <button
                                    onClick={() => setIsAddingTag(true)}
                                    className="h-7 w-7 rounded-full border border-dashed border-white/20 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/50 transition-colors"
                                    title="Add Tag"
                                >
                                    <Plus size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            {/* --- DESKTOP CONTENT (Below Hero) --- */}
            <div className="hidden md:block relative z-10 bg-[#0f1115]">
                <div className="max-w-7xl mx-auto px-12">

                    {/* --- SURVEILLANCE CAROUSEL --- */}
                    <section className="py-20 border-t border-white/5">
                        <div className="flex items-end justify-between mb-8">
                            <div><h3 className="text-2xl font-display font-semibold text-white">Field Surveillance</h3><p className="text-gray-500 text-sm mt-1">Operational screen captures from active deployments</p></div>
                            <div className="flex gap-3">
                                <button onClick={() => scrollCarousel('left')} className="p-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-white"><ChevronLeft size={20} /></button>
                                <button onClick={() => scrollCarousel('right')} className="p-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-white"><ChevronRight size={20} /></button>
                            </div>
                        </div>

                        <div ref={carouselRef} className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                            {visualMemories.length > 0 ? (
                                visualMemories.map(memory => (
                                    <div key={memory.id} onClick={() => setViewingMemory(memory)} className="min-w-[60%] snap-center cursor-pointer group">
                                        <div className="aspect-video glass-card overflow-hidden rounded-2xl relative border border-white/5 hover:border-[#F5B800]/50 transition-all">
                                            <img src={memory.src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Surveillance" />
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                                            {memory.type === 'video' && <div className="absolute inset-0 flex items-center justify-center"><PlayCircle size={48} className="text-white opacity-80 group-hover:scale-110 transition-transform" /></div>}
                                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent"><p className="text-white font-bold uppercase tracking-widest text-sm">{memory.caption}</p></div>
                                        </div>
                                    </div>
                                ))
                            ) : <div className="min-w-[60%] snap-center"><div className="aspect-video glass-card overflow-hidden rounded-2xl flex items-center justify-center bg-[#1a1d23] border border-white/5"><div className="text-center px-10 opacity-30"><ImageIcon size={64} className="mx-auto mb-4" /><p className="uppercase tracking-widest text-xs font-bold">Surveillance Data Unavailable</p></div></div></div>}

                            <div className="min-w-[200px] snap-center flex items-center justify-center">
                                <button onClick={() => onAddMemory('image')} className="flex flex-col items-center gap-4 text-gray-600 hover:text-[#F5B800] transition-colors group">
                                    <div className="h-16 w-16 rounded-full border border-dashed border-gray-700 flex items-center justify-center group-hover:border-[#F5B800] group-hover:bg-[#F5B800]/10 transition-all"><Plus size={24} /></div>
                                    <span className="text-xs font-bold uppercase tracking-widest">Add Visual</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* --- STRATEGIC NOTES GRID --- */}
                    <section className="grid grid-cols-12 gap-12 py-10 md:border-t md:border-white/5">
                        <div className="col-span-4 space-y-6">
                            <div className="sticky top-24">
                                <h3 className="text-2xl font-display font-semibold text-white mb-4">Strategic Notes</h3>
                                <p className="text-gray-400 leading-relaxed text-sm">Refine tactical approaches, track evolution, and document specific build configurations for high-stakes missions.</p>
                                <div className="mt-8 p-6 glass-card border border-[#F5B800]/20 bg-[#F5B800]/5 rounded-2xl">
                                    <p className="text-[10px] uppercase tracking-widest text-[#F5B800] font-bold mb-3">Operational Status</p>
                                    <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-[#F5B800] animate-pulse shadow-[0_0_10px_#F5B800]"></div><span className="text-sm font-medium text-white">Monitoring Real-time Data</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-8 space-y-6 pb-20">
                            {sortedNotes.map(note => renderNoteCard(note))}
                            <button onClick={() => onAddMemory('note')} className="w-full py-12 rounded-3xl border-2 border-dashed border-white/5 hover:border-[#F5B800]/40 hover:bg-[#F5B800]/[0.02] transition-all flex flex-col items-center justify-center group">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Plus size={24} className="text-gray-400 group-hover:text-[#F5B800]" /></div>
                                <span className="text-sm font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">Record New Tactical Note</span>
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            {/* EDIT DRAWER MODAL */}
            {isEditDrawerOpen && (
                <EditDrawer
                    legend={legend}
                    onClose={() => setIsEditDrawerOpen(false)}
                    onSave={onUpdateLegend}
                    availableTags={availableTags}
                    onDeleteTagFromDb={onDeleteTagFromDb}
                />
            )}
        </div>
    );
};

export default LegendTapestry;
