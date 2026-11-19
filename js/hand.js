/* ==========================================================================
   A hand for the palm — one index finger in the game, the rest curled away.
   Five-finger company comes from the NPC ring around it.
   ========================================================================== */

export function handMarkup(uid = "h"){
  return `
  <svg class="hand-art" viewBox="0 0 200 276" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="skin-${uid}" x1="0.1" y1="0" x2="0.9" y2="1">
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
        <stop offset="0" stop-color="#fff" stop-opacity=".24"/>
        <stop offset=".64" stop-color="#fff" stop-opacity=".06"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <rect class="wrist" x="72" y="232" width="56" height="38" rx="18" fill="url(#skin-${uid})"/>
    <path class="wrist-shade" d="M72 248q28 8 56 0v22q-28 4-56 0z"/>
    <path class="wrist-line" d="M76 248q24 7 50 0"/>

    <!-- the folded middle, ring and little fingers, seen from the back -->
    <g class="curled">
      <path class="skin" d="M96 154c0-28 14-42 34-42 20 0 30 13 30 34v38c0 17-13 27-31 27-19 0-33-10-33-27z"
        fill="url(#skin-${uid})"/>
      <path class="finger-shade" d="M96 186c0 15 14 25 33 25 12 0 22-4 27-11-8 6-18 9-29 9-14 0-25-6-31-16z"/>
      <path class="finger-hi" d="M112 120c9-6 22-6 32-1-11-2-22-2-32 1z"/>
      <path class="crease" d="M104 132q14 8 26 1M102 158q16 8 29 1M104 184q14 7 25 1"/>
      <ellipse class="knuckle" cx="126" cy="150" rx="14" ry="5"/>
    </g>

    <!-- the palm, with the thumb folded across it -->
    <path class="palm" d="M56 158c0-22 18-34 46-34s46 12 46 34v50c0 24-19 38-46 38s-46-14-46-38z"
      fill="url(#skin-${uid})"/>
    <path class="palm-fill" d="M56 158c0-22 18-34 46-34s46 12 46 34v50c0 24-19 38-46 38s-46-14-46-38z"
      fill="url(#palmglow-${uid})"/>
    <path class="palm-shade" d="M56 170c0 38 12 60 46 74-28-4-46-26-46-54z"/>
    <path class="palm-hi" d="M72 138c16-12 46-13 64 0-22-6-44-6-64 0z"/>

    <g class="thumb">
      <path class="skin" d="M64 176c-12 10-14 26-4 38 9 11 24 12 34 4 7-6 8-16 3-24-6-10-19-20-33-18z"
        fill="url(#skin-${uid})"/>
      <path class="finger-shade" d="M60 206c6 10 18 14 29 9 6-3 9-8 9-14-2 6-7 10-13 12-9 3-19 0-25-7z"/>
      <path class="crease" d="M63 192q12 8 24 3"/>
      <ellipse class="knuckle" cx="80" cy="222" rx="9" ry="4"/>
    </g>

    <path class="palm-line" d="M68 166c22 14 52 15 82 4"/>
    <path class="palm-line" d="M70 192c24 11 50 10 76 0"/>
    <path class="palm-line faint" d="M74 214c20 8 44 8 64 0"/>

    <!-- the one finger that plays -->
    <g class="fg fg-index">
      <g class="fg-in">
        <rect class="skin" x="74" y="30" width="28" height="120" rx="14" fill="url(#skin-${uid})"/>
        <rect class="finger-hi" x="79" y="48" width="5.2" height="74" rx="2.6"/>
        <rect class="finger-shade" x="74" y="112" width="28" height="38" rx="14"/>
        <ellipse class="knuckle" cx="88" cy="100" rx="12.5" ry="5"/>
        <path class="crease" d="M79 64q9 5 18 0M79 88q9 5 18 0M79 110q8 4 17 0"/>
        <rect class="nail" x="81" y="38" width="14" height="21" rx="7" fill="url(#nail-${uid})"/>
        <path class="nail-moon" d="M84 54.5q4.6-2.4 9.2 0"/>
        <ellipse class="tip-glow" cx="88" cy="43" rx="7" ry="5"/>
      </g>
    </g>
  </svg>`;
}

/** A small index finger for one of the other players around the palm. */
export function npcMarkup(uid = "n"){
  return `
  <svg class="npc-finger-art" viewBox="0 0 34 100" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="nskin-${uid}" x1="0.15" y1="0" x2="0.85" y2="1">
        <stop offset="0" stop-color="var(--skin-hi)"/>
        <stop offset=".44" stop-color="var(--skin-1)"/>
        <stop offset="1" stop-color="var(--skin-3)"/>
      </linearGradient>
      <linearGradient id="nnail-${uid}" x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0" stop-color="var(--nail-hi)"/>
        <stop offset=".6" stop-color="var(--nail-2)"/>
        <stop offset="1" stop-color="var(--skin-1)"/>
      </linearGradient>
    </defs>
    <rect class="skin" x="7" y="3" width="20" height="94" rx="10" fill="url(#nskin-${uid})"/>
    <rect class="finger-hi" x="10.4" y="16" width="4" height="62" rx="2"/>
    <rect class="finger-shade" x="7" y="70" width="20" height="27" rx="10"/>
    <ellipse class="knuckle" cx="17" cy="52" rx="8.6" ry="3.6"/>
    <path class="crease" d="M11 34q6 3.4 12 0M11 48q6 3.4 12 0"/>
    <rect class="nail" x="12" y="9" width="10" height="15" rx="5" fill="url(#nnail-${uid})"/>
    <path class="nail-moon" d="M14 20.4q3-1.6 6 0"/>
    <path class="npc-band" d="M7 80q10 5 20 0v8q-10 4-20 0z"/>
  </svg>`;
}

export function mountHand(el, uid){
  if(el) el.innerHTML = handMarkup(uid);
  return el;
}

/** Let the index finger slip, then the knuckles flinch after it. */
export function slipHand(el){
  if(!el) return;
  el.classList.remove("is-slip");
  void el.offsetWidth;
  el.classList.add("is-slip");
  setTimeout(() => el.classList.remove("is-slip"), 720);
}
