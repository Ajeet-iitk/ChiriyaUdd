/* ==========================================================================
   Maya — a tiny flat-shaded 3D toybox. No libraries, no assets: just polygons
   turning slowly in the dark, and a picture that sometimes lies.
   ========================================================================== */

const TAU = Math.PI * 2;
const PI = Math.PI;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const C = {
  teal: "#4c9e93", tealDark: "#2f6f6a", tealLight: "#7cc4b8",
  marigold: "#efb45f", gold: "#d99a3f", ember: "#dd7444", rose: "#cf6480",
  cream: "#f2e3cd", white: "#faf3e6", ink: "#3a2f4a", inkSoft: "#5b4c6d",
  wood: "#96674a", woodDark: "#6d4831", leaf: "#5a8f5e", leafDark: "#3d6b45",
  sky: "#7fa9c9", steel: "#8a94a3", stone: "#9c928c", red: "#bb5148",
  blue: "#4e7fae", brown: "#7a5138", straw: "#d9b26a", paper: "#efe6d6",
};

/* ---------------------------------------------------------------- helpers */
function blank(){ return { faces: [] }; }

function hex(c){
  const h = c.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
const COL = new Map();
function rgb(c){
  if(!COL.has(c)) COL.set(c, hex(c));
  return COL.get(c);
}

function rotatePoint(p, c, r){
  let x = p[0] - c[0], y = p[1] - c[1], z = p[2] - c[2];
  if(r[0]){
    const a = Math.cos(r[0]), b = Math.sin(r[0]);
    [y, z] = [y * a - z * b, y * b + z * a];
  }
  if(r[1]){
    const a = Math.cos(r[1]), b = Math.sin(r[1]);
    [x, z] = [x * a + z * b, -x * b + z * a];
  }
  if(r[2]){
    const a = Math.cos(r[2]), b = Math.sin(r[2]);
    [x, y] = [x * a - y * b, x * b + y * a];
  }
  return [x + c[0], y + c[1], z + c[2]];
}

function face(m, pts, color, opts = {}){
  const c = rgb(color);
  if(opts.rot){
    const ctr = opts.center || [0, 0, 0];
    pts = pts.map(p => rotatePoint(p, ctr, opts.rot));
  }
  m.faces.push({ v: pts, c, glow: !!opts.glow });
}

function poly(m, pts, color, opts){ face(m, pts, color, opts); }

function box(m, at, size, color, rot, opts = {}){
  const [cx, cy, cz] = at;
  const [w, h, d] = size;
  const x0 = cx - w / 2, x1 = cx + w / 2;
  const y0 = cy - h / 2, y1 = cy + h / 2;
  const z0 = cz - d / 2, z1 = cz + d / 2;
  const opt = { rot, center: at, glow: opts.glow };
  face(m, [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], color, opt);
  face(m, [[x1, y0, z1], [x0, y0, z1], [x0, y1, z1], [x1, y1, z1]], color, opt);
  face(m, [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], color, opt);
  face(m, [[x0, y0, z1], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1]], color, opt);
  face(m, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], color, opt);
  face(m, [[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0]], color, opt);
}

function ell(m, at, radii, color, seg = 10, rings = 5, rot, opts = {}){
  const [cx, cy, cz] = at;
  const [rx, ry, rz] = radii;
  const opt = { rot, center: at, glow: opts.glow };
  for(let j = 0; j < rings; j++){
    const p0 = -PI / 2 + PI * j / rings;
    const p1 = -PI / 2 + PI * (j + 1) / rings;
    for(let i = 0; i < seg; i++){
      const t0 = TAU * i / seg, t1 = TAU * (i + 1) / seg;
      const pt = (p, t) => [cx + rx * Math.cos(p) * Math.cos(t), cy + ry * Math.sin(p), cz + rz * Math.cos(p) * Math.sin(t)];
      face(m, [pt(p0, t0), pt(p0, t1), pt(p1, t1), pt(p1, t0)], color, opt);
    }
  }
}

function cyl(m, at, r, h, color, seg = 10, rot, opts = {}){
  const [cx, cy, cz] = at;
  const y0 = cy - h / 2, y1 = cy + h / 2;
  const opt = { rot, center: at, glow: opts.glow };
  for(let i = 0; i < seg; i++){
    const t0 = TAU * i / seg, t1 = TAU * (i + 1) / seg;
    const p = (t, y) => [cx + r * Math.cos(t), y, cz + r * Math.sin(t)];
    face(m, [p(t0, y0), p(t1, y0), p(t1, y1), p(t0, y1)], color, opt);
  }
  const top = [], bot = [];
  for(let i = 0; i < seg; i++){
    const t = TAU * i / seg;
    top.push([cx + r * Math.cos(t), y1, cz + r * Math.sin(t)]);
    bot.push([cx + r * Math.cos(t), y0, cz + r * Math.sin(t)]);
  }
  face(m, top, opts.capColor || color, opt);
  face(m, bot, opts.capColor || color, opt);
}

function cone(m, at, r, h, color, seg = 10, rot, opts = {}){
  const [cx, cy, cz] = at;
  const opt = { rot, center: at, glow: opts.glow };
  const y0 = cy - h / 2, apex = [cx, cy + h / 2, cz];
  const ring = [];
  for(let i = 0; i < seg; i++){
    const t = TAU * i / seg;
    ring.push([cx + r * Math.cos(t), y0, cz + r * Math.sin(t)]);
  }
  for(let i = 0; i < seg; i++) face(m, [ring[i], ring[(i + 1) % seg], apex], color, opt);
  face(m, ring.slice().reverse(), opts.capColor || color, opt);
}

