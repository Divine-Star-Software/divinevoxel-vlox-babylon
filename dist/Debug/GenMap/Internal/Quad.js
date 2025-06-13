export class Quad {
    static GetQuad(meterSize = [16, 16]) {
        const positions = [
            //1
            0,
            0,
            0,
            //2
            meterSize[0],
            0,
            0,
            //3
            meterSize[0],
            0,
            meterSize[1],
            //3
            0,
            0,
            meterSize[1],
        ];
        const normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
        const indicies = [0, 1, 2, 2, 3, 0];
        const uvs = [
            //1
            0, 0,
            //2
            1, 0,
            //3
            1, 1,
            //4
            0, 1,
        ];
        return {
            positions,
            indicies,
            normals,
            uvs,
        };
    }
}
