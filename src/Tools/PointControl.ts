import { Color3 } from "@babylonjs/core/Maths/math.color";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Ray } from "@babylonjs/core/Culling/ray";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Effect } from "@babylonjs/core/Materials/effect";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { VertexBuffer } from "@babylonjs/core/Buffers/buffer";
import { Plane } from "@babylonjs/core/Maths/math.plane";
import { Vector3Like } from "@amodx/math";
import { TypedEventTarget } from "@divinevoxel/vlox/Util/TypedEventTarget";
import { VoxelFaces } from "@divinevoxel/vlox/Math";

Effect.ShadersStore["pointControlsVertexShader"] = /*glsl */ `#version 300 es
precision highp float;
in vec3 position; 
in float axes;
uniform mat4 world;
uniform mat4 viewProjection;
uniform vec3 colors[6];
uniform vec4 states[6];
out vec3 vColor;
void main(void) {
  vec4 p = vec4( position, 1.0 );
  vec4 state = states[uint(axes)];
  vec3 color = colors[uint(axes)];
  if(state.x == 1. && state.y != 1.) {
    color *= .5;
  }
  if(state.y == 1.) {
    color *= 1.5;
    color += .5;
  }
  vColor = color;
  gl_Position = viewProjection * world * p;
}
`;

Effect.ShadersStore["pointControlsFragmentShader"] = /*glsl */ `#version 300 es
precision highp float;
in vec3 vColor;
out vec4 FragColor;  
void main(void) {
  FragColor = vec4(vColor, 1.);
}
`;

const FaceNormals: Record<VoxelFaces, Vector3> = {
  [VoxelFaces.Up]: new Vector3(0, 1, 0),
  [VoxelFaces.Down]: new Vector3(0, -1, 0),
  [VoxelFaces.North]: new Vector3(0, 0, 1),
  [VoxelFaces.South]: new Vector3(0, 0, -1),
  [VoxelFaces.East]: new Vector3(1, 0, 0),
  [VoxelFaces.West]: new Vector3(-1, 0, 0),
};

const FaceAxisMask: Record<VoxelFaces, Vector3> = {
  [VoxelFaces.Up]: new Vector3(1, 0, 1),
  [VoxelFaces.Down]: new Vector3(1, 0, 1),
  [VoxelFaces.North]: new Vector3(1, 1, 0),
  [VoxelFaces.South]: new Vector3(1, 1, 0),
  [VoxelFaces.East]: new Vector3(0, 1, 1),
  [VoxelFaces.West]: new Vector3(0, 1, 1),
};

export interface VoxelControlsEvents {
  position: Vector3Like;
  active: VoxelFaces;
  inactive: VoxelFaces;
}

const tempRay = new Ray(new Vector3(0, 0, 0), new Vector3(1, 1, 1), 10000);
class FaceHandle {
  mesh: Mesh;
  min = new Vector3();
  max = new Vector3();
  deltas = new Vector3();
  deltaPoint = new Vector3();
  _dirty = false;

  constructor(
    public controls: PointControl,
    public face: VoxelFaces,
    private _states: Float32Array
  ) {
    const temp = CreateBox(
      "",
      { width: 1, height: 1, depth: 1 },
      controls.scene
    );
    const mesh = new Mesh(`${face}`, controls.scene);
    this.mesh = mesh;

    const positions = temp.getVerticesData(VertexBuffer.PositionKind)!;
    mesh.setVerticesData(VertexBuffer.PositionKind, positions);

    const attrib: number[] = new Array(positions.length / 3).fill(face);
    mesh.setVerticesBuffer(
      new VertexBuffer(
        controls.scene.getEngine(),
        attrib,
        "axes",
        false,
        undefined,
        1
      )
    );
    mesh.setIndices(temp.getIndices()!);
    temp.dispose();

    mesh.renderingGroupId = 2;
    mesh.parent = controls.parent;
    mesh.material = controls.material;
    mesh.alwaysSelectAsActiveMesh = true;

    this.refresh();
  }

  get hover() {
    return this._states[this.face * 4] === 1;
  }
  set hover(v) {
    this._states[this.face * 4] = v ? 1 : 0;
    this._dirty = true;
  }
  get active() {
    return this._states[this.face * 4 + 1] === 1;
  }
  set active(v) {
    this._states[this.face * 4 + 1] = v ? 1 : 0;
    this._dirty = true;
  }