function tor(m, at, R, r, color, segU = 12, segV = 4, rot, opts = {}){
  const [cx, cy, cz] = at;
  const opt = { rot, center: at, glow: opts.glow };
  const pt = (u, v) => {
    const a = TAU * u / segU, b = TAU * v / segV;
    const rr = R + r * Math.cos(b);
    return [cx + rr * Math.cos(a), cy + r * Math.sin(b), cz + rr * Math.sin(a)];
  };
  for(let u = 0; u < segU; u++){
    for(let v = 0; v < segV; v++){
      face(m, [pt(u, v), pt(u + 1, v), pt(u + 1, v + 1), pt(u, v + 1)], color, opt);
    }
  }
}

/* ---------------------------------------------------------------- models */
const MODELS = {
  bird(m){
    ell(m, [0, 0, 0], [.42, .32, .34], C.teal, 10, 5);
    ell(m, [.36, .2, .02], [.21, .2, .21], C.teal);
    cone(m, [.56, .19, .02], .09, .22, C.marigold, 8, [0, 0, -PI / 2]);
    box(m, [-.48, .04, 0], [.3, .05, .24], C.tealDark, [0, 0, .18]);
    box(m, [.02, .12, .3], [.4, .05, .34], C.tealLight, [.3, 0, .25]);
    box(m, [.02, .12, -.3], [.4, .05, .34], C.tealLight, [-.3, 0, -.25]);
    ell(m, [.46, .27, .12], [.028, .028, .028], C.ink, 6, 3);
    ell(m, [.46, .27, -.08], [.028, .028, .028], C.ink, 6, 3);
  },
  groundbird(m){
    ell(m, [0, -.02, 0], [.34, .44, .32], C.inkSoft, 10, 5);
    ell(m, [0, -.06, .16], [.24, .34, .16], C.cream, 10, 5);
    ell(m, [0, .46, .04], [.22, .22, .22], C.inkSoft);
    cone(m, [0, .44, .28], .09, .24, C.marigold, 8, [PI / 2, 0, 0]);
    box(m, [-.3, .02, 0], [.08, .3, .24], C.inkSoft, [0, 0, -.2]);
    box(m, [.3, .02, 0], [.08, .3, .24], C.inkSoft, [0, 0, .2]);
    cyl(m, [-.12, -.58, 0], .04, .28, C.marigold, 6);
    cyl(m, [.12, -.58, 0], .04, .28, C.marigold, 6);
    box(m, [-.12, -.73, .05], [.14, .04, .2], C.marigold);
    box(m, [.12, -.73, .05], [.14, .04, .2], C.marigold);
  },
  butterfly(m){
    cyl(m, [0, 0, 0], .045, .46, C.ink, 6);
    ell(m, [0, .26, 0], [.09, .09, .09], C.inkSoft);
    box(m, [-.22, .12, .1], [.36, .025, .26], C.marigold, [0, .35, .45]);
    box(m, [.22, .12, .1], [.36, .025, .26], C.rose, [0, -.35, -.45]);
    box(m, [-.2, .04, -.12], [.3, .025, .22], C.rose, [0, -.3, .3]);
    box(m, [.2, .04, -.12], [.3, .025, .22], C.marigold, [0, .3, -.3]);
    cyl(m, [-.04, .34, .02], .012, .22, C.ink, 4, [0, 0, .4]);
    cyl(m, [.04, .34, .02], .012, .22, C.ink, 4, [0, 0, -.4]);
  },
  bug(m, opts){
    const body = opts?.fire ? "#f6d873" : C.marigold;
    ell(m, [0, 0, 0], [.24, .18, .34], body, 10, 5);
    ell(m, [0, .06, .26], [.16, .16, .16], C.inkSoft);
    ell(m, [0, .02, -.34], [.13, .12, .13], opts?.fire ? C.marigold : C.inkSoft, 8, 4, null, { glow: !!opts?.fire });
    box(m, [-.18, .14, .02], [.24, .02, .3], C.cream, [0, 0, .3]);
    box(m, [.18, .14, .02], [.24, .02, .3], C.cream, [0, 0, -.3]);
    for(let i = 0; i < 3; i++){
      const z = -.18 + i * .18;
      cyl(m, [-.2, -.12, z], .014, .24, C.ink, 4, [0, 0, 1.1]);
      cyl(m, [.2, -.12, z], .014, .24, C.ink, 4, [0, 0, -1.1]);
    }
  },
  plane(m){
    cyl(m, [0, 0, .05], .15, 1.15, C.cream, 10, [PI / 2, 0, 0]);
    cone(m, [0, 0, .72], .15, .3, C.cream, 10, [PI / 2, 0, 0]);
    box(m, [0, 0, .08], [1.25, .055, .3], C.rose, [0, 0, 0]);
    box(m, [0, .12, -.46], [.06, .3, .2], C.rose);
    box(m, [0, 0, -.48], [.46, .05, .18], C.rose);
    cyl(m, [-.3, -.14, .1], .07, .3, C.ember, 8, [PI / 2, 0, 0]);
    cyl(m, [.3, -.14, .1], .07, .3, C.ember, 8, [PI / 2, 0, 0]);
    box(m, [0, .05, .55], [.18, .03, .2], C.sky);
  },
  helicopter(m){
    ell(m, [0, 0, 0], [.34, .28, .56], C.ember, 10, 5);
    ell(m, [0, .05, .4], [.22, .18, .2], C.sky, 8, 4);
    box(m, [0, .07, -.66], [.09, .09, .74], C.ember);
    box(m, [0, .2, -.98], [.05, .28, .14], C.ember);
    cyl(m, [0, .32, 0], .035, .16, C.ink, 6);
    box(m, [0, .42, 0], [1.25, .025, .07], C.inkSoft);
    box(m, [0, .42, 0], [.07, .025, 1.25], C.inkSoft);
    box(m, [-.2, -.3, 0], [.05, .05, .66], C.inkSoft);
    box(m, [.2, -.3, 0], [.05, .05, .66], C.inkSoft);
    box(m, [-.2, -.18, .2], [.04, .24, .04], C.inkSoft, [0, 0, .25]);
    box(m, [.2, -.18, .2], [.04, .24, .04], C.inkSoft, [0, 0, -.25]);
  },
  rocket(m){
    cyl(m, [0, .05, 0], .22, .94, C.cream, 10);
    cone(m, [0, .72, 0], .22, .36, C.rose, 10);
    cone(m, [0, -.62, 0], .15, .34, C.marigold, 8, [PI, 0, 0], { glow: true });
    for(let i = 0; i < 3; i++){
      const a = TAU * i / 3;
      box(m, [Math.cos(a) * .26, -.34, Math.sin(a) * .26], [.05, .34, .22], C.rose, [0, -a, 0]);
    }
    ell(m, [0, .18, .22], [.09, .09, .04], C.sky, 8, 4);
    cyl(m, [0, -.34, 0], .23, .06, C.inkSoft, 10);
  },
  kite(m){
    box(m, [0, .18, 0], [.62, .62, .035], C.rose, [0, 0, PI / 4]);
    box(m, [0, .18, .02], [.05, .84, .02], C.inkSoft);
    box(m, [0, .18, .02], [.84, .05, .02], C.inkSoft);
    for(let i = 0; i < 4; i++){
      const x = Math.sin(i * 1.4) * .12;
      box(m, [x, -.28 - i * .22, 0], [.14, .1, .02], i % 2 ? C.marigold : C.teal, [0, 0, .5]);
    }
  },
  balloon(m){
    ell(m, [0, .28, 0], [.42, .46, .42], C.ember, 12, 6);
    ell(m, [0, .28, 0], [.43, .3, .43], C.marigold, 12, 4);
    box(m, [0, -.42, 0], [.24, .2, .24], C.wood);
    for(const [x, z] of [[-.12, -.07], [.12, -.07], [-.12, .07], [.12, .07]]){
      cyl(m, [x / 2, -.1, z / 2], .008, .3, C.inkSoft, 4, [0, 0, x > 0 ? .5 : -.5]);
    }
  },
  paperplane(m){
    const tip = [0, 0, .85], l = [-.55, .02, -.45], r = [.55, .02, -.45], b = [0, -.14, -.1];
    poly(m, [tip, l, b], C.paper);
    poly(m, [tip, b, r], C.cream);
    poly(m, [tip, r, l], C.white);
    poly(m, [l, r, b], C.cream);
  },
  dragon(m){
    ell(m, [0, 0, 0], [.3, .26, .5], C.leaf, 10, 5);
    cyl(m, [0, .22, .38], .1, .42, C.leafDark, 8, [.5, 0, 0]);
    box(m, [0, .44, .58], [.24, .2, .28], C.leaf, [.2, 0, 0]);
    cone(m, [-.08, .56, .52], .035, .14, C.cream, 5, [0, 0, .3]);
    cone(m, [.08, .56, .52], .035, .14, C.cream, 5, [0, 0, -.3]);
    ell(m, [.1, .48, .7], [.025, .025, .025], C.marigold, 5, 3);
    poly(m, [[-.2, .12, .1], [-.85, .5, -.1], [-.35, .05, -.25]], C.teal);
    poly(m, [[.2, .12, .1], [.85, .5, -.1], [.35, .05, -.25]], C.teal);
    poly(m, [[-.2, .12, .1], [-.85, .5, -.1], [-.2, .25, .1]], C.tealDark);
    poly(m, [[.2, .12, .1], [.85, .5, -.1], [.2, .25, .1]], C.tealDark);
    for(let i = 0; i < 3; i++) cone(m, [0, -.02 - i * .02, -.5 - i * .16], .1 - i * .02, .3, C.leaf, 7, [-PI / 2, 0, 0]);
  },
  carpet(m){
    box(m, [0, 0, 0], [1.25, .05, .82], C.rose);
    box(m, [0, .035, 0], [1.0, .02, .62], C.marigold);
    box(m, [0, .045, 0], [.7, .015, .38], C.teal);
    for(let i = 0; i < 6; i++){
      box(m, [-.5 + i * .2, -.02, .46], [.1, .03, .1], C.cream);
      box(m, [-.5 + i * .2, -.02, -.46], [.1, .03, .1], C.cream);
    }
  },
  broom(m){
    cyl(m, [0, .3, 0], .032, 1.05, C.wood, 6, [0, 0, .14]);
    cone(m, [0, -.42, -.01], .2, .46, C.straw, 10, [PI, 0, 0]);
    cyl(m, [0, -.2, 0], .085, .06, C.ember, 8);
  },
  fairy(m){
    ell(m, [0, .38, 0], [.12, .12, .12], C.cream, 8, 4);
    cone(m, [0, .1, 0], .17, .36, C.rose, 10);
    ell(m, [-.17, .26, -.04], [.18, .1, .02], C.white, 8, 4, [0, .4, .4]);
    ell(m, [.17, .26, -.04], [.18, .1, .02], C.white, 8, 4, [0, -.4, -.4]);
    cyl(m, [-.1, .18, .02], .018, .24, C.cream, 4, [0, 0, .8]);
    cyl(m, [.1, .18, .02], .018, .24, C.cream, 4, [0, 0, -.8]);
    cyl(m, [.2, .2, .05], .012, .3, C.marigold, 4, [0, 0, -.7]);
    ell(m, [.3, .34, .05], [.04, .04, .04], C.marigold, 6, 3, null, { glow: true });
  },
  quadruped(m){
    ell(m, [0, .04, 0], [.52, .27, .3], C.wood, 10, 5);
    ell(m, [0, .24, .4], [.21, .2, .21], C.wood);
    box(m, [0, .18, .58], [.18, .13, .14], C.woodDark);
    cone(m, [-.12, .42, .38], .05, .14, C.woodDark, 5, [0, 0, .4]);
    cone(m, [.12, .42, .38], .05, .14, C.woodDark, 5, [0, 0, -.4]);
    for(const sx of [-.32, .32]) for(const sz of [-.18, .18]){
      cyl(m, [sx, -.32, sz], .055, .38, C.woodDark, 6);
    }
    cyl(m, [0, .16, -.36], .03, .3, C.woodDark, 5, [-.5, 0, 0]);
    ell(m, [-.09, .33, .5], [.025, .025, .025], C.ink, 5, 3);
    ell(m, [.09, .33, .5], [.025, .025, .025], C.ink, 5, 3);
  },
  fish(m){
    ell(m, [0, 0, 0], [.5, .25, .18], C.sky, 10, 5);
    poly(m, [[-.45, 0, 0], [-.75, .24, 0], [-.75, -.24, 0]], C.teal);
    poly(m, [[-.45, 0, 0], [-.78, .1, 0], [-.7, -.3, 0]], C.tealDark);
    box(m, [0, .2, 0], [.34, .02, .2], C.tealLight, [0, 0, .1]);
    ell(m, [-.26, .06, .15], [.035, .035, .02], C.ink, 5, 3);
    for(let i = 0; i < 3; i++) box(m, [.05 - i * .13, -.02, .14], [.05, .12, .02], C.tealDark, [0, 0, .2]);
  },
  snake(m){
    let x = 0;
    for(let i = 0; i < 5; i++){
      x = Math.sin(i * 1.3) * .18;
      ell(m, [x, .24 - i * .16, .05 * i], [.15 - i * .012, .11, .16], i % 2 ? C.leaf : C.leafDark, 8, 4);
    }
    ell(m, [x, .36, -.18], [.17, .12, .18], C.leaf, 8, 4);
    ell(m, [x - .07, .4, -.26], [.03, .03, .02], C.ink, 5, 3);
    ell(m, [x + .07, .4, -.26], [.03, .03, .02], C.ink, 5, 3);
    cyl(m, [x, .3, -.4], .012, .18, C.rose, 4, [PI / 2, 0, 0]);
  },
  frog(m){
    ell(m, [0, -.08, 0], [.36, .2, .3], C.leaf, 10, 5);
    ell(m, [0, -.06, .24], [.2, .13, .18], C.leafDark, 8, 4);
    ell(m, [-.14, .12, .16], [.09, .09, .09], C.cream, 8, 4);
    ell(m, [.14, .12, .16], [.09, .09, .09], C.cream, 8, 4);
    ell(m, [-.14, .14, .22], [.035, .035, .02], C.ink, 5, 3);
    ell(m, [.14, .14, .22], [.035, .035, .02], C.ink, 5, 3);
    box(m, [-.26, -.16, .24], [.2, .06, .16], C.leafDark, [0, 0, .3]);
    box(m, [.26, -.16, .24], [.2, .06, .16], C.leafDark, [0, 0, -.3]);
    box(m, [-.24, -.16, -.16], [.26, .06, .16], C.leafDark, [0, 0, -.3]);
    box(m, [.24, -.16, -.16], [.26, .06, .16], C.leafDark, [0, 0, .3]);
  },
  chair(m){
    box(m, [0, .12, 0], [.7, .08, .66], C.wood);
    box(m, [0, .46, -.29], [.7, .62, .07], C.wood);
    for(const x of [-.28, .28]) for(const z of [-.26, .26]){
      box(m, [x, -.16, z], [.07, .48, .07], C.woodDark);
    }
    box(m, [0, .26, -.26], [.5, .3, .03], C.woodDark);
  },
  table(m){
    box(m, [0, .32, 0], [1.0, .08, .66], C.wood);
    for(const x of [-.42, .42]) for(const z of [-.26, .26]){
      box(m, [x, -.06, z], [.07, .68, .07], C.woodDark);
    }
  },
  sofa(m){
    box(m, [0, -.02, 0], [.92, .26, .52], C.rose);
    box(m, [0, .26, -.21], [.92, .42, .16], C.rose);
    box(m, [-.44, .1, 0], [.12, .38, .5], C.rose);
    box(m, [.44, .1, 0], [.12, .38, .5], C.rose);
    box(m, [-.2, .14, .02], [.38, .12, .42], C.cream, [0, 0, .04]);
    box(m, [.2, .14, .02], [.38, .12, .42], C.cream, [0, 0, -.04]);
  },
  cup(m){
    cyl(m, [0, 0, 0], .26, .34, C.cream, 12, null, { capColor: C.woodDark });
    cyl(m, [0, .14, 0], .2, .04, C.woodDark, 12);
    tor(m, [.3, 0, 0], .12, .035, C.cream, 10, 4, [PI / 2, 0, 0]);
    cyl(m, [0, -.2, 0], .38, .035, C.cream, 14);
  },
  plate(m){
    cyl(m, [0, 0, 0], .52, .045, C.cream, 14);
    cyl(m, [0, .03, 0], .34, .02, C.marigold, 14);
    tor(m, [0, .02, 0], .45, .028, C.cream, 14, 3);
  },
  spoon(m){
    cyl(m, [0, .26, 0], .045, .72, C.steel, 8, [0, 0, .12]);
    ell(m, [0, -.22, 0], [.17, .22, .05], C.steel, 12, 5, [0, 0, .12]);
    ell(m, [0, -.21, .04], [.12, .16, .015], C.cream, 10, 3, [0, 0, .12]);
  },
  mirror(m){
    tor(m, [0, 0, 0], .44, .045, C.gold, 14, 4, [PI / 2, 0, 0]);
    ell(m, [0, 0, 0], [.4, .46, .03], C.steel, 14, 5);
    ell(m, [0, .05, .025], [.3, .34, .015], C.sky, 12, 4);
    box(m, [0, -.5, 0], [.1, .18, .06], C.gold);
    box(m, [0, -.6, .02], [.3, .04, .18], C.gold);
  },
  book(m){
    box(m, [0, 0, 0], [.72, .1, .92], C.ember);
    box(m, [0, .055, 0], [.68, .06, .84], C.paper);
    box(m, [-.35, 0, 0], [.05, .12, .92], C.rose);
    for(let i = 0; i < 4; i++) box(m, [0.02, .09, -.28 + i * .18], [.5, .01, .02], C.cream);
  },
  screen(m){
    box(m, [0, 0, 0], [.8, .5, .07], C.ink);
    box(m, [0, .01, .05], [.68, .4, .02], C.sky);
    box(m, [0, -.29, 0], [.1, .16, .07], C.inkSoft);
    box(m, [0, -.37, 0], [.34, .03, .18], C.inkSoft);
  },
  box(m){
    box(m, [0, 0, 0], [.8, .72, .6], C.wood);
    box(m, [0, .28, 0], [.84, .08, .64], C.woodDark);
    box(m, [0, .06, .31], [.16, .1, .04], C.marigold);
  },
  lamp(m){
    cyl(m, [0, -.3, 0], .3, .06, C.gold, 12);
    cyl(m, [0, -.18, 0], .22, .16, C.ember, 12);
    cone(m, [0, .02, 0], .08, .22, C.marigold, 8, null, { glow: true });
    cyl(m, [0, -.2, 0], .04, .06, C.cream, 6);
  },
  house(m){
    box(m, [0, -.02, 0], [.9, .68, .7], C.cream);
    poly(m, [[-.55, .32, .4], [.55, .32, .4], [0, .72, .4]], C.ember);
    poly(m, [[-.55, .32, -.4], [0, .72, -.4], [.55, .32, -.4]], C.ember);
    poly(m, [[-.55, .32, .4], [0, .72, .4], [0, .72, -.4], [-.55, .32, -.4]], C.rose);
    poly(m, [[.55, .32, .4], [.55, .32, -.4], [0, .72, -.4], [0, .72, .4]], C.rose);
    box(m, [0, -.14, .36], [.2, .42, .04], C.wood);
    box(m, [.28, -.02, .36], [.18, .16, .04], C.sky);
    box(m, [-.28, -.02, .36], [.18, .16, .04], C.sky);
  },
  tree(m){
    cyl(m, [0, -.28, 0], .09, .5, C.woodDark, 8);
    ell(m, [0, .18, 0], [.36, .3, .34], C.leaf, 10, 5);
    ell(m, [-.12, .38, .04], [.24, .2, .22], C.leafDark, 8, 4);
    ell(m, [.16, .34, -.05], [.2, .18, .2], C.leaf, 8, 4);
  },
  flower(m){
    cyl(m, [0, -.08, 0], .025, .72, C.leafDark, 5);
    ell(m, [-.18, -.08, 0], [.16, .06, .02], C.leaf, 6, 3, [0, 0, .4]);
    ell(m, [.18, -.2, 0], [.16, .06, .02], C.leaf, 6, 3, [0, 0, -.4]);
    ell(m, [0, .32, 0], [.1, .1, .1], C.marigold, 8, 4);
    for(let i = 0; i < 6; i++){
      const a = TAU * i / 6;
      ell(m, [Math.cos(a) * .2, .32, Math.sin(a) * .2], [.13, .04, .11], C.rose, 8, 4, [0, -a, 0]);
    }
  },
  mountain(m){
    cone(m, [-.14, -.06, 0], .62, .9, C.stone, 9);
    cone(m, [-.14, .42, 0], .19, .22, C.white, 9);
    cone(m, [.42, -.24, -.1], .4, .6, C.inkSoft, 8);
    cone(m, [.42, .09, -.1], .1, .14, C.white, 8);
  },
  river(m){
    for(let i = 0; i < 4; i++){
      box(m, [0, -.2, -.45 + i * .3], [1.4, .03, .18], i % 2 ? C.sky : C.blue, [0, 0, .04 - i * .02]);
    }
  },
  key(m){
    tor(m, [0, .28, 0], .16, .045, C.gold, 12, 4, [PI / 2, 0, 0]);
    box(m, [0, -.08, 0], [.08, .56, .06], C.gold);
    box(m, [.1, -.3, 0], [.16, .06, .06], C.gold);
    box(m, [.08, -.18, 0], [.12, .05, .06], C.gold);
  },
  clock(m){
    cyl(m, [0, 0, 0], .4, .1, C.woodDark, 12, [PI / 2, 0, 0]);
    cyl(m, [0, 0, .06], .34, .02, C.cream, 12, [PI / 2, 0, 0]);
    box(m, [0, .08, .08], [.03, .2, .02], C.ink);
    box(m, [.1, 0, .08], [.18, .03, .02], C.ink);
    ell(m, [0, 0, .08], [.025, .025, .01], C.rose, 5, 3);
  },
  glasses(m){
    tor(m, [-.24, 0, 0], .17, .03, C.inkSoft, 12, 3, [PI / 2, 0, 0]);
    tor(m, [.24, 0, 0], .17, .03, C.inkSoft, 12, 3, [PI / 2, 0, 0]);
    box(m, [0, .03, 0], [.14, .025, .025], C.inkSoft);
    box(m, [-.42, .04, 0], [.18, .02, .02], C.inkSoft, [0, 0, -.1]);
    box(m, [.42, .04, 0], [.18, .02, .02], C.inkSoft, [0, 0, .1]);
  },
  slipper(m){
    box(m, [0, -.04, 0], [.7, .09, .3], C.rose);
    box(m, [-.02, .1, 0], [.42, .03, .05], C.marigold, [0, 0, .05]);
    box(m, [-.22, .04, 0], [.04, .12, .05], C.marigold);
    box(m, [.18, .04, 0], [.04, .12, .05], C.marigold);
  },
  ladder(m){
    box(m, [-.24, 0, 0], [.06, 1.2, .07], C.wood);
    box(m, [.24, 0, 0], [.06, 1.2, .07], C.wood);
    for(let i = 0; i < 5; i++) box(m, [0, -.44 + i * .22, 0], [.5, .05, .06], C.woodDark);
  },
  car(m){
    box(m, [0, -.04, 0], [.92, .26, .46], C.rose);
    box(m, [0, .18, -.02], [.48, .22, .4], C.sky);
    for(const x of [-.3, .3]) for(const z of [-.25, .25]){
      cyl(m, [x, -.2, z], .12, .09, C.ink, 10, [0, 0, PI / 2]);
    }
    box(m, [0, -.04, .24], [.5, .1, .02], C.marigold);
  },
  bus(m){
    box(m, [0, 0, 0], [1.2, .5, .5], C.marigold);
    box(m, [0, .12, .26], [.9, .16, .02], C.sky);
    box(m, [0, .12, -.26], [.9, .16, .02], C.sky);
    for(const x of [-.36, .36]) for(const z of [-.27, .27]){
      cyl(m, [x, -.3, z], .13, .1, C.ink, 10, [0, 0, PI / 2]);
    }
  },
  bike(m){
    for(const x of [-.42, .42]){
      tor(m, [x, -.14, 0], .2, .05, C.ink, 12, 4, [0, PI / 2, 0]);
    }
    box(m, [0, .04, 0], [.62, .05, .05], C.teal, [0, 0, .2]);
    box(m, [0, .18, 0], [.5, .05, .05], C.teal, [0, 0, -.2]);
    box(m, [-.2, .26, 0], [.22, .05, .12], C.inkSoft);
    box(m, [.42, .32, 0], [.04, .04, .36], C.inkSoft);
  },
  boat(m){
    box(m, [0, -.14, 0], [1.0, .24, .42], C.wood);
    cone(m, [.62, -.14, 0], .21, .3, C.woodDark, 6, [0, 0, -PI / 2]);
    box(m, [0, .02, -.02], [.34, .18, .3], C.cream);
    cyl(m, [0, .36, 0], .025, .55, C.woodDark, 5);
    poly(m, [[0, .58, 0], [0, .02, 0], [.4, .1, 0]], C.paper);
  },
  submarine(m){
    cyl(m, [0, 0, 0], .24, 1.0, C.steel, 12, [0, 0, PI / 2]);
    ell(m, [0, 0, 0], [.5, .24, .24], C.steel, 12, 5);
    box(m, [0, .24, 0], [.3, .18, .22], C.steel);
    cyl(m, [0, .38, 0], .02, .3, C.inkSoft, 5);
    for(let i = 0; i < 3; i++){
      box(m, [-.56, 0, 0], [.03, .2, .06], C.inkSoft, [PI / 3 * i, 0, 0]);
    }
    box(m, [0, .3, .34], [.18, .03, .16], C.sky);
  },
  sphere(m){
    ell(m, [0, 0, 0], [.46, .46, .46], C.marigold, 12, 6);
    ell(m, [0, 0, 0], [.47, .2, .47], C.cream, 12, 4);
    cyl(m, [0, .42, 0], .025, .14, C.woodDark, 5);
    ell(m, [.08, .48, 0], [.1, .03, .06], C.leaf, 6, 3, [0, 0, .5]);
  },
  samosa(m){
    const a = [0, .5, 0], b = [-.5, -.3, .28], c = [.5, -.3, .28], d = [0, -.3, -.36];
    poly(m, [a, b, c], C.marigold);
    poly(m, [a, c, d], C.gold);
    poly(m, [a, d, b], C.marigold);
    poly(m, [b, d, c], C.gold);
  },
  drum(m){
    cyl(m, [0, 0, 0], .36, .42, C.wood, 12);
    cyl(m, [0, .21, 0], .37, .03, C.cream, 12);
    cyl(m, [0, -.21, 0], .37, .03, C.cream, 12);
    for(let i = 0; i < 8; i++){
      const a = TAU * i / 8;
      cyl(m, [Math.cos(a) * .36, 0, Math.sin(a) * .36], .012, .4, C.ember, 3);
    }
  },
  guitar(m){
    ell(m, [0, -.08, 0], [.36, .42, .11], C.wood, 10, 5);
    ell(m, [0, -.32, 0], [.27, .26, .11], C.wood);
    ell(m, [0, -.06, .12], [.12, .12, .02], C.ink, 8, 3);
    box(m, [0, .4, 0], [.09, .6, .07], C.woodDark);
    box(m, [0, .72, 0], [.14, .12, .07], C.ink);
    for(let i = 0; i < 3; i++) box(m, [0, -.1 + i * .12, .12], [.42, .006, .006], C.cream);
  },
  pencil(m){
    cyl(m, [0, 0, 0], .07, .9, C.marigold, 6);
    cone(m, [0, .55, 0], .07, .2, C.cream, 6);
    cone(m, [0, .66, 0], .025, .06, C.ink, 6);
    cyl(m, [0, -.48, 0], .075, .08, C.rose, 6);
  },
  bat(m){
    cyl(m, [0, -.36, 0], .045, .36, C.inkSoft, 6);
    box(m, [0, .12, 0], [.22, .62, .08], C.wood);
    box(m, [0, .42, 0], [.16, .08, .07], C.cream);
  },
  paraglider(m){
    for(let i = 0; i < 4; i++){
      const x0 = -.8 + i * .4, x1 = x0 + .4;
      const y0 = .5 - (x0 * x0) * .35, y1 = .5 - (x1 * x1) * .35;
      poly(m, [[x0, y0, 0], [x1, y1, 0], [x1, y1 - .12, .1], [x0, y0 - .12, .1]], i % 2 ? C.rose : C.marigold);
      poly(m, [[x1, y1, 0], [x1, y1 - .12, .1], [x0, y0 - .12, .1], [x0, y0, 0]], i % 2 ? C.rose : C.marigold);
    }
    for(const x of [-.5, -.2, .2, .5]) cyl(m, [x * .5, -.05, 0], .008, .55, C.inkSoft, 4, [0, 0, x * .5]);
    box(m, [0, -.42, 0], [.14, .18, .12], C.ember);
    ell(m, [0, -.28, 0], [.07, .07, .07], C.cream, 6, 3);
  },
};

