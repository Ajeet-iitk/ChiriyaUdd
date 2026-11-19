/* ==========================================================================
   The home meadow — big birds strolling the bottom of the courtyard.
   Sarus cranes, a peacock, an ostrich, egrets and ducks. Feed them, shoo them,
   click one bird away, or shake the phone and send the whole flock up.
   ========================================================================== */

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const rnd = (a, b) => a + Math.random() * (b - a);

const CRANE = `
<svg viewBox="0 0 120 180" role="presentation">
  <g class="bird-flap">
    <path d="M34 100c-8-2-15 2-19 9 9-1 16 1 23 4z" fill="#8f95a3"/>
    <ellipse cx="54" cy="103" rx="34" ry="23" fill="#c9cdd6" stroke="#4a4555" stroke-opacity=".32" stroke-width="1.2"/>
    <path d="M29 101c12-8 31-10 47-4 5 2 6 6 3 9-12 6-30 8-45 3-5-2-7-5-5-8z" fill="#aeb3c0"/>
    <path d="M73 89c8-8 11-18 9-28-2-9 2-16 10-17 8-1 13 5 12 13-1 8-8 12-8 20"
      fill="none" stroke="#c9cdd6" stroke-width="13" stroke-linecap="round"/>
    <circle cx="95" cy="41" r="10" fill="#b7bbc6"/>
    <path d="M87 34c2-5 7-7 11-6" stroke="#d95c52" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M104 43l16 2-15 5z" fill="#8a7a6a"/>
    <circle cx="98" cy="39" r="1.8" fill="#2a1220"/>
  </g>
  <g stroke="#a96d51" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M44 124l-2 34M64 124l4 34"/>
    <path d="M38 158h8M64 158h9"/>
  </g>
</svg>`;

const PEACOCK = `
<svg viewBox="0 0 160 124" role="presentation">
  <g class="bird-fan">
    <path d="M78 80C58 46 36 34 16 38c4 27 23 46 46 52z" fill="#2f8f9a" opacity=".55"/>
    <path d="M82 80c20-34 42-46 62-42-4 27-23 46-46 52z" fill="#2f8f9a" opacity=".55"/>
    <path d="M80 76c-10-34-2-56 10-64 10 12 14 36 6 64z" fill="#37a89a" opacity=".5"/>
    <g>
      <circle cx="27" cy="48" r="6" fill="#ffc56e"/><circle cx="27" cy="48" r="2.6" fill="#1d3f4a"/>
      <circle cx="50" cy="34" r="6" fill="#ffc56e"/><circle cx="50" cy="34" r="2.6" fill="#1d3f4a"/>
      <circle cx="80" cy="24" r="6" fill="#ffc56e"/><circle cx="80" cy="24" r="2.6" fill="#1d3f4a"/>
      <circle cx="110" cy="34" r="6" fill="#ffc56e"/><circle cx="110" cy="34" r="2.6" fill="#1d3f4a"/>
      <circle cx="133" cy="48" r="6" fill="#ffc56e"/><circle cx="133" cy="48" r="2.6" fill="#1d3f4a"/>
    </g>
  </g>
  <g class="bird-flap">
    <ellipse cx="80" cy="84" rx="21" ry="16" fill="#2f8f9a" stroke="#153b44" stroke-opacity=".35" stroke-width="1.2"/>
    <path d="M66 84c7-6 19-8 28-4 4 2 4 5 1 7-8 4-20 5-27 1-3-1-4-3-2-4z" fill="#25808c"/>
    <path d="M88 74c6-12 10-19 15-23" fill="none" stroke="#2f8f9a" stroke-width="10" stroke-linecap="round"/>
    <circle cx="105" cy="48" r="8.5" fill="#2f8f9a"/>
    <path d="M112 48l11 2-10 4z" fill="#ffc56e"/>
    <circle cx="107" cy="46" r="1.7" fill="#10242b"/>
    <path d="M103 38c-2-5-1-8 1-10M101 37c-3-2-5-1-6 1M106 37c3-2 5-1 6 1" fill="none" stroke="#6fe6b2" stroke-width="2" stroke-linecap="round"/>
    <circle cx="104" cy="28" r="1.6" fill="#6fe6b2"/><circle cx="99" cy="30" r="1.6" fill="#6fe6b2"/><circle cx="109" cy="30" r="1.6" fill="#6fe6b2"/>
  </g>
  <g stroke="#c28a58" stroke-width="2.6" stroke-linecap="round" fill="none">
    <path d="M72 100l-3 18M90 100l3 18M67 118h6M90 118h6"/>
  </g>
</svg>`;

