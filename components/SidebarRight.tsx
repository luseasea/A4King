import React from 'react';
import { AppState } from '../types';

interface SidebarRightProps {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const SidebarRight: React.FC<SidebarRightProps> = ({ state, setState, onUndo, onRedo, canUndo, canRedo }) => {
    
    const updateState = (updates: Partial<AppState>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    const plasticBtn = "flex-1 border-none outline-none bg-[#f2f4f8] text-[#1a1a1a] font-bold text-[13px] py-2.5 px-4 rounded-xl cursor-pointer shadow-[0_4px_8px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] border border-white/60 transition-all hover:-translate-y-px hover:shadow-[0_6px_12px_rgba(0,0,0,0.12)] hover:text-blue-600 active:translate-y-px active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)] active:bg-[#e8ecf1] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none";
    
    const sectionTitle = "text-[11px] font-extrabold text-[#555] uppercase tracking-widest flex items-center gap-1.5 mb-3 before:content-[''] before:w-1 before:h-1 before:bg-orange-400 before:rounded-full";
    
    const optionGroup = "flex gap-2.5 p-1.5 bg-[#e8ecf1] w-full rounded-2xl shadow-[inset_0_2px_6px_rgba(0,0,0,0.12)]";
    const optionItem = (isActive: boolean) => `flex-1 text-center py-2 px-1 rounded-lg text-xs font-bold cursor-pointer border border-transparent transition-all ${isActive ? 'text-blue-600 bg-[#f2f4f8] shadow-[0_4px_8px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] border-white/60' : 'text-[#555] hover:text-[#1a1a1a]'}`;

    const colors = [
        { val: 'white', bg: '#ffffff' },
        { val: '#ffb7b2', bg: '#ffb7b2' },
        { val: '#ffdac1', bg: '#ffdac1' },
        { val: '#e2f0cb', bg: '#e2f0cb' },
        { val: '#b5ead7', bg: '#b5ead7' },
        { val: '#c7ceea', bg: '#c7ceea' },
        { val: '#e0bbe4', bg: '#e0bbe4' }
    ];

    const paperColors = [
        { val: '#ffffff', bg: '#ffffff', name: 'White' },
        { val: '#fdf5e6', bg: '#fdf5e6', name: 'Ivory' },
        { val: '#f0f0f0', bg: '#f0f0f0', name: 'Gray' },
        { val: '#e8f4f8', bg: '#e8f4f8', name: 'Blueprint' }
    ];

    const patterns = [
        { id: 'none', bg: 'white' },
        { id: 'lines', style: { backgroundImage: 'linear-gradient(#00000020 1px, transparent 1px)', backgroundSize: '100% 10px' } },
        { id: 'grid', style: { backgroundImage: 'linear-gradient(#00000020 1px, transparent 1px), linear-gradient(90deg, #00000020 1px, transparent 1px)', backgroundSize: '10px 10px' } },
        { id: 'dots', style: { backgroundImage: 'radial-gradient(#00000030 1px, transparent 1px)', backgroundSize: '10px 10px', backgroundPosition: '-1px -1px' } }
    ];

    return (
        <div className="w-[280px] h-full flex flex-col gap-5 p-5 -m-5 overflow-y-auto">
            {/* Actions */}
            <div className="p-5 bg-[#f2f4f8] rounded-3xl border border-white/60 shadow-[0_10px_25px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(255,255,255,0.9)]">
                <div className={sectionTitle}>Actions</div>
                <div className="flex gap-2.5">
                    <button className={plasticBtn} onClick={onUndo} disabled={!canUndo}>↩ Undo</button>
                    <button className={plasticBtn} onClick={onRedo} disabled={!canRedo}>↪ Redo</button>
                </div>
            </div>

            {/* Layout Mode */}
            <div className="p-5 bg-[#f2f4f8] rounded-3xl border border-white/60 shadow-[0_10px_25px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(255,255,255,0.9)]">
                <div className={sectionTitle}>Layout Mode</div>
                <div className={optionGroup}>
                    <div className={optionItem(state.mode === 'max')} onClick={() => updateState({ mode: 'max' })}>🚀 Max</div>
                    <div className={optionItem(state.mode === 'grid')} onClick={() => updateState({ mode: 'grid' })}>📅 Grid</div>
                </div>
            </div>

            {/* Frame Settings */}
            <div className="p-5 bg-[#f2f4f8] rounded-3xl border border-white/60 shadow-[0_10px_25px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(255,255,255,0.9)]">
                <div className={sectionTitle}>Frame Settings</div>
                
                <div className="text-[11px] font-bold text-[#555] mb-1.5">Thickness</div>
                <div className={optionGroup}>
                    {[0, 2, 5, 8].map(size => (
                        <div key={size} className={optionItem(state.borderSize === size)} onClick={() => updateState({ borderSize: size })}>
                            {size === 0 ? 'None' : size === 2 ? 'Thin' : size === 5 ? 'Med' : 'Bold'}
                        </div>
                    ))}
                </div>

                <div className="text-[11px] font-bold text-[#555] mt-3 mb-1.5">Color</div>
                <div className="flex gap-2 flex-wrap">
                    {colors.map(c => (
                        <div 
                            key={c.val}
                            onClick={() => updateState({ borderColor: c.val })}
                            className={`w-7 h-7 rounded-full cursor-pointer shadow-[0_4px_8px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.8)] border-2 transition-transform hover:scale-110 ${state.borderColor === c.val ? 'border-[#1a1a1a] scale-110' : 'border-[#f2f4f8]'}`}
                            style={{ background: c.bg }}
                        />
                    ))}
                </div>
            </div>

            {/* Paper Settings */}
            <div className="p-5 bg-[#f2f4f8] rounded-3xl border border-white/60 shadow-[0_10px_25px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(255,255,255,0.9)]">
                <div className={sectionTitle}>Paper Settings</div>

                <div className="text-[11px] font-bold text-[#555] mb-1.5">Color</div>
                <div className="flex gap-2 flex-wrap mb-3">
                    {paperColors.map(c => (
                        <div 
                            key={c.val}
                            onClick={() => updateState({ paperColor: c.val })}
                            title={c.name}
                            className={`w-7 h-7 rounded-full cursor-pointer shadow-[0_4px_8px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.8)] border-2 transition-transform hover:scale-110 ${state.paperColor === c.val ? 'border-[#1a1a1a] scale-110' : 'border-[#f2f4f8]'}`}
                            style={{ background: c.bg }}
                        />
                    ))}
                </div>

                <div className="text-[11px] font-bold text-[#555] mb-1.5">Texture</div>
                <div className="flex gap-2 flex-wrap mb-3">
                    {patterns.map((p: any) => (
                        <div
                            key={p.id}
                            onClick={() => updateState({ paperPattern: p.id })}
                            className={`w-9 h-9 rounded-lg cursor-pointer shadow-[0_4px_8px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.8)] border-2 transition-transform hover:scale-105 bg-gray-50 ${state.paperPattern === p.id ? 'border-rose-500 scale-105' : 'border-[#f2f4f8]'}`}
                            style={p.style || { background: p.bg }}
                        />
                    ))}
                </div>

                <div className="text-[11px] font-bold text-[#555] mb-1.5">Margin</div>
                <div className={optionGroup}>
                    {[0, 10, 20].map(m => (
                        <div key={m} className={optionItem(state.margin === m)} onClick={() => updateState({ margin: m })}>{m}</div>
                    ))}
                </div>

                <div className="mt-3">
                     <div className="text-[11px] font-bold text-[#555] mb-1.5">Gap Spacing</div>
                     <input 
                        type="range" 
                        min="0" 
                        max="20" 
                        value={state.gap}
                        onChange={(e) => updateState({ gap: parseInt(e.target.value) })}
                        className="w-full h-2 bg-[#e8ecf1] rounded-lg appearance-none cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-[#f1f2f6] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white"
                     />
                </div>
            </div>
            
            {/* Toggles */}
            <div className="flex flex-col gap-2.5">
                 {/* Cut Lines */}
                <div 
                    className={`flex justify-between items-center bg-[#f2f4f8] p-2.5 px-3.5 rounded-xl shadow-[0_4px_8px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] border border-white/60 cursor-pointer active:scale-95 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)] transition-all ${state.showCutLines ? 'ring-1 ring-rose-300' : ''}`}
                    onClick={() => updateState({ showCutLines: !state.showCutLines })}
                >
                    <div className="text-xs font-bold text-[#1a1a1a] flex gap-1.5">✂️ Cut Lines</div>
                    <div className={`w-11 h-6 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] relative transition-colors ${state.showCutLines ? 'bg-rose-500' : 'bg-[#cbd5e0]'}`}>
                        <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] shadow-sm transition-all ${state.showCutLines ? 'left-[23px]' : 'left-[3px]'}`}></div>
                    </div>
                </div>

                {/* Guides */}
                <div 
                    className={`flex justify-between items-center bg-[#f2f4f8] p-2.5 px-3.5 rounded-xl shadow-[0_4px_8px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] border border-white/60 cursor-pointer active:scale-95 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)] transition-all ${state.showGuides ? 'ring-1 ring-rose-300' : ''}`}
                    onClick={() => updateState({ showGuides: !state.showGuides })}
                >
                    <div className="text-xs font-bold text-[#1a1a1a] flex gap-1.5">📏 Margin Guides</div>
                     <div className={`w-11 h-6 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] relative transition-colors ${state.showGuides ? 'bg-rose-500' : 'bg-[#cbd5e0]'}`}>
                        <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] shadow-sm transition-all ${state.showGuides ? 'left-[23px]' : 'left-[3px]'}`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SidebarRight;