
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.getElementById("menuToggle");
    var links = document.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("open");
      });
    }
  });
})();

window.SM = {
  $: function (s, r) { return (r || document).querySelector(s); },
  $$: function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); },
  round: function (n, d) {
    if (d === undefined) d = 2;
    var f = Math.pow(10, d);
    return Math.round((n + Number.EPSILON) * f) / f;
  },
  clamp: function (n, a, b) { return Math.max(a, Math.min(b, n)); },
  uid: function () { return Math.random().toString(36).slice(2, 9); },
  esc: function (s) {
    return String(s).replace(/[&<>"]/g, function (m) {
      return { "&": "&", "<": "<", ">": ">", '"': """ }[m];
    });
  },
  store: {
    get: function (k, fallback) {
      try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }
      catch (e) { return fallback; }
    },
    set: function (k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
    }
  }
};
