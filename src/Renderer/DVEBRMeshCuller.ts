import { BoundingBox } from "@babylonjs/core/Culling/boundingBox";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshRegister } from "@divinevoxel/vlox/Renderer/MeshRegister";
import { WorldSpaces } from "@divinevoxel/vlox/World/WorldSpaces";
import { Constants } from "@babylonjs/core/Engines/constants";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Frustum } from "@babylonjs/core/Maths/math.frustum";
import { Plane } from "@babylonjs/core/Maths/math.plane";
import { SmartArray } from "@babylonjs/core/Misc/smartArray";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

const min = new Vector3();
const max = new Vector3(16, 16, 16);
const boundingBox = new BoundingBox(min, max);

/*
  Babylon's _evaluateActiveMeshes walks every mesh in the scene each frame
  (isReady, LOD, enabled checks...), and section meshes are most of the scene,
  so the cost grew with the size of the loaded world. CullSectors already
  knows which section meshes are visible, so it hands Babylon only those plus
  the scene's non-section meshes via scene.getActiveMeshCandidates.
*/
const candidates = new SmartArray<AbstractMesh>(1024);
/** Scene meshes that are not section meshes (player, particles, sky...). */
const otherMeshes = new Set<AbstractMesh>();
const isSectionMesh = (mesh: AbstractMesh) => !!mesh.metadata?.section;

function CullSectors(scene: Scene, light: DirectionalLight | null) {
  candidates.reset();
  const camera = scene.activeCamera;
  if (!camera) return;

  camera._updateFrustumPlanes();

  let lightFrustumPlanes: Plane[] | null = null;
  const shadowGenerator = light?.getShadowGenerator();
  if (shadowGenerator) {
    lightFrustumPlanes = Frustum.GetPlanes(
      shadowGenerator.getTransformMatrix(),
    );
  }

  for (const [, dimension] of MeshRegister._dimensions) {
    for (const [, sector] of dimension) {
      min.set(sector.position[0], sector.position[1], sector.position[2]);
      max.set(
        sector.position[0] + WorldSpaces.sector.bounds.x,
        sector.position[1] + WorldSpaces.sector.bounds.y,
        sector.position[2] + WorldSpaces.sector.bounds.z,
      );
      boundingBox.reConstruct(min, max);
      const sectorVisible =
        boundingBox.isInFrustum(camera._frustumPlanes) ||
        (lightFrustumPlanes && boundingBox.isInFrustum(lightFrustumPlanes));
      for (const section of sector.sections) {
        if (!section) {
          continue;
        }
        for (const [key, mesh] of section.meshes as Map<string, Mesh>) {
          if (!sectorVisible) {
            mesh.isVisible = false;
            continue;
          }
          if (
            mesh.getBoundingInfo().isInFrustum(camera._frustumPlanes) ||
            (lightFrustumPlanes &&
              mesh.getBoundingInfo().isInFrustum(lightFrustumPlanes))
          ) {
            mesh.isVisible = true;
            candidates.push(mesh);
          } else {
            mesh.isVisible = false;
          }
        }
      }
    }
  }
  for (const mesh of otherMeshes) {
    // Section meshes are tagged after they are added to the scene.
    if (isSectionMesh(mesh)) {
      otherMeshes.delete(mesh);
      continue;
    }
    candidates.push(mesh);
  }
}

export class DVEBRMeshCuller {
  light: DirectionalLight | null = null;
  init(scene: Scene, bufferMode: "single" | "multi") {
    //   scene.freezeActiveMeshes(true);
    for (const mesh of scene.meshes) otherMeshes.add(mesh);
    scene.onNewMeshAddedObservable.add((mesh) => otherMeshes.add(mesh));
    scene.onMeshRemovedObservable.add((mesh) => otherMeshes.delete(mesh));
    scene.registerBeforeRender(() => {
      CullSectors(scene, this.light);
    });
    scene.getActiveMeshCandidates = () => candidates;

    //   myManualActiveMeshes.push();

    /*     const original = (scene as any)._evaluateActiveMeshes.bind(scene);
    (scene as any)._evaluateActiveMeshes = () => {
      sceneMeshes.length = 0;
      CullSectors(scene);
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

    }; */
  }
}
