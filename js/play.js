/* ==========================================================================
   The baithak — game state, the finger rule, scoring, and the friendly thwacks.
   The fingertip rests on the palm by itself: tap to lift, do nothing to stay.
   Four NPC index fingers play along, and a mistake sends one home for good.
   ========================================================================== */

import { WORDS, MEME_WORDS, makeBag, altitudeOf } from "./words.js";
import { store, dayKey } from "./store.js";
import { slipHand, mountHand, npcMarkup } from "./hand.js";
import { Vision, visualKey } from "./vision.js";

const $ = (id) => document.getElementById(id);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const fmtTenths = (t) => `${(Math.max(0, t) / 10).toFixed(1)}s`;

const MODES = {
  classic: { nameKey: "modeClassic", descKey: "modeIntroClassic", lives: 3 },
  sprint: { nameKey: "modeSprint", descKey: "modeIntroSprint", lives: 0 },
  zen: { nameKey: "modeZen", descKey: "modeIntroZen", lives: 0 },
  maya: { nameKey: "modeMaya", descKey: "modeIntroMaya", lives: 3 },
  altitude: { nameKey: "modeAltitude", descKey: "modeIntroAltitude", lives: 3 },
  daily: { nameKey: "modeDaily", descKey: "modeIntroDaily", lives: 0 },
  gajar: { nameKey: "modeGajar", descKey: "modeIntroGajar", lives: 3 },
  zameen: { nameKey: "modeZameen", descKey: "modeIntroZameen", lives: 3 },
  filmi: { nameKey: "modeFilmi", descKey: "modeIntroFilmi", lives: 3 },
  doHaath: { nameKey: "modeDoHaath", descKey: "modeIntroDoHaath", lives: 3 },
};

