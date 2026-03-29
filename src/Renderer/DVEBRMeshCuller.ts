import { BoundingBox } from "@babylonjs/core/Culling/boundingBox";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshRegister } from "@divinevoxel/vlox/Renderer/MeshRegister";
import { WorldSpaces } from "@divinevoxel/vlox/World/WorldSpaces";
const min = new Vector3();
const max = new Vector3(16, 16, 16);
const boundingBox = new BoundingBox(min, max);


function CullSectors(scene: Scene) {
  const camera = scene.activeCamera;
  if (!camera) return;

  for (const [, dimension] of MeshRegister._dimensions) {
    for (const [, sector] of dimension) {
      min.set(sector.position[0], sector.position[1], sector.position[2]);
      max.set(
        sector.position[0] + WorldSpaces.sector.bounds.x,
        sector.position[1] + WorldSpaces.sector.bounds.y,
        sector.position[2] + WorldSpaces.sector.bounds.z
      );
      boundingBox.reConstruct(min, max);
      const sectorVisible = camera.isInFrustum(boundingBox);
      for (const section of sector.sections) {
        if (!section) continue;
        for (const [key, mesh] of section.meshes as Map<string, Mesh>) {
          if (!sectorVisible) {
            if (mesh.isEnabled()) {
              mesh.setEnabled(false);
            }
            continue;
          }
          if (camera.isInFrustum(mesh)) {
            if (!mesh.isEnabled()) {
              mesh.setEnabled(true);
            }
          } else {
            if (mesh.isEnabled()) {
              mesh.setEnabled(false);
            }
          }
        }
      }
    }
  }


}

export class DVEBRMeshCuller {
  init(scene: Scene, bufferMode: "single" | "multi") {
    scene.freezeActiveMeshes();
    scene.registerBeforeRender(() => {
      CullSectors(scene);
    });
  }
}