/* ---------------------------------------------------------------- models */
export const VISUAL_IDS = {
  bird: ["chidiya", "tota", "gauraiya", "kauwa", "kabootar", "mor", "cheel", "ullu", "hans", "battakh", "saras", "ramchiraiya", "maina", "koyal", "bagula", "giddh", "baaz", "ababeel", "teetar", "fakhta", "garud", "chamgadar"],
  groundbird: ["penguin", "shuturmurg", "emu", "kiwi", "murgi", "dodo"],
  butterfly: ["titli", "patanga"],
  bug: ["madhumakkhi", "bhanwra", "makkhi", "machhar", "tiddi", "jugnu", "cheenti", "makdi"],
  plane: ["hawai", "drone"],
  helicopter: ["helicopter"],
  rocket: ["rocket"],
  kite: ["patang"],
  balloon: ["gubbara"],
  paperplane: ["kagaz"],
  dragon: ["dragon"],
  carpet: ["khatola"],
  broom: ["chudail", "jhadu"],
  fairy: ["pari"],
  quadruped: ["haathi", "bhains", "gaay", "bakri", "kutta", "billi", "oont", "ghoda", "baagh", "sher", "kachhua", "khargosh", "bandar", "chuha", "magarmachh"],
  fish: ["machhli"],
  snake: ["saanp"],
  frog: ["mendhak"],
  chair: ["kursi"],
  table: ["mez"],
  sofa: ["sofa", "palang", "kambal", "takiya", "schoolbag"],
  cup: ["kap", "chai", "baalti"],
  plate: ["thali", "roti"],
  book: ["kitaab"],
  mirror: ["aaina"],
  screen: ["phone", "laptop", "tv"],
  box: ["fridge"],
  lamp: ["diya", "mombatti", "ghanti"],
  house: ["ghar", "mandir"],
  tree: ["ped"],
  flower: ["phool"],
  mountain: ["pahad"],
  river: ["nadi"],
  key: ["chaabi"],
  clock: ["ghadi"],
  glasses: ["chashma"],
  slipper: ["chappal", "joote"],
  ladder: ["seedhi"],
  car: ["car", "auto", "tractor"],
  bus: ["bus", "relgaadi"],
  bike: ["cycle", "scooter"],
  boat: ["jahaz", "naav"],
  submarine: ["pandubbi"],
  sphere: ["football", "laddoo", "gulabjamun", "aloo", "pyaaz", "aam", "kaddu", "anda", "patthar"],
  samosa: ["samosa"],
  drum: ["dhol"],
  guitar: ["guitar"],
  spoon: ["chammach"],
  pencil: ["pencil"],
  bat: ["balla"],
  paraglider: ["paraglider"],
};

