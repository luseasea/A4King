import { AppImage, LayoutData, PositionedImage } from '../types';

// A4 Ratio: 210mm / 297mm
export const A4_RATIO = 210 / 297;

export function calculateLayout(
    images: AppImage[],
    containerW: number,
    containerH: number,
    mode: 'max' | 'grid',
    gap: number,
    margin: number,
    pxPerMM: number
): LayoutData {
    const marginPx = margin * pxPerMM;
    const contentW = containerW - (marginPx * 2);
    const contentH = containerH - (marginPx * 2);
    
    // Safety check
    if (contentW <= 0 || contentH <= 0 || images.length === 0) {
        return { type: mode, positions: [], gap, scale: 1 };
    }

    const positions: PositionedImage[] = [];

    if (mode === 'grid') {
        // Grid Logic
        const cols = Math.ceil(Math.sqrt(images.length));
        const rows = Math.ceil(images.length / cols);
        
        const cellW = (contentW - (cols - 1) * gap) / cols;
        const cellH = (contentH - (rows - 1) * gap) / rows;
        
        images.forEach((img, i) => {
            const r = Math.floor(i / cols);
            const c = i % cols;
            positions.push({
                img,
                x: marginPx + c * (cellW + gap),
                y: marginPx + r * (cellH + gap),
                w: cellW,
                h: cellH,
                fit: 'contain',
                col: c
            });
        });

        return { type: 'grid', positions, gap };

    } else {
        // Max Logic (Bin packing strips)
        // Try 1 to 6 columns, find best fit
        let bestLayout: { pos: any[], scale: number, cols: number } | null = null;
        const maxCols = Math.min(images.length, 6);

        for (let c = 1; c <= maxCols; c++) {
            const colW = (contentW - (c - 1) * gap) / c;
            if (colW < 10) continue;

            let colHeights = new Array(c).fill(0);
            let tempPos: any[] = [];

            images.forEach(img => {
                // Determine height based on aspect ratio preserving width
                const h = colW * (img.h / img.w);
                
                // Find shortest column
                const minH = Math.min(...colHeights);
                const colIdx = colHeights.indexOf(minH);
                
                tempPos.push({
                    img,
                    colIdx,
                    y: minH, // relative Y in column
                    w: colW,
                    h: h
                });
                
                colHeights[colIdx] += h + gap;
            });

            const maxColH = Math.max(...colHeights) - gap; // Remove last gap
            // Calculate scale to fit vertical content height
            const scale = maxColH > contentH ? contentH / maxColH : 1;

            if (!bestLayout || scale > bestLayout.scale) {
                bestLayout = { pos: tempPos, scale, cols: c };
            }
        }

        if (bestLayout) {
            const { cols, scale, pos } = bestLayout;
            const finalGap = gap * scale;
            const finalColW = ((contentW - (cols - 1) * gap) / cols) * scale;
            
            // Center horizontally if scaled down significantly
            const totalUsedW = (cols * finalColW) + ((cols - 1) * finalGap);
            const offsetX = (contentW - totalUsedW) / 2;

            pos.forEach((p: any) => {
                positions.push({
                    img: p.img,
                    x: marginPx + offsetX + p.colIdx * (finalColW + finalGap),
                    y: marginPx + (p.y * scale),
                    w: finalColW,
                    h: p.h * scale,
                    fit: 'cover',
                    col: p.colIdx
                });
            });
            
            return { type: 'max', positions, gap: finalGap, scale, colW: finalColW };
        }
    }

    return { type: mode, positions: [], gap };
}