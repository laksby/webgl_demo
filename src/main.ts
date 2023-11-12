import vertexShaderSource from './shaders/vertex.glsl';
import fragmentShaderSource from './shaders/fragment.glsl';
import { degToRad, getRandom, loadShader } from './utils';
import { createGeometry } from './geometry';
import { render } from './rendering';
import { createCamera } from './camera';

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

  const geometries = new Array(32).fill(0).map((_, index, array) => {
    const step = 360 / array.length;
    const randomDistance = getRandom(10, 30);
    const randomRotationX = getRandom(-25, 25);
    const randomRotationY = getRandom(index * step, (index + 1) * step);
    const randomColor = [getRandom(0.0, 1.0), getRandom(0.0, 1.0), getRandom(0.0, 1.0), 1.0];

    return createGeometry(gl, randomDistance, [degToRad(randomRotationX), degToRad(randomRotationY)], randomColor);
  });

  const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'positionAttribute');
  const vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'colorAttribute');

  const camera = createCamera(gl, shaderProgram, canvas, [0.0, 0.0, 0.0]);

  let then = 0;
  let rotation = 0;
  const rotationSpeed = 16.0;

  const update = (time: number) => {
    const now = time * 0.001;
    const deltaTime = now - then;
    then = now;

    rotation += deltaTime * rotationSpeed;
    camera.rotate(degToRad(rotation));

    render(
      gl,
      {
        shaderProgram,
        vertexPositionAttribute,
        vertexColorAttribute,
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
