/* ==========================================================================
   The home meadow — a layered courtyard scene that lives behind the page.
   Three depths of birds (far, middle, near), drifting mist and grass, slow
   flights between perches, and the old feed / shoo / shake rituals.
   ========================================================================== */

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const rnd = (a, b) => a + Math.random() * (b - a);
const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* --------------------------------------------------------------- the art */

const CRANE = `
<svg viewBox="0 0 132 200" role="presentation">
  <defs>
    <linearGradient id="crBody" x1="30" y1="78" x2="96" y2="150" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#f1f3f8"/><stop offset=".5" stop-color="#ccd1dd"/><stop offset="1" stop-color="#98a0b3"/>
    </linearGradient>
    <linearGradient id="crWing" x1="26" y1="94" x2="94" y2="132" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#c3c9d7"/><stop offset="1" stop-color="#828ba1"/>
    </linearGradient>
    <linearGradient id="crNeck" x1="80" y1="40" x2="96" y2="104" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#aeb4c3"/><stop offset="1" stop-color="#dfe3ec"/>
    </linearGradient>
  </defs>
  <g class="bird-flap">
    <path d="M52 94c-12-9-27-12-41-8 8 12 21 20 35 24z" fill="#8790a4"/>
    <path d="M28 110c-10-4-19-2-26 4 9 4 16 9 22 15z" fill="#a9b0bf"/>
    <ellipse cx="58" cy="110" rx="36" ry="27" fill="url(#crBody)"/>
    <path d="M34 105c10-10 30-14 48-9 8 2 11 7 7 11-12 8-34 11-49 6-7-2-9-5-6-8z" fill="url(#crWing)"/>
    <g fill="none" stroke="#7b8499" stroke-opacity=".48" stroke-width="1.2" stroke-linecap="round">
      <path d="M38 105c8 2 16 3 24 2M42 113c8 2 16 2 23 0M48 121c6 1 12 1 17 0"/>
    </g>
    <path d="M82 98c7-9 9-21 6-33-3-11 2-20 12-23" fill="none" stroke="url(#crNeck)" stroke-width="15" stroke-linecap="round"/>
    <path d="M84 96c6-9 8-20 5-31" fill="none" stroke="#eef1f6" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="104" cy="39" rx="12" ry="10" fill="#c8cdd8"/>
    <path d="M101 29c3-6 8-9 14-7-1 4-4 7-9 8z" fill="#c94f4a"/>
    <path d="M104 31c2-3 5-5 8-5" fill="none" stroke="#e0706a" stroke-opacity=".7" stroke-width="1" stroke-linecap="round"/>
    <path d="M113 42l20 3-18 5z" fill="#8c7d6c"/>
    <path d="M113 44l14 2" stroke="#6f6253" stroke-opacity=".6" stroke-width=".8"/>
    <circle cx="108" cy="38" r="2.2" fill="#241522"/>
    <circle cx="108.7" cy="37.2" r=".7" fill="#fff" opacity=".85"/>
  </g>
  <g stroke="#a8735b" stroke-width="3.4" stroke-linecap="round" fill="none">
    <path d="M48 132l-3 38M70 132l4 38"/>
    <path d="M41 172h9M70 172h10"/>
  </g>
</svg>`;