const OSTRICH = `
<svg viewBox="0 0 120 170" role="presentation">
  <g class="bird-flap">
    <ellipse cx="52" cy="98" rx="35" ry="25" fill="#7a6258" stroke="#3b2c2a" stroke-opacity=".35" stroke-width="1.2"/>
    <path d="M28 92c9-8 26-11 41-6 5 2 5 6 1 9-11 7-27 10-38 5-4-2-6-5-4-8z" fill="#66504a"/>
    <path d="M24 108c-5 144 8 5 17 7 9-1 4-6-1-9z" fill="#8a7166" opacity=".8"/>
    <path d="M72 84c9-11 15-25 19-38 2-7 6-12 11-13" fill="none" stroke="#d8a48f" stroke-width="8.5" stroke-linecap="round"/>
    <circle cx="104" cy="32" r="7.5" fill="#d8a48f"/>
    <path d="M111 32l11 2-10 4z" fill="#f0a24d"/>
    <circle cx="106" cy="30" r="1.7" fill="#2a1220"/>
    <path d="M92 33c-3-4-7-5-11-4" fill="none" stroke="#d8a48f" stroke-width="2.4" stroke-linecap="round"/>
  </g>
  <g stroke="#c98f70" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M46 120l-4 22 3 14M66 120l3 22-2 14"/>
    <path d="M37 157h9M64 157h9"/>
  </g>
</svg>`;

const EGRET = `
<svg viewBox="0 0 110 150" role="presentation">
  <g class="bird-flap">
    <ellipse cx="46" cy="88" rx="27" ry="18" fill="#eef1f5" stroke="#5a5a66" stroke-opacity=".28" stroke-width="1.2"/>
    <path d="M24 84c8-7 23-9 36-5 4 2 4 5 1 7-10 6-24 8-34 4-4-2-5-4-3-6z" fill="#d6dae3"/>
    <path d="M65 80c9-9 13-22 14-34 1-8 4-13 9-15" fill="none" stroke="#eef1f5" stroke-width="8" stroke-linecap="round"/>
    <circle cx="89" cy="29" r="7.5" fill="#eef1f5"/>
    <path d="M96 29l11 2-10 4z" fill="#f2b75e"/>
    <circle cx="91" cy="27" r="1.6" fill="#3a3540"/>
    <path d="M83 22c-4-4-8-5-12-4" fill="none" stroke="#dfe3ea" stroke-width="2.2" stroke-linecap="round"/>
  </g>
  <g stroke="#5a5a66" stroke-width="2.6" stroke-linecap="round" fill="none">
    <path d="M36 104l-6 26 4 14M52 104l4 26-4 14"/>
    <path d="M28 144h8M50 144h8"/>
  </g>
</svg>`;

