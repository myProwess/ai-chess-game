<script setup lang="ts">
import { ref, computed } from 'vue';
import { TresCanvas } from '@tresjs/core';
import { OrbitControls, ContactShadows } from '@tresjs/cientos';
import { useChessEngine } from './composables/useChessEngine';
import type { PieceInfo } from '@chess/core';
import type { Square } from 'chess.js';

const { board, turn, fen, moveHistory, capturedPieces, gameStatus, selectedSquare, legalMoveSquares, selectSquare, undo, reset } = useChessEngine();

const THEMES = [
  { id: 'marble', name: 'Classic Marble', icon: '🏛️', light: '#f0d9b5', dark: '#b58863', wPiece: '#faf5ef', bPiece: '#2c2520', selected: '#7bcc70', legal: '#7bcc70', edge: '#6b4423', bg1: '#1a0f08', bg2: '#0d0805' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', icon: '🌃', light: '#1a1a2e', dark: '#0f0f1a', wPiece: '#00fff5', bPiece: '#ff00e5', selected: '#ffff00', legal: '#00ff88', edge: '#0a0a14', bg1: '#0a001a', bg2: '#000810' },
  { id: 'glass', name: 'Minimalist Glass', icon: '💎', light: '#e0e0e8', dark: '#9898a8', wPiece: '#ffffff', bPiece: '#2a2a35', selected: '#6366f1', legal: '#818cf8', edge: '#4a4a58', bg1: '#0f0f14', bg2: '#08080c' },
];

const themeIdx = ref(0);
const theme = computed(() => THEMES[themeIdx.value]);

const SYMBOLS: Record<string, string> = { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' };

function rowColToSquare(row: number, col: number): Square {
  return `${String.fromCharCode(97 + col)}${8 - row}` as Square;
}

const selectedRC = computed(() => {
  if (!selectedSquare.value) return null;
  return [8 - parseInt(selectedSquare.value[1]), selectedSquare.value.charCodeAt(0) - 97];
});

const legalSet = computed(() => new Set(legalMoveSquares.value));

function handleSquareClick(row: number, col: number) {
  selectSquare(rowColToSquare(row, col));
}

function getSquareColor(row: number, col: number) {
  const t = theme.value;
  if (selectedRC.value && selectedRC.value[0] === row && selectedRC.value[1] === col) return t.selected;
  return (row + col) % 2 === 0 ? t.light : t.dark;
}

function getPieceColor(piece: PieceInfo) {
  return piece.color === 'w' ? theme.value.wPiece : theme.value.bPiece;
}

interface MovePair { white: { san: string }; black?: { san: string }; num: number; }
const movePairs = computed<MovePair[]>(() => {
  const pairs: MovePair[] = [];
  for (let i = 0; i < moveHistory.value.length; i += 2) {
    pairs.push({ white: moveHistory.value[i], black: moveHistory.value[i+1], num: Math.floor(i/2)+1 });
  }
  return pairs;
});
</script>

<template>
  <div class="w-screen h-screen relative overflow-hidden" :style="{ background: `linear-gradient(135deg, ${theme.bg1}, ${theme.bg2})` }">
    <!-- 3D Canvas -->
    <div class="absolute inset-0">
      <TresCanvas shadows :camera="{ position: [0, 10, 8], fov: 45 }">
        <!-- Lighting -->
        <TresAmbientLight :intensity="0.4" />
        <TresDirectionalLight :position="[8, 15, 8]" :intensity="1.2" cast-shadow />
        <TresPointLight :position="[-5, 8, -5]" :intensity="0.3" color="#ffeedd" />
        <template v-if="theme.id === 'cyberpunk'">
          <TresPointLight :position="[5, 3, 5]" :intensity="0.5" color="#00fff5" />
          <TresPointLight :position="[-5, 3, -5]" :intensity="0.5" color="#ff00e5" />
        </template>

        <!-- Board frame -->
        <TresMesh :position="[0, -0.06, 0]" receive-shadow>
          <TresBoxGeometry :args="[8.6, 0.12, 8.6]" />
          <TresMeshStandardMaterial :color="theme.edge" :roughness="0.4" :metalness="0.1" />
        </TresMesh>

        <!-- Board squares + pieces -->
        <template v-for="(row, rowIdx) in board" :key="rowIdx">
          <template v-for="(piece, colIdx) in row" :key="`${rowIdx}-${colIdx}`">
            <!-- Square -->
            <TresMesh
              :position="[colIdx - 3.5, 0, rowIdx - 3.5]"
              :rotation="[-Math.PI / 2, 0, 0]"
              receive-shadow
              @click="handleSquareClick(rowIdx, colIdx)"
            >
              <TresPlaneGeometry :args="[1, 1]" />
              <TresMeshStandardMaterial :color="getSquareColor(rowIdx, colIdx)" :roughness="0.3" :metalness="0.05" />
            </TresMesh>

            <!-- Legal move dot -->
            <TresMesh v-if="legalSet.has(rowColToSquare(rowIdx, colIdx))" :position="[colIdx - 3.5, 0.02, rowIdx - 3.5]" :rotation="[-Math.PI / 2, 0, 0]">
              <TresCircleGeometry :args="[0.15, 24]" />
              <TresMeshStandardMaterial :color="theme.legal" transparent :opacity="0.7" />
            </TresMesh>

            <!-- Piece -->
            <TresGroup v-if="piece" :position="[colIdx - 3.5, 0.01, rowIdx - 3.5]" @click.stop="handleSquareClick(rowIdx, colIdx)">
              <!-- Base -->
              <TresMesh :position="[0, 0.08, 0]" cast-shadow>
                <TresCylinderGeometry :args="[0.28, 0.32, 0.16, 20]" />
                <TresMeshStandardMaterial :color="getPieceColor(piece)" :roughness="0.25" :metalness="0.15" />
              </TresMesh>
              <!-- Body -->
              <TresMesh :position="[0, 0.35, 0]" cast-shadow>
                <TresCylinderGeometry :args="[0.12, 0.22, 0.38, 20]" />
                <TresMeshStandardMaterial :color="getPieceColor(piece)" :roughness="0.25" :metalness="0.15" />
              </TresMesh>
              <!-- Pawn top -->
              <TresMesh v-if="piece.type === 'p'" :position="[0, 0.6, 0]" cast-shadow>
                <TresSphereGeometry :args="[0.14, 16, 16]" />
                <TresMeshStandardMaterial :color="getPieceColor(piece)" :roughness="0.25" :metalness="0.15" />
              </TresMesh>
              <!-- Rook top -->
              <TresMesh v-if="piece.type === 'r'" :position="[0, 0.6, 0]" cast-shadow>
                <TresCylinderGeometry :args="[0.22, 0.18, 0.12, 20]" />
                <TresMeshStandardMaterial :color="getPieceColor(piece)" :roughness="0.25" :metalness="0.15" />
              </TresMesh>
              <!-- Bishop top -->
              <TresMesh v-if="piece.type === 'b'" :position="[0, 0.65, 0]" cast-shadow>
                <TresConeGeometry :args="[0.14, 0.3, 16]" />
                <TresMeshStandardMaterial :color="getPieceColor(piece)" :roughness="0.25" :metalness="0.15" />
              </TresMesh>
              <!-- Knight head -->
              <TresMesh v-if="piece.type === 'n'" :position="[0, 0.65, 0.06]" :rotation="[0.4, 0, 0]" cast-shadow>
                <TresBoxGeometry :args="[0.16, 0.28, 0.18]" />
                <TresMeshStandardMaterial :color="getPieceColor(piece)" :roughness="0.25" :metalness="0.15" />
              </TresMesh>
              <!-- Queen crown -->
              <template v-if="piece.type === 'q'">
                <TresMesh :position="[0, 0.62, 0]" cast-shadow>
                  <TresSphereGeometry :args="[0.1, 14, 14]" />
                  <TresMeshStandardMaterial :color="getPieceColor(piece)" :roughness="0.25" :metalness="0.15" />
                </TresMesh>
                <TresMesh :position="[0, 0.72, 0]" cast-shadow>
                  <TresConeGeometry :args="[0.06, 0.12, 8]" />
                  <TresMeshStandardMaterial :color="getPieceColor(piece)" :roughness="0.25" :metalness="0.15" />
                </TresMesh>
              </template>
              <!-- King cross -->
              <template v-if="piece.type === 'k'">
                <TresMesh :position="[0, 0.68, 0]" cast-shadow>
                  <TresBoxGeometry :args="[0.06, 0.24, 0.06]" />
                  <TresMeshStandardMaterial :color="getPieceColor(piece)" :roughness="0.25" :metalness="0.15" />
                </TresMesh>
                <TresMesh :position="[0, 0.74, 0]" cast-shadow>
                  <TresBoxGeometry :args="[0.18, 0.06, 0.06]" />
                  <TresMeshStandardMaterial :color="getPieceColor(piece)" :roughness="0.25" :metalness="0.15" />
                </TresMesh>
              </template>
            </TresGroup>
          </template>
        </template>

        <OrbitControls :enable-pan="false" :min-polar-angle="0.3" :max-polar-angle="Math.PI / 2.2" :min-distance="6" :max-distance="18" />
      </TresCanvas>
    </div>

    <!-- UI Overlays -->
    <div class="absolute inset-0 pointer-events-none p-4 flex flex-col">
      <!-- Top -->
      <div class="flex items-start justify-between">
        <div class="glass-panel px-5 py-3">
          <h1 class="text-lg font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">♔ PolyglotChess</h1>
          <p class="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Vue · TresJS</p>
        </div>
        <div class="glass-panel px-3 py-2 flex gap-1.5">
          <button v-for="(t, i) in THEMES" :key="t.id" class="glass-button text-xs" :class="{'glass-button-active': themeIdx === i}" @click="themeIdx = i">
            {{ t.icon }} <span class="hidden sm:inline">{{ t.name }}</span>
          </button>
        </div>
      </div>

      <!-- Middle -->
      <div class="flex-1 flex items-stretch justify-between py-4">
        <!-- Left: Players + Captures -->
        <div class="flex flex-col gap-3 w-52">
          <div :class="['glass-panel px-4 py-3 flex items-center gap-3 transition-all', turn === 'b' ? 'ring-2 ring-white/30' : 'opacity-70']">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold bg-gradient-to-br from-gray-700 to-gray-900 text-white">♚</div>
            <div><div class="text-sm font-semibold text-white/90">Player 2</div><div class="text-xs text-white/50">Black</div></div>
            <div v-if="turn === 'b'" class="ml-auto w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div class="glass-panel px-4 py-3 space-y-2">
            <div class="text-xs font-semibold text-white/60 uppercase tracking-wider">Captured</div>
            <div><div class="text-[10px] uppercase text-white/40">By White</div><div class="flex flex-wrap gap-0.5 min-h-[24px]"><span v-for="(p,i) in capturedPieces.white" :key="i" class="text-lg text-white/80">{{ SYMBOLS[p] || p }}</span><span v-if="!capturedPieces.white.length" class="text-xs text-white/20">—</span></div></div>
            <div><div class="text-[10px] uppercase text-white/40">By Black</div><div class="flex flex-wrap gap-0.5 min-h-[24px]"><span v-for="(p,i) in capturedPieces.black" :key="i" class="text-lg text-white/60">{{ SYMBOLS[p] || p }}</span><span v-if="!capturedPieces.black.length" class="text-xs text-white/20">—</span></div></div>
          </div>
          <div class="flex-1" />
          <div :class="['glass-panel px-4 py-3 flex items-center gap-3 transition-all', turn === 'w' ? 'ring-2 ring-white/30' : 'opacity-70']">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold bg-gradient-to-br from-white to-gray-200 text-gray-900">♔</div>
            <div><div class="text-sm font-semibold text-white/90">Player 1</div><div class="text-xs text-white/50">White</div></div>
            <div v-if="turn === 'w'" class="ml-auto w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        <!-- Center: Status -->
        <div class="flex-1 flex items-center justify-center">
          <div v-if="gameStatus.isCheckmate" class="glass-panel bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-400/30 px-5 py-3 text-center animate-pulse">
            <span class="text-sm font-bold text-white/95">Checkmate! {{ gameStatus.winner === 'w' ? 'White' : 'Black' }} wins!</span>
          </div>
          <div v-else-if="gameStatus.isCheck" class="glass-panel bg-gradient-to-r from-red-500/20 to-orange-500/20 px-5 py-3 text-center">
            <span class="text-sm font-bold text-white/95">{{ turn === 'w' ? 'White' : 'Black' }} is in Check!</span>
          </div>
          <div v-else-if="gameStatus.isDraw" class="glass-panel bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-5 py-3 text-center">
            <span class="text-sm font-bold text-white/95">Draw!</span>
          </div>
        </div>

        <!-- Right: Move History -->
        <div class="w-56">
          <div class="glass-panel px-4 py-3 flex flex-col max-h-80">
            <div class="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Move History</div>
            <div class="flex-1 overflow-y-auto space-y-0.5" style="scrollbar-width: thin;">
              <div v-if="!movePairs.length" class="text-xs text-white/30 text-center py-4">No moves yet</div>
              <div v-for="pair in movePairs" :key="pair.num" class="flex items-center text-sm">
                <span class="text-white/30 w-7 text-right mr-2 text-xs font-mono">{{ pair.num }}.</span>
                <span class="text-white/90 font-mono w-16">{{ pair.white.san }}</span>
                <span class="text-white/70 font-mono w-16">{{ pair.black?.san || '' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom -->
      <div class="flex gap-2">
        <button class="glass-button text-xs" @click="undo">↩ Undo</button>
        <button class="glass-button text-xs" @click="reset">⟳ New Game</button>
      </div>
    </div>
  </div>
</template>
