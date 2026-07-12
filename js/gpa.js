/**
 * GPA CALCULATOR LOGIC
 */
(function () {
  "use strict";

  var $ = SM.$, $$ = SM.$$, round = SM.round, clamp = SM.clamp, uid = SM.uid, esc = SM.esc, store = SM.store;

  var LETTERS = ["A+","A","A-","B+","B","B-","C+","C","C-","D+","D","D-","F"];
  var L2P = {"A+":4.0,"A":4.0,"A-":3.7,"B+":3.3,"B":3.0,"B-":2.7,"C+":2.3,"C":2.0,"C-":1.7,"D+":1.3,"D":1.0,"D-":0.7,"F":0};

  function pct2points(p) {
    p = clamp(p, 0, 100);
    if (p >= 93) return 4.0; if (p >= 90) return 3.7; if (p >= 87) return 3.3;
    if (p >= 83) return 3.0; if (p >= 80) return 2.7; if (p >= 77) return 2.3;
    if (p >= 73) return 2.0; if (p >= 70) return 1.7; if (p >= 67) return 1.3;
    if (p >= 63) return 1.0; if (p >= 60) return 0.7; return 0;
  }

  function nearestLetter(g) {
    var best = "F", bd = 99;
    for (var i = 0; i < LETTERS.length; i++) {
      var d = Math.abs(L2P[LETTERS[i]] - g);
      if (d < bd) { bd = d; best = LETTERS[i]; }
    }
    return best;
  }

  function classify(g) {
    if (g >= 3.7) return "Excellent standing";
    if (g >= 3.3) return "Very good";
    if (g >= 3.0) return "Good";
    if (g >= 2.0) return "Satisfactory";
    if (g > 0) return "Needs improvement";
    return "";
  }

  var KEY = "sm_gpa_rows", SKEY = "sm_gpa_scale";
  var scale = localStorage.getItem(SKEY) || "letter";
  var rows = store.get(KEY, []);

  if (!rows.length) {
    rows = [
      { id: uid(), name: "Calculus I", grade: "A-", credits: 4 },
      { id: uid(), name: "English Composition", grade: "B+", credits: 3 }
    ];
  }

  function gradeCell(r) {
    if (scale === "letter") {
      var opts = LETTERS.map(function(l){ return `<option ${r.grade===l?"selected":""}>${l}</option>`; }).join("");
      return `<select class="select c-grade" data-f="grade">${opts}</select>`;
    }
    var max = scale === "points" ? 4 : 100;
    return `<input class="input tnum c-grade" data-f="grade" type="number" min="0" max="${max}" step="${scale==="points"?"0.01":"0.1"}" value="${r.grade}">`;
  }

  function render() {
    var container = $("#rows");
    if (!container) return;

    container.innerHTML = rows.map(function(r) {
      return `
        <div class="crow" data-id="${r.id}">
          <div class="c-name"><input class="input" data-f="name" value="${esc(r.name)}" placeholder="Course name"></div>
          <div class="c-grade-wrap">${gradeCell(r)}</div>
          <div class="c-credit"><input class="input tnum" data-f="credits" type="number" value="${r.credits}"></div>
          <div class="c-del"><button class="row-del" data-del="${r.id}">✕</button></div>
        </div>`;
    }).join("");

    attachEvents();
    compute();
  }

  function attachEvents() {
    $$(".crow").forEach(function(row) {
      var id = row.getAttribute("data-id");
      $$("[data-f]", row).forEach(function(inp) {
        inp.addEventListener("input", function() {
          var r = rows.find(x => x.id === id);
          if (r) { r[inp.getAttribute("data-f")] = inp.value; save(); compute(); }
        });
      });
    });

    $$("[data-del]").forEach(function(b) {
      b.onclick = function() {
        rows = rows.filter(r => r.id !== b.getAttribute("data-del"));
        save(); render();
        SM.toast("Course removed", "info");
      };
    });
  }

  function resolve(r) {
    if (scale === "letter") return L2P[r.grade] || 0;
    if (scale === "points") return clamp(parseFloat(r.grade) || 0, 0, 4);
    return pct2points(parseFloat(r.grade) || 0);
  }

  function compute() {
    var cr = 0, qp = 0;
    rows.forEach(function(r) {
      var c = Math.max(0, parseFloat(r.credits) || 0);
      if (c > 0) { cr += c; qp += (resolve(r) * c); }
    });
    var gpa = cr ? round(qp / cr, 2) : 0;
    $("#gpaOut").textContent = gpa.toFixed(2);
    $("#mCourses").textContent = rows.length;
    $("#mCredits").textContent = round(cr, 1);
    $("#gpaLetter").textContent = cr ? (nearestLetter(gpa) + " average · " + classify(gpa)) : "Add a course to begin";
  }

  function save() { store.set(KEY, rows); }

  function setScaleNote() {
    var notes = {
      letter: "<b>Letter scale:</b> A=4.0, B=3.0, etc. Credits weight the average.",
      percent: "<b>Percentage:</b> 0–100 inputs are mapped to 4.0 points.",
      points: "<b>Grade points:</b> Direct 0–4.0 input per course."
    };
    $("#scaleNote").innerHTML = notes[scale];
  }

  document.addEventListener("DOMContentLoaded", function () {
    $("#scale").value = scale;
    $("#scale").onchange = function(e) {
      scale = e.target.value;
      localStorage.setItem(SKEY, scale);
      rows.forEach(function(r) {
        if (scale === "letter") r.grade = LETTERS.includes(r.grade) ? r.grade : "A";
        else if (isNaN(parseFloat(r.grade))) r.grade = scale === "points" ? "4.0" : "90";
      });
      save(); render(); setScaleNote();
      SM.toast("Scale changed to " + scale, "info");
    };

    $("#addRow").onclick = $("#addRow2").onclick = function() {
      rows.push({ id: uid(), name: "", grade: scale === "letter" ? "A" : (scale === "points" ? "4.0" : "90"), credits: 3 });
      save(); render();
      SM.toast("Course added", "success");
    };

    $("#clearAll").onclick = function() {
      if (confirm("Clear all data?")) { rows = []; save(); render(); SM.toast("Data cleared", "info"); }
    };

    $("#shareBtn").onclick = function() {
        var res = $("#gpaOut").textContent;
        SM.copy("My GPA is " + res + "! Calculated on Study Metrics.");
    };

    render(); setScaleNote();
  });
})();
