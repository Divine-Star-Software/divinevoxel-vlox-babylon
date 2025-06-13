import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { TextureId } from "@divinevoxel/vlox/Textures/Texture.types";
import { DataCursorInterface } from "@divinevoxel/vlox/Voxels/Cursor/DataCursor.interface";
import { IVoxelSelection } from "@divinevoxel/vlox/Templates/Selection/VoxelSelecton";
export declare class VoxelExplodeSelectionParticles {
    scene: Scene;
    dataCursor: DataCursorInterface;
    private _count;
    disposeOnDead: boolean;
    static CreateParticleData(iSelection: IVoxelSelection, cursor: DataCursorInterface): (0 | TextureId)[];
    static Quads: Map<Scene, Mesh>;
    private _sps;
    private _mesh;
    private _dead;
    private _disposed;
    private _active;
    private _beforeRender;
    private _material;
    constructor(scene: Scene, dataCursor: DataCursorInterface, _count?: number, disposeOnDead?: boolean);
    expand(count: number): void;
    explode(iSelection: IVoxelSelection, textures: (TextureId | 0)[]): false | undefined;
    dispose(): void;
}
