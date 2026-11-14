import {
  createComponent,
  createGlassSystem,
  GlassSound,
  bindControlSounds,
  bindKeyboardFocus
} from './vendor/lens/index.js';

const root=document.getElementById('appStage');
const state={
  page:'overview',theme:'glass',sound:true,volume:.16,
  subject:'数学',chapter:'集合与逻辑初步',point:'集合的概念与表示',activePoint:null,
  search:'',filter:{year:'全部年份',source:'全部题源',type:'全部题型'},
  questionId:'MATH-DEMO-01',answer:'',submitted:false
};
const subjects=[
  {name:'语文',symbol:'文',desc:'基础知识、古代诗文与阅读理解',detail:'围绕考纲结构组织篇章、知识点与历年题目。'},
  {name:'数学',symbol:'∑',desc:'基础概念、函数、几何与概率统计',detail:'按章节与知识点查看关联题目，并回到原卷定位。'},
  {name:'英语',symbol:'A',desc:'词汇、语法、阅读与写作',detail:'以语言能力要求组织题型与篇章来源。'},
  {name:'计算机专业理论',symbol:'⌘',desc:'计算机原理、网络、C语言与电子电工',detail:'按专业理论模块建立知识点与题目映射。'}
];
const chapters=[
  {name:'集合与逻辑初步',count:'示例目录'},
  {name:'函数',count:'待导入'},
  {name:'几何与代数',count:'待导入'},
  {name:'概率与统计',count:'待导入'}
];
const points=[
  {name:'集合的概念与表示',desc:'元素、集合、列举法、描述法',id:'MATH-KP-DEMO-01'},
  {name:'元素与集合的关系',desc:'属于、不属于及符号表达',id:'MATH-KP-DEMO-02'},
  {name:'子集与集合相等',desc:'包含关系、子集个数、双向包含',id:'MATH-KP-DEMO-03'},
  {name:'集合的交、并、补运算',desc:'韦恩图、运算关系与性质',id:'MATH-KP-DEMO-04'}
];
const questions=[
  {id:'MATH-DEMO-01',title:'已知集合 A、B，求两个集合的交集。',type:'客观题',year:'待核验',source:'演示题源',number:'待映射',point:'集合的交、并、补运算'},
  {id:'MATH-DEMO-02',title:'根据集合的描述法，判断元素与集合的关系。',type:'客观题',year:'待核验',source:'演示题源',number:'待映射',point:'元素与集合的关系'},
  {id:'MATH-DEMO-03',title:'已知集合之间的包含关系，求参数的取值范围。',type:'主观题',year:'待核验',source:'演示题源',number:'待映射',point:'子集与集合相等'},
  {id:'MATH-DEMO-04',title:'利用集合运算的性质化简表达式。',type:'客观题',year:'待核验',source:'演示题源',number:'待映射',point:'集合的交、并、补运算'}
];
let system=null,sound=null,unbindSounds=null,unbindFocus=null,headerThemeHandle=null;
let dockHandle=null,themeHandle=null,soundHandle=null,searchHandle=null;
let sheetCloseTimer=0;
const objectUrls=[];
const node=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
const labels={overview:'学习总览',subjects:'学科目录',knowledge:'知识地图',questions:'题目档案',objective:'题目详情',subjective:'纸笔作答',sources:'原卷与来源'};
function mount(name,props,slot){const handle=createComponent(name,props);slot.append(handle.element);return handle;}
function icon(name){
 const paths={search:'M20 20l-4.5-4.5M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0',settings:'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 2.94-.08-.02a1.7 1.7 0 0 0-1.74.53l-.05.07h-3.4l-.05-.07a1.7 1.7 0 0 0-1.74-.53l-.08.02-1.7-2.94.06-.06A1.7 1.7 0 0 0 9.66 15l-.08-.04v-3.4l.08-.04a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-2.94.08.02a1.7 1.7 0 0 0 1.74-.53l.05-.07h3.4l.05.07a1.7 1.7 0 0 0 1.74.53l.08-.02 1.7 2.94-.06.06A1.7 1.7 0 0 0 19.34 11l.08.04v3.4l-.02.56Z',close:'M6 6l12 12M18 6 6 18',arrow:'M5 12h14m-6-6 6 6-6 6'};
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');const p=document.createElementNS(svg.namespaceURI,'path');p.setAttribute('d',paths[name]||paths.arrow);svg.append(p);return svg;
}
function shell(){
 root.className='app-stage lg-stage theme-glass';
 root.dataset.glassDpr=window.matchMedia('(max-width:760px)').matches?'1.0':'1.25';
 root.innerHTML=
 '<header class="app-topbar lg-surface" data-glass="panel">'+
  '<div class="brand"><div class="brand-mark">Z</div><div><div class="brand-title">ZJGK 2.0</div><div class="brand-subtitle">STUDY ATLAS · 2027</div></div></div>'+
  '<div id="headerSearch" class="header-search"></div>'+
  '<div class="header-actions"><div id="headerTheme" class="header-theme"></div><button class="icon-action mobile-search-action" aria-label="搜索" data-open-search>'+''+'</button><button class="icon-action mobile-settings-action" aria-label="显示设置" data-open-settings>'+''+'</button></div>'+
 '</header>'+
 '<div class="app-layout">'+
  '<aside class="sidebar"><div class="side-section-label">学习空间</div><nav class="side-nav">'+
   '<button data-route="overview" class="active"><span class="side-icon">⌂</span>学习总览</button>'+
   '<button data-route="subjects"><span class="side-icon">▦</span>学科目录</button>'+
   '<button data-route="knowledge"><span class="side-icon">◫</span>知识地图</button>'+
   '<button data-route="questions"><span class="side-icon">☷</span>题目档案</button>'+
   '<button data-route="sources"><span class="side-icon">▤</span>原卷与来源</button>'+
  '</nav><div class="sidebar-note"><strong>研究映射 · 题库分开管理</strong><p>研究成果用于建立知识结构；真实题目需完成拆分、来源核对与人工映射后再导入。</p></div></aside>'+
  '<main class="workspace"><div class="workspace-inner"><div id="pageContent" class="page-content"></div></div></main>'+
  '<aside class="context-rail" id="contextRail"></aside>'+
 '</div>'+
 '<div class="mobile-dock-wrap"><div id="mobileDock"></div></div>'+
 '<div class="sheet-backdrop" id="settingsBackdrop" hidden><section class="sheet-panel lg-surface" data-glass="menu" role="dialog" aria-modal="true" aria-labelledby="settingsTitle"><div class="sheet-header"><h2 id="settingsTitle">显示与交互</h2><button class="sheet-close" data-close-sheet aria-label="关闭">×</button></div><div class="sheet-section"><div class="sheet-section-title">外观主题</div><div id="settingsTheme" class="sheet-theme-slot"></div></div><div class="sheet-section"><div class="sheet-row"><div><strong>交互音效</strong><small>轻微点击、切换与完成反馈；不会自动播放</small></div><div id="settingsSound"></div></div></div><div class="sheet-section"><div class="sheet-row"><div><strong>动效偏好</strong><small>自动遵循设备的减少动态效果设置</small></div><span class="pill">系统控制</span></div></div></section></div>'+
 '<div class="sheet-backdrop" id="filterBackdrop" hidden><section class="sheet-panel lg-surface" data-glass="menu" role="dialog" aria-modal="true" aria-labelledby="filterTitle"><div class="sheet-header"><h2 id="filterTitle">筛选题目</h2><button class="sheet-close" data-close-sheet aria-label="关闭">×</button></div><div id="filterSheetContent"></div></section></div>'+
 '<div class="toast" id="appToast" role="status" aria-live="polite"></div>';
 const searchSlot=document.getElementById('headerSearch');
 searchHandle=mount('search',{label:'搜索知识点或题目',placeholder:'搜索知识点 / 题目',onChange:value=>{state.search=value;if(state.page==='questions')updateQuestionRows();}},searchSlot);
 const searchInput=searchHandle.element.querySelector('input');
 searchInput.dataset.lgSound='';
 searchInput.addEventListener('keydown',event=>{if(event.key==='Enter'){state.activePoint=null;navigate('questions');closeSheet();}});
 const themeOptions=[{value:'glass',label:'Glass'},{value:'lite',label:'Lite'}];
 themeHandle=mount('tabs',{label:'外观主题',value:state.theme,options:themeOptions,onChange:setTheme},document.getElementById('settingsTheme'));
 headerThemeHandle=mount('tabs',{label:'桌面主题',value:state.theme,options:themeOptions,onChange:setTheme},document.getElementById('headerTheme'));
 soundHandle=mount('switch',{label:'开启交互音效',checked:state.sound,onChange:value=>{state.sound=value;sound?.set({enabled:value,volume:state.volume});}},document.getElementById('settingsSound'));
 const settingsButton=root.querySelector('[data-open-settings]');settingsButton.append(icon('settings'));
 root.querySelector('[data-open-search]').append(icon('search'));
 dockHandle=mount('dock',{label:'主要导航',value:'overview',options:[
  {value:'overview',label:'总览',icon:'home'},
  {value:'subjects',label:'学科',icon:'layers'},
  {value:'knowledge',label:'知识',icon:'adjust'},
  {value:'questions',label:'题库',icon:'more'}
 ],onChange:value=>{if(value==='questions')state.activePoint=null;navigate(value);}},document.getElementById('mobileDock'));
 initRuntime();
 render();
}
function artwork(ctx,info){
 const w=info.width,h=info.height;
 ctx.clearRect(0,0,w,h);
 const base=ctx.createLinearGradient(0,0,w,h);
 base.addColorStop(0,'#f4f7fc');base.addColorStop(.55,'#edf3fb');base.addColorStop(1,'#f7f8fb');
 ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
 const blobs=[
  [.10,.05,.28,'rgba(175,205,246,.26)'],
  [.86,.18,.25,'rgba(198,190,239,.17)'],
  [.65,.92,.34,'rgba(177,219,210,.12)']
 ];
 for(const [x,y,r,color] of blobs){const g=ctx.createRadialGradient(w*x,h*y,0,w*x,h*y,Math.max(w,h)*r);g.addColorStop(0,color);g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
}
function initRuntime(){
 if(state.theme==='glass'){
  system=createGlassSystem(root,{material:'soft',scene:'aurora',motion:false,elasticity:.55,audio:{enabled:state.sound,volume:state.volume,storageKey:'zjgk2.study-atlas.sound.v03'},artwork,onFallback:error=>{root.classList.add('lens-fallback');console.warn('Lens fallback:',error);}});
  sound=system.sound;
 }else{
  sound=new GlassSound({enabled:state.sound,volume:state.volume,storageKey:'zjgk2.study-atlas.sound.v03'});
  unbindSounds=bindControlSounds(root,sound);
  unbindFocus=bindKeyboardFocus(root);
 }
}
function teardownRuntime(){
 if(system){system.destroy();system=null;}
 if(unbindSounds){unbindSounds();unbindSounds=null;}
 if(unbindFocus){unbindFocus();unbindFocus=null;}
 if(sound&&!system){sound.destroy();}
 sound=null;
}
function pageHead(eyebrow,title,description,actions=''){
 return '<div class="page-head"><div><div class="eyebrow">'+eyebrow+'</div><h1 class="page-title">'+title+'</h1><p class="page-description">'+description+'</p></div>'+(actions?'<div class="page-actions">'+actions+'</div>':'')+'</div>';
}
function subjectCard(s){
 return '<button class="subject-card" data-subject="'+s.name+'" data-lg-sound="select"><span class="card-arrow">↗</span><span class="subject-icon">'+s.symbol+'</span><strong>'+s.name+'</strong><small>'+s.desc+'</small></button>';
}
function overviewPage(){
 return pageHead('2027 · STUDY ATLAS','你的备考地图','从学科进入章节与知识点，找到关联真题，再回到原卷核对来源。这里是全新的知识导航空间，不是传统刷题首页。')+
 '<section class="overview-hero"><div class="hero-main"><div class="eyebrow">KNOWLEDGE FIRST · SOURCE TRACEABLE</div><h2>让每一道题，<br>都有自己的来处。</h2><p>把研究成果中的知识点与历年真题连接起来。你可以先定位一个知识点，再查看对应题目、题源信息和原卷位置。</p><div class="hero-actions"><button class="primary-button" data-route="subjects" data-lg-sound="select">从学科开始探索 <span aria-hidden="true">→</span></button><span class="pill outline">首期四大学科</span></div></div><div class="hero-side"><div><div class="eyebrow">THE STUDY PATH</div><h3>从知识到原卷</h3><p>每一层都有明确的上下文，题目不再是孤立的编号。</p></div><div class="flow-line"><div class="flow-node"><b>01</b><span>学科</span></div><div class="flow-node"><b>02</b><span>知识点</span></div><div class="flow-node"><b>03</b><span>真题</span></div><div class="flow-node"><b>04</b><span>原卷</span></div></div></div></section>'+
 '<div class="section-heading"><div><h2>学科入口</h2><p>选择你正在研究或学习的科目</p></div><button class="text-link" data-route="subjects">查看学科目录 →</button></div>'+
 '<div class="subject-grid">'+subjects.map(subjectCard).join('')+'</div>'+
 '<div class="section-heading"><div><h2>最近查看的知识点</h2><p>演示内容 · 真实研究映射尚未导入</p></div><button class="text-link" data-route="knowledge">打开知识地图 →</button></div>'+
 '<div class="recent-list">'+[points[3],points[1]].map((p,i)=>'<button class="recent-item" data-point="'+p.name+'" data-lg-sound="select"><span class="recent-mark">'+(i+1).toString().padStart(2,'0')+'</span><span class="recent-copy"><strong>'+p.name+'</strong><small>数学 · 集合与逻辑初步 · 示例节点</small></span><span class="arrow">→</span></button>').join('')+'</div>';
}
function subjectsPage(){
 return pageHead('SUBJECT INDEX','学科目录','每门学科拥有独立的知识结构。进入后可按章节浏览知识点，并查看与之关联的题目。')+
 '<div class="subject-grid">'+subjects.map(subjectCard).join('')+'</div>'+
 '<div class="section-heading"><div><h2>题库建设原则</h2><p>研究结构与题目资产分开管理</p></div></div>'+
 '<div class="recent-list"><article class="recent-item"><span class="recent-mark">01</span><span class="recent-copy"><strong>先建立知识结构</strong><small>以研究报告、考纲和知识原子为依据</small></span></article><article class="recent-item"><span class="recent-mark">02</span><span class="recent-copy"><strong>再导入题目与来源</strong><small>保留年份、原卷名称、题号、页码与审核状态</small></span></article></div>';
}
function knowledgePage(){
 const selected=subjects.find(s=>s.name===state.subject)||subjects[1];
 const hasMathNodes=state.subject==='数学'&&state.chapter==='集合与逻辑初步';
 const pointContent=hasMathNodes
  ? points.map((p,i)=>'<div class="knowledge-node"><span class="node-index">0'+(i+1)+'</span><span class="node-copy"><strong>'+p.name+'</strong><small>'+p.desc+'</small></span><span class="node-meta"><small>原子 ID：待导入</small><button data-point="'+p.name+'" data-lg-sound="select">查看题目 →</button></span></div>').join('')
  : '<div class="empty-state">当前科目的章节与知识点目录将在对应研究资产核验后导入。这里先展示独立的知识地图结构，不用其他科目的演示节点替代真实内容。</div>';
 const chapterContent=state.subject==='数学'
  ? chapters.map(c=>'<button class="'+(state.chapter===c.name?'active':'')+'" data-chapter="'+c.name+'">'+c.name+'<small>'+c.count+'</small></button>').join('')
  : '<div class="empty-state">该科章节目录待研究资产导入。</div>';
 return pageHead('KNOWLEDGE MAP / '+state.subject.toUpperCase(),'知识地图','沿章节浏览知识点。每个节点都预留研究原子 ID、映射审核状态与关联题目入口。')+
 '<section class="subject-intro"><span class="subject-icon">'+selected.symbol+'</span><div><h2>'+selected.name+' · '+state.chapter+'</h2><p>'+selected.detail+' 当前为演示结构，尚未导入正式研究映射。</p></div><span class="pill blue" style="margin-left:auto">演示结构</span></section>'+
 '<div class="knowledge-layout"><aside class="chapter-list"><h3>章节目录</h3>'+chapterContent+'</aside><section class="knowledge-main"><div class="knowledge-main-head"><div><h3>'+state.chapter+'</h3><p>选择一个知识点，查看关联题目及来源记录。</p></div><span class="pill">原子映射待导入</span></div>'+pointContent+'</section></div>';
}
function visibleQuestions(){
 return questions.filter(q=>{
  const matchText=!state.search||(q.title+q.point+q.type).toLowerCase().includes(state.search.toLowerCase());
  const matchYear=state.filter.year==='全部年份'||q.year===state.filter.year;
  const matchSource=state.filter.source==='全部题源'||q.source===state.filter.source;
  const matchType=state.filter.type==='全部题型'||q.type===state.filter.type;
  const matchPoint=!state.activePoint||q.point===state.activePoint;
  return matchText&&matchYear&&matchSource&&matchType&&matchPoint;
 });
}
function questionRow(q){
 return '<button class="question-row" data-question="'+q.id+'" data-lg-sound="select"><span class="question-type">'+(q.type==='客观题'?'选':'解')+'</span><span class="question-copy"><strong>'+q.title+'</strong><p>'+q.point+'</p><span class="question-meta"><span>'+q.type+'</span><span>演示数据</span><span>年份待核验</span><span>原卷题号待映射</span></span></span><span class="row-arrow">→</span></button>';
}
function updateQuestionRows(){const slot=document.getElementById('questionRows');if(!slot)return;const rows=visibleQuestions();slot.innerHTML=rows.length?rows.map(questionRow).join(''):'<div class="empty-state">没有符合条件的演示题目。你可以清除筛选条件后再查看。</div>';}
function questionsPage(){
 const rows=visibleQuestions();
 return pageHead('QUESTION ARCHIVE','题目档案','按年份、题源、题型与知识点筛选。每道题保留原始题号和原卷定位字段；当前条目均为演示数据。')+
 '<div class="question-toolbar"><div class="filter-chips"><button class="filter-chip '+(state.filter.year==='全部年份'?'active':'')+'" data-open-filter="year">'+state.filter.year+'⌄</button><button class="filter-chip '+(state.filter.source==='全部题源'?'active':'')+'" data-open-filter="source">'+state.filter.source+'⌄</button><button class="filter-chip '+(state.filter.type==='全部题型'?'active':'')+'" data-open-filter="type">'+state.filter.type+'⌄</button></div><span class="pill">'+rows.length+' 条演示记录</span></div>'+
 '<div id="questionRows" class="question-list">'+(rows.length?rows.map(questionRow).join(''):'<div class="empty-state">没有符合条件的演示题目。你可以清除筛选条件后再查看。</div>')+'</div>'+
 '<div class="section-heading"><div><h2>题目来源字段</h2><p>正式数据导入后会展示真实来源值</p></div><button class="text-link" data-route="sources">查看来源规范 →</button></div>'+
 '<div class="source-strip"><div class="source-field"><small>原卷名称</small><strong>待导入</strong></div><div class="source-field"><small>原始题号 / 小问</small><strong>待映射</strong></div><div class="source-field"><small>原文件 / 页码</small><strong>待定位</strong></div></div>';
}
function objectivePage(){
 const q=questions.find(item=>item.id===state.questionId)||questions[0];
 return pageHead('QUESTION DETAIL / DEMO','客观题详情','先看原题，再完成选择。下方的答案反馈仅用于验证交互，不代表真实题库解析。')+
 '<section class="question-detail"><div class="question-detail-head"><div class="filter-chips"><span class="pill blue">演示题面</span><span class="pill">数学 · 集合与逻辑</span><span class="pill">单项选择</span></div><button class="text-link" data-route="sources">来源档案 →</button></div><p class="question-stem">'+q.title+'<br>已知集合 A = {1, 2, 3, 4}，B = {2, 4, 6}，则 A ∩ B =（　）。</p><div class="math-expression">A ∩ B = { x | x ∈ A 且 x ∈ B }</div><div class="answer-options">'+[['A','{1, 3}'],['B','{2, 4}'],['C','{2, 4, 6}'],['D','{1, 2, 3, 4, 6}']].map(([letter,text])=>'<button class="answer-option '+(state.answer===letter?'selected':'')+'" data-answer="'+letter+'" data-lg-sound="select"><span class="letter">'+letter+'</span>'+text+'</button>').join('')+'</div><div class="answer-feedback '+(state.submitted?'show':'')+'" id="answerFeedback">'+(state.answer==='B'?'回答正确。交集表示两个集合中共同拥有的元素，因此结果为 {2, 4}。':'已提交。演示正确答案为 B，即 {2, 4}。')+' 本反馈不连接正式成绩记录。</div><div class="question-footer"><small>演示作答状态仅保存在当前页面</small><button class="primary-button" data-submit-answer data-lg-sound="success">提交答案</button></div></section>'+
 '<div class="section-heading"><div><h2>来源与映射信息</h2><p>真实题库导入后显示审核状态</p></div></div>'+
 '<div class="source-strip"><div class="source-field"><small>年份 / 题源</small><strong>待核验</strong></div><div class="source-field"><small>原卷题号</small><strong>待映射</strong></div><div class="source-field"><small>研究原子 ID</small><strong>待映射</strong></div></div>';
}
function subjectivePage(){
 return pageHead('WRITTEN RESPONSE','主观题纸笔作答','网站展示原题，你在纸上完整演算，再选择多张照片保存本次演示记录。当前不会上传服务器。')+
 '<div class="written-layout"><section class="written-card"><h3>数学 · 解答题（演示题面）</h3><p>已知函数 f(x) = x² − 4x + 3。<br>（1）求函数图像的对称轴与顶点坐标；<br>（2）求函数在区间 [0, 3] 上的最小值。</p><div class="paper-area">在纸上完整写出演算过程。<br><br>建议保留关键公式、推导步骤与最终结论。</div></section><section class="written-card"><h3>上传作答照片</h3><p>支持常见图片格式。选择多张图片后会在本机浏览器预览，不会上传。</p><label class="upload-zone"><strong>＋　选择作答图片</strong><small>支持多选 · 本地预览 · 不会上传服务器</small><input id="answerFiles" type="file" accept="image/*" multiple></label><div class="upload-previews" id="uploadPreviews"></div><div style="margin-top:13px"><button class="primary-button" data-save-written data-lg-sound="success">保存本次作答</button></div></section></div>';
}
function sourcesPage(){
 return pageHead('SOURCE PROVENANCE','原卷与来源档案','每道题都需要保留可追溯的原始来源。以下展示字段结构，不代表真实试卷已经导入。')+
 '<section class="content-card pad"><div class="eyebrow">SOURCE RECORD · DEMO</div><h2 style="font-size:17px;margin:0 0 7px">原始试卷信息</h2><p class="page-description" style="margin:0">来源档案会把网站中的独立题目重新连接回原始试卷。</p><div class="source-strip"><div class="source-field"><small>科目</small><strong>数学（示例）</strong></div><div class="source-field"><small>年份</small><strong>待核验</strong></div><div class="source-field"><small>题源性质</small><strong>待审核</strong></div><div class="source-field"><small>原卷名称</small><strong>待导入</strong></div><div class="source-field"><small>原始题号 / 小问</small><strong>待映射</strong></div><div class="source-field"><small>原文件及页码</small><strong>待定位</strong></div></div><div style="margin-top:16px"><span class="pill outline">映射审核状态：未审核</span></div></section>';
}
function pageMarkup(){
 switch(state.page){
  case 'subjects':return subjectsPage();
  case 'knowledge':return knowledgePage();
  case 'questions':return questionsPage();
  case 'objective':return objectivePage();
  case 'subjective':return subjectivePage();
  case 'sources':return sourcesPage();
  default:return overviewPage();
 }
}
function contextMarkup(){
 if(state.page==='knowledge')return '<section class="context-card"><h3 class="context-title">当前知识结构</h3><div class="context-meta"><div class="context-meta-row"><span>科目</span><span>'+state.subject+'</span></div><div class="context-meta-row"><span>章节</span><span>'+state.chapter+'</span></div><div class="context-meta-row"><span>知识点</span><span>4 个演示节点</span></div><div class="context-meta-row"><span>研究原子</span><span>待导入</span></div></div></section><section class="context-card"><h3 class="context-title">映射状态</h3><p class="context-copy">正式研究原子 ID、题目关联与人工审核状态尚未导入。此处不会用虚构数量冒充真实进度。</p></section>';
 if(state.page==='questions'||state.page==='objective'||state.page==='subjective')return '<section class="context-card"><h3 class="context-title">题目来源字段</h3><div class="context-meta"><div class="context-meta-row"><span>年份</span><span>待核验</span></div><div class="context-meta-row"><span>题源性质</span><span>待审核</span></div><div class="context-meta-row"><span>原卷题号</span><span>待映射</span></div><div class="context-meta-row"><span>原文件页码</span><span>待定位</span></div></div></section><section class="context-card"><h3 class="context-title">返回原卷</h3><p class="context-copy">原始文件与页码字段完成核验后，可从题目详情返回原卷对应位置。</p><button class="text-link" data-route="sources">查看来源字段 →</button></section>';
 return '<section class="context-card"><h3 class="context-title">学习路径</h3><div class="path-steps"><div class="path-step"><span class="path-dot">1</span><span>选择学科</span></div><div class="path-step"><span class="path-dot">2</span><span>进入章节与知识点</span></div><div class="path-step"><span class="path-dot">3</span><span>查看关联题目</span></div><div class="path-step"><span class="path-dot">4</span><span>返回原卷定位</span></div></div></section><section class="context-card"><h3 class="context-title">首期范围</h3><div class="context-meta"><div class="context-meta-row"><span>语文</span><span>纳入首期</span></div><div class="context-meta-row"><span>数学</span><span>纳入首期</span></div><div class="context-meta-row"><span>英语</span><span>纳入首期</span></div><div class="context-meta-row"><span>计算机理论</span><span>纳入首期</span></div></div></section><section class="context-card"><h3 class="context-title">数据状态</h3><p class="context-copy">目前是交互原型。真实题库、研究原子映射与原卷文件尚未接入。</p></section>';
}
function render(){
 const content=document.getElementById('pageContent');
 content.innerHTML=pageMarkup();
 document.getElementById('contextRail').innerHTML=contextMarkup();
 root.querySelectorAll('.side-nav [data-route]').forEach(button=>button.classList.toggle('active',button.dataset.route===state.page||(['objective','subjective'].includes(state.page)&&button.dataset.route==='questions')));
 if(dockHandle)dockHandle.setValue(['overview','subjects','knowledge','questions'].includes(state.page)?state.page:'questions');
 const workspace=root.querySelector('.workspace');if(workspace)workspace.scrollTo({top:0,behavior:'auto'});
}
function navigate(page){
 if(!labels[page])return;
 state.page=page;
 if(page==='objective'&&state.questionId==='MATH-DEMO-03')state.page='subjective';
 render();
}
function updateThemeControls(value){themeHandle?.setValue(value);headerThemeHandle?.setValue(value);}
function setTheme(value){
 if(!['glass','lite'].includes(value)||state.theme===value)return;
 state.theme=value;
 root.classList.toggle('theme-lite',value==='lite');
 root.classList.toggle('theme-glass',value==='glass');
 updateThemeControls(value);
 teardownRuntime();
 initRuntime();
}
function toast(message){
 const el=document.getElementById('appToast');if(!el)return;
 el.textContent=message;el.classList.add('show');
 clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2100);
}
function openSheet(id){
 const el=document.getElementById(id);if(!el)return;
 clearTimeout(sheetCloseTimer);el.hidden=false;
 requestAnimationFrame(()=>el.classList.add('is-open'));
}
function closeSheet(){
 root.querySelectorAll('.sheet-backdrop.is-open').forEach(el=>{
  el.classList.remove('is-open');
  sheetCloseTimer=setTimeout(()=>{el.hidden=true;},210);
 });
}
function renderFilterSheet(){
 const groups=[
  {kind:'year',title:'年份',values:['全部年份','2025','2024','2023','待核验']},
  {kind:'source',title:'题源性质',values:['全部题源','省级真题','模拟题','演示题源']},
  {kind:'type',title:'题型',values:['全部题型','客观题','主观题']}
 ];
 document.getElementById('filterSheetContent').innerHTML=groups.map(group=>'<div class="sheet-section"><div class="sheet-section-title">'+group.title+'</div><div class="filter-options">'+group.values.map(value=>'<button class="filter-option '+(state.filter[group.kind]===value?'active':'')+'" data-filter-kind="'+group.kind+'" data-filter-value="'+value+'">'+value+'</button>').join('')+'</div></div>').join('')+'<div style="padding-top:12px;display:flex;justify-content:space-between"><button class="quiet-button" data-reset-filters>清除筛选</button><button class="primary-button" data-close-sheet>完成</button></div>';
}
function openFilter(kind){state.filterKind=kind;renderFilterSheet();openSheet('filterBackdrop');}
function teardownRuntime(){
 if(system){system.destroy();system=null;}
 if(unbindSounds){unbindSounds();unbindSounds=null;}
 if(unbindFocus){unbindFocus();unbindFocus=null;}
 if(sound&&!system){sound.destroy();}
 sound=null;
}
function initRuntime(){
 root.dataset.glassDpr=window.matchMedia('(max-width:760px)').matches?'1.0':'1.25';
 if(state.theme==='glass'){
  system=createGlassSystem(root,{material:'soft',scene:'aurora',motion:false,elasticity:.52,audio:{enabled:state.sound,volume:state.volume,storageKey:'zjgk2.study-atlas.sound.v03'},artwork,onFallback:error=>{root.classList.add('lens-fallback');console.warn('Lens WebGL fallback:',error);}});
  sound=system.sound;
 }else{
  sound=new GlassSound({enabled:state.sound,volume:state.volume,storageKey:'zjgk2.study-atlas.sound.v03'});
  unbindSounds=bindControlSounds(root,sound);
  unbindFocus=bindKeyboardFocus(root);
 }
}
root.addEventListener('click',event=>{
 if(event.target.classList?.contains('sheet-backdrop')){closeSheet();return;}
 const route=event.target.closest('[data-route]');
 if(route){event.preventDefault();if(route.dataset.route==='questions')state.activePoint=null;navigate(route.dataset.route);return;}
 const subject=event.target.closest('[data-subject]');
 if(subject){state.subject=subject.dataset.subject;state.chapter=state.subject==='数学'?'集合与逻辑初步':'待导入章节';state.activePoint=null;navigate('knowledge');return;}
 const point=event.target.closest('[data-point]');
 if(point){state.point=point.dataset.point;state.activePoint=point.dataset.point;state.search='';searchHandle?.setValue('');navigate('questions');return;}
 const chapter=event.target.closest('[data-chapter]');
 if(chapter){state.chapter=chapter.dataset.chapter;render();return;}
 const question=event.target.closest('[data-question]');
 if(question){state.questionId=question.dataset.question;state.answer='';state.submitted=false;const item=questions.find(q=>q.id===state.questionId);navigate(item?.type==='主观题'?'subjective':'objective');return;}
 const answer=event.target.closest('[data-answer]');
 if(answer){state.answer=answer.dataset.answer;state.submitted=false;render();return;}
 if(event.target.closest('[data-submit-answer]')){
  if(!state.answer){toast('请先选择一个选项。');return;}
  state.submitted=true;render();return;
 }
 if(event.target.closest('[data-save-written]')){toast('本次作答已在当前页面保存演示状态；图片未上传服务器。');return;}
 if(event.target.closest('[data-locate-original]')){toast('原卷文件尚未导入，当前仅展示来源定位字段。');return;}
 if(event.target.closest('[data-open-settings]')){openSheet('settingsBackdrop');return;}
 if(event.target.closest('[data-open-search]')){searchHandle?.element.querySelector('input')?.focus();return;}
 if(event.target.closest('[data-close-sheet]')){closeSheet();return;}
 const filter=event.target.closest('[data-open-filter]');
 if(filter){openFilter(filter.dataset.openFilter);return;}
 const choice=event.target.closest('[data-filter-kind]');
 if(choice){state.filter[choice.dataset.filterKind]=choice.dataset.filterValue;render();renderFilterSheet();return;}
 if(event.target.closest('[data-reset-filters]')){state.filter={year:'全部年份',source:'全部题源',type:'全部题型'};state.activePoint=null;render();renderFilterSheet();return;}
});
root.addEventListener('change',event=>{
 if(event.target.id==='answerFiles'){
  const previews=document.getElementById('uploadPreviews');if(!previews)return;
  previews.replaceChildren();
  objectUrls.splice(0).forEach(url=>URL.revokeObjectURL(url));
  for(const file of Array.from(event.target.files||[])){
   const url=URL.createObjectURL(file);objectUrls.push(url);
   const img=node('img');img.alt=file.name;img.src=url;previews.append(img);
  }
 }
});
window.addEventListener('resize',()=>{
 const next=window.matchMedia('(max-width:760px)').matches?'1.0':'1.25';
 if(root.dataset.glassDpr!==next){root.dataset.glassDpr=next;system?.renderer?.resize();system?.renderer?.invalidate(100);}
});
window.addEventListener('beforeunload',()=>{
 teardownRuntime();objectUrls.splice(0).forEach(url=>URL.revokeObjectURL(url));
},{once:true});
shell();
