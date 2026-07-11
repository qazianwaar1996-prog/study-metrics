(function () {
  "use strict";
  var $ = SM.$, $$ = SM.$$, round = SM.round, clamp = SM.clamp, uid = SM.uid, esc = SM.esc, store = SM.store;
  var LETTERS = ["A+","A","A-","B+","B","B-","C+","C","C-","D+","D","D-","F"];
  var L2P = {"A+":4.0,"A":4.0,"A-":3.7,"B+":3.3,"B":3.0,"B-":2.7,"C+":2.3,"C":2.0,"C-":1.7,"D+":1.3,"D":1.0,"D-":0.7,"F":0};
  function pct2points(p){p=clamp(p,0,100);if(p>=93)return 4.0;if(p>=90)return 3.7;if(p>=87)return 3.3;if(p>=83)return 3.0;if(p>=80)return 2.7;if(p>=77)return 2.3;if(p>=73)return 2.0;if(p>=70)return 1.7;if(p>=67)return 1.3;if(p>=63)return 1.0;if(p>=60)return 0.7;return 0;}
  function nearestLetter(g){var best="F",bd=99;for(var i=0;i<LETTERS.length;i++){var d=Math.abs(L2P[LETTERS[i]]-g);if(d<bd){bd=d;best=LETTERS[i];}}return best;}
  function classify(g){if(g>=3.7)return"Excellent standing";if(g>=3.3)return"Very good";if(g>=3.0)return"Good";if(g>=2.0)return"Satisfactory";if(g>0)return"Needs improvement";return"";}
  var KEY="sm_gpa_rows", SKEY="sm_gpa_scale";
  var scale = localStorage.getItem(SKEY) || "letter";
  var rows = store.get(KEY, []);
  if(!rows.length) rows=[{id:uid(),name:"Calculus I",grade:"A-",credits:4},{id:uid(),name:"English Composition",grade:"B+",credits:3},{id:uid(),name:"Introduction to Psychology",grade:"A",credits:3}];
  function gradeCell(r){
    if(scale==="letter"){
      var opts=LETTERS.map(function(l){return '<option '+(r.grade===l?"selected":"")+'>'+l+'</option>';}).join("");
      return '<select class="select c-grade" data-f="grade">'+opts+'</select>';
    }
    var max=scale==="points"?4:100, step=scale==="points"?"0.01":"0.1", ph=scale==="points"?"0–4.0":"0–100";
    return '<input class="input tnum c-grade" data-f="grade" type="number" min="0" max="'+max+'" step="'+step+'" value="'+r.grade+'" placeholder="'+ph+'">';
  }
  function render(){
    $("#rows").innerHTML = rows.map(function(r){
      return '<div class="crow" data-id="'+r.id+'"><div class="c-name"><input class="input" data-f="name" value="'+esc(r.name)+'" placeholder="Course name"></div><div class="c-grade-wrap">'+gradeCell(r)+'</div><div class="c-credit"><input class="input tnum" data-f="credits" type="number" min="0" step="0.5" value="'+r.credits+'" placeholder="Credits"></div><div class="c-del"><button class="row-del" data-del="'+r.id+'" aria-label="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div></div>';
    }).join("");
    $$(".crow").forEach(function(row){
      var id=row.getAttribute("data-id");
      $$("[data-f]",row).forEach(function(inp){inp.addEventListener("input",function(){var r=find(id);if(!r)return;r[inp.getAttribute("data-f")]=inp.value;save();compute();});});
    });
    $$("[data-del]").forEach(function(b){b.onclick=function(){rows=rows.filter(function(r){return r.id!==b.getAttribute("data-del");});save();render();};});
    compute();
  }
  function find(id){for(var i=0;i<rows.length;i++)if(rows[i].id===id)return rows[i];return null;}
  function resolve(r){if(scale==="letter")return L2P[r.grade]||0;if(scale==="points")return clamp(+r.grade||0,0,4);return pct2points(+r.grade||0);}
  function compute(){
    var cr=0,qp=0;
    rows.forEach(function(r){var c=Math.max(0,+r.credits||0);if(c>0){cr+=c;qp+=resolve(r)*c;}});
    var gpa=cr?round(qp/cr):0;
    $("#gpaOut").textContent=gpa.toFixed(2);
    $("#mCourses").textContent=rows.length;
    $("#mCredits").textContent=round(cr,1);
    $("#gpaLetter").textContent=cr?(nearestLetter(gpa)+" average · "+classify(gpa)):"Add a course to begin";
  }
  function save(){store.set(KEY,rows);}
  function setScaleNote(){
    var notes={letter:"<b>Letter scale.</b> A/A+ = 4.0, A- = 3.7, B+ = 3.3, down to F = 0. Credits weight each course.",percent:"<b>Percentage scale.</b> Enter 0–100 per course; we map it to the 4.0 scale automatically.",points:"<b>Grade points.</b> Enter each course grade directly on the 0–4.0 scale."};
    $("#scaleNote").innerHTML=notes[scale];
  }
  function addCourse(){rows.push({id:uid(),name:"",grade:scale==="letter"?"A":(scale==="points"?"3.5":"88"),credits:3});save();render();var r=$$(".crow");if(r.length){var inp=r[r.length-1].querySelector("input");if(inp)inp.focus();}}
  document.addEventListener("DOMContentLoaded",function(){
    $("#scale").value=scale;
    $("#scale").onchange=function(e){
      scale=e.target.value;localStorage.setItem(SKEY,scale);
      rows.forEach(function(r){if(scale==="letter")r.grade=LETTERS.indexOf(r.grade)>=0?r.grade:"A";else if(!isFinite(+r.grade))r.grade=scale==="points"?"3.5":"88";});
      save();render();setScaleNote();
    };
    $("#addRow").onclick=addCourse;$("#addRow2").onclick=addCourse;
    $("#clearAll").onclick=function(){rows=[];save();render();};
    render();setScaleNote();
  });
})();
