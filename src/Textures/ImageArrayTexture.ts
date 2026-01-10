import { Engine } from "@babylonjs/core/Engines/engine";
import {
  InternalTexture,
  InternalTextureSource,
} from "@babylonjs/core/Materials/Textures/internalTexture";
import { Scene } from "@babylonjs/core/scene";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

export class ImageArrayTexture extends Texture {
  width: number;
  height: number;

  constructor(
    public imgs: HTMLImageElement[] | null,
    public scene: Scene,
    public useCustomMipmaps: boolean = true
  ) {
    super(null, scene);

    void this.init();
  }

  private createMipChainForImage(img: HTMLImageElement): {
    levels: Uint8Array[];
    widths: number[];
    heights: number[];
  } {
    const baseWidth = img.width;
    const baseHeight = img.height;

    const maxDim = Math.max(baseWidth, baseHeight);
    const mipCount = Math.floor(Math.log2(maxDim)) + 1;

    const levels: Uint8Array[] = [];
    const widths: number[] = [];
    const heights: number[] = [];

    const canvas = document.createElement("canvas");
    canvas.width = baseWidth;
    canvas.height = baseHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, baseWidth, baseHeight);
    ctx.drawImage(img, 0, 0);

    let currentWidth = baseWidth;
    let currentHeight = baseHeight;
    let currentData = ctx.getImageData(0, 0, baseWidth, baseHeight).data as any;

    levels.push(new Uint8Array(currentData));
    widths.push(currentWidth);
    heights.push(currentHeight);

    for (let level = 1; level < mipCount; level++) {
      const nextWidth = Math.max(1, currentWidth >> 1);
      const nextHeight = Math.max(1, currentHeight >> 1);
      const nextData = new Uint8Array(nextWidth * nextHeight * 4);

      for (let y = 0; y < nextHeight; y++) {
        for (let x = 0; x < nextWidth; x++) {
          let maxA = 0;
          let sumR = 0;
          let sumG = 0;
          let sumB = 0;
          let count = 0;

          for (let dy = 0; dy < 2; dy++) {
            const sy = y * 2 + dy;
            if (sy >= currentHeight) continue;

            for (let dx = 0; dx < 2; dx++) {
              const sx = x * 2 + dx;
              if (sx >= currentWidth) continue;

              const si = (sy * currentWidth + sx) * 4;
              const r = currentData[si];
              const g = currentData[si + 1];
              const b = currentData[si + 2];
              const a = currentData[si + 3];

              if (a > 0) {
                if (a > maxA) maxA = a;

                sumR += r;
                sumG += g;
                sumB += b;
                count++;
              }
            }
          }

          const di = (y * nextWidth + x) * 4;
          if (maxA > 0 && count > 0) {
            nextData[di] = Math.round(sumR / count);
            nextData[di + 1] = Math.round(sumG / count);
            nextData[di + 2] = Math.round(sumB / count);
            nextData[di + 3] = maxA;
          } else {
            nextData[di] = 0;
            nextData[di + 1] = 0;
            nextData[di + 2] = 0;
            nextData[di + 3] = 0;
          }
        }
      }

      levels.push(nextData);
      widths.push(nextWidth);
      heights.push(nextHeight);

      currentWidth = nextWidth;
      currentHeight = nextHeight;
      currentData = nextData;
    }

    return { levels, widths, heights };
  }

  private async init() {
    const imgs = this.imgs;
    const scene = this.scene;
    if (!imgs || imgs.length === 0) return;

    const gl = (scene.getEngine() as any)._gl as WebGL2RenderingContext;
    if (!(gl as any).TEXTURE_2D_ARRAY) {
      throw new Error("TEXTURE_2D_ARRAY is not supported on this device.");
    }

    const width = imgs[0].width;
    const height = imgs[0].height;
    this.width = width;
    this.height = height;
    const layers = imgs.length;

    const maxDim = Math.max(width, height);
    const mipCount = Math.floor(Math.log2(maxDim)) + 1;

    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    gl.texStorage3D(
      gl.TEXTURE_2D_ARRAY,
      mipCount,
      gl.RGBA8,
      width,
      height,
      layers
    );

    if (this.useCustomMipmaps) {
      for (let layer = 0; layer < layers; layer++) {
        const img = imgs[layer];

        const { levels, widths, heights } = this.createMipChainForImage(img);

        for (let level = 0; level < mipCount; level++) {
          const w = widths[level];
          const h = heights[level];
          const data = levels[level];

          gl.texSubImage3D(
            gl.TEXTURE_2D_ARRAY,
            level,
            0,
            0,
            layer,
            w,
            h,
            1,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            data
          );
        }
      }
    } else {
      for (let layer = 0; layer < layers; layer++) {
        const img = imgs[layer];
        gl.texSubImage3D(
          gl.TEXTURE_2D_ARRAY,
          0,
          0,
          0,
          layer,
          width,
          height,
          1,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          img
        );
      }
      gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
    }

    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(
      gl.TEXTURE_2D_ARRAY,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );
    const anisotropicEnabled =
      gl.getExtension("EXT_texture_filter_anisotropic") ||
      gl.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
      gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");

    if (anisotropicEnabled) {
      const maxAniso = gl.getParameter(
        anisotropicEnabled.MAX_TEXTURE_MAX_ANISOTROPY_EXT
      ) as number;
      const desired = Math.min(8, maxAniso);

      gl.texParameterf(
        gl.TEXTURE_2D_ARRAY,
        anisotropicEnabled.TEXTURE_MAX_ANISOTROPY_EXT,
        desired
      );
    }

    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);

    const itex = new InternalTexture(
      scene.getEngine(),
      InternalTextureSource.Unknown
    );
    itex.width = width;
    itex.height = height;
    itex.isReady = true;
    itex.generateMipMaps = true;
    itex.type = Engine.TEXTURETYPE_UNSIGNED_BYTE;
    itex.is2DArray = true;
    itex._premulAlpha = false;
    this.hasAlpha = true;

    itex._hardwareTexture = {
      setUsage() {
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
      },
      reset() {
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
      },
      release() {
        gl.deleteTexture(texture);
      },
      set(_hardware: any) {
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
      },
      underlyingResource: texture,
    } as any;

    this._texture = itex;

    this.updateSamplingMode(Texture.NEAREST_NEAREST_MIPNEAREST);
  }

  copy(scene: Scene) {
    return new ImageArrayTexture(this.imgs, scene, this.useCustomMipmaps);
  }
}
