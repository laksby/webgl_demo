import { mat4 } from 'gl-matrix';
import { setNormalAttribute, setPositionAttribute, setTextureAttribute } from './utils';
import { Geometry } from './geometry';
import { Camera } from './camera';

interface RenderOptions {
  background: [number, number, number, number];
  shaderProgram: WebGLProgram;
  vertexPositionAttribute: number;
  vertexTextureAttribute: number;
  vertexNormalAttribute: number;
  camera: Camera;
}

export function render(gl: WebGLRenderingContext, options: RenderOptions, geometries: Geometry[]) {
  const { background } = options;

  gl.clearColor(...background);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  geometries.forEach(geometry => {
    renderGeometry(gl, options, geometry);
  });
}

function renderGeometry(gl: WebGLRenderingContext, options: RenderOptions, geometry: Geometry) {
  const { shaderProgram, vertexPositionAttribute, vertexTextureAttribute, vertexNormalAttribute, camera } = options;

  const modelViewMatrix = mat4.create();
  mat4.multiply(modelViewMatrix, camera.viewMatrix, geometry.modelMatrix);

  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  setPositionAttribute(gl, geometry.positionBuffer, vertexPositionAttribute);
  setTextureAttribute(gl, geometry.textureBuffer, vertexTextureAttribute);
  setNormalAttribute(gl, geometry.normalBuffer, vertexNormalAttribute);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indexBuffer);

  gl.useProgram(shaderProgram);
  gl.uniformMatrix4fv(camera.projectionMatrixLocation, false, camera.projectionMatrix);
  gl.uniformMatrix4fv(camera.modelViewMatrixLocation, false, modelViewMatrix);
  gl.uniformMatrix4fv(camera.normalMatrixLocation, false, normalMatrix);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, geometry.texture);
  gl.uniform1i(geometry.textureSamplerLocation, 0);

  gl.drawElements(gl.TRIANGLES, geometry.vertexCount, gl.UNSIGNED_SHORT, 0);
}
