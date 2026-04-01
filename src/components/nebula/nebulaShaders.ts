/** Shader mais leve: menos octavas FBM, menos camadas, menos estrelas — melhor FPS. */
export const nebulaVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const nebulaFragmentShader = /* glsl */ `
precision mediump float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uIntensity;
varying vec2 vUv;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
  p3 += dot(p3, p3.yxz + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float hash13(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.87, 0.5, -0.5, 0.87);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.05 + vec2(100.0);
    a *= 0.5;
  }
  return v;
}

float ridged(vec2 p, float t) {
  float sum = 0.0;
  float a = 0.52;
  mat2 rot = mat2(0.86, 0.52, -0.52, 0.86);
  for (int i = 0; i < 3; i++) {
    float n = noise(p + vec2(t * 0.02, -t * 0.017) * float(i + 1));
    n = 1.0 - abs(n * 2.0 - 1.0);
    n *= n;
    sum += n * a;
    p = rot * p * 2.08 + vec2(37.0, 17.0);
    a *= 0.5;
  }
  return sum;
}

vec3 scatterTint(float density, float thin, vec3 coreCol, vec3 edgeCol) {
  float t = clamp(thin * 1.4, 0.0, 1.0);
  return mix(coreCol, edgeCol, t) * (0.55 + 0.45 * density);
}

float starLayer(vec2 uv, float scale, float t, float thresh) {
  vec2 grid = uv * scale;
  vec2 id = floor(grid);
  vec2 gv = fract(grid) - 0.5;
  float h = hash13(id);
  float h2 = hash13(id + vec2(17.0, 9.0));
  float mask = step(thresh, h);
  float sz = mix(0.002, 0.008, h2);
  float d = length(gv + vec2(sin(h * 40.0), cos(h * 33.0)) * 0.08);
  float tw = 0.62 + 0.38 * sin(t * (1.8 + h * 3.0) + h * 50.0);
  float s = smoothstep(sz, 0.0, d) * tw;
  float halo = smoothstep(sz * 4.0, 0.0, d) * 0.2 * tw;
  return (s + halo) * mask;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  float t = uTime;
  float tSlow = t * 0.55;
  float tMed = t * 0.88;

  vec2 flow = vec2(sin(tSlow * 0.11), cos(tSlow * 0.09)) * 0.15;
  vec2 pDrift = p + flow;

  vec2 q = vec2(
    fbm(pDrift * 0.72 + vec2(0.0, tMed * 0.095)),
    fbm(pDrift * 0.72 + vec2(5.2, 1.3) + tMed * 0.082)
  );
  vec2 r = vec2(
    fbm(pDrift * 1.02 + q * 2.1 + vec2(1.7 + t * 0.062, 9.2)),
    fbm(pDrift * 0.92 + q * 2.1 + vec2(8.3, 2.8) + t * 0.056)
  );

  float warp = fbm(pDrift * 0.5 + r * 1.18 + t * 0.041);
  vec2 pWarp = pDrift + r * 0.55 + vec2(warp * 0.35, warp * -0.28);

  float dust = ridged(pWarp * 1.15 + t * 0.035, t);
  float f = fbm(pWarp * 0.52 + t * 0.042);
  float nBill = fbm(pWarp * 1.1 + vec2(t * 0.03, -t * 0.027));
  float bill = smoothstep(0.35, 0.85, nBill) * smoothstep(1.0, 0.4, nBill);

  float layerA = fbm(pWarp * 1.32 + vec2(t * 0.052, -t * 0.044));
  float layerB = fbm(pWarp * 2.05 + r + vec2(-t * 0.046, t * 0.053));
  float layerC = fbm(pWarp * 3.1 + q * 0.42 + t * 0.031);

  float nebula = mix(layerA * 0.5 + layerB * 0.38, layerC, 0.26);
  nebula = smoothstep(0.08, 0.93, nebula) * f * 0.9 + layerA * 0.34;
  nebula *= 1.0 - dust * 0.28;

  float haze = smoothstep(0.0, 1.0, fbm(pWarp * 0.45 + t * 0.019)) * 0.42;
  nebula = mix(nebula, nebula * 0.65 + haze + bill * 0.25, 0.52);

  float density = clamp(nebula * 1.15 + f * 0.2, 0.0, 1.2);
  float thin = 1.0 - density;

  vec3 coreHot = vec3(0.54, 0.24, 0.72);
  vec3 coreMid = vec3(0.3, 0.16, 0.56);
  vec3 edgeCool = vec3(0.1, 0.16, 0.5);
  vec3 violetThin = vec3(0.32, 0.28, 0.75);

  vec3 col = mix(coreMid, edgeCool, f);
  col = mix(col, coreHot, layerB * layerC * 0.95);
  col = mix(col, vec3(0.52, 0.14, 0.55), layerB * 0.75);
  col = mix(col, violetThin, thin * 0.55 + layerC * 0.3);

  float hueShift = 0.08 * sin(t * 0.07) + 0.04 * sin(t * 0.11 + p.x * 2.0);
  col.r += hueShift * 0.06;
  col.b += hueShift * 0.05;

  col = scatterTint(density, thin, col, violetThin * 0.85);

  float breathe = 0.92 + 0.08 * sin(t * 0.31);
  col *= (nebula * 1.08 + 0.07) * uIntensity * breathe;

  float depth = 1.0 - length(p) * 0.34;
  col *= 0.48 + 0.52 * depth;

  float emissive = smoothstep(0.55, 0.98, layerA * layerB) * 0.22;
  col += vec3(0.42, 0.3, 0.76) * emissive;
  col += vec3(0.34, 0.28, 0.76) * smoothstep(0.4, 0.95, bill) * 0.12;

  vec2 starUv = uv * vec2(aspect, 1.0);
  float stars = starLayer(starUv + t * 0.0021, 88.0, t, 0.965);
  stars += starLayer(starUv * 1.25 - t * 0.0015, 108.0, t * 1.05, 0.975);
  col += vec3(0.82, 0.9, 1.0) * stars * 1.25;

  col = pow(max(col, vec3(0.0)), vec3(0.9));

  gl_FragColor = vec4(col, 1.0);
}
`;
