
import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Shield, Save, Feather, ChevronDown, ChevronRight, Check, Plus, ImageIcon as ImageIcon2, User, ScrollText } from 'lucide-react';
import { Legend, Moment, Game } from '../types';
import { searchIGDB } from '../services/igdb';
import { DEFAULT_TAGS } from '../constants';
import ForgeWizard from './ForgeWizard';

interface FoundryModalProps {
    legends: Legend[];
    onClose: () => void;
    onInscribe: (legendId: number, memory: Moment) => void;
    onCreateLegend: (legend: Partial<Legend>) => void;
    initialLegendId: number | null;
    initialMode: string;
    worldsData: Game[];
    availableTags?: string[];
    initialMemory?: Moment | null;
    initialInscribeType?: Moment['type'] | null;
}

const FoundryModal: React.FC<FoundryModalProps> = ({ legends, onClose, onInscribe, onCreateLegend, initialLegendId = null, initialMode = 'log', worldsData, initialMemory = null, initialInscribeType = null }) => {
    const [mode] = useState(initialMode);
    const [searchQuery, setSearchQuery] = useState('');

    // INSCRIBE STATES
    const [inscribeStep, setInscribeStep] = useState(initialMemory || initialInscribeType ? 'editor' : 'type');
    const [selectedLegendId, setSelectedLegendId] = useState(initialLegendId || (legends.length > 0 ? legends[0].id : null));
    const [memoryType, setMemoryType] = useState<Moment['type']>(initialMemory?.type || initialInscribeType || 'note');
    const [caption, setCaption] = useState("");

    // IGDB / SEARCH STATES
    const [isSearching, setIsSearching] = useState(false);
    const [apiResults, setApiResults] = useState<Game[]>([]);
    const [content, setContent] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const visualInputRef = useRef<HTMLInputElement>(null);
    const forgeImageInputRef = useRef<HTMLInputElement>(null);

    // Handle Direct Open Logic (Visual vs Note)
    useEffect(() => {
        if (initialInscribeType) {
            setMemoryType(initialInscribeType);
            setInscribeStep('editor');
            if (initialInscribeType === 'image') {
                // Small delay to allow render before clicking
                setTimeout(() => visualInputRef.current?.click(), 100);
            }
        }
    }, [initialInscribeType]);

    // --- IGDB SEARCH EFFECT (Used for Inscribe dropdown if needed) ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setIsSearching(true);
                // Call our service
                const results = await searchIGDB(searchQuery);
                setApiResults(results);
                setIsSearching(false);
            } else {
                setApiResults([]);
            }
        }, 600); // 600ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Handler for Direct Action Flow
    const handleSelectType = (type: Moment['type']) => {
        setMemoryType(type);
        if (type === 'image') {
            visualInputRef.current?.click();
            setInscribeStep('editor');
        } else {
            setInscribeStep('editor');
        }
    };

    const handleSelectLegend = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedLegendId(parseInt(e.target.value));
    };

    const handleSubmitMemory = () => {
        if (!selectedLegendId) return;
        if (!content && memoryType !== 'image' && memoryType !== 'video' && memoryType !== 'stat' && memoryType !== 'note') return;

        const isRateMyBuild = memoryType === 'stat';
        const finalNote = content;
        const mockRating = initialMemory?.rating || (isRateMyBuild ? 3 : undefined);

        const memoryToSave: Moment = {
            id: initialMemory?.id || Date.now(),
            type: memoryType,
            caption: isRateMyBuild ? "SYSTEM DIAGNOSTIC" : caption,
            note: finalNote,
            description: "",
            date: initialMemory?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            isPinned: false,
            url: memoryType === 'link' ? content : undefined,
            rating: mockRating
        };

        onInscribe(selectedLegendId, memoryToSave);
        onClose();
    };



    // --- LEGACY FORGE LOGIC REMOVED ---

    const handleInscribeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setContent(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    // --- MERGE LOCAL AND API RESULTS ---
    const localFiltered = worldsData.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const displayGames = searchQuery.length > 2
        ? (apiResults.length > 0 ? apiResults : localFiltered)
        : localFiltered;

    // --- RENDER FORGE (CREATE) MODE ---
    if (mode === 'create') {
        return (
            <ForgeWizard
                onClose={onClose}
                onCreateLegend={onCreateLegend}
                worldsData={worldsData}
                legendsData={legends}
            />
        );
    }

    // --- RENDER INSCRIBE MODE ---
    if (mode === 'log') {
        const activeLegend = legends.find(l => l.id === selectedLegendId);
        const isVisualMode = memoryType === 'image' || memoryType === 'video';

        return (
            <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                <div className="absolute inset-0" onClick={onClose}></div>

                {/* STANDARD INSCRIBE MODAL */}
                <div className="w-full h-[90vh] md:h-auto md:max-h-[90vh] md:max-w-lg bg-[#0a0a0a] border-t md:border border-[#F5B800]/30 rounded-t-2xl md:rounded-2xl shadow-[0_0_50px_rgba(245,184,0,0.1)] overflow-hidden flex flex-col animate-slide-up md:animate-none z-10">

                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/50 shrink-0">
                        <div className="flex items-center gap-3">
                            <Feather size={20} className="text-[#F5B800]" />
                            <h2 className="text-xl font-bold uppercase tracking-widest text-white font-display">
                                {isVisualMode ? 'Add Visual' : 'Inscribe Note'}
                            </h2>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
                    </div>

                    {inscribeStep === 'type' && (
                        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-grow">

                            <div className="px-6 pt-6 pb-2">
                                <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-3 block">Inscribing For</label>
                                <div className="relative group">
                                    <div className={`flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-white/5 group-hover:border-[#F5B800]/50 transition-all cursor-pointer`}>
                                        <div className={`h-12 w-12 rounded-lg shrink-0 overflow-hidden border border-white/10 relative ${activeLegend?.color || 'bg-gray-800'}`}>
                                            {activeLegend?.visage ? <img src={activeLegend.visage} className="w-full h-full object-cover" alt="Visage" /> : <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900"></div>}
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="text-white font-bold uppercase tracking-widest text-sm group-hover:text-[#F5B800] transition-colors font-display text-lg">{activeLegend?.name}</h3>
                                            <p className="text-[10px] text-gray-500">{activeLegend?.game}</p>
                                        </div>
                                        <ChevronDown size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                                    </div>

                                    <select
                                        value={selectedLegendId || ''}
                                        onChange={handleSelectLegend}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    >
                                        {legends.map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="p-6 pt-2 flex flex-col gap-4">


                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <button
                                        onClick={() => handleSelectType('image')}
                                        className="flex flex-col items-center justify-center p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#F5B800] transition-all group gap-3 text-center"
                                    >
                                        <div className="p-4 rounded-full bg-black/50 text-[#F5B800] group-hover:scale-110 transition-transform">
                                            <Camera size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-sans font-bold uppercase tracking-widest text-white">Visual</h3>
                                            <p className="text-[10px] text-gray-500 mt-1">Capture a moment</p>
                                        </div>
                                    </button>

                                    <input type="file" ref={visualInputRef} className="hidden" accept="image/*" onChange={handleInscribeImageUpload} />

                                    <button
                                        onClick={() => handleSelectType('note')}
                                        className="flex flex-col items-center justify-center p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#F5B800] transition-all group gap-3 text-center"
                                    >
                                        <div className="p-4 rounded-full bg-black/50 text-[#F5B800] group-hover:scale-110 transition-transform">
                                            <Feather size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-sans font-bold uppercase tracking-widest text-white">Journal</h3>
                                            <p className="text-[10px] text-gray-500 mt-1">Write a log</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {inscribeStep === 'editor' && (
                        <div className="p-6 flex-grow flex flex-col space-y-6">
                            <div className="space-y-4 flex-grow flex flex-col">
                                <input
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className="w-full bg-transparent border-b border-white/20 p-2 text-white font-bold uppercase tracking-widest focus:border-[#F5B800] focus:outline-none placeholder:text-gray-600 font-display text-xl"
                                    placeholder="Title"
                                />
                                {isVisualMode ? (
                                    <div
                                        className="w-full h-48 bg-white/5 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-[#F5B800] hover:text-[#F5B800] transition-colors cursor-pointer overflow-hidden relative"
                                        onClick={() => visualInputRef.current?.click()}
                                    >
                                        {content ? <img src={content} className="w-full h-full object-cover" alt="Upload" /> : <><Camera size={32} /><span className="text-xs font-sans font-bold uppercase tracking-widest mt-2">Upload Visual</span></>}
                                        <input type="file" ref={visualInputRef} className="hidden" accept="image/*" onChange={handleInscribeImageUpload} />
                                    </div>
                                ) : (
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full flex-grow bg-white/5 border border-white/10 rounded-xl p-4 text-white font-serif focus:border-[#F5B800] focus:outline-none resize-none placeholder:text-gray-600"
                                        placeholder="Chronicle your journey..."
                                    />
                                )}
                            </div>
                            <div className="pt-4">
                                <button onClick={handleSubmitMemory} className="w-full py-4 rounded-xl bg-[#F5B800] text-black font-sans font-bold uppercase tracking-widest hover:bg-[#ffc94d] transition-colors flex items-center justify-center gap-2">
                                    <Check size={18} fill="currentColor" /> Inscribe
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

export default FoundryModal;
