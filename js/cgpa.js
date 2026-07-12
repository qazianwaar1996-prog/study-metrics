/**
 * CGPA CALCULATOR LOGIC
 * Handles multi-semester weighted calculations and local storage.
 */

(function () {
  "use strict";

  // Use global SM helpers from script.js
  var $ = SM.$, 
      $$ = SM.$$, 
      round = SM.round, 
      clamp = SM.clamp, 
      uid = SM.uid, 
      esc = SM.esc, 
      store = SM.store;

  var KEY = "sm_cgpa_rows";
  var rows = store.get(KEY, []);

  /**
   * Returns a text description based on the GPA score
   */
  function classify(g) {
    if (g >= 3.7) return "Excellent standing";
    if (g >= 3.3) return "Very good";
    if (g >= 3.0) return "Good";
    if (g >= 2.0) return "Satisfactory";
    if (g > 0) return "Needs improvement";
    return "";
  }

  // Generate initial rows if the user has no saved data
  if (!rows.length) {
    rows = [
      { id: uid(), name: "Semester 1", gpa: 3.6, credits: 15 },
      { id: uid(), name: "Semester 2", gpa: 3.8, credits: 16 }
    ];
  }

  function find(id) {
    return rows.find(function(r) { return r.id === id; });
  }

  /**
   * Renders the semester rows into the HTML container
   */
  function render() {
    var container = $("#rows");
    if (!container) return;

    container.innerHTML = rows.map(function (r) {
      return `
        <div class="crow" data-id="${r.id}">
          <div class="c-name">
            <input class="input" data-f="name" value="${esc(r.name)}" placeholder="Semester Name">
          </div>
          <div class="c-a">
            <input class="input tnum" data-f="gpa" type="number" min="0" max="4" step="0.01" value="${r.gpa}" placeholder="0–4.0">
          </div>
          <div class="c-b">
            <input class="input tnum" data-f="credits" type="number" min="0" step="0.5" value="${r.credits}" placeholder="Credits">
          </div>
          <div class="c-del">
            <button class="row-del" data-del="${r.id}" aria-label="Remove Row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>`;
    }).join("");

    attachEvents();
    compute();
  }

  /**
   * Attaches event listeners to inputs and delete buttons
   */
  function attachEvents() {
    $$(".crow").forEach(function (row) {
      var id = row.getAttribute("data-id");
      
      $$("[data-f]", row).forEach(function (inp) {
        inp.addEventListener("input", function () {
          var r = find(id);
          if (!r) return;
          r[inp.getAttribute("data-f")] = inp.value;
          save();
          compute();
        });
      });
    });

    $$("[data-del]").forEach(function (btn) {
      btn.onclick = function () {
        var rowId = btn.getAttribute("data-del");
        rows = rows.filter(function (r) { return r.id !== rowId; });
        save();
        render();
        SM.toast("Semester removed", "info");
      };
    });
  }

  /**
   * Calculates the weighted CGPA
   */
  function compute() {
    var totalCredits = 0, 
        totalQualityPoints = 0;

    rows.forEach(function (r) {
      var c = Math.max(0, parseFloat(r.credits) || 0);
      var g = clamp(parseFloat(r.gpa) || 0, 0, 4);
      if (c > 0) {
        totalCredits += c;
        totalQualityPoints += (g * c);
      }
    });

    var cgpa = totalCredits ? round(totalQualityPoints / totalCredits, 2) : 0;

    // Update UI elements
    $("#cgpaOut").textContent = cgpa.toFixed(2);
    $("#mSem").textContent = rows.length;
    $("#mCredits").textContent = round(totalCredits, 1);
    $("#cgpaClass").textContent = totalCredits ? classify(cgpa) : "Add a semester to begin";
  }

  function save() { 
    store.set(KEY, rows); 
  }

  function addSem() {
    rows.push({ 
      id: uid(), 
      name: "Semester " + (rows.length + 1), 
      gpa: 0, 
      credits: 0 
    });
    save();
    render();
    SM.toast("Semester added", "success");
    
    // Auto-focus the first input of the new row
    var allRows = $$(".crow");
    if(allRows.length > 0) {
        var lastInput = allRows[allRows.length - 1].querySelector('input');
        if(lastInput) lastInput.focus();
    }
  }

  // Initialization
  document.addEventListener("DOMContentLoaded", function () {
    if ($("#addRow")) $("#addRow").onclick = addSem;
    if ($("#addRow2")) $("#addRow2").onclick = addSem;
    
    if ($("#clearAll")) {
      $("#clearAll").onclick = function () {
        if (confirm("Are you sure you want to delete all semesters?")) {
          rows = [];
          save();
          render();
          SM.toast("Data cleared", "info");
        }
      };
    }

    if ($("#shareBtn")) {
      $("#shareBtn").onclick = function() {
        var result = $("#cgpaOut").textContent;
        SM.copy("My Cumulative GPA is " + result + ". Check yours on Study Metrics!");
      };
    }

    render();
  });
})();