  refresh() {
    const { size } = this.controls;

    const t = 0.08;

    const n = FaceNormals[this.face];

    const sx = n.x !== 0 ? size.x * t : size.x;
    const sy = n.y !== 0 ? size.y * t : size.y;
    const sz = n.z !== 0 ? size.z * t : size.z;

    this.mesh.scaling.set(sx, sy, sz);
    const half = new Vector3(size.x / 2, size.y / 2, size.z / 2);
    const offset = new Vector3(n.x * half.x, n.y * half.y, n.z * half.z);
    this.mesh.position.copyFrom(offset);
    this.mesh.refreshBoundingInfo(true);
    const box = this.mesh.getBoundingInfo().boundingBox;
    this.min.copyFrom(box.minimumWorld);
    this.max.copyFrom(box.maximumWorld);
  }

  private projectToPlane(v: Vector3) {
    const n = FaceNormals[this.face];
    const alongN = n.scale(Vector3.Dot(v, n));
    return v.subtract(alongN);
  }
  private startHandleWorld = new Vector3();
  private lastSentPosition = new Vector3(Number.NaN, Number.NaN, Number.NaN);
  update(ray: Ray, mouseDown: boolean) {
    this.mesh.computeWorldMatrix(true);
    const box = this.mesh.getBoundingInfo().boundingBox;
    this.min.copyFrom(box.minimumWorld);
    this.max.copyFrom(box.maximumWorld);

    if (this.active && !mouseDown) {
      this.active = false;
      this.controls.dispatch("inactive", this.face);
      return;
    }

    if (this.active) {
      const n = FaceNormals[this.face];
      const dragPlane = Plane.FromPositionAndNormal(this.deltaPoint, n);

      const dist = ray.intersectsPlane(dragPlane);
      if (dist == null) return;

      const hit = ray.direction.scale(dist).addInPlace(ray.origin);
      const movement = hit.subtract(this.deltaPoint);
      const planar = this.projectToPlane(movement);
      const mask = FaceAxisMask[this.face];
      const threshold = 0.25;
      if (this.controls.mode === "delta") {
        const dx = Math.abs(planar.x) < threshold ? 0 : Math.round(planar.x);
        const dy = Math.abs(planar.y) < threshold ? 0 : Math.round(planar.y);
        const dz = Math.abs(planar.z) < threshold ? 0 : Math.round(planar.z);

        if (
          dx !== this.deltas.x ||
          dy !== this.deltas.y ||
          dz !== this.deltas.z
        ) {
          this.deltas.set(dx * mask.x, dy * mask.y, dz * mask.z);
          this.controls.dispatch("position", {
            x: this.deltas.x,
            y: this.deltas.y,
            z: this.deltas.z,
          });
        }
      } else {
        const mx = planar.x * mask.x;
        const my = planar.y * mask.y;
        const mz = planar.z * mask.z;

        const target = this.startHandleWorld.add(new Vector3(mx, my, mz));
        const px = Math.abs(target.x) < threshold ? 0 : Math.round(target.x);
        const py = Math.abs(target.y) < threshold ? 0 : Math.round(target.y);
        const pz = Math.abs(target.z) < threshold ? 0 : Math.round(target.z);

        if (
          px !== this.lastSentPosition.x ||
          py !== this.lastSentPosition.y ||
          pz !== this.lastSentPosition.z
        ) {
          this.lastSentPosition.set(px, py, pz);
          this.controls.dispatch("position", { x: px, y: py, z: pz });
        }
      }
    }

    if (ray.intersectsBoxMinMax(this.min, this.max)) {
      if (mouseDown && !this.active && !this.controls.isActive()) {
        this.active = true;
        this.deltas.set(0, 0, 0);

        const n = FaceNormals[this.face];

        const handleWorld = this.mesh.getAbsolutePosition();

        const startPlane = Plane.FromPositionAndNormal(handleWorld, n);
        const dist = ray.intersectsPlane(startPlane);
        const clickPoint =
          dist == null
            ? handleWorld
            : ray.direction.scale(dist).addInPlace(ray.origin);

        this.deltaPoint.copyFrom(clickPoint);

        this.startHandleWorld.copyFrom(handleWorld);

        this.lastSentPosition.set(Number.NaN, Number.NaN, Number.NaN);
        this.controls.dispatch("active", this.face);
      }
      if (!this.hover) this.hover = true;
    } else if (this.hover) {
      this.hover = false;
    }
  }

