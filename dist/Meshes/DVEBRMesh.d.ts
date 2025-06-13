import { Mesh } from "@babylonjs/core/Meshes/mesh.js";
import { Observable } from "@amodx/core/Observers/Observable";
declare class DVEBRMeshObservers {
    updated: Observable<void>;
}
import { Buffer } from "@babylonjs/core/Meshes/buffer.js";
import { Engine } from "@babylonjs/core/Engines/engine";
import { CompactSubMesh } from "@divinevoxel/vlox/Mesher/Types/Mesher.types";
export declare class DVEBRMesh {
    _mesh: Mesh;
    observers: DVEBRMeshObservers;
    static UpdateVertexData(mesh: Mesh, engine: Engine, data: CompactSubMesh): void;
    static UpdateVertexDataBuffers(mesh: Mesh, engine: Engine, vertices: Float32Array, indices: Uint16Array | Uint32Array): Buffer;
    constructor(_mesh: Mesh);
    dispose(): void;
}
export {};
