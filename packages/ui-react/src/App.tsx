import { useState } from 'react';
import ChessScene from './components/ChessScene';
import {
    PlayerProfile,
    CapturedPiecesDock,
    MoveHistory,
    GameStatusBanner,
    ThemeSelector,
    ControlsBar,
} from './components/Overlay';
import { useChessEngine } from './hooks/useChessEngine';
import { getThemeById } from './themes';

export default function App() {
    const chess = useChessEngine();
    const [themeId, setThemeId] = useState('marble');
    const theme = getThemeById(themeId);

    return (
        <div className="w-screen h-screen relative overflow-hidden">
            {/* ─── Full-screen 3D Canvas ─────────────────────────── */}
            <div className="absolute inset-0">
                <ChessScene
                    board={chess.board}
                    theme={theme}
                    selectedSquare={chess.selectedSquare}
                    legalMoveSquares={chess.legalMoveSquares}
                    onSquareClick={chess.selectSquare}
                />
            </div>

            {/* ─── UI Overlays (glassmorphism) ───────────────────── */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col">
                {/* ── Top Bar ──────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-4">
                    {/* Logo / Title */}
                    <div className="glass-panel px-5 py-3">
                        <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            ♔ PolyglotChess
                        </h1>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">
                            React · Three.js
                        </p>
                    </div>

                    {/* Theme Selector */}
                    <ThemeSelector currentTheme={theme} onThemeChange={setThemeId} />
                </div>

                {/* ── Middle Row ───────────────────────────────────── */}
                <div className="flex-1 flex items-stretch justify-between py-4">
                    {/* Left Column: Players + Captures */}
                    <div className="flex flex-col gap-3 w-52 pointer-events-auto">
                        <PlayerProfile color="b" name="Player 2" isActive={chess.turn === 'b'} />
                        <CapturedPiecesDock captures={chess.capturedPieces} />
                        <div className="flex-1" />
                        <PlayerProfile color="w" name="Player 1" isActive={chess.turn === 'w'} />
                    </div>

                    {/* Center: Game status */}
                    <div className="flex-1 flex items-center justify-center">
                        <GameStatusBanner status={chess.gameStatus} />
                    </div>

                    {/* Right Column: Move History */}
                    <div className="w-56 pointer-events-auto">
                        <MoveHistory history={chess.moveHistory} />
                    </div>
                </div>

                {/* ── Bottom Bar ───────────────────────────────────── */}
                <div className="flex items-end justify-between">
                    <ControlsBar onUndo={chess.undo} onReset={chess.reset} />
                    <div className="glass-badge text-white/40">
                        FEN: <span className="font-mono text-[10px]">{chess.fen.split(' ').slice(0, 2).join(' ')}…</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
