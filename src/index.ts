// kernel-sentry — Real-time Linux kernel vulnerability scanner in your browser.
// Zero-dependency Worker that serves ONE self-contained HTML micro-product. The entire app
// (markup, styles, and logic) is authored by the agent and inlined below as a single document —
// no framework, no build step, no external requests.

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Kernel Sentry</title>
<style>
body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #121212; color: #e0e0e0; font-family: monospace; }
canvas { border: 2px solid #4caf50; }
@media (prefers-color-scheme: light) {
  body { background: #ffffff; color: #000000; }
  canvas { border-color: #f44336; }
}
</style>
</head>
<body>
<canvas id="vulnCanvas"></canvas>
<script>
const canvas = document.getElementById('vulnCanvas');
const ctx = canvas.getContext('webgl2', { antialias: false });
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const vertexShaderSource = \`
attribute vec4 a_position;
void main() {
  gl_Position = a_position;
}
\`;

const fragmentShaderSource = \`
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
void main() {
  vec2 st = gl_FragCoord.xy/u_resolution;
  float n = sin(st.x * 10.0 + u_time) * cos(st.y * 10.0 + u_time);
  gl_FragColor = vec4(abs(n), 0.5 + 0.5 * n, 0.5 - 0.5 * n, 1.0);
}
\`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
const timeUniformLocation = gl.getUniformLocation(program, "u_time");

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = [
  -1, -1,
   1, -1,
  -1,  1,
  -1,  1,
   1, -1,
   1,  1,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

function resizeCanvasToDisplaySize(canvas) {
  const displayWidth  = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}

function render(time) {
  time *= 0.001;
  resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const size = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform1f(timeUniformLocation, time);
  const primitiveType = gl.TRIANGLES;
  const count = 6;
  gl.drawArrays(primitiveType, offset, count);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
</script>
</body>
</html>`;

export default {
  async fetch(): Promise<Response> {
    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  },
};
