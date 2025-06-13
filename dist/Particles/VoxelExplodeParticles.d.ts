import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { TextureId } from "@divinevoxel/vlox/Textures/Texture.types";
import { DataCursorInterface } from "@divinevoxel/vlox/Voxels/Cursor/DataCursor.interface";
export declare class VoxelExplodeParticles {
    scene: Scene;
    dataCursor: DataCursorInterface;
    private _count;
    disposeOnDead: boolean;
    static Quads: Map<Scene, Mesh>;
    private _textureId;
    private _sps;
    private _mesh;
    private _dead;
    private _disposed;
    private _beforeRender;
    constructor(scene: Scene, dataCursor: DataCursorInterface, _count?: number, disposeOnDead?: boolean);
    explodeAt(x: number, y: number, z: number, textureID: TextureId): void;
    dispose(): void;
}