const PEACOCK = `
<svg viewBox="0 0 200 156" role="presentation">
  <defs>
    <linearGradient id="pkFanL" x1="18" y1="54" x2="100" y2="118" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#2f8f9a"/><stop offset="1" stop-color="#1b5f74"/>
    </linearGradient>
    <linearGradient id="pkFanR" x1="182" y1="54" x2="100" y2="118" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#38a79b"/><stop offset="1" stop-color="#1b6b72"/>
    </linearGradient>
    <linearGradient id="pkFanC" x1="100" y1="26" x2="100" y2="104" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#5fd6b4"/><stop offset="1" stop-color="#1f7f82"/>
    </linearGradient>
    <linearGradient id="pkBody" x1="82" y1="58" x2="118" y2="132" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#3aa3ad"/><stop offset="1" stop-color="#1b5d75"/>
    </linearGradient>
  </defs>
  <g class="bird-fan">
    <path d="M100 104C72 66 44 50 14 54c6 32 30 55 62 62z" fill="url(#pkFanL)" opacity=".9"/>
    <path d="M100 104c28-38 56-54 86-50-6 32-30 55-62 62z" fill="url(#pkFanR)" opacity=".9"/>
    <path d="M100 100c-12-38-4-62 10-72 12 14 16 42 6 74z" fill="url(#pkFanC)" opacity=".88"/>
    <g fill="none" stroke="#6fe6b2" stroke-opacity=".28" stroke-width="1.6">
      <path d="M22 62C52 58 78 76 100 104M178 62c-30-4-56 14-78 42"/>
      <path d="M36 52C62 54 84 74 100 102M164 52c-26 2-48 22-64 50"/>
    </g>
    <g>
      <g><circle cx="28" cy="64" r="7" fill="#ffc56e"/><circle cx="28" cy="64" r="4.2" fill="#2f8f9a"/><circle cx="28" cy="64" r="1.7" fill="#123642"/></g>
      <g><circle cx="52" cy="49" r="7" fill="#ffc56e"/><circle cx="52" cy="49" r="4.2" fill="#2f8f9a"/><circle cx="52" cy="49" r="1.7" fill="#123642"/></g>
      <g><circle cx="76" cy="40" r="7" fill="#ffc56e"/><circle cx="76" cy="40" r="4.2" fill="#37a89a"/><circle cx="76" cy="40" r="1.7" fill="#123642"/></g>
      <g><circle cx="100" cy="37" r="7" fill="#ffe08a"/><circle cx="100" cy="37" r="4.2" fill="#37a89a"/><circle cx="100" cy="37" r="1.7" fill="#123642"/></g>
      <g><circle cx="124" cy="40" r="7" fill="#ffc56e"/><circle cx="124" cy="40" r="4.2" fill="#37a89a"/><circle cx="124" cy="40" r="1.7" fill="#123642"/></g>
      <g><circle cx="148" cy="49" r="7" fill="#ffc56e"/><circle cx="148" cy="49" r="4.2" fill="#2f8f9a"/><circle cx="148" cy="49" r="1.7" fill="#123642"/></g>
      <g><circle cx="172" cy="64" r="7" fill="#ffc56e"/><circle cx="172" cy="64" r="4.2" fill="#2f8f9a"/><circle cx="172" cy="64" r="1.7" fill="#123642"/></g>
    </g>
  </g>
  <g class="bird-flap">
    <ellipse cx="100" cy="112" rx="27" ry="21" fill="url(#pkBody)"/>
    <path d="M84 109c8-8 22-11 34-6 5 2 5 6 1 9-9 5-23 7-32 3-4-2-5-4-3-6z" fill="#25808c"/>
    <path d="M110 98c6-11 10-18 14-22" fill="none" stroke="#2f8f9a" stroke-width="12" stroke-linecap="round"/>
    <circle cx="126" cy="53" r="10" fill="#2f8f9a"/>
    <path d="M134 53l12 2-11 4z" fill="#ffc56e"/>
    <path d="M134 55l8 1" stroke="#c08a34" stroke-width=".7"/>
    <circle cx="129" cy="51" r="2" fill="#10242b"/>
    <circle cx="129.6" cy="50.3" r=".7" fill="#fff" opacity=".8"/>
    <path d="M124 43c-2-5-1-8 1-10M122 42c-3-2-5-1-6 1M127 42c3-2 5-1 6 1" fill="none" stroke="#6fe6b2" stroke-width="2" stroke-linecap="round"/>
    <circle cx="125" cy="32" r="1.6" fill="#6fe6b2"/><circle cx="119" cy="34" r="1.4" fill="#6fe6b2"/><circle cx="131" cy="34" r="1.4" fill="#6fe6b2"/>
  </g>
  <g stroke="#c28a58" stroke-width="2.8" stroke-linecap="round" fill="none">
    <path d="M92 131l-3 19M108 131l3 19M87 150h7M108 150h7"/>
  </g>
</svg>`;

