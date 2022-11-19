precision highp float;

uniform float uAlpha;
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
 
float range(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
    float oldRange = oldMax - oldMin;
  float newRange = newMax - newMin;
  return (((oldValue - oldMin) * newRange) / oldRange) + newMin;
}

vec2 scaleUv(vec2 uv, vec2 scale, vec2 origin) {
    vec3 u = vec3(uv, 1.0);
  mat3 mo1 = mat3(
      1, 0, -origin.x,
    0, 1, -origin.y,
    0, 0, 1
  );
  mat3 mo2 = mat3(
      1, 0, origin.x,
    0, 1, origin.y,
    0, 0, 1
  );
  mat3 ms = mat3(
      1.0 / scale.x, 0, 0,
    0, 1.0 / scale.y, 0,
    0, 0, 1
  );
  u = u * mo1;
  u = u * ms;
  u = u * mo2;
  return u.xy;
}

vec2 translateUV(vec2 uv, vec2 translate) {
    vec3 u = vec3(uv, 1.0);
  mat3 mt = mat3(
      1, 0, -translate.x,
    0, 1, -translate.y,
    0, 0, 1
  );
  u = u * mt;
  return u.xy;
}

vec3 adjustBrightness(vec3 color, float value) {
  return color + value;
}

vec3 adjustContrast(vec3 color, float value) {
  return 0.5 + value * (color - 0.5);
}

vec3 adjustExposure(vec3 color, float value) {
  return (1.0 + value) * color;
}

vec3 adjustSaturation(vec3 color, float value) {
  // https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
  const vec3 luminosityFactor = vec3(0.2126, 0.7152, 0.0722);
  vec3 grayscale = vec3(dot(color, luminosityFactor));

  return mix(grayscale, color, 1.0 + value);
}

void main() {
  vec2 ratio = vec2(
    min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
    min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
  );
 
  vec2 newUv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

  vec2 videoUv = scaleUv(newUv, vec2(1.2), vec2(0.0));

  float blocks = 10.0;
  float x = floor(vUv.x * blocks) / blocks;
  float y = floor(vUv.y * blocks) / blocks;

  vec2 distortion = 0.1 * vec2(x, y);    

  vec4 tex = sampleColor(videoUv + distortion);

  vec3 color = adjustBrightness(tex.rgb, 0.5);
  color *= adjustContrast(color, 0.5);

  // gl_FragColor.rgb = tex.rgb + 0.25; 
  gl_FragColor.rgb = color;
  gl_FragColor.a = uAlpha;
}