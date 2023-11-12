import vertexShaderSource from './shaders/vertex.glsl';
import fragmentShaderSource from './shaders/fragment.glsl';
import { degToRad, getRandom, loadShader, screenToRay } from './utils';
import { createGeometry } from './geometry';
import { render } from './rendering';
import { createCamera } from './camera';
import { mat4 } from 'gl-matrix';

function main() {
  const canvas = document.getElementById('mainCanvas');

  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Canvas not found');
  }

  const gl = canvas.getContext('webgl');

  if (!gl) {
    throw new Error('Cannot initialize WebGL');
  }

  const shaderProgram = createShaderProgram(gl);

  const geometries = new Array(64).fill(0).map((_, index, array) => {
    const step = 360 / array.length;
    const randomDistance = getRandom(10, 30);
    const randomRotationX = getRandom(-25, 25);
    const randomRotationY = getRandom(index * step, (index + 1) * step);
    const randomLocalRotation = [getRandom(0, 15), getRandom(0, 15), getRandom(0, 15)];

    return createGeometry(
      gl,
      shaderProgram,
      randomDistance,
      [degToRad(randomRotationX), degToRad(randomRotationY)],
      randomLocalRotation,
    );
  });

  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'positionAttribute');
  const vertexTextureAttribute = gl.getAttribLocation(shaderProgram, 'textureCoordinateAttribute');
  const vertexNormalAttribute = gl.getAttribLocation(shaderProgram, 'normalAttribute');

  const camera = createCamera(gl, shaderProgram, canvas, [0.0, 0.0, 0.0]);

  let then = 0;
  let rotation = 0;
  const rotationSpeed = 5.0;

  const update = (time: number) => {
    const now = time * 0.001;
    const deltaTime = now - then;
    then = now;

    rotation += deltaTime * rotationSpeed;
    camera.rotate(degToRad(rotation));

    const { left, top, width, height } = canvas.getBoundingClientRect();
    const invertedProjection = mat4.create();
    const invertedView = mat4.create();

    mat4.invert(invertedProjection, camera.projectionMatrix);
    mat4.invert(invertedView, camera.viewMatrix);

    const ray = screenToRay([mouseX, mouseY], [left, top, width, height], invertedProjection, invertedView);

    geometries.forEach(geometry => {
      geometry.checkIntersection(camera.cameraPosition, ray);
    });

    render(
      gl,
      {
        background: [0.0, 0.0, 0.0, 1.0],
        shaderProgram,
        vertexPositionAttribute,
        vertexTextureAttribute,
        vertexNormalAttribute,
        camera,
      },
      geometries,
    );

    requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
}

function createShaderProgram(gl: WebGLRenderingContext): WebGLProgram {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  const shaderProgram = gl.createProgram();

  if (!shaderProgram) {
    throw new Error('Cannot create shader program');
  }

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    const shaderProgramLog = gl.getProgramInfoLog(shaderProgram);

    throw new Error(`Cannot create shader program: ${shaderProgramLog}`);
  }

  return shaderProgram;
}

try {
  main();
} catch (error) {
  console.error(error);
}
