(function () {
  "use strict";
  var $ = SM.$, $$ = SM.$$, round = SM.round;
  document.addEventListener("DOMContentLoaded",function(){
    $$(".tabs button").forEach(function(b){
      b.onclick=function(){
        $$(".tabs button").forEach(function(x){x.classList.toggle("on",x===b);});
        ["marks","xofy","percentof","change"].forEach(function(t){$("#panel-"+t).style.display=(t===b.getAttribute("data-tab"))?"":"none";});
      };
    });
    function marks(){
      var g=+$("#m_got").value||0, m=+$("#m_max").value||0, p=m?round(g/m*100):0;
      $("#m_out").textContent=p+"%";
      var n="";if(m){if(p>=90)n="Outstanding result.";else if(p>=75)n="Strong pass.";else if(p>=50)n="A clear pass.";else if(p>=40)n="Just over the line in many systems.";else n="Below a typical pass mark.";}
      $("#m_note").textContent=n;
    }
    function xofy(){var a=+$("#x_a").value||0,b=+$("#x_b").value||0;$("#x_out").textContent=(b?round(a/b*100):0)+"%";}
    function percentof(){var p=+$("#p_pct").value||0,n=+$("#p_num").value||0;$("#p_out").textContent=round(p/100*n);}
    function change(){var f=+$("#c_from").value||0,t=+$("#c_to").value||0;var c=f?round((t-f)/Math.abs(f)*100):0;$("#c_out").textContent=(c>0?"+":"")+c+"%";$("#c_note").textContent=f?(c>0?"An increase.":c<0?"A decrease.":"No change."):"Enter a starting value.";}
    ["m_got","m_max"].forEach(function(id){$("#"+id).addEventListener("input",marks);});
    ["x_a","x_b"].forEach(function(id){$("#"+id).addEventListener("input",xofy);});
    ["p_pct","p_num"].forEach(function(id){$("#"+id).addEventListener("input",percentof);});
    ["c_from","c_to"].forEach(function(id){$("#"+id).addEventListener("input",change);});
    marks();xofy();percentof();change();
  });
})();
