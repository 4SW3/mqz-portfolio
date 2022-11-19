#define PI 3.1415926535897932384626433832795

attribute vec2 uv;
attribute vec3 position;

uniform float uTime;
uniform float uProgress;
uniform float uSpeed;
uniform vec2 uViewportSizes;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 newPosition = modelViewMatrix * vec4(position, 1.0);
  float z = cos(uTime + newPosition.x * mix(1.0, 3.0, 0.5));
  newPosition.z += z * position.x * uProgress;
  newPosition.z += sin(newPosition.y / uViewportSizes.y * PI + PI / 2.0) * abs(uSpeed);
  gl_Position = projectionMatrix * newPosition;
}
