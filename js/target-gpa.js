/* Study Metrics — Target GPA Calculator  ·  /js/target-gpa.js */
(function () {
  "use strict";
  var $ = SM.$, round = SM.round, clamp = SM.clamp, store = SM.store;
  var KEY = "sm_target";

  document.addEventListener("DOMContentLoaded", function () {
    var saved = store.get(KEY, null);
    
    // Select elements
    var curGpaEl = $("#curGpa");
    var curCredEl = $("#curCredits");
    var remCredEl = $("#remCredits");
    var goalGpaEl = $("#goalGpa");
    var goalSlideEl = $("#goalSlide");
    var goalSlideValEl = $("#goalSlideVal");

    // Initialize values from storage if they exist
    if (saved) {
      curGpaEl.value = saved.cur;
      curCredEl.value = saved.cc;
      remCredEl.value = saved.rc;
      goalGpaEl.value = saved.goal;
    }

    if (goalSlideEl) {
      goalSlideEl.value = goalGpaEl.value;
      goalSlideValEl.textContent = (parseFloat(goalGpaEl.value) || 0).toFixed(2);
    }

    function calc() {
      var cur = clamp(parseFloat(curGpaEl.value) || 0, 0, 4);
      var cc = Math.max(0, parseFloat(curCredEl.value) || 0);
      var rc = Math.max(0, parseFloat(remCredEl.value) || 0);
      var goal = clamp(parseFloat(goalGpaEl.value) || 0, 0, 4);

      // Save inputs for persistence
      store.set(KEY, { cur: cur, cc: cc, rc: rc, goal: goal });

      var tot = cc + rc || 1;
      
      // Update progress bar visuals if they exist in HTML
      var segDone = $("#segDone");
      var segNeed = $("#segNeed");
      if (segDone) segDone.style.width = (cc / tot * 100) + "%";
      if (segNeed) segNeed.style.width = (rc / tot * 100) + "%";
      
      var legDone = $("#legDone");
      var legNeed = $("#legNeed");
      if (legDone) legDone.textContent = cc + " cr";
      if (legNeed) legNeed.textContent = rc + " cr";

      var v = $("#verdict");
      var vt = $("#verdictText");
      var ne = $("#need");
      var ns = $("#needSub");

      function setV(cls, title, text) {
        if (v && vt) {
          v.className = "verdict " + cls;
          vt.innerHTML = "<b>" + title + "</b><br>" + text;
        }
      }

      // Validation for remaining credits
      if (rc <= 0) {
        ne.textContent = "—";
        ns.textContent = "waiting for input";
        setV("info", "Add remaining credits", "Enter how many credits you have left to see what you need to average.");
        return;
      }

      // Formula: (Goal * TotalCredits - CurrentGPA * CurrentCredits) / RemainingCredits
      var need = (goal * tot - cur * cc) / rc;
      var finalNeeded = round(need, 2);

      if (finalNeeded <= 0) {
        ne.textContent = "0.00";
        ns.textContent = "you're already there";
        setV("ok", "Goal already secured 🎉", "Even a 0.0 across your remaining credits keeps you at or above your goal.");
        return;
      }

      if (finalNeeded > 4) {
        ne.textContent = finalNeeded.toFixed(2);
        ns.textContent = "not reachable";
        setV("bad", "Out of reach", "You would need a " + finalNeeded.toFixed(2) + " average, which exceeds the 4.0 maximum.");
        return;
      }

      ne.textContent = finalNeeded.toFixed(2);
      ns.textContent = "across your remaining credits";

      if (finalNeeded <= 2.7) {
        setV("ok", "Very achievable", "Comfortably within reach. Consistent work will get you there.");
      } else if (finalNeeded <= 3.3) {
        setV("info", "Achievable with focus", "A solid effort each term will land it. Keep pushing.");
      } else if (finalNeeded <= 3.7) {
        setV("warn", "Ambitious but doable", "You'll need to average around an A- across everything left.");
      } else {
        setV("warn", "Very demanding", "Near-perfect grades required from here. Every assignment counts.");
      }
    }

    // Input Events
    ["curGpa", "curCredits", "remCredits", "goalGpa"].forEach(function (id) {
      var el = $("#" + id);
      if (el) {
        el.addEventListener("input", function () {
          if (id === "goalGpa") {
            goalSlideEl.value = goalGpaEl.value;
            goalSlideValEl.textContent = (parseFloat(goalGpaEl.value) || 0).toFixed(2);
          }
          calc();
        });
      }
    });

    // Slider Event
    if (goalSlideEl) {
      goalSlideEl.addEventListener("input", function () {
        goalGpaEl.value = (parseFloat(goalSlideEl.value)).toFixed(2);
        goalSlideValEl.textContent = (parseFloat(goalSlideEl.value)).toFixed(2);
        calc();
      });
    }

    // Reset Feature
    var resetBtn = $("#resetBtn");
    if (resetBtn) {
      resetBtn.onclick = function () {
        curGpaEl.value = "";
        curCredEl.value = "";
        remCredEl.value = "";
        goalGpaEl.value = "3.50";
        if (goalSlideEl) goalSlideEl.value = "3.50";
        calc();
        SM.toast("Fields reset", "info");
      };
    }

    // Share/Copy Feature
    var shareBtn = $("#shareBtn");
    if (shareBtn) {
      shareBtn.onclick = function () {
        var needed = ne.textContent;
        if (needed === "—") return SM.toast("Enter details first", "error");
        SM.copy("I need to maintain a " + needed + " GPA to reach my goal! via Study Metrics");
      };
    }

    calc();
  });
})();