const BY_ID = new Map();
for(const [key, ids] of Object.entries(VISUAL_IDS)) for(const id of ids) BY_ID.set(id, key);
const BY_CAT = { bird: "bird", winged: "butterfly", machine: "plane", myth: "dragon", animal: "quadruped", object: "box", vehicle: "car", food: "sphere" };

export const MODEL_IDS = Object.keys(MODELS);

export function visualKey(word){
  if(!word) return "sphere";
  return BY_ID.get(word.id) || BY_CAT[word.cat] || "sphere";
}

const cache = new Map();
function build(key){
  if(cache.has(key)) return cache.get(key);
  const m = blank();
  (MODELS[key] || MODELS.sphere)(m);
  let min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for(const f of m.faces) for(const v of f.v){
    for(let i = 0; i < 3; i++){ min[i] = Math.min(min[i], v[i]); max[i] = Math.max(max[i], v[i]); }
  }
  const ctr = [ (min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2 ];
  const ext = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]) || 1;
  const out = { faces: m.faces, ctr, scale: 1.9 / ext };
  cache.set(key, out);
  return out;
}

/* ---------------------------------------------------------------- renderer */
export class Vision {
  constructor(canvas, opts = {}){
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext("2d") : null;
    this.uid = Math.random().toString(36).slice(2, 7);
    this.angle = opts.angle ?? .5;
    this.t = 0;
    this.rate = opts.rate ?? .5;
    this.model = null;
    this.key = "sphere";
    this.paused = false;
    this.visible = false;
    this.reactKind = "";
    this.reactAt = -9;
    this.theme = document.documentElement.dataset.theme || "dark";
    this.last = performance.now();
    this.raf = 0;
    this._loop = this._loop.bind(this);
  }

