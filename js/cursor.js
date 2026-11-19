/* ==========================================================================
   Kingdom weather — a hummingbird streak follows the cursor, clicks release
   a small flock, the phoenix burns and rises from its ash, and nav birds fly.
   Desktop / fine-pointer only, and quiet under reduced motion.
   ========================================================================== */

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const rnd = (a, b) => a + Math.random() * (b - a);

function finePointer(){
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function still(){
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function playing(){
  return document.body.classList.contains("is-playing");
}

export function initCursorBirds({ onChirp } = {}){
  if(!finePointer() || still()) return;

  const layer = document.createElement("div");
  layer.className = "cursor-birds";
  layer.setAttribute("aria-hidden", "true");
  document.body.append(layer);

  let lx = -999, ly = -999, lt = 0;

  const spawn = (x, y, kind, dx, dy, rot, rot2, size) => {
    if(layer.childElementCount > 26) return;
    const el = document.createElement("span");
    el.className = `hum hum-${kind}`;
    el.style.setProperty("--x", `${(x - size / 2).toFixed(1)}px`);
    el.style.setProperty("--y", `${(y - size / 2).toFixed(1)}px`);
    el.style.setProperty("--dx", `${dx.toFixed(1)}px`);
    el.style.setProperty("--dy", `${dy.toFixed(1)}px`);
    el.style.setProperty("--rot", `${rot.toFixed(1)}deg`);
    el.style.setProperty("--rot2", `${rot2.toFixed(1)}deg`);
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.innerHTML = `<svg viewBox="0 0 32 32"><use href="#i-hummingbird"/></svg>`;
    layer.append(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 1600);
  };

  window.addEventListener("pointermove", (e) => {
    if(playing()) return;
    const now = performance.now();
    const dx = e.clientX - lx;
    const dy = e.clientY - ly;
    const dist = Math.hypot(dx, dy);
    if(dist < 22 || now - lt < 62) return;
    lx = e.clientX; ly = e.clientY; lt = now;

    const ang = Math.atan2(dy, dx) * 180 / Math.PI;
    const trail = clamp(dist * 0.55, 18, 52);
    spawn(
      e.clientX, e.clientY, "trail",
      Math.cos((ang * Math.PI) / 180) * trail,
      Math.sin((ang * Math.PI) / 180) * trail - rnd(4, 14),
      ang + rnd(-12, 12),
      ang + rnd(-26, 26),
      rnd(19, 27)
    );
  }, { passive: true });

  window.addEventListener("pointerdown", (e) => {
    if(e.pointerType === "mouse" && e.button !== 0) return;
    if(playing()) return;
    const n = 6;
    for(let i = 0; i < n; i++){
      const ang = (i / n) * 360 + rnd(-22, 22);
      const dist = rnd(54, 150);
      const rad = ang * Math.PI / 180;
      spawn(
        e.clientX, e.clientY, "release",
        Math.cos(rad) * dist,
        Math.sin(rad) * dist - rnd(10, 40),
        ang,
        ang + rnd(-35, 35),
        rnd(20, 29)
      );
    }
    if(typeof onChirp === "function") onChirp();
  }, { passive: true });
}

/** The phoenix turns its eye toward the pointer, then burns and returns. */
export function initPhoenix(){
  const phx = document.getElementById("heroPhoenix");
  if(!phx) return;

  const look = (e) => {
    const r = phx.getBoundingClientRect();
    if(!r.width) return;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = clamp((e.clientX - cx) / 130, -1, 1);
    const dy = clamp((e.clientY - cy) / 130, -1, 1);
    phx.style.setProperty("--phx-x", `${(dx * 1.15).toFixed(2)}px`);
    phx.style.setProperty("--phx-y", `${(dy * 1.15).toFixed(2)}px`);
    phx.style.setProperty("--phx-tilt", `${(dx * 5).toFixed(1)}deg`);
  };

  window.addEventListener("pointermove", look, { passive: true });
  window.addEventListener("pointerleave", () => {
    phx.style.setProperty("--phx-x", "0px");
    phx.style.setProperty("--phx-y", "0px");
    phx.style.setProperty("--phx-tilt", "0deg");
  }, { passive: true });

  if(still()) return;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const cycle = async () => {
    for(;;){
      phx.dataset.phase = "alive";
      await wait(rnd(10000, 15000));
      if(document.hidden){ await wait(5000); continue; }
      phx.dataset.phase = "burning";
      await wait(3000);
      phx.dataset.phase = "ash";
      await wait(3800);
      phx.dataset.phase = "rising";
      await wait(2300);
    }
  };
  cycle();
}

/** A matching bird flits across the top bar when a nav link is chosen. */
export function navFly(link){
  if(!link || still()) return;
  const bar = document.querySelector(".topbar");
  if(!bar) return;
  const br = bar.getBoundingClientRect();
  const lr = link.getBoundingClientRect();
  const icon = {
    play: "#i-falcon",
    explore: "#i-hummingbird",
    almanac: "#i-crane",
    how: "#i-peacock",
  }[link.dataset.nav] || "#i-hummingbird";

  const bird = document.createElement("span");
  bird.className = "nav-fly";
  bird.setAttribute("aria-hidden", "true");
  bird.style.left = `${lr.left - br.left + lr.width / 2}px`;
  bird.style.setProperty("--fly-x", `${rnd(br.width * 0.3, br.width * 0.58).toFixed(0)}px`);
  bird.style.color = ["#ffc56e", "#f0708c", "#5fd6e6"][Math.floor(Math.random() * 3)];
  bird.innerHTML = `<svg viewBox="0 0 64 64"><use href="${icon}"/></svg>`;
  bar.append(bird);
  bird.addEventListener("animationend", () => bird.remove(), { once: true });
  setTimeout(() => bird.remove(), 1300);
}
