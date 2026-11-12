const PK = 'brilla.projects.v3';
const UK = 'brilla.profile.v3';
const DESIGN_W = 960;
const DESIGN_H = 540;
const FORMAT_TYPES = [
  { id: 'presentacion', name: 'Presentación', icon: '▤', size: '16:9', width: 1920, height: 1080 },
  { id: 'documento', name: 'Documento', icon: '▧', size: 'A4', width: 1240, height: 1754 },
  { id: 'video-dispositivos', name: 'Video para dispositivos', icon: '▣', size: '9:16', width: 1080, height: 1920 },
  { id: 'video-horizontal', name: 'Video horizontal', icon: '▶', size: '16:9', width: 1920, height: 1080 },
  { id: 'post-instagram', name: 'Post para Instagram', icon: '◎', size: '1:1', width: 1080, height: 1080 },
  { id: 'historia', name: 'Tu Historia', icon: '▯', size: '9:16', width: 1080, height: 1920 },
  { id: 'volante', name: 'Volante', icon: '▥', size: 'A5', width: 1480, height: 2100 },
  { id: 'multipagina', name: 'Más de una página', icon: '▦', size: 'Varias', width: 1920, height: 1080 }
];
const TEMPLATE_DATA = [
  { id:'doodle', name:'TU TÍTULO AQUÍ', title:'TU TÍTULO\nAQUÍ', subtitle:'Tu gran idea comienza hoy', author:'Más diseños de Brilla', style:'doodle', bg:'#faf8ff', accent:'#7541d8', category:'Ilustrado', language:'Español', pages:['Portada','Índice','Contenido','Cierre'], mark:'✦' },
  { id:'business', name:'PROYECTO DE NEGOCIO', title:'PROYECTO DE\nNEGOCIO', subtitle:'Una idea con futuro', author:'Brilla Estudio', style:'business', bg:'#effafa', accent:'#0d7f89', category:'Profesional', language:'Español', pages:['Portada','Resumen','Estrategia','Cierre'], mark:'◈' },
  { id:'creative', name:'PROYECTO CREATIVO', title:'PROYECTO\nCREATIVO', subtitle:'Concepto · proceso · resultado', author:'Brilla Estudio', style:'creative', bg:'#fff5ef', accent:'#ef6677', category:'Creativo', language:'Español', pages:['Portada','Inspiración','Proceso','Resultado'], mark:'✿' },
  { id:'love', name:'Nuestra Historia de Amor', title:'Nuestra historia\nde amor', subtitle:'Un camino que elegimos juntos', author:'Más diseños de Brilla', style:'love', bg:'#fff4f6', accent:'#c1437f', category:'Romántico', language:'Español', pages:['Nuestra historia','El comienzo','Nuestros momentos','Para siempre'], mark:'♡' },
  { id:'team', name:'PRESENTACIÓN EN EQUIPO', title:'PRESENTACIÓN\nEN EQUIPO', subtitle:'Lo que hacemos mejor, juntos', author:'Brilla Estudio', style:'team', bg:'#f0f4ff', accent:'#4962c6', category:'Profesional', language:'Español', pages:['Equipo','Quiénes somos','Lo que hacemos','Contacto'], mark:'✧' },
  { id:'marketing', name:'MARKETING 2026', title:'MARKETING\n2026', subtitle:'Ideas que conectan con personas', author:'Brilla Estudio', style:'marketing', bg:'#fff2fa', accent:'#bd4397', category:'Marketing', language:'Español', pages:['Objetivo','Audiencia','Estrategia','Resultados'], mark:'↗' },
  { id:'motion', name:'Ideas en Movimiento', title:'IDEAS EN\nMOVIMIENTO', subtitle:'Una historia que avanza', author:'Más diseños de Brilla', style:'motion', bg:'#effafa', accent:'#168e9d', category:'Creativo', language:'Español', pages:['Idea','Ritmo','Acción','Final'], mark:'➜' },
  { id:'portfolio', name:'Portafolio Personal', title:'PORTAFOLIO\nPERSONAL', subtitle:'Una selección de mi trabajo', author:'Brilla Estudio', style:'portfolio', bg:'#fff8eb', accent:'#d4774e', category:'Creativo', language:'Español', pages:['Hola','Sobre mí','Proyectos','Contacto'], mark:'✹' },
  { id:'project', name:'Propuesta de Proyecto', title:'PROPUESTA DE\nPROYECTO', subtitle:'Plan, equipo y próximos pasos', author:'Brilla Estudio', style:'project', bg:'#f3f5fb', accent:'#48587d', category:'Profesional', language:'Español', pages:['Propuesta','Necesidad','Plan de acción','Presupuesto'], mark:'⌁' },
  { id:'class', name:'Clase de Biología', title:'EXPLORA LA\nBIOLOGÍA', subtitle:'La vida a nuestro alrededor', author:'Más diseños de Brilla', style:'class', bg:'#f5faef', accent:'#4e936b', category:'Educación', language:'Español', pages:['La vida','Ecosistemas','Biodiversidad','Repaso'], mark:'❋' },
  { id:'content', name:'Plan de Contenido', title:'PLAN DE\nCONTENIDO', subtitle:'Publica con intención', author:'Brilla Estudio', style:'content', bg:'#fff7ee', accent:'#d46b5d', category:'Marketing', language:'Español', pages:['Objetivo','Pilares','Calendario','Medición'], mark:'✎' },
  { id:'travel', name:'Viaje por Colombia', title:'COLOMBIA\nPOR DESCUBRIR', subtitle:'Una aventura llena de color', author:'Más diseños de Brilla', style:'travel', bg:'#eef9f8', accent:'#348d9d', category:'Ilustrado', language:'Español', pages:['El viaje','Lugares','Sabores','Recuerdos'], mark:'✈' }
];
const FORMAT_MAP = Object.fromEntries(FORMAT_TYPES.map(x => [x.id, x]));
let user = null;
let projects = read(PK, []);
let current = null;
let selected = null;
let currentPageIndex = 0;
let undoStack = [];
let redoStack = [];
let drag = null;
let currentView = 'home';
let categorySlug = 'presentacion';
let activeEditorTool = 'design';
let globalQuery = '';
let categorySearch = '';
let selectedStyle = 'all';
let selectedLanguage = 'all';
let activeDrawerTemplate = null;
let editorReturnPath = '/';
const APP_BASE_PATH = (()=>{const path=location.pathname;const routeMarker=path.indexOf('/categoria/');if(routeMarker>0)return path.slice(0,routeMarker);if(path.endsWith('/index.html'))return path.slice(0,-11);if(path==='/'||path==='')return '';if(path.endsWith('/'))return path.slice(0,-1);return '';})();

