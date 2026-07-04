/* Stenward — full booking flow: Date → Time → Details → Confirmed. */
(function () {
  var state = { day: null, time: null, name: '', email: '', company: '', note: '', ref: '', y: null, m: null };
  var TIMES = ['09:00', '09:30', '10:00', '11:30', '13:00', '14:00', '15:30', '16:30'];

  /* ── Booking delivery ──────────────────────────────────────────────
     Submissions are sent to info@stenward.com via Web3Forms.
     If the send ever fails, we DO NOT hijack the page — we just show a
     manual "email us" link so the visitor (and the booking) is never lost. */
  var WEB3FORMS_KEY = '3a7ec708-ac09-4c51-9295-fd96f0023df9';
  var INBOX = 'info@stenward.com';
  var STEP = 1, MAXSTEP = 4;
  var MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var view = { y: today.getFullYear(), m: today.getMonth() }; // month shown in the calendar (m: 0-11)
  var MONTH = MONTH_NAMES[view.m] + ' ' + view.y;             // label used in summary + email
  var MAX_AHEAD = 6;                                          // months ahead a visitor can browse
  function $(s) { return document.querySelector(s); }
  function $$(s) { return [].slice.call(document.querySelectorAll(s)); }
  function qp(k) { var m = new RegExp('[?&]' + k + '=([^&]+)').exec(location.search); return m ? decodeURIComponent(m[1]) : null; }

  function go(n) {
    STEP = Math.max(1, Math.min(MAXSTEP, n));
    $$('.bk-panel').forEach(function (p) { p.classList.toggle('on', +p.getAttribute('data-step') === STEP); });
    $$('.st-node').forEach(function (nd) {
      var i = +nd.getAttribute('data-i');
      nd.classList.toggle('done', i < STEP);
      nd.classList.toggle('active', i === STEP);
    });
    var fill = ((STEP - 1) / (MAXSTEP - 1) * 100).toFixed(1);
    var bar = $('.st-fill'); if (bar) bar.style.width = fill + '%';
    summary();
  }

  function summary() {
    var s = $('#bk-summary');
    if (!s) return;
    s.innerHTML =
      row('Service', '30-minute consultation') +
      row('With', 'Zorain Choudhary') +
      row('Date', state.day ? state.day + ' ' + MONTH : '—') +
      row('Time', state.time ? state.time + ' GMT' : '—');
  }
  function row(k, v) { return '<div class="sm-row"><span class="sm-k mono">' + k + '</span><span class="sm-v">' + v + '</span></div>'; }

  function monthLabel() { return MONTH_NAMES[view.m] + ' ' + view.y; }
  function atCurrentMonth() { return view.y === today.getFullYear() && view.m === today.getMonth(); }

  function updateCalHeader() {
    MONTH = monthLabel();
    var chip = document.querySelector('.bk-panel[data-step="1"] .chip');
    if (chip) chip.textContent = MONTH + ' · GMT';
    var prev = $('#bk-prev'), next = $('#bk-next');
    if (prev) prev.disabled = atCurrentMonth();
    if (next) {
      var max = new Date(today.getFullYear(), today.getMonth() + MAX_AHEAD, 1);
      next.disabled = new Date(view.y, view.m + 1, 1) > max;
    }
  }

  function buildCalendar() {
    var grid = $('#bk-days'); if (!grid) return; grid.innerHTML = '';
    updateCalHeader();
    // leading blanks so day 1 sits under the correct weekday (Monday-first)
    var firstDow = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // 0 = Monday
    for (var i = 0; i < firstDow; i++) {
      var pad = document.createElement('button');
      pad.type = 'button'; pad.className = 'pad'; pad.disabled = true; pad.setAttribute('aria-hidden', 'true');
      grid.appendChild(pad);
    }
    var daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    for (var d = 1; d <= daysInMonth; d++) {
      var cellDate = new Date(view.y, view.m, d);
      var dow = cellDate.getDay();                 // 0 = Sun ... 6 = Sat
      var weekend = dow === 0 || dow === 6;
      var past = cellDate < today;
      var b = document.createElement('button'); b.type = 'button'; b.textContent = d;
      b.disabled = weekend || past;
      if (cellDate.getTime() === today.getTime()) b.classList.add('today');
      if (!b.disabled) b.addEventListener('click', function (day, btn) {
        return function () {
          state.day = day; state.y = view.y; state.m = view.m;
          MONTH = monthLabel();
          $$('#bk-days button').forEach(function (x) { x.classList.remove('sel'); });
          btn.classList.add('sel');
          buildTimes();
          go(2);
        };
      }(d, b));
      grid.appendChild(b);
    }
  }

  function shiftMonth(delta) {
    var d = new Date(view.y, view.m + delta, 1);
    var min = new Date(today.getFullYear(), today.getMonth(), 1);
    var max = new Date(today.getFullYear(), today.getMonth() + MAX_AHEAD, 1);
    if (d < min || d > max) return;
    view.y = d.getFullYear(); view.m = d.getMonth();
    buildCalendar();
  }

  function buildTimes() {
    var grid = $('#bk-times'); if (!grid) return; grid.innerHTML = '';
    $('#bk-time-date').textContent = state.day + ' ' + MONTH;
    TIMES.forEach(function (t) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = t;
      b.addEventListener('click', function () {
        state.time = t;
        $$('#bk-times button').forEach(function (x) { x.classList.remove('sel'); });
        b.classList.add('sel');
        $('#bk-to-details').disabled = false;
      });
      grid.appendChild(b);
    });
    $('#bk-to-details').disabled = !state.time;
  }

  function ics() {
    // minimal .ics for the chosen slot (30 min, UK)
    var ym = (state.y || today.getFullYear()).toString() + String((state.m != null ? state.m : today.getMonth()) + 1).padStart(2, '0');
    var dd = String(state.day).padStart(2, '0');
    var hm = (state.time || '09:00').replace(':', '');
    var start = ym + dd + 'T' + hm + '00';
    var endH = String((+(state.time || '09:00').slice(0, 2)) + (((state.time || '09:00').slice(3) === '30') ? 1 : 0)).padStart(2, '0');
    var endM = (state.time || '09:00').slice(3) === '30' ? '00' : '30';
    var end = ym + dd + 'T' + endH + endM + '00';
    var body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Stenward//Booking//EN', 'BEGIN:VEVENT',
      'SUMMARY:Stenward — ISO 27001 consultation', 'DESCRIPTION:30-minute call with Zorain Choudhary',
      'DTSTART:' + start, 'DTEND:' + end, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return 'data:text/calendar;charset=utf8,' + encodeURIComponent(body);
  }

  function confirm() {
    state.name = $('#bk-name').value.trim();
    state.email = $('#bk-email').value.trim();
    state.company = $('#bk-company').value.trim();
    state.note = $('#bk-note').value.trim();
    var ok = true;
    [['#bk-name', state.name], ['#bk-email', /.+@.+\..+/.test(state.email)]].forEach(function (p) {
      var bad = !p[1]; $(p[0]).classList.toggle('err', bad); if (bad) ok = false;
    });
    if (!ok) return;
    var ref = 'STW-' + Math.random().toString(36).slice(2, 6).toUpperCase() + (state.day || '');
    state.ref = ref;
    $('#bk-ref').textContent = ref;
    $('#bk-done-when').textContent = state.day + ' ' + MONTH + ' at ' + state.time + ' GMT';
    $('#bk-done-name').textContent = state.name.split(' ')[0] || 'there';
    $('#bk-ics').href = ics();
    go(4);          // always show the confirmation screen
    sendBooking();  // then fire the email (non-blocking, self-reporting)
  }

  function bookingText() {
    return [
      'New booking request via stenward.com',
      '',
      'Reference:  ' + state.ref,
      'Name:       ' + state.name,
      'Email:      ' + state.email,
      'Company:    ' + (state.company || '—'),
      'Date:       ' + state.day + ' ' + MONTH,
      'Time:       ' + state.time + ' GMT',
      'Duration:   30 minutes',
      '',
      'What prompted this:',
      state.note || '—'
    ].join('\n');
  }

  // Update the small line under the confirmation with delivery status.
  function setStatus(kind, msg) {
    var el = $('.bk-fallback');
    if (!el) return;
    if (kind === 'ok') {
      el.innerHTML = '<span style="color:var(--teal,#00FDB3)">✓ Sent to our team. We\'ll be in touch to confirm.</span>';
    } else {
      el.innerHTML = msg;
    }
  }

  function sendBooking() {
    var subject = 'Booking ' + state.ref + ' — ' + state.name + ' (' + state.day + ' ' + MONTH + ')';
    var body = bookingText();
    // keep the manual link populated as a safety net (no auto-navigation)
    var link = $('#bk-mailto');
    if (link) link.href = 'mailto:' + INBOX + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

    if (!WEB3FORMS_KEY) { return; }

    setStatus('pending', 'Sending your booking…');

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: subject,
        from_name: 'Stenward booking',
        replyto: state.email,
        botcheck: '',
        name: state.name,
        email: state.email,
        company: state.company || '—',
        date: state.day + ' ' + MONTH,
        time: state.time + ' GMT',
        reference: state.ref,
        message: state.note || '—'
      })
    })
    .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
    .then(function (res) {
      if (res.ok && res.d && res.d.success) {
        setStatus('ok');
      } else {
        setStatus('err', 'Couldn\'t send automatically — <a id="bk-mailto" href="' + ($('#bk-mailto') ? $('#bk-mailto').href : 'mailto:' + INBOX) + '">email your booking to ' + INBOX + '</a> instead.');
      }
    })
    .catch(function () {
      setStatus('err', 'Couldn\'t send automatically — <a id="bk-mailto" href="' + ($('#bk-mailto') ? $('#bk-mailto').href : 'mailto:' + INBOX) + '">email your booking to ' + INBOX + '</a> instead.');
    });
  }

  function init() {
    (function () {
      var cap = document.querySelector('.bk-panel[data-step="1"] .bk-cap');
      if (cap && !document.getElementById('bk-prev')) {
        var nav = document.createElement('div');
        nav.className = 'cal-nav';
        nav.innerHTML =
          '<button type="button" id="bk-prev" aria-label="Previous month">\u2039</button>' +
          '<button type="button" id="bk-next" aria-label="Next month">\u203A</button>';
        cap.appendChild(nav);
        nav.querySelector('#bk-prev').addEventListener('click', function () { shiftMonth(-1); });
        nav.querySelector('#bk-next').addEventListener('click', function () { shiftMonth(1); });
      }
    })();
    buildCalendar();
    $('#bk-back-1') && $('#bk-back-1').addEventListener('click', function () { go(1); });
    $('#bk-to-details') && $('#bk-to-details').addEventListener('click', function () { go(3); });
    $('#bk-back-2') && $('#bk-back-2').addEventListener('click', function () { go(2); });
    $('#bk-confirm') && $('#bk-confirm').addEventListener('click', confirm);
    $$('.st-node').forEach(function (nd) {
      nd.addEventListener('click', function () { var i = +nd.getAttribute('data-i'); if (i < STEP) go(i); });
    });
    // deep-link a preselected day (and month) from the homepage preview calendar
    var mm = qp('m'); // YYYY-MM
    if (mm && /^\d{4}-\d{2}$/.test(mm)) {
      var py = parseInt(mm.slice(0, 4), 10), pm = parseInt(mm.slice(5, 7), 10) - 1;
      var pick = new Date(py, pm, 1);
      var lo = new Date(today.getFullYear(), today.getMonth(), 1);
      var hi = new Date(today.getFullYear(), today.getMonth() + MAX_AHEAD, 1);
      if (pick >= lo && pick <= hi) { view.y = py; view.m = pm; buildCalendar(); }
    }
    var d = parseInt(qp('d'), 10);
    var dim = new Date(view.y, view.m + 1, 0).getDate();
    if (d >= 1 && d <= dim) {
      var cd = new Date(view.y, view.m, d), dow = cd.getDay();
      if (!(dow === 0 || dow === 6) && cd >= today) {
        state.day = d; state.y = view.y; state.m = view.m; MONTH = monthLabel();
        var btn = $$('#bk-days button').filter(function (b) { return +b.textContent === d; })[0];
        if (btn) btn.classList.add('sel');
        buildTimes(); go(2);
        return;
      }
    }
    go(1);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
