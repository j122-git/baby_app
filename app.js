
const KEY = "baby-chloe-events-v1";
let state = { events: [], screen: "home", feed: null, selectedId: null };

const icons = {Breastfeed:"🍼", Bottle:"🍼", Wee:"💧", Poo:"💩", "Wee + Poo":"💧💩"};

function uid(){ return "demo_" + Date.now() + "_" + Math.random().toString(36).slice(2,8); }
function isoNow(){ return new Date().toISOString(); }
function fmtTime(iso){ return new Date(iso).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}); }
function fmtDate(iso){ return new Date(iso).toLocaleDateString([], {day:"numeric",month:"short"}); }
function duration(start,end){
  if(!end) return 0;
  return Math.max(0, Math.round((new Date(end)-new Date(start))/1000));
}
function fmtDuration(sec){
  const m=Math.floor(sec/60), s=sec%60;
  if(m<60) return `${m} min`;
  const h=Math.floor(m/60), mm=m%60;
  return `${h}h ${String(mm).padStart(2,"0")}`;
}
function dayName(){
  return new Date().toLocaleDateString([], {weekday:"long",day:"numeric",month:"short"});
}
function save(){ localStorage.setItem(KEY, JSON.stringify(state.events)); }
function load(){
  const raw=localStorage.getItem(KEY);
  if(raw){ state.events=JSON.parse(raw); return; }
  const base=Date.now();
  state.events=[
    {id:uid(),type:"Breastfeed",time:new Date(base-2*3600000).toISOString(),end:new Date(base-2*3600000+18*60000).toISOString(),breast:"Left",notes:""},
    {id:uid(),type:"Wee",time:new Date(base-1.2*3600000).toISOString()},
    {id:uid(),type:"Breastfeed",time:new Date(base-70*60000).toISOString(),end:new Date(base-58*60000).toISOString(),breast:"Right",notes:""},
    {id:uid(),type:"Poo",time:new Date(base-45*60000).toISOString()},
    {id:uid(),type:"Wee + Poo",time:new Date(base-20*60000).toISOString()}
  ];
  save();
}
function todayEvents(){
  const d=new Date(); d.setHours(0,0,0,0);
  return state.events.filter(e=>new Date(e.time)>=d).sort((a,b)=>new Date(b.time)-new Date(a.time));
}
function render(){
  const app=document.querySelector("#app");
  if(state.screen==="home") app.innerHTML=home();
  if(state.screen==="feed") app.innerHTML=feedStart();
  if(state.screen==="feeding") app.innerHTML=feeding();
  if(state.screen==="confirm") app.innerHTML=confirm();
  if(state.screen==="history") app.innerHTML=history();
  if(state.screen==="detail") app.innerHTML=detail();
  bind();
}
function home(){
  const ev=todayEvents().slice(0,8);
  return `<header><div><h1>Chloe</h1><div class="subtitle">${dayName()}</div></div><button class="icon-btn" id="settings">⚙︎</button></header>
  <section class="quick-grid">
    <button class="quick" data-action="feed"><div class="emoji">🍼</div><div class="label">FEED</div></button>
    <button class="quick" data-action="wee"><div class="emoji">💧</div><div class="label">WEE</div></button>
    <button class="quick" data-action="poo"><div class="emoji">💩</div><div class="label">POO</div></button>
    <button class="quick" data-action="both"><div class="emoji">💧💩</div><div class="label">WEE + POO</div></button>
  </section>
  <div class="section-title"><h2>Today</h2><button class="link" id="history">View all</button></div>
  <div class="event-list">${ev.length?ev.map(row).join(""):`<div class="empty">No events yet today.</div>`}</div>
  <div class="status">Demo mode · events are stored only on this device</div>`;
}
function row(e){
  let detail=e.type;
  if(e.type==="Breastfeed"||e.type==="Bottle"){
    const bits=[]; if(e.breast)bits.push(e.breast); if(e.end)bits.push(fmtDuration(duration(e.time,e.end)));
    detail=bits.join(" · ") || "In progress";
  }
  return `<button class="event-row" data-id="${e.id}"><div class="event-icon">${icons[e.type]}</div><div class="event-main"><div class="event-title">${e.type}</div><div class="event-detail">${detail}</div></div><div class="event-time">${fmtTime(e.time)}</div><div class="chevron">›</div></button>`;
}
function feedStart(){
  return `<button class="back" id="back">‹ Back</button><div class="center"><div class="feed-title">Breastfeed</div><div class="question">Which side?</div>
  <button class="choice" data-breast="Left">◯ &nbsp; LEFT</button>
  <button class="choice" data-breast="Right">◯ &nbsp; RIGHT</button>
  <button class="choice" data-breast="Both">◯ &nbsp; BOTH</button>
  <div style="margin-top:22px;color:var(--muted)">Start time</div><div style="font-size:28px;font-weight:700;margin-top:4px">${fmtTime(isoNow())}</div>
  <p class="question" style="margin-top:18px">You can stop the feed when you're done.</p></div>`;
}
function feeding(){
  const e=state.events.find(x=>x.id===state.feed.id);
  const sec=duration(e.time, e.end||new Date().toISOString());
  return `<button class="back" id="back">‹ Back</button><div class="center"><div class="feed-title">Breastfeeding</div><div class="question">${e.breast}</div>
  <div class="timer-ring"><div class="timer">${fmtDuration(sec)}</div><div class="timer-small">started ${fmtTime(e.time)}</div></div>
  <button class="primary" id="stop">■ &nbsp; STOP FEED</button>
  <button class="secondary" id="note">ADD NOTE</button></div>`;
}
function confirm(){
  const e=state.events.find(x=>x.id===state.selectedId);
  if(!e) return home();
  return `<div class="center"><div class="confirm-icon">${icons[e.type]}</div><div class="feed-title">${e.type} recorded</div><div style="font-size:18px">${fmtTime(e.time)}</div>
  <div class="saved">✓ &nbsp; SAVED</div><button class="secondary" id="undo">UNDO</button><button class="secondary" id="home">DONE</button></div>`;
}
function history(){
  const ev=[...state.events].sort((a,b)=>new Date(b.time)-new Date(a.time));
  return `<button class="back" id="back">‹ Back</button><div class="center"><div class="feed-title">Today</div><div class="subtitle">${dayName()}</div></div><div class="event-list" style="margin-top:18px">${ev.length?ev.map(row).join(""):`<div class="empty">No events.</div>`}</div>`;
}
function detail(){
  const e=state.events.find(x=>x.id===state.selectedId);
  if(!e)return home();
  const lines=[
    ["Time",`${fmtDate(e.time)} ${fmtTime(e.time)}`],
    e.end?["End time",fmtTime(e.end)]:null,
    e.end?["Duration",fmtDuration(duration(e.time,e.end))]:null,
    e.breast?["Breast",e.breast]:null,
    e.volume?["Volume",`${e.volume} ml`]:null,
    e.infacol?["Infacol","Yes"]:null,
    e.notes?["Notes",e.notes]:null
  ].filter(Boolean);
  return `<button class="back" id="back">‹ Back</button><div class="detail-card"><div class="detail-icon">${icons[e.type]}</div><div class="detail-name">${e.type}</div>${lines.map(x=>`<div class="detail-line"><span>${x[0]}</span><span>${x[1]}</span></div>`).join("")}<button class="secondary" id="delete">🗑 Delete Event</button></div>`;
}
function addInstant(type){
  const e={id:uid(),type,time:isoNow()};
  state.events.push(e); save(); state.selectedId=e.id; state.screen="confirm"; render();
}
function bind(){
  document.querySelectorAll(".quick").forEach(b=>b.onclick=()=>{
    const a=b.dataset.action;
    if(a==="feed"){state.screen="feed";render();}
    if(a==="wee")addInstant("Wee");
    if(a==="poo")addInstant("Poo");
    if(a==="both")addInstant("Wee + Poo");
  });
  document.querySelectorAll(".event-row").forEach(b=>b.onclick=()=>{state.selectedId=b.dataset.id;state.screen="detail";render();});
  document.querySelectorAll("[data-breast]").forEach(b=>b.onclick=()=>{
    const e={id:uid(),type:"Breastfeed",time:isoNow(),breast:b.dataset.breast};
    state.events.push(e);save();state.feed={id:e.id};state.screen="feeding";render();
  });
  const back=document.querySelector("#back"); if(back)back.onclick=()=>{state.screen="home";render();};
  const hist=document.querySelector("#history"); if(hist)hist.onclick=()=>{state.screen="history";render();};
  const stop=document.querySelector("#stop"); if(stop)stop.onclick=()=>{
    const e=state.events.find(x=>x.id===state.feed.id); if(e){e.end=isoNow();save();state.selectedId=e.id;state.screen="detail";render();}
  };
  const undo=document.querySelector("#undo"); if(undo)undo.onclick=()=>{
    state.events=state.events.filter(e=>e.id!==state.selectedId);save();state.screen="home";render();
  };
  const home=document.querySelector("#home"); if(home)home.onclick=()=>{state.screen="home";render();};
  const del=document.querySelector("#delete"); if(del)del.onclick=()=>{
    if(confirm("Delete this event?")){state.events=state.events.filter(e=>e.id!==state.selectedId);save();state.screen="home";render();}
  };
  const settings=document.querySelector("#settings"); if(settings)settings.onclick=()=>alert("Settings will be added after the Airtable connection is working.");
  const note=document.querySelector("#note"); if(note)note.onclick=()=>alert("Notes will be added in the next iteration.");
  if(state.screen==="feeding") setTimeout(render,1000);
}
load(); render();
