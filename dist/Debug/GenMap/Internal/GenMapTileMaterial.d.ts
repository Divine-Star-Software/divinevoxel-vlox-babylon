import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { Scene } from "@babylonjs/core/scene";
export declare class GenMapTileMaterial {
    static Code: {
        Vertex: {
            GLSL: string;
        };
        Fragment: {
            GLSL: string;
        };
    };
    static create(scene: Scene): ShaderMaterial;
}
