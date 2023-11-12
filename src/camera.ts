import { mat4 } from 'gl-matrix';

export interface Camera {
  cameraPosition: [number, number, number];
  projectionMatrix: mat4;
  projectionMatrixLocation: WebGLUniformLocation;
  viewMatrix: mat4;
  modelViewMatrixLocation: WebGLUniformLocation;
  normalMatrixLocation: WebGLUniformLocation;
  rotate(value: number): void;
}

export function createCamera(
  gl: WebGLRenderingContext,
  shaderProgram: WebGLProgram,
  canvas: HTMLCanvasElement,
  cameraPosition: [number, number, number],
): Camera {
  const projectionMatrix = createProjectionMatrix(canvas);
  const viewMatrix = createViewMatrix(cameraPosition);

  const projectionMatrixLocation = gl.getUniformLocation(shaderProgram, 'projectionMatrix');
  const modelViewMatrixLocation = gl.getUniformLocation(shaderProgram, 'modelViewMatrix');
  const normalMatrixLocation = gl.getUniformLocation(shaderProgram, 'normalMatrix');

  if (projectionMatrixLocation === null || modelViewMatrixLocation === null || normalMatrixLocation === null) {
    throw new Error('Cannot locate uniform matrices in shader');
  }

  return {
    cameraPosition,
    projectionMatrix,
    projectionMatrixLocation,
    viewMatrix,
    modelViewMatrixLocation,
    normalMatrixLocation,
    rotate: value => {
      mat4.identity(viewMatrix);
      mat4.translate(viewMatrix, viewMatrix, cameraPosition);
      mat4.rotateY(viewMatrix, viewMatrix, value);
      mat4.invert(viewMatrix, viewMatrix);
    },
  };
}

function createProjectionMatrix(canvas: HTMLCanvasElement): mat4 {
  const fieldOfView = (45 * Math.PI) / 180;
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  return projectionMatrix;
}

function createViewMatrix(cameraPosition: [number, number, number]): mat4 {
  const viewMatrix = mat4.create();

  mat4.translate(viewMatrix, viewMatrix, cameraPosition);
  mat4.invert(viewMatrix, viewMatrix);

  return viewMatrix;
}