  dispose() {
    this.mesh.dispose();
  }
}

export class PointControl extends TypedEventTarget<VoxelControlsEvents> {
  static Materials = new Map<Scene, ShaderMaterial>();
  faces: FaceHandle[] = [];
  colors: Record<number, Color3>;
  parent: TransformNode;
  material: ShaderMaterial;
  private _states: Float32Array;

  origin = Vector3Like.Create();
  size = Vector3Like.Create(1, 1, 1);

  constructor(
    public scene: Scene,
    public mode: "delta" | "position" = "position"
  ) {
    super();

    if (!PointControl.Materials.has(scene)) {
      const mat = new ShaderMaterial("", scene, "pointControls", {
        uniforms: ["colors", "states", "world", "viewProjection"],
        attributes: ["position", "axes"],
        needAlphaBlending: true,
      });
      PointControl.Materials.set(scene, mat);
    }

    this.material = PointControl.Materials.get(scene)!.clone("");
    this.material.backFaceCulling = false;
    this.material.forceDepthWrite = true;

    this.parent = new TransformNode("", scene);
    this._states = new Float32Array(4 * 6);
    this.material.setArray4("states", this._states as any);
    this.faces = [
      new FaceHandle(this, VoxelFaces.Up, this._states),
      new FaceHandle(this, VoxelFaces.Down, this._states),
      new FaceHandle(this, VoxelFaces.North, this._states),
      new FaceHandle(this, VoxelFaces.South, this._states),
      new FaceHandle(this, VoxelFaces.East, this._states),
      new FaceHandle(this, VoxelFaces.West, this._states),
    ];

    this.updateColors(
      new Color3(1, 0.5, 0.5),
      new Color3(1, 0.2, 0.2),
      new Color3(0.5, 1, 0.5),
      new Color3(0.2, 1, 0.2),
      new Color3(0.5, 0.5, 1),
      new Color3(0.2, 0.2, 1)
    );
  }

  isActive() {
    for (let i = 0; i < this.faces.length; i++) {
      if (this.faces[i].active) return true;
    }
    return false;
  }
  private getActiveFace() {
    for (let i = 0; i < this.faces.length; i++) {
      if (this.faces[i].active) return this.faces[i];
    }
    return null;
  }

  updateColors(...cs: Color3[]) {
    this.colors = {} as any;
    this.material.setColor3Array("colors", cs);
  }

  setOriginAndSize(origin: Vector3Like, size: Vector3Like) {
    this.origin = origin;
    this.size = size;
    this.updatePosition();
    for (const f of this.faces) f.refresh();
  }

  setOrigin(origin: Vector3Like) {
    this.origin = origin;
    this.updatePosition();
    for (const f of this.faces) f.refresh();
  }

  updatePosition() {
    this.parent.position.x = this.origin.x;
    this.parent.position.y = this.origin.y;
    this.parent.position.z = this.origin.z;
  }

  update(
    mouseDown: boolean,
    rayOrigin: Vector3Like,
    rayDirection: Vector3Like,
    length: number
  ) {
    this.updatePosition();

    tempRay.origin.set(rayOrigin.x, rayOrigin.y, rayOrigin.z);
    tempRay.direction.set(rayDirection.x, rayDirection.y, rayDirection.z);
    tempRay.length = length;

    const activFace = this.getActiveFace();
    if (!activFace) {
      for (const f of this.faces) {
        f.update(tempRay, mouseDown);
        if (this.isActive()) break;
      }
    } else {
      activFace.update(tempRay, mouseDown);
    }

    if (this.faces.some((f) => f._dirty)) {
      this.material.setArray4("states", this._states as any);
      for (const f of this.faces) f._dirty = false;
    }
  }

  setEnabled(enabled: boolean) {
    for (const f of this.faces) f.mesh.setEnabled(enabled);
  }

  dispose() {
    for (const f of this.faces) f.dispose();
    this.material.dispose();
  }
}
