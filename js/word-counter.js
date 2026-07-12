/**
 * WORD COUNTER LOGIC
 */
(function () {
  "use strict";

  var $ = SM.$, store = SM.store;
  var KEY = "sm_wordcount";

  document.addEventListener("DOMContentLoaded", function () {
    var editor = $("#editor");
    if (!editor) return;

    // Load saved text from local storage
    editor.value = store.get(KEY, "");

    /**
     * The Main Counting Engine
     */
    function count() {
      var t = editor.value;
      store.set(KEY, t);

      // 1. Words (Standard regex for alphanumeric clusters)
      var wordsMatch = t.match(/\b[\w'’-]+\b/g) || [];
      var wordCount = wordsMatch.length;

      // 2. Characters (With and without spaces)
      var charCount = t.length;
      var noSpaceCount = t.replace(/\s/g, "").length;

      // 3. Sentences (Looking for punctuation boundaries)
      var sentMatch = t.match(/[^.!?]+[.!?]+(\s|$)/g) || [];
      var sentCount = sentMatch.filter(function(s) { return s.trim().length > 0; }).length || (t.trim() ? 1 : 0);

      // 4. Paragraphs (Splitting by newlines)
      var paraCount = t.split(/\n+/).map(function(p) { return p.trim(); }).filter(Boolean).length;

      // 5. Reading Time (Average 200 words per minute)
      var readSec = Math.round(wordCount / 200 * 60);
      var timeStr = readSec < 60 ? readSec + "s" : Math.floor(readSec / 60) + "m " + (readSec % 60) + "s";

      // 6. Longest Word
      var longest = wordsMatch.reduce(function(a, b) { 
        return b.length > a.length ? b : a; 
      }, "");

      // Update UI
      $("#s_words").textContent = wordCount.toLocaleString();
      $("#s_chars").textContent = charCount.toLocaleString();
      $("#s_nospace").textContent = noSpaceCount.toLocaleString();
      $("#s_sent").textContent = sentCount.toLocaleString();
      $("#s_para").textContent = paraCount.toLocaleString();
      $("#s_read").textContent = timeStr;
      $("#s_avg").textContent = sentCount ? Math.round(wordCount / sentCount) : 0;
      $("#s_long").textContent = longest ? longest + " (" + longest.length + ")" : "—";
    }

    // Live listening
    editor.addEventListener("input", count);

    // Toolbar Actions
    var copyBtn = $("#copyBtn");
    if (copyBtn) {
      copyBtn.onclick = function () {
        if (!editor.value) {
          SM.toast("Nothing to copy", "info");
          return;
        }
        SM.copy(editor.value); // Uses SM utility from script.js
      };
    }

    var clearBtn = $("#clearBtn");
    if (clearBtn) {
      clearBtn.onclick = function () {
        if (editor.value && confirm("Clear all text?")) {
          editor.value = "";
          count();
          editor.focus();
          SM.toast("Editor cleared", "info");
        }
      };
    }

    // Run once on load
    count();
  });
})();
