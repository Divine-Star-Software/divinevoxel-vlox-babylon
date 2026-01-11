import { Mesh } from "@babylonjs/core/Meshes/mesh.js";

import { Buffer, VertexBuffer } from "@babylonjs/core/Meshes/buffer.js";
import { Engine } from "@babylonjs/core/Engines/engine";
import { CompactSubMesh } from "@divinevoxel/vlox/Mesher/Types/Mesher.types";
import { ItemMeshVertexStructCursor } from "@divinevoxel/vlox/Mesher/Items/Geometry/ItemMeshVertexStructCursor";
import { Scene } from "@babylonjs/core/scene";
import { DVEBabylonRenderer } from "../Renderer/DVEBabylonRenderer";
export class DVEBRItemMesh {
  static CreateSubMesh(data: CompactSubMesh, scene: Scene, engine: Engine) {
    const [materialId, vertexBuffer, indexBuffer] = data;
    const mesh = new Mesh("", scene);
    mesh.renderingGroupId = 2;
    const material = DVEBabylonRenderer.instance.materials.get(materialId);
    mesh.material = material._material;
    this.UpdateVertexDataBuffers(mesh, engine, vertexBuffer, indexBuffer);
    return mesh;
  }

  static UpdateVertexData(mesh: Mesh, engine: Engine, data: CompactSubMesh) {
    this.UpdateVertexDataBuffers(mesh, engine, data[1], data[2]);
  }

  static UpdateVertexDataBuffers(
    mesh: Mesh,
    engine: Engine,
    vertices: Float32Array,
    indices: Uint16Array<any> | Uint32Array<any>
  ) {
    const buffer = new Buffer(engine, vertices, false);
    const geo = mesh.geometry ? mesh.geometry : mesh;
   
    geo.setVerticesBuffer(
      new VertexBuffer(
        engine,
        buffer,
        VertexBuffer.PositionKind,
        false,
        undefined,
        ItemMeshVertexStructCursor.VertexFloatSize,
        undefined,
        ItemMeshVertexStructCursor.PositionOffset,
        3
      )
    );
    geo.setVerticesBuffer(
      new VertexBuffer(
        engine,
        buffer,
        VertexBuffer.NormalKind,
        false,
        undefined,
        ItemMeshVertexStructCursor.VertexFloatSize,
        undefined,
        ItemMeshVertexStructCursor.NormalOffset,
        3
      )
    );
    geo.setVerticesBuffer(
      new VertexBuffer(
        engine,
        buffer,
        "textureIndex",
        false,
        undefined,
        ItemMeshVertexStructCursor.VertexFloatSize,
        undefined,
        ItemMeshVertexStructCursor.TextureIndexOffset,
        1
      )
    );
    geo.setVerticesBuffer(
      new VertexBuffer(
        engine,
        buffer,
        "uv",
        false,
        undefined,
        ItemMeshVertexStructCursor.VertexFloatSize,
        undefined,
        ItemMeshVertexStructCursor.UVOffset,
        2
      )
    );

    geo.setIndices(indices);
    return buffer;
  }
}
