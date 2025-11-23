import { BoundingBox } from "@babylonjs/core/Culling/boundingBox";
import { MultiMaterial } from "@babylonjs/core/Materials/multiMaterial";
import { Scene } from "@babylonjs/core/scene";
import { SubMesh } from "@babylonjs/core/Meshes/subMesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CompactedMeshData } from "@divinevoxel/vlox/Mesher/Voxels/Geomtry/CompactedSectionVoxelMesh";
import { DVEBabylonRenderer } from "../Renderer/DVEBabylonRenderer";
import { SceneOptions } from "./SceneOptions";

export abstract class VoxelSceneInterface<MeshType extends any> {
  constructor(
    public renderer: DVEBabylonRenderer,
    public options: SceneOptions
  ) {}
  abstract init(scene: Scene): void;

  abstract removeMesh(mesh: MeshType): void;

  abstract updateMesh(subBufferMesh: MeshType, data: CompactedMeshData): void;

  abstract addMesh(
    data: CompactedMeshData,
    x: number,
    y: number,
    z: number
  ): void;

  abstract beforRender(): void;

  abstract render(): void;
}
