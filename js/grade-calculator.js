(function () {
  "use strict";

  var $ = SM.$, $$ = SM.$$, round = SM.round, uid = SM.uid, esc = SM.esc, store = SM.store;

  function letter(p) {
    if (p >= 93) return "A";
    if (p >= 90) return "A-";
    if (p >= 87) return "B+";
    if (p >= 83) return "B";
    if (p >= 80) return "B-";
    if (p >= 77) return "C+";
    if (p >= 73) return "C";
    if (p >= 70) return "C-";
    if (p >= 67) return "D+";
    if (p >= 63) return "D";
    if (p >= 60) return "D-";
    return "F";
  }

  var KEY = "sm_grade_rows";
  var rows = store.get(KEY, []);

  if (!rows.length) {
    rows = [
      { id: uid(), name: "Homework", score: 92, weight: 15 },
      { id: uid(), name: "Quizzes", score: 85, weight: 20 },
      { id: uid(), name: "Midterm", score: 78, weight: 25 },
      { id: uid(), name: "Final Exam", score: 88, weight: 40 }
    ];
  }

  function find(id) {
    return rows.find(function(r) { return r.id === id; });
  }

  function render() {
    var container = $("#rows");
    if (!container) return;

    container.innerHTML = rows.map(function (r) {
      return `
        <div class="crow" data-id="${r.id}">
          <div class="c-name">
            <input class="input" data-f="name" value="${esc(r.name)}" placeholder="e.g. Midterm">
          </div>
          <div class="c-a">
            <input class="input tnum" data-f="score" type="number" min="0" step="0.1" value="${r.score}" placeholder="0–100">
          </div>
          <div class="c-b">
            <input class="input tnum" data-f="weight" type="number" min="0" step="0.5" value="${r.weight}" placeholder="%">
          </div>
          <div class="c-del">
            <button class="row-del" data-del="${r.id}" aria-label="Remove Row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>`;
    }).join("");

    attachEvents();
    compute();
  }

  function attachEvents() {
    $$(".crow").forEach(function (row) {
      var id = row.getAttribute("data-id");
      $$("[data-f]", row).forEach(function (inp) {
        inp.addEventListener("input", function () {
          var r = find(id);
          if (r) {
            r[inp.getAttribute("data-f")] = inp.value;
            save();
            compute();
          }
        });
      });
    });

    $$("[data-del]").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-del");
        rows = rows.filter(function (r) { return r.id !== id; });
        save();
        render();
        SM.toast("Item removed", "info");
      };
    });
  }

  function compute() {
    var totalWeight = 0, weightedSum = 0;
    rows.forEach(function (r) {
      var w = Math.max(0, parseFloat(r.weight) || 0);
      var s = parseFloat(r.score) || 0;
      if (w > 0) {
        totalWeight += w;
        weightedSum += (s * w);
      }
    });

    var grade = totalWeight ? round(weightedSum / totalWeight, 2) : 0;
    
    $("#gradeOut").textContent = totalWeight ? grade.toFixed(2) + "%" : "—";
    $("#gradeLetter").textContent = totalWeight ? letter(grade) : "—";
    
    var note = $("#weightNote");
    if (!note) return;

    if (!totalWeight) {
      note.className = "weight-note ok";
      note.innerHTML = "<b>Add an item</b> to calculate your weighted grade.";
    } else {
      var twR = round(totalWeight, 1);
      if (Math.abs(totalWeight - 100) < 0.5) {
        note.className = "weight-note ok";
        note.innerHTML = "<b>Weights total 100%.</b> Course projection is complete.";
      } else if (totalWeight < 100) {
        note.className = "weight-note warn";
        note.innerHTML = "<b>Weights total " + twR + "%.</b> Add remaining weights (like the final) for a full projection.";
      } else {
        note.className = "weight-note warn";
        note.innerHTML = "<b>Weights total " + twR + "%.</b> Exceeds 100%: check your inputs.";
      }
    }
  }

  function save() { store.set(KEY, rows); }

  function addItem() {
    rows.push({ id: uid(), name: "", score: "", weight: "" });
    save();
    render();
    SM.toast("Row added", "success");
    
    var lastRow = $$(".crow").pop();
    if (lastRow) {
      var inp = lastRow.querySelector("input");
      if (inp) inp.focus();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var addBtn = $("#addRow");
    var addBtn2 = $("#addRow2");
    var clearBtn = $("#clearAll");
    var shareBtn = $("#shareBtn");

    if (addBtn) addBtn.onclick = addItem;
    if (addBtn2) addBtn2.onclick = addItem;

    if (clearBtn) {
      clearBtn.onclick = function () {
        if (confirm("Clear all grade entries?")) {
          rows = [];
          save();
          render();
          SM.toast("Cleared all items", "info");
        }
      };
    }

    if (shareBtn) {
      shareBtn.onclick = function() {
        var g = $("#gradeOut").textContent;
        if (g === "—") return SM.toast("Enter grades first", "error");
        SM.copy("My current course grade is " + g + "! via Study Metrics");
      };
    }

    render();
  });
})();
