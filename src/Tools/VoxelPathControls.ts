import { Scene } from "@babylonjs/core/scene";
import {
  VoxelPath,
  VoxelPathSegment,
} from "@divinevoxel/vlox/Templates/Path/VoxelPath";
import { VoxelPathMesh } from "./VoxelPathMesh";
import { VoxelControls } from "./VoxelControls";
import { Distance3D, Vec3Array, Vector3Like } from "@amodx/math";
import "@babylonjs/core/Meshes/instancedMesh";
import { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh";
import { BoundingBox } from "@amodx/math/Geomtry/Bounds/BoundingBox";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { RayProvider } from "@divinevoxel/vlox/Builder/RayProvider";
import { VoxelSelectionHighlight } from "./VoxelSelectionHighlight";
import { Mesh } from "@babylonjs/core";
import { VoxelShapeTemplate } from "@divinevoxel/vlox/Templates/Shapes/VoxelShapeTemplate";
import { BoxVoxelShapeSelection } from "@divinevoxel/vlox/Templates/Shapes/Selections/BoxVoxelShapeSelection";
import { VoxelTemplateSelection } from "@divinevoxel/vlox/Templates/Selection/VoxelTemplateSelection";
import { PathToolModes } from "@divinevoxel/vlox/Builder/Tools/Path/PahtTool";
const min = new Vector3();
const max = new Vector3();
const boundingBox = new BoundingBox(min, max);
const voxelSize = Vector3Like.Create(1, 1, 1);
class PointControl {
  control: VoxelControls;

  get point() {
    return this.segment.getPoint(this.pointIndex);
  }

  constructor(
    public segment: VoxelPathSegment,
    public pointIndex: 0 | 1,
    public mesh: InstancedMesh
  ) {}

  intersects(ray: RayProvider) {
    const instance = this.mesh;

    min.set(instance.position.x, instance.position.y, instance.position.z);
    max.set(
      instance.position.x + 1,
      instance.position.y + 1,
      instance.position.z + 1
    );
    boundingBox.setMinMax(min, max);
    return (
      boundingBox.rayIntersection(ray.origin, ray.direction, ray.length) !==
      Infinity
    );
  }
  private _hovered = false;
  private _enabled = false;

  setHover(hovered: boolean) {
    this._hovered = hovered;
  }
  isHovered() {
    return this._hovered;
  }

  setEnabled(enabled: boolean) {
    if (this._enabled && enabled) return;
    this._enabled = enabled;
    if (enabled) {
      const control = new VoxelControls(this.mesh.getScene(), "delta");
      control.setOriginAndSize(this.mesh.position, voxelSize);
      const position = new Vector3(...this.segment.getPoint(this.pointIndex));
      control.setEnabled(true);
      this.control = control;
      const point: Vec3Array = [...this.segment.getPoint(this.pointIndex)];
      let jointSegment: VoxelPathSegment | null = null;

      if (this.pointIndex != 1 && this.segment.index != 0) {
        jointSegment = this.segment.path.segments[this.segment.index - 1];
      }

      this.control.addEventListener(
        "position",
        ({
          detail: {
            delta: { x: dx, y: dy, z: dz },
          },
        }) => {
          const x = dx + position.x;
          const y = dy + position.y;
          const z = dz + position.z;
          this.mesh.position.set(x, y, z);
          point[0] = x;
          point[1] = y;
          point[2] = z;

          this.segment.setPoint(this.pointIndex, point);
          if (jointSegment) {
            jointSegment.setPoint(1, point);
          }
        }
      );
      this.control.addEventListener("inactive", () => {
        position.x = point[0];
        position.y = point[1];
        position.z = point[2];
      });
    } else {
      if (this.control) this.control.dispose();
    }
  }

  sync() {
    this.mesh.position.set(...this.segment.getPoint(this.pointIndex));
  }
  isEnabled() {
    return this._enabled;
  }

  delete() {
    this.segment.path.removePoint(this.segment.index, this.pointIndex);
    this.dispose();
  }

  dispose() {
    if (this.control) {
      this.control.dispose();
    }
    this.mesh.dispose();
  }
}

export class VoxelPathControls {
  private _mode = PathToolModes.PlacePoints;
  mesh: VoxelPathMesh;
  private _pointControls: PointControl[] = [];
  private _controlMap = new Map<VoxelPathSegment, PointControl[]>();
  private _pointHover: VoxelSelectionHighlight;
  private _pointHighlight: VoxelSelectionHighlight;
  private _activeControl: PointControl | null = null;
  private _mouseDown = false;
  private _disposePath: (() => void) | null = null;
  private _hoveredIndex = -1;
  path: VoxelPath | null = null;

  constructor(public scene: Scene, public rayProvider: RayProvider) {
    this.mesh = new VoxelPathMesh(scene, "");
    const selection = new VoxelTemplateSelection();
    selection.setTemplate(
      new VoxelShapeTemplate(
        VoxelShapeTemplate.CreateNew({
          shapeSelection: BoxVoxelShapeSelection.CreateNew({
            width: 1,
            height: 1,
            depth: 1,
          }),
        })
      )
    );
    const hoverPoint = new VoxelSelectionHighlight(scene);
    hoverPoint.update(selection);
    hoverPoint.setColor(1, 0, 0, 1);
    hoverPoint.setEnabled(false);
    this._pointHover = hoverPoint;

    const pointHighlight = new VoxelSelectionHighlight(scene);
    pointHighlight.update(selection);
    pointHighlight.setColor(1, 1, 1, 1);
    this._pointHighlight = pointHighlight;
    this._pointHighlight.setEnabled(false);
  }

  private addSegmentControl(segment: VoxelPathSegment, pointIndex: 0 | 1) {
    const instance = this._pointHighlight.mesh.createInstance(
      `${segment.index}-${pointIndex}`
    );
    const point = segment.getPoint(pointIndex);
    instance.position.set(...point);
    const control = new PointControl(segment, pointIndex, instance);
    this._pointControls.push(control);
    return control;
  }

  getMode() {
    return this._mode;
  }
  setMode(mode: PathToolModes) {
    const lastMode = this._mode;
    this._mode = mode;
    if (lastMode == PathToolModes.PlacePoints) {
    }
  }

  private _hoverEnabled = false;
  setHoverEnabled(enabled: boolean) {
    if (enabled) {
      this._pointHover.setEnabled(true);
    } else {
      this._hoveredIndex = -1;
      this._pointHover.setEnabled(false);
    }
    this._hoverEnabled = enabled;
  }
  isHoverEnabled() {
    return this._hoverEnabled;
  }

  private _enabled = true;
  setEnabled(enabled: boolean) {
    if (this._enabled == enabled) return;
    if (enabled) {
      for (const segment of this.mesh.segments) {
        segment.setEnabled(true);
      }
      for (const control of this._pointControls) {
        control.setEnabled(true);
      }
    } else {
      for (const segment of this.mesh.segments) {
        segment.setEnabled(false);
      }
      for (const control of this._pointControls) {
        control.setEnabled(false);
      }
    }
    this._enabled = enabled;
  }

  isEnabled() {
    return this._enabled;
  }

  clear() {
    if (this.path) {
      this.path.segments = [];
      this.path = null;
    }

    this.clearMesh();
  }

  clearMesh() {
    for (const segment of this.mesh.segments) {
      segment.dispose();
    }
    this.mesh.segments = [];
    for (const control of this._pointControls) {
      control.dispose();
    }
    this._pointControls = [];
  }

  update(mouseDown: boolean) {
    this._mouseDown = mouseDown;
    if (this._activeControl) {
      this._activeControl.control.update(
        this._mouseDown,
        this.rayProvider.origin,
        this.rayProvider.direction,
        this.rayProvider.length
      );
      return;
    }
  }
  private addSegment(segment: VoxelPathSegment) {
    const segmentMesh = this.mesh.addSegment(segment);

    const update = () => {
      segmentMesh.update();
      const controls = this._controlMap.get(segment);
      if (controls) {
        for (const contorl of controls) {
          contorl.sync();
        }
      }
    };
    segment.addEventListener("updated", update);
    segmentMesh.onDispose = () => {
      segment.removeEventListener("updated", update);
    };
  }

  private rebuildControls() {
    if (!this.path) return;
    for (const contorl of this._pointControls) {
      contorl.dispose();
    }
    this._pointControls = [];
    const lastSegment = this.path.lastSegment();
    for (let i = 0; i < this.path.segments.length; i++) {
      const segment = this.path.segments[i];
      let controls = this._controlMap.get(segment);
      if (!controls) {
        controls = [];
      }
      this._controlMap.set(segment, controls);
      controls.push(this.addSegmentControl(segment, 0));
      if (lastSegment == segment) {
        controls.push(this.addSegmentControl(segment, 1));
      }
    }
  }

  private rebuild() {
    if (!this.path) return;
    this.clearMesh();
    for (let i = 0; i < this.path.segments.length; i++) {
      const segment = this.path.segments[i];
      this.addSegment(segment);
    }
    if (this._pointControls.length) {
      this._pointHighlight.setEnabled(true);
    }
    this.rebuildControls();
  }

  setColor(r: number, g: number, b: number, a: number = 1) {
    this.mesh.setColor(r, g, b, a);
    this._pointHighlight.setColor(r, g, b, a);
    this._pointHover.setColor(r * 0.5, g * 0.5, b * 0.5, 0.75);
  }

  editHovered() {
    if (this._hoveredIndex < 0) return false;
    if (this._activeControl) {
      this._activeControl.setEnabled(false);
      this._activeControl = null;
    }
    const hovered = this._pointControls[this._hoveredIndex];
    this._activeControl = hovered;
    hovered.setEnabled(true);
  }

  isEditing() {
    return this._activeControl !== null;
  }

  stopEditing() {
    if (!this._activeControl) return;
    this._activeControl.setEnabled(false);
    this._activeControl = null;
  }

  removedHovered() {
    if (!this.path) return;
    if (this._hoveredIndex < 0) return false;
    const hovered = this._pointControls[this._hoveredIndex];
    this.path.removePoint(hovered.segment.index, hovered.pointIndex);
  }

  setPath(path: VoxelPath) {
    this.path = path;
    if (this._disposePath) this._disposePath();

    this.mesh.setPath(path);
    const segmentAdded = path.createEventListener(
      "segmentAdded",
      ({ detail: segment }) => {
        this.addSegment(segment);
        this.rebuildControls();
        this._pointHighlight.setEnabled(true);
      }
    );
    path.addEventListener("segmentAdded", segmentAdded);

    const segmentRemoved = path.createEventListener(
      "segmentRemoved",
      ({ detail: segment }) => {
        this.rebuild();
      }
    );
    path.addEventListener("segmentRemoved", segmentRemoved);

    const onRender = this.scene.onBeforeRenderObservable.add(() => {
      this.mesh.build();
      if (this._activeControl) {
        this._activeControl.control.update(
          this._mouseDown,
          this.rayProvider.origin,
          this.rayProvider.direction,
          this.rayProvider.length
        );
      }
      if (this.isHoverEnabled()) {
        this._hoveredIndex = -1;
        let t = Infinity;
        for (let i = 0; i < this._pointControls.length; i++) {
          const control = this._pointControls[i];
          control.mesh.setEnabled(true);
          control.setHover(false);
          if (control == this._activeControl) continue;
          if (control.intersects(this.rayProvider)) {
            const distance = Distance3D(
              this.rayProvider.origin.x,
              this.rayProvider.origin.y,
              this.rayProvider.origin.z,
              control.mesh.position.x,
              control.mesh.position.y,
              control.mesh.position.z
            );
            if (distance < t) {
              this._hoveredIndex = i;
              t = distance;
            }
          }
        }
        if (this._hoveredIndex > -1) {
          const control = this._pointControls[this._hoveredIndex];
          control.setHover(true);
          control.mesh.setEnabled(false);
          this._pointHover.mesh.position.set(
            control.mesh.position.x,
            control.mesh.position.y,
            control.mesh.position.z
          );

          this._pointHover.mesh.setEnabled(true);
        } else {
          this._pointHover.mesh.setEnabled(false);
        }
      }
    });

    this.rebuild();
    this._disposePath = () => {
      this._disposePath = null;
      path.removeEventListener("segmentAdded", segmentAdded);
      path.removeEventListener("segmentRemoved", segmentRemoved);
      this.scene.onBeforeRenderObservable.remove(onRender);
      this._pointHighlight.setEnabled(false);
    };
  }

  dispose() {
    if (this._disposePath) this._disposePath();
    this.mesh.dispose();
    for (const control of this._pointControls) {
      control.dispose();
    }
  }
}
