'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── OVNI y proyectiles enemigos ───────────────────────────────────────────────
class EnemyBullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * 190;
    this.vy = Math.sin(angle) * 190;
    this.radius = 4;
    this.ttl = 4;
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0 || this.x < 0 || this.x > W || this.y < 0 || this.y > H)
      this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

class UFO {
  constructor() {
    const fromLeft = Math.random() < 0.5;
    this.x = fromLeft ? -20 : W + 20;
    this.y = rand(80, H - 80);
    this.vx = fromLeft ? 85 : -85;
    this.radius = 18;
    this.shootTimer = 1;
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.shootTimer -= dt;
    if (this.x < -25 || this.x > W + 25) this.dead = true;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 3, 18, 7, 0, 0, Math.PI * 2);
    ctx.moveTo(-9, -3);
    ctx.lineTo(-5, -10);
    ctx.lineTo(5, -10);
    ctx.lineTo(9, -3);
    ctx.stroke();
    ctx.restore();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Polígono irregular
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = this.strokeColor || '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Estrella fugaz ────────────────────────────────────────────────────────────
class ShootingStar extends Asteroid {
  constructor(x, y) {
    super(x, y, 2);
    this.vx *= 3;
    this.vy *= 3;
    this.ttl = 6;
    this.strokeColor = '#ffd166';
  }

  update(dt) {
    super.update(dt);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  split() { return []; }

  draw() {
    ctx.save();
    ctx.globalAlpha = Math.min(1, this.ttl);
    const speed = Math.hypot(this.vx, this.vy);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx / speed * 45, this.y - this.vy / speed * 45);
    ctx.stroke();
    super.draw();
    ctx.restore();
  }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
const SPEED_DURATION = 5;
const SHIELD_DURATION = 5;
const SHIELD_RADIUS = 25;

class Ship {
  constructor() { this.reset(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = 12;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.speedTime     = 0;
    this.shieldTime    = 0;
    this.dead          = false;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;

    const ROT   = 3.5;   // rad/s
    const THRUST = 260;  // px/s²
    const DRAG   = 0.987;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * dt;
      this.vy += Math.sin(this.angle) * THRUST * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    const boostedDt = Math.min(dt, this.speedTime);
    const moveTime = dt + boostedDt;
    this.x = wrap(this.x + this.vx * moveTime, W);
    this.y = wrap(this.y + this.vy * moveTime, H);
    this.speedTime = Math.max(0, this.speedTime - dt);
    this.shieldTime = Math.max(0, this.shieldTime - dt);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;
    return [new Bullet(ox, oy, this.angle)];
  }

  draw() {
    if (this.dead) return;
    if (this.shieldTime > 0) {
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, SHIELD_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Parpadeo durante invencibilidad de reaparición
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    // Silueta clásica: triángulo con muesca trasera
    ctx.beginPath();
    ctx.moveTo( 20,  0);   // nariz
    ctx.lineTo(-12, -9);   // ala izquierda
    ctx.lineTo( -7,  0);   // muesca trasera
    ctx.lineTo(-12,  9);   // ala derecha
    ctx.closePath();
    ctx.stroke();

    // Llama del propulsor
    if (this.thrusting && Math.random() > 0.35) {
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-8 - rand(6, 14), 0);
      ctx.lineTo(-8,  4);
      ctx.strokeStyle = 'rgba(255, 130, 0, 0.85)';
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Power-up Velocidad ────────────────────────────────────────────────────────
class SpeedPowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 13;
    this.ttl = 10;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = '#4df5ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-6, -6);
    ctx.lineTo(0, 0);
    ctx.lineTo(-6, 6);
    ctx.moveTo(1, -6);
    ctx.lineTo(7, 0);
    ctx.lineTo(1, 6);
    ctx.stroke();
    ctx.restore();
  }
}

// ── Power-up Escudo ────────────────────────────────────────────────────────────
class ShieldPowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 13;
    this.ttl = 10;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.moveTo(0, -8);
    ctx.lineTo(7, -4);
    ctx.lineTo(6, 4);
    ctx.lineTo(0, 9);
    ctx.lineTo(-6, 4);
    ctx.lineTo(-7, -4);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let ship, bullets, enemyBullets, asteroids, particles, ufo, ufoTimer;
let score, lives, level;
let state;      // 'playing' | 'dead' | 'gameover'
let deadTimer;
let speedPowerUp, powerUpTimer;
let shieldPowerUp, shieldPowerUpTimer;

function spawnSpeedPowerUp() {
  for (let i = 0; i < 40; i++) {
    const x = rand(30, W - 30);
    const y = rand(45, H - 30);
    const position = { x, y };
    if (dist(position, ship) < 100 ||
        asteroids.some(a => dist(position, a) < a.radius + 25) ||
        (shieldPowerUp && dist(position, shieldPowerUp) < 35)) continue;
    speedPowerUp = new SpeedPowerUp(x, y);
    return;
  }
  powerUpTimer = 2; // Reintentar si no hay un lugar libre.
}

function spawnShieldPowerUp() {
  for (let i = 0; i < 40; i++) {
    const x = rand(30, W - 30);
    const y = rand(45, H - 30);
    const position = { x, y };
    if (dist(position, ship) < 100 ||
        asteroids.some(a => dist(position, a) < a.radius + 25) ||
        (speedPowerUp && dist(position, speedPowerUp) < 35)) continue;
    shieldPowerUp = new ShieldPowerUp(x, y);
    return;
  }
  shieldPowerUpTimer = 2;
}

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i <= count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    asteroids.push(i === count ? new ShootingStar(x, y) : new Asteroid(x, y, 3));
  }
}

function initGame() {
  ship          = new Ship();
  bullets   = [];
  enemyBullets = [];
  asteroids = [];
  particles = [];
  ufo = null;
  ufoTimer = 7;
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  speedPowerUp = null;
  powerUpTimer = 8;
  shieldPowerUp = null;
  shieldPowerUpTimer = 12;
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets   = [];
  enemyBullets = [];
  particles = [];
  ufo = null;
  ufoTimer = 7;
  const remainingSpeed = ship.speedTime;
  const remainingShield = ship.shieldTime;
  ship.reset();
  ship.speedTime = remainingSpeed;
  ship.shieldTime = remainingShield;
  speedPowerUp = null;
  powerUpTimer = 8;
  shieldPowerUp = null;
  shieldPowerUpTimer = 12;
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  enemyBullets = [];
  ufo = null;
  ufoTimer = 7;
  ship.speedTime = 0;
  ship.shieldTime = 0;
  speedPowerUp = null;
  powerUpTimer = 8;
  shieldPowerUp = null;
  shieldPowerUpTimer = 12;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    asteroids = asteroids.filter(a => !a.dead);
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  enemyBullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  asteroids = asteroids.filter(a => !a.dead);
  particles.forEach(p => p.update(dt));

  if (ufo) {
    ufo.update(dt);
    if (ufo.dead) {
      ufo = null;
      ufoTimer = rand(7, 11);
    } else if (ufo.shootTimer <= 0) {
      const angle = Math.atan2(ship.y - ufo.y, ship.x - ufo.x);
      enemyBullets.push(new EnemyBullet(ufo.x, ufo.y, angle));
      ufo.shootTimer = 1.6;
    }
  } else {
    ufoTimer -= dt;
    if (ufoTimer <= 0) ufo = new UFO();
  }

  if (speedPowerUp) {
    speedPowerUp.ttl -= dt;
    if (dist(ship, speedPowerUp) < ship.radius + speedPowerUp.radius) {
      ship.speedTime = SPEED_DURATION;
      speedPowerUp = null;
      powerUpTimer = rand(10, 15);
    } else if (speedPowerUp.ttl <= 0) {
      speedPowerUp = null;
      powerUpTimer = rand(8, 12);
    }
  } else {
    powerUpTimer -= dt;
    if (powerUpTimer <= 0) spawnSpeedPowerUp();
  }

  if (shieldPowerUp) {
    shieldPowerUp.ttl -= dt;
    if (dist(ship, shieldPowerUp) < ship.radius + shieldPowerUp.radius) {
      ship.shieldTime = SHIELD_DURATION;
      shieldPowerUp = null;
      shieldPowerUpTimer = rand(12, 18);
    } else if (shieldPowerUp.ttl <= 0) {
      shieldPowerUp = null;
      shieldPowerUpTimer = rand(8, 12);
    }
  } else {
    shieldPowerUpTimer -= dt;
    if (shieldPowerUpTimer <= 0) spawnShieldPowerUp();
  }

  bullets   = bullets.filter(b => !b.dead);
  enemyBullets = enemyBullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);

