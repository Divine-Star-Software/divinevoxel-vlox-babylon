import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { RenderTargetTexture } from "@babylonjs/core/Materials/Textures/renderTargetTexture";
import { PaintVoxelData } from "@divinevoxel/vlox/Voxels/";
import { VoxelMesher } from "./VoxelMesher";
export declare class VoxelImager {
    scene: Scene;
    _2dCanvas: HTMLCanvasElement;
    _2dContext: CanvasRenderingContext2D;
    _rtt: RenderTargetTexture;
    _mesher: VoxelMesher;
    _camera: ArcRotateCamera;
    _imageSize: number;
    constructor(scene: Scene);
    private _waitTillReady;
    createImage(voxel: PaintVoxelData): Promise<string | null>;
    createImageFromMesh(mesh: Mesh): Promise<string>;
    dispose(): void;
}
