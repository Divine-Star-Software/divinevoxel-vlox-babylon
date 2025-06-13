type shaderTypes = "vertex" | "frag";
export declare class DVEBRShaderStore {
    getShader(id: string, type: shaderTypes): string | null;
    storeShader(id: string, type: shaderTypes, shader: string): void;
    static getShader(id: string, type: shaderTypes): string | null;
    static storeShader(id: string, type: shaderTypes, shader: string): void;
    static _shaderData: Map<string, {
        uniforms: string[];
        attributes: string[];
    }>;
    static setShaderData(id: string, uniforms: string[], attributes: string[]): void;
    static getShaderData(id: string): {
        uniforms: string[];
        attributes: string[];
    } | undefined;
}
export {};
