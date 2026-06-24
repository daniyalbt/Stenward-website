/* Stenward — full booking flow: Date → Time → Details → Confirmed. */
(function () {
  var state = { day: null, time: null, name: '', email: '', company: '', note: '' };
  var TIMES = ['09:00', '09:30', '10:00', '11:30', '13:00', '14:00', '15:30', '16:30'];
  var STEP = 1, MAXSTEP = 4, MONTH = 'June 2026';
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

  function buildCalendar() {
    var grid = $('#bk-days'); if (!grid) return; grid.innerHTML = '';
    for (var d = 1; d <= 30; d++) {
      var dow = (d - 1) % 7, weekend = dow === 5 || dow === 6, past = d < 9;
      var b = document.createElement('button'); b.type = 'button'; b.textContent = d;
      b.disabled = weekend || past;
      if (d === 9) b.classList.add('today');
      if (!b.disabled) b.addEventListener('click', function (day, btn) {
        return function () {
          state.day = day;
          $$('#bk-days button').forEach(function (x) { x.classList.remove('sel'); });
          btn.classList.add('sel');
          buildTimes();
          go(2);
        };
      }(d, b));
      grid.appendChild(b);
    }
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
    // minimal .ics for the chosen slot (June 2026, 30 min, UK)
    var dd = String(state.day).padStart(2, '0');
    var hm = (state.time || '09:00').replace(':', '');
    var start = '202606' + dd + 'T' + hm + '00';
    var endH = String((+(state.time || '09:00').slice(0, 2)) + (((state.time || '09:00').slice(3) === '30') ? 1 : 0)).padStart(2, '0');
    var endM = (state.time || '09:00').slice(3) === '30' ? '00' : '30';
    var end = '202606' + dd + 'T' + endH + endM + '00';
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
    $('#bk-ref').textContent = ref;
    $('#bk-done-when').textContent = state.day + ' ' + MONTH + ' at ' + state.time + ' GMT';
    $('#bk-done-name').textContent = state.name.split(' ')[0] || 'there';
    $('#bk-ics').href = ics();
    go(4);
  }

  function init() {
    buildCalendar();
    $('#bk-back-1') && $('#bk-back-1').addEventListener('click', function () { go(1); });
    $('#bk-to-details') && $('#bk-to-details').addEventListener('click', function () { go(3); });
    $('#bk-back-2') && $('#bk-back-2').addEventListener('click', function () { go(2); });
    $('#bk-confirm') && $('#bk-confirm').addEventListener('click', confirm);
    $$('.st-node').forEach(function (nd) {
      nd.addEventListener('click', function () { var i = +nd.getAttribute('data-i'); if (i < STEP) go(i); });
    });
    // deep-link a preselected day from the homepage preview calendar
    var d = parseInt(qp('d'), 10);
    if (d >= 1 && d <= 30) {
      var dow = (d - 1) % 7;
      if (!(dow === 5 || dow === 6) && d >= 9) {
        state.day = d;
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
