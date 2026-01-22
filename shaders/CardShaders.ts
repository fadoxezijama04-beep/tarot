
export const CardBackShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor1: { value: [0.1, 0.05, 0.25] }, // Deep Purple
    uColor2: { value: [0.77, 0.63, 0.35] }, // Gold
    uResolution: { value: [1.0, 1.0] },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying vec2 vUv;

    // Simple noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }

    void main() {
      vec2 uv = vUv;
      float n = noise(uv * 10.0 + uTime * 0.5);
      
      // Intricate gold pattern simulation
      float pattern = sin(uv.x * 50.0 + n) * cos(uv.y * 50.0 + n);
      pattern = smoothstep(0.4, 0.5, abs(pattern));
      
      vec3 finalColor = mix(uColor1, uColor2, pattern * 0.5 + n * 0.2);
      
      // Grain/Noise
      float grain = (hash(uv + uTime) - 0.5) * 0.1;
      finalColor += grain;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};