const OSTRICH = `
<svg viewBox="0 0 130 184" role="presentation">
  <defs>
    <linearGradient id="osBody" x1="28" y1="80" x2="94" y2="134" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#8d7164"/><stop offset=".6" stop-color="#705750"/><stop offset="1" stop-color="#553f3c"/>
    </linearGradient>
    <linearGradient id="osNeck" x1="94" y1="38" x2="112" y2="98" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#e3b49e"/><stop offset="1" stop-color="#c99383"/>
    </linearGradient>
  </defs>
  <g class="bird-flap">
    <ellipse cx="60" cy="108" rx="39" ry="29" fill="url(#osBody)"/>
    <path d="M26 96c10-13 28-18 44-14 7 2 9 7 5 11-13 9-33 12-46 7-5-2-6-3-3-4z" fill="#8d7164" opacity=".8"/>
    <g fill="none" stroke="#4e3936" stroke-opacity=".45" stroke-width="1.3" stroke-linecap="round">
      <path d="M32 96c9 4 18 6 27 5M30 108c10 4 20 5 30 3M34 120c9 3 18 3 26 0"/>
    </g>
    <path d="M88 94c8-12 13-26 16-39 2-8 6-13 12-14" fill="none" stroke="url(#osNeck)" stroke-width="9" stroke-linecap="round"/>
    <circle cx="118" cy="33" r="8.5" fill="#d8a48f"/>
    <path d="M126 33l12 2-11 4z" fill="#f0a24d"/>
    <path d="M126 35l8 1" stroke="#b8782e" stroke-width=".7"/>
    <circle cx="120" cy="31" r="2" fill="#2a1220"/>
    <circle cx="120.7" cy="30.3" r=".7" fill="#fff" opacity=".8"/>
    <path d="M108 34c-3-4-7-5-11-4" fill="none" stroke="#d8a48f" stroke-width="2.4" stroke-linecap="round"/>
  </g>
  <g stroke="#c98f70" stroke-width="3.2" stroke-linecap="round" fill="none">
    <path d="M52 134l-4 24 3 15M76 134l4 24-3 15"/>
    <path d="M42 173h11M72 173h11"/>
  </g>
</svg>`;

const EGRET = `
<svg viewBox="0 0 120 160" role="presentation">
  <defs>
    <linearGradient id="egBody" x1="26" y1="70" x2="88" y2="126" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#eef1f6"/><stop offset="1" stop-color="#c9cfdb"/>
    </linearGradient>
  </defs>
  <g class="bird-flap">
    <ellipse cx="50" cy="96" rx="30" ry="20" fill="url(#egBody)"/>
    <path d="M26 92c8-8 25-10 39-5 5 2 5 5 1 8-11 6-26 8-37 4-4-2-5-5-3-7z" fill="#dde2ea"/>
    <g fill="none" stroke="#aab2c1" stroke-opacity=".45" stroke-width="1.1" stroke-linecap="round">
      <path d="M32 92c8 2 16 3 24 2M36 100c8 2 15 2 22 0"/>
    </g>
    <path d="M73 88c9-10 13-24 14-37 1-9 5-15 11-17" fill="none" stroke="#f7f9fc" stroke-width="9" stroke-linecap="round"/>
    <path d="M75 87c7-9 11-21 12-33" fill="none" stroke="#c9cfdb" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="102" cy="31" r="8" fill="#f7f9fc"/>
    <path d="M109 31l13 2-12 4z" fill="#f2b75e"/>
    <path d="M109 33l9 1" stroke="#bf8730" stroke-width=".7"/>
    <circle cx="104" cy="29" r="1.9" fill="#3a3540"/>
    <path d="M96 24c-5-5-10-6-14-4" fill="none" stroke="#e3e7ee" stroke-width="2" stroke-linecap="round"/>
    <path d="M99 22c-3-6-2-10 1-13 2 3 3 7 2 11" fill="none" stroke="#eef1f6" stroke-width="1.6" stroke-linecap="round"/>
  </g>
  <g stroke="#4c4a58" stroke-width="2.8" stroke-linecap="round" fill="none">
    <path d="M40 112l-6 26 4 14M56 112l4 26-4 14"/>
    <path d="M31 152h9M55 152h9"/>
  </g>
</svg>`;

