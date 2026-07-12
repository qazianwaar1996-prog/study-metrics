/**
 * FINAL SELF-CONTAINED GPA CONVERTER + FIX FOR EXPORT BUTTON
 * Replace your entire gpa-converter.js with this code.
 */
(function () {
  "use strict";

  // --- INTERNAL UTILITIES ---
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.from(document.querySelectorAll(s)); };
  var esc = function (s) { 
    return String(s || "").replace(/[&<>"']/g, function (m) { 
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]; 
    }); 
  };
  var uid = function () { return Math.random().toString(36).slice(2, 9); };

  // --- DATABASE ---
  var SCALES = [
    {id:"us40",country:"United States",system:"4.0 Letter (GPA)",type:"select",rows:[{g:"A+",p:4,l:"A+"},{g:"A",p:4,l:"A"},{g:"A-",p:3.7,l:"A-"},{g:"B+",p:3.3,l:"B+"},{g:"B",p:3,l:"B"},{g:"B-",p:2.7,l:"B-"},{g:"C+",p:2.3,l:"C+"},{g:"C",p:2,l:"C"},{g:"C-",p:1.7,l:"C-"},{g:"D+",p:1.3,l:"D+"},{g:"D",p:1,l:"D"},{g:"D-",p:0.7,l:"D-"},{g:"F",p:0,l:"F"}]},
    {id:"uk",country:"United Kingdom",system:"Honours Classification",type:"select",rows:[{g:"First (1st, 70–100%)",p:4.0,l:"A"},{g:"Upper Second (2:1, 60–69%)",p:3.7,l:"A-"},{g:"Lower Second (2:2, 50–59%)",p:3.0,l:"B"},{g:"Third (3rd, 40–49%)",p:2.3,l:"C+"},{g:"Fail (0–39%)",p:0,l:"F"}]},
    {id:"ects",country:"Europe",system:"ECTS Grade",type:"select",rows:[{g:"A (Excellent)",p:4.0,l:"A"},{g:"B (Very good)",p:3.5,l:"A-"},{g:"C (Good)",p:3.0,l:"B"},{g:"D (Satisfactory)",p:2.5,l:"B-"},{g:"E (Sufficient)",p:2.0,l:"C"},{g:"FX/F (Fail)",p:0,l:"F"}]},
    {id:"india10",country:"India",system:"10-point CGPA",type:"number",max:10,step:"0.01",rows:[{g:"9.0–10 (O)",min:9.0,p:4.0,l:"A"},{g:"8.0–8.9 (A+)",min:8.0,p:3.7,l:"A-"},{g:"7.0–7.9 (A)",min:7.0,p:3.3,l:"B+"},{g:"6.0–6.9 (B+)",min:6.0,p:3.0,l:"B"},{g:"5.0–5.9 (B)",min:5.0,p:2.3,l:"C+"},{g:"4.0–4.9 (C)",min:4.0,p:2.0,l:"C"},{g:"Below 4.0 (F)",min:0,p:0,l:"F"}]},
    {id:"pakpct",country:"Pakistan",system:"Percentage",type:"number",max:100,step:"0.1",rows:[{g:"85–100%",min:85,p:4.0,l:"A"},{g:"80–84%",min:80,p:3.7,l:"A-"},{g:"75–79%",min:75,p:3.3,l:"B+"},{g:"71–74%",min:71,p:3.0,l:"B"},{g:"68–70%",min:68,p:2.7,l:"B-"},{g:"64–67%",min:64,p:2.3,l:"C+"},{g:"61–63%",min:61,p:2.0,l:"C"},{g:"Below 50%",min:0,p:0,l:"F"}]},
    {id:"canada",country:"Canada",system:"Percentage",type:"number",max:100,step:"0.1",rows:[{g:"90–100 (A+)",min:90,p:4.0,l:"A+"},{g:"85–89 (A)",min:85,p:4.0,l:"A"},{g:"80–84 (A-)",min:80,p:3.7,l:"A-"},{g:"77–79 (B+)",min:77,p:3.3,l:"B+"},{g:"73–76 (B)",min:73,p:3.0,l:"B"},{g:"70–72 (B-)",min:70,p:2.7,l:"B-"},{g:"Below 50 (F)",min:0,p:0,l:"F"}]}
  ];

  var SCALE_BY_ID = {}; SCALES.forEach(function(s){ SCALE_BY_ID[s.id] = s; });

  // --- STATE ---
  var state = {
    country: "India",
    scaleId: "india10",
    rows: [{ id: uid(), name: "Sample Course", grade: "8.5", credits: 4 }]
  };

  // --- LOGIC ---
  function getScale() { return SCALE_BY_ID[state.scaleId] || SCALES[0]; }

  function getPts(scale, val) {
    var v = parseFloat(val) || 0;
    if (scale.type === "select") {
      var found = scale.rows.find(x => x.g === val);
      return found ? found.p : 0;
    }
    var sorted = scale.rows.slice().sort((a, b) => (b.min || 0) - (a.min || 0));
    for (var i = 0; i < sorted.length; i++) {
      if (v >= sorted[i].min) return sorted[i].p;
    }
    return 0;
  }

  function compute() {
    var scale = getScale();
    var tCr = 0, tQp = 0;
    state.rows.forEach(function (r) {
      var cr = parseFloat(r.credits) || 0;
      var pts = getPts(scale, r.grade);
      if (cr > 0) { tCr += cr; tQp += (pts * cr); }
    });
    var res = tCr ? (tQp / tCr).toFixed(2) : "0.00";
    if ($("#gpaOut")) $("#gpaOut").textContent = res;
    if ($("#mCourses")) $("#mCourses").textContent = state.rows.length;
    if ($("#mCredits")) $("#mCredits").textContent = tCr.toFixed(1);
    if ($("#mQp")) $("#mQp").textContent = tQp.toFixed(1);
  }

  function renderCountry() {
    var countries = Array.from(new Set(SCALES.map(s => s.country)));
    var el = $("#country");
    if (!el) return;
    el.innerHTML = countries.map(c => `<option ${c===state.country?'selected':''}>${esc(c)}</option>`).join("");
    renderScaleOptions();
  }

  function renderScaleOptions() {
    state.country = $("#country").value;
    var list = SCALES.filter(s => s.country === state.country);
    if (!list.some(s => s.id === state.scaleId)) state.scaleId = list[0].id;
    $("#scaleSel").innerHTML = list.map(s => `<option value="${s.id}" ${s.id===state.scaleId?'selected':''}>${esc(s.system)}</option>`).join("");
    renderRows();
  }

  function renderRows() {
    var scale = getScale();
    $("#rows").innerHTML = state.rows.map(r => {
      var gIn = scale.type === "select" ? 
        `<select class="select" data-f="grade">${scale.rows.map(x => `<option ${r.grade===x.g?'selected':''}>${x.g}</option>`).join("")}</select>` :
        `<input class="input tnum" data-f="grade" type="number" step="${scale.step}" value="${esc(r.grade)}">`;

      return `<div class="crow" data-id="${r.id}">
        <div class="c-name"><input class="input" data-f="name" value="${esc(r.name)}" placeholder="Course"></div>
        <div class="c-grade">${gIn}</div>
        <div class="c-credit"><input class="input tnum" data-f="credits" type="number" value="${esc(r.credits)}"></div>
        <div class="c-del"><button class="row-del" data-del="${r.id}">✕</button></div>
      </div>`;
    }).join("");

    $$(".crow").forEach(row => {
      var id = row.getAttribute("data-id");
      row.querySelectorAll("[data-f]").forEach(inp => {
        inp.oninput = function() {
          var r = state.rows.find(x => x.id === id);
          if (r) { r[this.getAttribute("data-f")] = this.value; compute(); }
        };
      });
    });

    $$("[data-del]").forEach(btn => {
      btn.onclick = function() {
        state.rows = state.rows.filter(r => r.id !== this.getAttribute("data-del"));
        renderRows();
      };
    });
    compute();
  }

  // --- THE EXPORT FIX ---
  function exportReport() {
    var scale = getScale();
    var tCr = 0, tQp = 0;
    var rowsHtml = "";

    state.rows.forEach(function (r) {
      var cr = parseFloat(r.credits) || 0;
      var pts = getPts(scale, r.grade);
      var qp = (pts * cr);
      tCr += cr; tQp += qp;
      rowsHtml += `<tr>
        <td style="border:1px solid #ddd;padding:8px">${esc(r.name || "Course")}</td>
        <td style="border:1px solid #ddd;padding:8px">${esc(r.grade)}</td>
        <td style="border:1px solid #ddd;padding:8px">${pts.toFixed(2)}</td>
        <td style="border:1px solid #ddd;padding:8px">${cr}</td>
        <td style="border:1px solid #ddd;padding:8px;text-align:right">${qp.toFixed(2)}</td>
      </tr>`;
    });

    if (tCr === 0) { alert("Please add at least one course."); return; }

    var finalGpa = (tQp / tCr).toFixed(2);
    var report = $("#report");
    if (!report) return;

    report.innerHTML = `
      <div style="font-family:sans-serif;padding:40px;color:#000;background:#fff">
        <h2>GPA Conversion Report</h2>
        <p><b>Origin:</b> ${scale.country} (${scale.system})</p>
        <p style="font-size:24px"><b>Final US GPA: ${finalGpa}</b></p>
        <table style="width:100%;border-collapse:collapse;margin-top:20px">
          <thead><tr style="background:#f2f2f2">
            <th style="border:1px solid #ddd;padding:8px;text-align:left">Course</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:left">Grade</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:left">US Pts</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:left">Credits</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:right">Quality Pts</th>
          </tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <p style="margin-top:20px;font-size:12px;color:#666">Generated by Study Metrics. Guidance only.</p>
      </div>`;

    window.print();
  }

  // --- INIT ---
  document.addEventListener("DOMContentLoaded", function () {
    renderCountry();
    if ($("#country")) $("#country").onchange = renderScaleOptions;
    if ($("#scaleSel")) $("#scaleSel").onchange = function() { state.scaleId = this.value; renderRows(); };
    
    var addFn = function() { state.rows.push({id:uid(), name:"", grade:"0", credits:3}); renderRows(); };
    if ($("#addRow")) $("#addRow").onclick = addFn;
    if ($("#addRow2")) $("#addRow2").onclick = addFn;
    
    if ($("#exportBtn")) {
      $("#exportBtn").onclick = function(e) {
        e.preventDefault();
        exportReport();
      };
    }

    if ($("#clearAll")) $("#clearAll").onclick = function() { if(confirm("Clear all?")) { state.rows = []; renderRows(); } };

    $$(".mode-seg button").forEach(btn => {
      btn.onclick = function() {
        var m = this.getAttribute("data-mode");
        $$(".mode-seg button").forEach(b => b.classList.toggle("on", b === this));
        $("#panel-toUS").classList.toggle("hidden", m !== "toUS");
        $("#panel-toLocal").classList.toggle("hidden", m !== "toLocal");
      };
    });
  });
})();
 
