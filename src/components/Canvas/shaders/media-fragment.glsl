precision highp float;

#define PI 3.1415926535897932384626433832795

// uniform float uTime;
uniform float uAlpha;
uniform float uProgress;
uniform vec2 uImageSizes;
uniform vec2 uPlaneSizes;
uniform sampler2D tMap;

varying vec2 vUv;

vec4 sampleColor(vec2 uv) {
  vec4 color = texture2D(tMap, uv);
  
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    color = vec4(0.0);
  }
  
  return color;
}

mat2 rotate(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

const float angle1 = PI *0.25;
const float angle2 = -PI *0.75;

const float intensity = 50.0;

void main() {
  vec2 ratio = vec2(
    min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
    min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
  );
 
  vec2 newUv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

  // vec2 uvDivided = fract(newUv * vec2(intensity, 1.0));
  // vec2 uvDisplaced1 = newUv + rotate(PI / 4.0) * uvDivided * uProgress * 0.1;
  // vec2 uvDisplaced2 = newUv + rotate(PI / 4.0) * uvDivided * (1.0 - uProgress) * 0.1;

  // vec4 t1 = sampleColor(uvDisplaced1);
  // vec4 t2 = sampleColor(uvDisplaced2);

  // vec4 color = mix(t1, t2, uProgress);

  vec4 color = sampleColor(newUv);

  // gl_FragColor.rgb = color.rgb;
  // gl_FragColor.a = uAlpha;
  gl_FragColor = vec4(color.rgb, uAlpha);
}
