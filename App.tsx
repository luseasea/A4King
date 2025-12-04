import React, { useState, useEffect, useCallback } from 'react';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import WorkStage from './components/WorkStage';
import { AppState, AppImage } from './types';

function App() {
  const [history, setHistory] = useState<AppImage[][]>([]);
  const [historyPtr, setHistoryPtr] = useState(-1);

  const [appState, setAppState] = useState<AppState>({
    images: [],
    mode: 'max',
    margin: 10,
    gap: 2,
    borderSize: 0,
    borderColor: 'white',
    paperColor: '#ffffff',
    paperPattern: 'none',
    showGuides: true,
    showCutLines: false
  });

  // Clock
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB'));
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString('en-GB')), 1000);
    return () => clearInterval(timer);
  }, []);

  // History Management
  const pushHistory = useCallback((newImages: AppImage[]) => {
    const newHistory = history.slice(0, historyPtr + 1);
    newHistory.push(newImages);
    if (newHistory.length > 10) newHistory.shift();
    
    setHistory(newHistory);
    setHistoryPtr(newHistory.length - 1);
    
    setAppState(prev => ({ ...prev, images: newImages }));
  }, [history, historyPtr]);

  // Initial history push
  useEffect(() => {
    if (history.length === 0) {
      pushHistory([]);
    }
  }, []);

  const handleUndo = () => {
    if (historyPtr > 0) {
      const prevPtr = historyPtr - 1;
      setHistoryPtr(prevPtr);
      setAppState(prev => ({ ...prev, images: history[prevPtr] }));
    }
  };

  const handleRedo = () => {
    if (historyPtr < history.length - 1) {
      const nextPtr = historyPtr + 1;
      setHistoryPtr(nextPtr);
      setAppState(prev => ({ ...prev, images: history[nextPtr] }));
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files) as File[];
    
    const newImages: AppImage[] = [];
    
    for (const file of files) {
      const src = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(file);
      });
      
      const dims = await new Promise<{w:number, h:number}>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.src = src;
      });

      newImages.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        src,
        w: dims.w,
        h: dims.h,
        status: 'basket'
      });
    }

    pushHistory([...appState.images, ...newImages]);
    e.target.value = '';
  };

  const handleDragStart = (e: React.DragEvent, id: string, source: 'basket' | 'canvas') => {
    e.dataTransfer.setData('id', id);
    e.dataTransfer.setData('source', source);
  };

  const handleDropTrash = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('id');
    if (confirm("Delete this photo permanently?")) {
        const newImages = appState.images.filter(img => img.id !== id);
        pushHistory(newImages);
    }
  };

  const handleDropBasket = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('id');
    const source = e.dataTransfer.getData('source');
    
    if (source === 'canvas') {
        const newImages = appState.images.map(img => 
            img.id === id ? { ...img, status: 'basket' as const } : img
        );
        pushHistory(newImages);
    }
  };

  const handleDropCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('id');
    
    // Check if dragging onto itself (sorting) or from basket
    const draggedImg = appState.images.find(i => i.id === id);
    if (!draggedImg) return;

    if (draggedImg.status === 'basket') {
        const newImages = appState.images.map(img => 
            img.id === id ? { ...img, status: 'canvas' as const } : img
        );
        pushHistory(newImages);
    } else {
        // Simple append to end if not doing complex sort insertion logic in this demo
        // For 'Max' layout, order dictates priority.
        const otherImages = appState.images.filter(i => i.id !== id);
        otherImages.push({ ...draggedImg, status: 'canvas' });
        pushHistory(otherImages);
    }
  };

  const rotateImage = async (id: string) => {
      const img = appState.images.find(i => i.id === id);
      if (!img) return;

      // Swap dimensions logically for the layout algorithm
      // And physically rotate the image data for the visual
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const imageObj = new Image();
      imageObj.src = img.src;
      await new Promise(r => imageObj.onload = r);

      canvas.width = imageObj.height;
      canvas.height = imageObj.width;
      
      if (ctx) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(90 * Math.PI / 180);
        ctx.drawImage(imageObj, -imageObj.width / 2, -imageObj.height / 2);
        
        const newSrc = canvas.toDataURL();
        const newImages = appState.images.map(i => 
            i.id === id ? { ...i, src: newSrc, w: i.h, h: i.w } : i
        );
        pushHistory(newImages);
      }
  };

  const recycleAll = () => {
    if (appState.images.some(i => i.status === 'canvas')) {
        if (confirm("Move all photos back to assets?")) {
            const newImages = appState.images.map(i => ({ ...i, status: 'basket' as const }));
            pushHistory(newImages);
        }
    }
  };

  return (
    <div className="flex flex-col h-screen text-[#1a1a1a] select-none bg-[#e6e9f0]">
      {/* Top Bar */}
      <div className="h-[70px] flex items-center justify-between px-8 z-50 shrink-0">
        <div className="text-2xl font-black text-[#1a1a1a] flex items-center gap-2.5 tracking-tighter w-[220px]">
          <div className="w-3.5 h-3.5 bg-[#ff3b30] rounded-full shadow-[0_0_10px_rgba(255,71,87,0.5)]"></div>
          A4King <span className="font-light text-xs ml-2 text-[#555]">React v1.0</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-xs">
             USER
          </div>
          <div className="flex flex-col leading-tight">
             <div className="font-extrabold text-[13px]">Designer</div>
             <div className="text-[10px] text-[#555]">READY</div>
          </div>
        </div>
        
        <div className="bg-[#f2f4f8] py-2 px-4 rounded-xl font-mono font-bold text-[#1a1a1a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)] border border-white/60">
          {time}
        </div>
      </div>

      {/* Workbench */}
      <div className="flex-1 flex px-8 pb-8 gap-8 items-start overflow-hidden">
        <SidebarLeft 
            images={appState.images} 
            onUpload={handleUpload} 
            onDragStart={handleDragStart}
            onDropTrash={handleDropTrash}
            onDropBasket={handleDropBasket}
        />
        
        <WorkStage 
            state={appState} 
            setState={setAppState} 
            onDropCanvas={handleDropCanvas}
            onRotateImage={rotateImage}
            onRecycleAll={recycleAll}
        />
        
        <SidebarRight 
            state={appState} 
            setState={setAppState}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyPtr > 0}
            canRedo={historyPtr < history.length - 1}
        />
      </div>

      {/* Modal Overlay (Generic implementation if needed, using native confirm for now) */}
    </div>
  );
}

export default App;