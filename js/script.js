/* --- js/script.js --- */
(function () {
  "use strict";
  window.SM = {
    $: function (s, r) { return (r || document).querySelector(s); },
    $$: function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); },
    round: function (n, d) {
      d = d === undefined ? 2 : d;
      var f = Math.pow(10, d);
      return Math.round((n + Number.EPSILON) * f) / f;
    },
    clamp: function (n, min, max) { return Math.max(min, Math.min(max, n)); },
    esc: function (s) {
      var map = {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"};
      return String(s || "").replace(/[&<>"']/g, function (m) { return map[m]; });
    },
    uid: function () { return Math.random().toString(36).slice(2, 9); },
    store: {
      get: function (k, fallback) {
        try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }
        catch (e) { return fallback; }
      },
      set: function (k, v) {
        try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
      }
    },
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
    copy: function(text) {
      navigator.clipboard.writeText(text).then(function() {
        window.SM.toast("Copied to clipboard!", "success");
      });
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.getElementById("menuToggle");
    var links = document.querySelector(".nav-links");
    if (toggle && links) {
      toggle.onclick = function (e) { e.stopPropagation(); links.classList.toggle("open"); };
      document.onclick = function (e) { if (!toggle.contains(e.target)) links.classList.remove("open"); };
    }
    var siteHeader = document.querySelector(".site-head");
    var btt = document.getElementById("backToTop");
    window.onscroll = function () {
      if (siteHeader) siteHeader.classList.toggle("nav-scrolled", window.scrollY > 50);
      if (btt) btt.classList.toggle("show", window.scrollY > 500);
    };
    if (btt) btt.onclick = function() { window.scrollTo({ top: 0, behavior: "smooth" }); };
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      document.querySelectorAll(".reveal").forEach(function(el) { observer.observe(el); });
    }
  });
})();

