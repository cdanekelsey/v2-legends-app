
import React, { useState, useEffect } from 'react';
import { 
    ChevronLeft, Copy, CheckCircle2, MoreHorizontal, Share2, 
    Trash2, PlayCircle, Shield, Link as LinkIcon, ExternalLink
} from 'lucide-react';
import { Moment } from '../types';

interface MomentViewerProps {
    memory: Moment;
    onClose: () => void;
    onSave: (moment: Moment) => void;
    handleCopy: (text: string, id: number) => void;
    onDelete: (id: number) => void;
}

const MomentViewer: React.FC<MomentViewerProps> = ({ memory, onClose, onSave, handleCopy, onDelete }) => {
    const [editedContent, setEditedContent] = useState(memory.note || "");
    const [editedCaption, setEditedCaption] = useState(memory.caption || "");
    const [editedDescription, setEditedDescription] = useState(memory.description || "");
    
    const [isSaving, setIsSaving] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false); 

    useEffect(() => {
        if (memory.type === 'stat') return;

        const timer = setTimeout(() => {
            if (
                editedContent !== memory.note || 
                editedCaption !== memory.caption || 
                editedDescription !== memory.description
            ) {
                setIsSaving(true);
                onSave({ 
                    ...memory, 
                    note: editedContent, 
                    caption: editedCaption,
                    description: editedDescription 
                });
                setTimeout(() => setIsSaving(false), 800);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [editedContent, editedCaption, editedDescription, memory, onSave]);

    const onCopy = (text: string) => {
        handleCopy(text, memory.id);
        setCopiedId(memory.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-2xl bg-[#111] border border-white/5 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 relative">
                
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="flex flex-col">
                            <span className="text-xs font-sans font-bold uppercase tracking-widest text-white flex items-center gap-2">
                                Moment Details
                                {isSaving && <span className="text-[#F5B800] animate-pulse ml-2">Saving...</span>}
                            </span>
                             <span className="text-[10px] text-gray-400 font-sans font-bold uppercase tracking-wider">{memory.date}</span>
                        </div>
                    </div>
                    {/* Actions - 3 Dot Menu */}
                    <div className="flex gap-2 relative">
                        {memory.type === 'stat' && (
                            <button onClick={() => onCopy(memory.note)} className={`p-2 rounded-full hover:bg-white/10 transition-colors ${copiedId === memory.id ? 'text-[#F5B800]' : 'text-gray-400 hover:text-white'}`}>
                                {copiedId === memory.id ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                            </button>
                        )}
                        
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Options">
                            <MoreHorizontal size={20} />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                                <div className="absolute right-0 top-12 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <button onClick={() => { onCopy(memory.note); setIsMenuOpen(false); }} className="w-full px-4 py-3 text-left text-xs font-sans font-bold uppercase tracking-widest text-gray-200 hover:bg-white/5 hover:text-white flex items-center gap-3">
                                        <Share2 size={16} /> Share
                                    </button>
                                    <button onClick={() => { onDelete(memory.id); onClose(); }} className="w-full px-4 py-3 text-left text-xs font-sans font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 flex items-center gap-3 border-t border-white/5">
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="overflow-y-auto custom-scrollbar flex-grow p-0 pb-6">
                    
                    {/* --- TYPE: VIDEO / IMAGE --- */}
                    {(memory.type === 'video' || memory.type === 'image') && (
                        <div className="w-full flex flex-col h-full">
                            <div className="relative flex-grow bg-black/50 flex items-center justify-center min-h-[300px]">
                                {memory.type === 'video' && <div className="absolute z-10 pointer-events-none"><PlayCircle size={64} className="text-white/80" /></div>}
                                {memory.src && <img src={memory.src} className="max-w-full max-h-[60vh] w-auto h-auto object-contain mx-auto" alt="Moment" />}
                            </div>
                            <div className="p-6 space-y-4">
                                <input 
                                    value={editedCaption} 
                                    onChange={(e) => setEditedCaption(e.target.value)} 
                                    className="w-full bg-transparent border-none p-0 text-3xl font-display font-bold text-white placeholder:text-gray-600 focus:outline-none" 
                                    placeholder="Title"
                                />
                                <textarea 
                                    value={editedDescription} 
                                    onChange={(e) => setEditedDescription(e.target.value)} 
                                    className="w-full bg-transparent text-gray-300 text-sm font-serif leading-relaxed resize-none focus:outline-none" 
                                    rows={2}
                                    placeholder="Add a description..."
                                />
                            </div>
                        </div>
                    )}

                    {/* --- TYPE: SYSTEM / STAT --- */}
                    {memory.type === 'stat' && (
                        <div className="p-8">
                            <div className="p-6 bg-white/5 border-l-2 border-[#F5B800] relative overflow-hidden rounded-r-xl">
                                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <Shield size={20} className="text-[#F5B800]" />
                                        <h3 className="text-white font-sans font-bold uppercase tracking-widest text-sm">SYSTEM DIAGNOSTIC</h3>
                                    </div>
                                    {memory.rating && (
                                        <div className="text-3xl font-black text-[#F5B800] leading-none tracking-tighter">
                                            {memory.rating}<span className="text-sm text-white/50 font-normal">/10</span>
                                        </div>
                                    )}
                                </div>
                                {/* NON-EDITABLE CONTENT */}
                                <div className="font-mono text-sm text-green-400/90 leading-relaxed whitespace-pre-wrap relative z-10">
                                    {memory.note}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TYPE: JOURNAL / NOTE --- */}
                    {memory.type === 'note' && (
                        <div className="p-8 h-full flex flex-col min-h-[50vh]">
                            <input 
                                value={editedCaption}
                                onChange={(e) => setEditedCaption(e.target.value)}
                                className="w-full bg-transparent text-4xl font-display font-bold text-white mb-6 focus:outline-none placeholder:text-white/20 border-none p-0"
                                placeholder="Title"
                            />
                            <textarea 
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="w-full flex-grow bg-transparent text-gray-200 text-lg leading-relaxed font-serif whitespace-pre-wrap focus:outline-none resize-none placeholder:text-white/10 border-none p-0"
                                placeholder="Chronicle content..."
                            />
                        </div>
                    )}
                    
                    {/* --- TYPE: LINK --- */}
                    {memory.type === 'link' && (
                        <div className="p-8">
                             <div className="flex items-center gap-3 mb-6">
                                <LinkIcon size={24} className="text-[#F5B800]" />
                                <input 
                                    value={editedCaption}
                                    onChange={(e) => setEditedCaption(e.target.value)}
                                    className="w-full bg-transparent text-3xl font-display font-bold text-white uppercase tracking-wide focus:outline-none border-b border-transparent focus:border-white/20 transition-colors"
                                    placeholder="Uplink Title"
                                />
                            </div>
                            
                            <a href={memory.url} target="_blank" rel="noopener noreferrer" className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold uppercase tracking-widest py-6 px-6 rounded-xl flex items-center justify-center gap-2 transition-all mb-6 text-sm font-sans">
                                Open Link <ExternalLink size={16} />
                            </a>

                            <textarea 
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="w-full h-32 bg-transparent border-l-2 border-white/20 pl-4 text-gray-300 text-sm italic font-serif focus:outline-none resize-none"
                                placeholder="Add a note about this link..."
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MomentViewer;
