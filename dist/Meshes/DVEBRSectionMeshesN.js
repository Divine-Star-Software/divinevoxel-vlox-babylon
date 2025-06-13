import { Vector3 } from "@babylonjs/core/Maths/";
import { BoundingInfo } from "@babylonjs/core/Culling/boundingInfo.js";
import { DVESectionMeshes } from "@divinevoxel/vlox/Renderer";
import { CompactedMeshData, } from "@divinevoxel/vlox/Mesher/Geomtry/CompactedSectionVoxelMesh";
const meshData = new CompactedMeshData();
const location = [0, 0, 0, 0];
const found = new Set();
export class DVEBRSectionMeshes extends DVESectionMeshes {
    scene;
    engine;
    renderer;
    static meshCache = [];
    pickable = false;
    checkCollisions = false;
    serialize = false;
    defaultBb;
    constructor(scene, engine, renderer) {
        super();
        this.scene = scene;
        this.engine = engine;
        this.renderer = renderer;
        this.defaultBb = new BoundingInfo(Vector3.Zero(), new Vector3(16, 16, 16));
    }
    returnMesh(mesh) {
        this.renderer.voxelScene.removeMesh(mesh);
    }
    updateVertexData(section, data) {
        data.getLocation(location);
        const totalMeshes = data.getTotalMeshes();
        for (let i = 0; i < totalMeshes; i++) {
            data.getMeshData(i, meshData);
            const subMeshMaterial = meshData.materialId;
            found.add(subMeshMaterial);
            let mesh;
            let needNew = true;
            if (section.meshes.has(subMeshMaterial)) {
                needNew = false;
                mesh = this.renderer.voxelScene.updateMesh(section.meshes.get(subMeshMaterial), meshData);
                if (!mesh) {
                    needNew = true;
                }
            }
            if (needNew) {
                mesh = this.renderer.voxelScene.addMesh(meshData, location[1], location[2], location[3]);
            }
            section.meshes.set(subMeshMaterial, mesh);
        }
        for (const [key, mesh] of section.meshes) {
            if (!found.has(key)) {
                this.returnMesh(mesh);
                section.meshes.delete(key);
            }
        }
        found.clear();
        return section;
    }
}