/* --- js/gpa-converter.js --- */
(function () {
  "use strict";
  var $ = SM.$, $$ = SM.$$, round = SM.round, clamp = SM.clamp, uid = SM.uid, esc = SM.esc, store = SM.store;

  var SCALES = [
    {id:"us40",country:"United States",system:"4.0 Letter Scale",type:"select",rows:[{g:"A+",p:4,l:"A+"},{g:"A",p:4,l:"A"},{g:"A-",p:3.7,l:"A-"},{g:"B+",p:3.3,l:"B+"},{g:"B",p:3,l:"B"},{g:"B-",p:2.7,l:"B-"},{g:"C+",p:2.3,l:"C+"},{g:"C",p:2,l:"C"},{g:"C-",p:1.7,l:"C-"},{g:"D+",p:1.3,l:"D+"},{g:"D",p:1,l:"D"},{g:"D-",p:0.7,l:"D-"},{g:"F",p:0,l:"F"}]},
    {id:"uk",country:"United Kingdom",system:"Honours Classification",type:"select",rows:[{g:"First (1st)",p:4.0,l:"A"},{g:"Upper Second (2:1)",p:3.7,l:"A-"},{g:"Lower Second (2:2)",p:3.0,l:"B"},{g:"Third (3rd)",p:2.3,l:"C+"},{g:"Fail",p:0,l:"F"}]},
    {id:"india10",country:"India",system:"10-point CGPA",type:"number",max:10,step:"0.01",rows:[{g:"9.0–10",min:9.0,p:4.0,l:"A"},{g:"8.0–8.9",min:8.0,p:3.7,l:"A-"},{g:"7.0–7.9",min:7.0,p:3.3,l:"B+"},{g:"6.0–6.9",min:6.0,p:3.0,l:"B"},{g:"5.0–5.9",min:5.0,p:2.3,l:"C+"},{g:"4.0–4.9",min:4.0,p:2.0,l:"C"},{g:"< 4.0",min:0,p:0,l:"F"}]},
    {id:"pakpct",country:"Pakistan",system:"Percentage Scale",type:"number",max:100,step:"0.1",rows:[{g:"85–100%",min:85,p:4.0,l:"A"},{g:"80–84%",min:80,p:3.7,l:"A-"},{g:"75–79%",min:75,p:3.3,l:"B+"},{g:"71–74%",min:71,p:3.0,l:"B"},{g:"68–70%",min:68,p:2.7,l:"B-"},{g:"64–67%",min:64,p:2.3,l:"C+"},{g:"61–63%",min:61,p:2.0,l:"C"},{g:"< 60%",min:0,p:0,l:"F"}]}
  ];

  var KEY = "sm_conv_rows", SKEY = "sm_conv_meta";
  var meta = store.get(SKEY, { country: "India", scaleId: "india10" });
  var rows = store.get(KEY, [{ id: uid(), name: "Course 1", grade: "8.5", credits: 3 }]);

  function getScale() { return SCALES.find(function(s){ return s.id === meta.scaleId; }) || SCALES[0]; }

  function getPts(scale, val) {
    var v = parseFloat(val) || 0;
    if (scale.type === "select") {
      var found = scale.rows.find(function(x){ return x.g === val; });
      return found ? found.p : 0;
    }
    var sorted = scale.rows.slice().sort(function(a, b){ return (b.min || 0) - (a.min || 0); });
    for (var i = 0; i < sorted.length; i++) { if (v >= sorted[i].min) return sorted[i].p; }
    return 0;
  }

  function compute() {
    var scale = getScale(), tCr = 0, tQp = 0, breakdownHtml = "";
    rows.forEach(function (r) {
      var cr = parseFloat(r.credits) || 0, pts = getPts(scale, r.grade);
      if (cr > 0) { tCr += cr; tQp += (pts * cr); breakdownHtml += `<div class="bd-row"><span class="bd-name">${esc(r.name || "Course")}</span><span class="bd-qp">${pts.toFixed(2)} pts</span></div>`; }
    });
    var res = tCr ? (tQp / tCr).toFixed(2) : "0.00";
    if ($("#gpaOut")) $("#gpaOut").textContent = res;
    if ($("#mCourses")) $("#mCourses").textContent = rows.length;
    if ($("#mCredits")) $("#mCredits").textContent = tCr.toFixed(1);
    if ($("#mQp")) $("#mQp").textContent = tQp.toFixed(1);
    if ($("#breakdown")) $("#breakdown").innerHTML = breakdownHtml || '<div class="hint">Add courses to see points</div>';
    renderReference(scale);
  }

  function renderReference(scale) {
    var body = $("#refBody"), badge = $("#refBadge");
    if (!body || !badge) return;
    badge.textContent = scale.country;
    body.innerHTML = scale.rows.map(function(r){ return `<tr><td>${r.g}</td><td>${r.l}</td><td class="tnum">${r.p.toFixed(2)}</td></tr>`; }).join("");
  }

  function render() {
    var container = $("#rows"), scale = getScale();
    if (!container) return;
    container.innerHTML = rows.map(function(r){
      var gIn = scale.type === "select" ? `<select class="select" data-f="grade">${scale.rows.map(function(x){ return `<option value="${x.g}" ${r.grade===x.g?'selected':''}>${x.g}</option>`; }).join("")}</select>` : `<input class="input tnum" data-f="grade" type="number" step="${scale.step}" value="${esc(r.grade)}">`;
      return `<div class="crow" data-id="${r.id}"><div class="c-name"><input class="input" data-f="name" value="${esc(r.name)}" placeholder="Course name"></div><div class="c-grade">${gIn}</div><div class="c-credit"><input class="input tnum" data-f="credits" type="number" value="${esc(r.credits)}"></div><div class="c-del"><button class="row-del" data-del="${r.id}">✕</button></div></div>`;
    }).join("");
    attachEvents();
    compute();
  }

  function attachEvents() {
    $$(".crow").forEach(function(row){
      var id = row.getAttribute("data-id");
      row.querySelectorAll("[data-f]").forEach(function(inp){
        inp.oninput = function() {
          var r = rows.find(function(x){ return x.id === id; });
          if (r) { r[this.getAttribute("data-f")] = this.value; store.set(KEY, rows); compute(); }
        };
      });
    });
    $$("[data-del]").forEach(function(btn){ btn.onclick = function() { rows = rows.filter(function(r){ return r.id !== this.getAttribute("data-del"); }.bind(this)); store.set(KEY, rows); render(); }; });
  }

  function runReverse() {
    var val = parseFloat($("#revGpa").value) || 0, grid = $("#revGrid");
    if (!grid) return;
    var usLetter = val >= 4.0 ? "A" : val >= 3.7 ? "A-" : val >= 3.3 ? "B+" : val >= 3.0 ? "B" : val >= 2.7 ? "B-" : val >= 2.3 ? "C+" : val >= 2.0 ? "C" : val >= 1.0 ? "D" : "F";
    $("#revUsLetter").textContent = "US Letter ≈ " + usLetter;
    grid.innerHTML = SCALES.filter(function(s){ return s.id !== 'us40'; }).map(function(s){
      var match = s.rows.reduce(function(prev, curr){ return (Math.abs(curr.p - val) < Math.abs(prev.p - val) ? curr : prev); });
      return `<div class="rev-card"><div class="sys">${s.country}</div><div class="val">${match.g}</div><div class="desc">${s.system}</div></div>`;
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var cSel = $("#country"), sSel = $("#scaleSel"), rIn = $("#revGpa");
    if (cSel) {
      var countries = Array.from(new Set(SCALES.map(function(s){ return s.country; })));
      cSel.innerHTML = countries.map(function(c){ return `<option ${c===meta.country?'selected':''}>${c}</option>`; }).join("");
      cSel.onchange = function() { meta.country = this.value; var list = SCALES.filter(function(s){ return s.country === meta.country; }); meta.scaleId = list[0].id; store.set(SKEY, meta); updateScaleDropdown(list); };
    }
    function updateScaleDropdown(list) { if (!sSel) return; sSel.innerHTML = list.map(function(s){ return `<option value="${s.id}" ${s.id===meta.scaleId?'selected':''}>${s.system}</option>`; }).join(""); render(); }
    if (sSel) { updateScaleDropdown(SCALES.filter(function(s){ return s.country === meta.country; })); sSel.onchange = function() { meta.scaleId = this.value; store.set(SKEY, meta); render(); }; }
    if (rIn) { rIn.oninput = runReverse; runReverse(); }
    var addFn = function() { var sc = getScale(), def = sc.type === "select" ? sc.rows[0].g : (sc.max / 1.2).toString(); rows.push({id:uid(), name:"", grade:def, credits:3}); render(); };
    if ($("#addRow")) $("#addRow").onclick = addFn;
    if ($("#addRow2")) $("#addRow2").onclick = addFn;
    if ($("#clearAll")) $("#clearAll").onclick = function() { if(confirm("Clear rows?")) { rows = []; store.set(KEY, rows); render(); } };
    $$(".mode-seg button").forEach(function(btn){ btn.onclick = function() { var m = this.getAttribute("data-mode"); $$(".mode-seg button").forEach(function(b){ b.classList.toggle("on", b === btn); }); $("#panel-toUS").classList.toggle("hidden", m !== "toUS"); $("#panel-toLocal").classList.toggle("hidden", m !== "toLocal"); if (m === "toLocal") runReverse(); }; });
    render();
  });
})();
