import { Scene } from "@babylonjs/core/scene";
import { IVoxelSelection } from "@divinevoxel/vlox/Templates/Selection/VoxelSelecton";
import { VoxelLineMesh } from "./VoxelLineMesh";
export declare class VoxelSelectionHighlight {
    scene: Scene;
    mesh: VoxelLineMesh;
    selection: IVoxelSelection;
    constructor(scene: Scene);
    outlineAll: boolean;
    dispose(): void;
    update(selection: IVoxelSelection): void;
}
