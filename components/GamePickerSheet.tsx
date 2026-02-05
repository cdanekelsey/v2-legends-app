import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Check, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { getGameGradient } from "@/lib/gameUtils";

interface GamePickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGame: string;
  onGameSelect: (gameName: string) => void;
}

const GamePickerSheet = ({ open, onOpenChange, currentGame, onGameSelect }: GamePickerSheetProps) => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");

  // Get unique games from user's library
  const { data: libraryGames = [] } = useQuery({
    queryKey: ['library-games'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legends')
        .select('game')
        .order('game');
      if (error) throw error;
      // Get unique game names
      return [...new Set(data.map(l => l.game))];
    },
  });

  // Filter games based on search
  const filteredLibraryGames = libraryGames.filter(game =>
    game.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if search query matches an existing library game
  const searchMatchesLibrary = libraryGames.some(
    g => g.toLowerCase() === searchQuery.toLowerCase()
  );

  const handleSelect = (gameName: string) => {
    onGameSelect(gameName);
    onOpenChange(false);
    setSearchQuery("");
  };

  const content = (
    <div className="flex flex-col h-full min-h-0">
      {/* Search Bar */}
      <div className="p-4 border-b border-border shrink-0">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/50 border border-border rounded-full py-3 pl-11 pr-4 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
            placeholder="Search your library..."
            autoFocus={!isMobile}
          />
        </div>
      </div>

      {/* Games List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {/* Library Games */}
        {filteredLibraryGames.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Your Library</p>
            <div className="space-y-2">
              {filteredLibraryGames.map((game) => (
                <button
                  key={game}
                  onClick={() => handleSelect(game)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                    game === currentGame
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-12 h-16 rounded-lg shrink-0",
                    getGameGradient(game)
                  )} />
                  <span className="flex-1 text-left text-sm font-medium">{game}</span>
                  {game === currentGame && (
                    <Check size={18} className="text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to Library Option - shows when search doesn't match existing */}
        {searchQuery && !searchMatchesLibrary && (
          <button
            onClick={() => handleSelect(searchQuery)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-border hover:border-primary transition-all"
          >
            <div className={cn(
              "w-12 h-16 rounded-lg shrink-0 flex items-center justify-center",
              getGameGradient(searchQuery)
            )}>
              <Plus size={20} className="text-white/80" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">
                Add to library
              </span>
              <span className="text-sm font-medium">{searchQuery}</span>
            </div>
          </button>
        )}

        {/* Empty State */}
        {filteredLibraryGames.length === 0 && !searchQuery && (
          <div className="text-center py-8 text-muted-foreground">
            <Plus size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No games in your library yet.</p>
            <p className="text-xs mt-1">Type a game name to add it.</p>
          </div>
        )}

        {/* No Results State */}
        {filteredLibraryGames.length === 0 && searchQuery && !searchMatchesLibrary && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-xs">No matches in your library.</p>
            <p className="text-xs mt-1">Add "{searchQuery}" above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile: Bottom Sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" hideClose className="h-[85vh] rounded-t-3xl bg-card border-t border-border p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-border shrink-0">
            <SheetTitle className="text-center font-display text-lg uppercase tracking-widest">
              Select Game
            </SheetTitle>
            <SheetDescription className="sr-only">Choose a game for this legend</SheetDescription>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Centered Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[70vh] p-0 gap-0 bg-card border-border overflow-hidden flex flex-col">
        <DialogHeader className="p-4 border-b border-border shrink-0">
          <DialogTitle className="text-center font-display text-lg uppercase tracking-widest">
            Select Game
          </DialogTitle>
          <DialogDescription className="sr-only">Choose a game for this legend</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default GamePickerSheet;
