import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { PieceInfo } from '@chess/core';
import type { Square } from 'chess.js';
import type { ChessTheme } from '../themes';

/* ─── Unicode chess symbols ─────────────────────────────────── */
const PIECE_SYMBOLS: Record<string, Record<string, string>> = {
    w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};

const PIECE_HEIGHTS: Record<string, number> = {
    k: 1.6,
    q: 1.4,
    r: 1.0,
    b: 1.2,
    n: 1.2,
    p: 0.85,
};

/* ─── Types ─────────────────────────────────────────────────── */
interface ChessSceneProps {
    board: (PieceInfo | null)[][];
    theme: ChessTheme;
    selectedSquare: Square | null;
    legalMoveSquares: Square[];
    onSquareClick: (square: Square) => void;
}

/* ─── Single Board Square ───────────────────────────────────── */
function BoardSquare({
    row,
    col,
    isLight,
    isSelected,
    isLegalMove,
    theme,
    onClick,
}: {
    row: number;
    col: number;
    isLight: boolean;
    isSelected: boolean;
    isLegalMove: boolean;
    theme: ChessTheme;
    onClick: () => void;
}) {
    const x = col - 3.5;
    const z = row - 3.5;

    let color = isLight ? theme.lightSquare : theme.darkSquare;
    if (isSelected) color = theme.selectedSquare;

    return (
        <group>
            <mesh
                position={[x, 0, z]}
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                receiveShadow
            >
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial
                    color={color}
                    roughness={theme.squareRoughness}
                    metalness={theme.squareMetalness}
                />
            </mesh>

            {/* Legal move indicator */}
            {isLegalMove && (
                <mesh position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.15, 24]} />
                    <meshStandardMaterial
                        color={theme.legalMoveColor}
                        transparent
                        opacity={0.7}
                        emissive={theme.legalMoveColor}
                        emissiveIntensity={theme.emissiveIntensity > 0 ? 1 : 0.3}
                    />
                </mesh>
            )}
        </group>
    );
}

/* ─── 3D Piece geometry composed from primitives ────────────── */
function PieceGeometry({ type }: { type: string }) {
    switch (type) {
        case 'p': // Pawn
            return (
                <group>
                    <mesh position={[0, 0.08, 0]} castShadow>
                        <cylinderGeometry args={[0.28, 0.32, 0.16, 20]} />
                    </mesh>
                    <mesh position={[0, 0.32, 0]} castShadow>
                        <cylinderGeometry args={[0.14, 0.22, 0.35, 20]} />
                    </mesh>
                    <mesh position={[0, 0.6, 0]} castShadow>
                        <sphereGeometry args={[0.16, 16, 16]} />
                    </mesh>
                </group>
            );
        case 'r': // Rook
            return (
                <group>
                    <mesh position={[0, 0.08, 0]} castShadow>
                        <cylinderGeometry args={[0.3, 0.34, 0.16, 20]} />
                    </mesh>
                    <mesh position={[0, 0.38, 0]} castShadow>
                        <cylinderGeometry args={[0.18, 0.24, 0.45, 20]} />
                    </mesh>
                    <mesh position={[0, 0.68, 0]} castShadow>
                        <cylinderGeometry args={[0.24, 0.2, 0.15, 20]} />
                    </mesh>
                    {/* Crenellations */}
                    <mesh position={[-0.14, 0.82, 0]} castShadow>
                        <boxGeometry args={[0.1, 0.12, 0.1]} />
                    </mesh>
                    <mesh position={[0.14, 0.82, 0]} castShadow>
                        <boxGeometry args={[0.1, 0.12, 0.1]} />
                    </mesh>
                    <mesh position={[0, 0.82, 0.14]} castShadow>
                        <boxGeometry args={[0.1, 0.12, 0.1]} />
                    </mesh>
                    <mesh position={[0, 0.82, -0.14]} castShadow>
                        <boxGeometry args={[0.1, 0.12, 0.1]} />
                    </mesh>
                </group>
            );
        case 'n': // Knight
            return (
                <group>
                    <mesh position={[0, 0.08, 0]} castShadow>
                        <cylinderGeometry args={[0.28, 0.32, 0.16, 20]} />
                    </mesh>
                    <mesh position={[0, 0.38, 0]} castShadow>
                        <cylinderGeometry args={[0.13, 0.22, 0.45, 20]} />
                    </mesh>
                    {/* Horse head - stylized */}
                    <mesh position={[0, 0.72, 0.08]} rotation={[0.4, 0, 0]} castShadow>
                        <boxGeometry args={[0.18, 0.35, 0.22]} />
                    </mesh>
                    <mesh position={[0, 0.9, 0.18]} rotation={[0.6, 0, 0]} castShadow>
                        <boxGeometry args={[0.12, 0.15, 0.16]} />
                    </mesh>
                </group>
            );
        case 'b': // Bishop
            return (
                <group>
                    <mesh position={[0, 0.08, 0]} castShadow>
                        <cylinderGeometry args={[0.28, 0.32, 0.16, 20]} />
                    </mesh>
                    <mesh position={[0, 0.4, 0]} castShadow>
                        <cylinderGeometry args={[0.1, 0.22, 0.5, 20]} />
                    </mesh>
                    <mesh position={[0, 0.76, 0]} castShadow>
                        <coneGeometry args={[0.14, 0.3, 16]} />
                    </mesh>
                    <mesh position={[0, 0.95, 0]} castShadow>
                        <sphereGeometry args={[0.06, 12, 12]} />
                    </mesh>
                </group>
            );
        case 'q': // Queen
            return (
                <group>
                    <mesh position={[0, 0.08, 0]} castShadow>
                        <cylinderGeometry args={[0.3, 0.34, 0.16, 20]} />
                    </mesh>
                    <mesh position={[0, 0.42, 0]} castShadow>
                        <cylinderGeometry args={[0.12, 0.24, 0.52, 20]} />
                    </mesh>
                    {/* Crown points */}
                    {[0, 1, 2, 3, 4].map((i) => {
                        const angle = (i / 5) * Math.PI * 2;
                        return (
                            <mesh
                                key={i}
                                position={[Math.cos(angle) * 0.12, 0.78, Math.sin(angle) * 0.12]}
                                castShadow
                            >
                                <coneGeometry args={[0.04, 0.14, 8]} />
                            </mesh>
                        );
                    })}
                    <mesh position={[0, 0.88, 0]} castShadow>
                        <sphereGeometry args={[0.08, 14, 14]} />
                    </mesh>
                </group>
            );
        case 'k': // King
            return (
                <group>
                    <mesh position={[0, 0.08, 0]} castShadow>
                        <cylinderGeometry args={[0.3, 0.34, 0.16, 20]} />
                    </mesh>
                    <mesh position={[0, 0.45, 0]} castShadow>
                        <cylinderGeometry args={[0.13, 0.24, 0.58, 20]} />
                    </mesh>
                    <mesh position={[0, 0.82, 0]} castShadow>
                        <cylinderGeometry args={[0.16, 0.14, 0.12, 20]} />
                    </mesh>
                    {/* Cross */}
                    <mesh position={[0, 1.0, 0]} castShadow>
                        <boxGeometry args={[0.06, 0.28, 0.06]} />
                    </mesh>
                    <mesh position={[0, 1.06, 0]} castShadow>
                        <boxGeometry args={[0.2, 0.06, 0.06]} />
                    </mesh>
                </group>
            );
        default:
            return null;
    }
}

