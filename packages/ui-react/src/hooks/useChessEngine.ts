import { useState, useCallback, useEffect, useRef } from 'react';
import {
    ChessEngine,
    type BoardState,
    type CapturedPieces,
    type GameStatus,
    type MoveInfo,
    type PieceInfo,
} from '@chess/core';
import type { Square } from 'chess.js';

export interface UseChessEngineReturn {
    board: (PieceInfo | null)[][];
    turn: 'w' | 'b';
    fen: string;
    moveHistory: MoveInfo[];
    capturedPieces: CapturedPieces;
    gameStatus: GameStatus;
    selectedSquare: Square | null;
    legalMoveSquares: Square[];
    selectSquare: (square: Square) => void;
    makeMove: (from: Square, to: Square) => boolean;
    undo: () => void;
    reset: () => void;
}

export function useChessEngine(): UseChessEngineReturn {
    const engineRef = useRef<ChessEngine>(new ChessEngine());
    const engine = engineRef.current;

    const [board, setBoard] = useState<(PieceInfo | null)[][]>(engine.getBoard().board);
    const [turn, setTurn] = useState<'w' | 'b'>('w');
    const [fen, setFen] = useState(engine.getFen());
    const [moveHistory, setMoveHistory] = useState<MoveInfo[]>([]);
    const [capturedPieces, setCapturedPieces] = useState<CapturedPieces>({ white: [], black: [] });
    const [gameStatus, setGameStatus] = useState<GameStatus>(engine.getGameStatus());
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [legalMoveSquares, setLegalMoveSquares] = useState<Square[]>([]);

    // Subscribe to engine events
    useEffect(() => {
        const unsubs = [
            engine.events.subscribe('boardUpdate', (state: BoardState) => {
                setBoard(state.board);
                setTurn(state.turn);
                setFen(state.fen);
                setGameStatus(engine.getGameStatus());
            }),
            engine.events.subscribe('moveUpdate', ({ history }) => {
                setMoveHistory([...history]);
            }),
            engine.events.subscribe('capturesUpdate', (captures: CapturedPieces) => {
                setCapturedPieces({ ...captures });
            }),
            engine.events.subscribe('reset', () => {
                setMoveHistory([]);
                setSelectedSquare(null);
                setLegalMoveSquares([]);
            }),
        ];

        return () => unsubs.forEach((u) => u());
    }, [engine]);

    const selectSquare = useCallback(
        (square: Square) => {
            if (gameStatus.isGameOver) {
                return;
            }

            // If clicking same square, deselect
            if (selectedSquare === square) {
                setSelectedSquare(null);
                setLegalMoveSquares([]);
                return;
            }

            // If a piece is selected and clicked square is a legal move, make the move
            if (selectedSquare && legalMoveSquares.includes(square)) {
                engine.move({ from: selectedSquare, to: square, promotion: 'q' });
                setSelectedSquare(null);
                setLegalMoveSquares([]);
                return;
            }

            // Try to select a new piece
            const row = 8 - parseInt(square[1]);
            const col = square.charCodeAt(0) - 97;
            const piece = board[row]?.[col];

            if (piece && piece.color === turn) {
                setSelectedSquare(square);
                const moves = engine.getLegalMoves(square);
                setLegalMoveSquares(moves.map((m) => m.to));
            } else {
                setSelectedSquare(null);
                setLegalMoveSquares([]);
            }
        },
        [selectedSquare, legalMoveSquares, board, turn, engine, gameStatus],
    );

    const makeMove = useCallback(
        (from: Square, to: Square): boolean => {
            const result = engine.move({ from, to, promotion: 'q' });
            setSelectedSquare(null);
            setLegalMoveSquares([]);
            return result !== null;
        },
        [engine],
    );

    const undo = useCallback(() => {
        engine.undo();
        setSelectedSquare(null);
        setLegalMoveSquares([]);
    }, [engine]);

    const reset = useCallback(() => {
        engine.reset();
    }, [engine]);

    return {
        board,
        turn,
        fen,
        moveHistory,
        capturedPieces,
        gameStatus,
        selectedSquare,
        legalMoveSquares,
        selectSquare,
        makeMove,
        undo,
        reset,
    };
}
