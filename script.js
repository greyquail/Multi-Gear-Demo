// -------- basic gear model --------
class Gear {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.radius = options.radius;       // visual radius of pitch circle
    this.teeth = options.teeth;         // number of teeth
    this.omega = options.omega;         // angular velocity (rad/s)
    this.color = options.color || "#4fd";
    this.angle0 = options.angle0 || 0;  // starting angle
  }

  angleAtTime(t) {
    return this.angle0 + this.omega * t;
  }
}

// -------- create gears (more teeth on the big cylinder) --------
const gears = [];

// Gear 1: many teeth (like the rollers in your video)
const gear1 = new Gear({
  x: 200,
  y: 200,
  radius: 90,
  teeth: 80,          // increase this for even more teeth
  omega: 2 * Math.PI, // 1 rev / second
  color: "#00e5ff"
});
gears.push(gear1);

// Gear 2 meshed with gear 1
const gear2 = new Gear({
  x: gear1.x + gear1.radius + 70, // center distance ~ r1 + r2
  y: 200,
  radius: 70,
  teeth: 60,
  omega: 0, // will be computed from gear1
  color: "#ff4081"
});
gears.push(gear2);

// Gear 3 meshed with gear 2
const gear3 = new Gear({
  x: gear2.x + gear2.radius + 60,
  y: 200,
  radius: 50,
  teeth: 40,
  omega: 0, // will be computed from gear2
  color: "#ffe082"
});
gears.push(gear3);

// apply gear‑ratio rule: ω2 = −ω1 * N1 / N2
for (let i = 1; i < gears.length; i++) {
  const gPrev = gears[i - 1];
  const g = gears[i];
  g.omega = -gPrev.omega * (gPrev.teeth / g.teeth);
}

// -------- drawing helpers --------
const canvas = document.getElementById("gearCanvas");
const ctx = canvas.getContext("2d");

function drawGear(ctx, gear, timeSec) {
  const angle = gear.angleAtTime(timeSec);

  const innerRadius = gear.radius - 12; // base circle
  const toothDepth = 14;                // how far teeth stick out
  const toothWidth = 6;                 // width of each tooth
  const step = (2 * Math.PI) / gear.teeth;

  ctx.save();
  ctx.translate(gear.x, gear.y);
  ctx.rotate(angle);

  // draw inner disc
  ctx.beginPath();
  ctx.arc(0, 0, innerRadius, 0, 2 * Math.PI);
  ctx.fillStyle = "#202020";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = gear.color;
  ctx.stroke();

  // draw teeth as small rectangles
  ctx.fillStyle = gear.color;
  for (let i = 0; i < gear.teeth; i++) {
    ctx.save();
    ctx.rotate(i * step);

    // rectangle starting from outer rim of inner circle
    const toothStart = innerRadius;
    ctx.beginPath();
    ctx.rect(
      toothStart,
      -toothWidth / 2,
      toothDepth,
      toothWidth
    );
    ctx.fill();
    ctx.restore();
  }

  // small center hole
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, 2 * Math.PI);
  ctx.fillStyle = "#000";
  ctx.fill();

  ctx.restore();
}

// -------- animation loop --------
let startTime = null;
const timeEl = document.getElementById("timeSec");
const g1RotEl = document.getElementById("g1Rot");
const g2RotEl = document.getElementById("g2Rot");
const g3RotEl = document.getElementById("g3Rot");

function render(timestamp) {
  if (startTime === null) startTime = timestamp;
  const t = (timestamp - startTime) / 1000; // seconds since start

  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw each gear
  gears.forEach(gear => drawGear(ctx, gear, t));

  // update info text: rotations = angle / (2π)
  const rot1 = gear1.angleAtTime(t) / (2 * Math.PI);
  const rot2 = gear2.angleAtTime(t) / (2 * Math.PI);
  const rot3 = gear3.angleAtTime(t) / (2 * Math.PI);

  timeEl.textContent = t.toFixed(2);
  g1RotEl.textContent = rot1.toFixed(2);
  g2RotEl.textContent = rot2.toFixed(2);
  g3RotEl.textContent = rot3.toFixed(2);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
