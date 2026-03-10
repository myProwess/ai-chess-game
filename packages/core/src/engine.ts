import { Chess } from 'chess.js';
import type { Color, PieceSymbol, Square, Move } from 'chess.js';
import { PubSub } from './pubsub.js';
import type {
    BoardState,
    CapturedPieces,
    GameEventMap,
    GameOverReason,
    GameStatus,
    MoveInfo,
    PieceInfo,
} from './types.js';

/**
 * ChessEngine — framework-agnostic chess game controller.
 *
 * Wraps `chess.js` and emits reactive events through a PubSub so
 * any UI framework can subscribe to state changes.
 */
export class ChessEngine {
    private chess: Chess;
    private capturedByWhite: PieceSymbol[] = [];
    private capturedByBlack: PieceSymbol[] = [];

    /** Public event bus — subscribe to board / move / game-over events. */
    public readonly events = new PubSub<GameEventMap>();

    constructor(fen?: string) {
        this.chess = fen ? new Chess(fen) : new Chess();
    }

    // ── Queries ────────────────────────────────────────────────

    /** Get the current board as an 8×8 grid. */
    getBoard(): BoardState {
        const raw = this.chess.board(); // (Piece | null)[][]
        const board: (PieceInfo | null)[][] = raw.map((row) =>
            row.map((cell) => {
                if (!cell) return null;
                return {
                    type: cell.type as PieceSymbol,
                    color: cell.color as Color,
                    square: cell.square as Square,
                };
            }),
        );

        return {
            board,
            fen: this.chess.fen(),
            turn: this.chess.turn() as Color,
        };
    }

    /** Return the current FEN string. */
    getFen(): string {
        return this.chess.fen();
    }

    /** Full move history as structured `MoveInfo` objects. */
    getMoveHistory(): MoveInfo[] {
        return this.chess.history({ verbose: true }).map(this.toMoveInfo);
    }

    /** Captured pieces grouped by the capturing side. */
    getCapturedPieces(): CapturedPieces {
        return {
            white: [...this.capturedByWhite],
            black: [...this.capturedByBlack],
        };
    }

    /** Comprehensive game-status snapshot. */
    getGameStatus(): GameStatus {
        const status: GameStatus = {
            isGameOver: this.chess.isGameOver(),
            isCheck: this.chess.isCheck(),
            isCheckmate: this.chess.isCheckmate(),
            isStalemate: this.chess.isStalemate(),
            isDraw: this.chess.isDraw(),
            isThreefoldRepetition: this.chess.isThreefoldRepetition(),
            isInsufficientMaterial: this.chess.isInsufficientMaterial(),
            turn: this.chess.turn() as Color,
        };

        if (status.isGameOver) {
            status.reason = this.getGameOverReason(status);
            if (status.isCheckmate) {
                // The side whose turn it is has been checkmated → the OTHER side wins.
                status.winner = status.turn === 'w' ? 'b' : 'w';
            }
        }

        return status;
    }

    /** Legal moves from a given square, or all legal moves if no square given. */
    getLegalMoves(square?: Square): MoveInfo[] {
        const opts = square ? { square } : undefined;
        return this.chess.moves({ verbose: true, ...opts }).map(this.toMoveInfo);
    }

    // ── Commands ───────────────────────────────────────────────

    /**
     * Attempt a move. Accepts SAN (`"e4"`) or object (`{ from, to }`).
     * Returns the move info on success, or `null` if illegal.
     */
    move(
        moveInput: string | { from: Square; to: Square; promotion?: PieceSymbol },
    ): MoveInfo | null {
        let result: Move;
        try {
            result = this.chess.move(moveInput);
        } catch {
            return null;
        }
        if (!result) return null;

        const moveInfo = this.toMoveInfo(result);

        // Track captures
        if (result.captured) {
            if (result.color === 'w') {
                this.capturedByWhite.push(result.captured as PieceSymbol);
            } else {
                this.capturedByBlack.push(result.captured as PieceSymbol);
            }
            this.events.publish('capturesUpdate', this.getCapturedPieces());
        }

        // Emit events
        this.events.publish('boardUpdate', this.getBoard());
        this.events.publish('moveUpdate', {
            move: moveInfo,
            history: this.getMoveHistory(),
        });

        if (this.chess.isGameOver()) {
            this.events.publish('gameOver', this.getGameStatus());
        }

        return moveInfo;
    }

    /** Undo the last move. Returns the undone move or `null`. */
    undo(): MoveInfo | null {
        const undone = this.chess.undo();
        if (!undone) return null;

        const moveInfo = this.toMoveInfo(undone);

        // Remove last capture if the undone move was a capture
        if (undone.captured) {
            if (undone.color === 'w') {
                this.capturedByWhite.pop();
            } else {
                this.capturedByBlack.pop();
            }
            this.events.publish('capturesUpdate', this.getCapturedPieces());
        }

        this.events.publish('boardUpdate', this.getBoard());
        this.events.publish('moveUpdate', {
            move: moveInfo,
            history: this.getMoveHistory(),
        });

        return moveInfo;
    }

    /** Reset the board to the starting position (or a custom FEN). */
    reset(fen?: string): void {
        if (fen) {
            this.chess.load(fen);
        } else {
            this.chess.reset();
        }
        this.capturedByWhite = [];
        this.capturedByBlack = [];

        const boardState = this.getBoard();
        this.events.publish('reset', boardState);
        this.events.publish('boardUpdate', boardState);
        this.events.publish('capturesUpdate', this.getCapturedPieces());
    }

    /** Load a position from FEN. */
    loadFen(fen: string): void {
        this.reset(fen);
    }

    // ── Helpers ────────────────────────────────────────────────

    private toMoveInfo = (m: Move): MoveInfo => ({
        from: m.from as Square,
        to: m.to as Square,
        piece: m.piece as PieceSymbol,
        color: m.color as Color,
        captured: m.captured as PieceSymbol | undefined,
        promotion: m.promotion as PieceSymbol | undefined,
        san: m.san,
        flags: m.flags,
    });

    private getGameOverReason(status: GameStatus): GameOverReason {
        if (status.isCheckmate) return 'checkmate';
        if (status.isStalemate) return 'stalemate';
        if (status.isThreefoldRepetition) return 'threefold_repetition';
        if (status.isInsufficientMaterial) return 'insufficient_material';
        return 'draw'; // covers fifty-move rule and agreement
    }
}
