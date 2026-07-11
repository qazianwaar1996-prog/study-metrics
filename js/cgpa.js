(function () {
  "use strict";
  var $ = SM.$, $$ = SM.$$, round = SM.round, clamp = SM.clamp, uid = SM.uid, esc = SM.esc, store = SM.store;
  function classify(g){if(g>=3.7)return"Excellent standing";if(g>=3.3)return"Very good";if(g>=3.0)return"Good";if(g>=2.0)return"Satisfactory";if(g>0)return"Needs improvement";return"";}
  var KEY="sm_cgpa_rows";
  var rows=store.get(KEY,[]);
  if(!rows.length) rows=[{id:uid(),name:"Semester 1",gpa:3.6,credits:15},{id:uid(),name:"Semester 2",gpa:3.8,credits:16},{id:uid(),name:"Semester 3",gpa:3.4,credits:14}];
  function find(id){for(var i=0;i<rows.length;i++)if(rows[i].id===id)return rows[i];return null;}
  function render(){
    $("#rows").innerHTML=rows.map(function(r){
      return '<div class="crow" data-id="'+r.id+'"><div class="c-name"><input class="input" data-f="name" value="'+esc(r.name)+'" placeholder="Semester name"></div><div class="c-a"><input class="input tnum" data-f="gpa" type="number" min="0" max="4" step="0.01" value="'+r.gpa+'" placeholder="0–4.0"></div><div class="c-b"><input class="input tnum" data-f="credits" type="number" min="0" step="0.5" value="'+r.credits+'" placeholder="Credits"></div><div class="c-del"><button class="row-del" data-del="'+r.id+'" aria-label="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div></div>';
    }).join("");
    $$(".crow").forEach(function(row){var id=row.getAttribute("data-id");$$("[data-f]",row).forEach(function(inp){inp.addEventListener("input",function(){var r=find(id);if(!r)return;r[inp.getAttribute("data-f")]=inp.value;save();compute();});});});
    $$("[data-del]").forEach(function(b){b.onclick=function(){rows=rows.filter(function(r){return r.id!==b.getAttribute("data-del");});save();render();};});
    compute();
  }
  function compute(){
    var cr=0,qp=0;
    rows.forEach(function(r){var c=Math.max(0,+r.credits||0);var g=clamp(+r.gpa||0,0,4);if(c>0){cr+=c;qp+=g*c;}});
    var cgpa=cr?round(qp/cr):0;
    $("#cgpaOut").textContent=cgpa.toFixed(2);
    $("#mSem").textContent=rows.length;
    $("#mCredits").textContent=round(cr,1);
    $("#cgpaClass").textContent=cr?classify(cgpa):"Add a semester to begin";
  }
  function save(){store.set(KEY,rows);}
  function addSem(){rows.push({id:uid(),name:"Semester "+(rows.length+1),gpa:3.5,credits:15});save();render();var r=$$(".crow");if(r.length){var inp=r[r.length-1].querySelector("input");if(inp)inp.focus();}}
  document.addEventListener("DOMContentLoaded",function(){
    $("#addRow").onclick=addSem;$("#addRow2").onclick=addSem;
    $("#clearAll").onclick=function(){rows=[];save();render();};
    render();
  });
})();
