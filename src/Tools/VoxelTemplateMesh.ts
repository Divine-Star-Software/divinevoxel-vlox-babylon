import { Scene } from "@babylonjs/core/scene";
import { FullVoxelTemplate } from "@divinevoxel/vlox/Templates/Full/FullVoxelTemplate";
import { MeshTemplate } from "@divinevoxel/vlox/Mesher/Voxels/MeshTemplate";
import { DVEBRVoxelMesh } from "../Meshes/DVEBRVoxelMesh";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { CompactSubMesh } from "@divinevoxel/vlox/Mesher/Types/Mesher.types";

export class VoxelTemplateMesh {
  parent: TransformNode;
  meshes: Mesh[] = [];
  constructor(public scene: Scene) {
    this.parent = new TransformNode("", scene);
  }

  private disposeMeshes() {
    for (const mesh of this.meshes) {
      mesh.dispose();
    }
    this.meshes = [];
  }
  dispose() {
    this.parent.dispose();
    this.disposeMeshes();
  }
  update(template: FullVoxelTemplate) {
    this.disposeMeshes();
    const data = MeshTemplate(template.toJSON());
    if (!data) {
      console.error(`Could not mesh voxel template`, {
        template,
        returned: data,
      });
      return;
    }
    const meshes: CompactSubMesh[] = data[0];

    for (const subMesh of meshes) {
      const mesh = DVEBRVoxelMesh.CreateSubMesh(
        subMesh,
        this.scene,
        this.scene.getEngine() as any
      );
      mesh.renderingGroupId = 1;
      mesh.parent = this.parent;
      this.meshes.push(mesh);
    }
  }
}
