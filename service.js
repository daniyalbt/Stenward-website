/* Stenward — service detail page. Reads ?s=<slug> and renders. */
(function () {
  var DATA = {
    'iso-27001': {
      no: '01', name: 'ISO 27001 Implementation',
      line: 'End-to-end ISO 27001 implementation, led by the person doing the work.',
      intro: 'We take you from wherever you are today to an audit-ready ISMS. Every step — scoping, risk, controls, evidence — is run by a senior practitioner, with no junior handoffs and no generic template dumped on your team.',
      timeline: '4–6 months to audit-ready',
      includes: ['Scoping & ISMS design', 'Risk assessment & treatment plan', 'Policies, controls & Statement of Applicability', 'Evidence collection & organisation', 'Management review & audit-readiness', 'With you through your external audit'],
      deliver: ['An audit-ready ISMS', 'Documentation your team understands', 'A risk register you genuinely own', 'A roadmap for every surveillance audit']
    },
    'gap-analysis': {
      no: '02', name: 'Gap Analysis',
      line: 'Know exactly where you stand against the standard.',
      intro: 'A clear, honest assessment of your current posture against ISO 27001 — what is already in place, what is missing, and precisely what it will take to get certified. No inflated findings, no scare tactics.',
      timeline: 'Typically 1–2 weeks',
      includes: ['Current-state review', 'Control-by-control gap map', 'Prioritised remediation plan', 'Effort & timeline estimate', 'Executive summary for stakeholders'],
      deliver: ['A plain-English gap report', 'A prioritised action plan', 'A realistic budget & timeline', 'A confident go / no-go decision']
    },
    'isms-maintenance': {
      no: '03', name: 'ISMS Maintenance',
      line: 'Keep your certification alive — without hiring in-house.',
      intro: 'Certification is the start, not the finish. We provide ongoing senior oversight so your ISMS stays audit-ready through every surveillance audit, finding, and documentation update — at a fraction of the cost of an in-house hire.',
      timeline: 'Ongoing — monthly or quarterly cadence',
      includes: ['Surveillance audit preparation', 'Findings & non-conformity management', 'Risk register upkeep', 'Policy & procedure reviews', 'Management reviews', 'Questionnaire support'],
      deliver: ['Continuous audit-readiness', 'Surveillance audit support', 'A maintained risk & evidence base', 'One senior point of contact']
    },
    'internal-audit': {
      no: '04', name: 'Internal Audit & Readiness',
      line: 'Stress-test your ISMS before the certification body does.',
      intro: 'An independent internal audit against the standard, with time to fix gaps before the real audit. We surface exactly what an external auditor would — and help you close it calmly, ahead of time.',
      timeline: 'Typically 2–3 weeks',
      includes: ['Independent internal audit', 'Pre-audit readiness check', 'Findings & remediation guidance', 'Management review facilitation', 'Evidence organisation'],
      deliver: ['A clear internal audit report', 'A prioritised remediation list', 'Confidence going into Stage 2', 'A repeatable annual audit']
    },
    'questionnaire': {
      no: '05', name: 'Security Questionnaire Response',
      line: 'Fast, practitioner-grade answers to enterprise security reviews.',
      intro: 'Enterprise buyers send long, technical security questionnaires. We answer them accurately and quickly — so a deal never stalls in procurement over a security review, and your team stays focused on building.',
      timeline: 'Turnaround in days, not weeks',
      includes: ['Questionnaire completion', 'Evidence mapping', 'Custom, accurate responses', 'Fast turnaround', 'A reusable answer library'],
      deliver: ['Completed questionnaires', 'A reusable response library', 'Faster procurement cycles', 'Fewer stalled deals']
    },
    'awareness-training': {
      no: '06', name: 'Security Awareness Training',
      line: 'Training your team will actually engage with.',
      intro: 'Tailored security awareness training, deployable through your existing tools — practical, relevant, and built for how your people actually work, not a generic compliance video nobody remembers.',
      timeline: 'Set up in 1–2 weeks',
      includes: ['Tailored content', 'Role-based modules', 'Phishing awareness', 'Deploys via your existing tools', 'Completion tracking'],
      deliver: ['An engaging training programme', 'Completion & engagement tracking', 'Evidence for your ISMS', 'A more security-aware team']
    }
  };
  var ORDER = ['iso-27001', 'gap-analysis', 'isms-maintenance', 'internal-audit', 'questionnaire', 'awareness-training'];

  function qp(k) { var m = new RegExp('[?&]' + k + '=([^&]+)').exec(location.search); return m ? decodeURIComponent(m[1]) : null; }
  function el(id) { return document.getElementById(id); }

  function render() {
    var slug = window.__SVC || qp('s'); if (!DATA[slug]) slug = 'iso-27001';
    var d = DATA[slug];
    document.title = 'Stenward — ' + d.name;
    el('svc-no').textContent = d.no + ' / 06';
    el('svc-name').textContent = d.name;
    el('svc-line').textContent = d.line;
    el('svc-intro').textContent = d.intro;
    el('svc-timeline').textContent = d.timeline;
    el('svc-includes').innerHTML = d.includes.map(function (x) { return '<li>' + x + '</li>'; }).join('');
    el('svc-deliver').innerHTML = d.deliver.map(function (x, i) { return '<div class="dget"><span class="dget-no mono">' + String(i + 1).padStart(2, '0') + '</span><span>' + x + '</span></div>'; }).join('');
    // related: the other services
    var rel = ORDER.filter(function (s) { return s !== slug; }).slice(0, 5);
    el('svc-related').innerHTML = rel.map(function (s) {
      return '<a class="rel-item" href="service.html?s=' + s + '"><span class="rel-no mono">' + DATA[s].no + '</span><span class="rel-name">' + DATA[s].name + '</span><span class="rel-ar">↗</span></a>';
    }).join('');
    renderSig(slug);
  }

  /* ── signature visual — distinct per service ── */
  function bars(rows) {
    return rows.map(function (r) {
      return '<div class="gg-row"><span class="gg-l">' + r[0] + '</span><div class="gg-track"><i style="width:' + r[1] + '%"></i></div><span class="gg-v mono">' + r[1] + '%</span></div>';
    }).join('');
  }
  var SIG = {
    'iso-27001': { eyebrow: 'The engagement', title: 'A clear path to audit-ready.', html:
      '<div class="sig-path"><div class="sp-rail"><i></i></div>' +
      ['01|Scope|2–4 wks', '02|Build the ISMS|4–6 mo', '03|Prepare|6–8 wks', '04|External audit|with you'].map(function (n, i) {
        var p = n.split('|'); return '<div class="sp-node' + (i === 3 ? ' done' : '') + '"><span class="sp-dia"><b>' + p[0] + '</b></span><div class="sp-k">' + p[1] + '</div><div class="sp-s mono">' + p[2] + '</div></div>';
      }).join('') + '</div>' },
    'gap-analysis': { eyebrow: 'The assessment', title: 'See exactly where you stand.', html:
      '<div class="sig-gauge"><div class="gg-meter"><span class="gg-have"></span><span class="gg-mark"></span></div>' +
      '<div class="gg-scale"><span class="gg-now"><b class="mono">42%</b> &nbsp;where you are today</span><span class="gg-target mono">Target · 100%</span></div>' +
      '<div class="gg-rows">' + bars([['Policies & governance', 55], ['Risk management', 30], ['Access & technology', 48], ['Evidence & audit', 22]]) + '</div></div>' },
    'isms-maintenance': { eyebrow: 'The rhythm', title: 'Audit-ready, year after year.', html:
      '<div class="sig-cycle"><svg class="cyc-ring" viewBox="0 0 220 220"><circle cx="110" cy="110" r="86"/></svg>' +
      '<div class="cyc-center"><span class="mono">3-YEAR</span><b>Cycle</b></div>' +
      '<div class="cyc-node t"><span class="cn-dia"></span><div class="cn-l">Certification</div></div>' +
      '<div class="cyc-node r"><span class="cn-dia"></span><div class="cn-l">Surveillance · Y1</div></div>' +
      '<div class="cyc-node b"><span class="cn-dia"></span><div class="cn-l">Surveillance · Y2</div></div>' +
      '<div class="cyc-node l"><span class="cn-dia"></span><div class="cn-l">Recertification</div></div></div>' },
    'internal-audit': { eyebrow: 'The dry run', title: 'Find the gaps before the auditor does.', html:
      '<div class="sig-audit"><div class="sa-ring" style="--p:96"><div class="sa-ring-in"><b class="mono">96%</b><span>ready</span></div></div>' +
      '<ul class="sa-list">' + ['Scope & Statement of Applicability reviewed', 'Controls tested against Annex A', 'Evidence sampled and verified', 'Findings logged and remediated', 'Management review run before the audit'].map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>' },
    'questionnaire': { eyebrow: 'The turnaround', title: 'Questions in. Answers out.', html:
      '<div class="sig-q"><div class="sq-rows">' +
      ['Do you hold ISO 27001?', 'How is customer data encrypted at rest?', 'Describe your access control policy', 'What is your incident-response SLA?'].map(function (q) { return '<div class="sq-row"><span class="sq-q">' + q + '</span><span class="sq-a mono">Answered</span></div>'; }).join('') +
      '</div><div class="sq-stat"><b class="mono">48h</b><span>average turnaround</span></div></div>' },
    'awareness-training': { eyebrow: 'The programme', title: 'Training your team finishes.', html:
      '<div class="sig-train"><div class="st-ring" style="--p:90"><div class="st-ring-in"><b class="mono">90%</b><span>completion</span></div></div>' +
      '<div class="st-mods">' + [['Phishing awareness', 100], ['Data handling', 92], ['Secure development', 78], ['Incident reporting', 88]].map(function (m) { return '<div class="gg-row"><span class="gg-l">' + m[0] + '</span><div class="gg-track"><i style="width:' + m[1] + '%"></i></div><span class="gg-v mono">' + m[1] + '%</span></div>'; }).join('') + '</div></div>' }
  };
  function renderSig(slug) {
    var sig = SIG[slug] || SIG['iso-27001'];
    if (el('sig-eyebrow')) el('sig-eyebrow').textContent = sig.eyebrow;
    if (el('sig-title')) el('sig-title').textContent = sig.title;
    if (el('svc-sig')) el('svc-sig').innerHTML = sig.html;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
