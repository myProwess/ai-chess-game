<script lang="ts">
    import type { MoveInfo, CapturedPieces, GameStatus } from "@chess/core";

    export let side: "left" | "right";
    export let turn: "w" | "b" = "w";
    export let captures: CapturedPieces = { white: [], black: [] };
    export let gameStatus: GameStatus | undefined = undefined;
    export let moveHistory: MoveInfo[] = [];

    const SYMBOLS: Record<string, string> = {
        p: "♟",
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚",
    };

    $: movePairs = (() => {
        const pairs: [MoveInfo, MoveInfo | undefined][] = [];
        for (let i = 0; i < moveHistory.length; i += 2)
            pairs.push([moveHistory[i], moveHistory[i + 1]]);
        return pairs;
    })();
</script>

{#if side === "left"}
    <div class="flex flex-col gap-3 w-52 pointer-events-auto">
        <!-- Player Black -->
        <div
            class="glass-panel px-4 py-3 flex items-center gap-3 {turn === 'b'
                ? 'ring-2 ring-white/30'
                : 'opacity-70'} transition-all"
        >
            <div
                class="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold bg-gradient-to-br from-gray-700 to-gray-900 text-white"
            >
                ♚
            </div>
            <div>
                <div class="text-sm font-semibold text-white/90">Player 2</div>
                <div class="text-xs text-white/50">Black</div>
            </div>
            {#if turn === "b"}
                <div
                    class="ml-auto w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"
                />
            {/if}
        </div>

        <!-- Captured Pieces -->
        <div class="glass-panel px-4 py-3 space-y-2">
            <div
                class="text-xs font-semibold text-white/60 uppercase tracking-wider"
            >
                Captured
            </div>
            <div>
                <div class="text-[10px] uppercase text-white/40 mb-0.5">
                    By White
                </div>
                <div class="flex flex-wrap gap-0.5 min-h-[24px]">
                    {#each captures.white as p}<span
                            class="text-lg text-white/80"
                            >{SYMBOLS[p] || p}</span
                        >{:else}<span class="text-xs text-white/20">—</span
                        >{/each}
                </div>
            </div>
            <div>
                <div class="text-[10px] uppercase text-white/40 mb-0.5">
                    By Black
                </div>
                <div class="flex flex-wrap gap-0.5 min-h-[24px]">
                    {#each captures.black as p}<span
                            class="text-lg text-white/60"
                            >{SYMBOLS[p] || p}</span
                        >{:else}<span class="text-xs text-white/20">—</span
                        >{/each}
                </div>
            </div>
        </div>

        <div class="flex-1" />

        <!-- Player White -->
        <div
            class="glass-panel px-4 py-3 flex items-center gap-3 {turn === 'w'
                ? 'ring-2 ring-white/30'
                : 'opacity-70'} transition-all"
        >
            <div
                class="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold bg-gradient-to-br from-white to-gray-200 text-gray-900"
            >
                ♔
            </div>
            <div>
                <div class="text-sm font-semibold text-white/90">Player 1</div>
                <div class="text-xs text-white/50">White</div>
            </div>
            {#if turn === "w"}
                <div
                    class="ml-auto w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"
                />
            {/if}
        </div>

        <!-- Game Status -->
        {#if gameStatus?.isGameOver}
            <div
                class="glass-panel bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-4 py-3 text-center animate-pulse"
            >
                <span class="text-sm font-bold text-white/95">
                    {#if gameStatus.isCheckmate}Checkmate! {gameStatus.winner ===
                        "w"
                            ? "White"
                            : "Black"} wins!
                    {:else if gameStatus.isStalemate}Stalemate — Draw!
                    {:else}Draw!{/if}
                </span>
            </div>
        {:else if gameStatus?.isCheck}
            <div
                class="glass-panel bg-gradient-to-r from-red-500/20 to-orange-500/20 px-4 py-3 text-center"
            >
                <span class="text-sm font-bold text-white/95"
                    >{turn === "w" ? "White" : "Black"} is in check!</span
                >
            </div>
        {/if}
    </div>
{:else}
    <!-- Right sidebar: Move History -->
    <div class="w-56 pointer-events-auto">
        <div class="glass-panel px-4 py-3 flex flex-col max-h-80">
            <div
                class="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2"
            >
                Move History
            </div>
            <div
                class="flex-1 overflow-y-auto space-y-0.5"
                style="scrollbar-width: thin;"
            >
                {#if movePairs.length === 0}
                    <div class="text-xs text-white/30 text-center py-4">
                        No moves yet
                    </div>
                {:else}
                    {#each movePairs as [w, b], i}
                        <div class="flex items-center text-sm">
                            <span
                                class="text-white/30 w-7 text-right mr-2 text-xs font-mono"
                                >{i + 1}.</span
                            >
                            <span class="text-white/90 font-mono w-16"
                                >{w.san}</span
                            >
                            <span class="text-white/70 font-mono w-16"
                                >{b?.san || ""}</span
                            >
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
{/if}
