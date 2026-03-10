import { describe, it, expect, vi } from 'vitest';
import { ChessEngine } from '../engine.js';

describe('ChessEngine', () => {
    // ── Initial State ─────────────────────────────────────────

    describe('initial state', () => {
        it('should start from the default position', () => {
            const engine = new ChessEngine();
            const board = engine.getBoard();
            expect(board.turn).toBe('w');
            expect(board.fen).toContain('rnbqkbnr');
        });

        it('should start from a custom FEN', () => {
            const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
            const engine = new ChessEngine(fen);
            expect(engine.getFen()).toBe(fen);
            expect(engine.getBoard().turn).toBe('b');
        });

        it('should have no captured pieces initially', () => {
            const engine = new ChessEngine();
            const captures = engine.getCapturedPieces();
            expect(captures.white).toEqual([]);
            expect(captures.black).toEqual([]);
        });

        it('should not be game over at start', () => {
            const engine = new ChessEngine();
            const status = engine.getGameStatus();
            expect(status.isGameOver).toBe(false);
            expect(status.isCheck).toBe(false);
        });
    });

    // ── Legal Moves ───────────────────────────────────────────

    describe('legal moves', () => {
        it('should return legal moves from the starting position', () => {
            const engine = new ChessEngine();
            const moves = engine.getLegalMoves();
            // 20 legal moves in the starting position
            expect(moves.length).toBe(20);
        });

        it('should return legal moves from a specific square', () => {
            const engine = new ChessEngine();
            const moves = engine.getLegalMoves('e2');
            expect(moves.length).toBe(2); // e3, e4
            expect(moves.map((m) => m.to)).toContain('e3');
            expect(moves.map((m) => m.to)).toContain('e4');
        });
    });

    // ── Making Moves ──────────────────────────────────────────

    describe('move', () => {
        it('should accept SAN notation', () => {
            const engine = new ChessEngine();
            const result = engine.move('e4');
            expect(result).not.toBeNull();
            expect(result!.san).toBe('e4');
            expect(engine.getBoard().turn).toBe('b');
        });

        it('should accept object notation', () => {
            const engine = new ChessEngine();
            const result = engine.move({ from: 'e2', to: 'e4' });
            expect(result).not.toBeNull();
            expect(result!.from).toBe('e2');
            expect(result!.to).toBe('e4');
        });

        it('should return null for illegal moves', () => {
            const engine = new ChessEngine();
            const result = engine.move('e5'); // illegal for white
            expect(result).toBeNull();
        });

        it('should emit boardUpdate on move', () => {
            const engine = new ChessEngine();
            const spy = vi.fn();
            engine.events.subscribe('boardUpdate', spy);

            engine.move('e4');

            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy.mock.calls[0][0].turn).toBe('b');
        });

        it('should emit moveUpdate on move', () => {
            const engine = new ChessEngine();
            const spy = vi.fn();
            engine.events.subscribe('moveUpdate', spy);

            engine.move('e4');

            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy.mock.calls[0][0].move.san).toBe('e4');
            expect(spy.mock.calls[0][0].history).toHaveLength(1);
        });
    });

    // ── Captures ──────────────────────────────────────────────

    describe('captures', () => {
        it('should track captured pieces', () => {
            const engine = new ChessEngine();
            engine.move('e4');
            engine.move('d5');
            const result = engine.move('exd5'); // white captures pawn
            expect(result).not.toBeNull();

            const captures = engine.getCapturedPieces();
            expect(captures.white).toContain('p'); // white captured a pawn
            expect(captures.black).toEqual([]);
        });

        it('should emit capturesUpdate on capture', () => {
            const engine = new ChessEngine();
            const spy = vi.fn();
            engine.events.subscribe('capturesUpdate', spy);

            engine.move('e4');
            engine.move('d5');
            engine.move('exd5');

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    // ── Undo ──────────────────────────────────────────────────

    describe('undo', () => {
        it('should undo the last move', () => {
            const engine = new ChessEngine();
            engine.move('e4');
            const undone = engine.undo();

            expect(undone).not.toBeNull();
            expect(undone!.san).toBe('e4');
            expect(engine.getBoard().turn).toBe('w');
        });

        it('should return null when no moves to undo', () => {
            const engine = new ChessEngine();
            expect(engine.undo()).toBeNull();
        });

        it('should restore captured pieces on undo', () => {
            const engine = new ChessEngine();
            engine.move('e4');
            engine.move('d5');
            engine.move('exd5');

            expect(engine.getCapturedPieces().white).toHaveLength(1);

            engine.undo();
            expect(engine.getCapturedPieces().white).toHaveLength(0);
        });
    });

    // ── Reset ─────────────────────────────────────────────────

    describe('reset', () => {
        it('should reset to starting position', () => {
            const engine = new ChessEngine();
            engine.move('e4');
            engine.move('e5');

            engine.reset();

            expect(engine.getBoard().turn).toBe('w');
            expect(engine.getMoveHistory()).toHaveLength(0);
            expect(engine.getCapturedPieces().white).toEqual([]);
        });

        it('should emit reset event', () => {
            const engine = new ChessEngine();
            const spy = vi.fn();
            engine.events.subscribe('reset', spy);

            engine.reset();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should reset to a custom FEN', () => {
            const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
            const engine = new ChessEngine();
            engine.reset(fen);
            expect(engine.getFen()).toBe(fen);
        });
    });

    // ── Checkmate / Game Over ─────────────────────────────────

    describe('checkmate detection', () => {
        it('should detect Scholar\'s Mate', () => {
            const engine = new ChessEngine();
            const spy = vi.fn();
            engine.events.subscribe('gameOver', spy);

            engine.move('e4');
            engine.move('e5');
            engine.move('Bc4');
            engine.move('Nc6');
            engine.move('Qh5');
            engine.move('Nf6');
            engine.move('Qxf7'); // Scholar's mate

            const status = engine.getGameStatus();
            expect(status.isGameOver).toBe(true);
            expect(status.isCheckmate).toBe(true);
            expect(status.winner).toBe('w');
            expect(status.reason).toBe('checkmate');
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    // ── Move History ──────────────────────────────────────────

    describe('move history', () => {
        it('should track full move history', () => {
            const engine = new ChessEngine();
            engine.move('e4');
            engine.move('e5');
            engine.move('Nf3');

            const history = engine.getMoveHistory();
            expect(history).toHaveLength(3);
            expect(history[0].san).toBe('e4');
            expect(history[1].san).toBe('e5');
            expect(history[2].san).toBe('Nf3');
        });
    });

    // ── Load FEN ──────────────────────────────────────────────

    describe('loadFen', () => {
        it('should load a FEN and reset state', () => {
            const engine = new ChessEngine();
            engine.move('e4');

            const fen = '8/8/8/8/8/8/6k1/4K2R w - - 0 1';
            engine.loadFen(fen);

            expect(engine.getFen()).toBe(fen);
            expect(engine.getMoveHistory()).toHaveLength(0);
        });
    });
});
