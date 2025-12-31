// ----------- Gear model -----------
// Radii are computed from tooth count using a common module so
// the tooth pitch is identical on all gears (they mesh cleanly).

const moduleSize = 4; // pixels per tooth / 2 (affects overall scale)

class Gear {
  constructor({ x = 0, y = 0, teeth, omega = 0, angle0 = 0 }) {
    this.x = x;
    this.y = y;
    this.teeth = teeth;
    this.radius = (teeth * moduleSize) / 2; // pitch radius
    this.omega = omega; // rad/s
    this.angle0 = angle0;
  }

  angleAtTime(t) {
    return this.angle0 + this.omega * t;
  }
}

// ---------- build 10‑gear train ----------
const gears = [];

// base configuration: you can tweak tooth counts here
const toothCounts = [50, 40, 60, 45, 70, 35, 55, 42, 65, 30];

// gear 1: driving gear
const startY = 160;
let currentX = 80;

const gear1 = new Gear({
  x: currentX,
  y: startY,
  teeth: toothCounts[0],
  omega: 2 * Math.PI, // 1 rev per second
  angle0: 0
});
gears.push(gear1);

// build remaining 9 gears, meshed in a row
for (let i = 1; i < 10; i++) {
  const prev = gears[i - 1];
  const g = new Gear({
    x: 0, // temp, will set below
    y: startY,
    teeth: toothCounts[i],
    omega: 0,
    angle0: 0
  });

  // center distance equals sum of pitch radii for proper mesh
  currentX += prev.radius + g.radius;
  g.x = currentX;

  // gear ratio: ω2 = −ω1 * N1 / N2
  g.omega = -prev.omega * (prev.teeth / g.teeth);

  gears.push(g);
}

// ---------- Canvas + drawing ----------
const canvas = document.getElementById("gearCanvas");
const ctx = canvas.getContext("2d");

function metallicGradient(x, y, rOuter) {
  const grad = ctx.createRadialGradient(
    x - rOuter * 0.3,
    y - rOuter * 0.3,
    rOuter * 0.1,
    x,
    y,
    rOuter
  );
  // steel / titanium tones
  grad.addColorStop(0, "#dfe7ff");
  grad.addColorStop(0.35, "#b0bacf");
  grad.addColorStop(0.7, "#606a7a");
  grad.addColorStop(1, "#252932");
  return grad;
}

function drawGear(gear, t) {
  const angle = gear.angleAtTime(t);

  const baseRadius = gear.radius - moduleSize * 1.4;
  const toothDepth = moduleSize * 1.6;
  const toothWidth = moduleSize * 0.9;
  const step = (2 * Math.PI) / gear.teeth;

  ctx.save();
  ctx.translate(gear.x, gear.y);
  ctx.rotate(angle);

  // inner disc with metallic shading
  const grad = metallicGradient(0, 0, gear.radius + toothDepth);
  ctx.fillStyle = grad;
  ctx.strokeStyle = "#151820";
  ctx.lineWidth = 2.2;

  ctx.beginPath();
  ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // teeth
  ctx.fillStyle = "#cfd7e5";
  for (let i = 0; i < gear.teeth; i++) {
    ctx.save();
    ctx.rotate(i * step);

    ctx.beginPath();
    ctx.rect(
      baseRadius,
      -toothWidth / 2,
      toothDepth,
      toothWidth
    );
    ctx.fill();

    ctx.restore();
  }

  // rim highlight
  ctx.beginPath();
  ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // center hub + bolt circle for detail
  ctx.beginPath();
  ctx.arc(0, 0, moduleSize * 2.3, 0, Math.PI * 2);
  ctx.fillStyle = "#1c2028";
  ctx.fill();

  const boltR = moduleSize * 3.4;
  const bolts = 6;
  ctx.fillStyle = "#b7c3d7";
  for (let i = 0; i < bolts; i++) {
    const a = (i * 2 * Math.PI) / bolts;
    const bx = boltR * Math.cos(a);
    const by = boltR * Math.sin(a);
    ctx.beginPath();
    ctx.arc(bx, by, moduleSize * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ---------- animation loop ----------
let startTime = null;
const timeEl = document.getElementById("timeSec");
const g1RotEl = document.getElementById("g1Rot");
const gLastRotEl = document.getElementById("gLastRot");

function render(timestamp) {
  if (startTime === null) startTime = timestamp;
  const t = (timestamp - startTime) / 1000; // seconds

  // smooth, clear frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw all gears
  for (const g of gears) {
    drawGear(g, t);
  }

  // rotation info (rev = angle / 2π)
  const first = gears[0];
  const last = gears[gears.length - 1];
  const r1 = first.angleAtTime(t) / (2 * Math.PI);
  const rLast = last.angleAtTime(t) / (2 * Math.PI);

  timeEl.textContent = t.toFixed(2);
  g1RotEl.textContent = r1.toFixed(2);
  gLastRotEl.textContent = rLast.toFixed(2);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