/* ─── Single chess piece ────────────────────────────────────── */
function ChessPiece3D({
    piece,
    row,
    col,
    theme,
    onClick,
}: {
    piece: PieceInfo;
    row: number;
    col: number;
    theme: ChessTheme;
    onClick: () => void;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const x = col - 3.5;
    const z = row - 3.5;
    const color = piece.color === 'w' ? theme.whitePiece : theme.blackPiece;
    const emissiveColor = theme.emissiveIntensity > 0 ? color : '#000000';

    // Subtle floating animation
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5 + col + row) * 0.015;
        }
    });

    return (
        <group
            ref={groupRef}
            position={[x, 0.01, z]}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            <PieceGeometry type={piece.type} />
            {/* Apply material to all child meshes */}
            {/* We re-render with a wrapper that sets the material */}
            <MeshMaterial
                color={color}
                roughness={theme.pieceRoughness}
                metalness={theme.pieceMetalness}
                emissive={emissiveColor}
                emissiveIntensity={theme.emissiveIntensity}
            />
        </group>
    );
}

/* ─── Material applicator — applies material to all child meshes */
function MeshMaterial({
    color,
    roughness,
    metalness,
    emissive,
    emissiveIntensity,
}: {
    color: string;
    roughness: number;
    metalness: number;
    emissive: string;
    emissiveIntensity: number;
}) {
    // This is rendered as a sibling — we actually need to apply material
    // directly in PieceGeometry. Let's use a different approach.
    return null;
}

/* ─── Piece with integrated material ────────────────────────── */
function PieceWithMaterial({
    piece,
    row,
    col,
    theme,
    onClick,
}: {
    piece: PieceInfo;
    row: number;
    col: number;
    theme: ChessTheme;
    onClick: () => void;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const x = col - 3.5;
    const z = row - 3.5;
    const color = piece.color === 'w' ? theme.whitePiece : theme.blackPiece;
    const emColor = theme.emissiveIntensity > 0 ? color : '#000000';

    const material = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: new THREE.Color(color),
                roughness: theme.pieceRoughness,
                metalness: theme.pieceMetalness,
                emissive: new THREE.Color(emColor),
                emissiveIntensity: theme.emissiveIntensity,
            }),
        [color, theme.pieceRoughness, theme.pieceMetalness, emColor, theme.emissiveIntensity],
    );

    // Apply material to all child meshes
    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    (child as THREE.Mesh).material = material;
                }
            });
        }
    });

    return (
        <group
            ref={groupRef}
            position={[x, 0.01, z]}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            <PieceGeometry type={piece.type} />
        </group>
    );
}

