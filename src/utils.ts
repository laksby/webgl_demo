export function loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error('Cannot create shader');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const shaderLog = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);

    throw new Error(`Cannot compile shader: ${shaderLog}`);
  }

  return shader;
}

export function setPositionAttribute(
  gl: WebGLRenderingContext,
  positionBuffer: WebGLBuffer,
  vertexPositionAttribute: number,
): void {
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexPositionAttribute);
}

export function setColorAttribute(
  gl: WebGLRenderingContext,
  colorBuffer: WebGLBuffer,
  vertexColorAttribute: number,
): void {
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexColorAttribute);
}

export function degToRad(degree: number): number {
  return (degree * Math.PI) / 180;
}

export function getRandom(from: number, to: number) {
  return Math.floor(Math.random() * (to - from + 1) + from);
}
