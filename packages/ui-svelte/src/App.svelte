<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Canvas } from '@threlte/core';
  import { ChessEngine, type BoardState, type PieceInfo, type MoveInfo, type CapturedPieces, type GameStatus } from '@chess/core';
  import type { Square } from 'chess.js';
  import ChessBoard3D from './components/ChessBoard3D.svelte';
  import Sidebar from './components/Sidebar.svelte';

  const THEMES = [
    { id: 'marble', name: 'Classic Marble', icon: '🏛️', light: '#f0d9b5', dark: '#b58863', wPiece: '#faf5ef', bPiece: '#2c2520', selected: '#7bcc70', legal: '#7bcc70', edge: '#6b4423', bg1: '#1a0f08', bg2: '#0d0805' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon', icon: '🌃', light: '#1a1a2e', dark: '#0f0f1a', wPiece: '#00fff5', bPiece: '#ff00e5', selected: '#ffff00', legal: '#00ff88', edge: '#0a0a14', bg1: '#0a001a', bg2: '#000810' },
    { id: 'glass', name: 'Minimalist Glass', icon: '💎', light: '#e0e0e8', dark: '#9898a8', wPiece: '#ffffff', bPiece: '#2a2a35', selected: '#6366f1', legal: '#818cf8', edge: '#4a4a58', bg1: '#0f0f14', bg2: '#08080c' },
  ];

  let engine = new ChessEngine();
  let board: (PieceInfo | null)[][] = engine.getBoard().board;
  let turn: 'w' | 'b' = 'w';
  let moveHistory: MoveInfo[] = [];
  let captures: CapturedPieces = { white: [], black: [] };
  let gameStatus: GameStatus = engine.getGameStatus();
  let selectedSquare: Square | null = null;
  let legalMoves: Square[] = [];
  let themeIdx = 0;
  $: theme = THEMES[themeIdx];

  const unsubs: (() => void)[] = [];

  onMount(() => {
    unsubs.push(
      engine.events.subscribe('boardUpdate', (s: BoardState) => { board = s.board; turn = s.turn; gameStatus = engine.getGameStatus(); }),
      engine.events.subscribe('moveUpdate', ({ history }) => { moveHistory = [...history]; }),
      engine.events.subscribe('capturesUpdate', (c: CapturedPieces) => { captures = { ...c }; }),
      engine.events.subscribe('reset', () => { moveHistory = []; selectedSquare = null; legalMoves = []; }),
    );
  });

  onDestroy(() => unsubs.forEach(u => u()));

  function selectSquare(sq: Square) {
    if (gameStatus.isGameOver) return;
    if (selectedSquare === sq) { selectedSquare = null; legalMoves = []; return; }
    if (selectedSquare && legalMoves.includes(sq)) {
      engine.move({ from: selectedSquare, to: sq, promotion: 'q' });
      selectedSquare = null; legalMoves = []; return;
    }
    const row = 8 - parseInt(sq[1]);
    const col = sq.charCodeAt(0) - 97;
    const piece = board[row]?.[col];
    if (piece && piece.color === turn) {
      selectedSquare = sq;
      legalMoves = engine.getLegalMoves(sq).map(m => m.to);
    } else { selectedSquare = null; legalMoves = []; }
  }

  function undo() { engine.undo(); selectedSquare = null; legalMoves = []; }
  function reset() { engine.reset(); }
</script>

<div class="w-screen h-screen relative overflow-hidden" style="background: linear-gradient(135deg, {theme.bg1}, {theme.bg2})">
  <!-- 3D Canvas -->
  <div class="absolute inset-0">
    <Canvas>
      <ChessBoard3D {board} {theme} {selectedSquare} {legalMoves} on:squareClick={(e) => selectSquare(e.detail)} />
    </Canvas>
  </div>

  <!-- UI Overlays -->
  <div class="absolute inset-0 pointer-events-none p-4 flex flex-col">
    <!-- Top Bar -->
    <div class="flex items-start justify-between">
      <div class="glass-panel px-5 py-3">
        <h1 class="text-lg font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">♔ PolyglotChess</h1>
        <p class="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Svelte · Threlte</p>
      </div>
      <div class="glass-panel px-3 py-2 flex gap-1.5">
        {#each THEMES as t, i}
          <button class="glass-button text-xs {themeIdx === i ? 'glass-button-active' : ''}" on:click={() => themeIdx = i}>
            {t.icon} <span class="hidden sm:inline">{t.name}</span>
          </button>
        {#/each}
      </div>
    </div>

    <!-- Middle -->
    <div class="flex-1 flex items-stretch justify-between py-4">
      <Sidebar {turn} {captures} {gameStatus} side="left" />
      <div class="flex-1" />
      <Sidebar {moveHistory} side="right" />
    </div>

    <!-- Bottom -->
    <div class="flex gap-2">
      <button class="glass-button text-xs" on:click={undo}>↩ Undo</button>
      <button class="glass-button text-xs" on:click={reset}>⟳ New Game</button>
    </div>
  </div>
</div>