const DUCK = `
<svg viewBox="0 0 120 82" role="presentation">
  <g class="bird-flap">
    <path d="M22 52c-6 0-10 3-12 7 6 0 10 2 14 5z" fill="#b8a680"/>
    <ellipse cx="53" cy="53" rx="31" ry="18" fill="#d9c9a8" stroke="#4a4030" stroke-opacity=".3" stroke-width="1.2"/>
    <path d="M30 50c9-7 24-8 37-3 4 2 4 5 1 7-9 5-23 6-32 2-4-2-5-4-6-6z" fill="#b8a680"/>
    <path d="M73 42c5-8 8-12 12-14" fill="none" stroke="#2f8f6a" stroke-width="12" stroke-linecap="round"/>
    <circle cx="88" cy="25" r="10" fill="#2f8f6a"/>
    <path d="M96 25l11 2-10 4z" fill="#f0a24d"/>
    <circle cx="90" cy="23" r="1.7" fill="#14241d"/>
  </g>
  <g stroke="#d98a3c" stroke-width="2.6" stroke-linecap="round" fill="none">
    <path d="M44 68l-2 9M63 68l2 9M39 77h7M62 77h7"/>
  </g>
</svg>`;

const DUCK_LIGHT = `
<svg viewBox="0 0 120 82" role="presentation">
  <g class="bird-flap">
    <path d="M22 52c-6 0-10 3-12 7 6 0 10 2 14 5z" fill="#c9c3b8"/>
    <ellipse cx="53" cy="53" rx="31" ry="18" fill="#f2eee4" stroke="#5a5040" stroke-opacity=".28" stroke-width="1.2"/>
    <path d="M30 50c9-7 24-8 37-3 4 2 4 5 1 7-9 5-23 6-32 2-4-2-5-4-6-6z" fill="#d8d1c2"/>
    <path d="M73 42c5-8 8-12 12-14" fill="none" stroke="#7a5a8f" stroke-width="12" stroke-linecap="round"/>
    <circle cx="88" cy="25" r="10" fill="#7a5a8f"/>
    <path d="M96 25l11 2-10 4z" fill="#f0a24d"/>
    <circle cx="90" cy="23" r="1.7" fill="#1b1524"/>
  </g>
  <g stroke="#d98a3c" stroke-width="2.6" stroke-linecap="round" fill="none">
    <path d="M44 68l-2 9M63 68l2 9M39 77h7M62 77h7"/>
  </g>
</svg>`;

const TYPES = {
  crane: {
    nameKey: "birdCrane", svg: CRANE, h: 112, by: 3, speed: 9, z: 4, x: .2,
  },
  peacock: {
    nameKey: "birdPeacock", svg: PEACOCK, h: 96, by: 2, speed: 7, z: 3, x: .55,
  },
  ostrich: {
    nameKey: "birdOstrich", svg: OSTRICH, h: 118, by: 2, speed: 8, z: 3, x: .8,
  },
  egret: {
    nameKey: "birdEgret", svg: EGRET, h: 92, by: 5, speed: 10, z: 2, x: .68,
  },
  duck: {
    nameKey: "birdDuck", svg: DUCK, h: 54, by: 0, speed: 13, z: 5, x: .38,
  },
  duckLight: {
    nameKey: "birdDuck", svg: DUCK_LIGHT, h: 50, by: 1, speed: 12, z: 5, x: .12,
  },
};

const CAST = ["crane", "peacock", "ostrich", "egret", "duck", "duckLight"];

export class Meadow {
  constructor({ sound, i18n, onToast }){
    this.sound = sound;
    this.i18n = i18n;
    this.onToast = onToast || (() => {});
    this.layer = document.getElementById("meadowBirds");
    this.grainLayer = document.getElementById("meadowGrain");
    this.host = document.getElementById("meadow");
    this.birds = [];
    this.active = true;
    this._w = 0;
    this._last = performance.now();
    this._mounted = false;
    this._shakeAt = -1e9;
    this._scatterAt = -1e9;
    this._returnToast = 0;
    this._raf = null;
    this._loop = this._loop.bind(this);
    this._onMotion = this._onMotion.bind(this);
  }

