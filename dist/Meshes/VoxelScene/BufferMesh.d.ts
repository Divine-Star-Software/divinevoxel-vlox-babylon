import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Buffer } from "@babylonjs/core/Meshes/buffer";
import { DataBuffer } from "@babylonjs/core/Buffers/dataBuffer";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { SubMesh } from "@babylonjs/core/Meshes/subMesh";
import { VoxelScene } from "../../Scene/VoxelScene";
import { BufferAllocator } from "./BufferAllocator";
export declare class BufferAllocation {
    _bufferMesh: BufferMesh;
    verticesStart: number;
    verticesCount: number;
    indicesStart: number;
    indicesCount: number;
    verticeAllocationId: number;
    verticeByteStart: number;
    indiceAllocationId: number;
    indiceByteCount: number;
    constructor(_bufferMesh: BufferMesh);
}
export declare class BufferMesh extends Mesh {
    voxelScene: VoxelScene;
    totalVertices: number;
    engine: Engine;
    _vertices: Buffer;
    _verticesAllocator: BufferAllocator;
    _indices: DataBuffer;
    _indicesAllocator: BufferAllocator;
    constructor(voxelScene: VoxelScene, totalVertices: number);
    _allocations: number;
    allocate(verticesCount: number, indicesCount: number): BufferAllocation | null;
    deallocate(allocation: BufferAllocation): void;
    writeBuffers(allocation: BufferAllocation, verticies: Float32Array, indices: Uint32Array): void;
    render(mesh: SubMesh, alpha: boolean, effectiveMesh: AbstractMesh): Mesh;
}
