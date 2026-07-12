/**
 * SELF-CONTAINED GLOBAL GPA CONVERTER + PDF EXPORT
 * No external dependencies required.
 */
(function () {
  "use strict";

  // --- INTERNAL UTILITIES ---
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var esc = function (s) { 
    if (!s) return "";
    return String(s).replace(/[&<>"']/g, function (m) { 
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]; 
    }); 
  };
  var uid = function () { return Math.random().toString(36).slice(2, 9); };

  // --- GRADING DATABASE ---
  var SCALES = [
    {id:"us40",country:"United States",system:"4.0 Letter (GPA)",type:"select",rows:[{g:"A+",p:4,l:"A+"},{g:"A",p:4,l:"A"},{g:"A-",p:3.7,l:"A-"},{g:"B+",p:3.3,l:"B+"},{g:"B",p:3,l:"B"},{g:"B-",p:2.7,l:"B-"},{g:"C+",p:2.3,l:"C+"},{g:"C",p:2,l:"C"},{g:"C-",p:1.7,l:"C-"},{g:"D+",p:1.3,l:"D+"},{g:"D",p:1,l:"D"},{g:"D-",p:0.7,l:"D-"},{g:"F",p:0,l:"F"}]},
    {id:"uk",country:"United Kingdom",system:"Honours Classification",type:"select",rows:[{g:"First (1st, 70–100%)",p:4.0,l:"A"},{g:"Upper Second (2:1, 60–69%)",p:3.7,l:"A-"},{g:"Lower Second (2:2, 50–59%)",p:3.0,l:"B"},{g:"Third (3rd, 40–49%)",p:2.3,l:"C+"},{g:"Fail (0–39%)",p:0,l:"F"}]},
    {id:"ects",country:"Europe",system:"ECTS Grade",type:"select",rows:[{g:"A (Excellent)",p:4.0,l:"A"},{g:"B (Very good)",p:3.5,l:"A-"},{g:"C (Good)",p:3.0,l:"B"},{g:"D (Satisfactory)",p:2.5,l:"B-"},{g:"E (Sufficient)",p:2.0,l:"C"},{g:"FX/F (Fail)",p:0,l:"F"}]},
    {id:"india10",country:"India",system:"10-point CGPA",type:"number",max:10,step:"0.01",rows:[{g:"9.0–10 (O)",min:9.0,p:4.0,l:"A"},{g:"8.0–8.9 (A+)",min:8.0,p:3.7,l:"A-"},{g:"7.0–7.9 (A)",min:7.0,p:3.3,l:"B+"},{g:"6.0–6.9 (B+)",min:6.0,p:3.0,l:"B"},{g:"5.0–5.9 (B)",min:5.0,p:2.3,l:"C+"},{g:"4.0–4.9 (C)",min:4.0,p:2.0,l:"C"},{g:"Below 4.0 (F)",min:0,p:0,l:"F"}]},
    {id:"indiapct",country:"India",system:"Percentage",type:"number",max:100,step:"0.1",rows:[{g:"90–100%",min:90,p:4.0,l:"A"},{g:"80–89%",min:80,p:3.7,l:"A-"},{g:"70–79%",min:70,p:3.3,l:"B+"},{g:"60–69%",min:60,p:3.0,l:"B"},{g:"50–59%",min:50,p:2.3,l:"C+"},{g:"40–49%",min:40,p:2.0,l:"C"},{g:"Below 40%",min:0,p:0,l:"F"}]},
    {id:"pakhec",country:"Pakistan",system:"HEC 4.0 CGPA",type:"number",max:4,step:"0.01",rows:[{g:"3.7–4.0",min:3.7,p:4.0,l:"A"},{g:"3.3–3.69",min:3.3,p:3.7,l:"A-"},{g:"3.0–3.29",min:3.0,p:3.3,l:"B+"},{g:"2.7–2.99",min:2.7,p:3.0,l:"B"},{g:"2.0–2.69",min:2.0,p:2.3,l:"C+"},{g:"1.0–1.99",min:1.0,p:1.3,l:"D+"},{g:"Below 1.0",min:0,p:0,l:"F"}]},
    {id:"canada",country:"Canada",system:"Percentage",type:"number",max:100,step:"0.1",rows:[{g:"90–100 (A+)",min:90,p:4.0,l:"A+"},{g:"85–89 (A)",min:85,p:4.0,l:"A"},{g:"80–84 (A-)",min:80,p:3.7,l:"A-"},{g:"77–79 (B+)",min:77,p:3.3,l:"B+"},{g:"73–76 (B)",min:73,p:3.0,l:"B"},{g:"70–72 (B-)",min:70,p:2.7,l:"B-"},{g:"60–69 (C)",min:60,p:2.0,l:"C"},{g:"50–59 (D)",min:50,p:1.0,l:"D"},{g:"Below 50 (F)",min:0,p:0,l:"F"}]}
  ];

  var SCALE_BY_ID = {}; SCALES.forEach(function(s){ SCALE_BY_ID[s.id] = s; });

  // --- APP STATE ---
  var state = {
    country: "India",
    scaleId: "india10",
    rows: [{ id: uid(), name: "Course 1", grade: "8.5", credits: 4 }]
  };

  // --- LOGIC ---
  function getScale() { return SCALE_BY_ID[state.scaleId] || SCALES[0]; }

  function usLetter(p) {
    if (p >= 3.85) return "A"; if (p >= 3.7) return "A-"; if (p >= 3.3) return "B+";
    if (p >= 3.0) return "B"; if (p >= 2.7) return "B-"; if (p >= 2.3) return "C+";
    if (p >= 2.0) return "C"; if (p >= 1.7) return "C-"; if (p >= 1.3) return "D+";
    if (p >= 1.0) return "D"; if (p >= 0.7) return "D-"; return "F";
  }

  function getPtsAndLetter(scale, val) {
    var pts = 0, letter = "F";
    if (scale.type === "select") {
      var found = scale.rows.find(function(x) { return x.g === val; });
      if (found) { pts = found.p; letter = found.l; }
    } else {
      var v = parseFloat(val) || 0;
      var sorted = scale.rows.slice().sort(function(a, b) { return (b.min || 0) - (a.min || 0); });
      for (var i = 0; i < sorted.length; i++) {
        if (v >= sorted[i].min) { pts = sorted[i].p; letter = sorted[i].l || usLetter(pts); break; }
      }
    }
    return { pts: pts, letter: letter };
  }

  function compute() {
    var scale = getScale();
    var tCr = 0, tQp = 0;
    
    state.rows.forEach(function (r) {
      var cr = parseFloat(r.credits) || 0;
      var res = getPtsAndLetter(scale, r.grade);
      if (cr > 0) { tCr += cr; tQp += (res.pts * cr); }
    });

    var finalGpa = tCr ? (tQp / tCr).toFixed(2) : "0.00";
    if ($("#gpaOut")) $("#gpaOut").textContent = finalGpa;
    if ($("#mCourses")) $("#mCourses").textContent = state.rows.length;
    if ($("#mCredits")) $("#mCredits").textContent = tCr.toFixed(1);
    if ($("#mQp")) $("#mQp").textContent = tQp.toFixed(1);
    if ($("#gpaLetter")) $("#gpaLetter").textContent = tCr ? ("US " + usLetter(parseFloat(finalGpa))) : "Add a course to begin";
  }

  function renderCountry() {
    var countryEl = $("#country");
    if (!countryEl) return;
    var countries = []; var seen = {};
    SCALES.forEach(function (s) { if (!seen[s.country]) { seen[s.country] = true; countries.push(s.country); } });
    countryEl.innerHTML = countries.map(function(c) { return '<option ' + (c === state.country ? "selected" : "") + '>' + esc(c) + '</option>'; }).join("");
    renderScaleOptions();
  }

  function renderScaleOptions() {
    state.country = $("#country").value;
    var list = SCALES.filter(function(s) { return s.country === state.country; });
    if (!list.some(function(s) { return s.id === state.scaleId; })) state.scaleId = list[0].id;
    $("#scaleSel").innerHTML = list.map(function(s) { return '<option value="' + s.id + '" ' + (s.id === state.scaleId ? "selected" : "") + '>' + esc(s.system) + '</option>'; }).join("");
    renderRows();
  }

  function renderRows() {
    var scale = getScale();
    var container = $("#rows");
    if (!container) return;

    container.innerHTML = state.rows.map(function(r) {
      var gIn = scale.type === "select" ? 
        '<select class="select" data-f="grade">' + scale.rows.map(function(x) { return '<option ' + (r.grade===x.g?'selected':'') + '>' + esc(x.g) + '</option>'; }).join("") + '</select>' :
        '<input class="input tnum" data-f="grade" type="number" step="' + scale.step + '" value="' + esc(r.grade) + '">';

      return '<div class="crow" data-id="' + r.id + '">' +
        '<div class="c-name"><input class="input" data-f="name" value="' + esc(r.name) + '" placeholder="Course"></div>' +
        '<div class="c-grade">' + gIn + '</div>' +
        '<div class="c-credit"><input class="input tnum" data-f="credits" type="number" value="' + esc(r.credits) + '"></div>' +
        '<div class="c-del"><button class="row-del" data-del="' + r.id + '">✕</button></div>' +
        '</div>';
    }).join("");

    $$(".crow").forEach(function(row) {
      var id = row.getAttribute("data-id");
      var inps = row.querySelectorAll("[data-f]");
      for(var i=0; i<inps.length; i++) {
        inps[i].oninput = function() {
          var r = state.rows.find(function(x) { return x.id === id; });
          if (r) { r[this.getAttribute("data-f")] = this.value; compute(); }
        };
      }
    });

    $$("[data-del]").forEach(function(btn) {
      btn.onclick = function() {
        state.rows = state.rows.filter(function(r) { return r.id !== btn.getAttribute("data-del"); });
        renderRows();
      };
    });
    compute();
  }

  function exportReport() {
    var scale = getScale();
    var tCr = 0, tQp = 0;
    var rowsHtml = "";

    state.rows.forEach(function (r) {
      var cr = parseFloat(r.credits) || 0;
      var res = getPtsAndLetter(scale, r.grade);
      var qp = (res.pts * cr);
      tCr += cr; tQp += qp;
      rowsHtml += '<tr><td>' + esc(r.name || "Course") + '</td><td>' + esc(r.grade) + '</td><td>' + res.letter + '</td><td>' + res.pts.toFixed(2) + '</td><td>' + cr + '</td><td>' + qp.toFixed(2) + '</td></tr>';
    });

    if (tCr === 0) { alert("Please add courses with credits first."); return; }

    var finalGpa = (tQp / tCr).toFixed(2);
    var reportArea = $("#report");
    if (!reportArea) return;

    reportArea.innerHTML = '<div style="font-family:sans-serif; padding:40px; color:#111;">' +
      '<h1 style="margin-bottom:5px;">GPA Conversion Report</h1>' +
      '<p style="color:#666; margin-top:0;">Source: ' + scale.country + ' (' + scale.system + ')</p>' +
      '<div style="background:#f4f4f4; padding:20px; border-radius:10px; margin:20px 0; display:flex; gap:40px;">' +
      '<div><small>US GPA (4.0)</small><br><b style="font-size:32px;">' + finalGpa + '</b></div>' +
      '<div><small>US Letter</small><br><b style="font-size:32px;">' + usLetter(parseFloat(finalGpa)) + '</b></div>' +
      '</div>' +
      '<table border="1" style="width:100%; border-collapse:collapse; text-align:left;" cellpadding="10">' +
      '<thead style="background:#eee;"><tr><th>Course</th><th>Local Grade</th><th>US Letter</th><th>US Pts</th><th>Credits</th><th>Quality Pts</th></tr></thead>' +
      '<tbody>' + rowsHtml + '</tbody>' +
      '<tfoot><tr style="font-weight:bold;"><td colspan="4">TOTALS</td><td>' + tCr + '</td><td>' + tQp.toFixed(2) + '</td></tr></tfoot>' +
      '</table>' +
      '<p style="margin-top:30px; font-size:12px; color:#999;">Generated by Study Metrics. This report is for guidance only.</p>' +
      '</div>';
    
    window.print();
  }

  // --- INITIALIZE ---
  function init() {
    renderCountry();
    if ($("#country")) $("#country").onchange = renderScaleOptions;
    if ($("#scaleSel")) $("#scaleSel").onchange = function() { state.scaleId = this.value; renderRows(); };
    
    var addFn = function() { state.rows.push({ id: uid(), name: "", grade: "0", credits: 3 }); renderRows(); };
    if ($("#addRow")) $("#addRow").onclick = addFn;
    if ($("#addRow2")) $("#addRow2").onclick = addFn;
    if ($("#clearAll")) $("#clearAll").onclick = function() { if(confirm("Clear all rows?")) { state.rows = []; renderRows(); } };
    if ($("#exportBtn")) $("#exportBtn").onclick = exportReport;

    $$(".mode-seg button").forEach(function(btn) {
      btn.onclick = function() {
        var m = this.getAttribute("data-mode");
        $$(".mode-seg button").forEach(function(b) { b.classList.toggle("on", b === btn); });
        $("#panel-toUS").classList.toggle("hidden", m !== "toUS");
        $("#panel-toLocal").classList.toggle("hidden", m !== "toLocal");
      };
    });
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();
