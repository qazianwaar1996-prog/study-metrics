/**
 * MAIN WEBSITE SCRIPT
 * Handles Navigation, UI Effects, and Scroll Animations
 */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    
    // --- 1. MOBILE MENU LOGIC ---
    var toggle = document.getElementById("menuToggle");
    var links = document.querySelector(".nav-links");
    var navLinksArray = document.querySelectorAll(".nav-links a");

    if (toggle && links) {
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        links.classList.toggle("open");
      });

      navLinksArray.forEach(function(link) {
        link.addEventListener("click", function() {
          links.classList.remove("open");
        });
      });

      document.addEventListener("click", function (e) {
        if (!toggle.contains(e.target) && !links.contains(e.target)) {
          links.classList.remove("open");
        }
      });
    }

    // --- 2. STICKY HEADER & BACK TO TOP ---
    var navBar = document.querySelector(".site-head");
    var backToTop = document.getElementById("backToTop");

    window.addEventListener("scroll", function () {
      // Header scroll effect
      if (window.scrollY > 50) {
        navBar.classList.add("nav-scrolled");
      } else {
        navBar.classList.remove("nav-scrolled");
      }

      // Back to top button visibility
      if (backToTop) {
        if (window.scrollY > 500) {
          backToTop.classList.add("show");
        } else {
          backToTop.classList.remove("show");
        }
      }
    });

    if (backToTop) {
      backToTop.addEventListener("click", function() {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // --- 3. REVEAL ANIMATIONS (The "Scroll-in" effect) ---
    // This fixes the bug where sections marked 'reveal' don't show up.
    var revealCallback = function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target); // Only animate once
        }
      });
    };

    var observer = new IntersectionObserver(revealCallback, {
      threshold: 0.1
    });

    document.querySelectorAll(".reveal").forEach(function (el) {
      observer.observe(el);
    });

    // --- 4. SMOOTH SCROLLING ---
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener("click", function (e) {
        var targetId = this.getAttribute("href");
        if (targetId === "#" || targetId.length <= 1) return;
        
        var targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      });
    });
  });
})();

/**
 * SM - GLOBAL UTILITY HELPER FUNCTIONS
 */
window.SM = {
  $: function (s, r) { return (r || document).querySelector(s); },
  $$: function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); },
  round: function (n, d) {
    if (d === undefined) d = 2;
    var f = Math.pow(10, d);
    return Math.round((n + Number.EPSILON) * f) / f;
  },
  clamp: function (n, a, b) { return Math.max(a, Math.min(b, n)); },
  
  // Storage helper
  store: {
    get: function (k, fallback) {
      try { 
        var v = localStorage.getItem(k); 
        return v ? JSON.parse(v) : fallback; 
      } catch (e) { return fallback; }
    },
    set: function (k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
    }
  },

  // Toast System
  toast: function (msg, type) {
    var toast = document.createElement("div");
    toast.className = "toast " + (type || "info");
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(function() { toast.classList.add("show"); }, 100);
    setTimeout(function() {
      toast.classList.remove("show");
      setTimeout(function() { toast.remove(); }, 500);
    }, 3000);
  },

  // Helper to copy text to clipboard
  copy: function(text) {
    navigator.clipboard.writeText(text).then(function() {
      window.SM.toast("Copied to clipboard!", "success");
    });
  }
};
