<script lang="ts">
    import { T } from "@threlte/core";
    import { OrbitControls, ContactShadows } from "@threlte/extras";
    import { createEventDispatcher } from "svelte";
    import type { PieceInfo } from "@chess/core";
    import type { Square } from "chess.js";
    import * as THREE from "three";

    export let board: (PieceInfo | null)[][];
    export let theme: any;
    export let selectedSquare: Square | null;
    export let legalMoves: Square[];

    const dispatch = createEventDispatcher<{ squareClick: Square }>();

    function rowColToSquare(row: number, col: number): Square {
        return `${String.fromCharCode(97 + col)}${8 - row}` as Square;
    }

    function squareToRC(sq: Square): [number, number] {
        return [8 - parseInt(sq[1]), sq.charCodeAt(0) - 97];
    }

    $: selectedRC = selectedSquare ? squareToRC(selectedSquare) : null;
    $: legalSet = new Set(legalMoves);

    // Piece heights
    const HEIGHTS: Record<string, number> = {
        k: 1.6,
        q: 1.4,
        r: 1.0,
        b: 1.2,
        n: 1.2,
        p: 0.85,
    };

    function handleClick(row: number, col: number) {
        dispatch("squareClick", rowColToSquare(row, col));
    }
</script>

<!-- Lighting -->
<T.AmbientLight intensity={0.4} />
<T.DirectionalLight position={[8, 15, 8]} intensity={1.2} castShadow />
<T.PointLight position={[-5, 8, -5]} intensity={0.3} color="#ffeedd" />

{#if theme.id === "cyberpunk"}
    <T.PointLight position={[5, 3, 5]} intensity={0.5} color="#00fff5" />
    <T.PointLight position={[-5, 3, -5]} intensity={0.5} color="#ff00e5" />
{/if}

<!-- Board frame -->
<T.Mesh position={[0, -0.06, 0]} receiveShadow>
    <T.BoxGeometry args={[8.6, 0.12, 8.6]} />
    <T.MeshStandardMaterial
        color={theme.edge}
        roughness={0.4}
        metalness={0.1}
    />
</T.Mesh>

<!-- Board squares -->
{#each board as row, rowIdx}
    {#each row as _, colIdx}
        {@const isLight = (rowIdx + colIdx) % 2 === 0}
        {@const isSelected =
            selectedRC?.[0] === rowIdx && selectedRC?.[1] === colIdx}
        {@const sq = rowColToSquare(rowIdx, colIdx)}
        {@const isLegal = legalSet.has(sq)}
        {@const color = isSelected
            ? theme.selected
            : isLight
              ? theme.light
              : theme.dark}
        <T.Mesh
            position={[colIdx - 3.5, 0, rowIdx - 3.5]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            on:click={() => handleClick(rowIdx, colIdx)}
        >
            <T.PlaneGeometry args={[1, 1]} />
            <T.MeshStandardMaterial {color} roughness={0.3} metalness={0.05} />
        </T.Mesh>

        {#if isLegal}
            <T.Mesh
                position={[colIdx - 3.5, 0.02, rowIdx - 3.5]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <T.CircleGeometry args={[0.15, 24]} />
                <T.MeshStandardMaterial
                    color={theme.legal}
                    transparent
                    opacity={0.7}
                />
            </T.Mesh>
        {/if}
    {/each}
{/each}

<!-- Chess pieces -->
{#each board as row, rowIdx}
    {#each row as piece, colIdx}
        {#if piece}
            {@const pColor = piece.color === "w" ? theme.wPiece : theme.bPiece}
            <T.Group
                position={[colIdx - 3.5, 0.01, rowIdx - 3.5]}
                on:click={() => handleClick(rowIdx, colIdx)}
            >
                <!-- Base (all pieces) -->
                <T.Mesh position={[0, 0.08, 0]} castShadow>
                    <T.CylinderGeometry args={[0.28, 0.32, 0.16, 20]} />
                    <T.MeshStandardMaterial
                        color={pColor}
                        roughness={0.25}
                        metalness={0.15}
                    />
                </T.Mesh>
                <!-- Body -->
                <T.Mesh position={[0, 0.35, 0]} castShadow>
                    <T.CylinderGeometry args={[0.12, 0.22, 0.38, 20]} />
                    <T.MeshStandardMaterial
                        color={pColor}
                        roughness={0.25}
                        metalness={0.15}
                    />
                </T.Mesh>
                <!-- Top varies by piece type -->
                {#if piece.type === "p"}
                    <T.Mesh position={[0, 0.6, 0]} castShadow>
                        <T.SphereGeometry args={[0.14, 16, 16]} />
                        <T.MeshStandardMaterial
                            color={pColor}
                            roughness={0.25}
                            metalness={0.15}
                        />
                    </T.Mesh>
                {:else if piece.type === "r"}
                    <T.Mesh position={[0, 0.6, 0]} castShadow>
                        <T.CylinderGeometry args={[0.22, 0.18, 0.12, 20]} />
                        <T.MeshStandardMaterial
                            color={pColor}
                            roughness={0.25}
                            metalness={0.15}
                        />
                    </T.Mesh>
                {:else if piece.type === "b"}
                    <T.Mesh position={[0, 0.65, 0]} castShadow>
                        <T.ConeGeometry args={[0.14, 0.3, 16]} />
                        <T.MeshStandardMaterial
                            color={pColor}
                            roughness={0.25}
                            metalness={0.15}
                        />
                    </T.Mesh>
                {:else if piece.type === "n"}
                    <T.Mesh
                        position={[0, 0.65, 0.06]}
                        rotation.x={0.4}
                        castShadow
                    >
                        <T.BoxGeometry args={[0.16, 0.28, 0.18]} />
                        <T.MeshStandardMaterial
                            color={pColor}
                            roughness={0.25}
                            metalness={0.15}
                        />
                    </T.Mesh>
                {:else if piece.type === "q"}
                    <T.Mesh position={[0, 0.62, 0]} castShadow>
                        <T.SphereGeometry args={[0.1, 14, 14]} />
                        <T.MeshStandardMaterial
                            color={pColor}
                            roughness={0.25}
                            metalness={0.15}
                        />
                    </T.Mesh>
                    <T.Mesh position={[0, 0.72, 0]} castShadow>
                        <T.ConeGeometry args={[0.06, 0.12, 8]} />
                        <T.MeshStandardMaterial
                            color={pColor}
                            roughness={0.25}
                            metalness={0.15}
                        />
                    </T.Mesh>
                {:else if piece.type === "k"}
                    <T.Mesh position={[0, 0.68, 0]} castShadow>
                        <T.BoxGeometry args={[0.06, 0.24, 0.06]} />
                        <T.MeshStandardMaterial
                            color={pColor}
                            roughness={0.25}
                            metalness={0.15}
                        />
                    </T.Mesh>
                    <T.Mesh position={[0, 0.74, 0]} castShadow>
                        <T.BoxGeometry args={[0.18, 0.06, 0.06]} />
                        <T.MeshStandardMaterial
                            color={pColor}
                            roughness={0.25}
                            metalness={0.15}
                        />
                    </T.Mesh>
                {/if}
            </T.Group>
        {/if}
    {/each}
{/each}

<!-- Camera controls -->
<T.PerspectiveCamera makeDefault position={[0, 10, 8]} fov={45}>
    <OrbitControls
        enablePan={false}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={6}
        maxDistance={18}
    />
</T.PerspectiveCamera>
