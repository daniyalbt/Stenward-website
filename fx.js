/* ════════════════════════════════════════════════════════════
   STENWARD — FX engine
   Interactive 3D diamond lattice · decrypting headline · live HUD ·
   3D tilt · magnetic CTAs · counters · scroll choreography.
   Pure canvas 2D + DOM. No libraries.
   ════════════════════════════════════════════════════════════ */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var STATIC = reduce || document.hidden;       // non-visible tab → draw one frame
  var TEAL = '0,253,179';

  /* ───────────────────────── 3D MATH ───────────────────────── */
  function rotX(p, a) { var c = Math.cos(a), s = Math.sin(a); return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c }; }
  function rotY(p, a) { var c = Math.cos(a), s = Math.sin(a); return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c }; }

  /* ════════════════ THE LATTICE ════════════════
     A rotating octahedron (the diamond, in 3D) wrapped in a drifting
     field of smaller diamonds, constellation lines + travelling pulses.
     Reacts to mouse (rotation + repulsion) and scroll (rotation + drift).
  */
  function Lattice(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d');
    var DPR = Math.min(2, window.devicePixelRatio || 1);
    var W = 0, H = 0, CX = 0, CY = 0, SCALE = 0;
    var density = opts.density || 150;
    var calm = opts.calm || false;

    // octahedron — six poles
    var OCT = [
      { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 },
      { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 }
    ];
    var EDGES = [[0,2],[2,1],[1,3],[3,0],[0,4],[2,4],[1,4],[3,4],[0,5],[2,5],[1,5],[3,5]];
    var OCTR = 1.05;

    // drifting particles in a cube
    var parts = [];
    for (var i = 0; i < density; i++) {
      parts.push({
        x: (Math.random() * 2 - 1) * 2.2,
        y: (Math.random() * 2 - 1) * 2.2,
        z: (Math.random() * 2 - 1) * 2.2,
        sp: 0.0002 + Math.random() * 0.0006,
        ph: Math.random() * Math.PI * 2,
        r: 1.4 + Math.random() * 2.6,
        teal: Math.random() < 0.12
      });
    }

    // pulses travelling along octahedron edges
    var pulses = EDGES.map(function (e, i) { return { e: i, t: Math.random(), sp: 0.004 + Math.random() * 0.006 }; });

    var rotYa = 0.6, rotXa = -0.25, autoY = 0.0016;
    var tMouseX = 0, tMouseY = 0, mouseX = 0, mouseY = 0;   // -1..1
    var pmx = 0.5, pmy = 0.5, haveMouse = false;            // projected mouse (px frac)
    var scrollRot = 0;

    function resize() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      CX = W / 2; CY = H / 2;
      SCALE = Math.min(W, H) * (calm ? 0.30 : 0.34);
    }

    function project(p) {
      var persp = 3.2 / (3.2 + p.z);
      return { x: CX + p.x * SCALE * persp, y: CY + p.y * SCALE * persp, s: persp, z: p.z };
    }

    function diamond(x, y, r, rot, col, lw) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      ctx.beginPath();
      ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath();
      ctx.strokeStyle = col; ctx.lineWidth = lw || 1; ctx.stroke();
      ctx.restore();
    }

    function frame(now) {
      // ease rotation toward mouse target + auto-spin + scroll
      mouseX += (tMouseX - mouseX) * 0.05;
      mouseY += (tMouseY - mouseY) * 0.05;
      if (!STATIC) rotYa += autoY;
      var ry = rotYa + mouseX * 0.7 + scrollRot;
      var rx = rotXa + mouseY * 0.5;

      ctx.clearRect(0, 0, W, H);

      // ---- particle field ----
      var proj = [];
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (!STATIC) p.ph += p.sp * 16;
        var wob = { x: p.x + Math.sin(p.ph) * 0.05, y: p.y + Math.cos(p.ph * 0.9) * 0.05, z: p.z };
        var q = rotY(wob, ry * 0.8); q = rotX(q, rx * 0.8);
        var s = project(q);
        // mouse repulsion (subtle push away from cursor)
        if (haveMouse && !calm) {
          var dx = s.x - pmx * W, dy = s.y - pmy * H;
          var dist = Math.hypot(dx, dy);
          if (dist < 150) { var f = (150 - dist) / 150 * 18; s.x += dx / (dist || 1) * f; s.y += dy / (dist || 1) * f; }
        }
        s.teal = p.teal; s.r = p.r; s.ph = p.ph;
        proj.push(s);
      }
      // constellation lines
      for (var a = 0; a < proj.length; a++) {
        for (var b = a + 1; b < proj.length; b++) {
          var dx2 = proj[a].x - proj[b].x, dy2 = proj[a].y - proj[b].y;
          var d2 = dx2 * dx2 + dy2 * dy2;
          if (d2 < 9000) {
            var al = (1 - d2 / 9000) * 0.16 * Math.min(proj[a].s, proj[b].s);
            ctx.strokeStyle = 'rgba(255,255,255,' + al.toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(proj[a].x, proj[a].y); ctx.lineTo(proj[b].x, proj[b].y); ctx.stroke();
          }
        }
      }
      // particle diamonds
      for (var k = 0; k < proj.length; k++) {
        var s2 = proj[k];
        var al2 = (0.25 + s2.s * 0.4);
        var col = s2.teal ? 'rgba(' + TEAL + ',' + (al2 * 0.9).toFixed(3) + ')' : 'rgba(255,255,255,' + (al2 * 0.5).toFixed(3) + ')';
        diamond(s2.x, s2.y, s2.r * s2.s + 0.5, s2.ph, col, s2.teal ? 1.3 : 1);
      }

      // ---- octahedron core ----
      var op = OCT.map(function (v) {
        var q = rotY({ x: v.x * OCTR, y: v.y * OCTR, z: v.z * OCTR }, ry);
        q = rotX(q, rx); return project(q);
      });
      // edges with depth shading
      for (var e = 0; e < EDGES.length; e++) {
        var p1 = op[EDGES[e][0]], p2 = op[EDGES[e][1]];
        var depth = (p1.s + p2.s) / 2;
        ctx.strokeStyle = 'rgba(' + TEAL + ',' + (0.22 + depth * 0.5).toFixed(3) + ')';
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }
      // travelling pulses
      for (var pu = 0; pu < pulses.length; pu++) {
        var P = pulses[pu]; if (!STATIC) P.t += P.sp; if (P.t > 1) P.t -= 1;
        var ed = EDGES[P.e], A = op[ed[0]], B = op[ed[1]];
        var px = A.x + (B.x - A.x) * P.t, py = A.y + (B.y - A.y) * P.t;
        var ps = A.s + (B.s - A.s) * P.t;
        ctx.fillStyle = 'rgba(' + TEAL + ',' + (0.9 * ps).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(px, py, 2.2 * ps + 0.6, 0, 6.283); ctx.fill();
      }
      // vertex nodes
      for (var n = 0; n < op.length; n++) {
        ctx.fillStyle = 'rgba(' + TEAL + ',' + (0.5 + op[n].s * 0.5).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(op[n].x, op[n].y, 2.6 * op[n].s, 0, 6.283); ctx.fill();
      }

      if (!STATIC) raf = requestAnimationFrame(frame);
    }

    // input
    function onMove(e) {
      var r = canvas.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      pmx = x; pmy = y; haveMouse = true;
      tMouseX = (x - 0.5) * 2; tMouseY = (y - 0.5) * 2;
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', function () {
      scrollRot = (window.scrollY || 0) * 0.0006;
    }, { passive: true });

    resize();
    var raf;
    if (STATIC) { frame(0); }
    else { raf = requestAnimationFrame(frame); }
    return { resize: resize };
  }

  /* ════════════════ DECRYPTING HEADLINE ════════════════ */
  function scramble(el, done) {
    if (STATIC) { el.querySelectorAll('[data-final]').forEach(function (s) { s.textContent = s.getAttribute('data-final'); }); if (done) done(); return; }
    var glyphs = '01<>/\\{}[]#$%&*+=ABCDEFXYZ';
    var spans = [].slice.call(el.querySelectorAll('[data-final]'));
    var total = spans.reduce(function (a, s) { return a + s.getAttribute('data-final').length; }, 0);
    var revealed = 0, frame = 0;
    function tick() {
      frame++;
      var budget = Math.floor(frame / 2);
      var seen = 0;
      spans.forEach(function (s) {
        var word = s.getAttribute('data-final'); var out = '';
        for (var i = 0; i < word.length; i++) {
          seen++;
          if (word[i] === ' ') { out += ' '; continue; }
          if (seen <= budget) out += word[i];
          else if (seen <= budget + 10) out += '<span class="sc">' + glyphs[(Math.random() * glyphs.length) | 0] + '</span>';
          else out += '<span class="sc-hidden">' + word[i] + '</span>';
        }
        s.innerHTML = out;
      });
      if (budget < total + 10) requestAnimationFrame(tick);
      else { spans.forEach(function (s) { s.textContent = s.getAttribute('data-final'); }); if (done) done(); }
    }
    tick();
  }

  /* ════════════════ HUD TERMINAL ════════════════ */
  function hud(el) {
    var lines = JSON.parse(el.getAttribute('data-lines') || '[]');
    if (STATIC) { el.innerHTML = lines.map(function (l) { return '<div class="hud-l"><span class="hud-k">' + l[0] + '</span><span class="hud-v ok">' + l[1] + '</span></div>'; }).join(''); return; }
    var idx = 0;
    function next() {
      if (idx >= lines.length) return;
      var l = lines[idx++];
      var row = document.createElement('div'); row.className = 'hud-l';
      row.innerHTML = '<span class="hud-k">' + l[0] + '</span><span class="hud-v">…</span>';
      el.appendChild(row);
      setTimeout(function () {
        row.querySelector('.hud-v').outerHTML = '<span class="hud-v ok">' + l[1] + '</span>';
        setTimeout(next, 220);
      }, 420);
    }
    next();
  }

  /* ════════════════ 3D TILT ════════════════ */
  function tilt(el) {
    if (STATIC || matchMedia('(pointer:coarse)').matches) return;
    var max = 9;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = 'perspective(900px) rotateX(' + (-py * max).toFixed(2) + 'deg) rotateY(' + (px * max).toFixed(2) + 'deg) translateZ(0)';
      el.style.setProperty('--gx', (px * 100 + 50).toFixed(1) + '%');
      el.style.setProperty('--gy', (py * 100 + 50).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  }

  /* ════════════════ MAGNETIC ════════════════ */
  function magnet(b) {
    if (STATIC || matchMedia('(pointer:coarse)').matches) return;
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect();
      var mx = e.clientX - r.left - r.width / 2, my = e.clientY - r.top - r.height / 2;
      b.style.transform = 'translate(' + (mx * 0.25).toFixed(1) + 'px,' + (my * 0.4).toFixed(1) + 'px)';
    });
    b.addEventListener('pointerleave', function () { b.style.transform = ''; });
  }

  /* ════════════════ COUNTERS ════════════════ */
  function count(el) {
    var target = parseFloat(el.getAttribute('data-count')), suffix = el.getAttribute('data-suffix') || '';
    if (STATIC) { el.textContent = target + suffix; return; }
    var t0 = performance.now(), dur = 1400;
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  /* ════════════════ CUSTOM CURSOR ════════════════ */
  function cursor() {
    if (STATIC || matchMedia('(pointer:coarse)').matches) return;
    var ring = document.createElement('div'); ring.className = 'cursor'; document.body.appendChild(ring);
    var dot = document.createElement('div'); dot.className = 'cursor-dot'; document.body.appendChild(dot);
    var x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    window.addEventListener('pointermove', function (e) { x = e.clientX; y = e.clientY; dot.style.transform = 'translate(' + x + 'px,' + y + 'px)'; });
    (function loop() { rx += (x - rx) * 0.18; ry += (y - ry) * 0.18; ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)'; requestAnimationFrame(loop); })();
    document.addEventListener('pointerover', function (e) {
      if (e.target.closest('a,button,[data-tilt],[data-magnetic]')) ring.classList.add('on'); else ring.classList.remove('on');
    });
  }

  /* ════════════════ SCROLL REVEALS ════════════════ */
  var targets = [];
  function fire(el) {
    if (el.classList.contains('is-in')) return;
    el.classList.add('is-in');
    if (el.hasAttribute('data-count')) count(el);
    if (el.id === 'hud') hud(el);
    // Safety net: if CSS transitions are frozen (occluded iframe), force end-state.
    setTimeout(function () {
      if (el.classList.contains('is-in') && getComputedStyle(el).opacity !== '1') {
        el.style.transition = 'none'; el.style.opacity = '1'; el.style.transform = 'none';
      }
    }, 950);
  }
  function check() {
    var vh = innerHeight || document.documentElement.clientHeight, still = [];
    targets.forEach(function (el) { if (el.getBoundingClientRect().top < vh * 0.88) fire(el); else still.push(el); });
    targets = still;
  }

  /* ───────────────────────── BOOT ───────────────────────── */
  function init() {
    if (STATIC) document.documentElement.classList.add('no-anim');

    var heroCanvas = document.getElementById('lattice');
    if (heroCanvas) Lattice(heroCanvas, { density: 150 });
    var bookCanvas = document.getElementById('lattice-book');
    if (bookCanvas) Lattice(bookCanvas, { density: 80, calm: true });

    document.querySelectorAll('[data-tilt]').forEach(tilt);
    document.querySelectorAll('[data-magnetic]').forEach(magnet);
    cursor();

    targets = [].slice.call(document.querySelectorAll('[data-reveal],[data-count],#hud'));
    if (STATIC) { targets.forEach(fire); targets = []; }
    else { check(); setTimeout(check, 600); }
    window.addEventListener('scroll', function () { requestAnimationFrame(check); }, { passive: true });

    // nav condense + scroll progress + timeline fill
    var nav = document.querySelector('.nav');
    var tl = document.getElementById('timeline');
    var phases = tl ? [].slice.call(tl.querySelectorAll('.phase')) : [];
    function chrome() {
      var yy = window.scrollY || 0;
      if (nav) { nav.classList.toggle('scrolled', yy > 24); var h = document.documentElement; nav.style.setProperty('--scroll', (yy / (h.scrollHeight - h.clientHeight) || 0).toFixed(4)); }
      if (tl) {
        var r = tl.getBoundingClientRect(), vh = innerHeight;
        var p = (vh * 0.55 - r.top) / r.height;
        p = Math.max(0, Math.min(1, p));
        tl.style.setProperty('--fill', (p * 100).toFixed(1) + '%');
        // activate phases whose pin the fill front has passed
        var frontY = r.top + r.height * p;
        phases.forEach(function (ph) {
          var pr = ph.getBoundingClientRect();
          ph.classList.toggle('lit', (pr.top + 30) <= frontY);
        });
      }
    }
    window.addEventListener('scroll', function () { requestAnimationFrame(chrome); }, { passive: true });
    chrome();

    // decrypt headline (slight delay for drama), then reveal HUD
    var h1 = document.getElementById('decrypt');
    if (h1) setTimeout(function () { scramble(h1); }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
