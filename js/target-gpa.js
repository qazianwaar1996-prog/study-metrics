/* Study Metrics — Target GPA Calculator  ·  /js/target-gpa.js */
(function () {
  "use strict";
  var $ = SM.$, round = SM.round, clamp = SM.clamp, store = SM.store;
  var KEY="sm_target";

  document.addEventListener("DOMContentLoaded",function(){
    var saved=store.get(KEY,null);
    if(saved){
      $("#curGpa").value=saved.cur;
      $("#curCredits").value=saved.cc;
      $("#remCredits").value=saved.rc;
      $("#goalGpa").value=saved.goal;
    }
    
    $("#goalSlide").value=$("#goalGpa").value;
    $("#goalSlideVal").textContent=(+$("#goalGpa").value).toFixed(2);

    function calc(){
      var cur=clamp(+$("#curGpa").value||0,0,4), 
          cc=Math.max(0,+$("#curCredits").value||0), 
          rc=Math.max(0,+$("#remCredits").value||0), 
          goal=clamp(+$("#goalGpa").value||0,0,4);
      
      store.set(KEY,{cur:cur,cc:cc,rc:rc,goal:goal});
      
      var tot=cc+rc||1;
      $("#segDone").style.width=(cc/tot*100)+"%";
      $("#segNeed").style.width=(rc/tot*100)+"%";
      $("#legDone").textContent=cc+" cr";
      $("#legNeed").textContent=rc+" cr";
      
      var v=$("#verdict"), 
          vt=$("#verdictText"), 
          ne=$("#need"), 
          ns=$("#needSub");

      function setV(cls,title,text){
        v.className="verdict "+cls;
        vt.innerHTML="<b>"+title+"</b>"+text;
      }

      // FIX: Prevent "Infinity" if remaining credits is 0
      if(rc <= 0){
        ne.textContent="—";
        ns.textContent="waiting for input";
        setV("info","Add remaining credits","Enter how many credits you have left to see what you need to average.");
        return;
      }

      var need = round((goal * tot - cur * cc) / rc, 2);

      if(need <= 0){
        ne.textContent="0.00";
        ns.textContent="you're already there";
        setV("ok","Goal already secured 🎉","Even a 0.0 across your remaining credits keeps you at or above your goal. Great job!");
        return;
      }

      if(need > 4){
        ne.textContent=need.toFixed(2);
        ns.textContent="not reachable";
        setV("bad","Out of reach","You would need a "+need.toFixed(2)+" average, which is above the 4.0 maximum. You might need to lower your goal or retake courses.");
        return;
      }

      ne.textContent=need.toFixed(2);
      ns.textContent="across your remaining credits";

      if(need <= 2.7) setV("ok","Very achievable","Comfortably within reach. Consistent work will get you there.");
      else if(need <= 3.3) setV("info","Achievable with focus","A solid effort each term will land it. Keep pushing.");
      else if(need <= 3.7) setV("warn","Ambitious but doable","You'll need to average around an A- across everything left. Prioritize your studies.");
      else setV("warn","Very demanding","Near-perfect grades required from here. Every assignment counts.");
    }

    ["curGpa","curCredits","remCredits","goalGpa"].forEach(function(id){
      $("#"+id).addEventListener("input",function(){
        if(id==="goalGpa"){
          $("#goalSlide").value=$("#goalGpa").value;
          $("#goalSlideVal").textContent=(+$("#goalGpa").value||0).toFixed(2);
        }
        calc();
      });
    });

    $("#goalSlide").addEventListener("input",function(){
      $("#goalGpa").value=(+$("#goalSlide").value).toFixed(2);
      $("#goalSlideVal").textContent=(+$("#goalSlide").value).toFixed(2);
      calc();
    });

    calc();
  });
})();