const DUCK = `
<svg viewBox="0 0 148 98" role="presentation">
  <defs>
    <linearGradient id="dkBody" x1="34" y1="46" x2="98" y2="78" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#d9c9a8"/><stop offset=".55" stop-color="#c4b18d"/><stop offset="1" stop-color="#a48f6d"/>
    </linearGradient>
    <linearGradient id="dkHead" x1="96" y1="18" x2="118" y2="46" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#3fae74"/><stop offset=".6" stop-color="#237a52"/><stop offset="1" stop-color="#155540"/>
    </linearGradient>
  </defs>
  <g class="bird-flap">
    <path d="M24 58c-8 0-13 4-15 9 7 0 12 2 17 6z" fill="#8f7c58"/>
    <path d="M28 55c-4-4-5-9-3-13 3 2 5 5 6 9z" fill="#2a2430"/>
    <ellipse cx="64" cy="60" rx="36" ry="21" fill="url(#dkBody)"/>
    <path d="M36 56c10-8 26-10 41-4 5 2 5 6 1 8-10 5-26 7-36 3-5-2-6-4-6-7z" fill="#a48f6d"/>
    <g fill="none" stroke="#7c6849" stroke-opacity=".5" stroke-width="1.2" stroke-linecap="round">
      <path d="M40 56c8 2 17 2 25 1M44 64c8 2 15 2 22 0"/>
    </g>
    <path d="M42 52c7-10 17-14 25-11 6 2 7 8 3 13-5 6-14 9-22 7-6-1-8-4-6-9z" fill="#8a5a45"/>
    <path d="M92 46c5-9 9-13 13-15" fill="none" stroke="url(#dkHead)" stroke-width="14" stroke-linecap="round"/>
    <circle cx="111" cy="27" r="12" fill="url(#dkHead)"/>
    <path d="M99 40c2 4 6 5 10 4" fill="none" stroke="#f2eee4" stroke-width="3" stroke-linecap="round"/>
    <path d="M121 27l14 3-13 4z" fill="#f0b64d"/>
    <path d="M121 29l10 1" stroke="#b47a24" stroke-width=".8"/>
    <circle cx="114" cy="24" r="2.1" fill="#12241c"/>
    <circle cx="114.7" cy="23.3" r=".7" fill="#fff" opacity=".85"/>
  </g>
  <g stroke="#d98a3c" stroke-width="2.8" stroke-linecap="round" fill="none">
    <path d="M54 78l-2 10M74 78l2 10M48 88h8M73 88h8"/>
  </g>
</svg>`;

const DUCK_LIGHT = `
<svg viewBox="0 0 148 98" role="presentation">
  <defs>
    <linearGradient id="dlBody" x1="34" y1="46" x2="98" y2="78" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fbf7ed"/><stop offset=".6" stop-color="#e7e0d1"/><stop offset="1" stop-color="#c8c0b0"/>
    </linearGradient>
  </defs>
  <g class="bird-flap">
    <path d="M24 58c-8 0-13 4-15 9 7 0 12 2 17 6z" fill="#c9c3b8"/>
    <ellipse cx="64" cy="60" rx="36" ry="21" fill="url(#dlBody)"/>
    <path d="M36 56c10-8 26-10 41-4 5 2 5 6 1 8-10 5-26 7-36 3-5-2-6-4-6-7z" fill="#d8d1c2"/>
    <g fill="none" stroke="#a8a08c" stroke-opacity=".5" stroke-width="1.2" stroke-linecap="round">
      <path d="M40 56c8 2 17 2 25 1M44 64c8 2 15 2 22 0"/>
    </g>
    <path d="M92 46c5-9 9-13 13-15" fill="none" stroke="#f2eee4" stroke-width="14" stroke-linecap="round"/>
    <circle cx="111" cy="27" r="12" fill="#fbf7ed"/>
    <path d="M121 27l14 3-13 4z" fill="#f0a24d"/>
    <path d="M121 29l10 1" stroke="#b47a24" stroke-width=".8"/>
    <circle cx="114" cy="24" r="2.1" fill="#2a2418"/>
    <circle cx="114.7" cy="23.3" r=".7" fill="#fff" opacity=".85"/>
  </g>
  <g stroke="#d98a3c" stroke-width="2.8" stroke-linecap="round" fill="none">
    <path d="M54 78l-2 10M74 78l2 10M48 88h8M73 88h8"/>
  </g>
</svg>`;

