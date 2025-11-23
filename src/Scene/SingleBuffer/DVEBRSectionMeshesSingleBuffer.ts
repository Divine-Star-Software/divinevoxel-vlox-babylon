import type { Scene } from "@babylonjs/core/scene";
import type { Engine } from "@babylonjs/core/Engines/engine";
import { Vector3 } from "@babylonjs/core/Maths/";
import { Mesh } from "@babylonjs/core/Meshes/mesh.js";
import { BoundingInfo } from "@babylonjs/core/Culling/boundingInfo.js";
import { DVESectionMeshes } from "@divinevoxel/vlox/Renderer";
import { DVEBabylonRenderer } from "../../Renderer/DVEBabylonRenderer";
import { SectionMesh } from "@divinevoxel/vlox/Renderer";
import {
  CompactedSectionVoxelMesh,
  CompactedMeshData,
} from "@divinevoxel/vlox/Mesher/Voxels/Geomtry/CompactedSectionVoxelMesh";
import { LocationData } from "@divinevoxel/vlox/Math";
import { SubBufferMesh } from "./Meshes/SubBufferMesh";
import { SingleBufferVoxelScene } from "./SingleBufferVoxelScene";
const meshData = new CompactedMeshData();
const location: LocationData = [0, 0, 0, 0];
const found = new Set<string>();
export class DVEBRSectionMeshesSingleBuffer extends DVESectionMeshes {
  static meshCache: Mesh[] = [];
  pickable = false;
  checkCollisions = false;
  serialize = false;
  defaultBb: BoundingInfo;

  constructor(
    public scene: Scene,
    public engine: Engine,
    public renderer: DVEBabylonRenderer,
    public voxelScene: SingleBufferVoxelScene
  ) {
    super();
    this.defaultBb = new BoundingInfo(Vector3.Zero(), new Vector3(16, 16, 16));
  }

  returnMesh(mesh: SubBufferMesh) {
    this.voxelScene.removeMesh(mesh);
  }

  updateVertexData(section: SectionMesh, data: CompactedSectionVoxelMesh) {
    data.getLocation(location);

    const totalMeshes = data.getTotalMeshes();
    for (let i = 0; i < totalMeshes; i++) {
      data.getMeshData(i, meshData);
      const subMeshMaterial = meshData.materialId;
      found.add(subMeshMaterial);
      let mesh: SubBufferMesh;

      let needNew = true;
      if (section.meshes.has(subMeshMaterial)) {
        needNew = false;
        mesh = this.voxelScene.updateMesh(
          section.meshes.get(subMeshMaterial)!,
          meshData
        )!;
        if (!mesh) {
          needNew = true;
        }
      }

      if (needNew) {
        mesh = this.voxelScene.addMesh(
          meshData,
          location[1],
          location[2],
          location[3]
        )!;
      }
      section.meshes.set(subMeshMaterial, mesh!);
    }

    for (const [key, mesh] of section.meshes as Map<string, SubBufferMesh>) {
      if (!found.has(key)) {
        this.returnMesh(mesh);
        section.meshes.delete(key);
      }
    }
    found.clear();

    return section;
  }
}
