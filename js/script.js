/**
 * MAIN WEBSITE SCRIPT
 * Handles Navigation, UI Effects, and Utility Functions
 */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    
    // --- 1. MOBILE MENU LOGIC ---
    var toggle = document.getElementById("menuToggle");
    var links = document.querySelector(".nav-links");
    var navLinksArray = document.querySelectorAll(".nav-links a");

    if (toggle && links) {
      // Open/Close menu when clicking the burger icon
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        links.classList.toggle("open");
      });

      // Close menu automatically when a link is clicked
      navLinksArray.forEach(function(link) {
        link.addEventListener("click", function() {
          links.classList.remove("open");
        });
      });

      // Close menu if user clicks anywhere else on the screen
      document.addEventListener("click", function (e) {
        if (!toggle.contains(e.target) && !links.contains(e.target)) {
          links.classList.remove("open");
        }
      });
    }

    // --- 2. STICKY HEADER EFFECT ---
    // Changes the header style when the user scrolls down
    var navBar = document.querySelector("nav");
    window.addEventListener("scroll", function () {
      if (window.scrollY > 50) {
        navBar.classList.add("nav-scrolled");
      } else {
        navBar.classList.remove("nav-scrolled");
      }
    });

    // --- 3. SMOOTH SCROLLING ---
    // Makes the page slide smoothly when clicking navigation links
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener("click", function (e) {
        var targetId = this.getAttribute("href");
        if (targetId === "#") return;
        
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
 * Modernized and bug-fixed version
 */
window.SM = {
  // Selector: SM.$('.class')
  $: function (s, r) { 
    return (r || document).querySelector(s); 
  },

  // Multi-Selector: SM.$$('.class')
  $$: function (s, r) { 
    return Array.prototype.slice.call((r || document).querySelectorAll(s)); 
  },

  // Rounding numbers: SM.round(10.555, 2)
  round: function (n, d) {
    if (d === undefined) d = 2;
    var f = Math.pow(10, d);
    return Math.round((n + Number.EPSILON) * f) / f;
  },

  // Constrain numbers: SM.clamp(value, min, max)
  clamp: function (n, a, b) { 
    return Math.max(a, Math.min(b, n)); 
  },

  // Unique ID generator
  uid: function () { 
    return Math.random().toString(36).slice(2, 9); 
  },

  // HTML Escaping (FIXED: Corrected the syntax error in the mapping)
  esc: function (s) {
    var map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return String(s).replace(/[&<>"']/g, function (m) {
      return map[m];
    });
  },

  // LocalStorage helper: Saves data even after refresh
  store: {
    get: function (k, fallback) {
      try { 
        var v = localStorage.getItem(k); 
        return v ? JSON.parse(v) : fallback; 
      }
      catch (e) { return fallback; }
    },
    set: function (k, v) {
      try { 
        localStorage.setItem(k, JSON.stringify(v)); 
      } catch (e) {
        console.error("Storage error", e);
      }
    }
  },

  // NEW FEATURE: TOAST NOTIFICATIONS
  // Use it like: SM.toast("Action Successful!", "success")
  toast: function (msg, type) {
    var toast = document.createElement("div");
    toast.className = "sm-toast " + (type || "info");
    toast.innerText = msg;
    document.body.appendChild(toast);
    
    // Animation trigger
    setTimeout(function() { toast.classList.add("show"); }, 100);
    
    // Auto-remove after 3 seconds
    setTimeout(function() {
      toast.classList.remove("show");
      setTimeout(function() { toast.remove(); }, 500);
    }, 3000);
  }
};

2. Required CSS for New Features

Add this to the bottom of your style.css to make the new JavaScript features
look correct:

/* --- Sticky Navigation Style --- */
.nav-scrolled {
  background: rgba(255, 255, 255, 0.98) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 10px 0 !important;
  transition: all 0.3s ease-in-out;
}

/* --- Toast Notification Styles --- */
.sm-toast {
  position: fixed;
  bottom: 25px;
  right: 25px;
  background: #333;
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: sans-serif;
  z-index: 10000;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  transform: translateY(100px);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.sm-toast.show {
  transform: translateY(0);
  opacity: 1;
}

.sm-toast.success { background: #2ecc71; }
.sm-toast.error { background: #e74c3c; }
.sm-toast.info { background: #3498db; }

/* --- Mobile Menu Transition --- */
.nav-links {
  /* Ensure your links have a transition for the 'open' class */
  transition: transform 0.4s ease;
}
