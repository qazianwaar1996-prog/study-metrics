(function () {
  "use strict";
  var $ = SM.$, clamp = SM.clamp, store = SM.store;
  function round(n){var f=10;return Math.round((n+Number.EPSILON)*f)/f;}
  var KEY="sm_final";
  function courseGradeAt(score,cur,w){return cur*(1-w)+score*w;}
  document.addEventListener("DOMContentLoaded",function(){
    var saved=store.get(KEY,null);
    if(saved){$("#cur").value=saved.cur;$("#goal").value=saved.goal;$("#weight").value=saved.w;}
    function calc(){
      var cur=+$("#cur").value||0, goal=+$("#goal").value||0, w=clamp(+$("#weight").value||0,0.01,100)/100;
      store.set(KEY,{cur:cur,goal:goal,w:$("#weight").value});
      var need=round((goal-cur*(1-w))/w);
      var arc=$("#gaugeArc"), ne=$("#need"), v=$("#verdict"), vt=$("#verdictText");
      var shown=clamp(need,0,100);arc.style.strokeDashoffset=270-(270*shown/100);
      $("#sc100").textContent=round(courseGradeAt(100,cur,w))+"%";
      $("#sc90").textContent=round(courseGradeAt(90,cur,w))+"%";
      $("#sc80").textContent=round(courseGradeAt(80,cur,w))+"%";
      $("#sc70").textContent=round(courseGradeAt(70,cur,w))+"%";
      function setV(cls,color,title,text){v.className="verdict "+cls;vt.innerHTML="<b>"+title+"</b>"+text;arc.style.stroke=color;}
      if(need<=0){ne.textContent="0%";arc.style.strokeDashoffset=0;setV("ok","var(--ok)","Already secured 🎉","Even a zero on the final keeps you at or above your goal. You can breathe.");return;}
      ne.textContent=need+"%";
      if(need>100){setV("bad","var(--danger)","Not reachable on the final","You'd need "+need+"%, which is above a perfect score. Look at extra credit or adjust your goal.");}
      else if(need<=50){setV("ok","var(--ok)","Highly achievable","Comfortably within reach. Stay steady and it's yours.");}
      else if(need<=75){setV("info","var(--info)","Doable with effort","Solid but not automatic. A focused study block gets you there.");}
      else if(need<=90){setV("warn","var(--warn)","Time to study hard","You'll need a strong performance. Make this your priority.");}
      else{setV("warn","var(--warn)","Very demanding","Near-perfect required. Every point on that final counts.");}
    }
    ["cur","goal","weight"].forEach(function(id){$("#"+id).addEventListener("input",calc);});
    calc();
  });
})();
