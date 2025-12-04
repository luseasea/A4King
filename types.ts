export interface AppImage {
    id: string;
    name: string;
    src: string;
    w: number;
    h: number;
    status: 'basket' | 'canvas';
}

export type LayoutMode = 'max' | 'grid';

export interface LayoutData {
    type: LayoutMode;
    scale?: number;
    positions: PositionedImage[];
    gap: number;
    colW?: number;
}

export interface PositionedImage {
    img: AppImage;
    x: number;
    y: number;
    w: number;
    h: number;
    fit: 'contain' | 'cover';
    col: number;
}

export interface AppState {
    images: AppImage[];
    mode: LayoutMode;
    margin: number;
    gap: number;
    borderSize: number;
    borderColor: string;
    paperColor: string;
    paperPattern: 'none' | 'lines' | 'grid' | 'dots';
    showGuides: boolean;
    showCutLines: boolean;
}