/* Tiny persistence layer — settings and best scores, kept on this device. */

const KEY = "chiriya-udd.v1";

const defaults = {
  lang: "en",
  theme: "dark",
  sound: true,
  music: true,
  musicVol: 0.38,
  sfxVol: 0.72,
  pace: "normal",
  camera: 0,
  mode: "classic",
  best: { classic: 0, sprint: 0, zen: 0, maya: 0 },
  plays: 0,
};

function read(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return { ...defaults, best: { ...defaults.best } };
    const parsed = JSON.parse(raw);
    return {
      ...defaults,
      ...parsed,
      best: { ...defaults.best, ...(parsed.best || {}) },
    };
  }catch{
    return { ...defaults, best: { ...defaults.best } };
  }
}

let state = read();

function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch{ /* private mode */ }
}

export const store = {
  get(key){ return state[key]; },
  set(key, value){ state[key] = value; save(); },
  best(mode){ return Number(state.best[mode] || 0); },
  setBest(mode, score){
    const prev = this.best(mode);
    if(score > prev){ state.best[mode] = score; save(); return true; }
    return false;
  },
  bumpPlay(){ state.plays = (state.plays || 0) + 1; save(); },
};
