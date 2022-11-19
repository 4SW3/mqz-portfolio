precision highp float;

#define PI 3.1415926535897932384626433832795
#define NUM_OCTAVES 5

uniform float uAlpha;
uniform float uTime;
uniform float uProgress;
uniform float uTransition;
uniform vec2 uPlaneSizes;

varying vec2 vUv;

float rand(vec2 n) { 
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u*u*(3.0-2.0*u);
  
  float res = mix(
      mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
      mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
  return res*res;
}

float fbm(vec2 x) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100);
  // Rotate to reduce axial bias
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
  for (int i = 0; i < NUM_OCTAVES; ++i) {
    v += a * noise(x);
    x = rot * x * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

// vec3 rgb2hsb( in vec3 c ) {
//   vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
//   vec4 p = mix(vec4(c.bg, K.wz),
//                 vec4(c.gb, K.xy),
//                 step(c.b, c.g));
//   vec4 q = mix(vec4(p.xyw, c.r),
//                 vec4(c.r, p.yzx),
//                 step(p.x, c.r));
//   float d = q.x - min(q.w, q.y);
//   float e = 1.0e-10;
//   return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
//               d / (q.x + e),
//               q.x);
// }

// vec3 hsb2rgb( in vec3 c ) {
//   vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
//                             6.0)-3.0)-1.0,
//                     0.0,
//                     1.0 );
//   rgb = rgb*rgb*(3.0-2.0*rgb);
//   return c.z * mix(vec3(1.0), rgb, c.y);
// }

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 spectral_zucconi (float w) {
  float x = clamp(0.0, 1.0, (w - 400.0)/ 300.0);

  vec3 cs = vec3(2.54541723, 2.86670055, 2.29421995);
  vec3 xs = vec3(0.69548916, 0.49416934, 0.28269708);
  vec3 ys = vec3(0.02320775, 0.15936245, 0.53520021);
  
  vec3 z = cs * (x - xs);

  return (1.0 - z * z) - ys;
}

vec3 adjustSaturation(vec3 color, float value) {
  // https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
  const vec3 luminosityFactor = vec3(0.2126, 0.7152, 0.0722);
  vec3 grayscale = vec3(dot(color, luminosityFactor));

  return mix(grayscale, color, 1.0 + value);
}

// solid colors
// vec3 darkBlue = spectral_zucconi(450.0)
// vec3 green = spectral_zucconi(550.0);
// vec3 orange = spectral_zucconi(600.0);
// vec3 red = spectral_zucconi(650.0);

// taste the rainbow
// float wavelength = mix(400.0, 700.0, uv.x);
// gl_FragColor = vec4(spectral_zucconi(wavelength), 1.0);


void main() {
  // make the texture start in the center
  // vec2 uv = -1. + 2. * v_texcoord;
  vec2 uv = -1. + 2.0 * vUv;

  float time = uTime * uTransition;

  // if the resolution isn't square, this
  // will stop circles look like ovals
  // uv.y *= u_resolution.y / u_resolution.x;
  uv.y *= uPlaneSizes.y / uPlaneSizes.x;

  // making a center point between -0.1 and 0.1
  // using FBM and time
  vec2 center = vec2(
      mix(-0.1, 0.1, fbm(14.0 * uv - time * 0.02)),
      mix(-0.1, 0.1, fbm(15.0 * uv + time * 0.01))
  );    

  // make the mouse go between 0-1
  //   vec2 mouse = u_mouse / u_resolution;		

  // an additional -0.1 to 0.1 shift based on	mouse	
  // center += mix(vec2(-0.1, -0.1), vec2(0.1, 0.1), mouse);

  // work out each points distance from center
  float d = distance(uv, center);

  // expand circles
  d *= 10.0;

  // add noise
  d += 4. * fbm(10. * uv);

  // shift with time
  d += time * -0.1;

  // cut off start number so d is always between 0-1
  d = fract(d);

  // spectral_zucconi needs a number
  // between 400 and 700 so mix to get that color back
  float wavelength = mix(400.0, 700.0, d);
  vec3 caseColor = spectral_zucconi(wavelength);
  vec3 homeColor = vec3(adjustSaturation(caseColor, -0.5));
  vec3 color = mix(homeColor, caseColor, uTransition);
  
  gl_FragColor = vec4(color, uAlpha);
}
