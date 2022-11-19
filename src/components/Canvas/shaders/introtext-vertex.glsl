#version 300 es
#define attribute in
#define varying out
#define PI 3.1415926535897932384626433832795

attribute vec2 uv;
attribute vec3 position;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float uZoom;
uniform vec2 uViewportSizes;
uniform float uScroll;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 newPosition = modelViewMatrix * vec4(position, 1.0);
  newPosition.z += uZoom - uScroll; 
  
  newPosition.z += sin(newPosition.x / uViewportSizes.x * PI + PI / 2.0) * (uZoom - uScroll) * 2.;

  gl_Position = projectionMatrix * newPosition;
}