  // Bala vs asteroide
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += POINTS[a.size];
        explode(a.x, a.y, a.size * 5);
        newAsteroids.push(...a.split());
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Bala de la nave vs OVNI
  if (ufo) {
    for (const b of bullets) {
      if (dist(b, ufo) < b.radius + ufo.radius) {
        b.dead = true;
        score += 150;
        explode(ufo.x, ufo.y, 12);
        ufo = null;
        ufoTimer = rand(7, 11);
        break;
      }
    }
    bullets = bullets.filter(b => !b.dead);
  }

  // Nave vs asteroide
  if (ship.invincible <= 0) {
    for (const a of asteroids) {
      if (dist(ship, a) < ship.radius + a.radius * 0.82) {
        killShip();
        break;
      }
    }
  }

  // Proyectil enemigo vs nave
  if (state === 'playing') {
    for (const b of enemyBullets) {
      const hitRadius = ship.shieldTime > 0 ? SHIELD_RADIUS : ship.radius;
      if (dist(ship, b) < hitRadius + b.radius) {
        b.dead = true;
        if (ship.shieldTime <= 0 && ship.invincible <= 0) {
          killShip();
          break;
        }
      }
    }
    enemyBullets = enemyBullets.filter(b => !b.dead);
  }

  // Nivel completado
  if (state === 'playing' && asteroids.length === 0) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth   = 1.2;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo( 9,  0);
  ctx.lineTo(-6, -5);
  ctx.lineTo(-3,  0);
  ctx.lineTo(-6,  5);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

  if (ship.speedTime > 0) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#4df5ff';
    ctx.fillText(`VELOCIDAD  ${ship.speedTime.toFixed(1)}s`, 14, 50);
  }
  if (ship.shieldTime > 0) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#a78bfa';
    ctx.fillText(`ESCUDO  ${ship.shieldTime.toFixed(1)}s`, 14, 72);
  }
}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  bullets.forEach(b => b.draw());
  enemyBullets.forEach(b => b.draw());
  if (ufo) ufo.draw();
  if (speedPowerUp && state === 'playing') speedPowerUp.draw();
  if (shieldPowerUp && state === 'playing') shieldPowerUp.draw();
  ship.draw();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

initGame();
requestAnimationFrame(loop);
