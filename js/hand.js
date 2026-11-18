/* ==========================================================================
   A hand for the palm — five fingers, nails, creases, and a little flinch.
   Drawn as inline SVG so every finger can move on its own.
   ========================================================================== */

const FINGERS = [
  { name: "pinky",  x: 149, y: 72,  w: 19, h: 112, r: 9.5,  rot: "rotate(9 158 184)",
    nail: [154, 80, 9, 13], hi: [152, 92, 4, 72],
    crease: "M153 106q6 4 11 0M152 132q6 4 11 0M152 154q6 3 10 0",
    knuckle: [158.5, 116, 8.5, 4.2] },
  { name: "ring",   x: 123, y: 44,  w: 21, h: 140, r: 10.5, rot: "rotate(4 133 184)",
    nail: [128, 52, 10, 15], hi: [126, 66, 4.5, 94],
    crease: "M127 82q7 4 13 0M126 112q8 4 14 0M126 140q7 4 13 0",
    knuckle: [133.5, 96, 9.5, 4.5] },
  { name: "middle", x: 97,  y: 26,  w: 22, h: 158, r: 11,  rot: "rotate(-2 108 184)",
    nail: [102, 34, 10, 16], hi: [100, 48, 5, 108],
    crease: "M101 66q8 5 14 0M100 98q8 5 14 0M100 128q8 5 14 0M100 154q7 4 13 0",
    knuckle: [108, 82, 10, 4.8] },
  { name: "index",  x: 69,  y: 46,  w: 21, h: 138, r: 10.5, rot: "rotate(-7 79 184)",
    nail: [74, 54, 9.5, 15], hi: [72, 68, 4.5, 92],
    crease: "M73 84q7 4 13 0M72 114q8 4 14 0M72 142q7 4 13 0",
    knuckle: [79.5, 98, 9.5, 4.5] },
];

function finger(f, uid){
  const [nx, ny, nw, nh] = f.nail;
  const [kx, ky, krx, kry] = f.knuckle;
  return `
    <g class="fg fg-${f.name}" transform="${f.rot}">
      <g class="fg-in">
        <rect class="skin" x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" rx="${f.r}" fill="url(#skin-${uid})"/>
        <rect class="finger-hi" x="${f.hi[0]}" y="${f.hi[1]}" width="${f.hi[2]}" height="${f.hi[3]}" rx="2.2"/>
        <rect class="finger-shade" x="${f.x}" y="${f.y + f.h * 0.66}" width="${f.w}" height="${f.h * 0.34}" rx="${f.r}"/>
        <ellipse class="knuckle" cx="${kx}" cy="${ky}" rx="${krx}" ry="${kry}"/>
        <path class="crease" d="${f.crease}"/>
        <rect class="nail" x="${nx}" y="${ny}" width="${nw}" height="${nh}" rx="${nw / 2}" fill="url(#nail-${uid})"/>
        <path class="nail-moon" d="M${nx + 2.4} ${ny + nh - 3.4}q${nw / 2 - 2.4} -2.4 ${nw - 4.8} 0"/>
        <ellipse class="tip-glow" cx="${f.x + f.w / 2}" cy="${f.y + f.w * 0.52}" rx="${f.w * 0.28}" ry="${f.w * 0.18}"/>
      </g>
    </g>`;
}

export function handMarkup(uid = "h"){
  return `
  <svg class="hand-art" viewBox="0 0 230 268" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="skin-${uid}" x1="0.08" y1="0" x2="0.92" y2="1">
        <stop offset="0" stop-color="var(--skin-hi)"/>
        <stop offset=".38" stop-color="var(--skin-1)"/>
        <stop offset=".74" stop-color="var(--skin-2)"/>
        <stop offset="1" stop-color="var(--skin-3)"/>
      </linearGradient>
      <linearGradient id="nail-${uid}" x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0" stop-color="var(--nail-hi)"/>
        <stop offset=".55" stop-color="var(--nail-2)"/>
        <stop offset="1" stop-color="var(--skin-1)"/>
      </linearGradient>
      <radialGradient id="palmglow-${uid}" cx=".5" cy=".42" r=".62">
        <stop offset="0" stop-color="#fff" stop-opacity=".26"/>
        <stop offset=".64" stop-color="#fff" stop-opacity=".06"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <rect class="wrist" x="86" y="232" width="52" height="38" rx="20" fill="url(#skin-${uid})"/>
    <path class="wrist-shade" d="M86 246q26 8 52 0v22q-26 4-52 0z"/>

    ${FINGERS.map(f => finger(f, uid)).join("")}

    <path class="palm" d="M60 160c0-28 23-42 52-42s52 14 52 42v44c0 26-22 42-52 42s-52-16-52-42z" fill="url(#skin-${uid})"/>
    <path class="palm-fill" d="M60 160c0-28 23-42 52-42s52 14 52 42v44c0 26-22 42-52 42s-52-16-52-42z" fill="url(#palmglow-${uid})"/>
    <path class="palm-shade" d="M60 168c0 38 12 62 50 76-30-4-50-28-50-58z"/>
    <path class="thenar" d="M70 168c-8 18-6 38 6 52 8 10 18 14 28 16-16-24-20-46-16-68z"/>
    <path class="palm-hi" d="M78 142c18-13 50-14 70 0-24-7-48-7-70 0z"/>

    <g class="fg fg-thumb" transform="rotate(-46 64 202)">
      <g class="fg-in">
        <rect class="skin" x="42" y="138" width="26" height="68" rx="13" fill="url(#skin-${uid})"/>
        <rect class="finger-hi" x="46" y="152" width="4.8" height="40" rx="2.4"/>
        <rect class="finger-shade" x="42" y="176" width="26" height="30" rx="13"/>
        <ellipse class="knuckle" cx="55" cy="176" rx="11" ry="4.6"/>
        <path class="crease" d="M47 172q8 4 13 0M47 192q8 4 13 0"/>
        <rect class="nail" x="49" y="146" width="12" height="16" rx="6" fill="url(#nail-${uid})"/>
        <path class="nail-moon" d="M51.4 159.4q4.6-2.4 9.2 0"/>
        <ellipse class="tip-glow" cx="55" cy="149" rx="6.4" ry="4.2"/>
      </g>
    </g>

    <path class="palm-line" d="M76 168c21 13 47 14 74 5"/>
    <path class="palm-line" d="M80 194c23 10 46 9 67 0"/>
    <path class="palm-line" d="M84 150c12 20 30 38 56 50"/>
    <path class="palm-line faint" d="M73 210c18 8 38 8 54 0"/>
    <path class="wrist-line" d="M88 246q24 7 54 0"/>
  </svg>`;
}

export function mountHand(el, uid){
  if(el) el.innerHTML = handMarkup(uid);
  return el;
}

/** Let one finger slip first, then the whole hand flinches. */
export function slipHand(el){
  if(!el) return;
  el.classList.remove("is-slip");
  void el.offsetWidth;
  el.classList.add("is-slip");
  const fingerEls = el.querySelectorAll(".fg");
  if(fingerEls.length){
    fingerEls.forEach((f, i) => f.style.setProperty("--slip-delay", `${i * 0.045}s`));
  }
  setTimeout(() => {
    el.classList.remove("is-slip");
    fingerEls.forEach(f => f.style.removeProperty("--slip-delay"));
  }, 780);
}
