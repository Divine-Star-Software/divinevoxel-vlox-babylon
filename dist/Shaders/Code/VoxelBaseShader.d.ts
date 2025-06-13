export declare class VoxelBaseShader {
    static GetVertex(props: {
        doAO: boolean;
    }): string;
    static DefaultLiquidFragmentMain: (doAO: boolean) => string;
    static DefaultFragmentMain: (doAO: boolean) => string;
    static GetFragment(main: string, top?: string): string;
}
