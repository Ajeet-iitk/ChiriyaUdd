/* ==========================================================================
   Chiriya Udd — app shell: routing, tongues, themes, the explore shelf,
   the almanac, and one very small visualiser.
   ========================================================================== */

import { WORDS, WORD_COUNT } from "./words.js";
import { makeI18n, LANGS } from "./i18n.js";
import { Sound } from "./audio.js";
import { Scene } from "./scene.js";
import { Game } from "./play.js";
import { store } from "./store.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------- boot ---------- */
document.documentElement.dataset.theme = store.get("theme") || "dark";
document.documentElement.dataset.sound = store.get("sound") ? "on" : "off";
document.documentElement.dataset.music = store.get("music") ? "on" : "off";

const i18n = makeI18n();
const sound = new Sound();
const scene = new Scene($("#sky"));
const game = new Game({ sound, scene, i18n });

sound.setMusicVol(store.get("musicVol") ?? 0.38);
sound.setSfxVol(store.get("sfxVol") ?? 0.72);
sound.setSfx(!!store.get("sound"));
sound.setMusic(!!store.get("sound") && !!store.get("music"));
$("#musicBtn")?.setAttribute("aria-pressed", String(!!store.get("sound") && !!store.get("music")));
$("#soundBtn")?.setAttribute("aria-pressed", String(!!store.get("sound")));

/* ---------- theme ---------- */
function applyTheme(theme){
  document.documentElement.dataset.theme = theme;
  store.set("theme", theme);
  const meta = $('meta[name="theme-color"]');
  if(meta) meta.content = theme === "dark" ? "#0a0911" : "#faf4e9";
  $$(".swatch").forEach(s => s.classList.toggle("is-on", s.dataset.themePick === theme));
  scene.refresh();
}

/* ---------- language ---------- */
function applyLang(lang, persist = true){
  i18n.set(lang);
  if(persist) store.set("lang", lang);
  $$("[data-i18n]").forEach(el => { el.innerHTML = i18n.t(el.dataset.i18n); });
  $$("[data-i18n-ph]").forEach(el => { el.placeholder = i18n.t(el.dataset.i18nPh); });
  const meta = LANGS.find(l => l.id === lang) || LANGS[0];
  $("#langLabel").textContent = meta.label;
  $$(".lang-demo button").forEach(b => b.classList.toggle("is-on", b.dataset.langPick === lang));
  renderRibbon();
  renderAlmanac();
  renderAlmanacDemo();
  renderRuleCopy();
  updateArt();
  if(!$("#view-play").hidden && game.phase === "intro") game.open(game.mode);
}

/* ---------- home: scrolling word ribbon ---------- */
function renderRibbon(){
  const track = $("#ribbonTrack");
  if(!track) return;
  const picks = shuffle(WORDS.slice()).slice(0, 20);
  const html = picks.map(w =>
    `<span class="${w.flies ? "fly" : ""}">${w[i18n.lang] || w.en}</span>`
  ).join("");
  track.innerHTML = html + html;
}

/* ---------- home: hero art word ---------- */
let artTimer = null;
const artWord = $("#artWord");
const artSub = $("#artSub");
const artFinger = $("#artFinger");
function updateArt(){
  if(!artWord) return;
  const w = WORDS[Math.floor(Math.random() * WORDS.length)];
  artWord.style.opacity = "0";
  if(artFinger){
    artFinger.classList.remove("is-lift", "is-press");
    void artFinger.offsetWidth;
    artFinger.classList.add(w.flies ? "is-lift" : "is-press");
  }
  setTimeout(() => {
    artWord.textContent = w[i18n.lang] || w.en;
    artWord.className = `art-word ${w.flies ? "is-fly" : "is-stay"}`;
    artSub.textContent = w.flies ? i18n.t("flyShort") : i18n.t("stayShort");
    artWord.style.opacity = "1";
  }, 200);
}
function startArtCycle(){
  updateArt();
  if(artTimer) clearInterval(artTimer);
  artTimer = setInterval(updateArt, 4800);
}

/* ---------- hero birds ---------- */
function seedHeroBirds(){
  const box = $("#heroBirds");
  if(!box) return;
  for(let i = 0; i < 6; i++){
    const b = document.createElement("span");
    b.className = "hero-bird";
    b.style.top = `${8 + Math.random() * 46}%`;
    b.style.animationDelay = `${-Math.random() * 18}s`;
    b.style.animationDuration = `${13 + Math.random() * 12}s`;
    b.style.transform = `scale(${0.6 + Math.random() * 0.7})`;
    b.innerHTML = `<svg><use href="#i-bird"/></svg>`;
    box.append(b);
  }
}

