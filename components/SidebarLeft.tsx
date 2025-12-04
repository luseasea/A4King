import React, { useRef } from 'react';
import { AppImage } from '../types';

interface SidebarLeftProps {
    images: AppImage[];
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDragStart: (e: React.DragEvent, id: string, source: 'basket' | 'canvas') => void;
    onDropTrash: (e: React.DragEvent) => void;
    onDropBasket: (e: React.DragEvent) => void;
}

const SidebarLeft: React.FC<SidebarLeftProps> = ({ images, onUpload, onDragStart, onDropTrash, onDropBasket }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const basketImages = images.filter(img => img.status === 'basket');

    const handleTrashDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-red-100', 'border-red-400');
    };
    
    const handleTrashDragLeave = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('bg-red-100', 'border-red-400');
    };

    const handleBasketDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="w-[260px] h-full flex flex-col gap-5 p-5 -m-5">
            {/* Basket Panel */}
            <div 
                className="flex-1 flex flex-col p-5 bg-[#f2f4f8] rounded-3xl border border-white/60 shadow-[0_10px_25px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(255,255,255,0.9)] z-10 min-h-0"
                onDragOver={handleBasketDragOver}
                onDrop={onDropBasket}
            >
                <div className="flex justify-between items-center mb-4 text-xs font-extrabold text-[#555] uppercase tracking-widest">
                    <span>Assets</span>
                    <span className="text-rose-500">{basketImages.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 rounded-xl bg-[#e8ecf1] shadow-[inset_0_2px_6px_rgba(0,0,0,0.12)] flex flex-col gap-8 border border-transparent">
                    {basketImages.length === 0 && (
                        <div className="text-center text-gray-400 font-bold mt-10">EMPTY</div>
                    )}
                    {basketImages.map((img) => (
                        <div
                            key={img.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, img.id, 'basket')}
                            className="bg-white p-1.5 pb-6 shadow-[0_4px_10px_rgba(0,0,0,0.15)] rounded mb-[-40px] hover:mb-2 hover:scale-105 hover:z-50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] hover:rotate-0 transition-all duration-300 cursor-grab active:cursor-grabbing border border-white relative group"
                            style={{ transform: `rotate(${(Math.random() * 6 - 3).toFixed(1)}deg)` }}
                        >
                            <img 
                                src={img.src} 
                                alt={img.name} 
                                className="w-full h-[100px] object-cover bg-gray-100 rounded-[2px] pointer-events-none"
                            />
                            <div className="absolute bottom-1 left-1.5 right-1.5 text-[10px] font-bold text-gray-600 truncate text-center">
                                {img.name}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 shrink-0">
                    <label 
                        className="w-full py-3 rounded-2xl bg-[#f2f4f8] text-[#1a1a1a] font-extrabold text-sm flex justify-center items-center gap-2 cursor-pointer shadow-[0_4px_8px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] border border-white/60 hover:-translate-y-px hover:shadow-[0_6px_12px_rgba(0,0,0,0.12)] hover:text-blue-600 active:translate-y-px active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)] transition-all"
                    >
                        <span className="text-lg leading-none">+</span> Add Photos
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            onChange={onUpload}
                        />
                    </label>
                </div>
            </div>

            {/* Trash Can */}
            <div 
                className="h-[110px] shrink-0 bg-gradient-to-b from-[#dce2e8] to-[#c5cfd9] rounded-b-3xl rounded-t-2xl border border-white/50 border-t-0 shadow-[0_10px_20px_rgba(0,0,0,0.12)] flex flex-col items-center justify-center text-[#7f8fa6] font-bold relative transition-colors z-0"
                onDragOver={handleTrashDragOver}
                onDragLeave={handleTrashDragLeave}
                onDrop={(e) => {
                    handleTrashDragLeave(e);
                    onDropTrash(e);
                }}
            >
                 {/* Lid */}
                <div className="absolute -top-2 w-[92%] h-4 bg-gradient-to-b from-[#e6eaf0] to-[#dce2e8] rounded-full border border-white/60 shadow-md transition-transform duration-300 origin-top z-20 pointer-events-none trash-lid"></div>
                <div className="text-3xl mb-1 pointer-events-none">🗑️</div>
            </div>
            <style>{`
                .border-red-400 .trash-lid {
                    transform: rotateX(-120deg) translateY(-25px);
                    background: #ffebee;
                }
            `}</style>
        </div>
    );
};

export default SidebarLeft;