function read(key, fallback) { try { const v=JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; } }
function id() { return Math.random().toString(36).slice(2)+Date.now().toString(36); }
function esc(value) { return String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function notify(message) { const el=document.getElementById('toast'); el.textContent=message; el.hidden=false; clearTimeout(notify.timer); notify.timer=setTimeout(()=>el.hidden=true,3200); }
function save() {
  try { localStorage.setItem(PK, JSON.stringify(projects)); const status=document.getElementById('saveStatus'); if(status) status.textContent='Guardado en este navegador'; }
  catch { notify('El navegador se quedó sin espacio. Reduce el tamaño de las imágenes e inténtalo de nuevo.'); }
}
function normalizeProject(project) {
  if (!Array.isArray(project.pages) || !project.pages.length) {
    project.pages=[{id:id(),name:'Página 1',bg:project.bg||'#ffffff',items:Array.isArray(project.items)?project.items:[]}];
  }
  project.pages.forEach((page,index)=>{page.id=page.id||id();page.name=page.name||`Página ${index+1}`;page.bg=page.bg||project.bg||'#ffffff';page.items=Array.isArray(page.items)?page.items:[];});
  project.width=Number(project.width)||1920;project.height=Number(project.height)||1080;
  return project;
}
function getPage() { return current?.pages?.[currentPageIndex] || null; }
function slugForView(view) { return ({home:'/',templates:'/#/plantillas',projects:'/#/proyectos',favorites:'/#/favoritos',profile:'/#/perfil'})[view] || '/'; }
function setRoute(path, replace=false) { const target=APP_BASE_PATH+path;if(replace) history.replaceState({brilla:true},'',target); else history.pushState({brilla:true},'',target); }
function normalizeRoute(path) { let route=path||'/';if(APP_BASE_PATH&&route.startsWith(APP_BASE_PATH))route=route.slice(APP_BASE_PATH.length)||'/';if(!route.startsWith('/'))route='/'+route;return route; }
function routeFromLocation() {
  const redirected=new URLSearchParams(location.search).get('route');
  if(redirected){const route=normalizeRoute(redirected);history.replaceState({brilla:true},'',APP_BASE_PATH+route);return route;}
  return normalizeRoute(location.pathname)+location.hash;
}
function applyRoute(path, push=false) {
  if(push) setRoute(path);
  const editorMatch=path.match(/^\/editor\/([^/]+)/);
  if(editorMatch){const projectId=decodeURIComponent(editorMatch[1]);if(current?.id!==projectId)openProject(projectId,false);return;}
  if(document.getElementById('editor')?.style.display==='grid'){document.getElementById('editor').style.display='none';document.body.classList.remove('editor-open');current=null;selected=null;}
  if(path.startsWith('/categoria/')) { currentView='category'; categorySlug=decodeURIComponent(path.split('/')[2]||'presentacion'); }
  else {
    const hash=path.includes('#/')?path.split('#/')[1]:'';
    currentView=hash||'home';
    if(!['home','plantillas','proyectos','favoritos','perfil'].includes(currentView)) currentView='home';
    currentView=({plantillas:'templates',proyectos:'projects',favoritos:'favorites',perfil:'profile'})[currentView]||currentView;
    if(currentView==='templates')categorySlug='all';
  }
  renderPage();
}
function navigate(view) {
  currentView=view;
  if(view==='category'){openCategory(categorySlug);return;}
  categorySlug=view==='templates'?'all':categorySlug;
  setRoute(slugForView(view));
  renderPage();
  closeMobileEditorPanel();
}
function openCategory(slug) { categorySlug=slug;currentView='category';globalQuery='';categorySearch='';selectedStyle='all';selectedLanguage='all';setRoute(`/categoria/${encodeURIComponent(slug)}`);renderPage(); }
window.addEventListener('popstate',()=>{const path=normalizeRoute(location.pathname)+location.hash;applyRoute(path,false);});

function renderPage() {
  document.querySelectorAll('.sidebar .nav').forEach(btn=>btn.classList.toggle('active',btn.dataset.page===currentView || (currentView==='category'&&btn.dataset.page==='templates')));
  const content=document.getElementById('content');
  if(currentView==='home') content.innerHTML=renderHome();
  else if(currentView==='category') content.innerHTML=renderCategory(categorySlug);
  else if(currentView==='templates') content.innerHTML=renderAllTemplates();
  else if(currentView==='projects') content.innerHTML=renderProjectPage(false);
  else if(currentView==='favorites') content.innerHTML=renderProjectPage(true);
  else if(currentView==='profile') content.innerHTML=renderProfile();
  if(globalQuery){const search=content.querySelector('[data-template-search]');if(search){search.value=globalQuery;searchTemplates(globalQuery);}}
}
function renderHome() {
  return `<section class="home-hero"><span class="page-kicker">✦ TU ESPACIO PARA CREAR</span><h1>¿Qué vas a diseñar hoy <span>en Brilla?</span></h1><p>Encuentra una idea, elige una plantilla y hazla completamente tuya.</p><label class="hero-search"><span>⌕</span><input id="homeSearch" type="search" placeholder="Busca millones de plantillas, diseños, presentaciones..." onkeydown="if(event.key==='Enter')searchEverywhere(this.value)"><button type="button" onclick="searchEverywhere(document.getElementById('homeSearch').value)">Buscar</button></label><div class="chips">${['Negocio','Video','Redes Sociales','Educación','Marketing'].map((x,i)=>`<button class="chip" type="button" onclick="filterByChip('${esc(x)}')">${['◈','▶','◎','✎','↗'][i]} ${x}</button>`).join('')}</div></section>
    <div class="section-title-row"><div><h2>Explorar las plantillas</h2><p>Un buen formato es el comienzo de una gran idea.</p></div><button class="link-button" type="button" onclick="navigate('templates')">Ver todas las plantillas →</button></div>
    <div class="format-grid">${FORMAT_TYPES.map(formatCard).join('')}</div>
    <div class="section-title-row"><div><h2>Ideas para empezar</h2><p>Plantillas con estilo Brilla, listas para personalizar.</p></div><button class="link-button" type="button" onclick="openCategory('presentacion')">Explorar presentaciones →</button></div>
    <div class="template-grid">${TEMPLATE_DATA.slice(0,4).map(templateCard).join('')}</div>
    ${projects.length?`<div class="section-title-row"><div><h2>Proyectos recientes</h2><p>Tus diseños guardados en este navegador.</p></div><button class="link-button" onclick="navigate('projects')">Ver proyectos →</button></div>${projectCards(projects.slice(0,4))}`:''}`;
}
function formatCard(item) { return `<button class="format-card" type="button" data-format="${item.id}" onclick="openCategory('${item.id}')"><span class="format-preview"><span class="format-icon">${item.icon}</span></span><span class="format-label">${item.name}<small>${item.size}</small></span></button>`; }
function renderCategory(slug) {
  const presentation=slug==='presentacion';
  const title=presentation?'Plantillas de presentación':(FORMAT_MAP[slug]?.name||'Explorar plantillas');
  const list=filteredTemplates();
  return `<div class="category-intro"><span class="page-kicker">PLANTILLAS BRILLA</span><h1>${title}</h1><p class="sub">Elige un diseño, revisa sus páginas y personalízalo a tu manera.</p></div>
    <div class="category-tools"><input data-template-search type="search" placeholder="Buscar plantillas de ${presentation?'presentación':'diseño'}..." value="${esc(categorySearch)}" oninput="searchTemplates(this.value)"><select aria-label="Estilo" onchange="selectedStyle=this.value;renderCategoryOnly()"><option value="all">Estilo · Todos</option>${['Ilustrado','Profesional','Creativo','Romántico','Marketing','Educación'].map(x=>`<option value="${x}" ${selectedStyle===x?'selected':''}>${x}</option>`).join('')}</select><select aria-label="Idioma" onchange="selectedLanguage=this.value;renderCategoryOnly()"><option value="all">Idioma · Todos</option><option value="Español" ${selectedLanguage==='Español'?'selected':''}>Español</option><option value="English" ${selectedLanguage==='English'?'selected':''}>English</option></select></div>
    <div class="template-grid" id="categoryGrid">${presentation?`<button class="template-tile" type="button" onclick="newDesign('presentacion')"><span class="blank-template"><span>＋</span><strong>Crear presentación 16:9<br>desde cero</strong></span><b class="template-name">Lienzo en blanco</b><small class="template-meta">1920 × 1080 px</small></button>`:''}${list.map(templateCard).join('')}</div>${list.length?'':'<div class="empty-state">No encontramos plantillas con esos filtros. Prueba otra búsqueda o estilo.</div>'}`;
}
function renderCategoryOnly(){const c=document.getElementById('content');c.innerHTML=renderCategory(categorySlug);}
function filteredTemplates() {
  return TEMPLATE_DATA.filter(t=>{const q=categorySearch.toLowerCase();const matchesQuery=!q||(t.name+' '+t.title+' '+t.category).toLowerCase().includes(q);const matchesStyle=selectedStyle==='all'||t.category===selectedStyle;const matchesLanguage=selectedLanguage==='all'||t.language===selectedLanguage;return matchesQuery&&matchesStyle&&matchesLanguage;});
}
function renderAllTemplates(){return `<div class="category-intro"><span class="page-kicker">INSPIRACIÓN PARA TUS IDEAS</span><h1>Explora las plantillas</h1><p class="sub">Presentaciones, historias y proyectos para darles tu propio giro.</p></div><div class="category-tools"><input data-template-search type="search" placeholder="Buscar una plantilla..." value="${esc(categorySearch)}" oninput="searchTemplates(this.value)"><select aria-label="Estilo" onchange="selectedStyle=this.value;renderPage()"><option value="all">Todos los estilos</option>${['Ilustrado','Profesional','Creativo','Romántico','Marketing','Educación'].map(x=>`<option value="${x}" ${selectedStyle===x?'selected':''}>${x}</option>`).join('')}</select><select aria-label="Idioma" onchange="selectedLanguage=this.value;renderPage()"><option value="all">Todos los idiomas</option><option value="Español" ${selectedLanguage==='Español'?'selected':''}>Español</option><option value="English" ${selectedLanguage==='English'?'selected':''}>English</option></select></div><div id="tplgrid" class="template-grid">${filteredTemplates().map(templateCard).join('')||'<div class="empty-state">No hay resultados.</div>'}</div>`;}
function previewMarkup(template, compact=false, pageTitle=null) {
  const title=pageTitle||template.title;
  const classes=`template-preview style-${template.style}`;
  return `<div class="${classes}"><span class="preview-eyebrow">${esc(template.category.toUpperCase())} · BRILLA</span><strong class="preview-title">${esc(title)}</strong><span class="preview-mark">${template.mark}</span></div>`;
}
function templateCard(template) { return `<button class="template-tile" type="button" onclick="openTemplateDetails('${template.id}')">${previewMarkup(template)}<span class="personalize-hover">Personalizar</span><b class="template-name">${esc(template.name)}</b><small class="template-meta">Presentación · ${esc(template.category)}</small></button>`; }
function renderProjectPage(favoritesOnly) {
  const list=projects.filter(p=>!favoritesOnly||p.favorite);
  return `<div class="category-intro"><span class="page-kicker">TU ESPACIO</span><h1>${favoritesOnly?'Tus favoritos':'Tus proyectos'}</h1><p class="sub">${list.length} diseño(s) guardados en este navegador.</p></div><div class="category-tools"><input type="search" placeholder="Buscar tus diseños..." oninput="searchProjects(this.value,${favoritesOnly})"><button type="button" class="primary" onclick="newDesign()">＋ Nuevo diseño</button></div><div id="projectgrid">${projectCards(list)}</div>`;
}
function renderProfile() {
  if(!user)return `<h1>Tu perfil</h1><p class="sub">Inicia sesión para administrar tu perfil. Tus diseños locales siguen disponibles en este navegador.</p><button class="primary" onclick="showLogin()">Iniciar sesión</button>`;
  return `<h1>Tu perfil</h1><p class="sub">Administra la información de tu espacio.</p><div class="profile-card"><div class="brand"><span class="brand-mark">${esc((user.name||'B')[0].toUpperCase())}</span><span>${esc(user.name)}</span></div><label for="profileName">Nombre</label><input id="profileName" value="${esc(user.name)}"><label>Correo</label><input value="${esc(user.email)}" disabled><p><button class="primary" onclick="saveProfile()">Guardar cambios</button> <button class="link-button" onclick="logout()">Cerrar sesión</button></p><small class="micro">Tus proyectos se guardan en este dispositivo.</small></div>`;
}
function searchTemplates(query) { categorySearch=query||'';const grid=document.getElementById(currentView==='templates'?'tplgrid':'categoryGrid');if(currentView==='templates'){const el=document.getElementById('tplgrid');if(el)el.innerHTML=filteredTemplates().map(templateCard).join('')||'<div class="empty-state">No hay resultados.</div>';return;}renderCategoryOnly();const input=document.querySelector('[data-template-search]');if(input){input.focus();input.setSelectionRange(input.value.length,input.value.length);} }
function searchProjects(query,favoritesOnly=false) { const q=(query||'').toLowerCase();const list=projects.filter(p=>(!favoritesOnly||p.favorite)&&((p.name+' '+projectPreview(p)).toLowerCase().includes(q)));const el=document.getElementById('projectgrid');if(el)el.innerHTML=projectCards(list); }
function searchEverywhere(query) { globalQuery=(query||'').trim();categorySearch=globalQuery;selectedStyle='all';selectedLanguage='all';currentView='templates';setRoute('/#/plantillas');renderPage(); }
function filterByChip(chip) { globalQuery='';categorySearch='';selectedStyle=chip==='Negocio'?'Profesional':chip==='Educación'?'Educación':chip==='Marketing'||chip==='Redes Sociales'?'Marketing':chip==='Video'?'Creativo':'all';currentView='templates';setRoute('/#/plantillas');renderPage(); }

function projectPreview(project) { const p=normalizeProject(project);const page=p.pages[0];const first=(page.items||[]).find(x=>x.type==='text');return first?.text||p.name||'Tu diseño'; }
function projectCards(list) {
  if(!list.length)return '<div class="empty-state">Aún no tienes diseños. Elige una plantilla o crea un lienzo en blanco para comenzar ✦</div>';
  return `<div class="template-grid">${list.map(p=>{normalizeProject(p);const page=p.pages[0];return `<article class="template-tile" onclick="openProject('${p.id}')"><button class="star" type="button" aria-label="${p.favorite?'Quitar de':'Añadir a'} favoritos" onclick="event.stopPropagation();toggleFavorite('${p.id}')">${p.favorite?'★':'☆'}</button><div class="template-preview" style="height:145px;background:${esc(page.bg)};color:${esc(p.accent||'#6338bd')}"><strong class="preview-title">${esc(projectPreview(p))}</strong><span class="preview-mark">✦</span></div><b class="template-name">${esc(p.name)}</b><small class="template-meta">${p.pages.length} página(s) · ${new Date(p.updated||Date.now()).toLocaleDateString('es-CO')}</small><div class="project-actions"><button type="button" onclick="event.stopPropagation();duplicateProject('${p.id}')">Duplicar</button><button type="button" onclick="event.stopPropagation();deleteProject('${p.id}')">Eliminar</button></div></article>`;}).join('')}</div>`;
}
function createDeckPages(template) {
  const title=template.title, subtitle=template.subtitle, accent=template.accent;
  const page1={id:id(),name:template.pages[0]||'Portada',bg:template.bg,items:[
    {id:id(),type:'text',text:title,x:90,y:135,w:555,h:205,color:accent,size:58,bold:true,font:'Poppins',align:'left'},
    {id:id(),type:'text',text:subtitle,x:95,y:350,w:560,h:54,color:'#514960',size:21,bold:false,font:'Inter',align:'left'},
    {id:id(),type:'text',text:template.mark,x:710,y:135,w:140,h:130,color:accent,size:96,bold:false,font:'Poppins',align:'center'},
    {id:id(),type:'text',text:'➜',x:775,y:343,w:115,h:80,color:accent,size:57,bold:false,font:'Poppins',align:'center'},
    {id:id(),type:'text',text:'BRILLA  ·  CREA A TU MANERA',x:95,y:465,w:520,h:30,color:accent,size:14,bold:true,font:'Montserrat',align:'left'}
  ]};
  const page2={id:id(),name:template.pages[1]||'Índice',bg:'#ffffff',items:[
    {id:id(),type:'text',text:'EN ESTA PRESENTACIÓN',x:70,y:52,w:700,h:64,color:accent,size:35,bold:true,font:'Poppins',align:'left'},
    {id:id(),type:'text',text:'01   La idea\n02   Lo que nos inspira\n03   Próximos pasos',x:92,y:160,w:620,h:245,color:'#26223a',size:30,bold:false,font:'Inter',align:'left'},
    {id:id(),type:'text',text:'💡',x:715,y:170,w:135,h:130,color:accent,size:80,bold:false,font:'Poppins',align:'center'},
    {id:id(),type:'text',text:'✦',x:785,y:360,w:65,h:65,color:accent,size:40,bold:false,font:'Poppins',align:'center'}
  ]};
  const page3={id:id(),name:template.pages[2]||'Contenido',bg:template.bg,items:[
    {id:id(),type:'text',text:'UNA IDEA\nSE CONSTRUYE',x:70,y:58,w:520,h:155,color:accent,size:40,bold:true,font:'Poppins',align:'left'},
    {id:id(),type:'text',text:'Escribe aquí las ideas principales de tu proyecto. Puedes cambiar el texto, mover cada elemento y agregar tus propias imágenes.',x:80,y:255,w:580,h:140,color:'#464153',size:22,bold:false,font:'Inter',align:'left'},
    {id:id(),type:'text',text:'📚',x:686,y:185,w:160,h:140,color:accent,size:82,bold:false,font:'Poppins',align:'center'},
    {id:id(),type:'circle',x:800,y:65,w:75,h:75,color:accent}
  ]};
  const page4={id:id(),name:template.pages[3]||'Cierre',bg:'#fff',items:[
    {id:id(),type:'text',text:'GRACIAS',x:140,y:130,w:680,h:130,color:accent,size:66,bold:true,font:'Poppins',align:'center'},
    {id:id(),type:'text',text:'¿Preguntas?  ·  Hablemos de tu idea',x:160,y:300,w:640,h:65,color:'#544d64',size:22,bold:false,font:'Inter',align:'center'},
    {id:id(),type:'text',text:'✦  ✧  ✦',x:310,y:405,w:340,h:65,color:accent,size:34,bold:false,font:'Poppins',align:'center'}
  ]};
  return [page1,page2,page3,page4];
}
function createTemplateProject(templateId) {
  const template=TEMPLATE_DATA.find(x=>x.id===templateId);if(!template)return;
  const project={id:id(),name:template.name,templateId:template.id,format:'presentacion',width:1920,height:1080,accent:template.accent,updated:Date.now(),favorite:false,pages:createDeckPages(template)};
  projects.unshift(project);current=project;save();closeTemplateDetails();openProject(project.id);
}
function newDesign(formatId='presentacion') {
  const format=FORMAT_MAP[formatId]||FORMAT_MAP.presentacion;
  const page={id:id(),name:'Página 1',bg:'#ffffff',items:[]};
  const project={id:id(),name:'Diseño sin título',format:formatId,width:format.width,height:format.height,updated:Date.now(),favorite:false,pages:[page]};
  projects.unshift(project);current=project;save();openProject(project.id);
}
function blank(){newDesign('presentacion');}
function openTemplateDetails(templateId) {
  const template=TEMPLATE_DATA.find(x=>x.id===templateId);if(!template)return;
  activeDrawerTemplate=template;
  const similar=TEMPLATE_DATA.filter(x=>x.id!==template.id&&x.category===template.category).slice(0,3);
  const pages=template.pages.map((label,i)=>`<button class="slide-thumb ${i===0?'active':''}" type="button" onclick="previewDrawerPage('${template.id}',${i})">${previewMarkup(template,true,i===0?template.title:label.toUpperCase())}<small>${esc(label)}</small></button>`).join('');
  document.getElementById('drawerContent').innerHTML=`<div id="drawerLargePreview" class="drawer-preview">${previewMarkup(template)}</div><h2 id="drawerTitle" class="drawer-title">${esc(template.name==='TU TÍTULO AQUÍ'?'Presentación Ilustrado Morado Blanco':template.name)}</h2><div class="drawer-meta"><span><b>Tamaño:</b> Presentación (16:9) · 1920 × 1080 px</span><span><b>Autor:</b> Por ${esc(template.author)}</span><span><b>Estilo:</b> ${esc(template.category)}</span></div><button class="drawer-cta" type="button" onclick="createTemplateProject('${template.id}')">Personalizar esta plantilla</button><h3 class="drawer-section-title">Páginas de esta plantilla</h3><div class="slide-carousel">${pages}</div><h3 class="drawer-section-title">Más contenido similar</h3><div class="similar-grid">${(similar.length?similar:TEMPLATE_DATA.filter(x=>x.id!==template.id).slice(0,2)).map(templateCard).join('')}</div>`;
  document.getElementById('templateDrawer').classList.add('show');document.body.classList.add('drawer-open');
}
function previewDrawerPage(templateId,index){const template=TEMPLATE_DATA.find(x=>x.id===templateId);if(!template)return;const preview=document.getElementById('drawerLargePreview');if(preview)preview.innerHTML=previewMarkup(template,false,index===0?template.title:template.pages[index].toUpperCase());document.querySelectorAll('.slide-thumb').forEach((button,i)=>button.classList.toggle('active',i===index));}
function closeTemplateDetails(){document.getElementById('templateDrawer').classList.remove('show');document.body.classList.remove('drawer-open');activeDrawerTemplate=null;}

function openProject(projectId,pushRoute=true) {
  const found=projects.find(p=>p.id===projectId);if(!found)return;
  if(pushRoute){editorReturnPath=normalizeRoute(location.pathname)+location.hash;if(editorReturnPath.startsWith('/editor/'))editorReturnPath='/#/'+(currentView==='projects'?'proyectos':'home');setRoute(`/editor/${encodeURIComponent(projectId)}`);}
  current=normalizeProject(found);currentPageIndex=0;selected=null;undoStack=[];redoStack=[];activeEditorTool='';document.getElementById('editorPanel').classList.remove('open');
  document.getElementById('designName').value=current.name;document.getElementById('editor').style.display='grid';document.body.classList.add('editor-open');openEditorTool('design');renderEditor();
}
function closeEditor(){document.getElementById('editor').style.display='none';document.body.classList.remove('editor-open');current=null;selected=null;const target=editorReturnPath||'/';history.replaceState({brilla:true},'',APP_BASE_PATH+target);applyRoute(target,false);}
function snapshot(){if(!current)return;undoStack.push(JSON.stringify(current));if(undoStack.length>40)undoStack.shift();redoStack=[];}
function commit(){if(!current)return;current.updated=Date.now();projects[projects.findIndex(p=>p.id===current.id)]=current;save();renderEditor();}
function rename(value){if(!current)return;current.name=(value||'').trim()||'Diseño sin título';document.getElementById('designName').value=current.name;commit();}
function undo(){if(!undoStack.length||!current)return;redoStack.push(JSON.stringify(current));current=JSON.parse(undoStack.pop());currentPageIndex=Math.min(currentPageIndex,current.pages.length-1);commit();}
function redo(){if(!redoStack.length||!current)return;undoStack.push(JSON.stringify(current));current=JSON.parse(redoStack.pop());currentPageIndex=Math.min(currentPageIndex,current.pages.length-1);commit();}
function addPage(){if(!current)return;snapshot();current.pages.push({id:id(),name:`Página ${current.pages.length+1}`,bg:'#ffffff',items:[]});currentPageIndex=current.pages.length-1;selected=null;commit();}
function selectPage(index){if(!current||index<0||index>=current.pages.length)return;currentPageIndex=index;selected=null;renderEditor();}
function addText(preset='title') {
  if(!current)return;const data={title:{text:'Escribe tu título',size:44,bold:true,w:620,h:105},subtitle:{text:'Añade un subtítulo',size:25,bold:false,w:610,h:75},body:{text:'Escribe aquí tu texto',size:19,bold:false,w:560,h:125}}[preset];
  snapshot();const item={id:id(),type:'text',text:data.text,x:170,y:preset==='title'?100:preset==='subtitle'?220:300,w:data.w,h:data.h,color:'#28233a',size:data.size,bold:data.bold,font:'Poppins',align:'left'};getPage().items.push(item);selected=item.id;commit();
}
function addShape(type='rect',color='#ed4d9a'){if(!current)return;snapshot();const item={id:id(),type:type==='circle'?'circle':'rect',x:380,y:205,w:170,h:130,color};getPage().items.push(item);selected=item.id;commit();}
function addDoodle(glyph='✦'){if(!current)return;snapshot();const item={id:id(),type:'text',text:glyph,x:400,y:180,w:120,h:120,color:'#7541d8',size:66,bold:false,font:'Poppins',align:'center'};getPage().items.push(item);selected=item.id;commit();}
function changeBackground(color){if(!current)return;snapshot();getPage().bg=color;commit();}
function updateSelected(field,value){if(!current||!selected)return;const item=getPage().items.find(x=>x.id===selected);if(!item)return;snapshot();item[field]=field==='size'?Math.max(8,Math.min(160,Number(value)||24)):value;commit();}
function toggleBold(){const item=getPage()?.items.find(x=>x.id===selected);if(item?.type==='text')updateSelected('bold',!item.bold);}
function selectItem(itemId){selected=itemId;document.querySelectorAll('.item').forEach(el=>el.classList.toggle('sel',el.dataset.id===itemId));renderTextToolbar();}
function deleteSelected(){if(!current||!selected)return;snapshot();getPage().items=getPage().items.filter(x=>x.id!==selected);selected=null;commit();}
function addImage(file){if(!file||!current)return;if(!file.type.startsWith('image/'))return notify('Elige un archivo de imagen.');const reader=new FileReader();reader.onload=()=>{const image=new Image();image.onload=()=>{const ratio=Math.min(1,1600/Math.max(image.width,image.height));const canvas=document.createElement('canvas');canvas.width=Math.round(image.width*ratio);canvas.height=Math.round(image.height*ratio);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);snapshot();const item={id:id(),type:'image',src:canvas.toDataURL('image/jpeg',.86),x:300,y:145,w:Math.min(360,canvas.width/2),h:Math.min(260,canvas.height/2),color:'#fff'};getPage().items.push(item);selected=item.id;commit();};image.src=reader.result;};reader.readAsDataURL(file);}
function renderEditor(){if(!current)return;normalizeProject(current);const page=getPage();const stage=document.getElementById('stage');const stageScroll=document.querySelector('.stage-scroll');if(stageScroll){const area=stageScroll.getBoundingClientRect();const ratio=current.width/current.height;const fitWidth=Math.min(1120,area.width-40,(area.height-24)*ratio);stage.style.width=Math.max(220,fitWidth)+'px';stage.style.aspectRatio=`${current.width} / ${current.height}`;}stage.style.background=page.bg;stage.innerHTML='';page.items.forEach(item=>{const el=document.createElement('div');el.className='item'+(selected===item.id?' sel':'')+(item.type==='text'?' item-text':'');el.dataset.id=item.id;el.style.left=(item.x/DESIGN_W*100)+'%';el.style.top=(item.y/DESIGN_H*100)+'%';el.style.width=(item.w/DESIGN_W*100)+'%';el.style.height=(item.h/DESIGN_H*100)+'%';if(item.type==='text'){el.textContent=item.text;el.style.color=item.color||'#222';el.style.fontSize=(item.size/DESIGN_W*100)+'cqw';el.style.fontFamily=`${item.font||'Poppins'}, sans-serif`;el.style.fontWeight=item.bold?'750':'500';el.style.textAlign=item.align||'center';}else if(item.type==='image'){const img=document.createElement('img');img.src=item.src;img.alt='Imagen subida';el.append(img);}else{el.style.background=item.color||'#ed4d9a';el.style.borderRadius=item.type==='circle'?'50%':'14px';}
    el.onpointerdown=e=>{if(e.target.classList.contains('resize-knob'))return;e.stopPropagation();selected=item.id;renderTextToolbar();document.querySelectorAll('.item').forEach(node=>node.classList.toggle('sel',node.dataset.id===item.id));drag={id:item.id,mode:'move',px:e.clientX,py:e.clientY,x:item.x,y:item.y,w:item.w,h:item.h,scale:stage.getBoundingClientRect().width/DESIGN_W,moved:false};};
    if(item.type==='text')el.ondblclick=()=>{el.contentEditable='true';el.focus();const range=document.createRange();range.selectNodeContents(el);window.getSelection().removeAllRanges();window.getSelection().addRange(range);el.onblur=()=>{if(el.contentEditable!=='true')return;snapshot();item.text=el.innerText;el.contentEditable='false';commit();};};
    if(selected===item.id){const knob=document.createElement('span');knob.className='resize-knob';knob.title='Arrastra para cambiar tamaño';knob.onpointerdown=e=>{e.stopPropagation();drag={id:item.id,mode:'resize',px:e.clientX,py:e.clientY,x:item.x,y:item.y,w:item.w,h:item.h,scale:stage.getBoundingClientRect().width/DESIGN_W};};el.append(knob);}
    stage.append(el);
  });
  stage.onclick=e=>{if(e.target===stage){selected=null;renderEditor();}};
  document.getElementById('designName').value=current.name;document.getElementById('pageCounter').textContent=`${currentPageIndex+1} / ${current.pages.length}`;renderPageStrip();renderTextToolbar();renderEditorPanel();
}
document.addEventListener('pointermove',e=>{if(!drag||!current)return;const page=getPage();const item=page.items.find(x=>x.id===drag.id);if(!item)return;const dx=(e.clientX-drag.px)/drag.scale,dy=(e.clientY-drag.py)/drag.scale;if(Math.abs(dx)+Math.abs(dy)>1)drag.moved=true;if(drag.mode==='resize'){item.w=Math.max(28,Math.min(DESIGN_W-item.x,drag.w+dx));item.h=Math.max(28,Math.min(DESIGN_H-item.y,drag.h+dy));}else{item.x=Math.max(0,Math.min(DESIGN_W-item.w,drag.x+dx));item.y=Math.max(0,Math.min(DESIGN_H-item.h,drag.y+dy));}const el=document.querySelector(`.item[data-id="${item.id}"]`);if(el){el.style.left=(item.x/DESIGN_W*100)+'%';el.style.top=(item.y/DESIGN_H*100)+'%';el.style.width=(item.w/DESIGN_W*100)+'%';el.style.height=(item.h/DESIGN_H*100)+'%';}});
document.addEventListener('pointerup',()=>{if(drag){const changed=drag.moved;drag=null;if(changed)commit();}});
function renderPageStrip(){const strip=document.getElementById('pageStrip');if(!current||!strip)return;strip.innerHTML=current.pages.map((page,index)=>{const first=page.items.find(x=>x.type==='text')?.text||page.name;return `<button class="page-card ${index===currentPageIndex?'active':''}" type="button" onclick="selectPage(${index})"><span class="page-mini" style="background:${esc(page.bg)};color:${esc(current.accent||'#5d36ba')}">${esc(first)}</span><span class="page-name">${esc(page.name)}</span></button>`;}).join('');}
function renderTextToolbar(){const toolbar=document.getElementById('textToolbar');const item=getPage()?.items.find(x=>x.id===selected);if(!item){toolbar.hidden=true;toolbar.innerHTML='';return;}toolbar.hidden=false;if(item.type!=='text'){toolbar.innerHTML=`<span class="toolbar-label">Elemento</span><input aria-label="Color" type="color" value="${esc(item.color||'#7541d8')}" onchange="updateSelected('color',this.value)"><button class="toolbar-btn" type="button" onclick="deleteSelected()" title="Eliminar">⌫</button>`;}else{toolbar.innerHTML=`<select aria-label="Fuente" onchange="updateSelected('font',this.value)">${['Poppins','Inter','Montserrat','Georgia','Verdana','Impact'].map(font=>`<option ${item.font===font?'selected':''}>${font}</option>`).join('')}</select><input aria-label="Tamaño" type="number" min="8" max="160" value="${item.size}" onchange="updateSelected('size',this.value)"><input aria-label="Color del texto" type="color" value="${esc(item.color||'#28233a')}" onchange="updateSelected('color',this.value)"><button class="toolbar-btn ${item.bold?'active':''}" type="button" onclick="toggleBold()" title="Negrita">B</button><select aria-label="Alineación" onchange="updateSelected('align',this.value)"><option value="left" ${item.align==='left'?'selected':''}>Izquierda</option><option value="center" ${(!item.align||item.align==='center')?'selected':''}>Centro</option><option value="right" ${item.align==='right'?'selected':''}>Derecha</option></select><button class="toolbar-btn" type="button" onclick="deleteSelected()" title="Eliminar">⌫</button>`;}requestAnimationFrame(()=>{const box=document.querySelector('.item.sel')?.getBoundingClientRect();if(!box||toolbar.hidden)return;const bar=toolbar.getBoundingClientRect();toolbar.style.left=Math.max(8,Math.min(window.innerWidth-bar.width-8,box.left+box.width/2-bar.width/2))+'px';toolbar.style.top=Math.max(62,box.top-bar.height-10)+'px';});}
function renderEditorPanel() {
  const panel=document.getElementById('editorPanel');if(!panel)return;
  if(activeEditorTool==='design')panel.innerHTML=`<h2 class="panel-title">Diseño</h2><p class="panel-subtitle">Elige una plantilla para agregar una página nueva a tu presentación.</p><input class="panel-search" placeholder="Buscar diseños..." oninput="renderPanelTemplates(this.value)"><div id="panelTemplates" class="panel-grid">${TEMPLATE_DATA.slice(0,6).map(panelTemplateCard).join('')}</div>`;
  else if(activeEditorTool==='elements')panel.innerHTML=`<h2 class="panel-title">Elementos</h2><p class="panel-subtitle">Añade formas e ilustraciones movibles a tu página.</p><input class="panel-search" placeholder="Busca elementos de presentación..." oninput="filterElementCards(this.value)"><div class="element-categories"><button class="chip active" onclick="filterElementGroup('all')">Todo</button><button class="chip" onclick="filterElementGroup('shape')">Formas</button><button class="chip" onclick="filterElementGroup('doodle')">Doodles</button></div><div id="elementGrid" class="panel-grid">${elementCards()}</div>`;
  else if(activeEditorTool==='text')panel.innerHTML=`<h2 class="panel-title">Texto</h2><p class="panel-subtitle">Añade texto y cámbialo directamente en el lienzo.</p><button class="panel-action" onclick="addText('title')"><b style="font-size:17px">Añadir un título</b></button><button class="panel-action" onclick="addText('subtitle')"><b style="font-size:14px">Añadir un subtítulo</b></button><button class="panel-action" onclick="addText('body')">Añadir un poco de texto</button><p class="panel-subtitle">Fuentes populares</p><div class="font-chips">${['Poppins','Inter','Montserrat'].map(font=>`<button class="chip" onclick="addTextWithFont('${font}')">${font}</button>`).join('')}</div>`;
  else if(activeEditorTool==='brand')panel.innerHTML=`<h2 class="panel-title">Marca</h2><p class="panel-subtitle">Define los colores de tu proyecto Brilla.</p><b class="panel-small-title">Paleta Brilla</b><div class="panel-color-row">${['#7441df','#ef4f9a','#06a9c8','#f59e0b','#17142b','#ffffff'].map(color=>`<button class="swatch" style="background:${color}" title="${color}" onclick="applyBrandColor('${color}')"></button>`).join('')}</div><label class="panel-subtitle">Fondo de página</label><input type="color" value="${getPage()?.bg||'#ffffff'}" onchange="changeBackground(this.value)"><button class="panel-action" onclick="addText('title')">＋ Agregar nombre de marca</button>`;
  else if(activeEditorTool==='uploads')panel.innerHTML=`<h2 class="panel-title">Subidos</h2><p class="panel-subtitle">Las imágenes que agregues se guardan dentro de este diseño.</p><button class="primary" style="width:100%" onclick="document.getElementById('imageFile').click()">↑ Subir una imagen</button><p class="panel-subtitle" style="margin-top:14px">Consejo: usa imágenes ligeras para que el navegador pueda guardar el proyecto.</p><div class="upload-list">${(getPage()?.items||[]).filter(x=>x.type==='image').map(x=>`<button class="panel-action" onclick="selectItem('${x.id}')">Imagen del diseño</button>`).join('')}</div>`;
  else if(activeEditorTool==='tools')panel.innerHTML=`<h2 class="panel-title">Herramientas</h2><p class="panel-subtitle">Acciones rápidas para el lienzo.</p><button class="panel-action" onclick="addText('title')">T　Insertar texto</button><button class="panel-action" onclick="addShape('rect')">▱　Insertar forma</button><button class="panel-action" onclick="addDoodle('➜')">➜　Insertar flecha</button><button class="panel-action" onclick="addDoodle('💡')">💡　Insertar bombillo</button><button class="panel-action" onclick="document.getElementById('imageFile').click()">↑　Subir imagen</button><button class="panel-action" onclick="resizeDesign()">◫　Cambiar tamaño del diseño</button>`;
  else if(activeEditorTool==='projects')panel.innerHTML=`<h2 class="panel-title">Proyectos</h2><p class="panel-subtitle">Diseños guardados localmente.</p>${projects.filter(p=>p.id!==current?.id).slice(0,8).map(p=>`<button class="panel-action" onclick="openProject('${p.id}')">▤　${esc(p.name)}</button>`).join('')||'<div class="empty-state">Todavía no hay otros proyectos.</div>'}<button class="panel-action" onclick="newDesign()">＋　Crear un diseño</button>`;
  else panel.innerHTML=`<h2 class="panel-title">Apps</h2><p class="panel-subtitle">Pequeños recursos para probar ideas.</p><button class="panel-action" onclick="applyPalette(['#7441df','#ef4f9a','#06a9c8'])">🎨　Paleta Brilla</button><button class="panel-action" onclick="addDoodle('✦')">✦　Destello</button><button class="panel-action" onclick="addDoodle('❋')">❋　Flor ilustrada</button><button class="panel-action" onclick="addDoodle('📚')">📚　Libro</button>`;
  panel.classList.toggle('open',window.matchMedia('(max-width:560px)').matches);
}
function panelTemplateCard(template){return `<button class="panel-card" onclick="addTemplatePage('${template.id}')">${previewMarkup(template)}<b>${esc(template.name)}</b></button>`;}
function renderPanelTemplates(query=''){const el=document.getElementById('panelTemplates');if(!el)return;el.innerHTML=TEMPLATE_DATA.filter(t=>(t.name+t.category).toLowerCase().includes(query.toLowerCase())).map(panelTemplateCard).join('')||'<p class="panel-subtitle">No hay resultados.</p>';}
function addTemplatePage(templateId){const template=TEMPLATE_DATA.find(x=>x.id===templateId);if(!template)return;snapshot();const page=createDeckPages(template)[0];page.id=id();page.name=template.pages[0]||'Portada';current.pages.push(page);currentPageIndex=current.pages.length-1;selected=null;commit();}
function elementCards(){return [{label:'Círculo',glyph:'●',group:'shape',action:"addShape('circle')"},{label:'Rectángulo',glyph:'▰',group:'shape',action:"addShape('rect')"},{label:'Flecha',glyph:'➜',group:'doodle',action:"addDoodle('➜')"},{label:'Bombillo',glyph:'💡',group:'doodle',action:"addDoodle('💡')"},{label:'Libro',glyph:'📚',group:'doodle',action:"addDoodle('📚')"},{label:'Estrella',glyph:'✦',group:'doodle',action:"addDoodle('✦')"},{label:'Flor',glyph:'❋',group:'doodle',action:"addDoodle('❋')"},{label:'Corazón',glyph:'♡',group:'doodle',action:"addDoodle('♡')"}].map(x=>`<button class="panel-card element-card" data-group="${x.group}" onclick="${x.action}"><span class="element-glyph">${x.glyph}</span><b>${x.label}</b></button>`).join('');}
function filterElementCards(query){const q=query.toLowerCase();document.querySelectorAll('.element-card').forEach(card=>card.hidden=!card.textContent.toLowerCase().includes(q));}
function filterElementGroup(group){document.querySelectorAll('.element-card').forEach(card=>card.hidden=group!=='all'&&card.dataset.group!==group);}
function addTextWithFont(font){addText('title');const item=getPage().items.find(x=>x.id===selected);item.font=font;save();renderEditor();}
function openEditorTool(tool){const panel=document.getElementById('editorPanel');const mobile=window.matchMedia('(max-width:560px)').matches;if(mobile&&activeEditorTool===tool&&panel.classList.contains('open')){panel.classList.remove('open');return;}activeEditorTool=tool;document.querySelectorAll('.editor-tool').forEach(button=>button.classList.toggle('active',button.dataset.tool===tool));renderEditorPanel();}
function closeMobileEditorPanel(){if(window.matchMedia('(max-width:560px)').matches)document.getElementById('editorPanel')?.classList.remove('open');}
function applyBrandColor(color){if(!current)return;current.accent=color;const rgb=color.match(/[0-9a-f]{2}/gi)?.map(x=>parseInt(x,16))||[255,255,255];const pastel='#'+rgb.map(c=>Math.round(c*.12+255*.88).toString(16).padStart(2,'0')).join('');changeBackground(pastel);}
function applyPalette(colors){if(!current)return;current.accent=colors[0];changeBackground('#faf7ff');}
function toggleFileMenu(){const menu=document.getElementById('fileMenu');menu.hidden=!menu.hidden;}
function editDesignDetails(){const name=prompt('Nombre del diseño',current?.name||'');if(name!==null)rename(name);}
function resizeDesign(){if(!current)return;const sizes={'Presentación 16:9':'1920,1080','Post cuadrado':'1080,1080','Historia vertical':'1080,1920','Documento A4':'1240,1754'};const answer=prompt('Escribe el nuevo tamaño en píxeles como ancho,alto. Ejemplo: 1920,1080',`${current.width},${current.height}`);if(!answer)return;const parts=answer.split(',').map(x=>Number(x.trim()));if(parts.length!==2||parts.some(x=>!Number.isFinite(x)||x<100||x>10000))return notify('Usa un tamaño válido, por ejemplo 1920,1080.');snapshot();current.width=parts[0];current.height=parts[1];notify('Tamaño actualizado. El contenido conserva su posición.');commit();}
function shareDesign(){document.getElementById('shareDialog').classList.add('show');document.body.classList.add('auth-open');}
function closeShareDialog(){document.getElementById('shareDialog').classList.remove('show');document.body.classList.remove('auth-open');}
function downloadProjectBackup(){if(!current)return;const blob=new Blob([JSON.stringify(normalizeProject(current),null,2)],{type:'application/json'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=(current.name||'brilla').replace(/[^\p{L}\p{N}_-]+/gu,'-')+'.brilla.json';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1500);closeShareDialog();}
function handleUserButton(){if(user)navigate('profile');else showLogin();}
function showLogin(){document.body.classList.add('auth-open');document.getElementById('login').classList.add('show');}
function closeLogin(){document.getElementById('login').classList.remove('show');document.body.classList.remove('auth-open');window.scrollTo(0,0);}
function enter(){const name=document.getElementById('name').value.trim(),email=document.getElementById('email').value.trim();if(!name||!email.includes('@'))return notify('Escribe tu nombre y un correo válido.');user={name,email};localStorage.setItem(UK,JSON.stringify(user));start();}
function start(knownUser){if(knownUser)user={name:knownUser.user_metadata?.full_name||knownUser.email?.split('@')[0]||'Brilla',email:knownUser.email||''};else if(!user)user=read(UK,null);projects=read(PK,[]);document.getElementById('landing').hidden=true;document.getElementById('login').classList.remove('show');document.body.classList.remove('auth-open');document.getElementById('app').style.display='block';document.getElementById('userbtn').textContent=user?`◉ ${user.name.split(' ')[0]}`:'Iniciar sesión';navigate('home');}
function saveProfile(){const name=document.getElementById('profileName')?.value.trim();if(!name)return notify('Escribe tu nombre.');user.name=name;localStorage.setItem(UK,JSON.stringify(user));document.getElementById('userbtn').textContent=`◉ ${name.split(' ')[0]}`;renderPage();notify('Perfil actualizado.');}
function logout(){localStorage.removeItem(UK);user=null;document.getElementById('userbtn').textContent='Iniciar sesión';navigate('home');}
function toggleFavorite(projectId){const project=projects.find(p=>p.id===projectId);if(!project)return;project.favorite=!project.favorite;save();renderPage();}
function duplicateProject(projectId){const project=projects.find(p=>p.id===projectId);if(!project)return;const copy=JSON.parse(JSON.stringify(project));copy.id=id();copy.name+=' copia';copy.updated=Date.now();copy.favorite=false;projects.unshift(copy);save();renderPage();notify('Copia creada.');}
function deleteProject(projectId){if(!confirm('¿Eliminar este diseño?'))return;projects=projects.filter(p=>p.id!==projectId);save();renderPage();}

function drawDesign(page=getPage()) {
  const width=current?.width||1920,height=current?.height||1080;const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.fillStyle=page.bg||'#ffffff';ctx.fillRect(0,0,width,height);const sx=width/DESIGN_W,sy=height/DESIGN_H;
  const pending=[];
  for(const item of page.items){if(item.type==='text'){ctx.fillStyle=item.color||'#222';ctx.textAlign=item.align||'center';ctx.textBaseline='middle';ctx.font=`${item.bold?'700':'500'} ${item.size*sx}px ${item.font||'Poppins'}, sans-serif`;const lines=String(item.text||'').split('\n');const lineHeight=item.size*sx*1.12;const y0=(item.y+item.h/2)*sy-(lines.length-1)*lineHeight/2;const x=item.x*sx+(item.align==='left'?0:item.align==='right'?item.w*sx/2:item.w*sx/2);for(let i=0;i<lines.length;i++)ctx.fillText(lines[i],x,y0+i*lineHeight,item.w*sx);}
    else if(item.type==='image'){pending.push(new Promise(resolve=>{const image=new Image();image.onload=()=>{ctx.drawImage(image,item.x*sx,item.y*sy,item.w*sx,item.h*sy);resolve();};image.onerror=resolve;image.src=item.src;}));}
    else{ctx.fillStyle=item.color||'#ed4d9a';if(item.type==='circle'){ctx.beginPath();ctx.ellipse((item.x+item.w/2)*sx,(item.y+item.h/2)*sy,item.w*sx/2,item.h*sy/2,0,0,Math.PI*2);ctx.fill();}else{ctx.beginPath();ctx.roundRect(item.x*sx,item.y*sy,item.w*sx,item.h*sy,Math.min(18*sx,item.w*sx/8));ctx.fill();}}
  }
  return Promise.all(pending).then(()=>canvas);
}
function downloadRaster(mime){if(!current)return;drawDesign().then(canvas=>canvas.toBlob(blob=>{if(!blob)return notify('No se pudo crear la imagen.');const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=(current.name||'brilla')+(mime==='image/jpeg'?'.jpg':'.png');link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1800);notify('Diseño descargado.');},mime,mime==='image/jpeg'?.92:undefined));}
function downloadPNG(){downloadRaster('image/png');}
function downloadJPG(){downloadRaster('image/jpeg');}
function downloadPDF(){const printWindow=window.open('about:blank','_blank');if(!printWindow)return notify('Permite las ventanas emergentes para imprimir como PDF.');const orientation=current.width>current.height?'landscape':'portrait';drawDesign().then(canvas=>{printWindow.document.write(`<html><head><title>${esc(current.name)}</title><style>@page{size:${orientation};margin:10mm}body{margin:0;display:grid;place-items:center;min-height:95vh}img{max-width:100%;max-height:90vh;object-fit:contain}</style></head><body><img src="${canvas.toDataURL('image/png')}" onload="window.print()"></body></html>`);printWindow.document.close();});}

window.addEventListener('resize',()=>{if(current&&document.getElementById('editor').style.display==='grid')renderEditor();});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){closeTemplateDetails();closeShareDialog();if(document.getElementById('fileMenu'))document.getElementById('fileMenu').hidden=true;}
  if(document.getElementById('editor').style.display==='grid'&&(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();event.shiftKey?redo():undo();}
  if(document.getElementById('editor').style.display==='grid'&&event.key==='Delete'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)&&!document.activeElement.isContentEditable)deleteSelected();
});
document.addEventListener('click',event=>{if(!event.target.closest('.editor-menu')&&!event.target.closest('.file-menu')){const menu=document.getElementById('fileMenu');if(menu)menu.hidden=true;}});

function initializeApp(){const route=routeFromLocation();projects=read(PK,[]);applyRoute(route,false);}
initializeApp();