  show(word){
    if(!this.ctx) return;
    this.key = visualKey(word);
    this.model = build(this.key);
    this.visible = true;
    this.paused = false;
    this.reactKind = "";
    if(!this.raf) this.raf = requestAnimationFrame(this._loop);
  }

  hide(){
    this.visible = false;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  pause(){ this.paused = true; }
  resume(){ if(this.visible) this.paused = false; }

  react(kind){
    this.reactKind = kind;
    this.reactAt = performance.now();
  }

  _loop(now){
    this.raf = requestAnimationFrame(this._loop);
    const dt = Math.min(.05, (now - this.last) / 1000 || 0);
    this.last = now;
    if(!this.visible || this.paused) return;
    if(this.canvas.offsetParent === null) return;
    this.t += dt;
    this.angle += dt * this.rate;
    this.draw(dt);
  }

  draw(dt = 0){
    const canvas = this.canvas, ctx = this.ctx;
    if(!ctx) return;
    this.theme = document.documentElement.dataset.theme || "dark";
    const w = canvas.clientWidth || 160, h = canvas.clientHeight || 160;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if(canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)){
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if(!this.model) return;

    const cx = w / 2, cy = h * .52;
    const S = Math.min(w, h) * 0.68;
    const light = [-.45, .8, .55];
    const reactAge = (performance.now() - this.reactAt) / 1000;
    const live = reactAge < 1.2;
    const shake = live && this.reactKind === "bad" ? Math.sin(reactAge * 46) * Math.exp(-reactAge * 5) : 0;
    const pop = live && this.reactKind === "good" ? 1 + Math.sin(Math.min(1, reactAge * 5) * PI) * .1 : 1;
    const rise = live && this.reactKind === "good" ? Math.min(.22, reactAge * .4) : 0;

    const bg = ctx.createRadialGradient(cx, cy + S * .34, 0, cx, cy + S * .34, S * .5);
    const night = this.theme === "dark";
    bg.addColorStop(0, night ? "rgba(255,197,110,.14)" : "rgba(207,86,36,.12)");
    bg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const shadowG = ctx.createRadialGradient(cx, cy + S * .42, 0, cx, cy + S * .42, S * .3);
    shadowG.addColorStop(0, night ? "rgba(0,0,0,.42)" : "rgba(80,40,20,.22)");
    shadowG.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shadowG;
    ctx.beginPath();
    ctx.ellipse(cx, cy + S * .42, S * .26 * pop, S * .06, 0, 0, TAU);
    ctx.fill();

    const { faces, ctr, scale } = this.model;
    const cosY = Math.cos(this.angle), sinY = Math.sin(this.angle);
    const tilt = -.14;
    const cosX = Math.cos(tilt), sinX = Math.sin(tilt);
    const bob = Math.sin(this.t * 1.45) * .045;
    const list = [];

    for(const f of faces){
      const pts = [];
      let zsum = 0;
      for(const v of f.v){
        let x = (v[0] - ctr[0]) * scale * pop;
        let y = (v[1] - ctr[1]) * scale * pop;
        let z = (v[2] - ctr[2]) * scale * pop;
        const x1 = x * cosY + z * sinY;
        z = -x * sinY + z * cosY;
        x = x1;
        const y1 = y * cosX - z * sinX;
        z = y * sinX + z * cosX;
        y = y1;
        y += bob + rise;
        const persp = 3.1 / (4.3 + z);
        pts.push([cx + x * persp * S + shake * S * .06, cy - y * persp * S, z]);
        zsum += z;
      }
      list.push({ pts, z: zsum / pts.length, c: f.c, glow: f.glow });
    }
    list.sort((a, b) => a.z - b.z);

    const dim = night ? 1 : .94;
    for(const f of list){
      const [a, b, c] = f.pts;
      if(!a || !b || !c) continue;
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
      const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len; ny /= len; nz /= len;
      if(nx * light[0] + ny * light[1] + nz * light[2] < 0){ nx = -nx; ny = -ny; nz = -nz; }
      const diff = Math.max(0, nx * light[0] + ny * light[1] + nz * light[2]);
      const shade = f.glow ? 1.12 : .52 + diff * .62;
      const r = clamp(f.c[0] * shade * dim, 0, 255) | 0;
      const g = clamp(f.c[1] * shade * dim, 0, 255) | 0;
      const bl = clamp(f.c[2] * shade * dim, 0, 255) | 0;
      ctx.beginPath();
      ctx.moveTo(f.pts[0][0], f.pts[0][1]);
      for(let i = 1; i < f.pts.length; i++) ctx.lineTo(f.pts[i][0], f.pts[i][1]);
      ctx.closePath();
      ctx.fillStyle = `rgb(${r},${g},${bl})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${(r * .7) | 0},${(g * .7) | 0},${(bl * .7) | 0},.5)`;
      ctx.lineWidth = .5;
      ctx.stroke();
    }
  }
}
