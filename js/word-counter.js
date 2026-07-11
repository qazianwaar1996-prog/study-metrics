(function () {
  "use strict";
  var $ = SM.$;
  var KEY="sm_wordcount", tt;
  function toast(m){var el=$("#toast");el.textContent=m;el.classList.add("show");clearTimeout(tt);tt=setTimeout(function(){el.classList.remove("show");},2000);}
  document.addEventListener("DOMContentLoaded",function(){
    var ed=$("#editor");
    ed.value=localStorage.getItem(KEY)||"";
    function count(){
      var t=ed.value;localStorage.setItem(KEY,t);
      var words=(t.match(/\b[\w'’-]+\b/g)||[]).length;
      var chars=t.length, nospace=t.replace(/\s/g,"").length;
      var sent=(t.match(/[^.!?]+[.!?]+(\s|$)/g)||[]).filter(function(s){return s.trim().length;}).length || (t.trim()?1:0);
      var para=t.split(/\n{1,}/).map(function(p){return p.trim();}).filter(Boolean).length;
      var readSec=Math.round(words/200*60);
      $("#s_words").textContent=words.toLocaleString();
      $("#s_chars").textContent=chars.toLocaleString();
      $("#s_nospace").textContent=nospace.toLocaleString();
      $("#s_sent").textContent=sent.toLocaleString();
      $("#s_para").textContent=para.toLocaleString();
      $("#s_read").textContent=readSec<60?readSec+"s":Math.floor(readSec/60)+"m "+(readSec%60)+"s";
      $("#s_avg").textContent=sent?Math.round(words/sent):0;
      var longest=(t.match(/\b[\w'’-]+\b/g)||[]).reduce(function(a,b){return b.length>a.length?b:a;},"");
      $("#s_long").textContent=longest?longest+" ("+longest.length+")":"—";
    }
    ed.addEventListener("input",count);
    $("#copyBtn").onclick=function(){
      if(!ed.value){toast("Nothing to copy");return;}
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(ed.value).then(function(){toast("Copied to clipboard");},function(){ed.select();document.execCommand("copy");toast("Copied to clipboard");});}
      else{ed.select();document.execCommand("copy");toast("Copied to clipboard");}
    };
    $("#clearBtn").onclick=function(){ed.value="";count();ed.focus();toast("Cleared");};
    count();
  });
})();
