import React, { useState, useRef, useCallback, useEffect } from "react";
import { X, Search, Check, ArrowLeft, Upload, Plus } from "lucide-react";
import { Legend, Game } from "../types";
import { getGameGradient, getGameThemeColor } from "../lib/gameUtils";
import { useKeyboardHeight } from "../hooks/use-keyboard-height";
import { useIsMobile } from "../hooks/use-mobile";
import { cn } from "../lib/utils";
import ImagePositionSelector from "./ImagePositionSelector";

interface ForgeWizardProps {
    onClose: () => void;
    onCreateLegend: (legend: Partial<Legend>) => void;
    worldsData: Game[];
    legendsData: Legend[];
}

const ForgeWizard = ({ onClose, onCreateLegend, worldsData, legendsData }: ForgeWizardProps) => {
    const [step, setStep] = useState(1);
    const [isForging, setIsForging] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGame, setSelectedGame] = useState<{ id: string; name: string; cover: string } | null>(null);
    const [legendName, setLegendName] = useState('');
    const [legendImage, setLegendImage] = useState<string | null>(null);
    const [imagePosition, setImagePosition] = useState("center");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);

    const keyboardHeight = useKeyboardHeight();
    const isMobile = useIsMobile();
    const isKeyboardOpen = keyboardHeight > 0;

    // Use worldsData for selection, fallback to library names
    const availableGames = worldsData.length > 0 ? worldsData.map(w => ({
        id: w.id,
        name: w.name,
        cover: w.cover || getGameGradient(w.name)
    })) : Array.from(new Set(legendsData.map(l => l.game))).map(gameName => ({
        id: gameName,
        name: gameName,
        cover: getGameGradient(gameName)
    }));

    const filteredGames = availableGames.filter(game =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleForgeComplete = () => {
        if (!legendName.trim()) return;
        setIsForging(true);

        // Reveal transition
        setTimeout(() => {
            onCreateLegend({
                name: legendName,
                game: selectedGame?.name || "Unknown Realm",
                visage: legendImage,
                // @ts-ignore
                imagePosition: imagePosition,
                color: selectedGame?.cover || getGameGradient(selectedGame?.name || "Unknown"),
            });
            onClose();
        }, 2000);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setLegendImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (step !== 1) return;
        requestAnimationFrame(() => {
            carouselRef.current?.scrollTo({ left: 0, behavior: "auto" });
        });
    }, [step, filteredGames.length]);

    const handleSelectGame = (gameName: string, cover: string) => {
        setSelectedGame({ id: gameName, name: gameName, cover });
        setStep(2);
    };

    const themeColor = selectedGame ? getGameThemeColor(selectedGame.name) : "#F5B800";

    return (
        <div
            className={cn(
                "fixed inset-0 z-[300] bg-[#0f1115] flex flex-col overflow-hidden overscroll-none animate-in fade-in duration-700",
                isMobile && "touch-none",
            )}
            style={{ "--glow-color": themeColor } as React.CSSProperties}
        >
            {/* Atmosphere Layer */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-x-0 -top-24 h-[50vh] opacity-30 blur-[120px] animate-atmosphere-glow"
                    style={{ background: themeColor }}
                />
                {legendImage ? (
                    <img
                        src={legendImage}
                        className="w-full h-full object-cover opacity-20 filter blur-xl transition-all duration-1000 scale-110"
                        alt="Atmosphere"
                        style={{ objectPosition: imagePosition }}
                    />
                ) : (
                    <div className={cn("w-full h-full opacity-10 transition-all duration-1000", selectedGame?.cover)} />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f1115]/80 via-[#0f1115] to-[#0f1115]" />
            </div>

            {/* Header / Close Button */}
            {!isForging && !(isKeyboardOpen && isMobile) && (
                <div className="relative z-50 flex items-center justify-between p-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shadow-glow" style={{ background: themeColor }}></div>
                        <span className="text-[10px] font-bold uppercase tracking-[.4em] text-white/40">Hall of Legends</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* Wizard Content */}
            <div
                className="relative z-10 flex-grow flex flex-col justify-center items-center p-8 h-full overflow-y-auto custom-scrollbar"
                style={isKeyboardOpen && isMobile ? { marginBottom: keyboardHeight } : undefined}
            >
                <div className="w-full min-h-full flex flex-col justify-center items-center py-20">

                    {/* Forging State */}
                    {isForging && (
                        <div className="flex flex-col items-center justify-center text-center space-y-12 animate-in zoom-in-95 fade-in duration-700">
                            <div className="relative w-[30vh] aspect-[3/4.5] rounded-3xl overflow-hidden shadow-glow border border-white/20">
                                {legendImage ? (
                                    <img
                                        src={legendImage}
                                        className="w-full h-full object-cover animate-breathing"
                                        style={{ objectPosition: imagePosition }}
                                        alt="Forging"
                                    />
                                ) : (
                                    <div className={cn("w-full h-full animate-pulse", selectedGame?.cover || 'bg-gray-800')} />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                <div className="absolute bottom-0 left-0 right-0 p-8">
                                    <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight">{legendName}</h2>
                                    <div className="h-0.5 w-12 bg-white/40 mt-3 mx-auto translate-y-2"></div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="text-white font-display font-black uppercase tracking-[.6em] text-2xl animate-pulse">Forging Legend</div>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest">Constructing Chronicles in {selectedGame?.name}</p>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Select Realm */}
                    {!isForging && step === 1 && (
                        <div className="max-w-5xl w-full space-y-12 animate-in slide-in-from-bottom-12 fade-in duration-1000 text-center flex flex-col justify-center">
                            <div className="space-y-4">
                                <h1 className="text-5xl md:text-8xl font-display font-black uppercase text-white tracking-tighter leading-none">
                                    Select The Realm
                                </h1>
                                <div className="h-1 w-24 mx-auto shadow-glow opacity-80" style={{ background: themeColor }}></div>
                            </div>

                            <div className="w-full max-w-lg mx-auto relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors" size={20} />
                                <input
                                    ref={searchInputRef}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-5 pl-16 pr-6 text-white text-lg placeholder:text-white/10 focus:outline-none focus:border-white/30 transition-all backdrop-blur-md"
                                    placeholder="Search library or name a new realm..."
                                />
                            </div>

                            <div
                                ref={carouselRef}
                                className="w-full overflow-x-auto py-8 scrollbar-hide snap-x flex gap-6 px-4 md:px-12 items-center justify-start h-[45vh]"
                            >
                                {filteredGames.map(game => (
                                    <button
                                        key={game.id}
                                        onClick={() => handleSelectGame(game.name, game.cover)}
                                        className={cn(
                                            "snap-center shrink-0 w-[200px] aspect-[10/14] rounded-2xl overflow-hidden border-2 transition-all transform group relative",
                                            selectedGame?.name === game.name
                                                ? 'border-white scale-110 z-10 shadow-glow'
                                                : 'border-white/10 hover:border-white/40 hover:scale-[1.05]'
                                        )}
                                    >
                                        <div className={cn("absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity", game.cover)} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 flex flex-col justify-end text-left">
                                            <span className="text-xl font-display font-bold uppercase tracking-tight text-white drop-shadow-2xl">
                                                {game.name}
                                            </span>
                                        </div>
                                    </button>
                                ))}

                                {/* Add Custom Realm */}
                                {searchQuery.trim() && !availableGames.some(g => g.name.toLowerCase() === searchQuery.toLowerCase()) && (
                                    <button
                                        onClick={() => handleSelectGame(searchQuery.trim(), getGameGradient(searchQuery.trim()))}
                                        className="snap-center shrink-0 w-[200px] aspect-[10/14] rounded-2xl border-2 border-dashed border-white/10 hover:border-white transition-all flex flex-col items-center justify-center gap-4 group bg-white/5"
                                    >
                                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Plus size={32} className="text-white/40 group-hover:text-white" />
                                        </div>
                                        <div className="text-center px-4">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">New Realm</span>
                                            <span className="text-xl font-display font-bold uppercase text-white truncate max-w-full block">{searchQuery}</span>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Legend Identity */}
                    {!isForging && step === 2 && (
                        <div className="max-w-4xl w-full text-center space-y-12 animate-in zoom-in-95 fade-in duration-700">
                            <div className="space-y-4">
                                <div className="flex items-center justify-center gap-4">
                                    <div className="h-px w-8 bg-white/20"></div>
                                    <span className="text-[11px] font-bold uppercase tracking-[.4em] text-white/60">{selectedGame?.name}</span>
                                    <div className="h-px w-8 bg-white/20"></div>
                                </div>
                                <h1 className="text-5xl md:text-8xl font-display font-black uppercase text-white leading-none tracking-tight">Who Is This Legend?</h1>
                            </div>

                            <div className="w-full max-w-2xl mx-auto relative group">
                                <input
                                    value={legendName}
                                    onChange={(e) => setLegendName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && legendName.trim() && handleForgeComplete()}
                                    placeholder="ENTER NAME"
                                    className="w-full bg-transparent border-none text-center text-6xl md:text-9xl font-display font-black text-white focus:outline-none placeholder:text-white/10 transition-all drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                    autoFocus
                                />
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#F5B800] transition-all duration-500" style={{ width: legendName.trim() ? '100%' : '0%' }}></div>
                                </div>
                            </div>

                            {!(isKeyboardOpen && isMobile) && (
                                <div className="flex flex-col items-center gap-8 pt-4">
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="group flex flex-col items-center gap-4 p-8 rounded-3xl border-2 border-dashed border-white/10 hover:border-[#F5B800]/40 transition-all bg-white/5"
                                    >
                                        <div className="p-4 rounded-full bg-white/5 group-hover:scale-110 group-hover:bg-[#F5B800]/10 transition-all">
                                            <Upload size={32} className="text-white/40 group-hover:text-[#F5B800]" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-[.3em] text-white/40 group-hover:text-white">
                                            {legendImage ? "CHANGE PORTRAIT" : "ADD PORTRAIT (OPTIONAL)"}
                                        </span>
                                    </button>

                                    {legendImage && (
                                        <div className="w-full max-w-xl animate-in fade-in slide-in-from-top-4 duration-700">
                                            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-2xl shadow-2xl">
                                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6 text-left">Refine Focal Point</h4>
                                                <ImagePositionSelector
                                                    imagePreview={legendImage}
                                                    value={imagePosition}
                                                    onChange={setImagePosition}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col items-center gap-6 pt-4">
                                <button
                                    onClick={handleForgeComplete}
                                    disabled={!legendName.trim()}
                                    className="group relative px-16 py-5 rounded-full bg-white text-black font-black uppercase tracking-[.2em] hover:bg-[#F5B800] transition-all disabled:opacity-20 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-glow"
                                >
                                    Forge Legend
                                </button>

                                <button
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                                    disabled={isForging}
                                >
                                    <ArrowLeft size={12} /> BACK
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Indicators */}
            {!isForging && !(isKeyboardOpen && isMobile) && (
                <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-4 z-50">
                    {[1, 2].map(s => (
                        <div
                            key={s}
                            className={cn(
                                "h-1 rounded-full transition-all duration-700",
                                s <= step ? 'w-12 shadow-glow' : 'w-2 opacity-20'
                            )}
                            style={{ background: s <= step ? themeColor : 'white' }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ForgeWizard;
