
import React, { useState, useRef } from 'react';
import { Edit2, Check, Eye, Image as ImageIcon2, EyeOff, X, Settings, User, ScrollText, Sparkles } from 'lucide-react';
import { Legend } from '../types';
import { DEFAULT_TAGS } from '../constants';

interface EditDrawerProps {
    legend: Legend;
    onClose: () => void;
    onSave: (legend: Legend) => void;
    availableTags?: string[];
    onDeleteTagFromDb?: (tag: string) => void;
}

const EditDrawer: React.FC<EditDrawerProps> = ({ legend, onClose, onSave, availableTags, onDeleteTagFromDb }) => {
    const safeTags = legend?.tags || [];
    const safeAvailableTags = availableTags || DEFAULT_TAGS;
    
    // FORM STATE
    const [name, setName] = useState(legend?.name || "");
    const [game, setGame] = useState(legend?.game || "");
    const [epitaph, setEpitaph] = useState(legend?.epitaph || "");
    const [tags, setTags] = useState<string[]>(safeTags);
    const [visage, setVisage] = useState(legend?.visage || null);
    const [showEpitaph, setShowEpitaph] = useState(legend?.showEpitaph ?? false);
    const [showTags, setShowTags] = useState(legend?.showTags ?? false);
    
    // UI STATE
    const [activeTab, setActiveTab] = useState<'identity' | 'lore'>('identity');
    const [newTagInput, setNewTagInput] = useState("");
    const [isManagingTags, setIsManagingTags] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const allTags = Array.from(new Set([...DEFAULT_TAGS, ...safeAvailableTags]));

    const handleSave = () => { onSave({ ...legend, name, game, epitaph, tags, visage, showEpitaph, showTags }); onClose(); };
    const toggleTag = (tag: string) => { if (tags.includes(tag)) setTags(tags.filter(t => t !== tag)); else setTags([...tags, tag]); };
    const handleAddCustomTag = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && newTagInput.trim()) { e.preventDefault(); const tag = newTagInput.trim(); if (!tags.includes(tag)) setTags([...tags, tag]); setNewTagInput(""); } };
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setVisage(reader.result as string); reader.readAsDataURL(file); } };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            {/* CARD CONTAINER */}
            <div className="bg-[#111] w-full h-full md:h-auto md:max-w-5xl md:aspect-[16/9] md:rounded-3xl border border-white/10 shadow-2xl relative z-10 flex flex-col md:flex-row overflow-hidden animate-slide-up md:animate-zoom-in-95">
                
                {/* LEFT: VISUAL EDITOR (WYSIWYG) */}
                <div className="w-full md:w-[45%] h-[40vh] md:h-full relative group bg-black">
                    <div 
                        className="absolute inset-0 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                         {visage ? (
                             <img src={visage} className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-70" alt="Visage" />
                         ) : (
                             <div className={`w-full h-full bg-gradient-to-br ${legend.color} relative group-hover:opacity-80 transition-opacity`}>
                                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                             </div>
                         )}
                         
                         {/* OVERLAY HINT */}
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                             <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                                 <ImageIcon2 size={16} className="text-white"/>
                                 <span className="text-xs font-bold uppercase tracking-widest text-white">Change Visage</span>
                             </div>
                         </div>
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none"></div>
                    </div>
                    
                    {/* EDITABLE NAME OVERLAY */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-30 pointer-events-none">
                        <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#F5B800] mb-2 block drop-shadow-md">Legend Name</label>
                        <input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full bg-transparent border-none p-0 text-5xl md:text-6xl font-black text-white focus:outline-none placeholder:text-white/20 font-display uppercase tracking-tight drop-shadow-xl pointer-events-auto"
                            placeholder="NAME"
                        />
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>

                {/* RIGHT: ATTRIBUTES EDITOR */}
                <div className="flex-1 flex flex-col h-full bg-[#111] relative">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <div className="flex gap-6">
                            <button 
                                onClick={() => setActiveTab('identity')} 
                                className={`text-sm font-bold uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'identity' ? 'text-white border-[#F5B800]' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                            >
                                Identity
                            </button>
                            <button 
                                onClick={() => setActiveTab('lore')} 
                                className={`text-sm font-bold uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'lore' ? 'text-white border-[#F5B800]' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                            >
                                Lore & Config
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:text-white hover:bg-white/5 transition-colors"><X size={20}/></button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                        
                        {activeTab === 'identity' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* GAME INPUT */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                        <Sparkles size={12} className="text-[#F5B800]"/> Origin Game
                                    </label>
                                    <input 
                                        value={game} 
                                        onChange={(e) => setGame(e.target.value)} 
                                        className="w-full bg-transparent border-b border-white/20 py-2 text-xl font-bold text-white focus:border-[#F5B800] focus:outline-none placeholder:text-gray-700 transition-colors"
                                        placeholder="e.g. Elden Ring"
                                    />
                                </div>

                                {/* TAGS INPUT */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                            <User size={12} className="text-[#F5B800]"/> Class Tags
                                        </label>
                                        <button onClick={() => setIsManagingTags(!isManagingTags)} className={`text-[10px] uppercase font-bold tracking-widest ${isManagingTags ? 'text-red-400' : 'text-gray-600 hover:text-white'}`}>
                                            {isManagingTags ? 'Done' : 'Edit List'}
                                        </button>
                                    </div>

                                    {/* Active Tags */}
                                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                                        {tags.map(tag => (
                                            <button key={tag} onClick={() => toggleTag(tag)} className="px-3 py-1.5 rounded-md bg-[#F5B800] text-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-2 group">
                                                {tag} <X size={12} className="opacity-50 group-hover:opacity-100"/>
                                            </button>
                                        ))}
                                        <input 
                                            value={newTagInput} 
                                            onChange={(e) => setNewTagInput(e.target.value)} 
                                            onKeyDown={handleAddCustomTag} 
                                            placeholder="+ Custom" 
                                            className="px-3 py-1.5 rounded-md bg-transparent border border-dashed border-white/20 text-white text-xs font-bold uppercase tracking-wider focus:border-[#F5B800] focus:outline-none w-24 placeholder:text-gray-600"
                                        />
                                    </div>

                                    {/* Tag Cloud */}
                                    <div className="pt-6 border-t border-white/5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">Available Runes</p>
                                        <div className="flex flex-wrap gap-2">
                                            {allTags.filter(t => !tags.includes(t)).map(tag => (
                                                <button 
                                                    key={tag} 
                                                    onClick={() => isManagingTags && onDeleteTagFromDb ? onDeleteTagFromDb(tag) : toggleTag(tag)} 
                                                    className={`px-3 py-1.5 rounded-md border text-xs font-bold uppercase tracking-wider transition-all ${isManagingTags ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-white/10 text-gray-400 hover:border-white hover:text-white'}`}
                                                >
                                                    {tag} {isManagingTags && <X size={12} className="inline ml-1"/>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'lore' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* EPITAPH */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                        <ScrollText size={12} className="text-[#F5B800]"/> Epitaph
                                    </label>
                                    <textarea 
                                        value={epitaph} 
                                        onChange={(e) => setEpitaph(e.target.value)} 
                                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white text-lg font-serif italic focus:border-[#F5B800] focus:outline-none resize-none placeholder:text-gray-700"
                                        placeholder="A brief description of their legacy..."
                                    />
                                </div>

                                {/* CONFIG */}
                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                        <Settings size={12} className="text-[#F5B800]"/> Display Config
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => setShowEpitaph(!showEpitaph)} className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${showEpitaph ? 'bg-[#F5B800]/10 border-[#F5B800] text-[#F5B800]' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'}`}>
                                            {showEpitaph ? <Eye size={20}/> : <EyeOff size={20}/>}
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Show Epitaph</span>
                                        </button>
                                        <button onClick={() => setShowTags(!showTags)} className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${showTags ? 'bg-[#F5B800]/10 border-[#F5B800] text-[#F5B800]' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'}`}>
                                            {showTags ? <Eye size={20}/> : <EyeOff size={20}/>}
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Show Tags</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-white/10 bg-[#111] flex justify-end gap-3">
                         <button onClick={onClose} className="px-6 py-3 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                             Cancel
                         </button>
                         <button onClick={handleSave} className="px-8 py-3 rounded-xl bg-[#F5B800] text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(245,184,0,0.3)]">
                             <Check size={16} /> Save Changes
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditDrawer;