/* deterministic helpers for the daily seed */
function hash32(str){
  let h = 2166136261 >>> 0;
  for(let i = 0; i < str.length; i++){
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
function rngFrom(seed){
  let a = seed >>> 0;
  return function(){
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function dailyQueue(seed){
  const rand = rngFrom(hash32(`${seed}|rapid-fire`));
  const pool = WORDS.slice();
  for(let i = pool.length - 1; i > 0; i--){
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const out = [];
  while(out.length < 180) out.push(...pool);
  return out;
}
const RIVALS = ["Nimmo", "Bittu", "Guddu", "Pari", "Chhotu", "Munni", "Tinku", "Pappu"];
function dailyLadder(seed, mine){
  const rand = rngFrom(hash32(`${seed}|ladder`));
  const rows = RIVALS.map((name) => ({
    name,
    tenths: Math.min(300, 58 + Math.round(rand() * 246)),
  }));
  rows.push({ name: "__you", tenths: mine, you: true });
  rows.sort((a, b) => b.tenths - a.tenths);
  return rows;
}

const NPCS = [
  { id: "nimmo", name: "Nimmo", tone: "var(--teal)",     angle: -70, skill: 0.84 },
  { id: "bittu", name: "Bittu", tone: "var(--marigold)", angle: -24, skill: 0.9 },
  { id: "guddu", name: "Guddu", tone: "var(--rose)",     angle: 25,  skill: 0.78 },
  { id: "pari",  name: "Pari",  tone: "var(--ember)",    angle: 70,  skill: 0.86 },
];

const CAM_KEYS = ["camWide", "camClose", "camTilt"];
const CAM_RATES = [0.58, 0.4, 0.78];
const CAM_ANGLES = [0.5, 0.16, 0.92];

/* each court keeps its own bird */
const MODE_BIRD = {
  classic: "i-crane",
  sprint: "i-falcon",
  zen: "i-penguin",
  maya: "i-peacock",
  altitude: "i-falcon",
  daily: "i-falcon",
  gajar: "i-hummingbird",
  zameen: "i-penguin",
  filmi: "i-peacock",
  doHaath: "i-crane",
};

/* how long a name waits; the setting is persisted in the store */
const PACES = { quick: 0.78, normal: 1, relaxed: 1.34 };

const TRICK_CHANCE = 0.38;

export class Game {
  constructor({ sound, scene, i18n }){
    this.sound = sound;
    this.scene = scene;
    this.i18n = i18n;
    this.onExit = null;
    this.onBest = null;

    this.el = {
      layer: $("view-play"),
      call: $("call"), word: $("callWord"), sub: $("callSub"), kicker: $("callKicker"),
      verdict: $("callVerdict"), meter: $("callMeter"), flock: $("callFlock"),
      palm: $("palmDisc"), palmShell: $("palmShell"), palmHint: $("palmHint"), hand: $("palmHand"),
      ripples: document.querySelector(".palm-ripples"), whacks: $("whacks"),
      npcRing: $("npcRing"), npcRoster: $("npcRoster"),
      hudCam: $("hudCam"), playBird: $("playBird"),
      score: $("hudScore"), streak: $("hudStreak"), lives: $("hudLives"),
      time: $("hudTime"), speed: $("speedBar"), toast: $("playToast"),
      pick: $("playPick"), pickBack: $("pickBack"),
      intro: $("playIntro"), pause: $("playPause"), over: $("playOver"),
      countdown: $("countdown"), countNum: $("countNum"),
      visionStage: $("visionStage"), visionCaption: $("visionCaption"),
      introKicker: $("introKicker"), introTitle: $("introTitle"), introDesc: $("introDesc"),
      introVisionStep: $("introVisionStep"), introModes: $("introModes"),
      overKicker: $("overKicker"), overTitle: $("overTitle"), overVerdict: $("overVerdict"),
      overScore: $("overScore"), overBest: $("overBest"), overAcc: $("overAcc"),
      overStreak: $("overStreak"), overMisses: $("overMisses"),
      startBtn: $("startBtn"), introBack: $("introBack"), hudExit: $("hudExit"),
      hudPause: $("hudPause"), resumeBtn: $("resumeBtn"), restartBtn: $("restartBtn"),
      quitBtn: $("quitBtn"), againBtn: $("againBtn"), overModes: $("overModes"),
      musicVol: $("musicVol"), sfxVol: $("sfxVol"),
      altRail: $("altRail"), altFill: $("altFill"), chantStrip: $("chantStrip"),
      zameenBanner: $("zameenBanner"), zameenTitle: $("zameenTitle"),
      zameenSub: $("zameenSub"), zameenClock: $("zameenClock"),
      dailyChip: $("dailyChip"), dailySeedLabel: $("dailySeedLabel"),
      duelStage: $("duelStage"), duelRound: $("duelRound"), duelHint: $("duelHint"),
      duelPadL: $("duelPadL"), duelPadR: $("duelPadR"),
      duelStateL: $("duelStateL"), duelStateR: $("duelStateR"),
      duelWordL: $("duelWordL"), duelWordR: $("duelWordR"),
      duelSubL: $("duelSubL"), duelSubR: $("duelSubR"),
      duelSideL: $("duelSideL"), duelSideR: $("duelSideR"),
      introSteps: $("introSteps"), modeBrief: $("modeBrief"),
      dailyBoard: $("dailyBoard"), overSurvived: $("overSurvived"),
      overDailyNote: $("overDailyNote"), dailyLadderList: $("dailyLadderList"),
    };

    /* the one participating finger */
    mountHand(this.el.hand, "palm");
    this.vision = new Vision($("visionCanvas"), { rate: CAM_RATES[0] });

    this.phase = "idle";
    this.mode = MODES[store.get("mode")] ? store.get("mode") : "classic";
    this.fingerDown = true;
    this.bag = makeBag();
    this.recent = [];
    this.misses = [];
    this.lives = 3;
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.correct = 0;
    this.wrong = 0;
    this.calls = 0;
    this.timeLeft = 45;
    this.windowMs = 1380;
    this.callStart = 0;
    this.judgedAt = 0;
    this.nextAt = 0;
    this._shift = 0;
    this._pauseAt = 0;
    this._prevPhase = "idle";
    this._run = 0;
    this._countTimer = null;
    this._toastTimer = null;
    this._lastMiss = false;
    this._lastFrame = performance.now();
    this._shownTime = 45;
    this._pointerId = null;
    this._vision = null;
    this._npcTimers = [];
    this._sizedFor = 0;
    this.answer = "stay";
    this._didLift = false;
    this._alt = null;
    this._rhythmTimer = null;
    this._chant = [];
    this._flipAt = 0;
    this.inverted = false;
    this.dailySeed = dayKey();
    this.dailyQueue = [];
    this.dailyIndex = 0;
    this.dailyStart = 0;
    this.dailyTenths = 0;
    this.duel = null;
    this._duelPointers = { left: null, right: null };

    this.cam = clamp(Number(store.get("camera")) || 0, 0, 2);

    this._buildNpcs();
    this._bind();
    this.applyCamera(false);
    this._tick = this._frame.bind(this);
    this._raf = requestAnimationFrame(this._tick);
  }

  /* ------------------------------------------------------------------ setup */
  _bind(){
    const el = this.el;

    el.startBtn.addEventListener("click", () => { this.sound.fx("ui"); this.begin(); });
    el.introBack.addEventListener("click", () => { this.sound.fx("ui"); this.exit(); });
    el.hudExit.addEventListener("click", () => { this.sound.fx("ui"); this.exit(); });
    el.hudPause.addEventListener("click", () => this.togglePause());
    el.hudCam.addEventListener("click", () => this.cycleCamera());
    el.resumeBtn.addEventListener("click", () => { this.sound.fx("ui"); this.resume(); });
    el.restartBtn.addEventListener("click", () => { this.sound.fx("ui"); this.begin(); });
    el.quitBtn.addEventListener("click", () => { this.sound.fx("ui"); this.exit(); });
    el.againBtn.addEventListener("click", () => { this.sound.fx("ui"); this.begin(); });
    el.overModes.addEventListener("click", () => { this.sound.fx("ui"); this.showPicker(); });
    el.introModes.addEventListener("click", () => { this.sound.fx("ui"); this.showPicker(); });
    el.pickBack.addEventListener("click", () => { this.sound.fx("ui"); this.exit(); });

    const grid = $("pickGrid");
    if(grid){
      grid.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-pick-mode]");
        if(!btn) return;
        this.sound.fx("ui");
        this.chooseMode(btn.dataset.pickMode);
      });
    }

    /* pace — how long each name waits before the courtyard answers for you */
    document.querySelectorAll("[data-pace]").forEach((btn) => {
      btn.addEventListener("click", () => this.setPace(btn.dataset.pace));
    });
    this.updatePaceUI();

    /* a tap on the palm is the answer: lift the finger. Altitude is tracked
       across the move/up pair so a swipe can be told from a small lift. */
    el.palm.addEventListener("pointerdown", (e) => this._palmDown(e));
    el.palm.addEventListener("pointermove", (e) => this._palmMove(e));
    window.addEventListener("pointerup", (e) => this._palmUp(e));
    window.addEventListener("pointercancel", (e) => this._palmCancel(e));

    /* two thumbs, two pads — a press is down, a release is the lift */
    const bindDuelPad = (pad, side) => {
      if(!pad) return;
      pad.addEventListener("pointerdown", (e) => {
        if(e.pointerType === "mouse" && e.button !== 0) return;
        e.preventDefault();
        this._duelPointers[side] = e.pointerId;
        try{ pad.setPointerCapture && pad.setPointerCapture(e.pointerId); }catch{}
        this._duelPress(side);
      });
      pad.addEventListener("pointerup", (e) => {
        e.preventDefault();
        if(this._duelPointers[side] !== null && this._duelPointers[side] !== e.pointerId) return;
        this._duelPointers[side] = null;
        this._duelLift(side);
      });
      pad.addEventListener("pointercancel", () => {
        this._duelPointers[side] = null;
        this._duelLift(side);
      });
    };
    bindDuelPad(el.duelPadL, "left");
    bindDuelPad(el.duelPadR, "right");

    /* the screen is watched for size so the NPC circle hugs the palm */
    if(typeof ResizeObserver === "function"){
      new ResizeObserver(() => this._sizeRing()).observe(el.palmShell);
    }
    window.addEventListener("resize", () => this._sizeRing(), { passive: true });

    window.addEventListener("keydown", (e) => {
      if(this.el.layer.hidden) return;
      if(e.code === "Space"){
        const tag = (e.target.tagName || "").toLowerCase();
        if(tag === "input" || tag === "textarea") return;
        const onControl = e.target.closest && e.target.closest("button, a, [role=button]");
        const playing = this.phase === "call" || this.phase === "settle" || this.phase === "judged";
        if(onControl && !playing) return;
        if(this.phase === "paused" || this.phase === "intro" || this.phase === "over" || this.phase === "pick") return;
        e.preventDefault();
        if(!e.repeat) this.lift();
      }
      if(e.code === "ArrowUp" && this.mode === "altitude"){
        const tag = (e.target.tagName || "").toLowerCase();
        if(tag === "input" || tag === "textarea") return;
        if(this.phase !== "call") return;
        e.preventDefault();
        if(!e.repeat) this.altitudeKeySwipe();
      }
      if(this.mode === "doHaath" && (e.code === "KeyF" || e.code === "KeyJ")){
        const tag = (e.target.tagName || "").toLowerCase();
        if(tag === "input" || tag === "textarea") return;
        if(this.phase !== "call") return;
        e.preventDefault();
        if(!e.repeat) this._duelLift(e.code === "KeyF" ? "left" : "right");
      }
      if(e.code === "KeyC" && !e.ctrlKey && !e.metaKey && !e.altKey){
        const tag = (e.target.tagName || "").toLowerCase();
        if(tag === "input" || tag === "textarea") return;
        if(this.phase !== "idle") this.cycleCamera();
      }
      if(e.code === "Escape"){
        if(this.phase === "paused") this.resume();
        else if(this.phase === "call" || this.phase === "settle" || this.phase === "judged") this.pause();
        else if(this.phase === "intro" || this.phase === "over") this.exit();
        else if(this.phase === "pick") this.exit();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if(document.hidden && (this.phase === "call" || this.phase === "settle" || this.phase === "judged")) this.pause();
    });
  }

  /* ---------------------------------------------------------------- the ring */
  _buildNpcs(){
    const ring = this.el.npcRing;
    const roster = this.el.npcRoster;
    if(!ring || !roster) return;
    ring.replaceChildren();
    roster.replaceChildren();
    this.npcs = NPCS.map((n) => {
      const el = document.createElement("div");
      el.className = "npc";
      el.style.setProperty("--a", `${n.angle}deg`);
      el.style.setProperty("--tone", n.tone);
      el.innerHTML = npcMarkup(n.id);

      const chip = document.createElement("span");
      chip.className = "npc-chip";
      chip.style.setProperty("--tone", n.tone);
      chip.innerHTML = `<i></i>${n.name}`;

      ring.append(el);
      roster.append(chip);
      return { ...n, el, chip, out: false, wrong: false };
    });
    this._sizeRing();
  }

  _sizeRing(){
    const shell = this.el.palmShell;
    if(!shell || !this.npcs) return;
    const w = shell.clientWidth;
    if(!w || w === this._sizedFor) return;
    this._sizedFor = w;
    const r = Math.round(w * 0.5 + 2);
    this.npcs.forEach((n) => n.el.style.setProperty("--r", `${r}px`));
  }

  _clearNpcTimers(){
    clearTimeout(this._npcTimer);
    this._npcTimers.forEach(clearTimeout);
    this._npcTimers = [];
  }

  _resetNpcs(){
    this._clearNpcTimers();
    if(!this.npcs) return;
    this.npcs.forEach((n) => {
      n.out = false;
      n.wrong = false;
      n.el.className = "npc";
      n.el.style.transitionDelay = "";
      n.chip.classList.remove("is-out");
    });
  }

  _npcRound(w){
    this._clearNpcTimers();
    if(!this.npcs) return;
    const live = this.npcs.filter((n) => !n.out);
    const flies = this.answer ? this.answer !== "stay" : !!w.flies;
    live.forEach((n) => {
      n.wrong = false;
      n.el.style.transitionDelay = "";
      const wrong = Math.random() > n.skill;
      const lift = wrong ? !flies : flies;
      n.wrong = wrong;
      const delay = 240 + Math.random() * Math.min(820, this.windowMs * 0.55);
      this._npcTimers.push(setTimeout(() => {
        if(n.out || this.phase === "idle") return;
        n.el.classList.remove("is-lift", "is-stay");
        n.el.classList.add(lift ? "is-lift" : "is-stay");
      }, delay));
    });
  }

  /** Wrong fingers leave the circle once the name is settled. The state lands
      at once so the next round cannot cancel it; only the fade is staggered. */
  _settleNpcs(){
    this._clearNpcTimers();
    if(!this.npcs) return;
    const guilty = this.npcs.filter((n) => !n.out && n.wrong);
    guilty.forEach((n, i) => {
      n.out = true;
      n.el.style.transitionDelay = `${i * 0.16}s`;
      n.el.classList.remove("is-lift", "is-stay");
      n.el.classList.add("is-out");
      n.chip.classList.add("is-out");
    });
    if(guilty.length && !this._lastMiss){
      this.sound.fx("ui");
      this.showToast(this.i18n.t("npcOut", { n: guilty[0].name }));
    }
    this.npcs.forEach((n) => { if(!n.out) n.el.classList.remove("is-lift", "is-stay"); });
  }

  /* ----------------------------------------------------------------- camera */
  applyCamera(persist = true){
    this.cam = clamp(this.cam || 0, 0, 2);
    this.el.layer.dataset.cam = String(this.cam);
    if(persist) store.set("camera", this.cam);
    const name = this.i18n.t(CAM_KEYS[this.cam]);
    const label = `${this.i18n.t("camera")} · ${name}`;
    if(this.el.hudCam){
      this.el.hudCam.title = label;
      this.el.hudCam.setAttribute("aria-label", label);
    }
    this.vision.rate = CAM_RATES[this.cam];
    this.vision.angle = CAM_ANGLES[this.cam];
  }

  cycleCamera(){
    this.cam = ((this.cam || 0) + 1) % 3;
    this.applyCamera();
    this.sound.fx("ui");
    this.showToast(this.i18n.t("cameraToast", { name: this.i18n.t(CAM_KEYS[this.cam]) }));
  }

  /* ------------------------------------------------------------------ pace */
  setPace(pace){
    if(!PACES[pace]) return;
    if(pace === store.get("pace")){
      this.updatePaceUI();
      return;
    }
    store.set("pace", pace);
    this.updatePaceUI();
    this.sound.fx("ui");
  }

  updatePaceUI(){
    const pace = PACES[store.get("pace")] ? store.get("pace") : "normal";
    document.querySelectorAll("[data-pace]").forEach((btn) => {
      const on = btn.dataset.pace === pace;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  }

  /* ----------------------------------------------------------- court theme */
  applyModeTheme(){
    if(!this.el.layer) return;
    this.el.layer.dataset.mode = this.mode;
    const use = this.el.playBird && this.el.playBird.querySelector("use");
    if(use) use.setAttribute("href", `#${MODE_BIRD[this.mode] || "i-crane"}`);
  }

  /** Show only the props that belong to the court we are standing in. */
  _syncModeChrome(active = true){
    const duel = active && this.mode === "doHaath";
    this.el.layer.classList.toggle("is-duel", duel);
    this.el.altRail.hidden = !(active && this.mode === "altitude");
    this.el.chantStrip.hidden = !(active && this.mode === "gajar");
    this.el.zameenBanner.hidden = !(active && this.mode === "zameen");
    this.el.dailyChip.hidden = !(active && this.mode === "daily");
    if(this.el.duelStage) this.el.duelStage.hidden = !duel;
    if(!active){
      this.el.altRail.hidden = true;
      this.el.chantStrip.hidden = true;
      this.el.zameenBanner.hidden = true;
      this.el.dailyChip.hidden = true;
      if(this.el.duelStage) this.el.duelStage.hidden = true;
    }
  }

  _clearRhythm(){
    clearTimeout(this._rhythmTimer);
    this._rhythmTimer = null;
    this._gajarPause = false;
    this._gajarPauseUntil = 0;
    this.sound.stopSpeech();
  }

  /** The one true answer for this call, frozen at the moment it is called. */
  answerFor(w){
    if(!w.flies) return "stay";
    if(this.mode === "altitude") return altitudeOf(w) === "high" ? "swipe" : "tap";
    if(this.mode === "zameen" && this.inverted) return "stay";
    return "lift";
  }

  _renderChant(){
    const strip = this.el.chantStrip;
    if(!strip) return;
    strip.replaceChildren();
    const chant = this.i18n.t("gajarChant");
    if(this._gajarPause){
      const p = document.createElement("span");
      p.textContent = this.i18n.t("gajarPause");
      strip.append(p);
    }
    const last = this.i18n.t("gajarHint");
    const tag = document.createElement("span");
    tag.textContent = last;
    strip.append(tag);
    this._chant.slice(0, 3).forEach((name) => {
      const s = document.createElement("span");
      s.textContent = name;
      strip.prepend(s);
    });
    if(!this._chant.length && !this._gajarPause){
      const s = document.createElement("span");
      s.textContent = chant;
      strip.append(s);
    }
  }

  _speakGajar(w){
    if(this.mode !== "gajar" || !w) return;
    const lang = this.i18n.lang;
    const text = lang === "en" ? w.en : lang === "hi" ? w.hi : w.hl;
    const rate = 0.72 + Math.random() * 0.72;
    const pitch = 0.72 + Math.random() * 0.62;
    this.sound.speak(text, lang === "en" ? "en" : "hi", { rate, pitch });
  }

  /* --------------------------------------------------------------- zameen */
  _setupZameen(){
    this.inverted = false;
    this._flipAt = 0;
    this._syncZameen();
  }

  _flipZameen(t){
    this.inverted = !this.inverted;
    this._flipAt = t + 10000;
    this.sound.fx("flip");
    this.showToast(this.i18n.t(this.inverted ? "zameenFlipToast" : "zameenBackToast"), this.inverted ? "bad" : "good");
    this._syncZameen();
  }

  _syncZameen(){
    const on = this.mode === "zameen";
    this.el.layer.classList.toggle("is-zameen-flip", on && this.inverted);
    if(!on){
      if(this.el.zameenBanner) this.el.zameenBanner.hidden = true;
      return;
    }
    this.el.zameenBanner.hidden = false;
    this.el.zameenTitle.textContent = this.i18n.t(this.inverted ? "zameenFlipped" : "zameenNormal");
    this.el.zameenSub.textContent = this.i18n.t(this.inverted ? "zameenHintFlipped" : "zameenHintNormal");
    this.el.zameenBanner.classList.toggle("is-flipped", this.inverted);
  }

  updateZameen(t){
    if(this.mode !== "zameen") return;
    if(!this._flipAt) this._flipAt = t + 10000;
    const secs = Math.max(0, Math.ceil((this._flipAt - t) / 1000));
    if(this.el.zameenClock) this.el.zameenClock.textContent = this.i18n.t("zameenIn", { s: secs });
  }

  /* -------------------------------------------------------------- lifecycle */
  open(mode = null){
    this.el.layer.hidden = false;
    if(mode && MODES[mode]){
      this.mode = mode;
      store.set("mode", this.mode);
      this.showIntro();
    }else{
      this.showPicker();
    }
  }

  showPicker(){
    this._run++;
    clearTimeout(this._countTimer);
    clearTimeout(this._toastTimer);
    this._clearNpcTimers();
    this._clearRhythm();
    this.phase = "pick";
    this.fingerDown = true;
    this._pointerId = null;
    this._vision = null;
    this.vision.hide();
    this.el.layer.hidden = false;
    this.el.layer.classList.remove("is-maya", "is-duel", "is-zameen-flip");
    this.el.pick.hidden = false;
    this.el.intro.hidden = true;
    this.el.pause.hidden = true;
    this.el.over.hidden = true;
    this.el.countdown.hidden = true;
    this.el.dailyBoard.hidden = true;
    this.restFinger();
    this.el.toast.classList.remove("show");
    this.el.visionStage.hidden = true;
    this.el.call.classList.remove("is-fly", "is-stay", "is-miss", "is-calling", "is-past");
    this.sound.duck(false);
    this.applyModeTheme();
    this._syncModeChrome(false);
    this.updatePaceUI();
    if(typeof this.onBest === "function") this.onBest();
  }

  chooseMode(mode){
    if(!MODES[mode]) return;
    this.mode = mode;
    store.set("mode", mode);
    this.el.pick.hidden = true;
    this.showIntro();
  }

  showIntro(){
    this.reset();
    this.el.layer.hidden = false;
    this.phase = "intro";
    this.hideOverlays();
    this.el.intro.hidden = false;
    this.el.intro.classList.remove("is-out");
    this.el.introKicker.querySelector("[data-i18n]").textContent = this.i18n.t("getReady");
    this.el.introTitle.textContent = this.i18n.t(MODES[this.mode].nameKey);
    this.el.introDesc.textContent = this.i18n.t(MODES[this.mode].descKey);
    this.el.introVisionStep.hidden = this.mode !== "maya";
    this.el.modeBrief.hidden = true;
    this.el.word.textContent = "चिड़िया";
    this.el.sub.textContent = "chidiya";
    this.el.kicker.firstElementChild.textContent = "";
    this.el.palmHint.textContent = this.i18n.t("fingerPlaced");
    this._syncModeChrome(true);
    if(this.mode === "zameen") this._syncZameen();
    if(this.mode === "maya"){
      this.el.visionStage.hidden = false;
      this.el.visionStage.classList.remove("is-trick", "is-true", "is-verdict");
      this.el.visionCaption.textContent = "";
      this.vision.show(WORDS.find(x => x.id === "chidiya") || WORDS[0]);
    }
  }

  /** Re-render the intro sheet after a language switch. */
  refreshIntro(){
    this.applyCamera(false);
    this.applyModeTheme();
    this.updatePaceUI();
    if(this.phase === "intro") this.showIntro();
    else if(this.phase === "pick"){
      this.el.pick.hidden = false;
      if(typeof this.onBest === "function") this.onBest();
    }
  }

  begin(){
    this.sound.ensure();
    if(this.sound.musicOn) this.sound.startMusic();
    this.sound.duck(false);
    store.bumpPlay();
    this.reset();
    this.hideOverlays();
    this.el.layer.hidden = false;
    this.phase = "count";
    this.el.word.classList.remove("is-past");
    this.el.word.textContent = "·";
    this.el.sub.textContent = "";
    this.el.kicker.firstElementChild.textContent = this.i18n.t("getReady");
    this.el.palmHint.textContent = this.i18n.t("getReady");
    this.el.call.classList.remove("is-fly", "is-stay", "is-miss", "is-calling", "is-past");
    this._syncModeChrome(true);
    if(this.mode === "daily"){
      this.dailySeed = dayKey();
      this.dailyStart = 0;
    }
    if(this.mode === "zameen") this._setupZameen();
    this.countdown();
  }

  exit(){
    this.stop();
    if(typeof this.onExit === "function") this.onExit();
  }

  stop(){
    this._run++;
    clearTimeout(this._countTimer);
    clearTimeout(this._toastTimer);
    this._clearNpcTimers();
    this._clearRhythm();
    this.phase = "idle";
    this.fingerDown = true;
    this._pointerId = null;
    this._vision = null;
    this.vision.hide();
    this.el.layer.hidden = true;
    this.el.layer.classList.remove("is-maya", "is-duel", "is-zameen-flip");
    this.el.palm.classList.remove("is-down", "is-up");
    this.el.toast.classList.remove("show");
    this.el.visionStage.hidden = true;
    this.el.dailyBoard.hidden = true;
    this._syncModeChrome(false);
    this.hideOverlays();
    this.el.countdown.hidden = true;
    this.sound.duck(false);
  }

  reset(){
    this._clearRhythm();
    this._clearNpcTimers();
    this.lives = MODES[this.mode].lives || 0;
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.correct = 0;
    this.wrong = 0;
    this.calls = 0;
    this.timeLeft = this.mode === "daily" ? 30 : 45;
    this._shownTime = Math.ceil(this.timeLeft);
    this.windowMs = 1380;
    this.callStart = 0;
    this.judgedAt = 0;
    this.nextAt = 0;
    this._shift = 0;
    this._lastMiss = false;
    this._lastMeta = null;
    this._didLift = false;
    this._alt = null;
    this._gajarPause = false;
    this._gajarPauseUntil = 0;
    this._chant = [];
    this.answer = "stay";
    this.firstWord = true;
    this.word = null;
    this.bag = makeBag(this.mode === "filmi" ? MEME_WORDS : WORDS);
    this.recent = [];
    this.misses = [];
    this.fingerDown = true;
    this._vision = null;
    this.vision.hide();
    this._resetNpcs();
    this.el.layer.classList.toggle("is-maya", this.mode === "maya");
    this.applyModeTheme();
    this.el.visionStage.hidden = this.mode !== "maya";
    this.el.visionStage.classList.remove("is-trick", "is-true", "is-verdict");
    this.el.visionCaption.textContent = "";
    this.el.meter.style.transform = "scaleX(1)";
    this.el.meter.classList.remove("warn");
    this.el.whacks.replaceChildren();
    this.el.flock.replaceChildren();
    this.el.verdict.className = "call-verdict";
    this.el.call.classList.remove("is-fly", "is-stay", "is-miss", "is-calling", "is-past");
    this.restFinger();
    this._pointerId = null;
    this.el.palmHint.textContent = this.i18n.t("fingerPlaced");
    this.el.palmHint.classList.remove("is-alert");
    this.el.toast.classList.remove("show", "bad", "good");
    this.el.speed.style.width = "0%";
    this.el.dailyBoard.hidden = true;
    this.el.chantStrip.replaceChildren();

    if(this.mode === "daily"){
      this.dailySeed = dayKey();
      this.dailyQueue = dailyQueue(this.dailySeed);
      this.dailyIndex = 0;
      this.dailyStart = 0;
      this.dailyTenths = 0;
      this.timeLeft = 30;
      this._shownTime = 30;
      this.el.dailySeedLabel.textContent = this.dailySeed.slice(5).replace("-", " / ");
    }else{
      this.dailyStart = 0;
      this.dailyTenths = 0;
    }

    if(this.mode === "zameen") this._setupZameen();
    else this.el.layer.classList.remove("is-zameen-flip");

    this.duel = null;
    this._duelPointers = { left: null, right: null };
    this._resetDuelPads();

    this.updateHud(true);
    const timed = this.mode === "sprint" || this.mode === "daily";
    this.el.time.hidden = !timed;
    this.el.lives.hidden = !(MODES[this.mode].lives > 0);
    this._syncModeChrome(this.phase !== "pick");
    if(this.mode === "zameen") this._syncZameen();
    else this.el.zameenBanner.hidden = true;
  }

  _resetDuelPads(){
    if(!this.el.duelPadL) return;
    [["left", this.el.duelPadL, this.el.duelStateL], ["right", this.el.duelPadR, this.el.duelStateR]].forEach(([, pad, state]) => {
      pad.classList.remove("is-up", "is-wrong");
      if(state) state.textContent = this.i18n.t("duelDown");
    });
  }

  countdown(){
    const steps = [["3", false], ["2", false], ["1", false], [this.i18n.t("countWord"), true]];
    const token = ++this._run;
    this.el.countdown.hidden = false;
    let i = 0;
    const show = () => {
      if(token !== this._run) return;
      const [txt, isWord] = steps[i];
      const num = this.el.countNum;
      num.textContent = txt;
      num.classList.toggle("is-word", isWord);
      num.style.animation = "none";
      void num.offsetWidth;
      num.style.animation = "";
      this.sound.fx(isWord ? "go" : "count");
      i++;
      if(i < steps.length){
        this._countTimer = setTimeout(show, isWord ? 0 : 620);
      }else{
        this._countTimer = setTimeout(() => {
          if(token !== this._run) return;
          this.el.countdown.hidden = true;
          this.phase = "settle";
          this.firstWord = true;
          this.nextAt = this.now() + 180;
          this.promptSettle();
        }, 540);
      }
    };
    show();
  }

  now(){ return performance.now() - this._shift; }

  /* ---------------------------------------------------------------- round */
  startCall(){
    if(this.phase === "over" || this.phase === "idle" || this.phase === "pick") return;
    if(this.mode === "doHaath"){ this.startDuelRound(); return; }
    const first = this.calls === 0;
    let w;
    if(this.mode === "daily"){
      if(!this.dailyQueue.length || this.dailyIndex >= this.dailyQueue.length){
        this.dailyQueue = dailyQueue(this.dailySeed);
        this.dailyIndex = 0;
      }
      w = this.dailyQueue[this.dailyIndex++];
    }else if(first && this.mode !== "filmi"){
      w = WORDS.find(x => x.id === "chidiya") || WORDS[0];
    }else{
      w = this.bag.next(this.recent);
    }
    this.firstWord = false;
    this.word = w;
    this.phase = "call";
    this.calls++;
    this.answer = this.answerFor(w);
    this._didLift = false;
    this._lastMeta = null;
    this.windowMs = this.windowFor();
    this._gajarPause = false;
    this._gajarPauseUntil = 0;
    if(this.mode === "gajar" && this.calls > 3 && this.calls % 4 === 0){
      this._gajarPause = true;
      this._gajarPauseUntil = this.now() + 640;
      this.windowMs += 640;
    }
    this.callStart = this.now();
    if(this.mode === "daily" && !this.dailyStart) this.dailyStart = this.callStart;
    if(this.mode === "zameen" && !this._flipAt) this._flipAt = this.callStart + 10000;
    this.judgedAt = 0;
    this._lastMiss = false;
    this.recent = [w.id, ...this.recent].slice(0, 5);
    this._vision = this.pickVision(w, first);

    this.restFinger();
    this._altClear();
    this.el.call.classList.remove("is-fly", "is-stay", "is-miss", "is-past", "is-calling");
    void this.el.call.offsetWidth;
    this.el.call.classList.add("is-calling");
    this.el.word.classList.remove("is-past");
    this.el.word.textContent = w[this.i18n.lang] || w.en;
    this.el.sub.textContent = this.secondary(w);

    let kicker = `${this.i18n.t("callWord")} ${String(this.calls).padStart(2, "0")} · ${this.i18n.t("speedWord")} ${this.speedLevel()}`;
    if(this.mode === "zen") kicker = this.i18n.t(w.flies ? "hintFly" : "hintStay");
    else if(this.mode === "altitude"){
      const a = this.answer === "swipe" ? this.i18n.t("altitudeHigh") : w.flies ? this.i18n.t("altitudeLow") : this.i18n.t("hintStay");
      kicker = this.i18n.t("altitudeKicker", { a });
    }else if(this.mode === "gajar") kicker = this.i18n.t("gajarHint");
    else if(this.mode === "zameen") kicker = this.i18n.t(this.answer === "stay" ? "zameenHintFlipped" : "zameenHintNormal");
    else if(this.mode === "filmi") kicker = this.i18n.t("filmiHint");
    this.el.kicker.firstElementChild.textContent = kicker;

    this.el.meter.style.transform = "scaleX(1)";
    this.el.meter.classList.remove("warn");
    this.el.verdict.className = "call-verdict";
    this.el.palmHint.textContent = this.mode === "altitude" ? this.i18n.t("altitudeSwipe")
      : this.mode === "zameen" ? this.i18n.t(this.inverted ? "zameenHintFlipped" : "zameenHintNormal")
      : this.i18n.t("fingerPlaced");
    this.el.palmHint.classList.remove("is-alert");
    this.el.speed.style.width = `${this.speedLevel() * 11}%`;

    if(this.mode === "gajar"){
      this._chant.unshift(w[this.i18n.lang] || w.en);
      this._chant = this._chant.slice(0, 3);
      this._renderChant();
      clearTimeout(this._rhythmTimer);
      this.sound.stopSpeech();
      const delay = this._gajarPause ? 650 : 130;
      this._rhythmTimer = setTimeout(() => {
        if(this.phase === "call" && this.word === w) this._speakGajar(w);
      }, delay);
    }
    if(this.mode === "zameen") this.updateZameen(this.callStart);

    if(this.mode === "maya" && this._vision){
      this.el.visionStage.hidden = false;
      this.el.visionStage.classList.remove("is-trick", "is-true", "is-verdict");
      this.el.visionCaption.textContent = "";
      this.vision.show(this._vision.word);
      this.vision.react("");
    }else{
      this.el.visionStage.hidden = true;
    }

    if(this.mode !== "daily") this._npcRound(w);
    this.pulsePalm();
    this.sound.fx("tick");
  }

  /* --------------------------------------------------------------- Do Haath */
  startDuelRound(){
    if(this.phase === "over" || this.phase === "idle" || this.phase === "pick") return;
    this.phase = "call";
    this.calls++;
    const left = this.bag.next(this.recent);
    this.recent = [left.id, ...this.recent].slice(0, 5);
    const right = this.bag.next([...this.recent, left.id]);
    this.recent = [right.id, ...this.recent].slice(0, 5);
    const windowMs = Math.max(780, Math.round(1380 - this.correct * 14));
    this.windowMs = windowMs;
    this.callStart = this.now();
    this.duel = {
      left, right,
      lifted: { left: false, right: false },
      done: false,
      start: this.callStart,
    };
    this.word = left;
    this.answer = left.flies || right.flies ? "lift" : "stay";
    this._didLift = false;
    this._lastMiss = false;
    this.judgedAt = 0;
    this._resetDuelPads();
    this.el.duelWordL.textContent = left[this.i18n.lang] || left.en;
    this.el.duelWordR.textContent = right[this.i18n.lang] || right.en;
    this.el.duelSubL.textContent = left.flies ? this.i18n.t("hintFly") : this.i18n.t("hintStay");
    this.el.duelSubR.textContent = right.flies ? this.i18n.t("hintFly") : this.i18n.t("hintStay");
    this.el.duelRound.textContent = this.i18n.t("duelRound", { n: this.calls });
    this.el.meter.style.transform = "scaleX(1)";
    this.el.meter.classList.remove("warn");
    this.el.verdict.className = "call-verdict";
    this.el.speed.style.width = `${this.speedLevel() * 11}%`;
    this.sound.fx("tick");
  }

  _duelPress(side){
    if(this.mode !== "doHaath" || this.phase !== "call" || !this.duel) return;
    const word = this.duel[side];
    if(!word) return;
    this.el[side === "left" ? "duelStateL" : "duelStateR"].textContent = this.i18n.t("duelDown");
  }

  _duelLift(side){
    if(this.mode !== "doHaath" || this.phase !== "call" || !this.duel || this.duel.done) return;
    const pad = side === "left" ? this.el.duelPadL : this.el.duelPadR;
    const state = side === "left" ? this.el.duelStateL : this.el.duelStateR;
    if(this.duel.lifted[side]) return;
    this.duel.lifted[side] = true;
    pad.classList.add("is-up");
    state.textContent = this.i18n.t("duelUp");
    const word = this.duel[side];
    try{ navigator.vibrate && navigator.vibrate(10); }catch{}
    this.sound.fx("lift");
    if(!word.flies){
      this.duel.done = true;
      pad.classList.add("is-wrong");
      this._duelJudge(false, `${word[this.i18n.lang] || word.en} · ${this.i18n.t("duelMissStay")}`);
      return;
    }
    const allUp = ["left", "right"].every((s) => !this.duel[s].flies || this.duel.lifted[s]);
    if(allUp){
      this.duel.done = true;
      this._duelJudge(true);
    }
  }

  _duelJudge(hit, note = ""){
    if(this.phase !== "call" || !this.duel) return;
    const d = this.duel;
    this.phase = "judged";
    this.judgedAt = this.now();
    this._lastMiss = !hit;
    this.el.meter.classList.remove("warn");
    if(hit){
      this.correct++;
      this.streak++;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
      const mult = 1 + Math.min(3, Math.floor((this.streak - 1) / 3) * 0.5);
      const points = Math.round(120 * mult);
      this.score += points;
      this.showVerdict(this.i18n.t("duelGood"), "good");
      this.scorePop(points);
      this.sound.fx("hitFly");
      this.freedBird();
      this.scene.spawnBirds(1, true);
    }else{
      this.wrong++;
      this.streak = 0;
      this.misses.unshift({
        w: d.left,
        lifted: true,
        note: note || this.i18n.t("duelMiss"),
      });
      this.lives = Math.max(0, this.lives - 1);
      this.showVerdict(this.i18n.t("duelBad"), "bad");
      this.sound.fx("miss");
      this.shake();
      slipHand(this.el.hand);
      this.showToast(note || this.i18n.t("duelMiss"), "bad");
    }
    this.updateHud();
  }

  _endDuelCall(){
    this._settleNpcs();
    if(this.lives <= 0) return this.finish();
    this.phase = "settle";
    this.el.verdict.className = "call-verdict";
    this._resetDuelPads();
    this.duel = null;
    this.nextAt = this.now() + 260;
  }

  /** Decide what the 3D vision shows: the truth, or a very convincing lie. */
  pickVision(w, first){
    if(this.mode !== "maya") return null;
    if(first || Math.random() > TRICK_CHANCE) return { word: w, trick: false };
    const key = visualKey(w);
    const pool = WORDS.filter(x =>
      x.id !== w.id && x.flies !== w.flies && visualKey(x) !== key
    );
    if(!pool.length) return { word: w, trick: false };
    return { word: pool[Math.floor(Math.random() * pool.length)], trick: true };
  }

  secondary(w){
    const l = this.i18n.lang;
    if(l === "en") return `${w.hi} · ${w.hl}`;
    if(l === "hi") return `${w.en} · ${w.hl}`;
    return `${w.hi} · ${w.en}`;
  }

  windowFor(){
    const pace = PACES[store.get("pace")] || 1;
    if(this.mode === "zen") return Math.round(1800 * pace);
    if(this.mode === "daily") return Math.round(Math.max(470, 760 - this.calls * 6) * pace);
    if(this.mode === "altitude") return Math.round(Math.max(940, 1550 - this.correct * 12) * pace);
    if(this.mode === "zameen") return Math.round(Math.max(860, 1320 - this.correct * 10) * pace);
    if(this.mode === "gajar") return Math.round((760 + Math.random() * 620) * pace);
    if(this.mode === "filmi") return Math.round(Math.max(700, 1180 - this.correct * 16) * pace);
    /* Baithak and Bijli keep the courtyard brisk */
    const base = this.mode === "sprint" ? 880 : 1000;
    const floor = this.mode === "sprint" ? 440 : 540;
    return Math.round(Math.max(floor, base - this.correct * 28) * pace);
  }

  speedLevel(){
    return clamp(1 + Math.floor(this.correct / 3), 1, 9);
  }

  /** Put the index finger back on the palm without asking the player. */
  restFinger(){
    this.fingerDown = true;
    this._pointerId = null;
    this.el.palm.classList.remove("is-up");
    this.el.palm.classList.add("is-down");
    this.el.palm.setAttribute("aria-pressed", "false");
  }

  /* ------------------------------------------------------- the palm gestures */
  _palmDown(e){
    if(this.mode === "doHaath") return;
    if(this.phase !== "call" || !this.word) return;
    if(e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    if(this.mode !== "altitude"){
      this.lift();
      return;
    }
    if(!this.fingerDown || this._alt) return;
    this._alt = { id: e.pointerId, y: e.clientY };
    try{ this.el.palm.setPointerCapture && this.el.palm.setPointerCapture(e.pointerId); }catch{}
    if(this.el.altRail) this.el.altRail.classList.remove("is-hot");
    if(this.el.altFill) this.el.altFill.style.width = "0%";
  }

  _palmMove(e){
    if(!this._alt || e.pointerId !== this._alt.id) return;
    if(this.phase !== "call" || !this.word) return;
    const dy = this._alt.y - e.clientY;
    const high = altitudeOf(this.word) === "high";
    const p = clamp(dy / (high ? 64 : 46), 0, 1);
    if(this.el.altFill) this.el.altFill.style.width = `${Math.round(p * 100)}%`;
    if(this.el.altRail) this.el.altRail.classList.toggle("is-hot", p > 0.92);
    if(dy >= (high ? 64 : 46)){
      if(!this.word.flies) this._altResolve("stay");
      else this._altResolve(high ? "swipe" : "over");
    }
  }

  _palmUp(e){
    if(!this._alt || e.pointerId !== this._alt.id) return;
    const startY = this._alt.y;
    const endY = typeof e.clientY === "number" ? e.clientY : startY;
    const dy = startY - endY;
    const word = this.word;
    this._altClear();
    if(this.phase !== "call" || !word) return;
    if(!word.flies){ this._altResolve("stay"); return; }
    if(altitudeOf(word) === "high"){
      this._altResolve(dy >= 64 ? "swipe" : "short");
    }else{
      this._altResolve(dy >= 46 ? "over" : "tap");
    }
  }

  _palmCancel(e){
    if(!this._alt) return;
    if(e && e.pointerId !== this._alt.id) return;
    this._altClear();
  }

  _altClear(){
    this._alt = null;
    if(this.el.altFill) this.el.altFill.style.width = "0%";
    if(this.el.altRail) this.el.altRail.classList.remove("is-hot");
  }

  _altResolve(kind){
    this._altClear();
    if(this.phase !== "call" || !this.word) return;
    this._didLift = true;
    this.fingerDown = false;
    this.el.palm.classList.remove("is-down");
    this.el.palm.classList.add("is-up");
    this.el.palm.setAttribute("aria-pressed", "true");
    try{ navigator.vibrate && navigator.vibrate(kind === "swipe" ? 18 : 10); }catch{}
    this.judge(kind === "swipe" || kind === "tap", { alt: kind });
  }

  altitudeKeySwipe(){
    if(this.mode !== "altitude" || this.phase !== "call" || !this.word) return;
    if(!this.fingerDown) return;
    this._didLift = true;
    this.fingerDown = false;
    this.el.palm.classList.remove("is-down");
    this.el.palm.classList.add("is-up");
    this.el.palm.setAttribute("aria-pressed", "true");
    try{ navigator.vibrate && navigator.vibrate(18); }catch{}
    if(this.answer === "swipe") this.judge(true, { alt: "swipe" });
    else if(this.answer === "tap") this.judge(false, { alt: "over" });
    else this.judge(false, { alt: "stay" });
  }

  /** The one gesture that matters: lift the finger, meaning "it flies". */
  lift(){
    if(this.mode === "doHaath") return;
    if(this.phase !== "call" || !this.word) return;
    if(!this.fingerDown) return;
    if(this.mode === "gajar" && this._gajarPause && this.now() < this._gajarPauseUntil){
      this._didLift = true;
      this.fingerDown = false;
      this.el.palm.classList.remove("is-down");
      this.el.palm.classList.add("is-up");
      this.el.palm.setAttribute("aria-pressed", "true");
      this.judge(false, { gajar: "pause" });
      return;
    }
    this.fingerDown = false;
    this.el.palm.classList.remove("is-down");
    this.el.palm.classList.add("is-up");
    this.el.palm.setAttribute("aria-pressed", "true");
    try{ navigator.vibrate && navigator.vibrate(10); }catch{}
    if(this.mode === "altitude"){
      this._didLift = true;
      const kind = this.answer === "swipe" ? "short" : this.answer === "tap" ? "tap" : "stay";
      this.judge(this.answer === "tap", { alt: kind });
      return;
    }
    this._didLift = true;
    this.judge(this.answer === "lift");
  }

  promptSettle(){
    if(this.mode === "doHaath"){
      this.el.kicker.firstElementChild.textContent = "";
      return;
    }
    this.el.palmHint.textContent =
      this.mode === "zameen" ? this.i18n.t(this.inverted ? "zameenHintFlipped" : "zameenHintNormal")
      : this.mode === "altitude" ? this.i18n.t("altitudeSwipe")
      : this.i18n.t("holdPalm");
    this.el.palmHint.classList.remove("is-alert");
    this.el.kicker.firstElementChild.textContent = "";
    if(this.word) this.el.word.classList.add("is-past");
    this.restFinger();
    this._altClear();
  }

  judge(hit, meta = {}){
    if(this.phase !== "call" || !this.word) return;
    const w = this.word;
    const name = w[this.i18n.lang] || w.en;
    const trick = !!(this._vision && this._vision.trick);
    const didLift = meta.timeout ? false : !!this._didLift;
    const flyingAnswer = this.answer !== "stay";
    const expected = this.answer;
    this.phase = "judged";
    this.judgedAt = this.now();
    this._lastMiss = !hit;
    this._lastMeta = meta;
    this.el.meter.classList.remove("warn");
    this.el.call.classList.remove("is-calling");
    this.vision.react(hit ? "good" : "bad");
    this._altClear();

    // the vision flips its caption, too late to help
    if(this.mode === "maya" && this._vision){
      this.el.visionStage.classList.add("is-verdict");
      if(trick){
        this.el.visionStage.classList.add("is-trick");
        this.el.visionCaption.textContent = this.i18n.t("visionTrick", {
          w: this._vision.word[this.i18n.lang] || this._vision.word.en,
        });
      }else{
        this.el.visionStage.classList.add("is-true");
        this.el.visionCaption.textContent = this.i18n.t("visionTrue");
      }
    }

    if(hit){
      this.correct++;
      this.streak++;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
      const mult = 1 + Math.min(3, Math.floor((this.streak - 1) / 3) * 0.5);
      const speedBonus = this.windowMs < 800 ? 50 : this.windowMs < 1050 ? 25 : 0;
      const points = Math.round((100 + speedBonus) * mult);
      this.score += points;
      this.el.call.classList.add(flyingAnswer ? "is-fly" : "is-stay");
      this.showVerdict(this.i18n.t(trick ? "verdictSight" : (flyingAnswer ? "verdictFly" : "verdictStay")), "good");
      this.scorePop(points);
      if(flyingAnswer){
        this.sound.fx("hitFly");
        this.scene.spawnBirds(1 + Math.min(4, Math.floor(this.streak / 4)), true);
        this.freedBird();
      }else{
        this.sound.fx("hitStay");
      }
      if(trick){
        this.showToast(this.i18n.t("trickToast", {
          w: name,
          pic: this._vision.word[this.i18n.lang] || this._vision.word.en,
        }), "good");
      }else if(this.streak === 5 || this.streak === 10 || this.streak === 15){
        this.showToast(`${this.streak} ${this.i18n.lang === "hi" ? "लगातार!" : this.i18n.lang === "hl" ? "lagataar!" : "in a row."}`, "good");
      }
    }else{
      this.wrong++;
      this.streak = 0;
      let line = "";
      if(meta.alt === "short") line = this.i18n.t("altitudeMissHigh", { w: name });
      else if(meta.alt === "over") line = this.i18n.t("altitudeMissLow", { w: name });
      else if(meta.alt === "stay") line = this.i18n.t("altitudeStay");
      else if(meta.gajar === "pause") line = this.i18n.t("gajarMissPause");
      else if(this.mode === "zameen") line = this.i18n.t(expected === "stay" ? "verdictMissStay" : "verdictMissFly") + " · " + this.i18n.t("zameenMiss");
      else if(this.mode === "filmi") line = this.i18n.t("filmiMiss");
      else line = this.i18n.pick(this.i18n.raw(w.flies ? "missFly" : "missStay")).replace("{w}", name);
      this.misses.unshift({
        w,
        lifted: didLift,
        pic: trick ? this._vision.word : null,
        note: line,
      });
      if(MODES[this.mode].lives > 0) this.lives = Math.max(0, this.lives - 1);
      if(this.mode === "sprint") this.timeLeft = Math.max(0, this.timeLeft - 2);
      this.el.call.classList.add("is-miss");
      this.showVerdict(this.i18n.t(expected === "stay" ? "verdictMissStay" : "verdictMissFly"), "bad");
      this.sound.fx("miss");
      this.whack();
      this.shake();
      slipHand(this.el.hand);
      if(trick){
        this.showToast(this.i18n.t("trickToast", {
          w: name,
          pic: this._vision.word[this.i18n.lang] || this._vision.word.en,
        }), "bad");
      }else{
        this.showToast(line, "bad");
      }
    }
    this.updateHud();
  }

  endCall(){
    if(this.phase !== "judged") return;
    if(this.mode === "doHaath"){ this._endDuelCall(); return; }
    this._settleNpcs();
    this._clearRhythm();
    if(MODES[this.mode].lives > 0 && this.lives <= 0) return this.finish();
    if(this.mode === "daily" && this._lastMiss) return this.finish("daily");
    if(this.mode === "sprint" && this.timeLeft <= 0) return this.finish("time");
    this.phase = "settle";
    this.el.call.classList.remove("is-fly", "is-stay", "is-miss");
    this.el.verdict.className = "call-verdict";
    if(this.word) this.el.word.classList.add("is-past");
    if(this.mode === "maya"){
      this.el.visionStage.hidden = true;
      this.vision.hide();
    }
    const gap = this.mode === "zen" ? 380
      : this.mode === "daily" ? 110
      : this.mode === "gajar" ? 210
      : 240;
    this.nextAt = this.now() + gap;
    this._vision = null;
    this.promptSettle();
  }

  finish(reason){
    this.phase = "over";
    this.sound.fx("over");
    this.sound.duck(true);
    this._clearNpcTimers();
    this._clearRhythm();
    this.vision.hide();
    this.el.visionStage.hidden = true;
    this.el.countdown.hidden = true;
    const daily = this.mode === "daily";
    let tenths = 0;
    if(daily){
      this.dailyTenths = this.dailyStart
        ? (reason === "full" ? 300 : clamp(Math.round((this.now() - this.dailyStart) / 100), 0, 300))
        : 0;
      tenths = this.dailyTenths;
    }
    const total = this.correct + this.wrong;
    const acc = total ? this.correct / total : 0;
    const isNew = daily
      ? store.setDailyBest(this.dailySeed, tenths)
      : store.setBest(this.mode, this.score);
    if(isNew) setTimeout(() => this.sound.fx("best"), 620);
    if(typeof this.onBest === "function") this.onBest();

    let kicker = this.i18n.t(daily ? "dailyOver" : this.mode === "sprint" ? "timesUp" : "overKickerLives");
    if(isNew) kicker += ` · ${this.i18n.t("newBest")}`;
    this.el.overKicker.textContent = kicker;
    this.el.overTitle.textContent = this.i18n.t(daily ? (tenths >= 250 ? "shabash" : "arre") : acc >= 0.8 ? "shabash" : "arre");
    const vKey = acc >= 0.95 ? "verdictUstad" : acc >= 0.85 ? "verdictFlock" : acc >= 0.7 ? "verdictGood" : acc >= 0.5 ? "verdictLearning" : "verdictChairs";
    this.el.overVerdict.textContent = this.i18n.t(vKey);
    this.el.overScore.textContent = this.score;
    this.el.overBest.textContent = daily ? fmtTenths(store.dailyBest(this.dailySeed)) : store.best(this.mode);
    this.el.overAcc.textContent = `${Math.round(acc * 100)}%`;
    this.el.overStreak.textContent = this.bestStreak;

    this.el.dailyBoard.hidden = !daily;
    if(daily){
      this.el.overSurvived.textContent = fmtTenths(tenths);
      this.el.overDailyNote.textContent = this.i18n.t(reason === "full" ? "dailyFull" : "dailyFalseLift");
      this.renderDailyLadder();
    }

    const box = this.el.overMisses;
    box.replaceChildren();
    if(!this.misses.length){
      const p = document.createElement("p");
      p.className = "over-none";
      p.textContent = this.i18n.t("overNoMiss");
      box.append(p);
    }else{
      this.misses.slice(0, 3).forEach((m) => {
        const row = document.createElement("div");
        row.className = "over-miss";
        const mark = document.createElement("span");
        mark.className = "w";
        mark.textContent = "×";
        const name = document.createElement("b");
        name.textContent = m.w[this.i18n.lang] || m.w.en;
        const why = document.createElement("span");
        const note = m.note || (m.w.note && m.w.note[this.i18n.lang]);
        let text = note || this.i18n.t(m.w.flies ? "explainFly" : "explainStay");
        if(m.pic) text += ` · ${this.i18n.t("missPicture", { w: m.pic[this.i18n.lang] || m.pic.en })}`;
        why.textContent = text;
        row.append(mark, name, why);
        box.append(row);
      });
    }

    this.hideOverlays();
    this.el.over.hidden = false;
    this.scene.spawnBirds(daily ? 4 : 7, true);
    try{ navigator.vibrate && navigator.vibrate([18, 60, 18]); }catch{}
  }

  renderDailyLadder(){
    if(!this.el.dailyLadderList) return;
    const mine = Math.max(this.dailyTenths, store.dailyBest(this.dailySeed));
    const rows = dailyLadder(this.dailySeed, mine);
    this.el.dailyLadderList.replaceChildren();
    rows.forEach((r, i) => {
      const li = document.createElement("li");
      if(r.you) li.className = "is-you";
      const rank = document.createElement("span");
      rank.className = "rank";
      rank.textContent = String(i + 1).padStart(2, "0");
      const who = document.createElement("span");
      who.className = "who";
      who.textContent = r.you ? this.i18n.t("dailyYou") : r.name;
      const ms = document.createElement("span");
      ms.className = "ms";
      ms.textContent = fmtTenths(r.tenths);
      li.append(rank, who, ms);
      this.el.dailyLadderList.append(li);
    });
  }

  /* ---------------------------------------------------------------- pause */
  togglePause(){
    if(this.phase === "paused") this.resume();
    else this.pause();
  }
  pause(){
    if(!["call", "settle", "judged"].includes(this.phase)) return;
    this._prevPhase = this.phase;
    this._pauseAt = performance.now();
    this.phase = "paused";
    this.vision.pause();
    this.el.pause.hidden = false;
    this.sound.duck(true);
    clearTimeout(this._rhythmTimer);
    this.sound.stopSpeech();
  }
  resume(){
    if(this.phase !== "paused") return;
    this._shift += performance.now() - this._pauseAt;
    this.phase = this._prevPhase || "settle";
    this.vision.resume();
    this.el.pause.hidden = true;
    this.sound.duck(false);
    if(this.mode === "gajar" && this.phase === "call" && this.word) this._speakGajar(this.word);
  }

  /* ----------------------------------------------------------------- loop */
  _frame(now){
    requestAnimationFrame(this._tick);
    if(this.el.layer.hidden) return;
    const dt = Math.min(0.12, (now - this._lastFrame) / 1000);
    this._lastFrame = now;
    if(this.phase === "paused" || this.phase === "over" || this.phase === "intro" || this.phase === "idle" || this.phase === "count" || this.phase === "pick") return;

    const t = this.now();

    if(this.mode === "sprint" && this.timeLeft > 0){
      this.timeLeft = Math.max(0, this.timeLeft - dt);
      const shown = Math.ceil(this.timeLeft);
      if(shown !== this._shownTime){
        this._shownTime = shown;
        this.el.time.querySelector("b").textContent = shown;
        this.el.time.classList.toggle("is-low", shown <= 10);
      }
      if(this.timeLeft <= 0){ this.finish("time"); return; }
    }

    if(this.mode === "daily" && this.dailyStart){
      this.timeLeft = Math.max(0, 30 - (t - this.dailyStart) / 1000);
      const shown = Math.ceil(this.timeLeft);
      if(shown !== this._shownTime){
        this._shownTime = shown;
        this.el.time.querySelector("b").textContent = shown;
        this.el.time.classList.toggle("is-low", shown <= 8);
      }
      if(this.timeLeft <= 0){ this.finish("full"); return; }
    }

    if(this.mode === "zameen"){
      if(!this._flipAt) this._flipAt = t + 10000;
      if(t >= this._flipAt && this.phase !== "call" && this.phase !== "judged") this._flipZameen(t);
      this.updateZameen(t);
    }

    if(this.mode === "doHaath" && this.duel){
      if(this.phase === "call"){
        const elapsed = t - this.callStart;
        const p = clamp(1 - elapsed / this.windowMs, 0, 1);
        this.el.meter.style.transform = `scaleX(${p})`;
        this.el.meter.classList.toggle("warn", p < 0.34);
        if(elapsed >= this.windowMs){
          this.duel.done = true;
          const allGood = ["left", "right"].every((s) => !this.duel[s].flies || this.duel.lifted[s]);
          this._duelJudge(allGood);
        }
        return;
      }
      if(this.phase === "judged"){
        const wait = this._lastMiss ? 620 : 380;
        if(t - this.judgedAt >= wait) this.endCall();
        return;
      }
      if(this.phase === "settle"){
        if(this.nextAt && t >= this.nextAt) this.startCall();
        return;
      }
      return;
    }

    if(this.phase === "call" && this.word){
      const elapsed = t - this.callStart;
      const p = clamp(1 - elapsed / this.windowMs, 0, 1);
      this.el.meter.style.transform = `scaleX(${p})`;
      this.el.meter.classList.toggle("warn", p < 0.34);
      if(elapsed >= this.windowMs){
        this.judge(this.answer === "stay", { timeout: true });
      }
    }else if(this.phase === "judged"){
      const wait = (this.mode === "maya" && this._vision?.trick) ? 760
        : this.mode === "daily" ? 170
        : this._lastMiss ? 520 : 360;
      if(t - this.judgedAt >= wait) this.endCall();
    }else if(this.phase === "settle"){
      if(this.nextAt && t >= this.nextAt) this.startCall();
    }
  }

  /* ------------------------------------------------------------------ hud */
  updateHud(force){
    this.el.score.textContent = this.score;
    this.el.streak.textContent = this.streak;
    if(this.mode === "sprint" || this.mode === "daily"){
      this.el.time.querySelector("b").textContent = Math.ceil(this.timeLeft);
    }
    if(MODES[this.mode].lives > 0) this.renderLives(force);
  }

  renderLives(){
    const b = this.el.lives.querySelector("b");
    const total = MODES[this.mode].lives || 0;
    const lost = total - this.lives;
    b.innerHTML = Array.from({ length: total }, (_, i) =>
      `<svg class="feather${i < lost ? " gone" : ""}" viewBox="0 0 24 24"><use href="#i-feather"/></svg>`
    ).join("");
  }

  /* --------------------------------------------------------------- effects */
  showVerdict(text, kind){
    const v = this.el.verdict;
    v.textContent = text;
    v.style.color = kind === "good" ? "var(--marigold)" : "var(--rose)";
    v.classList.remove("show");
    void v.offsetWidth;
    v.classList.add("show");
  }

  scorePop(points){
    const s = document.createElement("span");
    s.className = "score-pop";
    s.textContent = `+${points}`;
    this.el.flock.append(s);
    setTimeout(() => s.remove(), 1000);
  }

  freedBird(){
    const b = document.createElement("span");
    b.className = "freed";
    const dx = (Math.random() * 160 - 80).toFixed(0);
    const dy = (-80 - Math.random() * 90).toFixed(0);
    b.style.setProperty("--dx", `${dx}px`);
    b.style.setProperty("--dy", `${dy}px`);
    b.style.setProperty("--rot", `${(Math.random() * 24 - 12).toFixed(0)}deg`);
    b.innerHTML = `<svg><use href="#i-bird"/></svg>`;
    this.el.flock.append(b);
    setTimeout(() => b.remove(), 1200);
  }

  pulsePalm(){
    const r = this.el.ripples;
    if(!r) return;
    r.classList.remove("go");
    void r.offsetWidth;
    r.classList.add("go");
  }

  whack(){
    const box = this.el.whacks;
    box.replaceChildren();
    const angles = [-140, -70, 0, 70, 140];
    angles.forEach((a, i) => {
      const s = document.createElement("span");
      s.className = "whack";
      s.style.setProperty("--a", `${a}deg`);
      s.style.setProperty("--a2", `${(i % 2 ? -1 : 1) * 26}deg`);
      s.style.setProperty("--wd", `${i * 0.05}s`);
      s.innerHTML = `<svg viewBox="0 0 24 24"><use href="#i-hand"/></svg>`;
      box.append(s);
      requestAnimationFrame(() => s.classList.add("go"));
      setTimeout(() => s.remove(), 900);
    });
  }

  shake(){
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layer = this.el.layer;
    layer.classList.remove("shake");
    void layer.offsetWidth;
    layer.classList.add("shake");
    setTimeout(() => layer.classList.remove("shake"), 420);
  }

  showToast(text, kind = ""){
    const el = this.el.toast;
    el.textContent = text;
    el.className = `play-toast show ${kind}`.trim();
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  hideOverlays(){
    for(const o of [this.el.intro, this.el.pause, this.el.over, this.el.pick]) o.hidden = true;
    this.el.countdown.hidden = true;
  }
}
