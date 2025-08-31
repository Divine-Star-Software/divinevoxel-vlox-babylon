import { Scene } from "@babylonjs/core/scene";
import { VoxelControls } from "./VoxelControls";
import { VoxelSelectionHighlight } from "./VoxelSelectionHighlight";
import { VoxelBoxSelection } from "@divinevoxel/vlox/Templates/Selection/VoxelBoxSelection";
import { TypedEventTarget } from "@divinevoxel/vlox/Util/TypedEventTarget";
import { RayProvider } from "@divinevoxel/vlox/Builder/RayProvider";
import { Vector3Like } from "@amodx/math";
interface VoxelBoxSelectionControlsEvents {
  "move-up": null;
  "move-down": null;
}
export class VoxelBoxSelectionControls extends TypedEventTarget<VoxelBoxSelectionControlsEvents> {
  axisControls: VoxelControls;
  selectionHighlight: VoxelSelectionHighlight;
  constructor(
    public scene: Scene,
    public rayProvider: RayProvider,
    public selection: VoxelBoxSelection
  ) {
    super();
    this.init();
  }

  dispose() {
    this.selectionHighlight.dispose();
    this.axisControls.dispose();
  }

  update(selectionActive: boolean) {
    this.axisControls.update(
      selectionActive,
      this.rayProvider.origin,
      this.rayProvider.direction,
      this.rayProvider.length
    );
  }
  private init() {
    this.axisControls = new VoxelControls(this.scene);
    this.selectionHighlight = new VoxelSelectionHighlight(this.scene);

    this.selectionHighlight.mesh.position.set(0, 0, 0);

    this.selectionHighlight.update(this.selection);
    this.selectionHighlight.mesh.setEnabled(true);
    const meshPosition = this.selectionHighlight.mesh.position.clone();
    this.axisControls.parent.setEnabled(true);

    this.axisControls.setOriginAndSize(
      this.selection.origin,
      this.selection.size
    );
    const selectionPosition = {
      ...this.selectionHighlight.selection.origin,
    };
    this.axisControls.addEventListener("position", ({ detail: delta }) => {
      //x
      this.selection.origin.x = selectionPosition.x + delta.x;
      this.selectionHighlight.mesh.position.x = meshPosition.x + delta.x;
      //y
      this.selection.origin.y = selectionPosition.y + delta.y;
      this.selectionHighlight.mesh.position.y = meshPosition.y + delta.y;
      //z
      this.selection.origin.z = selectionPosition.z + delta.z;
      this.selectionHighlight.mesh.position.z = meshPosition.z + delta.z;
      this.axisControls.updatePosition();
    });

    const activeListener = this.axisControls.createEventListener(
      "active",
      ({ detail: axes }) => {
        console.warn("start", axes);

        const downListener = this.createEventListener("move-down", () => {
          if (axes == "x") {
            this.selection.origin.x--;
            this.selectionHighlight.mesh.position.x--;
          }
          if (axes == "y") {
            this.selection.origin.y--;
            this.selectionHighlight.mesh.position.y--;
          }
          if (axes == "z") {
            this.selection.origin.z--;
            this.selectionHighlight.mesh.position.z--;
          }
          Vector3Like.Copy(
            selectionPosition,
            this.selectionHighlight.selection.origin
          );
          meshPosition.copyFrom(this.selectionHighlight.mesh.position);
        });
        this.addEventListener("move-down", downListener);

        const upListener = this.createEventListener("move-up", () => {
          if (axes == "x") {
            this.selection.origin.x++;
            this.selectionHighlight.mesh.position.x++;
          }
          if (axes == "y") {
            this.selection.origin.y++;
            this.selectionHighlight.mesh.position.y++;
          }
          if (axes == "z") {
            this.selection.origin.z++;
            this.selectionHighlight.mesh.position.z++;
          }
          Vector3Like.Copy(
            selectionPosition,
            this.selectionHighlight.selection.origin
          );
          meshPosition.copyFrom(this.selectionHighlight.mesh.position);
        });
        this.addEventListener("move-up", upListener);

        const inActiveListener = this.axisControls.createEventListener(
          "inactive",
          ({ detail: inactiveAxes }) => {
            if (inactiveAxes != axes) return;
            Vector3Like.Copy(
              selectionPosition,
              this.selectionHighlight.selection.origin
            );
            meshPosition.copyFrom(this.selectionHighlight.mesh.position);

            this.axisControls.removeEventListener("inactive", inActiveListener);
            this.removeEventListener("move-down", downListener);
            this.removeEventListener("move-up", upListener);
          }
        );
        this.axisControls.addEventListener("inactive", inActiveListener);
      }
    );
    this.axisControls.addEventListener("active", activeListener);
  }
}
