uniform sampler2D textureSampler;

varying highp vec2 textureCoordinate;
varying highp vec3 lighting;

void main() {
  highp vec4 texelColor = texture2D(textureSampler, textureCoordinate);

  gl_FragColor = vec4(texelColor.rgb * lighting, texelColor.a);
}