  mount(){
    if(!this.layer || this._mounted) return;
    this._mounted = true;
    this._w = this.layer.clientWidth || window.innerWidth;

    CAST.forEach((key, i) => {
      const t = TYPES[key];
      const b = {
        key,
        type: t,
        x: this._w * t.x,
        dir: i % 2 ? -1 : 1,
        speed: t.speed * rnd(0.82, 1.16),
        state: "walk",
        target: null,
        returnAt: 0,
        el: null,
      };

      const el = document.createElement("button");
      el.type = "button";
      el.className = "meadow-bird";
      el.dataset.kind = key;
      el.style.height = `${t.h}px`;
      el.style.setProperty("--by", `${t.by}%`);
      el.style.zIndex = String(t.z);
      el.innerHTML = t.svg;
      el.setAttribute("aria-label", this.i18n.t(t.nameKey));
      el.title = this.i18n.t(t.nameKey);
      el.addEventListener("click", () => this.shooBird(b));
      this.layer.append(el);
      b.el = el;
      this.birds.push(b);
      this._place(b);
    });

    window.addEventListener("resize", () => this._resize(), { passive: true });
    window.addEventListener("devicemotion", this._onMotion, { passive: true });
    this._askMotion();

    const feed = document.getElementById("feedBtn");
    const shoo = document.getElementById("shooBtn");
    if(feed) feed.addEventListener("click", () => this.feed());
    if(shoo) shoo.addEventListener("click", () => this.scatter());

    this._raf = requestAnimationFrame(this._loop);
  }

  setActive(on){
    this.active = !!on;
  }

  refresh(){
    this.birds.forEach((b) => {
      const label = this.i18n.t(b.type.nameKey);
      b.el.setAttribute("aria-label", label);
      b.el.title = label;
    });
  }

  _resize(){
    if(!this.layer) return;
    const old = this._w || 1;
    const w = this.layer.clientWidth || window.innerWidth;
    const k = w / old;
    this._w = w;
    this.birds.forEach((b) => {
      b.x = clamp(b.x * k, 34, w - 34);
      this._place(b);
    });
  }

  _place(b){
    const flip = b.dir < 0 ? -1 : 1;
    b.el.style.transform = `translate3d(${b.x.toFixed(1)}px,0,0) scaleX(${flip})`;
  }

  /* ------------------------------------------------------------------ loop */
  _loop(now){
    this._raf = requestAnimationFrame(this._loop);
    const dt = Math.min(0.05, (now - this._last) / 1000 || 0);
    this._last = now;
    if(!this.active || document.hidden) return;

    const w = this._w || this.layer?.clientWidth || window.innerWidth;
    this._w = w;

    for(const b of this.birds){
      if(b.state === "away"){
        if(b.returnAt && now >= b.returnAt) this._returnBird(b);
        continue;
      }

      if(b.target != null){
        const d = b.target - b.x;
        const step = b.speed * 2.4 * dt;
        if(Math.abs(d) <= step || Math.abs(d) < 3){
          b.x = b.target;
          b.target = null;
          this._peck(b);
        }else{
          b.dir = Math.sign(d);
          b.x += Math.sign(d) * step;
        }
      }else{
        b.x += b.dir * b.speed * dt;
      }

      if(b.x < 30){ b.x = 30; b.dir = 1; }
      if(b.x > w - 46){ b.x = w - 46; b.dir = -1; }
      this._place(b);
    }
  }

  _peck(b){
    b.state = "peck";
    b.el.classList.add("is-peck");
    this.sound.fx("peck");
    setTimeout(() => {
      if(b.state === "peck"){
        b.state = "walk";
        b.el.classList.remove("is-peck");
      }
    }, rnd(1600, 2800));
  }

