#version 300 es
precision highp float;
#define varying in
#define texture2D texture
#define gl_FragColor FragColor
out vec4 FragColor;

uniform sampler2D tMap;
uniform float uAlpha;
uniform float uWidth;
varying vec2 vUv;

vec4 sampleColor(vec2 uv) {
  vec4 color = texture2D(tMap, uv);
  
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    color = vec4(0.0);
  }
  
  return color;
}

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

void main() {
  vec3 tex = sampleColor(vUv).rgb;

  // float signedDist = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;
  float sigDist = median(tex.r, tex.g, tex.b) - 0.5;
  float d = fwidth(sigDist);
  float alpha = smoothstep(-d, d, sigDist);

  float fill = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);

  // stroke
  float border = fwidth(sigDist);
  float outline = smoothstep(0.0, border, sigDist);
  outline *= 1. - smoothstep(uWidth - border, uWidth, sigDist);

  // float c = fill * outline;
  // if (c < 0.01) discard;
  // gl_FragColor.rgb = vec3(c * 0.8);

  gl_FragColor.rgb = vec3(fill * 0.8);
  gl_FragColor.a = alpha * uAlpha;
}