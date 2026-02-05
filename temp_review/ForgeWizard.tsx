import { useState, useRef, useCallback, useEffect } from "react";
import { X, Search, Check, ArrowLeft, Upload, Plus } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getGameGradient, GRADIENT_PAIRS } from "@/lib/gameUtils";
import { useKeyboardHeight } from "@/hooks/use-keyboard-height";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ForgeWizardProps {
  onClose: () => void;
}

const ForgeWizard = ({ onClose }: ForgeWizardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState(1);
  const [isForging, setIsForging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<{ id: string; name: string; cover: string } | null>(null);
  const [legendName, setLegendName] = useState('');
  const [legendImage, setLegendImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Keyboard-aware layout hooks
  const keyboardHeight = useKeyboardHeight();
  const isMobile = useIsMobile();
  const isKeyboardOpen = keyboardHeight > 0;

  // Get unique games from user's library
  const { data: libraryGames = [] } = useQuery({
    queryKey: ['library-games'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legends')
        .select('game')
        .order('game');
      if (error) throw error;
      return [...new Set(data.map(l => l.game))];
    },
  });

  // Fetch game gradient preferences from database
  const { data: gameGradients = {} } = useQuery({
    queryKey: ['game-gradients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select('name, gradient_index');
      if (error) throw error;
      const map: Record<string, number | null> = {};
      data?.forEach(game => {
        map[game.name] = game.gradient_index;
      });
      return map;
    }
  });

  // Get gradient for a game (prefer stored, fallback to hash)
  const getGameGradientClass = useCallback((gameName: string) => {
    const storedIndex = gameGradients[gameName];
    if (storedIndex !== null && storedIndex !== undefined) {
      return `bg-gradient-to-br ${GRADIENT_PAIRS[storedIndex % GRADIENT_PAIRS.length]}`;
    }
    return getGameGradient(gameName);
  }, [gameGradients]);

  // New legends get display_order: 0 to claim slot 1
  // (existing legends have positive values, so 0 sorts first)

  const createLegendMutation = useMutation({
    mutationFn: async () => {
      const legendId = crypto.randomUUID();
      
      let imageUrl = null;
      
      // Upload image if provided
      if (legendImage) {
        const fileExt = legendImage.name.split('.').pop();
        const fileName = `portraits/${legendId}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('legend-images')
          .upload(fileName, legendImage);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('legend-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }
      
      // Insert legend
      const { error } = await supabase
        .from('legends')
        .insert({
          id: legendId,
          name: legendName,
          game: selectedGame?.name || "Unknown Realm",
          epitaph: null,
          image_url: imageUrl,
          image_position: "center",
          display_order: 0,
          tags: ["new blood"],
        });
      
      if (error) throw error;
      return legendId;
    },
    onSuccess: (legendId) => {
      queryClient.invalidateQueries({ queryKey: ['legends'] });
      queryClient.invalidateQueries({ queryKey: ['legends-max-order'] });
      toast.success('Legend forged successfully!');
      onClose();
      navigate(`/legend/${legendId}`);
    },
    onError: (error) => {
      toast.error('Failed to forge legend');
      console.error('Create error:', error);
      setIsForging(false);
    }
  });

  const handleForgeComplete = () => {
    if (!legendName.trim()) return;
    setIsForging(true);
    // Delay for dramatic effect
    setTimeout(() => {
      createLegendMutation.mutate();
    }, 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLegendImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Filter library games based on search
  const filteredGames = libraryGames.filter(gameName => 
    gameName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // On desktop, ensure the carousel starts at the beginning (otherwise snap-center can lock out the first card).
  useEffect(() => {
    if (step !== 1) return;
    // Wait for layout so snapping uses the correct widths.
    requestAnimationFrame(() => {
      carouselRef.current?.scrollTo({ left: 0, behavior: "auto" });
    });
  }, [step, filteredGames.length]);

  // Handle selecting a game from library
  const handleSelectGame = (gameName: string) => {
    setSelectedGame({ id: gameName, name: gameName, cover: getGameGradientClass(gameName) });
    setStep(2);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] bg-background flex flex-col overflow-hidden overscroll-none animate-in fade-in duration-500",
        isMobile && "touch-none",
      )}
    >
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 transition-all duration-1000">
        {imagePreview ? (
          <img src={imagePreview} className="w-full h-full object-cover opacity-40 animate-ken-burns" alt="Preview" />
        ) : selectedGame ? (
          <div className={`w-full h-full ${selectedGame.cover} opacity-30 animate-ken-burns`} />
        ) : (
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-muted via-background to-background opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      </div>

      {/* Close Button - hide when keyboard open on mobile */}
      {!isForging && !(isKeyboardOpen && isMobile) && (
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-50 p-4 rounded-full bg-background/20 text-foreground hover:bg-background/50 transition-all border border-border hover:border-destructive/50"
        >
          <X size={24} />
        </button>
      )}

      {/* Wizard Content */}
      <div 
        className="relative z-10 flex-grow flex flex-col justify-center items-center p-8 h-full"
        style={isKeyboardOpen && isMobile ? { marginBottom: keyboardHeight } : undefined}
      >
        
        {/* Forging State */}
        {isForging && (
          <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 fade-in duration-500">
            <div className="relative w-64 h-96 bg-card rounded-2xl overflow-hidden border-2 border-primary shadow-[0_0_100px_hsl(var(--primary)/0.5)]">
              {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-cover" alt="Legend" />
              ) : (
                <div className={`w-full h-full ${selectedGame?.cover || 'bg-muted'}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                <h2 className="text-2xl font-display font-bold text-foreground uppercase">{legendName}</h2>
                <p className="text-primary text-xs uppercase font-bold tracking-widest mt-2">{selectedGame?.name}</p>
              </div>
            </div>
            <div className="text-primary font-bold uppercase tracking-[0.5em] animate-pulse text-xl">Forging Legend...</div>
          </div>
        )}

        {/* Step 1: Select Realm */}
        {!isForging && step === 1 && (
          <div className="max-w-4xl w-full space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-700 text-center flex flex-col justify-center h-full">
            <div className="shrink-0">
              <h2 className="text-4xl md:text-5xl font-display font-bold uppercase text-foreground tracking-tight">
                Select The Game
              </h2>
            </div>
            
            {/* Search Bar */}
            <div className="w-full max-w-md mx-auto relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
              <input 
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card/50 border border-border rounded-full py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-primary transition-all"
                placeholder="Search your library or add a new one..."
              />
            </div>

            {/* Games Carousel */}
            <div
              ref={carouselRef}
              className="w-full overflow-x-auto pb-4 scrollbar-hide snap-x flex gap-4 px-4 items-center justify-start shrink-0 h-80"
            >
              {filteredGames.map(gameName => (
                <button 
                  key={gameName}
                  onClick={() => handleSelectGame(gameName)}
                  className={cn(
                    "snap-start shrink-0 w-40 md:w-48 h-64 rounded-xl overflow-hidden border transition-all transform group relative",
                    selectedGame?.name === gameName 
                      ? 'border-primary scale-105 shadow-[0_0_30px_hsl(var(--primary)/0.4)]' 
                      : 'border-border hover:border-foreground hover:scale-105'
                  )}
                >
                  <div className={`absolute inset-0 ${getGameGradientClass(gameName)} opacity-80 group-hover:opacity-100 transition-opacity`} />
                  <div className="absolute inset-0 flex items-end justify-center p-4 bg-gradient-to-t from-background/80 to-transparent">
                    <span className="text-sm font-bold uppercase tracking-widest text-foreground text-center drop-shadow-xl">
                      {gameName}
                    </span>
                  </div>
                  {selectedGame?.name === gameName && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Check size={12} />
                    </div>
                  )}
                </button>
              ))}
              
              {/* Add to Library Tile - Always visible at end */}
              <button 
                onClick={() => {
                  if (searchQuery.trim() && !libraryGames.some(g => g.toLowerCase() === searchQuery.toLowerCase())) {
                    handleSelectGame(searchQuery.trim());
                  } else {
                    searchInputRef.current?.focus();
                  }
                }}
                className="snap-start shrink-0 w-40 md:w-48 h-64 rounded-xl overflow-hidden border border-dashed border-border hover:border-primary transition-all flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground"
              >
                <Plus size={32} />
                <div className="text-center px-2">
                  {searchQuery.trim() && !libraryGames.some(g => g.toLowerCase() === searchQuery.toLowerCase()) ? (
                    <>
                      <span className="text-xs font-bold uppercase tracking-widest block">Add</span>
                      <span className="text-sm font-display font-bold uppercase text-foreground block truncate max-w-full">{searchQuery}</span>
                    </>
                  ) : (
                    <span className="text-xs font-bold uppercase tracking-widest">Add to Library</span>
                  )}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Legend Identity */}
        {!isForging && step === 2 && (
          <div className="max-w-3xl w-full text-center space-y-8 animate-in zoom-in-95 fade-in duration-500">
            <div className="space-y-2">
              <span className="text-primary text-sm font-bold uppercase tracking-[0.3em]">{selectedGame?.name}</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold uppercase text-foreground">Who is this Legend?</h2>
            </div>
            
            {/* Name Input */}
            <input 
              value={legendName}
              onChange={(e) => setLegendName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && legendName && handleForgeComplete()}
              placeholder="Enter Name"
              className="w-full bg-transparent border-b-2 border-border text-center text-5xl md:text-7xl font-display font-bold text-foreground focus:border-primary focus:outline-none py-4 placeholder:text-muted-foreground/20 transition-all"
              autoFocus
            />

            {/* Optional Image Upload - hide when keyboard open on mobile */}
            {!(isKeyboardOpen && isMobile) && (
              <div className="flex justify-center">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-3 px-6 py-3 rounded-full border border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary transition-all"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} className="w-8 h-8 rounded-full object-cover" alt="Preview" />
                      <span className="text-xs font-bold uppercase tracking-widest">Change Portrait</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      <span className="text-xs font-bold uppercase tracking-widest">Add Portrait (Optional)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-4 pt-8">
              <button 
                onClick={() => setStep(1)}
                className="p-3 rounded-full text-muted-foreground hover:text-foreground transition-colors flex items-center"
              >
                <ArrowLeft size={20} />
                <span className="hidden md:inline ml-2 text-xs uppercase tracking-widest font-bold">Back</span>
              </button>
              <button 
                onClick={handleForgeComplete}
                disabled={!legendName.trim()}
                className="px-12 py-4 rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
              >
                Forge Legend
              </button>
            </div>
          </div>
        )}

        {/* Progress Indicators - hide when keyboard open on mobile */}
        {!isForging && !(isKeyboardOpen && isMobile) && (
          <div className="absolute bottom-12 flex gap-4">
            {[1, 2].map(s => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  s <= step ? 'w-8 bg-primary' : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgeWizard;
