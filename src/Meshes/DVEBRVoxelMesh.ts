import { Mesh } from "@babylonjs/core/Meshes/mesh.js";

import { Buffer, VertexBuffer } from "@babylonjs/core/Meshes/buffer.js";
import { Engine } from "@babylonjs/core/Engines/engine";
import { CompactSubMesh } from "@divinevoxel/vlox/Mesher/Types/Mesher.types";
import { VoxelMeshVertexStructCursor } from "@divinevoxel/vlox/Mesher/Voxels/Geometry/VoxelMeshVertexStructCursor";
import { Scene } from "@babylonjs/core/scene";
import { DVEBabylonRenderer } from "../Renderer/DVEBabylonRenderer";
import { Geometry, SubMesh, Vector3 } from "@babylonjs/core";
export class DVEBRVoxelMesh {
  static CreateSubMesh(data: CompactSubMesh, scene: Scene, engine: Engine) {
    const [materialId, vertexBuffer, indexBuffer] = data;
    const mesh = new Mesh("", scene);
    const material = DVEBabylonRenderer.instance.materials.get(materialId);
    mesh.material = material._material;
    this.UpdateVertexDataBuffers(mesh, engine, vertexBuffer, indexBuffer);
    return mesh;
  }

  static UpdateVertexData(mesh: Mesh, engine: Engine, data: CompactSubMesh) {
    this.UpdateVertexDataBuffers(mesh, engine, data[1], data[2]);
  }

  static set(parentMesh: any, geo: any, buffer: VertexBuffer) {
    if (geo instanceof Mesh) {
      return geo.setVerticesBuffer(buffer);
    }
    if (buffer._buffer) {
      buffer._buffer._increaseReferences();
    }
    geo._vertexBuffers[buffer.getKind()] = buffer;
    const kind = buffer.getKind();
    const meshes = geo._meshes;
    const numOfMeshes = meshes.length;

    if (kind === VertexBuffer.PositionKind) {
      geo._totalVertices = buffer._maxVerticesCount;
      for (let index = 0; index < numOfMeshes; index++) {
        const mesh = meshes[index];

        mesh.releaseSubMeshes();
        new SubMesh(
          0,
          0,
          geo._totalVertices,
          0,
          geo.getTotalIndices(),
          parentMesh,
          parentMesh,
          false,
        );
        mesh.computeWorldMatrix(true);
        mesh.synchronizeInstances();
      }
    }

    geo._notifyUpdate(kind);
  }
  static UpdateVertexDataBuffers(
    mesh: Mesh,
    engine: Engine,
    vertices: Float32Array,
    indices: Uint16Array<any> | Uint32Array<any>,
  ) {
    const GL_UNSIGNED_INT = 5125;

    const verticesBuffer = new Buffer(engine, vertices, false);

    const geo = mesh.geometry ? mesh.geometry : mesh;
    this.set(
      mesh,
      geo,
      new VertexBuffer(
        engine,
        verticesBuffer,
        VertexBuffer.PositionKind,
        false,
        undefined,
        VoxelMeshVertexStructCursor.VertexFloatSize,
        undefined,
        VoxelMeshVertexStructCursor.PositionOffset,
        4,
        undefined,
        undefined,
        undefined,
        undefined,
        false,
      ),
    );
    geo.setVerticesBuffer(
      new VertexBuffer(
        engine,
        verticesBuffer,
        VertexBuffer.NormalKind,
        false,
        undefined,
        VoxelMeshVertexStructCursor.VertexFloatSize,
        undefined,
        VoxelMeshVertexStructCursor.NormalOffset,
        4,
        undefined,
        undefined,
        undefined,
        undefined,
        false,
      ),
    );
    geo.setVerticesBuffer(
      new VertexBuffer(
        engine,
        verticesBuffer,
        "textureIndex",
        false,
        undefined,
        VoxelMeshVertexStructCursor.VertexFloatSize,
        undefined,
        VoxelMeshVertexStructCursor.TextureIndexOffset,
        4,
        GL_UNSIGNED_INT,
        false,
        undefined,
        undefined,
        false,
      ),
    );
    geo.setVerticesBuffer(
      new VertexBuffer(
        engine,
        verticesBuffer,
        "uv",
        false,
        undefined,
        VoxelMeshVertexStructCursor.VertexFloatSize,
        undefined,
        VoxelMeshVertexStructCursor.UVOffset,
        2,
        undefined,
        undefined,
        undefined,
        undefined,
        false,
      ),
    );
    geo.setVerticesBuffer(
      new VertexBuffer(
        engine,
        verticesBuffer,
        "color",
        false,
        undefined,
        VoxelMeshVertexStructCursor.VertexFloatSize,
        undefined,
        VoxelMeshVertexStructCursor.ColorOffset,
        4,
        undefined,
        undefined,
        undefined,
        undefined,
        false,
      ),
    );
    geo.setVerticesBuffer(
      new VertexBuffer(
        engine,
        verticesBuffer,
        "voxelData",
        false,
        undefined,
        VoxelMeshVertexStructCursor.VertexFloatSize,
        undefined,
        VoxelMeshVertexStructCursor.VoxelDataOFfset,
        4,
        GL_UNSIGNED_INT,
        false,
        undefined,
        undefined,
        false,
      ),
    );
    geo.setIndices(indices);
    return verticesBuffer;
  }
  /*   static UpdateVertexDataO(mesh: Mesh, engine: Engine, data: CompactSubMesh) {
 
    for (let i = 0; i < data[1].length; i++) {
      const subMesh = data[1][i];
      const id = subMesh[0];
      const array = subMesh[1];
      const stride = subMesh[2];
      if (id == "indices") {
        mesh.setIndices(array as any);
        continue;
      }

      const buffer = new Buffer(engine, array,false,)
      mesh.setVerticesBuffer(
        new VertexBuffer(engine, array, id, false, undefined, stride)
      );
    }
  } */
}
