import { Mesh } from "@babylonjs/core/Meshes/mesh.js";
import { EntityInstance } from "./EntityInstance.js";
import "@babylonjs/core/Meshes/thinInstanceMesh";
export declare class EntityTool {
    mesh: Mesh;
    _instanceAmount: number;
    _positionArray: Float32Array;
    _rotationArray: Float32Array;
    _scaleArray: Float32Array;
    _matrixArray: Float32Array;
    _instances: EntityInstance[];
    _usedInstances: Set<EntityInstance>;
    _bufferIds: string[];
    constructor(mesh: Mesh);
    addBuffer(id: string, buffer: Float32Array, stride?: number): void;
    setInstanceAmount(amount: number): void;
    getInstance(): false | EntityInstance;
    returnAll(): void;
    update(): void;
}
