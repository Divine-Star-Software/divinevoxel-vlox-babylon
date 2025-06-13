import { Scene } from "@babylonjs/core/scene";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
export declare class ImageArrayTexture extends Texture {
    imgs: HTMLImageElement[] | null;
    scene: Scene;
    width: number;
    height: number;
    constructor(imgs: HTMLImageElement[] | null, scene: Scene);
    copy(scene: Scene): ImageArrayTexture;
}
