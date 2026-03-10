import type { Color, PieceSymbol, Square } from 'chess.js';

// ─── Board & Pieces ────────────────────────────────────────────

export interface PieceInfo {
    type: PieceSymbol;
    color: Color;
    square: Square;
}

export interface BoardState {
    /** 8×8 array representation — null for empty squares */
    board: (PieceInfo | null)[][];
    /** Current FEN string */
    fen: string;
    /** Whose turn it is */
    turn: Color;
}

// ─── Moves ─────────────────────────────────────────────────────

export interface MoveInfo {
    from: Square;
    to: Square;
    piece: PieceSymbol;
    color: Color;
    captured?: PieceSymbol;
    promotion?: PieceSymbol;
    san: string;
    flags: string;
}

// ─── Captured Pieces ───────────────────────────────────────────

export interface CapturedPieces {
    white: PieceSymbol[]; // pieces captured BY white (i.e. black pieces lost)
    black: PieceSymbol[]; // pieces captured BY black (i.e. white pieces lost)
}

// ─── Game Status ───────────────────────────────────────────────

export type GameOverReason =
    | 'checkmate'
    | 'stalemate'
    | 'threefold_repetition'
    | 'insufficient_material'
    | 'fifty_move_rule'
    | 'draw';

export interface GameStatus {
    isGameOver: boolean;
    isCheck: boolean;
    isCheckmate: boolean;
    isStalemate: boolean;
    isDraw: boolean;
    isThreefoldRepetition: boolean;
    isInsufficientMaterial: boolean;
    turn: Color;
    reason?: GameOverReason;
    winner?: Color;
}

// ─── Event Map ─────────────────────────────────────────────────

export interface GameEventMap {
    boardUpdate: BoardState;
    moveUpdate: { move: MoveInfo; history: MoveInfo[] };
    capturesUpdate: CapturedPieces;
    gameOver: GameStatus;
    reset: BoardState;
}
