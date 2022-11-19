precision highp float;

uniform float uAlpha;
uniform vec2 uImageSizes;
uniform vec2 uPlaneSizes;
uniform vec3 uColor;
uniform sampler2D tMap;

varying vec2 vUv;

void main() {
  gl_FragColor = vec4(vec3(uColor), uAlpha);
}
