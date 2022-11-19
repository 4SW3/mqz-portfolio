precision highp float;

#define ScanlineScale 0.50			//The scaling & thickness of the scanlines.
#define ScanlineIntensity 0.12		//The intensity of the scanlines.
#define ScanlineBrightness 2.		//The brightness of the scanlines.

#define VignetteRatio 1.77          //Sets the espect ratio of the vignette.
#define VignetteRadius 1.10         //Radius of the vignette effect. Lower values for stronger radial effect from center
#define VignetteAmount 0.25         //Strength of black edge occlusion. Increase for higher strength, decrease for lower.
#define VignetteSlope 16.           //How far away from the center the vignetting will start.

#define saturate(x) clamp(x,0.0,1.0)

uniform vec2 uResolution;
uniform float uTime;
uniform float uColor;

varying vec2 vUv;

const vec3 lumCoeff = vec3(0.2126729, 0.7151522, 0.0721750);

//Average relative luminance
float AvgLum(vec3 color) {
	return sqrt( dot(color*color, lumCoeff));
}

float Randomize(vec2 texcoord) {
  float seed = dot(texcoord, vec2(12.9898, 78.233));
  float sine = sin(seed);
  float noise = fract(sine * 43758.5453);

  return noise;
}

 // Subpixel Dithering to simulate more colors than your monitor can display. Smoothes gradiants, this can reduce color banding.
vec4 Dither(vec4 color, vec2 texcoord) {
    float ditherBits = 3.0;

    float noise = Randomize(texcoord);
    float ditherShift = (1.0 / (pow(2.0, ditherBits) - 1.0));
    float ditherHalfShift = (ditherShift * 0.5);
    ditherShift = ditherShift * noise - ditherHalfShift;

    color.rgb += ditherShift*vec3(-1, 1, -1);

    color.a = AvgLum(color.rgb);

    return color;
}

 //Darkens the edges of the screen, to make it look more like it was shot with a camera lens.
vec4 Vignette(vec4 color, vec2 texcoord) {
    vec2 VignetteCenter = vec2(0.500, 0.500);
    vec2 tc = texcoord - VignetteCenter;

    tc *= vec2((2560.0 / 1440.0), VignetteRatio);
    tc /= VignetteRadius;

    float v = dot(tc, tc);

    color.rgb *= (1.0 + pow(v, VignetteSlope * 0.5) * -VignetteAmount);

    return color;
}

//Scanlines to simulate the look of a CRT TV.
vec4 Scanlines(vec4 color, vec2 texcoord, vec2 fragcoord) {
    vec4 intensity;
    
    if (fract(fragcoord.x * 0.25) > ScanlineScale && fract(fragcoord.y * 0.5) > ScanlineScale) {
      intensity = vec4(0.0);
    }
    else {
   	  intensity = smoothstep(0.2, ScanlineBrightness, color) + normalize(vec4(color.xyz, AvgLum(color.xyz)));
    }

    float level = (4.0 - texcoord.x) * ScanlineIntensity;

    color = intensity * (0.5 - level) + color * 1.1;

    return color;
}

void main() {
  vec4 color = vec4(uColor);
  // color = Vignette(color, vUv);
  color = Scanlines(color, vUv, uResolution);
  color = Dither(color, vUv * uTime);
  gl_FragColor = vec4(color.rgb, 1.0);
}