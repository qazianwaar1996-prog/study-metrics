/**
 * FINAL GRADE CALCULATOR LOGIC
 */
(function () {
  "use strict";

  var $ = SM.$, clamp = SM.clamp, store = SM.store;
  
  function round(n) { 
    var f = 10; 
    return Math.round((n + Number.EPSILON) * f) / f; 
  }

  var KEY = "sm_final";

  // Helper: Calculates what the total course grade would be based on a final exam score
  function courseGradeAt(score, cur, w) {
    return cur * (1 - w) + score * w;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var curInput = $("#cur");
    var goalInput = $("#goal");
    var weightInput = $("#weight");

    // Load saved data
    var saved = store.get(KEY, null);
    if (saved) {
      curInput.value = saved.cur;
      goalInput.value = saved.goal;
      weightInput.value = saved.w;
    }

    function calc() {
      var cur = parseFloat(curInput.value) || 0;
      var goal = parseFloat(goalInput.value) || 0;
      var wValue = parseFloat(weightInput.value) || 0;
      
      // Convert weight to decimal (e.g. 30 becomes 0.3)
      var w = clamp(wValue, 0.01, 100) / 100;

      // Save inputs
      store.set(KEY, { cur: cur, goal: goal, w: wValue });

      // Calculate score needed on final
      var need = round((goal - cur * (1 - w)) / w);
      
      var arc = $("#gaugeArc");
      var ne = $("#need");
      var v = $("#verdict");
      var vt = $("#verdictText");

      // Update Scenarios Table
      $("#sc100").textContent = round(courseGradeAt(100, cur, w)) + "%";
      $("#sc90").textContent = round(courseGradeAt(90, cur, w)) + "%";
      $("#sc80").textContent = round(courseGradeAt(80, cur, w)) + "%";
      $("#sc70").textContent = round(courseGradeAt(70, cur, w)) + "%";

      // Animation & UI Updates
      var shown = clamp(need, 0, 100);
      arc.style.strokeDashoffset = 270 - (270 * shown / 100);

      function setV(cls, color, title, text) {
        v.className = "verdict " + cls;
        vt.innerHTML = "<b>" + title + "</b><br>" + text;
        arc.style.stroke = color;
      }

      if (need <= 0) {
        ne.textContent = "0%";
        arc.style.strokeDashoffset = 0;
        setV("ok", "#2ecc71", "Already secured 🎉", "Even a zero on the final keeps you above your goal.");
        return;
      }

      ne.textContent = need + "%";

      if (need > 100) {
        setV("bad", "#e74c3c", "Not reachable", "You would need " + need + "% to hit this goal. Try adjusting your target.");
      } else if (need <= 50) {
        setV("ok", "#2ecc71", "Highly achievable", "You're in a great spot. Comfortably within reach.");
      } else if (need <= 75) {
        setV("info", "#3498db", "Doable with effort", "A solid study session should get you there.");
      } else if (need <= 90) {
        setV("warn", "#f1c40f", "Time to study", "A strong performance is required to hit this mark.");
      } else {
        setV("warn", "#e67e22", "Very demanding", "Nearly a perfect score required. Every point counts.");
      }
    }

    // Attach listeners
    [curInput, goalInput, weightInput].forEach(function (el) {
      el.addEventListener("input", calc);
    });

    // Reset Button
    $("#resetBtn").onclick = function() {
        curInput.value = "";
        goalInput.value = "";
        weightInput.value = "";
        calc();
        SM.toast("Fields reset", "info");
    };

    // Share/Copy Button
    $("#shareBtn").onclick = function() {
        var score = $("#need").textContent;
        if(score === "—") return SM.toast("Enter numbers first", "error");
        SM.copy("I need a " + score + " on my final to reach my goal! Calculated on Study Metrics.");
    };

    calc();
  });
})();
