
/**
 * GLOBAL GPA CONVERTER - STUDY METRICS
 * Full Database & Logic
 */
(function () {
  "use strict";

  var $ = SM.$, $$ = SM.$$, round = SM.round, clamp = SM.clamp, uid = SM.uid, esc = SM.esc, store = SM.store;

  // US Letter Grade Mapping for the Converted Result
  function usLetter(p) {
    if (p >= 3.85) return "A";
    if (p >= 3.7) return "A-";
    if (p >= 3.3) return "B+";
    if (p >= 3.0) return "B";
    if (p >= 2.7) return "B-";
    if (p >= 2.3) return "C+";
    if (p >= 2.0) return "C";
    if (p >= 1.7) return "C-";
    if (p >= 1.3) return "D+";
    if (p >= 1.0) return "D";
    if (p >= 0.7) return "D-";
    return "F";
  }

  var LETTER_US = [
    { g: "A+", p: 4.0, l: "A+" }, { g: "A", p: 4.0, l: "A" }, { g: "A-", p: 3.7, l: "A-" },
    { g: "B+", p: 3.3, l: "B+" }, { g: "B", p: 3.0, l: "B" }, { g: "B-", p: 2.7, l: "B-" },
    { g: "C+", p: 2.3, l: "C+" }, { g: "C", p: 2.0, l: "C" }, { g: "C-", p: 1.7, l: "C-" },
    { g: "D+", p: 1.3, l: "D+" }, { g: "D", p: 1.0, l: "D" }, { g: "D-", p: 0.7, l: "D-" }, { g: "F", p: 0, l: "F" }
  ];

  // --- FULL GLOBAL SCALES DATABASE ---
  var SCALES = [
    { id: "us40", country: "United States", system: "4.0 Letter (GPA)", type: "select", rows: LETTER_US },
    { id: "uk", country: "United Kingdom", system: "Honours Classification", type: "select", rows: [{ g: "First (1st, 70–100%)", p: 4.0, l: "A" }, { g: "Upper Second (2:1, 60–69%)", p: 3.7, l: "A-" }, { g: "Lower Second (2:2, 50–59%)", p: 3.0, l: "B" }, { g: "Third (3rd, 40–49%)", p: 2.3, l: "C+" }, { g: "Fail (0–39%)", p: 0, l: "F" }] },
    { id: "ects", country: "Europe", system: "ECTS Grade", type: "select", rows: [{ g: "A (Excellent)", p: 4.0, l: "A" }, { g: "B (Very good)", p: 3.5, l: "A-" }, { g: "C (Good)", p: 3.0, l: "B" }, { g: "D (Satisfactory)", p: 2.5, l: "B-" }, { g: "E (Sufficient)", p: 2.0, l: "C" }, { g: "FX/F (Fail)", p: 0, l: "F" }] },
    { id: "india10", country: "India", system: "10-point CGPA", type: "number", max: 10, step: "0.01", rows: [{ g: "9.0–10 (O)", min: 9.0, p: 4.0, l: "A", repr: 9.5 }, { g: "8.0–8.9 (A+)", min: 8.0, p: 3.7, l: "A-", repr: 8.5 }, { g: "7.0–7.9 (A)", min: 7.0, p: 3.3, l: "B+", repr: 7.5 }, { g: "6.0–6.9 (B+)", min: 6.0, p: 3.0, l: "B", repr: 6.5 }, { g: "5.0–5.9 (B)", min: 5.0, p: 2.3, l: "C+", repr: 5.5 }, { g: "4.0–4.9 (C)", min: 4.0, p: 2.0, l: "C", repr: 4.5 }, { g: "Below 4.0 (F)", min: 0, p: 0, l: "F", repr: 2 }] },
    { id: "indiapct", country: "India", system: "Percentage", type: "number", max: 100, step: "0.1", rows: [{ g: "90–100%", min: 90, p: 4.0, l: "A", repr: 92 }, { g: "80–89%", min: 80, p: 3.7, l: "A-", repr: 84 }, { g: "70–79%", min: 70, p: 3.3, l: "B+", repr: 74 }, { g: "60–69%", min: 60, p: 3.0, l: "B", repr: 64 }, { g: "50–59%", min: 50, p: 2.3, l: "C+", repr: 54 }, { g: "40–49%", min: 40, p: 2.0, l: "C", repr: 44 }, { g: "Below 40%", min: 0, p: 0, l: "F", repr: 30 }] },
    { id: "pakhec", country: "Pakistan", system: "HEC 4.0 CGPA", type: "number", max: 4, step: "0.01", rows: [{ g: "3.7–4.0", min: 3.7, p: 4.0, l: "A", repr: 3.85 }, { g: "3.3–3.69", min: 3.3, p: 3.7, l: "A-", repr: 3.5 }, { g: "3.0–3.29", min: 3.0, p: 3.3, l: "B+", repr: 3.15 }, { g: "2.7–2.99", min: 2.7, p: 3.0, l: "B", repr: 2.85 }, { g: "2.0–2.69", min: 2.0, p: 2.3, l: "C+", repr: 2.35 }, { g: "1.0–1.99", min: 1.0, p: 1.3, l: "D+", repr: 1.5 }, { g: "Below 1.0", min: 0, p: 0, l: "F", repr: 0.5 }] },
    { id: "canada", country: "Canada", system: "Percentage", type: "number", max: 100, step: "0.1", rows: [{ g: "90–100 (A+)", min: 90, p: 4.0, l: "A+", repr: 93 }, { g: "85–89 (A)", min: 85, p: 4.0, l: "A", repr: 87 }, { g: "80–84 (A-)", min: 80, p: 3.7, l: "A-", repr: 82 }, { g: "77–79 (B+)", min: 77, p: 3.3, l: "B+", repr: 78 }, { g: "73–76 (B)", min: 73, p: 3.0, l: "B", repr: 74 }, { g: "70–72 (B-)", min: 70, p: 2.7, l: "B-", repr: 71 }, { g: "60–69 (C)", min: 60, p: 2.0, l: "C", repr: 65 }, { g: "50–59 (D)", min: 50, p: 1.0, l: "D", repr: 55 }, { g: "Below 50 (F)", min: 0, p: 0, l: "F", repr: 40 }] },
    { id: "australia", country: "Australia", system: "Grade (HD–F)", type: "select", rows: [{ g: "HD — High Distinction (85–100)", p: 4.0, l: "A" }, { g: "D — Distinction (75–84)", p: 3.7, l: "A-" }, { g: "C — Credit (65–74)", p: 3.0, l: "B" }, { g: "P — Pass (50–64)", p: 2.0, l: "C" }, { g: "F — Fail (0–49)", p: 0, l: "F" }] },
    { id: "germany", country: "Germany", system: "1.0–5.0 (1 best)", type: "number", max: 5, step: "0.1", rows: [{ g: "1.0–1.5 (Sehr gut)", min: 1.0, p: 4.0, l: "A", repr: 1.3 }, { g: "1.6–2.5 (Gut)", min: 1.6, p: 3.3, l: "B+", repr: 2.0 }, { g: "2.6–3.5 (Befriedigend)", min: 2.6, p: 2.7, l: "B-", repr: 3.0 }, { g: "3.6–4.0 (Ausreichend)", min: 3.6, p: 2.0, l: "C", repr: 3.8 }, { g: "4.1–5.0 (Nicht bestanden)", min: 4.1, p: 0, l: "F", repr: 4.7 }] }
  ];

  var SCALE_BY_ID = {}; SCALES.forEach(function (s) { SCALE_BY_ID[s.id] = s; });
  function sortedRows(s) { return s.rows.slice().sort(function (a, b) { return (b.min || 0) - (a.min || 0); }); }

  function pointsFor(scale, val) {
    if (scale.type === "select") {
      var r = scale.rows.find(function (x) { return x.g === val; });
      return r ? r.p : 0;
    }
    var v = +val || 0, rows = sortedRows(scale);
    for (var i = 0; i < rows.length; i++) { if (v >= rows[i].min) return rows[i].p; }
    return 0;
  }

  function letterFor(scale, val) {
    if (scale.type === "select") {
      var r = scale.rows.find(function (x) { return x.g === val; });
      return r ? r.l : "F";
    }
    var v = +val || 0, rows = sortedRows(scale);
    for (var i = 0; i < rows.length; i++) { if (v >= rows[i].min) return rows[i].l; }
    return "F";
  }

  var KEY = "sm_conv_state";
  var state = store.get(KEY, null) || { mode: "toUS", country: "India", scaleId: "india10", rows: [{ id: uid(), name: "Data Structures", grade: "8.5", credits: 4 }, { id: uid(), name: "Economics", grade: "7.2", credits: 3 }], revGpa: 3.6 };
  var lastResult = {};

  function save() { store.set(KEY, state); }

  function renderCountry() {
    var cs = []; var seen = {}; SCALES.forEach(function (s) { if (!seen[s.country]) { seen[s.country] = 1; cs.push(s.country); } });
    $("#country").innerHTML = cs.map(function (c) { return '<option ' + (c === state.country ? "selected" : "") + '>' + esc(c) + '</option>'; }).join("");
    renderScaleOptions();
  }

  function renderScaleOptions() {
    var list = SCALES.filter(function (s) { return s.country === state.country; });
    if (!list.some(function (s) { return s.id === state.scaleId; })) state.scaleId = list[0].id;
    $("#scaleSel").innerHTML = list.map(function (s) { return '<option value="' + s.id + '" ' + (s.id === state.scaleId ? "selected" : "") + '>' + esc(s.system) + '</option>'; }).join("");
  }

  function renderRows() {
    var scale = SCALE_BY_ID[state.scaleId];
    $("#rows").innerHTML = state.rows.map(function (r) {
      var gradeCell = scale.type === "select" ?
        '<select class="select" data-f="grade">' + scale.rows.map(function (x) { return '<option ' + (r.grade === x.g ? "selected" : "") + '>' + esc(x.g) + '</option>'; }).join("") + '</select>' :
        '<input class="input tnum" data-f="grade" type="number" step="' + scale.step + '" value="' + esc(r.grade) + '">';

      return '<div class="crow" data-id="' + r.id + '"><div class="c-name"><input class="input" data-f="name" value="' + esc(r.name) + '" placeholder="Course"></div><div class="c-grade">' + gradeCell + '</div><div class="c-credit"><input class="input tnum" data-f="credits" type="number" value="' + esc(r.credits) + '"></div><div class="c-del"><button class="row-del" data-del="' + r.id + '">✕</button></div></div>';
    }).join("");

    $$(".crow").forEach(function (row) {
      var id = row.getAttribute("data-id");
      $$("[data-f]", row).forEach(function (inp) {
        inp.addEventListener("input", function () {
          var r = state.rows.find(function (x) { return x.id === id; });
          if (r) { r[inp.getAttribute("data-f")] = inp.value; save(); compute(); }
        });
      });
    });

    $$("[data-del]").forEach(function (b) {
      b.onclick = function () {
        state.rows = state.rows.filter(function (r) { return r.id !== b.getAttribute("data-del"); });
        save(); renderRows();
        SM.toast("Course removed", "info");
      };
    });
    compute();
  }

  function compute() {
    var scale = SCALE_BY_ID[state.scaleId];
    var tCr = 0, tQp = 0, per = [];
    state.rows.forEach(function (r) {
      var cr = Math.max(0, +r.credits || 0), pts = pointsFor(scale, r.grade), qp = pts * cr;
      if (cr > 0) { tCr += cr; tQp += qp; }
      per.push({ name: r.name || "Untitled", grade: r.grade, pts: pts, cr: cr, qp: qp, letter: letterFor(scale, r.grade) });
    });
    var gpa = tCr ? round(tQp / tCr, 2) : 0;
    lastResult = { scale: scale, gpa: gpa, tCr: round(tCr, 1), tQp: round(tQp, 2), per: per };

    $("#gpaOut").textContent = gpa.toFixed(2);
    $("#gpaLetter").textContent = tCr ? ("US " + usLetter(gpa) + " · " + scale.country) : "Add a course";
    $("#mCourses").textContent = state.rows.length;
    $("#mCredits").textContent = round(tCr, 1);
    $("#mQp").textContent = round(tQp, 1);
    $("#refTitle").textContent = scale.system + " Reference";
    $("#refBadge").textContent = scale.country;

    $("#breakdown").innerHTML = per.map(function (p) {
      return '<div class="bd-row"><span>' + esc(p.name) + '</span><span class="tnum">' + p.pts.toFixed(2) + ' × ' + p.cr + '</span></div>';
    }).join("");

    var list = scale.type === "select" ? scale.rows : sortedRows(scale);
    $("#refBody").innerHTML = list.map(function (x) { return '<tr><td>' + esc(x.g) + '</td><td>' + x.l + '</td><td class="tnum">' + x.p.toFixed(2) + '</td></tr>'; }).join("");
  }

  function computeReverse() {
    var g = clamp(+$("#revGpa").value || 0, 0, 4.3);
    state.revGpa = g; save();
    $("#revUsLetter").textContent = "US Letter ≈ " + usLetter(g);
    var targets = ["india10", "indiapct", "uk", "ects", "pakhec", "canada", "germany"];
    $("#revGrid").innerHTML = targets.map(function (id) {
      var s = SCALE_BY_ID[id], rs = s.rows.slice().sort(function (a, b) { return b.p - a.p; });
      var m = rs.find(function (x) { return g >= x.p - 0.001; }) || rs[rs.length - 1];
      return '<div class="rev-card"><div class="sys">' + esc(s.country) + '</div><div class="val">' + (m.repr || m.g) + '</div><div class="desc">' + m.g + '</div></div>';
    }).join("");
  }

  function setMode(m) {
    state.mode = m; save();
    $$(".mode-seg button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-mode") === m); });
    $("#panel-toUS").classList.toggle("hidden", m !== "toUS");
    $("#panel-toLocal").classList.toggle("hidden", m !== "toLocal");
    if (m === "toLocal") computeReverse();
  }

  function exportReport() {
    if (!lastResult.tCr) { SM.toast("Add courses first", "error"); return; }
    var s = lastResult.scale, date = new Date().toLocaleDateString();
    var rowsHtml = lastResult.per.map(function (p) {
      return '<tr><td>' + esc(p.name) + '</td><td>' + esc(String(p.grade)) + '</td><td>' + p.pts.toFixed(2) + '</td><td>' + p.cr + '</td><td>' + p.qp.toFixed(2) + '</td></tr>';
    }).join("");

    $("#report").innerHTML = '<div class="print-wrap"><h1>GPA Conversion Report</h1><p>Source: ' + s.country + ' (' + s.system + ')</p><h2>US GPA: ' + lastResult.gpa.toFixed(2) + ' (' + usLetter(lastResult.gpa) + ')</h2><table><thead><tr><th>Course</th><th>Grade</th><th>US Pts</th><th>Credits</th><th>Quality Pts</th></tr></thead><tbody>' + rowsHtml + '</tbody></table><p>Total Credits: ' + lastResult.tCr + ' | Generated: ' + date + '</p></div>';
    window.print();
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderCountry(); renderRows();
    $("#country").onchange = function (e) { state.country = e.target.value; renderScaleOptions(); state.scaleId = $("#scaleSel").value; save(); compute(); renderRows(); };
    $("#scaleSel").onchange = function (e) { state.scaleId = e.target.value; save(); compute(); renderRows(); };
    $("#addRow").onclick = $("#addRow2").onclick = function () { state.rows.push({ id: uid(), name: "", grade: SCALE_BY_ID[state.scaleId].type === "select" ? SCALE_BY_ID[state.scaleId].rows[0].g : "0", credits: 3 }); save(); renderRows(); SM.toast("Course added", "success"); };
    $("#clearAll").onclick = function () { if (confirm("Clear all?")) { state.rows = []; save(); renderRows(); } };
    $("#exportBtn").onclick = exportReport;
    $$(".mode-seg button").forEach(function (b) { b.onclick = function () { setMode(b.getAttribute("data-mode")); }; });
    $("#revGpa").oninput = computeReverse;
    setMode(state.mode);
  });
})();
```
