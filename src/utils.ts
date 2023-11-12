import { mat4, vec3, vec4 } from 'gl-matrix';

export const RAY_CASTING_PRECISION = 0.0000001;

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

export function loadTextureFromCanvas(gl: WebGLRenderingContext, canvas: HTMLCanvasElement): WebGLTexture {
  const texture = gl.createTexture();

  if (!texture) {
    throw new Error('Cannot create texture');
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

  if (isPowerOf2(canvas.width) && isPowerOf2(canvas.height)) {
    gl.generateMipmap(gl.TEXTURE_2D);
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

  return texture;
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

export function setTextureAttribute(
  gl: WebGLRenderingContext,
  textureBuffer: WebGLBuffer,
  vertexTextureAttribute: number,
): void {
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
  gl.vertexAttribPointer(vertexTextureAttribute, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexTextureAttribute);
}

export function setNormalAttribute(
  gl: WebGLRenderingContext,
  normalBuffer: WebGLBuffer,
  vertexNormalAttribute: number,
) {
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexNormalAttribute);
}

export function degToRad(degree: number): number {
  return (degree * Math.PI) / 180;
}

export function getRandom(from: number, to: number) {
  return Math.floor(Math.random() * (to - from + 1) + from);
}

export function isPowerOf2(value: number) {
  return (value & (value - 1)) === 0;
}

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  textX: number,
  textY: number,
  maxWidth: number,
  lineHeight: number,
): [string, number, number, number, number][] {
  const words = text.split(' ');
  const wordsWithPositions: [string, number, number, number, number][] = [];

  let x = textX;
  let y = textY;

  words.forEach(word => {
    const metrics = ctx.measureText(`${word} `);
    const nextWidth = metrics.width + x;

    if (nextWidth <= maxWidth) {
      wordsWithPositions.push([word, x, y, nextWidth, y + lineHeight]);
      x = nextWidth;
    } else {
      x = metrics.width;
      y += lineHeight;
      wordsWithPositions.push([word, 0, y, metrics.width, y + lineHeight]);
    }
  });

  return wordsWithPositions;
}

export function getIntersection(
  origin: [number, number, number],
  ray: [number, number, number],
  triangle: vec3[],
): [number, number, number] | undefined {
  const edge1 = vec3.create();
  const edge2 = vec3.create();
  const h = vec3.create();

  vec3.sub(edge1, triangle[1], triangle[0]);
  vec3.sub(edge2, triangle[2], triangle[0]);
  vec3.cross(h, ray, edge2);
  const a = vec3.dot(edge1, h);

  if (a > -RAY_CASTING_PRECISION && a < RAY_CASTING_PRECISION) {
    return undefined;
  }

  const s = vec3.create();
  vec3.sub(s, origin, triangle[0]);
  const u = vec3.dot(s, h);

  if (u < 0 || u > a) {
    return undefined;
  }

  const q = vec3.create();
  vec3.cross(q, s, edge1);
  const v = vec3.dot(ray, q);

  if (v < 0 || u + v > a) {
    return undefined;
  }

  const t = vec3.dot(edge2, q) / a;
  if (t > RAY_CASTING_PRECISION) {
    const out = vec3.create();
    vec3.add(out, origin, [ray[0] * t, ray[1] * t, ray[2] * t]);
    return [out[0], out[1], out[2]];
  }

  return undefined;
}

export function screenToRay(
  screen: [number, number],
  viewport: [number, number, number, number],
  invertedProjection: mat4,
  invertedView: mat4,
): [number, number, number] {
  const [left, top, width, height] = viewport;
  const [x, y] = screen;

  const out = vec4.fromValues((2 * (x - left)) / width - 1, ((2 * (y - top)) / height - 1) * -1, 1, 1);

  vec4.transformMat4(out, out, invertedProjection);
  out[3] = 0;
  vec4.transformMat4(out, out, invertedView);

  const ray = vec3.normalize(vec3.create(), new Float32Array(out));
  return [ray[0], ray[1], ray[2]];
}
