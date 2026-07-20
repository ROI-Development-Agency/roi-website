/* ============================================================
   ROI Development Agency — "Roy" AI Assistant (Claude-powered)
   Talks to /.netlify/functions/roy which holds the API key.
   Same look, character, and animations as before — real brain.
   ============================================================ */
(function () {
  var CYAN = '#205050';
  var CYAN_DEEP = '#163838';
  var GREY_CYAN = '#AFC4C0';
  var CREAM = '#F4F1EA';
  var GOLD = '#E4B83C';
  var CAL = 'kennedy-matiasi/discovery';
  var DIAGNOSTIC = 'diagnostic.html';
  var ENDPOINT = '/.netlify/functions/roy';

  // Opening message + a few starter chips (after this, it's all real AI)
  var OPENING = "Hey, I'm <b>Roy</b> \u2014 your guide here at ROI \uD83D\uDC4B<br><br>Ask me anything about what we do, your marketing, or where to start. No pressure at all \u2014 what's on your mind?";
  var STARTERS = ["What do you do?", "I need help growing", "How much does it cost?", "I'm just exploring"];

  // conversation history sent to the model (role/content)
  var history = [];
  function saveHistory(){
    try { sessionStorage.setItem('royHistory', JSON.stringify(history)); } catch(e){}
  }
  function loadHistory(){
    try { var h = sessionStorage.getItem('royHistory'); if(h) history = JSON.parse(h) || []; } catch(e){ history = []; }
  }
  loadHistory();

  var css = `
  #roy-launch{position:fixed;bottom:24px;right:24px;width:88px;height:96px;border:none;background:none;cursor:pointer;z-index:99998;padding:0;animation:royHover 3.4s ease-in-out infinite;}
  #roy-launch svg{width:100%;height:100%;display:block;filter:drop-shadow(0 10px 18px rgba(22,56,56,.35));}
  @keyframes royHover{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-7px) scale(1.01);}}
  /* ===== Roy is ALIVE: blink, antenna pulse, head tilt, auto-wave ===== */
  /* Eyes blink every 4s (everywhere Roy appears) */
  .roy-eyes{transform-box:fill-box;transform-origin:center;animation:royBlink 4s infinite;}
  @keyframes royBlink{0%,93%,100%{transform:scaleY(1);}95.5%,97%{transform:scaleY(.08);}}
  /* Pupils: eye contact by default, quick glances around every ~9s */
  .roy-pupils{animation:royGlance 9s ease-in-out infinite;}
  @keyframes royGlance{0%,38%,100%{transform:translate(0,0);}42%,48%{transform:translate(-1.8px,.3px);}52%{transform:translate(0,0);}72%,78%{transform:translate(1.8px,.3px);}82%{transform:translate(0,0);}}
  /* Antenna tip glows/pulses gold */
  .roy-tip{transform-box:fill-box;transform-origin:center;animation:royTip 2.4s ease-in-out infinite;}
  @keyframes royTip{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.35);opacity:.75;}}
  /* Head tilts gently side to side on the launcher */
  #roy-launch .roy-headgrp{transform-box:fill-box;transform-origin:50% 80%;animation:royTilt 5s ease-in-out infinite;}
  @keyframes royTilt{0%,100%{transform:rotate(0deg);}25%{transform:rotate(-3.5deg);}75%{transform:rotate(3.5deg);}}
  /* Arm waves on its own every 6s on the launcher (plus the nudge trigger) */
  #roy-arm{transform-origin:86px 88px;}
  #roy-launch #roy-arm{animation:royWaveLoop 6s ease-in-out infinite;}
  @keyframes royWaveLoop{0%,72%,100%{transform:rotate(0deg);}76%{transform:rotate(-24deg);}80%{transform:rotate(-8deg);}84%{transform:rotate(-26deg);}88%{transform:rotate(-6deg);}92%{transform:rotate(-20deg);}96%{transform:rotate(-2deg);}}
  /* Happy little hop while he waves (same 6s clock) */
  #roy-launch svg{animation:royHop 6s ease-in-out infinite;}
  @keyframes royHop{0%,72%,100%{transform:translateY(0);}78%{transform:translateY(-5px);}84%{transform:translateY(-1px);}90%{transform:translateY(-4px);}96%{transform:translateY(0);}}
  .roy-wave #roy-arm{animation:royWaveSmooth 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) 2 !important;}
  @keyframes royWaveSmooth{0%{transform:rotate(0deg);}10%{transform:rotate(-18deg);}20%{transform:rotate(-26deg);}35%{transform:rotate(-20deg);}50%{transform:rotate(-10deg);}65%{transform:rotate(-3deg);}100%{transform:rotate(0deg);}}
  #roy-launch:hover{animation-play-state:paused;}
  #roy-launch:hover svg{transform:scale(1.06);transition:transform .25s ease;}
  #roy-greet{position:fixed;bottom:128px;right:26px;max-width:250px;background:#fff;color:${CYAN_DEEP};font-family:'Inter',system-ui,sans-serif;font-size:14px;line-height:1.5;padding:15px 18px;border-radius:16px 16px 4px 16px;box-shadow:0 14px 34px -10px rgba(22,56,56,.35);z-index:99998;opacity:0;transform:translateY(8px);transition:opacity .3s,transform .3s;pointer-events:none;}
  #roy-greet.show{opacity:1;transform:translateY(0);pointer-events:auto;}
  #roy-greet .x{position:absolute;top:7px;right:10px;cursor:pointer;color:#bbb;font-size:15px;}
  #roy-panel{position:fixed;bottom:24px;right:24px;width:384px;max-width:calc(100vw - 32px);height:580px;max-height:calc(100vh - 48px);background:${CREAM};border-radius:22px;box-shadow:0 26px 64px -12px rgba(22,56,56,.5);z-index:99999;display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(16px) scale(.98);pointer-events:none;transition:opacity .28s,transform .28s;font-family:'Inter',system-ui,sans-serif;}
  #roy-panel.open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}
  .roy-head{background:${CYAN};color:${CREAM};padding:18px 20px;display:flex;align-items:center;gap:13px;flex-shrink:0;}
  .roy-head .av{width:46px;height:46px;flex-shrink:0;}
  .roy-head .av svg{width:100%;height:100%;}
  .roy-head .ttl{font-weight:600;font-size:16px;}
  .roy-head .sub{font-size:12px;color:${GREY_CYAN};margin-top:2px;display:flex;align-items:center;gap:6px;}
  .roy-head .dot{width:7px;height:7px;border-radius:50%;background:#6fcf97;display:inline-block;}
  .roy-head .close{margin-left:auto;cursor:pointer;color:rgba(244,241,234,.7);font-size:24px;background:none;border:none;line-height:1;}
  .roy-head .close:hover{color:#fff;}
  .roy-body{flex:1;overflow-y:auto;padding:22px 18px 8px;display:flex;flex-direction:column;gap:13px;}
  .roy-msg{max-width:85%;font-size:14px;line-height:1.58;padding:13px 16px;border-radius:16px;}
  .roy-msg.bot{background:#fff;color:${CYAN_DEEP};align-self:flex-start;border-bottom-left-radius:5px;box-shadow:0 2px 10px -4px rgba(22,56,56,.15);}
  .roy-msg.user{background:${CYAN};color:${CREAM};align-self:flex-end;border-bottom-right-radius:5px;}
  .roy-chips{display:flex;flex-wrap:wrap;gap:8px;padding:2px 2px 6px;}
  .roy-chip{background:transparent;border:1.4px solid ${CYAN};color:${CYAN};font-family:inherit;font-size:13px;font-weight:500;padding:9px 15px;border-radius:100px;cursor:pointer;transition:all .2s;}
  .roy-chip:hover{background:${CYAN};color:${CREAM};}
  .roy-typing{align-self:flex-start;display:flex;gap:4px;padding:14px 16px;background:#fff;border-radius:16px;border-bottom-left-radius:5px;}
  .roy-typing i{width:7px;height:7px;border-radius:50%;background:${GREY_CYAN};animation:royb 1.2s infinite;}
  .roy-typing i:nth-child(2){animation-delay:.18s;}.roy-typing i:nth-child(3){animation-delay:.36s;}
  @keyframes royb{0%,60%,100%{transform:translateY(0);opacity:.5;}30%{transform:translateY(-5px);opacity:1;}}
  .roy-input{display:flex;gap:8px;padding:13px 15px;border-top:1px solid rgba(22,56,56,.08);flex-shrink:0;background:${CREAM};}
  .roy-input input{flex:1;border:1.4px solid rgba(22,56,56,.18);border-radius:100px;padding:11px 16px;font-family:inherit;font-size:14px;color:${CYAN_DEEP};outline:none;background:#fff;}
  .roy-input input:focus{border-color:${CYAN};}
  .roy-input button{width:42px;height:42px;border-radius:50%;background:${CYAN};border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .roy-input button:disabled{opacity:.45;cursor:default;}
  .roy-input button svg{width:18px;height:18px;}
  .roy-foot{text-align:center;font-size:11px;color:rgba(22,56,56,.45);padding:0 0 11px;background:${CREAM};flex-shrink:0;letter-spacing:.02em;}
  `;

  function royBot(onLight) {
    var backing = onLight ? CYAN : CREAM;
    var bodyFill = CREAM, faceFill = CYAN;
    return '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">'+
      // circular backing
      '<circle cx="60" cy="60" r="52" fill="'+backing+'"/>'+
      // ===== head group: everything that tilts together =====
      '<g class="roy-headgrp">'+
        // antenna
        '<line x1="60" y1="28" x2="60" y2="38" stroke="'+bodyFill+'" stroke-width="3.4" stroke-linecap="round"/>'+
        '<circle class="roy-tip" cx="60" cy="25" r="5" fill="'+GOLD+'"/>'+
        // head (rounded, balanced)
        '<rect x="33" y="38" width="54" height="46" rx="19" fill="'+bodyFill+'"/>'+
        // ears
        '<rect x="27" y="54" width="6.5" height="15" rx="3.25" fill="'+GREY_CYAN+'"/>'+
        '<rect x="86.5" y="54" width="6.5" height="15" rx="3.25" fill="'+GREY_CYAN+'"/>'+
        // face screen
        '<rect x="40" y="47" width="40" height="28" rx="12" fill="'+faceFill+'"/>'+
        // eyes (blink as a group)
        '<g class="roy-eyes">'+
          '<circle cx="51" cy="60" r="4.2" fill="'+CREAM+'"/>'+
          '<circle cx="69" cy="60" r="4.2" fill="'+CREAM+'"/>'+
          '<g class="roy-pupils">'+
            '<circle cx="51" cy="60" r="1.6" fill="'+CYAN_DEEP+'"/>'+
            '<circle cx="69" cy="60" r="1.6" fill="'+CYAN_DEEP+'"/>'+
          '</g>'+
        '</g>'+
        // smile
        '<path d="M51 67 Q60 73 69 67" stroke="'+CREAM+'" stroke-width="2.6" fill="none" stroke-linecap="round"/>'+
      '</g>'+
      // static left arm (resting)
      '<rect x="30" y="80" width="7" height="16" rx="3.5" fill="'+bodyFill+'"/>'+
      // waving right arm: forearm + open hand (mitten) that rotates from the shoulder
      '<g id="roy-arm">'+
        '<rect x="82" y="74" width="8" height="17" rx="4" fill="'+bodyFill+'"/>'+
        // hand
        '<circle cx="86" cy="72" r="6.5" fill="'+bodyFill+'"/>'+
        // thumb
        '<circle cx="80" cy="74" r="2.6" fill="'+bodyFill+'"/>'+
      '</g>'+
      '</svg>';
  }
  var sendIcon = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 12l16-8-6 8 6 8-16-8z" fill="'+CREAM+'"/></svg>';

  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  var launch = document.createElement('button');
  launch.id = 'roy-launch'; launch.setAttribute('aria-label', 'Chat with Roy');
  launch.innerHTML = royBot(true);
  document.body.appendChild(launch);

  var greet = document.createElement('div');
  greet.id = 'roy-greet';
  greet.innerHTML = '<span class="x">&times;</span>Hi! I\'m Roy \uD83D\uDC4B Need a hand finding the right fit? Ask me anything.';
  document.body.appendChild(greet);

  var panel = document.createElement('div');
  panel.id = 'roy-panel';
  panel.innerHTML =
    '<div class="roy-head">'+
      '<div class="av">'+royBot(false)+'</div>'+
      '<div><div class="ttl">Roy</div><div class="sub"><span class="dot"></span>Your guide at ROI \u00b7 online</div></div>'+
      '<button class="close" aria-label="Close">&times;</button>'+
    '</div>'+
    '<div class="roy-body" id="roy-body"></div>'+
    '<div class="roy-foot">Powered by ROI Development Agency AI</div>'+
    '<div class="roy-input">'+
      '<input type="text" id="roy-text" placeholder="Type a message\u2026" autocomplete="off">'+
      '<button id="roy-send" aria-label="Send">'+sendIcon+'</button>'+
    '</div>';
  document.body.appendChild(panel);

  var body = panel.querySelector('#roy-body');
  var input = panel.querySelector('#roy-text');
  var sendBtn = panel.querySelector('#roy-send');
  var opened = false, busy = false;

  function scrollDown(){ body.scrollTop = body.scrollHeight; }
  function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  // Convert Claude's markdown (**bold**, *italic*, newlines) to safe HTML
  function mdToHtml(s){
    var out = escapeHtml(s);
    out = out.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');      // **bold**
    out = out.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, '$1<i>$2</i>$3'); // *italic*
    out = out.replace(/\n/g, '<br>');
    return out;
  }

  function addUser(text){
    var d=document.createElement('div'); d.className='roy-msg user'; d.textContent=text; body.appendChild(d); scrollDown();
  }
  function addBot(html){
    var d=document.createElement('div'); d.className='roy-msg bot'; d.innerHTML=html; body.appendChild(d); scrollDown();
    return d;
  }
  function typing(){ var t=document.createElement('div'); t.className='roy-typing'; t.innerHTML='<i></i><i></i><i></i>'; body.appendChild(t); scrollDown(); return t; }

  function addChips(labels){
    var wrap=document.createElement('div'); wrap.className='roy-chips';
    labels.forEach(function(l){
      var b=document.createElement('button'); b.className='roy-chip'; b.textContent=l;
      b.onclick=function(){ wrap.remove(); send(l); };
      wrap.appendChild(b);
    });
    body.appendChild(wrap); scrollDown();
  }

  function openCal(){
    if(window.Cal){
      var tmp=document.createElement('button'); tmp.setAttribute('data-cal-link', CAL); tmp.style.display='none';
      document.body.appendChild(tmp); tmp.click(); setTimeout(function(){ tmp.remove(); },100);
    } else { window.open('https://cal.com/'+CAL,'_blank'); }
  }

  function doAction(action){
    if(action === 'diagnostic'){ setTimeout(function(){ window.location.href = DIAGNOSTIC; }, 900); }
    else if(action === 'book'){ setTimeout(openCal, 900); }
  }

  function setBusy(v){ busy=v; sendBtn.disabled=v; }

  function send(text){
    if(busy) return;
    text = (text||'').trim(); if(!text) return;
    addUser(text);
    history.push({ role:'user', content:text });
    saveHistory();
    setBusy(true);
    var t = typing();

    fetch(ENDPOINT, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ messages: history })
    })
    .then(function(r){ return r.json().then(function(j){ return { ok:r.ok, j:j }; }); })
    .then(function(res){
      t.remove(); setBusy(false);
      if(!res.ok || !res.j || (!res.j.reply && !res.j.error)){
        addBot("Sorry \u2014 I had a hiccup connecting just then. You can try again, or reach the team directly:");
        addChips(["Book a call", "Take the Diagnostic"]);
        return;
      }
      if(res.j.error && !res.j.reply){
        addBot("I'm having a little trouble right now. The quickest route is to talk to the team \u2014 want me to open the calendar?");
        addChips(["Yes, book a call", "Take the Diagnostic"]);
        return;
      }
      var reply = res.j.reply || '';
      // render reply with markdown bold/italic + line breaks
      addBot(mdToHtml(reply));
      history.push({ role:'assistant', content: reply });
      saveHistory();
      if(res.j.action) doAction(res.j.action);
    })
    .catch(function(){
      t.remove(); setBusy(false);
      addBot("Hmm, I couldn't reach our system just now. Try again in a moment, or:");
      addChips(["Book a call", "Take the Diagnostic"]);
    });
  }

  function submit(){ var v=input.value; input.value=''; send(v); }

  function openPanel(){
    panel.classList.add('open'); greet.classList.remove('show'); launch.style.display='none';
    if(!opened){
      opened=true;
      if(history.length){
        // returning visitor — replay the conversation so far
        history.forEach(function(m){
          if(m.role === 'user') addUser(m.content);
          else addBot(mdToHtml(m.content));
        });
      } else {
        addBot(OPENING);
        addChips(STARTERS);
      }
    }
    setTimeout(function(){ input.focus(); }, 300);
  }
  function closePanel(){ panel.classList.remove('open'); launch.style.display='block'; }

  launch.onclick = openPanel;
  panel.querySelector('.close').onclick = closePanel;
  sendBtn.onclick = submit;
  input.addEventListener('keydown', function(e){ if(e.key==='Enter') submit(); });
  greet.querySelector('.x').onclick = function(e){ e.stopPropagation(); greet.classList.remove('show'); };
  greet.onclick = openPanel;

  var nudges = [
    "Hey, let's chat \uD83D\uDC4B",
    "Got a marketing question?",
    "Want to see where your marketing stands?",
    "I can help \u2014 ask me anything \uD83D\uDE0A",
    "Curious what we do? Tap to chat."
  ];
  var nudgeIdx = 0;
  setInterval(function(){
    if(!panel.classList.contains('open')){
      launch.classList.add('roy-wave');
      setTimeout(function(){ launch.classList.remove('roy-wave'); }, 2200);
      // show a short rotating nudge with each wave
      greet.innerHTML = '<span class="x">&times;</span>' + nudges[nudgeIdx % nudges.length];
      greet.querySelector('.x').onclick = function(e){ e.stopPropagation(); greet.classList.remove('show'); };
      greet.classList.add('show');
      nudgeIdx++;
      setTimeout(function(){ if(!panel.classList.contains('open')) greet.classList.remove('show'); }, 4500);
    }
  }, 10000);

  if(!sessionStorage.getItem('royGreeted')){
    setTimeout(function(){
      if(!panel.classList.contains('open')){ greet.classList.add('show'); sessionStorage.setItem('royGreeted','1'); }
    }, 3400);
    setTimeout(function(){ greet.classList.remove('show'); }, 13000);
  }
})();
