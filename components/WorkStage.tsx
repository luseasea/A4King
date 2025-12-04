import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppImage } from '../types';
import { calculateLayout, A4_RATIO } from '../utils/layout';

// External libraries loaded via CDN
declare const html2canvas: any;
declare const jspdf: any;

interface WorkStageProps {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    onDropCanvas: (e: React.DragEvent) => void;
    onRotateImage: (id: string) => void;
    onRecycleAll: () => void;
}

const WorkStage: React.FC<WorkStageProps> = ({ state, setState, onDropCanvas, onRotateImage, onRecycleAll }) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dims, setDims] = useState({ w: 0, h: 0 });
    const [format, setFormat] = useState<'pdf' | 'png'>('pdf');
    const [isPrinting, setIsPrinting] = useState(false);
    const [printCount, setPrintCount] = useState(0);
    const filenameRef = useRef<HTMLTextAreaElement>(null);

    // Update dimensions for layout calculation
    useEffect(() => {
        if (canvasRef.current) {
            const updateSize = () => {
                const w = canvasRef.current!.clientWidth;
                const h = canvasRef.current!.clientHeight;
                setDims({ w, h });
            };
            updateSize();
            window.addEventListener('resize', updateSize);
            return () => window.removeEventListener('resize', updateSize);
        }
    }, []);

    // Layout Calculation
    const pxPerMM = dims.w > 0 ? dims.w / 210 : 1;
    const canvasImages = state.images.filter(i => i.status === 'canvas');
    const layout = calculateLayout(
        canvasImages,
        dims.w,
        dims.h,
        state.mode,
        state.gap * pxPerMM,
        state.margin,
        pxPerMM
    );

    // Dynamic Paper Style
    const paperStyle: React.CSSProperties = {
        backgroundColor: state.paperColor,
        boxShadow: '0 30px 60px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.05)',
        ...(state.paperPattern === 'lines' && { backgroundImage: `linear-gradient(#00000025 1px, transparent 1px)`, backgroundSize: '100% 15px' }),
        ...(state.paperPattern === 'grid' && { backgroundImage: `linear-gradient(#00000025 1px, transparent 1px), linear-gradient(90deg, #00000025 1px, transparent 1px)`, backgroundSize: '15px 15px' }),
        ...(state.paperPattern === 'dots' && { backgroundImage: `radial-gradient(#00000025 1px, transparent 1px)`, backgroundSize: '15px 15px', backgroundPosition: '-1px -1px' }),
    };

    const handlePrint = async () => {
        if (isPrinting || canvasImages.length === 0) return;
        setIsPrinting(true);

        // Hide UI guides
        const oldGuides = state.showGuides;
        const oldCut = state.showCutLines;
        setState(prev => ({ ...prev, showGuides: false, showCutLines: false }));

        try {
            // Animation Delay
            await new Promise(r => setTimeout(r, 800));
            
            const canvas = await html2canvas(canvasRef.current, { scale: 3, useCORS: true });
            const name = (filenameRef.current?.value || 'A4King_Project').replace(/\s+/g, '_');

            // Trigger eject animation
            const paperEl = document.getElementById('printed-paper');
            if (paperEl) paperEl.classList.add('h-[200px]', 'top-[10px]');

            await new Promise(r => setTimeout(r, 1500));
            setPrintCount(c => c + 1);

            if (format === 'png') {
                const a = document.createElement('a');
                a.download = `${name}.png`;
                a.href = canvas.toDataURL('image/png');
                a.click();
            } else {
                const { jsPDF } = jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
                pdf.save(`${name}.pdf`);
            }

        } catch (e) {
            console.error("Print failed", e);
            alert("Printing failed. See console.");
        } finally {
            setState(prev => ({ ...prev, showGuides: oldGuides, showCutLines: oldCut }));
            setIsPrinting(false);
            const paperEl = document.getElementById('printed-paper');
            if (paperEl) setTimeout(() => paperEl.classList.remove('h-[200px]', 'top-[10px]'), 500);
        }
    };
    
    // Drag handling for reordering
    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('id', id);
        e.dataTransfer.setData('source', 'canvas');
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-start gap-8 h-full relative overflow-y-auto overflow-x-hidden pt-5 px-5">
            
            {/* A4 Wrapper */}
            <div className="relative z-10 mt-2 p-5" ref={containerRef}>
                {/* Sticky Note */}
                <div className="absolute top-5 -left-[140px] w-[130px] h-[100px] bg-[#fff3cd] shadow-lg p-4 pt-6 -rotate-2 z-[5] rounded-br-[30px] font-['Comic_Sans_MS',cursive] text-[#555]">
                    <div className="absolute -top-3 left-8 w-16 h-6 bg-white/30 border border-white/20 -rotate-1 backdrop-blur-sm shadow-sm"></div>
                    <div className="text-[10px] mb-1 font-bold">NAME:</div>
                    <textarea 
                        ref={filenameRef}
                        className="w-full bg-transparent border-none outline-none text-sm font-bold resize-none text-[#444] h-full leading-tight" 
                        defaultValue="My_Project" 
                    />
                </div>

                {/* The Canvas */}
                <div 
                    className={`relative bg-white transition-transform duration-800 ${isPrinting ? 'translate-y-[200px] scale-90 opacity-0' : 'hover:scale-[1.01] duration-300'}`}
                    style={paperStyle}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('brightness-95'); }}
                    onDragLeave={(e) => { e.currentTarget.classList.remove('brightness-95'); }}
                    onDrop={(e) => { e.currentTarget.classList.remove('brightness-95'); onDropCanvas(e); }}
                >
                    <div 
                        id="a4-canvas"
                        ref={canvasRef}
                        className="relative overflow-hidden bg-transparent"
                        style={{
                            width: '70vh',
                            height: `calc(70vh / ${A4_RATIO})`,
                            maxWidth: '600px',
                            maxHeight: `calc(600px / ${A4_RATIO})`,
                        }}
                    >
                        {/* Empty Tip */}
                        {canvasImages.length === 0 && (
                            <div className="absolute inset-0 flex justify-center items-center text-[#aab2c0] font-bold tracking-widest border-2 border-dashed border-[#d1d9e6] pointer-events-none">
                                DROP ZONE
                            </div>
                        )}

                        {/* Content Layer */}
                        {layout.positions.map((pos) => (
                            <div
                                key={pos.img.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, pos.img.id)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const draggedId = e.dataTransfer.getData('id');
                                    // Handle swap logic in App parent if simpler, or just allow the main Drop to handle logic
                                    // For simplicity in this demo, let the main canvas drop handler manage it via checking positions
                                }}
                                className="absolute cursor-grab active:cursor-grabbing group hover:z-20 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:scale-105"
                                style={{
                                    left: pos.x,
                                    top: pos.y,
                                    width: pos.w,
                                    height: pos.h,
                                }}
                            >
                                <div 
                                    className="w-full h-full relative overflow-hidden bg-white shadow-md block box-border"
                                    style={{ border: state.borderSize > 0 ? `${state.borderSize * pxPerMM}px solid ${state.borderColor}` : 'none' }}
                                >
                                    <img src={pos.img.src} alt="" className="w-full h-full block pointer-events-none" style={{ objectFit: pos.fit }} />
                                </div>
                                
                                {/* Rotate Button Overlay */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRotateImage(pos.img.id); }}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-rose-500/90 border-4 border-white shadow-lg text-white text-2xl font-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 hover:scale-110 z-50 cursor-pointer"
                                >
                                    ↻
                                </button>
                            </div>
                        ))}

                        {/* Overlays */}
                        {state.showGuides && state.margin > 0 && (
                            <div 
                                className="absolute inset-0 pointer-events-none z-20"
                                style={{
                                    border: `${state.margin * pxPerMM}px solid transparent`,
                                    backgroundImage: `repeating-linear-gradient(45deg, rgba(0,0,0,0.15) 0, rgba(0,0,0,0.15) 2px, transparent 2px, transparent 8px)`,
                                    mask: `linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)`,
                                    WebkitMask: `linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)`,
                                    maskComposite: 'exclude',
                                    WebkitMaskComposite: 'xor'
                                }}
                            />
                        )}

                        {state.showCutLines && layout.positions.length > 0 && (
                            <div className="absolute inset-0 pointer-events-none z-20">
                                {/* Simplified Cut Lines Visualization based on layout data */}
                                {layout.type === 'grid' && (
                                    <>
                                        {/* Vertical lines between columns */}
                                        {Array.from({length: Math.ceil(Math.sqrt(canvasImages.length)) - 1}).map((_, i) => (
                                            <div key={`v-${i}`} className="absolute top-0 bottom-0 w-0 border-l-2 border-dashed border-gray-500/50" 
                                                style={{ left: (state.margin * pxPerMM) + (i + 1) * ((layout.positions[0].w) + layout.gap) - (layout.gap / 2) }} />
                                        ))}
                                        {/* Horizontal lines */}
                                        {Array.from({length: Math.ceil(canvasImages.length / Math.ceil(Math.sqrt(canvasImages.length))) - 1}).map((_, i) => (
                                            <div key={`h-${i}`} className="absolute left-0 right-0 h-0 border-t-2 border-dashed border-gray-500/50" 
                                                style={{ top: (state.margin * pxPerMM) + (i + 1) * ((layout.positions[0].h) + layout.gap) - (layout.gap / 2) }} />
                                        ))}
                                    </>
                                )}
                                {layout.type === 'max' && layout.positions.length > 0 && (
                                     /* Just draw lines around items for Max mode complexity */
                                     layout.positions.map((p, i) => (
                                         <div key={i} className="absolute border border-dashed border-gray-400/50 -inset-1 pointer-events-none"
                                            style={{ left: p.x - 2, top: p.y - 2, width: p.w + 4, height: p.h + 4 }}
                                         />
                                     ))
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Printer Terminal */}
            <div className="w-full max-w-[580px] p-6 pb-8 bg-[#f2f4f8] rounded-3xl border border-white/60 shadow-[0_10px_25px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(255,255,255,0.9)] flex items-center justify-between relative -mt-8 z-[5]">
                {/* Slot */}
                <div className="absolute -top-3 left-10 right-10 h-3 bg-[#2f3542] rounded-md shadow-[inset_0_-2px_5px_rgba(0,0,0,0.5)]"></div>
                
                {/* Recycle Button */}
                <div className="flex flex-col items-center gap-1.5">
                    <button 
                        onClick={onRecycleAll}
                        title="Recycle All"
                        className="w-11 h-11 rounded-xl border-none bg-gradient-to-br from-[#ffff00] to-[#ffcc00] shadow-[0_4px_0_#e6b800,0_10px_15px_rgba(0,0,0,0.2)] text-[#333] text-2xl font-black flex items-center justify-center cursor-pointer active:translate-y-1 active:shadow-[0_0_0_#e6b800,inset_0_2px_4px_rgba(0,0,0,0.2)] hover:brightness-105 transition-all"
                    >
                        ♻
                    </button>
                    <span className="text-[9px] font-bold text-[#555]">RECYCLE</span>
                </div>

                {/* Status Screen */}
                <div className="bg-[#222] text-[#2ed573] font-mono p-2.5 px-4 rounded-lg shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.2)] text-xs text-center w-20 shadow-green-400/20 drop-shadow-sm">
                    <div className="opacity-60 mb-0.5 text-[10px]">STATUS</div>
                    <div className="font-bold text-sm">IMG:{canvasImages.length.toString().padStart(2, '0')}</div>
                </div>

                {/* Format Toggle */}
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-[#555]">FORMAT</span>
                    <div 
                        onClick={() => setFormat(f => f === 'pdf' ? 'png' : 'pdf')}
                        className={`w-[70px] h-8 rounded-full bg-[#f2f4f8] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] relative cursor-pointer border border-white/60 p-0.5 ${format === 'png' ? 'active' : ''}`}
                    >
                        <div className={`w-7 h-7 rounded-full bg-[#f1f2f6] shadow-md border border-white absolute top-0.5 flex items-center justify-center text-[9px] font-black text-[#555] transition-all duration-300 ${format === 'png' ? 'left-[40px] text-rose-500' : 'left-[2px]'}`}>
                            {format.toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Big Red Button */}
                <button 
                    onClick={handlePrint}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff5e6c] to-[#ff4757] border-[3px] border-[#f2f4f8] shadow-[0_10px_20px_rgba(255,71,87,0.4),inset_0_2px_2px_rgba(255,255,255,0.4)] text-white font-black text-xs cursor-pointer flex items-center justify-center active:scale-95 active:bg-[#e04050] active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.3)] transition-all"
                >
                    PRINT
                </button>

                {/* Output Slot */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[80%] h-2.5 bg-[#2f3542] rounded-b-xl z-[1]"></div>
                
                {/* Paper Animation Ejection Element */}
                <div 
                    id="printed-paper"
                    className="absolute -top-2.5 left-[5%] w-[90%] h-0 bg-white shadow-lg transition-all duration-1000 ease-out z-0"
                ></div>
            </div>
            
            {/* Print Counter (Badge in UI) */}
             <div className="absolute top-0 right-0 p-4 opacity-50 pointer-events-none">
                 prints: {printCount}
             </div>
        </div>
    );
};

export default WorkStage;