  /* --------------------------------------------------------------- feeding */
  feed(){
    if(!this.active) return;
    const w = this._w || this.layer.clientWidth;
    const cx = w * rnd(0.3, 0.66);
    if(this.grainLayer){
      this.grainLayer.replaceChildren();
      for(let i = 0; i < 20; i++){
        const g = document.createElement("span");
        g.className = "grain";
        g.style.left = `${clamp(cx + rnd(-54, 54), 4, w - 4)}px`;
        g.style.bottom = `${rnd(2, 17)}%`;
        g.style.animationDelay = `${rnd(0, 0.4)}s`;
        this.grainLayer.append(g);
        setTimeout(() => g.classList.add("eaten"), 900 + Math.random() * 2200);
        setTimeout(() => g.remove(), 4200);
      }
    }

    this.sound.fx("grain");
    if(this.onToast) this.onToast(this.i18n.t("fedBirds"));

    let n = 0;
    this.birds.forEach((b) => {
      if(b.state === "away") return;
      b.target = clamp(cx + rnd(-72, 72), 34, w - 50);
      n++;
    });
    if(n){
      [0.9, 1.6, 2.3, 3.0].forEach((t) => setTimeout(() => this.sound.fx("peck"), t * 1000));
    }
  }

  /* --------------------------------------------------------------- shooing */
  shooBird(b){
    if(!b || b.state === "away") return;
    this.sound.fx("chirp");
    this.sound.fx("wings");
    this._send(b);
  }

  scatter(){
    if(!this.active) return;
    const now = performance.now();
    if(now - this._scatterAt < 3200) return;
    this._scatterAt = now;

    let n = 0;
    this.birds.forEach((b) => {
      if(b.state === "away") return;
      this._send(b);
      n++;
    });
    if(!n) return;

    this.sound.fx("wings");
    setTimeout(() => this.sound.fx("chirp"), 260);
    setTimeout(() => this.sound.fx("wings"), 620);
    if(this.onToast) this.onToast(this.i18n.t("birdsScatter"));

    clearTimeout(this._returnToast);
    this._returnToast = setTimeout(() => {
      if(this.active && this.onToast) this.onToast(this.i18n.t("birdsReturn"));
    }, 6200);
  }

  _send(b){
    b.state = "away";
    b.target = null;
    b.el.classList.remove("is-peck", "is-hidden", "is-returning");
    b.el.style.setProperty("--fdx", `${rnd(-120, 120).toFixed(0)}px`);
    // restart the flee animation
    b.el.classList.remove("is-flee");
    void b.el.offsetWidth;
    b.el.classList.add("is-flee");
    b.returnAt = performance.now() + rnd(6800, 10800);
    setTimeout(() => { if(b.state === "away") b.el.classList.add("is-hidden"); }, 1380);
  }

  _returnBird(b){
    b.returnAt = 0;
    b.state = "walk";
    b.el.classList.remove("is-hidden", "is-flee");
    b.returnAt = 0;
    b.x = Math.random() < 0.5 ? rnd(20, 90) : rnd(this._w - 120, this._w - 40);
    b.dir = b.x < this._w / 2 ? 1 : -1;
    b.speed = b.type.speed * rnd(0.8, 1.1);
    this._place(b);
    b.el.classList.add("is-returning");
    setTimeout(() => b.el.classList.remove("is-returning"), 1200);
    this.sound.fx("chirp");
  }

  /* ------------------------------------------------------------------ shake */
  _askMotion(){
    const request = async () => {
      try{
        if(typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function"){
          const res = await DeviceMotionEvent.requestPermission();
          if(res !== "granted") return;
        }
        window.addEventListener("devicemotion", this._onMotion, { passive: true });
      }catch{ /* the Shoo button remains */ }
    };
    window.addEventListener("pointerdown", request, { once: true });
  }

  _onMotion(e){
    if(!this.active || !this.host || document.body.dataset.view !== "home") return;
    const a = e.accelerationIncludingGravity || e.acceleration;
    if(!a) return;
    const mag = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
    const now = performance.now();
    if(mag < 26 || now - this._shakeAt < 2400) return;
    this._shakeAt = now;
    this.scatter();
  }
}
