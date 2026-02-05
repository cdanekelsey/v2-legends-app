
import React from 'react';
import { Flame, Home, Plus, Settings, Feather, X, LogOut, Compass, LayoutGrid } from 'lucide-react';

interface NavigationSidebarProps {
    onForge: () => void;
    onInscribe: () => void;
    onHome: () => void;
    visible?: boolean;
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ onForge, onInscribe, onHome, visible = true }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleAction = (action: () => void) => {
        action();
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* --- DESKTOP RAIL (md:flex) --- */}
            {/* Matched to new base color #0f1115 for seamless look */}
            <aside className="hidden md:flex fixed top-0 left-0 h-screen w-20 bg-[#0f1115] border-r border-white/10 z-[110] flex-col items-center py-6 animate-in slide-in-from-left duration-500">
                {/* Logo (Home Link) */}
                <div className="mb-8">
                    <button 
                        onClick={onHome}
                        className="h-10 w-10 bg-gradient-to-tr from-[#F5B800] to-yellow-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,184,0,0.4)] hover:scale-105 transition-transform group"
                        title="Home"
                    >
                        <Flame size={20} className="text-black fill-black group-hover:animate-pulse" />
                    </button>
                </div>

                {/* CREATION ACTIONS */}
                <div className="flex flex-col gap-4 w-full items-center">
                     <button 
                        onClick={onForge}
                        className="group relative flex items-center justify-center h-12 w-12 rounded-xl bg-white/5 hover:bg-[#F5B800] hover:text-black transition-all border border-white/10 hover:border-[#F5B800]"
                        title="New Legend"
                    >
                        <Plus size={24} />
                        <span className="absolute left-14 bg-black border border-white/10 px-2 py-1 rounded text-[10px] font-sans font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            New Legend
                        </span>
                    </button>
                    <button 
                        onClick={onInscribe}
                        className="group relative flex items-center justify-center h-12 w-12 rounded-xl bg-white/5 hover:bg-[#F5B800] hover:text-black transition-all border border-white/10 hover:border-[#F5B800]"
                        title="Inscribe"
                    >
                        <Feather size={22} />
                        <span className="absolute left-14 bg-black border border-white/10 px-2 py-1 rounded text-[10px] font-sans font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            Inscribe
                        </span>
                    </button>
                </div>

                {/* Bottom Profile */}
                <div className="mt-auto flex flex-col gap-6 w-full items-center">
                     <button className="text-gray-500 hover:text-white transition-colors group relative">
                        <Settings size={22} />
                        <span className="absolute left-14 bg-black border border-white/10 px-2 py-1 rounded text-[10px] font-sans font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            Settings
                        </span>
                     </button>
                     <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-white/10 cursor-pointer hover:border-[#F5B800] transition-colors relative">
                        <span className="text-[10px] font-sans font-bold text-gray-300">YOU</span>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#09090b] rounded-full"></div>
                     </div>
                </div>
            </aside>

            {/* --- MOBILE TRIGGER (LEFT - FLAME ICON) --- */}
            <div 
                className={`md:hidden fixed top-4 left-4 z-50 transition-all duration-500 ease-in-out ${visible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}
            >
                <button 
                    onClick={() => setIsMobileMenuOpen(true)} 
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-[#F5B800] transition-all shadow-lg active:scale-95"
                >
                    <Flame size={20} className={isMobileMenuOpen ? 'text-[#F5B800] fill-current' : ''} />
                </button>
            </div>

            {/* --- MOBILE DRAWER (Slide-Out) --- */}
            
            {/* Backdrop */}
            <div 
                className={`md:hidden fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Drawer Panel */}
            <div className={`md:hidden fixed top-0 bottom-0 left-0 w-[85%] max-w-sm bg-[#0f1115] border-r border-white/10 z-[70] flex flex-col p-6 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gradient-to-tr from-[#F5B800] to-yellow-600 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(245,184,0,0.3)]">
                            <Flame size={16} className="text-black fill-black" />
                        </div>
                        <span className="text-2xl font-black uppercase font-display tracking-tight">Legends</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation (Home) */}
                <nav className="flex flex-col gap-2 mb-8 border-b border-white/10 pb-8">
                    <button 
                        onClick={() => handleAction(onHome)}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all bg-white/10 text-white border border-white/10`}
                    >
                        <LayoutGrid size={24} className="text-[#F5B800]" />
                        <span className="text-xl font-display font-bold uppercase tracking-wide">Library</span>
                    </button>
                </nav>

                {/* Primary Actions */}
                <div className="flex flex-col gap-3 mb-8">
                    <button 
                        onClick={() => handleAction(onForge)}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-[#F5B800] hover:text-black transition-all border border-white/10 group"
                    >
                        <div className="h-8 w-8 rounded-lg bg-black/20 flex items-center justify-center group-hover:bg-black/10">
                            <Plus size={18} />
                        </div>
                        <span className="font-sans font-bold uppercase tracking-widest text-xs">New Legend</span>
                    </button>
                    <button 
                        onClick={() => handleAction(onInscribe)}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-[#F5B800] hover:text-black transition-all border border-white/10 group"
                    >
                        <div className="h-8 w-8 rounded-lg bg-black/20 flex items-center justify-center group-hover:bg-black/10">
                            <Feather size={18} />
                        </div>
                        <span className="font-sans font-bold uppercase tracking-widest text-xs">Inscribe</span>
                    </button>
                </div>
                
                {/* Footer (Settings/Profile) */}
                <div className="mt-auto flex flex-col gap-4">
                    <button className="flex items-center gap-3 p-2 text-xs font-sans font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                        <Settings size={18} /> Settings
                    </button>
                    
                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center">
                                    <span className="text-[10px] font-sans font-bold text-gray-300">YOU</span>
                            </div>
                            <span className="text-xs font-sans font-bold text-gray-300 uppercase tracking-widest">Player 1</span>
                        </div>
                        <button className="text-gray-500 hover:text-white">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NavigationSidebar;
