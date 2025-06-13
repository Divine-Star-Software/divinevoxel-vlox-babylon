import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { VoxelEffect } from "@divinevoxel/vlox/Voxels/Effects/VoxelEffect";
export declare class CandleParticles extends VoxelEffect {
    static id: string;
    points: Float32Array;
    flameParticles: ParticleSystem;
    smokeParticles: ParticleSystem;
    init(): void;
    setPoints(pointss: Float32Array): void;
    dispose(): void;
}
