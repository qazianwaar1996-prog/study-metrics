(function () {
  "use strict";

  var $ = SM.$, $$ = SM.$$, round = SM.round;

  document.addEventListener("DOMContentLoaded", function () {
    // --- 1. TAB NAVIGATION ---
    $$(".tabs button").forEach(function (b) {
      b.onclick = function () {
        var target = b.getAttribute("data-tab");
        
        // Toggle active button
        $$(".tabs button").forEach(function (x) { x.classList.toggle("on", x === b); });

        // Toggle visibility of input panels
        ["marks", "xofy", "percentof", "change"].forEach(function (t) {
          var p = $("#panel-" + t);
          if (p) p.style.display = (t === target) ? "block" : "none";
        });
        
        // Trigger Toast for feedback
        SM.toast("Switched to " + b.innerText, "info");
      };
    });

    // --- 2. CALCULATOR FUNCTIONS ---
    
    // Marks to Percentage (%)
    function marks() {
      var g = parseFloat($("#m_got").value) || 0;
      var m = parseFloat($("#m_max").value) || 0;
      var p = m ? round((g / m) * 100, 2) : 0;
      
      $("#m_out").textContent = p + "%";
      
      var n = "";
      if (m) {
        if (p >= 90) n = "Outstanding result.";
        else if (p >= 75) n = "Strong pass.";
        else if (p >= 50) n = "A clear pass.";
        else if (p >= 40) n = "Just over the line.";
        else n = "Below a typical pass mark.";
      }
      $("#m_note").textContent = n;
    }

    // X is what % of Y
    function xofy() {
      var a = parseFloat($("#x_a").value) || 0;
      var b = parseFloat($("#x_b").value) || 0;
      var res = b ? round((a / b) * 100, 2) : 0;
      $("#x_out").textContent = res + "%";
    }

    // X% of Y
    function percentof() {
      var p = parseFloat($("#p_pct").value) || 0;
      var n = parseFloat($("#p_num").value) || 0;
      var res = round((p / 100) * n, 2);
      $("#p_out").textContent = res;
    }

    // Percentage Change (Increase/Decrease)
    function change() {
      var f = parseFloat($("#c_from").value) || 0;
      var t = parseFloat($("#c_to").value) || 0;
      var c = f ? round(((t - f) / Math.abs(f)) * 100, 2) : 0;
      
      $("#c_out").textContent = (c > 0 ? "+" : "") + c + "%";
      
      var note = $("#c_note");
      if (f) {
        note.textContent = (c > 0 ? "Increase" : c < 0 ? "Decrease" : "No change");
        note.style.color = (c > 0 ? "#2ecc71" : c < 0 ? "#e74c3c" : "inherit");
      } else {
        note.textContent = "Enter starting value";
      }
    }

    // --- 3. LIVE EVENT LISTENERS ---
    var inputs = [
      { ids: ["m_got", "m_max"], fn: marks },
      { ids: ["x_a", "x_b"], fn: xofy },
      { ids: ["p_pct", "p_num"], fn: percentof },
      { ids: ["c_from", "c_to"], fn: change }
    ];

    inputs.forEach(function (group) {
      group.ids.forEach(function (id) {
        var el = $("#" + id);
        if (el) el.addEventListener("input", group.fn);
      });
      group.fn(); // Initial calculation
    });
  });
})();
