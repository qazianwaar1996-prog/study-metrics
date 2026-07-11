(function () {
  "use strict";
  var $ = SM.$, $$ = SM.$$, round = SM.round, uid = SM.uid, esc = SM.esc, store = SM.store;
  function letter(p){if(p>=93)return"A";if(p>=90)return"A-";if(p>=87)return"B+";if(p>=83)return"B";if(p>=80)return"B-";if(p>=77)return"C+";if(p>=73)return"C";if(p>=70)return"C-";if(p>=67)return"D+";if(p>=63)return"D";if(p>=60)return"D-";return"F";}
  var KEY="sm_grade_rows";
  var rows=store.get(KEY,[]);
  if(!rows.length) rows=[{id:uid(),name:"Homework",score:92,weight:15},{id:uid(),name:"Quizzes",score:85,weight:20},{id:uid(),name:"Midterm",score:78,weight:25},{id:uid(),name:"Final Exam",score:88,weight:40}];
  function find(id){for(var i=0;i<rows.length;i++)if(rows[i].id===id)return rows[i];return null;}
  function render(){
    $("#rows").innerHTML=rows.map(function(r){
      return '<div class="crow" data-id="'+r.id+'"><div class="c-name"><input class="input" data-f="name" value="'+esc(r.name)+'" placeholder="e.g. Midterm"></div><div class="c-a"><input class="input tnum" data-f="score" type="number" min="0" step="0.1" value="'+r.score+'" placeholder="0–100"></div><div class="c-b"><input class="input tnum" data-f="weight" type="number" min="0" step="0.5" value="'+r.weight+'" placeholder="%"></div><div class="c-del"><button class="row-del" data-del="'+r.id+'" aria-label="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div></div>';
    }).join("");
    $$(".crow").forEach(function(row){var id=row.getAttribute("data-id");$$("[data-f]",row).forEach(function(inp){inp.addEventListener("input",function(){var r=find(id);if(!r)return;r[inp.getAttribute("data-f")]=inp.value;save();compute();});});});
    $$("[data-del]").forEach(function(b){b.onclick=function(){rows=rows.filter(function(r){return r.id!==b.getAttribute("data-del");});save();render();};});
    compute();
  }
  function compute(){
    var tw=0,ws=0;
    rows.forEach(function(r){var w=Math.max(0,+r.weight||0);var s=+r.score||0;if(w>0){tw+=w;ws+=s*w;}});
    var grade=tw?round(ws/tw,2):0;
    $("#gradeOut").textContent=tw?grade.toFixed(2)+"%":"—";
    $("#gradeLetter").textContent=tw?letter(grade):"—";
    var n=$("#weightNote");
    if(!tw){n.className="weight-note ok";n.innerHTML="<b>Add an item</b> Enter a score and weight to see your grade.";return;}
    var twR=round(tw,1);
    if(Math.abs(tw-100)<0.5){n.className="weight-note ok";n.innerHTML="<b>Weights total 100%.</b> This is your full course grade.";}
    else if(tw<100){n.className="weight-note warn";n.innerHTML="<b>Weights total "+twR+"%.</b> This is your grade for the graded portion so far. Add the rest to project your final.";}
    else{n.className="weight-note warn";n.innerHTML="<b>Weights total "+twR+"%.</b> That's over 100%: double-check your weights so they add up correctly.";}
  }
  function save(){store.set(KEY,rows);}
  function addItem(){rows.push({id:uid(),name:"",score:"",weight:""});save();render();var r=$$(".crow");if(r.length){var inp=r[r.length-1].querySelector("input");if(inp)inp.focus();}}
  document.addEventListener("DOMContentLoaded",function(){
    $("#addRow").onclick=addItem;$("#addRow2").onclick=addItem;
    $("#clearAll").onclick=function(){rows=[];save();render();};
    render();
  });
})();
