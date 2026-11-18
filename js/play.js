/* ==========================================================================
   The baithak — game state, the finger rule, scoring, and the friendly thwacks.
   One rule: hold the palm; lift only when it flies.
   Maya adds a 3D vision that sometimes lies on purpose.
   ========================================================================== */

import { WORDS, makeBag } from "./words.js";
import { store } from "./store.js";
import { slipHand, mountHand } from "./hand.js";
import { Vision, visualKey } from "./vision.js";

const $ = (id) => document.getElementById(id);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const MODES = {
  classic: { nameKey: "modeClassic", descKey: "modeIntroClassic", lives: 3 },
  sprint: { nameKey: "modeSprint", descKey: "modeIntroSprint", lives: 0 },
  zen: { nameKey: "modeZen", descKey: "modeIntroZen", lives: 0 },
  maya: { nameKey: "modeMaya", descKey: "modeIntroMaya", lives: 3 },
};

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
    };

    mountHand(this.el.hand, "palm");
    this.vision = new Vision($("visionCanvas"), { rate: 0.58 });

    this.phase = "idle";
    this.mode = MODES[store.get("mode")] ? store.get("mode") : "classic";
    this.fingerDown = false;
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

    this._bind();
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

    el.musicVol.value = Math.round((store.get("musicVol") ?? 0.38) * 100);
    el.sfxVol.value = Math.round((store.get("sfxVol") ?? 0.72) * 100);
    el.musicVol.addEventListener("input", () => {
      const v = el.musicVol.value / 100;
      store.set("musicVol", v);
      this.sound.setMusicVol(v);
    });
    el.sfxVol.addEventListener("input", () => {
      const v = el.sfxVol.value / 100;
      store.set("sfxVol", v);
      this.sound.setSfxVol(v);
    });

    el.palm.addEventListener("pointerdown", (e) => {
      if(e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      this.press(e.pointerId);
      try{ el.palm.setPointerCapture(e.pointerId); }catch{}
    });
    window.addEventListener("pointerup", (e) => {
      if(e.pointerType === "mouse" && e.button !== 0) return;
      if(this._pointerId == null || e.pointerId !== this._pointerId) return;
      this._pointerId = null;
      this.lift();
    });
    window.addEventListener("pointercancel", (e) => {
      if(this._pointerId == null || e.pointerId !== this._pointerId) return;
      this._pointerId = null;
      this.lift();
    });

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
        if(!e.repeat){
          this._pointerId = null;
          this.press();
        }
      }
      if(e.code === "Escape"){
        if(this.phase === "paused") this.resume();
        else if(this.phase === "call" || this.phase === "settle" || this.phase === "judged") this.pause();
        else if(this.phase === "intro" || this.phase === "over") this.exit();
        else if(this.phase === "pick") this.exit();
      }
    });
    window.addEventListener("keyup", (e) => {
      if(this.el.layer.hidden) return;
      if(e.code === "Space"){
        const tag = (e.target.tagName || "").toLowerCase();
        if(tag === "input" || tag === "textarea") return;
        e.preventDefault();
        this.lift();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if(document.hidden && (this.phase === "call" || this.phase === "settle" || this.phase === "judged")) this.pause();
    });
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
    this.phase = "pick";
    this.fingerDown = false;
    this._pointerId = null;
    this._vision = null;
    this.vision.hide();
    this.el.layer.hidden = false;
    this.el.layer.classList.remove("is-maya");
    this.el.pick.hidden = false;
    this.el.intro.hidden = true;
    this.el.pause.hidden = true;
    this.el.over.hidden = true;
    this.el.countdown.hidden = true;
    this.el.palm.classList.remove("is-down", "is-up");
    this.el.toast.classList.remove("show");
    this.el.visionStage.hidden = true;
    this.el.call.classList.remove("is-fly", "is-stay", "is-miss", "is-calling", "is-past");
    this.sound.duck(false);
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
    this.el.word.textContent = "चिड़िया";
    this.el.sub.textContent = "chidiya";
    this.el.kicker.firstElementChild.textContent = "";
    this.el.palmHint.textContent = this.i18n.t("getReady");
    if(this.mode === "maya"){
      this.el.visionStage.hidden = false;
      this.el.visionStage.classList.remove("is-trick", "is-true", "is-verdict");
      this.el.visionCaption.textContent = "";
      this.vision.show(WORDS.find(x => x.id === "chidiya") || WORDS[0]);
    }
  }

  /** Re-render the intro sheet after a language switch. */
  refreshIntro(){
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
    this.phase = "idle";
    this.fingerDown = false;
    this._pointerId = null;
    this._vision = null;
    this.vision.hide();
    this.el.layer.hidden = true;
    this.el.layer.classList.remove("is-maya");
    this.el.palm.classList.remove("is-down", "is-up");
    this.el.toast.classList.remove("show");
    this.el.visionStage.hidden = true;
    this.hideOverlays();
    this.el.countdown.hidden = true;
    this.sound.duck(false);
  }

  reset(){
    this.lives = MODES[this.mode].lives || 0;
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.correct = 0;
    this.wrong = 0;
    this.calls = 0;
    this.timeLeft = 45;
    this._shownTime = 45;
    this.windowMs = 1380;
    this.callStart = 0;
    this.judgedAt = 0;
    this.nextAt = 0;
    this._shift = 0;
    this._lastMiss = false;
    this.bag = makeBag();
    this.recent = [];
    this.misses = [];
    this.firstWord = true;
    this.word = null;
    this.fingerDown = false;
    this._vision = null;
    this.vision.hide();
    this.el.layer.classList.toggle("is-maya", this.mode === "maya");
    this.el.visionStage.hidden = this.mode !== "maya";
    this.el.visionStage.classList.remove("is-trick", "is-true", "is-verdict");
    this.el.visionCaption.textContent = "";
    this.el.meter.style.transform = "scaleX(1)";
    this.el.meter.classList.remove("warn");
    this.el.whacks.replaceChildren();
    this.el.flock.replaceChildren();
    this.el.verdict.className = "call-verdict";
    this.el.call.classList.remove("is-fly", "is-stay", "is-miss", "is-calling", "is-past");
    this.el.palm.classList.remove("is-down", "is-up");
    this.el.palm.setAttribute("aria-pressed", "false");
    this._pointerId = null;
    this.el.palmHint.textContent = this.i18n.t("holdPalm");
    this.el.palmHint.classList.remove("is-alert");
    this.el.toast.classList.remove("show", "bad", "good");
    this.el.speed.style.width = "0%";
    this.updateHud(true);
    this.el.time.hidden = this.mode !== "sprint";
    this.el.lives.hidden = !(this.mode === "classic" || this.mode === "maya");
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
    if(!this.fingerDown){ this.phase = "settle"; this.nextAt = 0; this.promptSettle(); return; }
    const first = this.calls === 0;
    const w = this.firstWord ? (WORDS.find(x => x.id === "chidiya") || WORDS[0]) : this.bag.next(this.recent);
    this.firstWord = false;
    this.word = w;
    this.phase = "call";
    this.calls++;
    this.windowMs = this.windowFor();
    this.callStart = this.now();
    this.judgedAt = 0;
    this._lastMiss = false;
    this.recent = [w.id, ...this.recent].slice(0, 5);
    this._vision = this.pickVision(w, first);

    this.el.call.classList.remove("is-fly", "is-stay", "is-miss", "is-past", "is-calling");
    void this.el.call.offsetWidth;
    this.el.call.classList.add("is-calling");
    this.el.word.classList.remove("is-past");
    this.el.word.textContent = w[this.i18n.lang] || w.en;
    this.el.sub.textContent = this.secondary(w);
    this.el.kicker.firstElementChild.textContent = this.mode === "zen"
      ? this.i18n.t(w.flies ? "hintFly" : "hintStay")
      : `${this.i18n.t("callWord")} ${String(this.calls).padStart(2, "0")} · ${this.i18n.t("speedWord")} ${this.speedLevel()}`;
    this.el.meter.style.transform = "scaleX(1)";
    this.el.meter.classList.remove("warn");
    this.el.verdict.className = "call-verdict";
    this.el.palmHint.textContent = "";
    this.el.palmHint.classList.remove("is-alert");
    this.el.speed.style.width = `${this.speedLevel() * 11}%`;

    if(this.mode === "maya" && this._vision){
      this.el.visionStage.hidden = false;
      this.el.visionStage.classList.remove("is-trick", "is-true", "is-verdict");
      this.el.visionCaption.textContent = "";
      this.vision.show(this._vision.word);
      this.vision.react("");
    }else{
      this.el.visionStage.hidden = true;
    }

    this.pulsePalm();
    this.sound.fx("tick");
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
    if(this.mode === "zen") return 1900;
    const base = this.mode === "sprint" ? 1180 : 1380;
    const floor = this.mode === "sprint" ? 520 : 600;
    return Math.max(floor, base - this.correct * 34);
  }

  speedLevel(){
    const base = this.mode === "sprint" ? 1180 : 1380;
    return clamp(1 + Math.round((base - this.windowMs) / 105), 1, 9);
  }

  press(pointerId = null){
    if(this.phase === "intro" || this.phase === "over" || this.phase === "idle" || this.phase === "paused" || this.phase === "pick") return;
    if(this.fingerDown) return;
    this.fingerDown = true;
    this._pointerId = pointerId;
    this.el.palm.classList.remove("is-up");
    this.el.palm.classList.add("is-down");
    this.el.palm.setAttribute("aria-pressed", "true");
    try{ navigator.vibrate && navigator.vibrate(8); }catch{}
    if(this.phase === "settle"){
      this.nextAt = this.now() + 120;
      this.el.palmHint.textContent = this.i18n.t("holdPalm");
      this.el.palmHint.classList.remove("is-alert");
    }
  }

  lift(){
    if(!this.fingerDown) return;
    this.fingerDown = false;
    this._pointerId = null;
    this.el.palm.classList.remove("is-down");
    this.el.palm.classList.add("is-up");
    this.el.palm.setAttribute("aria-pressed", "false");
    try{ navigator.vibrate && navigator.vibrate(10); }catch{}
    if(this.phase === "call"){
      if(this.word && this.word.flies) this.judge(true);
      else this.judge(false);
    }else if(this.phase === "settle"){
      this.nextAt = 0;
      this.promptSettle();
    }
  }

  promptSettle(){
    this.el.palmHint.textContent = this.fingerDown ? this.i18n.t("holdPalm") : this.i18n.t("placeFinger");
    this.el.palmHint.classList.toggle("is-alert", !this.fingerDown);
    this.el.kicker.firstElementChild.textContent = this.fingerDown ? "" : this.i18n.t("placeFinger");
    if(this.word) this.el.word.classList.add("is-past");
  }

  judge(hit){
    if(this.phase !== "call" || !this.word) return;
    const w = this.word;
    const trick = !!(this._vision && this._vision.trick);
    this.phase = "judged";
    this.judgedAt = this.now();
    this._lastMiss = !hit;
    this.el.meter.classList.remove("warn");
    this.el.call.classList.remove("is-calling");
    this.vision.react(hit ? "good" : "bad");

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
      this.el.call.classList.add(w.flies ? "is-fly" : "is-stay");
      this.showVerdict(this.i18n.t(trick ? "verdictSight" : (w.flies ? "verdictFly" : "verdictStay")), "good");
      this.scorePop(points);
      if(w.flies){
        this.sound.fx("hitFly");
        this.scene.spawnBirds(1 + Math.min(4, Math.floor(this.streak / 4)), true);
        this.freedBird();
      }else{
        this.sound.fx("hitStay");
      }
      if(trick){
        this.showToast(this.i18n.t("trickToast", {
          w: w[this.i18n.lang] || w.en,
          pic: this._vision.word[this.i18n.lang] || this._vision.word.en,
        }), "good");
      }else if(this.streak === 5 || this.streak === 10 || this.streak === 15){
        this.showToast(`${this.streak} ${this.i18n.lang === "hi" ? "लगातार!" : this.i18n.lang === "hl" ? "lagataar!" : "in a row."}`, "good");
      }
    }else{
      this.wrong++;
      this.streak = 0;
      this.misses.unshift({
        w,
        lifted: !w.flies,
        pic: trick ? this._vision.word : null,
      });
      if(this.mode === "classic" || this.mode === "maya") this.lives = Math.max(0, this.lives - 1);
      if(this.mode === "sprint") this.timeLeft = Math.max(0, this.timeLeft - 2);
      this.el.call.classList.add("is-miss");
      this.showVerdict(this.i18n.t(w.flies ? "verdictMissFly" : "verdictMissStay"), "bad");
      this.sound.fx("miss");
      this.whack();
      this.shake();
      slipHand(this.el.hand);
      if(trick){
        this.showToast(this.i18n.t("trickToast", {
          w: w[this.i18n.lang] || w.en,
          pic: this._vision.word[this.i18n.lang] || this._vision.word.en,
        }), "bad");
      }else{
        const line = this.i18n.pick(this.i18n.raw(w.flies ? "missFly" : "missStay"));
        this.showToast(line.replace("{w}", w[this.i18n.lang] || w.en), "bad");
      }
    }
    this.updateHud();
  }

  endCall(){
    if(this.phase !== "judged") return;
    if((this.mode === "classic" || this.mode === "maya") && this.lives <= 0) return this.finish();
    if(this.mode === "sprint" && this.timeLeft <= 0) return this.finish("time");
    this.phase = "settle";
    this.el.call.classList.remove("is-fly", "is-stay", "is-miss");
    this.el.verdict.className = "call-verdict";
    if(this.word) this.el.word.classList.add("is-past");
    if(this.mode === "maya"){
      this.el.visionStage.hidden = true;
      this.vision.hide();
    }
    const gap = this.mode === "zen" ? 380 : 240;
    this.nextAt = this.fingerDown ? this.now() + gap : 0;
    this._vision = null;
    this.promptSettle();
  }

  finish(reason){
    this.phase = "over";
    this.sound.fx("over");
    this.sound.duck(true);
    this.vision.hide();
    this.el.visionStage.hidden = true;
    this.el.countdown.hidden = true;
    const total = this.correct + this.wrong;
    const acc = total ? this.correct / total : 0;
    const isNew = store.setBest(this.mode, this.score);
    if(isNew) setTimeout(() => this.sound.fx("best"), 620);
    if(typeof this.onBest === "function") this.onBest();

    this.el.overKicker.textContent = this.i18n.t(this.mode === "sprint" ? "timesUp" : "overKickerLives")
      + (isNew ? ` · ${this.i18n.t("newBest")}` : "");
    this.el.overTitle.textContent = this.i18n.t(acc >= 0.8 ? "shabash" : "arre");
    const vKey = acc >= 0.95 ? "verdictUstad" : acc >= 0.85 ? "verdictFlock" : acc >= 0.7 ? "verdictGood" : acc >= 0.5 ? "verdictLearning" : "verdictChairs";
    this.el.overVerdict.textContent = this.i18n.t(vKey);
    this.el.overScore.textContent = this.score;
    this.el.overBest.textContent = store.best(this.mode);
    this.el.overAcc.textContent = `${Math.round(acc * 100)}%`;
    this.el.overStreak.textContent = this.bestStreak;

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
        const note = m.w.note && m.w.note[this.i18n.lang];
        let text = note || this.i18n.t(m.w.flies ? "explainFly" : "explainStay");
        if(m.pic) text += ` · ${this.i18n.t("missPicture", { w: m.pic[this.i18n.lang] || m.pic.en })}`;
        why.textContent = text;
        row.append(mark, name, why);
        box.append(row);
      });
    }

    this.hideOverlays();
    this.el.over.hidden = false;
    this.scene.spawnBirds(7, true);
    try{ navigator.vibrate && navigator.vibrate([18, 60, 18]); }catch{}
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
  }
  resume(){
    if(this.phase !== "paused") return;
    this._shift += performance.now() - this._pauseAt;
    this.phase = this._prevPhase || "settle";
    this.vision.resume();
    this.el.pause.hidden = true;
    this.sound.duck(false);
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

    if(this.phase === "call" && this.word){
      const elapsed = t - this.callStart;
      const p = clamp(1 - elapsed / this.windowMs, 0, 1);
      this.el.meter.style.transform = `scaleX(${p})`;
      this.el.meter.classList.toggle("warn", p < 0.34);
      if(elapsed >= this.windowMs){
        this.judge(this.word.flies ? false : true);
      }
    }else if(this.phase === "judged"){
      const wait = (this.mode === "maya" && this._vision?.trick) ? 760 : this._lastMiss ? 520 : 360;
      if(t - this.judgedAt >= wait) this.endCall();
    }else if(this.phase === "settle"){
      if(this.nextAt && t >= this.nextAt && this.fingerDown) this.startCall();
    }
  }

  /* ------------------------------------------------------------------ hud */
  updateHud(force){
    this.el.score.textContent = this.score;
    this.el.streak.textContent = this.streak;
    if(this.mode === "sprint"){
      this.el.time.querySelector("b").textContent = Math.ceil(this.timeLeft);
    }else{
      this.renderLives(force);
    }
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
