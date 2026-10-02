/* ---- hero slider ---- */
var AXIS_SLIDES=[
  {label:"データドリブン・マーケティング",title:"成果から逆算した戦略で、<br>事業の成長を加速させます"},
  {label:"統合型デジタルマーケティング",title:"検索・広告・SNSをひとつのチームで、<br>ワンストップにご支援します"},
  {label:"パートナーとしての伴走支援",title:"数字の先にある、<br>お客様のビジネスを見ています"}
];
var axisIdx=0,axisTimer=null;
function axisRender(){
  document.getElementById('heroLabel').textContent=AXIS_SLIDES[axisIdx].label;
  document.getElementById('heroTitle').innerHTML=AXIS_SLIDES[axisIdx].title;
  document.querySelectorAll('#heroDots button').forEach(function(b,i){b.className=i===axisIdx?'on':'';});
}
function axisHero(dir){axisIdx=(axisIdx+dir+AXIS_SLIDES.length)%AXIS_SLIDES.length;axisRender();axisRestart();}
function axisGo(i){axisIdx=i;axisRender();axisRestart();}
function axisRestart(){clearInterval(axisTimer);axisTimer=setInterval(function(){axisHero(1);},6000);}
(function(){
  var dots=document.getElementById('heroDots');
  AXIS_SLIDES.forEach(function(_,i){var b=document.createElement('button');b.setAttribute('aria-label','スライド'+(i+1));b.onclick=function(){axisGo(i);};dots.appendChild(b);});
  axisRender();axisTimer=setInterval(function(){axisHero(1);},6000);
})();

/* ---- reveal on scroll ---- */
function axisReveal(){
  var vh=window.innerHeight||document.documentElement.clientHeight;
  document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(function(el){
    var r=el.getBoundingClientRect();
    if(r.top<vh*0.92&&r.bottom>0)el.classList.add('is-in');
  });
}
window.addEventListener('scroll',axisReveal,true);
window.addEventListener('resize',axisReveal);
axisReveal();

/* ---- icons ---- */
if(window.lucide)lucide.createIcons();
