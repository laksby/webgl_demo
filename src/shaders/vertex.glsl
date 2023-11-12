attribute vec4 positionAttribute;
attribute vec2 textureCoordinateAttribute;
attribute vec3 normalAttribute;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;

varying highp vec2 textureCoordinate;
varying highp vec3 lighting;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * positionAttribute;
  textureCoordinate = textureCoordinateAttribute;

  highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
  highp vec3 directionalLightColor = vec3(1, 1, 1);
  highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

  highp vec4 transformedNormal = normalMatrix * vec4(normalAttribute, 1.0);
  highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
  lighting = ambientLight + (directionalLightColor * directional);
}
