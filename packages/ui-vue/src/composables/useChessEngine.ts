import { ref, onMounted, onUnmounted } from 'vue';
import {
    ChessEngine,
    type BoardState,
    type PieceInfo,
    type MoveInfo,
    type CapturedPieces,
    type GameStatus,
} from '@chess/core';
import type { Square } from 'chess.js';

export function useChessEngine() {
    const engine = new ChessEngine();

    const board = ref<(PieceInfo | null)[][]>(engine.getBoard().board);
    const turn = ref<'w' | 'b'>('w');
    const fen = ref(engine.getFen());
    const moveHistory = ref<MoveInfo[]>([]);
    const capturedPieces = ref<CapturedPieces>({ white: [], black: [] });
    const gameStatus = ref<GameStatus>(engine.getGameStatus());
    const selectedSquare = ref<Square | null>(null);
    const legalMoveSquares = ref<Square[]>([]);

    const unsubs: (() => void)[] = [];

    onMounted(() => {
        unsubs.push(
            engine.events.subscribe('boardUpdate', (s: BoardState) => {
                board.value = s.board;
                turn.value = s.turn;
                fen.value = s.fen;
                gameStatus.value = engine.getGameStatus();
            }),
            engine.events.subscribe('moveUpdate', ({ history }) => {
                moveHistory.value = [...history];
            }),
            engine.events.subscribe('capturesUpdate', (c: CapturedPieces) => {
                capturedPieces.value = { ...c };
            }),
            engine.events.subscribe('reset', () => {
                moveHistory.value = [];
                selectedSquare.value = null;
                legalMoveSquares.value = [];
            }),
        );
    });

    onUnmounted(() => unsubs.forEach((u) => u()));

    function selectSquare(sq: Square) {
        if (gameStatus.value.isGameOver) return;
        if (selectedSquare.value === sq) {
            selectedSquare.value = null;
            legalMoveSquares.value = [];
            return;
        }
        if (selectedSquare.value && legalMoveSquares.value.includes(sq)) {
            engine.move({ from: selectedSquare.value, to: sq, promotion: 'q' });
            selectedSquare.value = null;
            legalMoveSquares.value = [];
            return;
        }
        const row = 8 - parseInt(sq[1]);
        const col = sq.charCodeAt(0) - 97;
        const piece = board.value[row]?.[col];
        if (piece && piece.color === turn.value) {
            selectedSquare.value = sq;
            legalMoveSquares.value = engine.getLegalMoves(sq).map((m) => m.to);
        } else {
            selectedSquare.value = null;
            legalMoveSquares.value = [];
        }
    }

    function undo() {
        engine.undo();
        selectedSquare.value = null;
        legalMoveSquares.value = [];
    }

    function reset() {
        engine.reset();
    }

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
        undo,
        reset,
    };
}
