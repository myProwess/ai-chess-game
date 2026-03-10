import type { MoveInfo, CapturedPieces, GameStatus } from '@chess/core';
import type { ChessTheme } from '../themes';
import { themes } from '../themes';

/* ─── Piece symbol lookup ───────────────────────────────────── */
const SYMBOLS: Record<string, string> = {
    p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
};

/* ─── Player Profile Card ───────────────────────────────────── */
export function PlayerProfile({
    color,
    name,
    isActive,
}: {
    color: 'w' | 'b';
    name: string;
    isActive: boolean;
}) {
    return (
        <div
            className={`glass-panel px-4 py-3 flex items-center gap-3 transition-all duration-300 ${isActive ? 'ring-2 ring-white/30 shadow-lg shadow-white/5' : 'opacity-70'
                }`}
        >
            <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${color === 'w'
                        ? 'bg-gradient-to-br from-white to-gray-200 text-gray-900'
                        : 'bg-gradient-to-br from-gray-700 to-gray-900 text-white'
                    }`}
            >
                {color === 'w' ? '♔' : '♚'}
            </div>
            <div>
                <div className="text-sm font-semibold text-white/90">{name}</div>
                <div className="text-xs text-white/50">{color === 'w' ? 'White' : 'Black'}</div>
            </div>
            {isActive && (
                <div className="ml-auto">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
                </div>
            )}
        </div>
    );
}

/* ─── Captured Pieces Dock ──────────────────────────────────── */
export function CapturedPiecesDock({ captures }: { captures: CapturedPieces }) {
    const pieceOrder = ['q', 'r', 'b', 'n', 'p'];

    const sortPieces = (pieces: string[]) => {
        return [...pieces].sort((a, b) => pieceOrder.indexOf(a) - pieceOrder.indexOf(b));
    };

    const renderGroup = (label: string, pieces: string[], textColor: string) => (
        <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{label}</div>
            <div className="flex flex-wrap gap-0.5 min-h-[24px]">
                {pieces.length === 0 ? (
                    <span className="text-xs text-white/20">—</span>
                ) : (
                    sortPieces(pieces).map((p, i) => (
                        <span key={i} className={`text-lg ${textColor} drop-shadow-sm`}>
                            {SYMBOLS[p] || p}
                        </span>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="glass-panel px-4 py-3 space-y-2">
            <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">Captured</div>
            {renderGroup('By White', captures.white, 'text-white/80')}
            {renderGroup('By Black', captures.black, 'text-white/60')}
        </div>
    );
}

/* ─── Move History Sidebar ──────────────────────────────────── */
export function MoveHistory({ history }: { history: MoveInfo[] }) {
    const movePairs: [MoveInfo, MoveInfo | undefined][] = [];
    for (let i = 0; i < history.length; i += 2) {
        movePairs.push([history[i], history[i + 1]]);
    }

    return (
        <div className="glass-panel px-4 py-3 flex flex-col max-h-80">
            <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Move History
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-0.5">
                {movePairs.length === 0 ? (
                    <div className="text-xs text-white/30 text-center py-4">No moves yet</div>
                ) : (
                    movePairs.map(([white, black], i) => (
                        <div key={i} className="flex items-center text-sm">
                            <span className="text-white/30 w-7 text-right mr-2 text-xs font-mono">
                                {i + 1}.
                            </span>
                            <span className="text-white/90 font-mono w-16">{white.san}</span>
                            <span className="text-white/70 font-mono w-16">{black?.san || ''}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

/* ─── Game Status Banner ────────────────────────────────────── */
export function GameStatusBanner({ status }: { status: GameStatus }) {
    if (!status.isGameOver && !status.isCheck) return null;

    let message = '';
    let colorClass = '';

    if (status.isCheckmate) {
        message = `Checkmate! ${status.winner === 'w' ? 'White' : 'Black'} wins!`;
        colorClass = 'from-amber-500/20 to-yellow-500/20 border-amber-400/30';
    } else if (status.isStalemate) {
        message = 'Stalemate — Draw!';
        colorClass = 'from-blue-500/20 to-cyan-500/20 border-blue-400/30';
    } else if (status.isDraw) {
        message = 'Draw!';
        colorClass = 'from-blue-500/20 to-cyan-500/20 border-blue-400/30';
    } else if (status.isCheck) {
        message = `${status.turn === 'w' ? 'White' : 'Black'} is in Check!`;
        colorClass = 'from-red-500/20 to-orange-500/20 border-red-400/30';
    }

    return (
        <div
            className={`glass-panel bg-gradient-to-r ${colorClass} px-5 py-3 text-center animate-pulse`}
        >
            <span className="text-sm font-bold text-white/95">{message}</span>
        </div>
    );
}

/* ─── Theme Selector ────────────────────────────────────────── */
export function ThemeSelector({
    currentTheme,
    onThemeChange,
}: {
    currentTheme: ChessTheme;
    onThemeChange: (id: string) => void;
}) {
    const themeIcons: Record<string, string> = {
        marble: '🏛️',
        cyberpunk: '🌃',
        glass: '💎',
    };

    return (
        <div className="glass-panel px-3 py-2 flex items-center gap-1.5">
            {themes.map((t) => (
                <button
                    key={t.id}
                    onClick={() => onThemeChange(t.id)}
                    className={`glass-button text-xs flex items-center gap-1.5 ${currentTheme.id === t.id ? 'glass-button-active' : ''
                        }`}
                    title={t.name}
                >
                    <span>{themeIcons[t.id]}</span>
                    <span className="hidden sm:inline">{t.name}</span>
                </button>
            ))}
        </div>
    );
}

/* ─── Controls Bar ──────────────────────────────────────────── */
export function ControlsBar({
    onUndo,
    onReset,
}: {
    onUndo: () => void;
    onReset: () => void;
}) {
    return (
        <div className="flex gap-2">
            <button onClick={onUndo} className="glass-button text-xs" title="Undo last move">
                ↩ Undo
            </button>
            <button onClick={onReset} className="glass-button text-xs" title="Reset game">
                ⟳ New Game
            </button>
        </div>
    );
}