const SPARROW = `
<svg viewBox="0 0 86 68" role="presentation">
  <defs>
    <linearGradient id="spBody" x1="18" y1="26" x2="58" y2="58" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#c79a6b"/><stop offset=".55" stop-color="#a97c52"/><stop offset="1" stop-color="#86603f"/>
    </linearGradient>
  </defs>
  <g class="bird-flap">
    <path d="M18 40c-6 1-10 5-12 9 5-1 9 0 13 3z" fill="#6f4c31"/>
    <ellipse cx="40" cy="43" rx="22" ry="16" fill="url(#spBody)"/>
    <path d="M28 46c7-6 17-8 26-4 4 2 4 4 0 6-7 4-17 5-24 2-3-1-3-3-2-4z" fill="#e8d6b8"/>
    <path d="M32 38c6-5 14-7 20-4 3 1 3 4 0 6-5 3-12 4-17 2-3-1-4-2-3-4z" fill="#7a5638"/>
    <g fill="none" stroke="#5c3f29" stroke-opacity=".6" stroke-width="1" stroke-linecap="round">
      <path d="M38 38c4 1 8 1 12 0M36 34c4 1 8 1 11 0"/>
    </g>
    <circle cx="60" cy="31" r="9" fill="#a97c52"/>
    <path d="M56 23c3-3 7-4 10-2-1 3-4 5-7 5z" fill="#6f4c31"/>
    <path d="M68 31l10 2-9 4z" fill="#e0a83f"/>
    <circle cx="62" cy="29" r="1.8" fill="#1d1410"/>
    <circle cx="62.6" cy="28.3" r=".6" fill="#fff" opacity=".85"/>
  </g>
  <g stroke="#c98f58" stroke-width="2" stroke-linecap="round" fill="none">
    <path d="M34 58l-1 7M44 58l1 7M30 65h6M43 65h6"/>
  </g>
</svg>`;

const FAR_BIRD = `
<svg viewBox="0 0 40 18" aria-hidden="true">
  <path d="M2 14c8-2 13-6 18-12 5 6 10 10 18 12-7 1-12 3-18 4-6-1-11-3-18-4z"/>
</svg>`;

const TYPES = {
  crane:     { nameKey: "birdCrane",   svg: CRANE,      h: 122, by: 12, speed: 8,  z: 4, x: .16, depth: "mid" },
  peacock:   { nameKey: "birdPeacock", svg: PEACOCK,    h: 104, by: 10, speed: 6.5,z: 5, x: .56, depth: "mid" },
  ostrich:   { nameKey: "birdOstrich", svg: OSTRICH,    h: 134, by: 9,  speed: 7,  z: 7, x: .82, depth: "near" },
  egret:     { nameKey: "birdEgret",   svg: EGRET,      h: 76,  by: 20, speed: 6,  z: 2, x: .64, depth: "far" },
  duck:      { nameKey: "birdDuck",    svg: DUCK,       h: 58,  by: 10, speed: 14, z: 8, x: .36, depth: "near" },
  duckLight: { nameKey: "birdDuck",    svg: DUCK_LIGHT, h: 44,  by: 21, speed: 8,  z: 2, x: .10, depth: "far" },
  sparrow:   { nameKey: "birdSparrow", svg: SPARROW,    h: 34,  by: 11, speed: 22, z: 8, x: .27, depth: "near" },
};

const CAST = ["crane", "peacock", "ostrich", "egret", "duck", "duckLight", "sparrow"];

