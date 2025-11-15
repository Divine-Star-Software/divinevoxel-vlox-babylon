import { Scene } from "@babylonjs/core/scene";
import { VoxelControls } from "./VoxelControls";
import { VoxelSelectionHighlight } from "./VoxelSelectionHighlight";
import { VoxelBoundsSelection } from "@divinevoxel/vlox/Templates/Selection/VoxelBoundsSelection";
import { TypedEventTarget } from "@divinevoxel/vlox/Util/TypedEventTarget";
import { RayProvider } from "@divinevoxel/vlox/Builder/RayProvider";
import { Vec3Array, Vector3Like } from "@amodx/math";
import { Axes } from "@amodx/math/Vectors/Axes";
import { PointControl } from "./PointControl";
interface VoxelBoundsSelectionControlsEvents {
  "move-up": null;
  "move-down": null;
}
const corners: Vec3Array[] = [
  [0, 0, 0],
  [0, 0, 1],
  [0, 1, 0],
  [0, 1, 1],
  [1, 0, 0],
  [1, 0, 1],
  [1, 1, 0],
  [1, 1, 1],
];

const bitOpp = (b: 0 | 1) => (b ? 0 : 1) as 0 | 1;
const coordFor = (bit: 0 | 1, minV: number, maxV: number) =>
  bit ? maxV : minV;

export class VoxelBoundsSelectionControls extends TypedEventTarget<VoxelBoundsSelectionControlsEvents> {
  axisControls: VoxelControls;
  selectionHighlight: VoxelSelectionHighlight;
  pointControls: PointControl[] | null = null;
  private _activePoint: PointControl | null = null;
  private readonly minThicknessVox = 1;

  constructor(
    public scene: Scene,
    public rayProvider: RayProvider,
    public selection: VoxelBoundsSelection,
    public enableScaleAdjust = false
  ) {
    super();
    this.init();
  }

  sync() {
    this.selectionHighlight.update(this.selection);
  }

  private clampCornerAxis(bit: 0 | 1, p: number, anchor: number, min: number) {
    if (bit) {
      const minAllowed = anchor + min;
      return Math.max(p, minAllowed);
    } else {
      const maxAllowed = anchor - min;
      return Math.min(p, maxAllowed);
    }
  }

  private snap(v: Vector3Like) {
    v.x = Math.round(v.x);
    v.y = Math.round(v.y);
    v.z = Math.round(v.z);
    return v;
  }

  private dragCorner(index: number, newPos: Vector3Like) {
    const { min, max } = this.selection.bounds.getMinMax();

    const [bx, by, bz] = corners[index] as [0 | 1, 0 | 1, 0 | 1];

    const ox = coordFor(bitOpp(bx), min.x, max.x);
    const oy = coordFor(bitOpp(by), min.y, max.y);
    const oz = coordFor(bitOpp(bz), min.z, max.z);
    const anchor = Vector3Like.Create(ox, oy, oz);

    const p = this.snap(Vector3Like.Clone(newPos));

    const cx = this.clampCornerAxis(bx, p.x, anchor.x, this.minThicknessVox);
    const cy = this.clampCornerAxis(by, p.y, anchor.y, this.minThicknessVox);
    const cz = this.clampCornerAxis(bz, p.z, anchor.z, this.minThicknessVox);

    const nextMin = Vector3Like.Create(
      Math.min(anchor.x, cx),
      Math.min(anchor.y, cy),
      Math.min(anchor.z, cz)
    );
    const nextMax = Vector3Like.Create(
      Math.max(anchor.x, cx),
      Math.max(anchor.y, cy),
      Math.max(anchor.z, cz)
    );

    if (
      nextMin.x >= nextMax.x ||
      nextMin.y >= nextMax.y ||
      nextMin.z >= nextMax.z
    ) {
      return;
    }

    this.selection.reConstruct(
      nextMin,
      Axes.UpReadOnly(),
      nextMax,
      Axes.UpReadOnly()
    );
    this.selectionHighlight.update(this.selection);
    this.axisControls.setOriginAndSize(
      this.selection.origin,
      this.selection.bounds.size
    );
    this.updatePointControlsFromBounds();
  }

