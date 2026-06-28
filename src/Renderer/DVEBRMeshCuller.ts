import { BoundingBox } from "@babylonjs/core/Culling/boundingBox";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshRegister } from "@divinevoxel/vlox/Renderer/MeshRegister";
import { WorldSpaces } from "@divinevoxel/vlox/World/WorldSpaces";
import { Constants } from "@babylonjs/core/Engines/constants";
const min = new Vector3();
const max = new Vector3(16, 16, 16);
const boundingBox = new BoundingBox(min, max);
const sceneMeshes: Mesh[] = [];

function CullSectors(scene: Scene) {
  const camera = scene.activeCamera;
  if (!camera) return;

  camera._updateFrustumPlanes();
  for (const [, dimension] of MeshRegister._dimensions) {
    for (const [, sector] of dimension) {
      min.set(sector.position[0], sector.position[1], sector.position[2]);
      max.set(
        sector.position[0] + WorldSpaces.sector.bounds.x,
        sector.position[1] + WorldSpaces.sector.bounds.y,
        sector.position[2] + WorldSpaces.sector.bounds.z,
      );
      boundingBox.reConstruct(min, max);
      const sectorVisible = boundingBox.isInFrustum(camera._frustumPlanes);

      for (const section of sector.sections) {
        if (!section) {
          continue;
        }
        for (const [key, mesh] of section.meshes as Map<string, Mesh>) {
          if (!sectorVisible) {
            mesh.isVisible = false;
            continue;
          }
          if (mesh.getBoundingInfo().isInFrustum(camera._frustumPlanes)) {
            sceneMeshes.push(mesh);
            mesh.isVisible = true;
          } else {
            mesh.isVisible = false;
          }
        }
      }
    }
  }
}

export class DVEBRMeshCuller {
  init(scene: Scene, bufferMode: "single" | "multi") {
    //   scene.freezeActiveMeshes(true);
    scene.registerBeforeRender(() => {});

    //   myManualActiveMeshes.push();

    const orignal = (scene as any)._evaluateActiveMeshes.bind(scene);
    (scene as any)._evaluateActiveMeshes = () => {
      sceneMeshes.length = 0;
      CullSectors(scene);
      /*  const activeMeshes = (scene as any)._activeMeshes;
    
      for (let i = 0; i < sceneMeshes.length; i++) {
        activeMeshes.push(sceneMeshes[i]);
        (scene as any).activeCamera._activeMeshes.push(sceneMeshes[i]);
      }

      activeMeshes.isFrozen = true;
 */
      const activeMeshes = (scene as any)._activeMeshes;
      activeMeshes.reset();

      const self = scene as any;
      const camera = scene.activeCamera!;

      self.activeCamera._activeMeshes.reset();
      self._activeMeshes.reset();
      self._renderingManager.reset();
      self._processedMaterials.reset();
      self._activeParticleSystems.reset();
      self._activeSkeletons.reset();
      self._softwareSkinnedMeshes.reset();
      self._materialsRenderTargets.reset();

      for (const step of self._beforeEvaluateActiveMeshStage) {
        step.action();
      }

      const allMeshes = scene.getActiveMeshCandidates();
      const len = allMeshes.length;
      for (let i = 0; i < len; i++) {
        const mesh = allMeshes.data[i] as any;
        mesh._internalAbstractMeshDataInfo._currentLODIsUpToDate = false;
        if (mesh.isBlocked) {
          continue;
        }

        self._totalVertices.addCount(mesh.getTotalVertices(), false);

        let isSection = mesh.metadata?.section || false;

        if (!isSection && !(mesh as Mesh).isWorldMatrixFrozen) {
          mesh.computeWorldMatrix();
        }
        if (
          !mesh.isReady() ||
          !mesh.isEnabled() ||
          mesh.scaling.hasAZeroComponent
        ) {
          continue;
        }

        // Switch to current LOD
        let meshToRender = self.customLODSelector
          ? self.customLODSelector(mesh, self.activeCamera)
          : mesh.getLOD(self.activeCamera);
        mesh._internalAbstractMeshDataInfo._currentLOD = meshToRender;
        mesh._internalAbstractMeshDataInfo._currentLODIsUpToDate = true;
        if (meshToRender === undefined || meshToRender === null) {
          continue;
        }

        mesh._preActivate();

        if (
          mesh.isVisible &&
          mesh.visibility > 0 &&
          (mesh.layerMask & self.activeCamera.layerMask) !== 0 &&
          (mesh.alwaysSelectAsActiveMesh ||
            (!isSection &&
              mesh.getBoundingInfo().isInFrustum(camera._frustumPlanes)))
        ) {
          self._activeMeshes.push(mesh);
          self.activeCamera._activeMeshes.push(mesh);

          if (meshToRender !== mesh) {
            meshToRender._activate(self._renderId, false);
          }
          for (const step of self._preActiveMeshStage) {
            step.action(mesh);
          }
          if (mesh._activate(self._renderId, false)) {
            if (!mesh.isAnInstance) {
              meshToRender._internalAbstractMeshDataInfo._onlyForInstances = false;
            } else {
              if (mesh._internalAbstractMeshDataInfo._actAsRegularMesh) {
                meshToRender = mesh;
              }
            }
            meshToRender._internalAbstractMeshDataInfo._isActive = true;
            self._activeMesh(mesh, meshToRender);
          }

          mesh._postActivate();
        }
      }

      //  orignal();
    };
  }
}