export class Meadow {
  constructor({ sound, i18n, onToast }){
    this.sound = sound;
    this.i18n = i18n;
    this.onToast = onToast || (() => {});
    this.layer = document.getElementById("meadowBirds");
    this.grainLayer = document.getElementById("meadowGrain");
    this.farLayer = document.getElementById("meadowFar");
    this.grassLayer = document.getElementById("meadowGrass");
    this.moteLayer = document.getElementById("meadowMotes");
    this.host = document.getElementById("meadow");
    this.birds = [];
    this.active = true;
    this._w = 0;
    this._last = performance.now();
    this._mounted = false;
    this._shakeAt = -1e9;
    this._scatterAt = -1e9;
    this._returnToast = 0;
    this._nextFlightAt = 0;
    this._raf = null;
    this._parRaf = 0;
    this._px = 0;
    this._py = 0;
    this._loop = this._loop.bind(this);
    this._onMotion = this._onMotion.bind(this);
    this._onPointer = this._onPointer.bind(this);
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
        flight: false,
        el: null,
      };

      const el = document.createElement("div");
      el.className = "meadow-bird";
      el.dataset.kind = key;
      el.dataset.depth = t.depth;
      el.style.height = `${t.h}px`;
      el.style.setProperty("--by", `${t.by}%`);
      el.style.setProperty("--bd", `${rnd(-1.4, 0).toFixed(2)}s`);
      el.style.zIndex = String(t.z);
      el.innerHTML = t.svg;
      el.title = this.i18n.t(t.nameKey);
      this.layer.append(el);
      b.el = el;
      this.birds.push(b);
      this._place(b);
    });

    this._buildFar();
    this._buildGrass();
    this._buildMotes();

    window.addEventListener("resize", () => this._resize(), { passive: true });
    window.addEventListener("devicemotion", this._onMotion, { passive: true });
    if(fine() && !still()){
      window.addEventListener("pointermove", this._onPointer, { passive: true });
      document.addEventListener("pointerleave", () => this._parallax(0, 0), { passive: true });
    }
    this._askMotion();

    const feed = document.getElementById("feedBtn");
    const shoo = document.getElementById("shooBtn");
    if(feed) feed.addEventListener("click", () => this.feed());
    if(shoo) shoo.addEventListener("click", () => this.scatter());

    this._nextFlightAt = performance.now() + rnd(5000, 9000);
    this._raf = requestAnimationFrame(this._loop);
  }

  setActive(on){
    this.active = !!on;
  }

  refresh(){
    this.birds.forEach((b) => {
      b.el.title = this.i18n.t(b.type.nameKey);
    });
  }

  /* --------------------------------------------------------------- scenery */
  _buildFar(){
    if(!this.farLayer) return;
    const n = still() ? 1 : 3;
    for(let i = 0; i < n; i++){
      const el = document.createElement("span");
      el.className = "far-bird";
      el.style.setProperty("--fy", `${rnd(12, 42).toFixed(0)}%`);
      el.style.setProperty("--fd", `${rnd(26, 46).toFixed(1)}s`);
      el.style.setProperty("--fdel", `${(-rnd(0, 40)).toFixed(1)}s`);
      el.style.width = `${rnd(16, 30).toFixed(0)}px`;
      el.innerHTML = FAR_BIRD;
      this.farLayer.append(el);
    }
  }

  _buildGrass(){
    if(!this.grassLayer) return;
    const n = still() ? 8 : 20;
    for(let i = 0; i < n; i++){
      const el = document.createElement("span");
      el.className = "tuft";
      el.style.left = `${rnd(-2, 102).toFixed(2)}%`;
      el.style.setProperty("--gh", `${rnd(16, 46).toFixed(0)}px`);
      el.style.setProperty("--gd", `${rnd(4, 8.5).toFixed(1)}s`);
      el.style.setProperty("--gdel", `${rnd(-4, 2).toFixed(1)}s`);
      el.innerHTML = "<i></i><i></i><i></i>";
      this.grassLayer.append(el);
    }
  }

  _buildMotes(){
    if(!this.moteLayer) return;
    const n = still() ? 4 : 16;
    for(let i = 0; i < n; i++){
      const el = document.createElement("span");
      el.className = "mote";
      el.style.setProperty("--ml", `${rnd(2, 98).toFixed(1)}%`);
      el.style.setProperty("--mb", `${rnd(8, 66).toFixed(1)}%`);
      el.style.setProperty("--ms", `${rnd(1.5, 3.6).toFixed(1)}px`);
      el.style.setProperty("--md", `${rnd(10, 22).toFixed(1)}s`);
      el.style.setProperty("--mdel", `${(-rnd(0, 20)).toFixed(1)}s`);
      this.moteLayer.append(el);
    }
  }

  _onPointer(e){
    this._px = clamp((e.clientX / window.innerWidth - .5) * 2, -1, 1);
    this._py = clamp((e.clientY / window.innerHeight - .5) * 2, -1, 1);
    if(this._parRaf) return;
    this._parRaf = requestAnimationFrame(() => {
      this._parRaf = 0;
      this._parallax(this._px, this._py);
    });
  }

  _parallax(px, py){
    if(!this.host) return;
    this.host.style.setProperty("--mx", (px * 10).toFixed(1));
    this.host.style.setProperty("--my", (py * 6).toFixed(1));
  }

  _resize(){
    if(!this.layer) return;
    const old = this._w || 1;
    const w = this.layer.clientWidth || window.innerWidth;
    const k = w / old;
    this._w = w;
    this.birds.forEach((b) => {
      b.x = clamp(b.x * k, 34, w - 34);
      if(!b.flight) this._place(b);
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

    if(!still() && now >= this._nextFlightAt){
      this._flight(now);
    }

    for(const b of this.birds){
      if(b.flight) continue;
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

  /* ---------------------------------------------------------------- flight */
  _flight(now){
    this._nextFlightAt = now + rnd(8000, 16000);
    if(!this.active) return;
    const ready = this.birds.filter((b) => b.state === "walk" && !b.flight && b.target == null);
    if(!ready.length) return;
    const b = ready[Math.floor(Math.random() * ready.length)];
    this._fly(b);
  }

  _fly(b){
    if(!b || b.flight) return;
    const w = this._w || window.innerWidth;
    const dir = b.dir || (Math.random() < .5 ? -1 : 1);
    const startX = b.x;
    const span = w * rnd(.18, .34);
    const endX = clamp(startX + dir * span, 34, w - 46);
    const lift = b.type.depth === "near" ? rnd(46, 78) : rnd(26, 54);
    const midX = startX + (endX - startX) * .5;

    b.flight = true;
    b.target = null;
    b.el.classList.add("is-air");
    this.sound.fx("wings");

    let anim;
    try{
      anim = b.el.animate([
        { transform: `translate3d(${startX}px,0,0) scaleX(${dir})` },
        { transform: `translate3d(${startX + (endX - startX) * .22}px,${-lift * .7}px,0) scaleX(${dir}) rotate(${-dir * 6}deg)`, offset: .3 },
        { transform: `translate3d(${midX}px,${-lift}px,0) scaleX(${dir}) rotate(${dir * 3}deg)`, offset: .58 },
        { transform: `translate3d(${endX - dir * 26}px,${-lift * .62}px,0) scaleX(${dir}) rotate(0deg)`, offset: .84 },
        { transform: `translate3d(${endX}px,0,0) scaleX(${dir}) rotate(${-dir * 2}deg)` },
      ], { duration: rnd(1900, 2800), easing: "cubic-bezier(.36,.02,.28,1)" });
    }catch{
      b.flight = false;
      b.el.classList.remove("is-air");
      return;
    }

    const done = () => {
      b.flight = false;
      b.el.classList.remove("is-air");
      b.x = endX;
      b.dir = dir;
      b.speed = b.type.speed * rnd(.82, 1.16);
      this._place(b);
    };
    anim.addEventListener("finish", done);
    anim.addEventListener("cancel", done);
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
      if(b.state === "away" || b.flight) return;
      b.target = clamp(cx + rnd(-72, 72), 34, w - 50);
      n++;
    });
    if(n){
      [0.9, 1.6, 2.3, 3.0].forEach((t) => setTimeout(() => this.sound.fx("peck"), t * 1000));
    }
  }

  /* --------------------------------------------------------------- shooing */
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
    b.flight = false;
    b.el.classList.remove("is-peck", "is-hidden", "is-returning", "is-air");
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
