// kernel-sentry — Interactive AI-driven insights directly in your browser.
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
body { margin: 0; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; background: #121212; color: #e0e0e0; }
canvas { border: 2px solid #444; }
@media (prefers-color-scheme: light) {
  body { background: #f9f9f9; color: #333; }
  canvas { border-color: #ddd; }
}
</style>
</head>
<body>
<canvas id="canvas"></canvas>
<script>
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let points = [];
let model = [];

function init() {
  for (let i = 0; i < 100; i++) {
    points.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, label: Math.random() > 0.5 ? 1 : -1 });
  }
  trainModel();
  requestAnimationFrame(draw);
}

function trainModel() {
  let learningRate = 0.01;
  let weights = [Math.random(), Math.random()];
  let bias = Math.random();

  for (let epoch = 0; epoch < 1000; epoch++) {
    for (let point of points) {
      let prediction = activate(weights[0] * point.x + weights[1] * point.y + bias);
      let error = point.label - prediction;
      weights[0] += learningRate * error * point.x;
      weights[1] += learningRate * error * point.y;
      bias += learningRate * error;
    }
  }

  model = { weights, bias };
}

function activate(x) {
  return x >= 0 ? 1 : -1;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = point.label === 1 ? '#673ab7' : '#ff9800';
    ctx.fill();
  });

  if (model.weights) {
    let x1 = 0;
    let y1 = (-model.bias - model.weights[0] * x1) / model.weights[1];
    let x2 = canvas.width;
    let y2 = (-model.bias - model.weights[0] * x2) / model.weights[1];

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#00bcd4';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  requestAnimationFrame(draw);
}

init();
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
