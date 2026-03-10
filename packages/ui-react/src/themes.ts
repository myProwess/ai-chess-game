import * as THREE from 'three';

export interface ChessTheme {
    id: string;
    name: string;
    lightSquare: string;
    darkSquare: string;
    whitePiece: string;
    blackPiece: string;
    selectedSquare: string;
    legalMoveColor: string;
    boardEdge: string;
    environment: 'studio' | 'city' | 'sunset';
    pieceRoughness: number;
    pieceMetalness: number;
    squareRoughness: number;
    squareMetalness: number;
    emissiveIntensity: number;
    bgGradient: [string, string];
}

export const themes: ChessTheme[] = [
    {
        id: 'marble',
        name: 'Classic Marble',
        lightSquare: '#f0d9b5',
        darkSquare: '#b58863',
        whitePiece: '#faf5ef',
        blackPiece: '#2c2520',
        selectedSquare: '#7bcc70',
        legalMoveColor: '#7bcc70',
        boardEdge: '#6b4423',
        environment: 'studio',
        pieceRoughness: 0.25,
        pieceMetalness: 0.1,
        squareRoughness: 0.3,
        squareMetalness: 0.05,
        emissiveIntensity: 0,
        bgGradient: ['#1a0f08', '#0d0805'],
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk Neon',
        lightSquare: '#1a1a2e',
        darkSquare: '#0f0f1a',
        whitePiece: '#00fff5',
        blackPiece: '#ff00e5',
        selectedSquare: '#ffff00',
        legalMoveColor: '#00ff88',
        boardEdge: '#0a0a14',
        environment: 'city',
        pieceRoughness: 0.1,
        pieceMetalness: 0.8,
        squareRoughness: 0.2,
        squareMetalness: 0.6,
        emissiveIntensity: 0.4,
        bgGradient: ['#0a001a', '#000810'],
    },
    {
        id: 'glass',
        name: 'Minimalist Glass',
        lightSquare: '#e0e0e8',
        darkSquare: '#9898a8',
        whitePiece: '#ffffff',
        blackPiece: '#2a2a35',
        selectedSquare: '#6366f1',
        legalMoveColor: '#818cf8',
        boardEdge: '#4a4a58',
        environment: 'sunset',
        pieceRoughness: 0.05,
        pieceMetalness: 0.3,
        squareRoughness: 0.1,
        squareMetalness: 0.15,
        emissiveIntensity: 0,
        bgGradient: ['#0f0f14', '#08080c'],
    },
];

export function getThemeById(id: string): ChessTheme {
    return themes.find((t) => t.id === id) ?? themes[0];
}
