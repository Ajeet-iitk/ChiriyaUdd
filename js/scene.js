/* ==========================================================================
   The courtyard sky — canvas: dusk gradient, hills, fireflies, and a flock
   that grows every time you get a name right.
   ========================================================================== */

const TAU = Math.PI * 2;

function readVar(name){
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export class Scene {
  constructor(canvas){
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: true });
    this.cache = document.createElement("canvas");
    this.cacheCtx = this.cache.getContext("2d");
    this.w = 0; this.h = 0; this.dpr = 1;
    this.fireflies = [];
    this.birds = [];
    this.stars = [];
    this.t = 0;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.theme = document.documentElement.dataset.theme || "dark";
    this.nextAmbient = 4;

    this.resize();
    window.addEventListener("resize", () => this.resize(), { passive: true });

    this._last = performance.now();
    this._raf = requestAnimationFrame(this._loop = this._loop.bind(this));
    document.addEventListener("visibilitychange", () => {
      if(document.hidden) cancelAnimationFrame(this._raf);
      else { this._last = performance.now(); this._raf = requestAnimationFrame(this._loop); }
    });
  }

  refresh(){
    this.theme = document.documentElement.dataset.theme || "dark";
    this._build();
  }

  resize(){
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const w = window.innerWidth, h = window.innerHeight;
    this.dpr = dpr; this.w = w; this.h = h;
    for(const c of [this.canvas, this.cache]){
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this._seed();
    this._build();
  }

  _seed(){
    const count = this.reduced ? 8 : Math.round(Math.min(34, this.w / 42));
    this.fireflies = Array.from({ length: count }, (_, i) => ({
      x: Math.random(), y: 0.42 + Math.random() * 0.52,
      ax: 0.008 + Math.random() * 0.03, ay: 0.006 + Math.random() * 0.02,
      sp: 0.1 + Math.random() * 0.22, ph: Math.random() * TAU,
      r: 0.8 + Math.random() * 1.5, a: 0.35 + Math.random() * 0.5,
    }));
    this.stars = Array.from({ length: this.reduced ? 20 : 70 }, () => ({
      x: Math.random(), y: Math.random() * 0.62,
      r: Math.random() * 1.1 + 0.3, ph: Math.random() * TAU, sp: 0.6 + Math.random(),
    }));
  }

  _build(){
    const ctx = this.cacheCtx, w = this.w, h = this.h, d = this.dpr;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const dark = this.theme === "dark";
    const sky1 = readVar("--sky-1"), sky2 = readVar("--sky-2"), sky3 = readVar("--sky-3");
    const sun = readVar("--sun"), hill1 = readVar("--hill-1"), hill2 = readVar("--hill-2"), hill3 = readVar("--hill-3");
    this.colors = { marigold: readVar("--marigold"), ink: readVar("--ink") };

    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, sky1);
    g.addColorStop(0.52, sky2);
    g.addColorStop(1, sky3);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // stars
    if(dark){
      for(const s of this.stars){
        ctx.globalAlpha = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(s.ph));
        ctx.fillStyle = "#fff4e2";
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // sun / moon glow
    const sx = w * 0.71, sy = h * (dark ? 0.28 : 0.24), sr = Math.min(w, h) * 0.2;
    const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    sg.addColorStop(0, this._rgba(sun, dark ? 0.95 : 0.9));
    sg.addColorStop(0.16, this._rgba(sun, dark ? 0.7 : 0.62));
    sg.addColorStop(0.42, this._rgba(sun, 0.13));
    sg.addColorStop(1, this._rgba(sun, 0));
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, TAU);
    ctx.fill();

    const disc = Math.min(w, h) * (dark ? 0.037 : 0.045);
    ctx.fillStyle = this._rgba(sun, dark ? 0.85 : 0.72);
    ctx.beginPath();
    ctx.arc(sx, sy, disc, 0, TAU);
    ctx.fill();

    // layered hills
    const layers = [
      { c: hill1, a: dark ? 0.65 : 0.55, base: 0.82, amp: 0.05, f: 0.0016, p: 0.4 },
      { c: hill2, a: dark ? 0.8 : 0.65, base: 0.89, amp: 0.045, f: 0.0022, p: 2.1 },
      { c: hill3, a: 0.95, base: 0.965, amp: 0.03, f: 0.0031, p: 4.4 },
    ];
    for(const L of layers){
      ctx.beginPath();
      ctx.moveTo(0, h);
      for(let x = 0; x <= w; x += 8){
        const y = h * L.base
          + Math.sin(x * L.f + L.p) * h * L.amp
          + Math.sin(x * L.f * 2.7 + L.p * 1.7) * h * L.amp * 0.3;
        if(x === 0) ctx.lineTo(0, y); else ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.globalAlpha = L.a;
      ctx.fillStyle = L.c;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // a distant treeline, hand-drawn
    ctx.fillStyle = this._rgba(hill3, 0.9);
    const treeY = h * 0.845;
    for(let i = 0; i < 26; i++){
      const x = (i / 25) * w + Math.sin(i * 7.3) * 14;
      const hh = 8 + (Math.sin(i * 3.1) + 1) * 9;
      ctx.beginPath();
      ctx.moveTo(x - 7, treeY + 8);
      ctx.lineTo(x, treeY - hh);
      ctx.lineTo(x + 7, treeY + 8);
      ctx.closePath();
      ctx.fill();
    }

    // tiny courtyard rooftops on the horizon
    ctx.fillStyle = this._rgba(hill3, 0.75);
    for(let i = 0; i < 5; i++){
      const x = w * (0.06 + i * 0.085), y = h * 0.858;
      ctx.fillRect(x, y, 26, 12);
      ctx.beginPath();
      ctx.moveTo(x - 4, y);
      ctx.lineTo(x + 13, y - 9);
      ctx.lineTo(x + 30, y);
      ctx.closePath();
      ctx.fill();
    }

    // horizon haze
    const hz = ctx.createLinearGradient(0, h * 0.62, 0, h);
    hz.addColorStop(0, this._rgba(sun, 0));
    hz.addColorStop(0.6, this._rgba(sun, dark ? 0.05 : 0.1));
    hz.addColorStop(1, this._rgba(sky1, 0));
    ctx.fillStyle = hz;
    ctx.fillRect(0, h * 0.62, w, h * 0.38);
  }

  _rgba(hex, a){
    hex = (hex || "").trim();
    if(hex.startsWith("#")){
      let h = hex.slice(1);
      if(h.length === 3) h = h.split("").map(c => c + c).join("");
      const n = parseInt(h, 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    }
    if(hex.startsWith("rgb")) return hex;
    return `rgba(255,200,140,${a})`;
  }

  spawnBirds(n = 3, fromBottom = false){
    const marigold = this.colors?.marigold || "#ffc56e";
    const ink = this.colors?.ink || "#f6eee3";
    for(let i = 0; i < n; i++){
      const dir = Math.random() < 0.5 ? 1 : -1;
      this.birds.push({
        x: dir === 1 ? -30 - Math.random() * 140 : this.w + 30 + Math.random() * 140,
        y: (fromBottom ? 0.58 : 0.14) * this.h + Math.random() * (fromBottom ? 0.18 : 0.4) * this.h,
        vx: dir * (28 + Math.random() * 48),
        vy: -8 - Math.random() * 20,
        s: 8 + Math.random() * 12,
        ph: Math.random() * TAU,
        flap: 0.9 + Math.random() * 0.9,
        life: 1,
        color: Math.random() < 0.55 ? marigold : ink,
        alpha: 0.35 + Math.random() * 0.4,
        dir,
      });
    }
    if(this.birds.length > 60) this.birds.splice(0, this.birds.length - 60);
  }

  _loop(now){
    this._raf = requestAnimationFrame(this._loop);
    const dt = Math.min(0.05, (now - this._last) / 1000 || 0);
    this._last = now;
    if(document.hidden) return;
    this.t += dt;

    const ctx = this.ctx, w = this.w, h = this.h, d = this.dpr;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(this.cache, 0, 0, w, h);

    // fireflies
    const marigold = this.colors?.marigold || "#ffc56e";
    for(const f of this.fireflies){
      const px = (f.x + Math.sin(this.t * f.sp + f.ph) * f.ax) * w;
      const py = (f.y + Math.cos(this.t * f.sp * 0.8 + f.ph) * f.ay) * h;
      const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(this.t * 1.4 + f.ph * 2));
      const r = f.r * (2.6 + tw * 1.5);
      const g = ctx.createRadialGradient(px, py, 0, px, py, r * 3.4);
      g.addColorStop(0, this._rgba(marigold, 0.55 * tw * f.a));
      g.addColorStop(0.35, this._rgba(marigold, 0.16 * tw * f.a));
      g.addColorStop(1, this._rgba(marigold, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, r * 3.4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = this._rgba("#fff6e8", 0.55 * f.a * tw);
      ctx.beginPath();
      ctx.arc(px, py, f.r * 0.75, 0, TAU);
      ctx.fill();
    }

    // flock
    for(let i = this.birds.length - 1; i >= 0; i--){
      const b = this.birds[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.ph += dt * b.flap * 6;
      if(b.x < -180 || b.x > w + 180 || b.y < -80) { this.birds.splice(i, 1); continue; }
      this._bird(ctx, b, marigold);
    }

    // ambient life
    this.nextAmbient -= dt;
    if(this.nextAmbient <= 0 && this.birds.length < 6){
      this.spawnBirds(1 + Math.floor(Math.random() * 2));
      this.nextAmbient = 9 + Math.random() * 14;
    }
  }

  _bird(ctx, b, marigold){
    const wing = Math.sin(b.ph);
    const s = b.s;
    ctx.save();
    ctx.translate(b.x, b.y);
    if(b.dir < 0) ctx.scale(-1, 1);
    ctx.strokeStyle = this._rgba(b.color, b.alpha * b.life);
    ctx.lineWidth = Math.max(1.1, s * 0.12);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(-s, 0);
    ctx.quadraticCurveTo(-s * 0.42, -wing * s * 0.75, 0, -s * 0.05);
    ctx.quadraticCurveTo(s * 0.42, -wing * s * 0.75, s, 0);
    ctx.stroke();
    ctx.restore();
  }
}
