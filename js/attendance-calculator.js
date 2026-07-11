(function () {
  "use strict";
  var $ = SM.$, store = SM.store;
  function round(n){var f=10;return Math.round((n+Number.EPSILON)*f)/f;}
  var CIRC=2*Math.PI*78, KEY="sm_attend";
  document.addEventListener("DOMContentLoaded",function(){
    var saved=store.get(KEY,null);
    if(saved){$("#attended").value=saved.a;$("#held").value=saved.h;$("#req").value=saved.r;}
    function calc(){
      var a=Math.max(0,+$("#attended").value||0), h=Math.max(0,+$("#held").value||0), r=Math.min(100,Math.max(0,+$("#req").value||0));
      store.set(KEY,{a:a,h:h,r:r});
      var arc=$("#ringArc"), pctEl=$("#pct"), st=$("#status"), v=$("#verdict"), vt=$("#verdictText");
      if(h<=0||a>h){pctEl.textContent="—";st.textContent=a>h?"Attended exceeds total":"Enter total classes";arc.style.strokeDashoffset=CIRC;v.className="verdict warn";vt.innerHTML="<b>Check your numbers</b>Attended can't be more than classes held.";return;}
      var pct=round(a/h*100);
      pctEl.textContent=pct+"%";
      arc.style.strokeDashoffset=CIRC-(CIRC*Math.min(pct,100)/100);
      var rf=r/100;
      if(pct>=r){
        var canSkip=rf>0?Math.floor(a/rf - h):Infinity;
        arc.style.stroke="var(--ok)";st.textContent="Above the "+r+"% minimum";v.className="verdict ok";
        if(canSkip>=1)vt.innerHTML="<b>You can skip "+canSkip+" more class"+(canSkip===1?"":"es")+"</b>and still stay at or above "+r+"%. Miss more than that and you drop below.";
        else vt.innerHTML="<b>You're right at the edge</b>You're above "+r+"% but can't afford to miss the next class. Attend to build a buffer.";
      } else {
        var needAttend=rf<1?Math.ceil((rf*h - a)/(1-rf)):Infinity;
        arc.style.stroke="var(--danger)";st.textContent="Below the "+r+"% minimum";v.className="verdict bad";
        if(isFinite(needAttend)&&needAttend>0)vt.innerHTML="<b>Attend the next "+needAttend+" class"+(needAttend===1?"":"es")+"</b>without missing any to get back to "+r+"%. Every absence pushes this higher.";
        else vt.innerHTML="<b>Recovery isn't possible at 100% required</b>Lower the required percentage or check your inputs.";
      }
    }
    ["attended","held","req"].forEach(function(id){$("#"+id).addEventListener("input",calc);});
    calc();
  });
})();
