import { mat4 } from 'gl-matrix';
import { setColorAttribute, setPositionAttribute } from './utils';
import { Geometry } from './geometry';
import { Camera } from './camera';

interface RenderOptions {
  shaderProgram: WebGLProgram;
  vertexPositionAttribute: number;
  vertexColorAttribute: number;
  camera: Camera;
}

export function render(gl: WebGLRenderingContext, options: RenderOptions, geometries: Geometry[]) {
  gl.clearColor(0.0, 0.5, 1.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  geometries.forEach(geometry => {
    renderGeometry(gl, options, geometry);
  });
}

function renderGeometry(gl: WebGLRenderingContext, options: RenderOptions, geometry: Geometry) {
  const { shaderProgram, vertexPositionAttribute, vertexColorAttribute, camera } = options;

  const modelViewMatrix = mat4.create();
  mat4.multiply(modelViewMatrix, camera.viewMatrix, geometry.modelMatrix);

  setPositionAttribute(gl, geometry.positionBuffer, vertexPositionAttribute);
  setColorAttribute(gl, geometry.colorBuffer, vertexColorAttribute);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indexBuffer);

  gl.useProgram(shaderProgram);
  gl.uniformMatrix4fv(camera.projectionMatrixLocation, false, camera.projectionMatrix);
  gl.uniformMatrix4fv(camera.modelViewMatrixLocation, false, modelViewMatrix);

  gl.drawElements(gl.TRIANGLES, geometry.vertexCount, gl.UNSIGNED_SHORT, 0);
}
