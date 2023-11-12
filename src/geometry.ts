import { mat4 } from 'gl-matrix';

export interface Geometry {
  vertexCount: number;
  positions: number[];
  positionBuffer: WebGLBuffer;
  colors: number[];
  colorBuffer: WebGLBuffer;
  indices: number[];
  indexBuffer: WebGLBuffer;
  modelMatrix: mat4;
}

export function createGeometry(
  gl: WebGLRenderingContext,
  geometryDistance: number,
  geometryRotation: number[],
  color: number[],
): Geometry {
  const positions = [-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0];
  const positionBuffer = createPositionBuffer(gl, positions);

  const colors = [...color, ...color, ...color, ...color];
  const colorBuffer = createColorBuffer(gl, colors);

  const indices = [0, 1, 2, 0, 2, 3];
  const indexBuffer = createIndexBuffer(gl, indices);

  const modelMatrix = mat4.create();
  mat4.rotateY(modelMatrix, modelMatrix, geometryRotation[1]);
  mat4.rotateX(modelMatrix, modelMatrix, geometryRotation[0]);
  mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -geometryDistance]);

  return {
    vertexCount: indices.length,
    positions,
    positionBuffer,
    colors,
    colorBuffer,
    indices,
    indexBuffer,
    modelMatrix,
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

function createColorBuffer(gl: WebGLRenderingContext, colors: number[]): WebGLBuffer {
  const colorBuffer = gl.createBuffer();

  if (!colorBuffer) {
    throw new Error('Cannot create color buffer');
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return colorBuffer;
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