  private updatePointControlsFromBounds() {
    if (!this.pointControls) return;
    const { min, max } = this.selection.bounds.getMinMax();
    for (let i = 0; i < this.pointControls.length; i++) {
      const [bx, by, bz] = corners[i] as [0 | 1, 0 | 1, 0 | 1];
      const px = coordFor(bx, min.x, max.x);
      const py = coordFor(by, min.y, max.y);
      const pz = coordFor(bz, min.z, max.z);
      this.pointControls[i].setOrigin(Vector3Like.Create(px, py, pz));
    }
  }

  dispose() {
    this.selectionHighlight.dispose();
    this.axisControls.dispose();
    if (this.pointControls) {
      for (const point of this.pointControls) {
        point.dispose();
      }
    }
  }

  update(selectionActive: boolean) {
    this.axisControls.update(
      selectionActive,
      this.rayProvider.origin,
      this.rayProvider.direction,
      this.rayProvider.length
    );
    if (this.enableScaleAdjust && this.pointControls) {
      for (const point of this.pointControls) {
        if (this._activePoint && this._activePoint != point) continue;
        point.update(
          selectionActive,
          this.rayProvider.origin,
          this.rayProvider.direction,
          this.rayProvider.length
        );
      }
    }
  }

  private init() {
    this.axisControls = new VoxelControls(this.scene, "position");
    this.selectionHighlight = new VoxelSelectionHighlight(this.scene);

    this.selectionHighlight.mesh.position.set(0, 0, 0);

    this.selectionHighlight.update(this.selection);
    this.selectionHighlight.mesh.setEnabled(true);
    this.axisControls.parent.setEnabled(true);

    this.axisControls.setOriginAndSize(
      this.selection.origin,
      this.selection.bounds.size
    );

    const move = (dx: number, dy: number, dz: number) => {
      this.selection.origin.x += dx;
      this.selection.origin.y += dy;
      this.selection.origin.z += dz;

      this.selection.reConstruct(
        this.selection.origin,
        Axes.UpReadOnly(),
        Vector3Like.Add(this.selection.origin, this.selection.bounds.size),
        Axes.UpReadOnly()
      );

      this.selectionHighlight.update(this.selection);
      this.axisControls.updatePosition();
      this.updatePointControlsFromBounds();
    };
    this.axisControls.addEventListener(
      "position",
      ({ detail: { position, delta } }) => {
        move(delta.x, delta.y, delta.z);
      }
    );

    const activeListener = this.axisControls.createEventListener(
      "active",
      ({ detail: axes }) => {
        const downListener = this.createEventListener("move-down", () => {
          move(
            axes == "x" ? -1 : 0,
            axes == "y" ? -1 : 0,
            axes == "z" ? -1 : 0
          );
        });
        this.addEventListener("move-down", downListener);

        const upListener = this.createEventListener("move-up", () => {
          move(axes == "x" ? 1 : 0, axes == "y" ? 1 : 0, axes == "z" ? 1 : 0);
        });
        this.addEventListener("move-up", upListener);

        const inActiveListener = this.axisControls.createEventListener(
          "inactive",
          ({ detail: inactiveAxes }) => {
            if (inactiveAxes != axes) return;

            this.axisControls.removeEventListener("inactive", inActiveListener);
            this.removeEventListener("move-down", downListener);
            this.removeEventListener("move-up", upListener);
          }
        );
        this.axisControls.addEventListener("inactive", inActiveListener);
      }
    );
    this.axisControls.addEventListener("active", activeListener);

    if (this.enableScaleAdjust) {
      this.pointControls = [];

      const { min, max } = this.selection.bounds.getMinMax();
      const size = Vector3Like.Create(0.25, 0.25, 0.25);

      for (let i = 0; i < corners.length; i++) {
        const [bx, by, bz] = corners[i] as [0 | 1, 0 | 1, 0 | 1];
        const px = coordFor(bx, min.x, max.x);
        const py = coordFor(by, min.y, max.y);
        const pz = coordFor(bz, min.z, max.z);

        const pc = new PointControl(this.scene);
        pc.setOriginAndSize(Vector3Like.Create(px, py, pz), size);
        this.pointControls.push(pc);

        pc.addEventListener("active", () => {
          this._activePoint = pc;
        });
        pc.addEventListener("inactive", () => {
          this._activePoint = null;
        });
        pc.addEventListener("position", ({ detail: position }) => {
          this.dragCorner(i, position);
        });
      }
    }
  }
}
