import { mat4, vec3, vec4 } from 'gl-matrix';
import { getIntersection, loadTextureFromCanvas, wrapText } from './utils';
import textContent from './content/text.txt';

export interface Geometry {
  vertexCount: number;
  positions: number[];
  positionBuffer: WebGLBuffer;
  textureCoordinates: number[];
  textureBuffer: WebGLBuffer;
  normals: number[];
  normalBuffer: WebGLBuffer;
  indices: number[];
  indexBuffer: WebGLBuffer;
  modelMatrix: mat4;
  texture: WebGLTexture;
  textureSamplerLocation: WebGLUniformLocation;
  checkIntersection(eye: [number, number, number], ray: [number, number, number]): void;
}

export function createGeometry(
  gl: WebGLRenderingContext,
  shaderProgram: WebGLProgram,
  geometryDistance: number,
  geometryRotation: number[],
  geometryLocalRotation: number[],
): Geometry {
  const positions = [
    // Front
    -1.0, -1.0, 0.1, 1.0, -1.0, 0.1, 1.0, 1.0, 0.1, -1.0, 1.0, 0.1,
  ];
  const positionBuffer = createPositionBuffer(gl, positions);

  const textureCoordinates = [
    // Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ];
  const textureBuffer = createTextureBuffer(gl, textureCoordinates);

  const normals = [
    // Front
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
  ];
  const normalBuffer = createNormalBuffer(gl, normals);

  const indices = [
    // Front
    0, 1, 2, 0, 2, 3,
  ];
  const indexBuffer = createIndexBuffer(gl, indices);

  const modelMatrix = mat4.create();
  mat4.rotateY(modelMatrix, modelMatrix, geometryRotation[1]);
  mat4.rotateX(modelMatrix, modelMatrix, geometryRotation[0]);
  mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -geometryDistance]);
  mat4.rotateX(modelMatrix, modelMatrix, geometryLocalRotation[0]);
  mat4.rotateY(modelMatrix, modelMatrix, geometryLocalRotation[1]);
  mat4.rotateZ(modelMatrix, modelMatrix, geometryLocalRotation[2]);
  mat4.scale(modelMatrix, modelMatrix, [3.0, 3.0, 3.0]);

  const textureSamplerLocation = gl.getUniformLocation(shaderProgram, 'textureSampler');

  if (textureSamplerLocation === null) {
    throw new Error('Cannot locate texture sampler in shader');
  }

  const textCanvasSize = 256;
  const ctx = initTextCanvas(textCanvasSize);
  let texture = writeTextCanvas(gl, ctx, textContent);

  return {
    vertexCount: indices.length,
    positions,
    positionBuffer,
    textureCoordinates,
    textureBuffer,
    normals,
    normalBuffer,
    indices,
    indexBuffer,
    modelMatrix,
    get texture() {
      return texture;
    },
    textureSamplerLocation,
    checkIntersection: (eye, ray) => {
      const triangles = getTriangles(positions, indices, modelMatrix);

      triangles.forEach(triangle => {
        const intersection = getIntersection(eye, ray, triangle);

        if (intersection) {
          const localPosition = vec3.create();
          const invertedModalMatrix = mat4.create();

          mat4.invert(invertedModalMatrix, modelMatrix);
          vec3.transformMat4(localPosition, new Float32Array(intersection), invertedModalMatrix);

          const canvasX = (localPosition[0] + 1) * (textCanvasSize / 2);
          const canvasY = (-localPosition[1] + 1) * (textCanvasSize / 2);

          texture = writeTextCanvas(gl, ctx, textContent, [canvasX, canvasY]);
        }
      });
    },
  };
}

function createPositionBuffer(gl: WebGLRenderingContext, positions: number[]): WebGLBuffer {
  const positionBuffer = gl.createBuffer();

  if (!positionBuffer) {
    throw new Error('Cannot create position buffer');
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return positionBuffer;
}

function createTextureBuffer(gl: WebGLRenderingContext, textureCoordinates: number[]): WebGLBuffer {
  const textureBuffer = gl.createBuffer();

  if (!textureBuffer) {
    throw new Error('Cannot create texture buffer');
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

  return textureBuffer;
}

function createNormalBuffer(gl: WebGLRenderingContext, normals: number[]): WebGLBuffer {
  const normalBuffer = gl.createBuffer();

  if (!normalBuffer) {
    throw new Error('Cannot create normal buffer');
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

  return normalBuffer;
}

function createIndexBuffer(gl: WebGLRenderingContext, indices: number[]): WebGLBuffer {
  const indexBuffer = gl.createBuffer();

  if (!indexBuffer) {
    throw new Error('Cannot create index buffer');
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return indexBuffer;
}

function initTextCanvas(size: number): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Cannot initialize 2D context');
  }

  return ctx;
}

function writeTextCanvas(
  gl: WebGLRenderingContext,
  ctx: CanvasRenderingContext2D,
  text: string,
  highlight?: [number, number],
): WebGLTexture {
  const fontSize = 24;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.font = `bold ${fontSize}px serif`;

  const words = wrapText(ctx, text, 0, 0, ctx.canvas.width, fontSize);

  words.forEach(([word, left, top, right, bottom]) => {
    if (highlight && highlight[0] >= left && highlight[0] <= right && highlight[1] >= top && highlight[1] <= bottom) {
      ctx.fillStyle = 'red';
    } else {
      ctx.fillStyle = 'black';
    }

    ctx.fillText(word, left, top + fontSize);
  });

  const texture = loadTextureFromCanvas(gl, ctx.canvas);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  return texture;
}

function getTriangles(positions: number[], indices: number[], modelMatrix: mat4): vec3[][] {
  let triangle: vec3[] = [];
  const triangles: vec3[][] = [];

  indices.forEach(index => {
    const position = positions.slice(index * 3, index * 3 + 3);
    triangle.push(vec3.fromValues(position[0], position[1], position[2]));

    if (triangle.length === 3) {
      const x = vec3.create();
      const y = vec3.create();
      const z = vec3.create();

      vec3.transformMat4(x, new Float32Array(triangle[0]), modelMatrix);
      vec3.transformMat4(y, new Float32Array(triangle[1]), modelMatrix);
      vec3.transformMat4(z, new Float32Array(triangle[2]), modelMatrix);

      triangles.push([x, y, z]);
      triangle = [];
    }
  });

  return triangles;
}
