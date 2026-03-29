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
    public useCustomMipmaps: boolean = true,
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
          let sumA = 0;
          let sumR = 0;
          let sumG = 0;
          let sumB = 0;
          let opaqueCount = 0;
          let totalCount = 0;

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

              totalCount++;
              sumA += a;

              if (a > 0) {
                if (a > maxA) maxA = a;
                sumR += r;
                sumG += g;
                sumB += b;
                opaqueCount++;
              }
            }
          }

          const di = (y * nextWidth + x) * 4;

          if (opaqueCount > 0) {
            nextData[di] = Math.round(sumR / opaqueCount);
            nextData[di + 1] = Math.round(sumG / opaqueCount);
            nextData[di + 2] = Math.round(sumB / opaqueCount);
            const majority = opaqueCount > totalCount / 2;
            nextData[di + 3] = majority ? Math.round(sumA / totalCount) : maxA;
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

    const engine = scene.getEngine() as any;

    if (engine.isWebGPU) {
      await this.initWebGPU(imgs, scene, engine);
    } else {
      await this.initWebGL(imgs, scene, engine);
    }
  }


  private async initWebGL(imgs: HTMLImageElement[], scene: Scene, engine: any) {
    const gl = engine._gl as WebGL2RenderingContext;
    if (!gl.TEXTURE_2D_ARRAY) {
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
      layers,
    );

    if (this.useCustomMipmaps) {
      for (let layer = 0; layer < layers; layer++) {
        const { levels, widths, heights } = this.createMipChainForImage(
          imgs[layer],
        );
        for (let level = 0; level < mipCount; level++) {
          gl.texSubImage3D(
            gl.TEXTURE_2D_ARRAY,
            level,
            0,
            0,
            layer,
            widths[level],
            heights[level],
            1,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            levels[level],
          );
        }
      }
    } else {
      for (let layer = 0; layer < layers; layer++) {
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
          imgs[layer],
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
      gl.LINEAR_MIPMAP_LINEAR,
    );

    const aniso =
      gl.getExtension("EXT_texture_filter_anisotropic") ||
      gl.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
      gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");

          const applySamplerState = () => {
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      if (aniso) {
        // Max out anisotropy — angled views stress this the most.
        const maxAniso = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number;
        gl.texParameterf(
          gl.TEXTURE_2D_ARRAY,
          aniso.TEXTURE_MAX_ANISOTROPY_EXT,
          maxAniso // use device max, typically 16
        );
      }
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
    };


    if (aniso) {
      const maxAniso = gl.getParameter(
        aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT,
      ) as number;
      gl.texParameterf(
        gl.TEXTURE_2D_ARRAY,
        aniso.TEXTURE_MAX_ANISOTROPY_EXT,
      maxAniso
      );
    }

    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);

    const itex = this.buildInternalTexture(engine, width, height);
    itex._hardwareTexture = {
      underlyingResource: texture,
      setUsage() {
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
      },
      reset() {
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
      },
      release() {
        gl.deleteTexture(texture);
      },
      set(_hw: any) {
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
      },
    } as any;

    this._texture = itex;
    this.updateSamplingMode(Texture.NEAREST_NEAREST_MIPNEAREST);
  }


  private async initWebGPU(
    imgs: HTMLImageElement[],
    scene: Scene,
    engine: any,
  ) {
    const device = engine._device as GPUDevice;
    if (!device) {
      throw new Error("WebGPU device not available on engine.");
    }

    const width = imgs[0].width;
    const height = imgs[0].height;
    this.width = width;
    this.height = height;
    const layers = imgs.length;

    const maxDim = Math.max(width, height);
    // WebGPU has no generateMipmap — always use the custom chain.
    const mipCount = Math.floor(Math.log2(maxDim)) + 1;

    const gpuTexture = device.createTexture({
      size: [width, height, layers],
      mipLevelCount: mipCount,
      dimension: "2d",
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    for (let layer = 0; layer < layers; layer++) {
      // If custom mipmaps are disabled we still build them manually since
      // WebGPU provides no equivalent to gl.generateMipmap().
      const { levels, widths, heights } = this.createMipChainForImage(
        imgs[layer],
      );

      for (let level = 0; level < mipCount; level++) {
        const w = widths[level];
        const h = heights[level];
        device.queue.writeTexture(
          { texture: gpuTexture, mipLevel: level, origin: [0, 0, layer] },
          levels[level] as any,
          { bytesPerRow: w * 4, rowsPerImage: h },
          [w, h, 1],
        );
      }
    }

    // A 2D-array view is what shaders sampling `texture2DArray` expect.
    const textureView = gpuTexture.createView({
      dimension: "2d-array",
      arrayLayerCount: layers,
      mipLevelCount: mipCount,
    } as any);

    const itex = this.buildInternalTexture(engine, width, height);
    itex._hardwareTexture = {
      underlyingResource: gpuTexture,
      // BabylonJS WebGPU reads .view when binding textures to bind groups.
      view: textureView,
      setUsage() {},
      reset() {},
      release() {
        gpuTexture.destroy();
      },
      set(_hw: any) {},
    } as any;

    this._texture = itex;
    this.updateSamplingMode(Texture.NEAREST_NEAREST_MIPNEAREST);
  }


  private buildInternalTexture(engine: any, width: number, height: number) {
    const itex = new InternalTexture(engine, InternalTextureSource.Unknown);
    itex.width = width;
    itex.height = height;
    itex.isReady = true;
    itex.generateMipMaps = true;
    itex.type = Engine.TEXTURETYPE_UNSIGNED_BYTE;
    itex.is2DArray = true;
    itex._premulAlpha = false;
    this.hasAlpha = true;
    return itex;
  }

  copy(scene: Scene) {
    return new ImageArrayTexture(this.imgs, scene, this.useCustomMipmaps);
  }
}