/* ---------- almanac ---------- */
let almanacOrder = shuffle(WORDS.slice());
let almanacFilter = "all";

function shuffle(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function namesFor(w){
  if(i18n.lang === "en") return [w.hi, w.hl];
  if(i18n.lang === "hi") return [w.en, w.hl];
  return [w.hi, w.en];
}

function renderAlmanac(){
  const grid = $("#almanacGrid");
  if(!grid) return;
  const q = ($("#almanacSearch")?.value || "").trim().toLowerCase();
  const cats = i18n.raw("cats");
  const list = almanacOrder.filter(w => {
    if(almanacFilter === "fly" && !w.flies) return false;
    if(almanacFilter === "stay" && w.flies) return false;
    if(!q) return true;
    const hay = [w.en, w.hi, w.hl, w.note?.en, w.note?.hi, w.note?.hl].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(q);
  });

  grid.replaceChildren();
  list.forEach((w, i) => {
    const card = document.createElement("article");
    card.className = "al-card";
    card.style.animationDelay = `${Math.min(i, 20) * 14}ms`;

    const top = document.createElement("div");
    top.className = "al-card-top";
    const h = document.createElement("h3");
    h.textContent = w[i18n.lang] || w.en;
    const stamp = document.createElement("span");
    stamp.className = `stamp ${w.flies ? "y" : "n"}`;
    stamp.textContent = i18n.t(w.flies ? "flyShort" : "stayShort");
    top.append(h, stamp);

    const alt = document.createElement("div");
    alt.className = "alt";
    alt.textContent = namesFor(w).join(" · ");

    const cat = document.createElement("div");
    cat.className = "cat";
    cat.textContent = cats[w.cat] || w.cat;

    card.append(top, alt, cat);

    const note = w.note && w.note[i18n.lang];
    if(note){
      const p = document.createElement("p");
      p.className = "note";
      p.textContent = note;
      card.append(p);
    }
    grid.append(card);
  });

  const empty = $("#almanacEmpty");
  if(empty) empty.hidden = list.length > 0;
  const count = $("#almanacCount");
  if(count) count.textContent = i18n.t("ofNames", { n: list.length, total: WORD_COUNT });
}

/* ---------- explore: little demos ---------- */
let demoAlWords = null;
function renderAlmanacDemo(){
  const box = $("#almanacDemo");
  if(!box) return;
  if(!demoAlWords) demoAlWords = shuffle(WORDS.slice()).slice(0, 3);
  box.replaceChildren();
  demoAlWords.forEach(w => {
    const row = document.createElement("div");
    row.className = "al-row";
    const name = document.createElement("b");
    name.textContent = w[i18n.lang] || w.en;
    const v = document.createElement("span");
    v.className = `verdict ${w.flies ? "y" : "n"}`;
    v.textContent = w.flies ? i18n.t("flyShort") : i18n.t("stayShort");
    row.append(name, v);
    box.append(row);
  });
}

function releaseDemoFlock(){
  const box = $("#demoBirds");
  if(box){
    for(let i = 0; i < 12; i++){
      const b = document.createElement("span");
      b.className = "demo-bird";
      b.style.top = `${12 + Math.random() * 62}%`;
      b.style.setProperty("--dur", `${3.6 + Math.random() * 3.4}s`);
      b.style.setProperty("--delay", `${Math.random() * 0.9}s`);
      b.innerHTML = `<svg><use href="#i-bird"/></svg>`;
      box.append(b);
      requestAnimationFrame(() => b.classList.add("go"));
      setTimeout(() => b.remove(), 8000);
    }
  }
  scene.spawnBirds(10, true);
  sound.fx("hitFly");
}

const KEY_NOTES = [
  { label: "Sa", f: 293.66 }, { label: "Re", f: 311.13 }, { label: "Ga", f: 349.23 },
  { label: "Ma", f: 392.0 }, { label: "Pa", f: 415.3 }, { label: "Dha", f: 466.16 },
  { label: "Ni", f: 523.25 },
];

function buildKeys(){
  const box = $("#keysDemo");
  if(!box || box.children.length) return;
  KEY_NOTES.forEach(n => {
    const k = document.createElement("button");
    k.type = "button";
    k.className = "key";
    k.dataset.freq = n.f;
    k.setAttribute("aria-label", `Play ${n.label}`);
    const label = document.createElement("span");
    label.textContent = n.label;
    k.append(label);
    k.addEventListener("click", () => {
      sound.ensure();
      sound.santoor(n.f);
      k.classList.add("on");
      setTimeout(() => k.classList.remove("on"), 220);
    });
    box.append(k);
  });
}

function renderRuleCopy(){
  const copy = $("#ruleCopy");
  if(!copy) return;
  copy.innerHTML = `<p>${i18n.t("ruleNoteA")} <b>${i18n.t("ruleNoteB")}</b></p><p>${i18n.t("ruleNoteC")} <b>${i18n.t("ruleNoteD")}</b></p>`;
}

function bindRuleDemo(){
  const pad = $("#rulePad");
  const state = $("#ruleState");
  if(!pad) return;
  const down = () => {
    pad.classList.add("down");
    pad.classList.remove("up");
    state.textContent = i18n.t("ruleHold");
  };
  const up = () => {
    if(!pad.classList.contains("down")) return;
    pad.classList.remove("down");
    pad.classList.add("up");
    state.textContent = i18n.t("ruleUp");
    setTimeout(() => {
      pad.classList.remove("up");
      state.textContent = i18n.t("ruleIdle");
    }, 1200);
  };
  pad.addEventListener("pointerdown", e => { e.preventDefault(); down(); });
  window.addEventListener("pointerup", up);
}

/* ---------- visualiser ---------- */
let vizRaf = null;
function startViz(){
  const canvas = $("#viz");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  const draw = () => {
    vizRaf = requestAnimationFrame(draw);
    const explore = $("#view-explore");
    if(!explore || explore.hidden) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if(!w || !h) return;
    if(canvas.width !== Math.round(w * dpr)){
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const levels = sound.levels();
    const bars = 30;
    const gap = 2;
    const bw = (w - gap * (bars - 1)) / bars;
    const marigold = getComputedStyle(document.documentElement).getPropertyValue("--marigold").trim() || "#ffc56e";
    for(let i = 0; i < bars; i++){
      let v = 0;
      if(levels){
        const idx = Math.floor((i / bars) * levels.length * 0.6);
        v = levels[idx] / 255;
      }
      const bh = Math.max(2, v * h * 0.9);
      ctx.fillStyle = marigold;
      ctx.globalAlpha = 0.25 + v * 0.7;
      ctx.beginPath();
      const x = i * (bw + gap);
      const r = Math.min(bw / 2, 2);
      const y = (h - bh) / 2;
      ctx.roundRect ? ctx.roundRect(x, y, bw, bh, r) : ctx.rect(x, y, bw, bh);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };
  draw();
}

/* ---------- sound controls ---------- */
function applySound(){
  const s = !!store.get("sound");
  const m = !!store.get("music");
  document.documentElement.dataset.sound = s ? "on" : "off";
  document.documentElement.dataset.music = m ? "on" : "off";
  const musicBtn = $("#musicBtn");
  const soundBtn = $("#soundBtn");
  if(musicBtn) musicBtn.setAttribute("aria-pressed", String(s && m));
  if(soundBtn) soundBtn.setAttribute("aria-pressed", String(s));
  sound.setSfx(s);
  sound.setMusic(s && m);
  if(s && m){
    sound.ensure();
    sound.startMusic();
  }
}

function toggleSound(){
  store.set("sound", !store.get("sound"));
  applySound();
  if(store.get("sound")) sound.fx("ui");
  showToast(i18n.t(store.get("sound") ? "soundOn" : "soundOff"));
}

function toggleMusic(){
  store.set("music", !store.get("music"));
  if(store.get("music") && !store.get("sound")) store.set("sound", true);
  applySound();
  showToast(i18n.t(store.get("music") ? "musicOn" : "musicOff"));
}

/* ---------- toast ---------- */
let toastTimer = null;
function showToast(text){
  const el = $("#toast");
  if(!el || !text) return;
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

/* ---------- routing ---------- */
const VIEWS = ["home", "explore", "almanac", "how"];
function route(){
  const raw = decodeURIComponent(location.hash.replace(/^#\/?/, "")) || "home";
  const name = raw === "play" ? "play" : (VIEWS.includes(raw) ? raw : "home");
  const playing = name === "play";

  document.body.classList.toggle("is-playing", playing);
  VIEWS.forEach(v => {
    const el = $(`#view-${v}`);
    if(el) el.hidden = v !== name;
  });
  const playEl = $("#view-play");
  if(playEl) playEl.hidden = !playing;
  const footer = $(".footer");
  if(footer) footer.hidden = playing;

  $$(".nav a").forEach(a => a.classList.toggle("is-active", a.dataset.nav === name));

  if(playing){
    if(game.phase === "idle") game.open(store.get("mode") || "classic");
  }else if(game.phase !== "idle"){
    game.stop();
  }

  if(!playing) window.scrollTo({ top: 0, behavior: "instant" });
}

function goHome(){
  if(location.hash && location.hash !== "#home"){
    location.hash = "#home";
  }else{
    if(history.replaceState) history.replaceState(null, "", "#home");
    route();
  }
}

/* ---------- wire up ---------- */
function refreshBests(){
  $$("[data-best]").forEach(el => {
    const v = store.best(el.dataset.best);
    el.textContent = v > 0 ? v : "—";
  });
}

function init(){
  applyTheme(store.get("theme") || "dark");
  applyLang(store.get("lang") || "en", false);
  seedHeroBirds();
  startArtCycle();
  buildKeys();
  bindRuleDemo();
  startViz();
  refreshBests();
  $("#year").textContent = new Date().getFullYear();
  $("#factWords").textContent = WORD_COUNT;

  game.onExit = goHome;
  game.onBest = refreshBests;

  // top bar
  $("#themeBtn").addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
  $("#langBtn").addEventListener("click", () => {
    const idx = LANGS.findIndex(l => l.id === i18n.lang);
    applyLang(LANGS[(idx + 1) % LANGS.length].id);
    sound.fx("ui");
  });
  $("#soundBtn").addEventListener("click", toggleSound);
  const musicBtn = $("#musicBtn");
  if(musicBtn) musicBtn.addEventListener("click", toggleMusic);

  // modes
  $$("[data-play-mode]").forEach(btn => {
    btn.addEventListener("click", () => {
      store.set("mode", btn.dataset.playMode);
      location.hash = "#play";
    });
  });

  // almanac
  const search = $("#almanacSearch");
  if(search) search.addEventListener("input", renderAlmanac);
  $$("#almanacFilters .filter").forEach(btn => {
    btn.addEventListener("click", () => {
      almanacFilter = btn.dataset.filter;
      $$("#almanacFilters .filter").forEach(b => b.classList.toggle("is-on", b === btn));
      renderAlmanac();
      sound.fx("ui");
    });
  });
  const shuffleBtn = $("#almanacShuffle");
  if(shuffleBtn) shuffleBtn.addEventListener("click", () => {
    almanacOrder = shuffle(WORDS.slice());
    renderAlmanac();
    sound.fx("ui");
  });

  // explore
  const releaseBtn = $("#releaseBtn");
  if(releaseBtn) releaseBtn.addEventListener("click", releaseDemoFlock);
  $$("[data-theme-pick]").forEach(btn => {
    btn.addEventListener("click", () => applyTheme(btn.dataset.themePick));
  });
  $$("[data-lang-pick]").forEach(btn => {
    btn.addEventListener("click", () => {
      applyLang(btn.dataset.langPick);
      sound.fx("ui");
    });
  });

  // keyboard
  window.addEventListener("keydown", (e) => {
    if(e.code === "KeyM" && !e.ctrlKey && !e.metaKey && !e.altKey){
      const tag = (e.target.tagName || "").toLowerCase();
      if(tag === "input" || tag === "textarea") return;
      toggleSound();
    }
  });

  // first gesture wakes the audio
  const wake = () => {
    sound.ensure();
    if(store.get("sound") && store.get("music")) sound.startMusic();
    window.removeEventListener("pointerdown", wake);
    window.removeEventListener("keydown", wake);
  };
  window.addEventListener("pointerdown", wake, { once: true });
  window.addEventListener("keydown", wake, { once: true });

  // topbar shadow
  const top = $("#topbar");
  const onScroll = () => top.classList.toggle("is-stuck", window.scrollY > 12);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  window.addEventListener("hashchange", route);
  if(!location.hash) history.replaceState(null, "", "#home");
  route();

  // make sure a deep link to #play gets its intro sheet
  setTimeout(() => { if(location.hash === "#play" && game.phase === "idle") game.open(store.get("mode") || "classic"); }, 30);
}

init();
