(function () {
  'use strict';
  var script = document.currentScript;
  var root = script && script.previousElementSibling;
  if (!root || root.id !== 'kc901-manual') root = document.getElementById('kc901-manual');
  if (!root || root.dataset.kmReady) return;
  root.dataset.kmReady = 'true';
  var panels = Array.from(root.querySelectorAll('.km-language-panel'));
  var links = Array.from(root.querySelectorAll('[data-km-language]'));
  var active = null;
  var copy = {
    en: { hint:'Search command names, parameters, and explanations.', count:' matching sections', more:' · first 30 shown; refine your search.', none:'No matching sections. Try a command name or a shorter query.' },
    zh: { hint:'可搜索命令名称、参数及说明文字。', count:' 个匹配章节', more:' · 显示前30项，请缩小搜索范围。', none:'没有匹配章节，请尝试命令名称或更短的关键词。' }
  };
  panels.forEach(function (panel) {
    var input = panel.querySelector('input[type="search"]');
    var results = panel.querySelector('.km-results');
    var status = panel.querySelector('.km-search-status');
    var toc = panel.querySelector('.km-toc');
    var wordsUI = copy[panel.dataset.kmLang];
    var sections = Array.from(panel.querySelectorAll('.km-section')).map(function (s) {
      return { id:s.id, title:s.querySelector('h2,h3,h4').textContent, text:s.textContent.replace(/\s+/g,' ').trim() };
    });
    var timer;
    function search() {
      var query = input.value.trim().toLowerCase();
      results.replaceChildren();
      if (!query) { results.hidden=true; toc.hidden=false; status.textContent=wordsUI.hint; return; }
      var words = query.split(/\s+/);
      var matches = sections.filter(function (s) {
        var text=s.text.toLowerCase();
        return words.every(function (w) { return text.includes(w); });
      });
      matches.sort(function (a,b) { return Number(b.title.toLowerCase().includes(query))-Number(a.title.toLowerCase().includes(query)); });
      results.hidden=false; toc.hidden=true;
      status.textContent=matches.length ? matches.length+wordsUI.count+(matches.length>30 ? wordsUI.more : '') : wordsUI.none;
      matches.slice(0,30).forEach(function (s) {
        var li=document.createElement('li'), a=document.createElement('a'), p=document.createElement('p');
        a.href='#'+s.id; a.textContent=s.title;
        var pos=Math.max(0,s.text.toLowerCase().indexOf(words[0])-45);
        p.textContent=(pos?'…':'')+s.text.slice(pos,pos+180)+(s.text.length>pos+180?'…':'');
        li.append(a,p); results.append(li);
      });
    }
    panel.querySelector('.km-tools').hidden=false;
    input.addEventListener('input',function () { clearTimeout(timer);timer=setTimeout(search,120); });
    input.addEventListener('keydown',function (event) {
      if (event.key==='Escape') { input.value='';clearTimeout(timer);search(); }
      if (event.key==='Enter') { clearTimeout(timer);search();var first=results.querySelector('a');if(first)first.click(); }
    });
    panel.querySelector('.km-clear').addEventListener('click',function () { input.value='';clearTimeout(timer);search();input.focus(); });
    search();
  });
  function hashTarget() {
    var id;
    try { id=decodeURIComponent(location.hash.slice(1)); } catch (_) { return null; }
    var target=document.getElementById(id);
    return target && root.contains(target) ? target : null;
  }
  function show(lang, remember) {
    active=panels.find(function (p) { return p.dataset.kmLang===lang; }) || panels[0];
    panels.forEach(function (p) { p.hidden=p!==active; });
    links.forEach(function (a) {
      if (a.dataset.kmLanguage===active.dataset.kmLang) a.setAttribute('aria-current','true');
      else a.removeAttribute('aria-current');
    });
    root.dataset.kmActiveLanguage=active.dataset.kmLang;
    if (remember) { try { localStorage.setItem('kc901-manual-language',active.dataset.kmLang); } catch (_) {} }
  }
  links.forEach(function (a) {
    a.addEventListener('click',function (event) {
      event.preventDefault();
      if (a.dataset.kmLanguage===active.dataset.kmLang) return;
      var section=null;
      var barBottom=root.querySelector('.km-language-bar').getBoundingClientRect().bottom;
      Array.from(active.querySelectorAll('.km-section')).forEach(function (s) {
        if (s.getBoundingClientRect().top<=barBottom+100) section=s;
      });
      var key=section ? section.id.replace(/-zh$/,'') : null;
      show(a.dataset.kmLanguage,true);
      var target=key ? document.getElementById(key+(active.dataset.kmLang==='zh'?'-zh':'')) : active;
      if (target) {
        try { history.replaceState(history.state,'','#'+target.id); } catch (_) {}
        if (section) target.scrollIntoView({block:'start'});
      }
    });
  });
  function followHash() {
    if (!root.isConnected) return;
    var target=hashTarget(), panel=target && target.closest('.km-language-panel');
    if (panel) {
      show(panel.dataset.kmLang,false);
      requestAnimationFrame(function () { target.scrollIntoView({block:'start'}); });
    }
  }
  var target=hashTarget(), targetPanel=target && target.closest('.km-language-panel');
  var preferred='en';
  try { preferred=localStorage.getItem('kc901-manual-language') || 'en'; } catch (_) {}
  show(targetPanel ? targetPanel.dataset.kmLang : preferred,false);
  if (targetPanel) requestAnimationFrame(function () { target.scrollIntoView({block:'start'}); });
  window.addEventListener('hashchange',followHash);
})();
