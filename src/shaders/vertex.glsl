attribute vec4 positionAttribute;
attribute vec4 colorAttribute;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying lowp vec4 colorVariable;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * positionAttribute;
  colorVariable = colorAttribute;
}
