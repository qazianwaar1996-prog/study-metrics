
```javascript
/**
 * ATTENDANCE CALCULATOR LOGIC
 * Optimized for Study Metrics
 */

(function () {
  "use strict";

  // Use the SM helper tools we defined in script.js
  var $ = SM.$;
  var $$ = SM.$$;
  var store = SM.store;
  
  // Settings
  var CIRC = 2 * Math.PI * 78; 
  var KEY = "sm_attend";

  document.addEventListener("DOMContentLoaded", function () {
    // Select Elements
    var attendedInput = $("#attended");
    var heldInput = $("#held");
    var reqInput = $("#req");
    var arc = $("#ringArc");
    var pctEl = $("#pct");
    var st = $("#status");
    var v = $("#verdict");
    var vt = $("#verdictText");

    // 1. LOAD SAVED DATA
    var saved = store.get(KEY, null);
    if (saved) {
      attendedInput.value = saved.a;
      heldInput.value = saved.h;
      reqInput.value = saved.r;
    }

    // 2. THE CALCULATION ENGINE
    function calc() {
      var a = Math.max(0, parseInt(attendedInput.value) || 0);
      var h = Math.max(0, parseInt(heldInput.value) || 0);
      var r = SM.clamp(parseInt(reqInput.value) || 0, 0, 100);

      // Save to local storage
      store.set(KEY, { a: a, h: h, r: r });

      // Validation: Attended cannot be more than held
      if (h <= 0 || a > h) {
        pctEl.textContent = "—";
        st.textContent = a > h ? "Attended exceeds total" : "Enter total classes";
        arc.style.strokeDashoffset = CIRC;
        v.className = "verdict warn";
        vt.innerHTML = "<b>Check your numbers</b>Attended can't be more than classes held.";
        return;
      }

      var pct = SM.round((a / h) * 100, 1);
      pctEl.textContent = pct + "%";
      
      // Animate the Ring
      var offset = CIRC - (CIRC * Math.min(pct, 100) / 100);
      arc.style.strokeDashoffset = offset;

      var rf = r / 100;

      // Logic for "Can Skip" vs "Must Attend"
      if (pct >= r) {
        // Safe to skip logic
        var canSkip = rf > 0 ? Math.floor(a / rf - h) : Infinity;
        arc.style.stroke = "var(--ok, #2ecc71)";
        st.textContent = "Above the " + r + "% minimum";
        v.className = "verdict ok";
        
        if (canSkip >= 1) {
          vt.innerHTML = "<b>You can skip " + canSkip + " more class" + (canSkip === 1 ? "" : "es") + "</b> and still stay above " + r + "%.";
        } else {
          vt.innerHTML = "<b>You're right at the edge!</b> You're above " + r + "%, but if you miss the next class, you'll drop below.";
        }
      } else {
        // Recovery logic
        var needAttend = rf < 1 ? Math.ceil((rf * h - a) / (1 - rf)) : Infinity;
        arc.style.stroke = "var(--danger, #e74c3c)";
        st.textContent = "Below the " + r + "% minimum";
        v.className = "verdict bad";

        if (isFinite(needAttend) && needAttend > 0) {
          vt.innerHTML = "<b>Attend the next " + needAttend + " class" + (needAttend === 1 ? "" : "es") + "</b> without missing any to reach " + r + "%.";
        } else {
          vt.innerHTML = "<b>Recovery isn't possible</b> at 100% requirement. Lower the goal or check inputs.";
        }
      }
    }

    // 3. EVENT LISTENERS
    [attendedInput, heldInput, reqInput].forEach(function (el) {
      el.addEventListener("input", calc);
    });

    // 4. RESET BUTTON FEATURE
    var resetBtn = $("#resetBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", function() {
        attendedInput.value = "";
        heldInput.value = "";
        reqInput.value = 75;
        calc();
        SM.toast("Values Reset", "info");
      });
    }

    // 5. SHARE FEATURE
    var shareBtn = $("#shareBtn");
    if (shareBtn) {
      shareBtn.addEventListener("click", function() {
        var text = "My attendance is " + pctEl.textContent + ". Check yours at StudyMetrics.app!";
        SM.copy(text); // Uses the copy tool from our script.js
      });
    }

    // Run once on load
    calc();
  });
})();
```

---
