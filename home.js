/* ════════════════════════════════════════════════════════════
   STENWARD — homepage interactions
   Offer accordion · Services master-detail directory ·
   Outcomes case switcher · contact preview calendar.
   ════════════════════════════════════════════════════════════ */
(function () {

  /* ── 1. OFFER · accordion spec-sheet ── */
  function offer() {
    var rows = [].slice.call(document.querySelectorAll('#offer-explore [data-exp]'));
    rows.forEach(function (r) {
      r.addEventListener('click', function () {
        var open = r.classList.contains('open');
        rows.forEach(function (x) { x.classList.remove('open'); });
        if (!open) r.classList.add('open');
      });
    });
  }

  /* ── 2. SERVICES · master-detail directory ── */
  var SERVICES = {
    'iso-27001': { no: '01', name: 'ISO 27001 Implementation',
      line: 'End-to-end ISO 27001 implementation, led by the person doing the work.',
      points: ['Scoping & ISMS design', 'Risk assessment & treatment', 'Policies, controls & Statement of Applicability', 'With you through your external audit'] },
    'gap-analysis': { no: '02', name: 'Gap Analysis',
      line: 'Know exactly where you stand against the standard.',
      points: ['Current-state review', 'Control-by-control gap map', 'Prioritised remediation plan', 'Realistic effort & timeline estimate'] },
    'isms-maintenance': { no: '03', name: 'ISMS Maintenance',
      line: 'Keep your certification alive — without hiring in-house.',
      points: ['Surveillance audit preparation', 'Findings management', 'Risk register & policy upkeep', 'Management reviews'] },
    'internal-audit': { no: '04', name: 'Internal Audit & Readiness',
      line: 'Stress-test your ISMS before the certification body does.',
      points: ['Independent internal audit', 'Pre-audit readiness check', 'Findings & remediation', 'Evidence organisation'] },
    'questionnaire': { no: '05', name: 'Security Questionnaire Response',
      line: 'Fast, practitioner-grade answers to enterprise security reviews.',
      points: ['Questionnaire completion', 'Evidence mapping', 'Turnaround in days, not weeks', 'A reusable answer library'] },
    'awareness-training': { no: '06', name: 'Security Awareness Training',
      line: 'Training your team will actually engage with.',
      points: ['Tailored, role-based content', 'Phishing awareness', 'Deploys through your existing tools', 'Completion tracking & evidence'] }
  };
  function directory() {
    var panel = document.getElementById('dir-panel');
    var items = [].slice.call(document.querySelectorAll('.dir-item'));
    if (!panel || !items.length) return;
    function render(slug) {
      var s = SERVICES[slug]; if (!s) return;
      panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
      panel.innerHTML =
        '<div class="dp-no mono">' + s.no + ' / 06</div>' +
        '<h3 class="dp-title">' + s.name + '</h3>' +
        '<p class="dp-line">' + s.line + '</p>' +
        '<ul class="dp-points">' + s.points.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' +
        '<a class="dp-link" href="service.html?s=' + slug + '">Open service <span class="ar">→</span></a>';
    }
    items.forEach(function (it) {
      function sel() {
        items.forEach(function (x) { x.classList.remove('active'); });
        it.classList.add('active');
        render(it.getAttribute('data-svc'));
      }
      it.addEventListener('mouseenter', sel);
      it.addEventListener('click', sel);
      it.addEventListener('focus', sel);
    });
    render(items[0].getAttribute('data-svc'));
  }

  /* ── 3. OUTCOMES · case switcher ── */
  var CASES = [
    { k: 'Build from scratch', metric: '~3', unit: 'months', metricLabel: 'to certification-ready',
      title: 'Building an ISMS from scratch, against the clock',
      body: 'A remote-first technology company needed ISO 27001 readiness with a hard deadline and no existing management system. Stenward built the entire ISMS from a blank page — and had the organisation certification-ready within roughly three months.' },
    { k: 'Breadth under pressure', metric: '5', unit: 'frameworks', metricLabel: 'maintained single-handedly',
      title: 'Five frameworks through a high-stakes acquisition',
      body: 'After an acquisition dissolved an established compliance team, an enterprise software company faced surveillance audits across five frameworks with no one to run them. Stenward took on the entire estate single-handedly.' },
    { k: 'Ongoing maintenance', metric: '2', unit: 'standards', metricLabel: 'kept audit-ready, then expanded',
      title: 'Maintaining and maturing an ISMS',
      body: 'A construction-technology SaaS company needed its ISO 27001 ISMS maintained while handling enterprise questionnaires. Stenward kept it audit-ready and supported a move into SOC 2 — earning an invitation to return.' }
  ];
  function cases() {
    var stage = document.getElementById('cx-stage');
    var tabs = [].slice.call(document.querySelectorAll('.cx-tab'));
    if (!stage || !tabs.length) return;
    function render(i) {
      var c = CASES[i];
      stage.classList.remove('swap'); void stage.offsetWidth; stage.classList.add('swap');
      stage.innerHTML =
        '<div class="cx-metric"><span class="cx-num mono">' + c.metric + '</span><span class="cx-unit">' + c.unit + '</span><span class="cx-mlabel">' + c.metricLabel + '</span></div>' +
        '<div class="cx-copy"><div class="cx-tag mono">' + c.k + '</div><h3>' + c.title + '</h3><p>' + c.body + '</p></div>';
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active'); render(i);
      });
    });
    render(0);
  }

  /* ── 4. CONTACT · preview calendar that deep-links to book.html ── */
  function previewCal() {
    var grid = document.getElementById('cal-preview'); if (!grid) return;
    var label = document.querySelector('.cal-preview-card .cal-head .s');
    var head  = document.querySelector('.cal-preview-card .cal-head');
    var MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var view = { y: today.getFullYear(), m: today.getMonth() };
    var MAX_AHEAD = 6;

    function ym(v) { return v.y + '-' + ('0' + (v.m + 1)).slice(-2); }
    function atCurrent() { return view.y === today.getFullYear() && view.m === today.getMonth(); }
    function canNext() { return new Date(view.y, view.m + 1, 1) <= new Date(today.getFullYear(), today.getMonth() + MAX_AHEAD, 1); }

    function render() {
      if (label) label.textContent = MONTH_NAMES[view.m] + ' ' + view.y + ' \u00B7 GMT';
      grid.innerHTML = '';
      var firstDow = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // Monday = 0
      for (var i = 0; i < firstDow; i++) {
        var pad = document.createElement('span'); pad.className = 'pc-day pc-pad'; grid.appendChild(pad);
      }
      var dim = new Date(view.y, view.m + 1, 0).getDate();
      for (var d = 1; d <= dim; d++) {
        var cd = new Date(view.y, view.m, d), dow = cd.getDay();
        var off = dow === 0 || dow === 6 || cd < today;
        var el;
        if (off) { el = document.createElement('span'); el.className = 'pc-day off'; }
        else { el = document.createElement('a'); el.className = 'pc-day'; el.href = 'book.html?d=' + d + '&m=' + ym(view); }
        if (cd.getTime() === today.getTime()) el.className += ' today';
        el.textContent = d;
        grid.appendChild(el);
      }
      var p = document.getElementById('cp-prev'), n = document.getElementById('cp-next');
      if (p) p.disabled = atCurrent();
      if (n) n.disabled = !canNext();
    }

    function shift(delta, ev) {
      if (ev) { ev.preventDefault(); ev.stopPropagation(); }
      var nd = new Date(view.y, view.m + delta, 1);
      var lo = new Date(today.getFullYear(), today.getMonth(), 1);
      var hi = new Date(today.getFullYear(), today.getMonth() + MAX_AHEAD, 1);
      if (nd < lo || nd > hi) return;
      view.y = nd.getFullYear(); view.m = nd.getMonth(); render();
    }

    if (head && !head.querySelector('.cal-nav')) {
      var chip = head.querySelector('.chip');
      var right = document.createElement('div'); right.className = 'cal-head-right';
      var nav = document.createElement('div'); nav.className = 'cal-nav';
      nav.innerHTML =
        '<button type="button" id="cp-prev" aria-label="Previous month">\u2039</button>' +
        '<button type="button" id="cp-next" aria-label="Next month">\u203A</button>';
      right.appendChild(nav);
      if (chip) right.appendChild(chip);
      head.appendChild(right);
      nav.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); });
      document.getElementById('cp-prev').addEventListener('click', function (e) { shift(-1, e); });
      document.getElementById('cp-next').addEventListener('click', function (e) { shift(1, e); });
    }

    render();
  }

  /* ── 5. COVERAGE · Annex A explorer ── */
  var ANNEX = [
    { n: 'Organizational', c: 37, d: 'Policies, roles, supplier and cloud security, incident management, and the governance that holds your ISMS together.', ex: ['Information security policies', 'Supplier & cloud security', 'Threat intelligence', 'Incident management', 'Business continuity'] },
    { n: 'People', c: 8, d: 'Screening, awareness, responsibilities and the human side of security — the controls that turn your team into your first line of defence.', ex: ['Screening', 'Awareness & training', 'Disciplinary process', 'Remote working', 'Confidentiality agreements'] },
    { n: 'Physical', c: 14, d: 'Secure areas, equipment protection, clear-desk and the physical safeguards around your people and hardware.', ex: ['Secure areas', 'Equipment security', 'Clear desk & screen', 'Secure disposal', 'Physical entry controls'] },
    { n: 'Technological', c: 34, d: 'Access control, cryptography, logging, secure development and the technical safeguards across your systems.', ex: ['Access control', 'Cryptography', 'Logging & monitoring', 'Secure development', 'Data leakage prevention'] }
  ];
  function annex() {
    var themes = [].slice.call(document.querySelectorAll('.annex-theme'));
    var detail = document.getElementById('annex-detail');
    if (!themes.length || !detail) return;
    // fill each theme's diamond grid
    themes.forEach(function (t) {
      var g = t.querySelector('.at-grid'), n = +g.getAttribute('data-n');
      var html = '';
      for (var i = 0; i < n; i++) html += '<i style="transition-delay:' + (i * 14) + 'ms"></i>';
      g.innerHTML = html;
    });
    function render(i) {
      var a = ANNEX[i];
      detail.classList.remove('swap'); void detail.offsetWidth; detail.classList.add('swap');
      detail.innerHTML =
        '<div class="ad-head"><span class="ad-count mono">' + a.c + '</span><div><div class="ad-name">' + a.n + ' controls</div><div class="ad-sub mono">Annex A · Theme ' + (i + 1) + ' of 4</div></div></div>' +
        '<p class="ad-desc">' + a.d + '</p>' +
        '<div class="ad-chips">' + a.ex.map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div>';
    }
    themes.forEach(function (t, i) {
      function sel() { themes.forEach(function (x) { x.classList.remove('active'); }); t.classList.add('active'); render(i); }
      t.addEventListener('mouseenter', sel);
      t.addEventListener('click', sel);
      t.addEventListener('focus', sel);
    });
    render(0);
  }

  /* ── 6. COVERAGE · clause explorer (Clauses 4–10) ── */
  var CLAUSES = [
    { n: 4, t: 'Context of the organisation', d: 'We define what your ISMS actually covers — the internal and external issues, the interested parties, and the boundaries that set its scope.' },
    { n: 5, t: 'Leadership', d: 'Top management owns the ISMS: setting the information security policy, committing resources, and assigning clear roles and responsibilities.' },
    { n: 6, t: 'Planning', d: 'We identify and treat the risks and opportunities to your information, and set measurable security objectives to work towards.' },
    { n: 7, t: 'Support', d: 'The resources, competence, awareness, communication and documented information your ISMS needs to run day to day.' },
    { n: 8, t: 'Operation', d: 'Putting the plan into practice — operating your controls and carrying out risk assessment and treatment as part of business as usual.' },
    { n: 9, t: 'Performance evaluation', d: 'Monitoring, measurement, internal audit and management review that prove the ISMS is working as intended.' },
    { n: 10, t: 'Improvement', d: 'Handling nonconformities, taking corrective action, and continually improving the management system over time.' }
  ];
  function clauses() {
    var items = [].slice.call(document.querySelectorAll('.clause'));
    var detail = document.getElementById('clause-detail');
    if (!items.length || !detail) return;
    function render(i) {
      var c = CLAUSES[i];
      detail.classList.remove('swap'); void detail.offsetWidth; detail.classList.add('swap');
      detail.innerHTML =
        '<div class="cd-head"><span class="cd-no mono">Clause ' + c.n + '</span><span class="cd-t">' + c.t + '</span></div>' +
        '<p class="cd-d">' + c.d + '</p>';
    }
    items.forEach(function (it, i) {
      function sel() { items.forEach(function (x) { x.classList.remove('active'); }); it.classList.add('active'); render(i); }
      it.addEventListener('click', sel);
      it.addEventListener('mouseenter', sel);
      it.addEventListener('focus', sel);
    });
    render(0);
  }

  function init() { offer(); directory(); cases(); previewCal(); annex(); clauses(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