/* ─── Board edge frame ─────────────────────────────────────── */
function BoardFrame({ theme }: { theme: ChessTheme }) {
    return (
        <group>
            {/* Board base */}
            <mesh position={[0, -0.06, 0]} receiveShadow>
                <boxGeometry args={[8.6, 0.12, 8.6]} />
                <meshStandardMaterial color={theme.boardEdge} roughness={0.4} metalness={0.1} />
            </mesh>

            {/* Rank/file labels */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <group key={`labels-${i}`}>
                    <Text
                        position={[-4.15, 0.01, i - 3.5]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        fontSize={0.25}
                        color="rgba(255,255,255,0.5)"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {String(8 - i)}
                    </Text>
                    <Text
                        position={[i - 3.5, 0.01, 4.15]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        fontSize={0.25}
                        color="rgba(255,255,255,0.5)"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {String.fromCharCode(97 + i)}
                    </Text>
                </group>
            ))}
        </group>
    );
}

/* ─── Main Scene ────────────────────────────────────────────── */
function Scene({ board, theme, selectedSquare, legalMoveSquares, onSquareClick }: ChessSceneProps) {
    const squareToRowCol = (sq: Square): [number, number] => {
        return [8 - parseInt(sq[1]), sq.charCodeAt(0) - 97];
    };

    const rowColToSquare = (row: number, col: number): Square => {
        return `${String.fromCharCode(97 + col)}${8 - row}` as Square;
    };

    const selectedRC = selectedSquare ? squareToRowCol(selectedSquare) : null;
    const legalMoveSet = new Set(legalMoveSquares);

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
                position={[8, 15, 8]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-left={-6}
                shadow-camera-right={6}
                shadow-camera-top={6}
                shadow-camera-bottom={-6}
            />
            <pointLight position={[-5, 8, -5]} intensity={0.3} color="#ffeedd" />

            {theme.id === 'cyberpunk' && (
                <>
                    <pointLight position={[5, 3, 5]} intensity={0.5} color="#00fff5" />
                    <pointLight position={[-5, 3, -5]} intensity={0.5} color="#ff00e5" />
                </>
            )}

            {/* Board Frame */}
            <BoardFrame theme={theme} />

            {/* Board Squares */}
            {board.map((row, rowIdx) =>
                row.map((_, colIdx) => {
                    const square = rowColToSquare(rowIdx, colIdx);
                    const isLight = (rowIdx + colIdx) % 2 === 0;
                    const isSelected = selectedRC?.[0] === rowIdx && selectedRC?.[1] === colIdx;
                    const isLegalMove = legalMoveSet.has(square);

                    return (
                        <BoardSquare
                            key={`${rowIdx}-${colIdx}`}
                            row={rowIdx}
                            col={colIdx}
                            isLight={isLight}
                            isSelected={isSelected}
                            isLegalMove={isLegalMove}
                            theme={theme}
                            onClick={() => onSquareClick(square)}
                        />
                    );
                }),
            )}

            {/* Chess Pieces */}
            {board.map((row, rowIdx) =>
                row.map((piece, colIdx) => {
                    if (!piece) return null;
                    const square = rowColToSquare(rowIdx, colIdx);
                    return (
                        <PieceWithMaterial
                            key={`piece-${rowIdx}-${colIdx}-${piece.type}-${piece.color}`}
                            piece={piece}
                            row={rowIdx}
                            col={colIdx}
                            theme={theme}
                            onClick={() => onSquareClick(square)}
                        />
                    );
                }),
            )}

            {/* Contact shadows for grounding */}
            <ContactShadows
                position={[0, -0.12, 0]}
                opacity={0.4}
                scale={12}
                blur={2}
                far={4}
            />

            {/* Camera controls */}
            <OrbitControls
                makeDefault
                minPolarAngle={0.3}
                maxPolarAngle={Math.PI / 2.2}
                minDistance={6}
                maxDistance={18}
                enablePan={false}
                target={[0, 0, 0]}
            />
        </>
    );
}

/* ─── Exported Canvas Wrapper ───────────────────────────────── */
export default function ChessScene(props: ChessSceneProps) {
    return (
        <Canvas
            shadows
            camera={{ position: [0, 10, 8], fov: 45 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
            style={{ background: `linear-gradient(135deg, ${props.theme.bgGradient[0]}, ${props.theme.bgGradient[1]})` }}
        >
            <Scene {...props} />
        </Canvas>
    );
}
