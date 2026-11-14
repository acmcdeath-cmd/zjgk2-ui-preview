import {
  createComponent,
  createGlassSystem,
  GlassSound,
  bindControlSounds,
  bindKeyboardFocus
} from './vendor/lens/index.js';

const root = document.getElementById('appStage');
const labels = {
  home: '学习总览',
  subjects: '科目题库',
  knowledge: '知识点目录',
  questions: '题目列表',
  objective: '客观题练习',
  subjective: '主观题作答',
  lab: 'Liquid Glass 实验室'
};
const questions = [
  {id:'MATH-2019-01',title:'已知集合 A、B，求两个集合的交集。',meta:'数学 · 集合与逻辑 · 单项选择',source:'省级真题',year:'2019',type:'客观题'},
  {id:'MATH-MOCK-08',title:'根据集合的描述法，判断元素与集合的关系。',meta:'数学 · 集合的表示 · 单项选择',source:'模拟题',year:'模拟',type:'客观题'},
  {id:'MATH-2022-14',title:'已知集合之间的包含关系，求参数的取值范围。',meta:'数学 · 子集与集合相等 · 解答题',source:'省级真题',year:'2022',type:'主观题'},
  {id:'MATH-MOCK-12',title:'利用集合运算的性质化简表达式。',meta:'数学 · 集合运算 · 单项选择',source:'模拟题',year:'模拟',type:'客观题'}
];
const subjectData = [
  {name:'语文',desc:'基础知识 · 古诗文 · 阅读理解',symbol:'文',tone:'blue'},
  {name:'数学',desc:'知识点 · 历年真题 · 解答题',symbol:'∑',tone:'mint'},
  {name:'英语',desc:'词汇 · 语法 · 阅读与写作',symbol:'A',tone:'amber'},
  {name:'计算机专业理论',desc:'原理 · 网络 · C语言 · 电子电工',symbol:'⌘',tone:'violet'}
];
let savedPrefs = null;
try { savedPrefs = JSON.parse(localStorage.getItem('zjgk2.lens.sound.v1') || 'null'); } catch {}
const state = {
  page:'home',
  theme:'glass',
  device:window.matchMedia('(max-width: 760px)').matches?'mobile':'desktop',
  material:'thick',
  scene:'aurora',
  sound:savedPrefs && typeof savedPrefs.enabled==='boolean'?savedPrefs.enabled:true,
  volume:savedPrefs && Number.isFinite(savedPrefs.volume)?savedPrefs.volume:.28,
  filter:'all',
  search:'',
  answer:'',
  submitted:false,
  questionId:'MATH-2019-01',
  favorite:false,
  progress:42,
  drop:'focus',
  choice:'focus'
};
let system=null, sound=null, unbindSounds=null, unbindFocus=null, handles=[];
let progressHandle=null, dropHandle=null, xyHandle=null, answerHandle=null, volumeHandle=null;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const node=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
const mount=(name,props,parent)=>{const handle=createComponent(name,props);parent.append(handle.element);handles.push(handle);return handle;};
function dispose(){
  if(system){system.destroy();system=null;}
  if(unbindSounds){unbindSounds();unbindSounds=null;}
  if(unbindFocus){unbindFocus();unbindFocus=null;}
  if(sound&&!system){sound.destroy();}
  sound=null;
  for(const handle of handles.reverse()){try{handle.destroy();}catch{}}
  handles=[];
  progressHandle=dropHandle=xyHandle=answerHandle=volumeHandle=null;
}
function prefsFromSound(){if(sound){state.sound=sound.enabled;state.volume=sound.volume;}}
function artwork(ctx,info){
  const w=info.width,h=info.height,scene=info.scene||'aurora';
  ctx.clearRect(0,0,w,h);
  let base=ctx.createLinearGradient(0,0,w,h);
  if(scene==='ocean'){base.addColorStop(0,'#b6d6e8');base.addColorStop(.48,'#c7d7ee');base.addColorStop(1,'#9bc8c8');}
  else if(scene==='grid'){base.addColorStop(0,'#e8eff8');base.addColorStop(.55,'#d9e6f4');base.addColorStop(1,'#dce7ee');}
  else{base.addColorStop(0,'#d9e9ff');base.addColorStop(.48,'#e5e1fb');base.addColorStop(1,'#ccece4');}
  ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
  const blobs=scene==='ocean'?
    [[.18,.25,.25,'rgba(255,255,255,.72)'],[.78,.25,.27,'rgba(110,176,218,.42)'],[.56,.78,.35,'rgba(105,190,177,.40)']]:
    [[.15,.18,.27,'rgba(255,255,255,.76)'],[.78,.18,.29,'rgba(145,177,250,.38)'],[.60,.75,.36,'rgba(133,210,190,.42)']];
  for(const b of blobs){const g=ctx.createRadialGradient(w*b[0],h*b[1],0,w*b[0],h*b[1],Math.max(w,h)*b[2]);g.addColorStop(0,b[3]);g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
  if(scene==='grid'){
    ctx.save();ctx.strokeStyle='rgba(103,133,174,.10)';ctx.lineWidth=Math.max(1,info.dpr||1);
    const step=38*(info.dpr||1);
    for(let x=0;x<w;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=0;y<h;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    ctx.restore();
  }
}
function head(k,title,desc,action){
  return '<div class="page-head"><div><div class="eyebrow">'+k+'</div><h1 class="page-title">'+title+'</h1><p class="page-desc">'+desc+'</p></div>'+(action||'')+'</div>';
}
function homePage(){
  return head('PERSONAL STUDY SPACE','把知识点与真题连接起来。','沿着科目、章节和知识点查找历年真题。每道题都保留来源线索，方便回到原卷核对。','<div class="page-head-actions"><span class="tag">2027 江苏职教高考</span></div>')+
  '<section class="hero-panel glass-panel lg-surface" data-glass="panel" data-lg-drag="press"><div class="hero-copy"><div class="eyebrow">2027 JIANGSU VOCATIONAL EXAM</div><h2>不只是刷题。<br>建立自己的知识地图。</h2><p>从研究成果中的知识点出发，找到对应年份、题源与原卷位置。先理解考点，再回到真题验证。</p><div class="hero-actions"><div id="heroCta"></div><span class="hero-note">首期四大学科 · 模拟数据体验</span></div></div><div class="hero-art"><div class="hero-orbit"></div><div class="hero-glow"></div><div class="hero-lens-slot" id="heroLens"></div></div></section>'+
  '<div class="stats-grid"><div class="stat-card glass-panel lg-surface" data-glass="panel" data-lg-drag="press"><strong>04</strong><small>首期核心科目</small></div><div class="stat-card glass-panel lg-surface" data-glass="panel" data-lg-drag="press"><strong>2027</strong><small>备考年度</small></div><div class="stat-card glass-panel lg-surface" data-glass="panel" data-lg-drag="press"><strong>—</strong><small>已导入真实题目（尚未导入）</small></div></div>'+
  '<div class="section-row"><div><h3>我的备考科目</h3><p>选择一门科目，沿知识结构继续探索</p></div><button class="text-link" data-route="subjects">查看全部 →</button></div><div class="subject-grid">'+subjectData.map((s)=>'<article class="subject-card glass-panel lg-surface" data-glass="panel" data-lg-drag="press" data-route="knowledge"><div class="subject-symbol">'+s.symbol+'</div><strong>'+s.name+'</strong><small>'+s.desc+'</small></article>').join('')+'</div>'+
  '<div class="home-lower"><section class="home-card glass-panel lg-surface" data-glass="panel" data-lg-drag="press"><h3>继续上次探索</h3><div class="continue-row"><div class="continue-symbol">∑</div><div class="continue-copy"><strong>集合与逻辑初步</strong><small>数学 · 集合的概念、表示与运算</small></div><div id="continueButton"></div></div><div class="section-row"><div><h3>本周专注进度</h3><p>仅为演示，不代表真实学习记录</p></div></div><div id="homeProgress"></div></section><section class="home-card glass-panel lg-surface" data-glass="panel" data-lg-drag="press"><h3>体验 Lens 交互</h3><p class="page-desc">拖动玻璃透镜，切换材质，听听交互反馈。这里可以完整体验本次接入的设计系统。</p><div id="labButton"></div></section></div>'+
  '<div class="section-row"><div><h3>探索学习工具</h3><p>横向拖动卡片，体验弹性卡片列表</p></div></div><div class="feature-list" id="featureList"></div>';
}
function subjectsPage(){
  return head('SUBJECT LIBRARY','科目题库','按科目进入知识结构。研究成果与实际导入题库分开管理，当前仅展示界面示例。')+
  '<div class="subject-list">'+subjectData.map((s,i)=>'<article class="subject-detail-card glass-panel lg-surface" data-glass="panel" data-lg-drag="press"><div class="subject-symbol">'+s.symbol+'</div><span class="tag">首期范围 · 0'+(i+1)+'</span><h3>'+s.name+'</h3><p>'+s.desc+'</p><button class="text-link" data-route="knowledge">进入知识目录 →</button></article>').join('')+'</div>'+
  '<div class="home-lower"><section class="home-card glass-panel lg-surface" data-glass="panel" data-lg-drag="press"><h3>题目来源可追溯</h3><p class="page-desc">每道题预留年份、原卷名称、原始题号、页码与映射审核状态。</p></section><section class="home-card glass-panel lg-surface" data-glass="panel" data-lg-drag="press"><h3>研究资产与题库分账</h3><p class="page-desc">已有研究报告不等于题目已经完成网站导入，正式导入需经过资产盘点与审核。</p></section></div>';
}
function knowledgePage(){
  const points=[['集合的概念与表示','元素、集合、列举法、描述法','12'],['元素与集合的关系','属于、不属于及符号表达','8'],['子集与集合相等','包含关系、子集个数、双向包含','15'],['集合的交、并、补运算','韦恩图、运算关系与性质','11']];
  return head('MATH / KNOWLEDGE MAP','集合与逻辑初步','按知识点查看对应题目。以下是演示目录，尚未导入研究原子 ID 与完整真题映射。')+
  '<div class="knowledge-layout"><aside class="knowledge-tree glass-panel lg-surface" data-glass="panel"><h3>数学 · 知识模块</h3><button class="tree-button active">集合与逻辑 <span>08</span></button><button class="tree-button">函数 <span>21</span></button><button class="tree-button">几何与代数 <span>29</span></button><button class="tree-button">概率与统计 <span>12</span></button><button class="tree-button">其他基础 <span>12</span></button></aside><section class="knowledge-main glass-panel lg-surface" data-glass="panel"><div class="eyebrow">UNIT 01 · SETS & LOGIC</div><h3>集合与逻辑初步</h3><p class="page-desc">从集合的基本概念、表示方法到集合间关系与运算。选择知识点进入关联题目。</p>'+points.map((p,i)=>'<div class="point-row"><div class="point-num">0'+(i+1)+'</div><div class="point-copy"><strong>'+p[0]+'</strong><small>'+p[1]+'</small></div><span class="point-count">关联题 '+p[2]+' 道（示例）</span><button class="text-link" data-route="questions">查看 →</button></div>').join('')+'</section></div>';
}
function questionRows(){
  const filtered=questions.filter(q=>(state.filter==='all'||q.source===state.filter)&&(!state.search||q.title.toLowerCase().includes(state.search.toLowerCase())||q.meta.toLowerCase().includes(state.search.toLowerCase())));
  if(!filtered.length)return '<div class="glass-panel" style="padding:24px;border-radius:18px;color:#8a98ad;font-size:11px">没有匹配的演示题目。</div>';
  return filtered.map(q=>'<article class="question-row glass-panel lg-surface" data-glass="panel" data-lg-drag="press" data-open-question="'+q.id+'"><div class="question-type">'+(q.type==='客观题'?'选':'解')+'</div><div class="question-copy"><strong>'+q.title+'</strong><p>'+q.meta+'</p><div class="question-meta"><span>'+q.source+'</span><span>'+q.year+'</span><span>'+q.id+'</span></div></div><button class="lg-icon-button" type="button" aria-label="打开题目" data-open-question="'+q.id+'">→</button></article>').join('');
}
function questionsPage(){
  return head('QUESTION BANK','题目列表','按题源筛选、查看原始题号和知识点关联。当前题目为模拟数据，不代表网站题库已导入。')+
  '<div class="filter-row"><div id="filterSlot" class="filter-slot"></div><span class="tag">示例题目 · '+questions.length+' 道</span></div><div id="questionList" class="question-list">'+questionRows()+'</div>';
}
function objectivePage(){
  const q=questions.find(item=>item.id===state.questionId)||questions[0];
  return head('QUESTION DETAIL','客观题练习','数学 · 集合与逻辑初步 · 单项选择')+
  '<section class="question-detail glass-panel lg-surface" data-glass="panel"><div class="question-tags"><span class="tag">来源示例 · 省级真题</span><span class="tag">单项选择</span><span class="tag">4 分（示例）</span></div><p class="question-stem">已知集合 A = {1, 2, 3, 4}，B = {2, 4, 6}，则 A ∩ B =（　）。</p><div class="math-block">A ∩ B = { x | x ∈ A 且 x ∈ B }</div><div class="answer-slot" id="answerSlot"></div><div id="answerFeedback" class="feedback '+(state.submitted?'show':'')+'">'+(state.answer==='B'?'回答正确。交集表示两个集合中共同拥有的元素，因此结果为 {2, 4}。':'已提交。正确答案为 B，即 {2, 4}。')+'（演示反馈，不记录正式成绩）</div><div class="question-actions"><small>答题状态仅保存在当前演示页面</small><div id="submitSlot"></div></div></section><div class="home-lower"><section class="home-card glass-panel lg-surface" data-glass="panel"><h3>知识关联</h3><p class="page-desc">集合的交集：识别同时属于两个集合的元素，并用列举法写出结果。</p></section><section class="home-card glass-panel lg-surface" data-glass="panel"><h3>原卷定位（待接入）</h3><p class="page-desc">年份、原始题号、原卷页码将在真实题库导入后关联。</p></section></div>';
}
function subjectivePage(){
  return head('WRITTEN RESPONSE','主观题纸笔作答','网站展示原题，你在纸上完整演算，再选择多张照片保存本次演示记录。当前不会上传服务器。')+
  '<div class="written-grid"><section class="written-card glass-panel lg-surface" data-glass="panel"><h3>数学 · 解答题（示例）</h3><p>已知函数 f(x) = x² − 4x + 3。<br>（1）求函数图像的对称轴与顶点坐标；<br>（2）求函数在区间 [0, 3] 上的最小值。</p><div class="paper-sheet">在纸上完整写出演算过程。<br><br>建议保留关键公式、推导步骤与最终结论。</div></section><section class="written-card glass-panel lg-surface" data-glass="panel"><h3>上传作答照片</h3><p>支持 JPG、PNG 等常见图片格式。选择多张图片后会在本机浏览器预览，不会上传。</p><label class="upload-zone"><strong>＋　选择作答图片</strong><small>支持多选 · 本地预览 · 不会上传</small><input id="answerFiles" type="file" accept="image/*" multiple></label><div class="image-thumbs" id="answerThumbs"></div><div id="saveWritten" style="margin-top:12px"></div></section></div>';
}
function labPage(){
  return head('LENS / INTERACTION PLAYGROUND','让玻璃真正动起来。','这里接入 Lens 1.1.0 的真实 WebGL2 折射、弹性手势和合成交互音效。拖动、点击、切换，亲自体验它的设计系统。')+
  '<section class="lab-intro glass-panel lg-surface" data-glass="panel"><div class="eyebrow">LENS MATERIAL PLAYGROUND</div><h2>Light follows your intention.</h2><p>按住透镜拖动，感受弹性和玻璃掠过纸面的细微声音。切换材质与场景，观察折射层次。浏览器可能需要首次点击后才允许播放声音。</p></section>'+
  '<div class="lab-grid"><section class="lab-card glass-panel lg-surface" data-glass="panel"><h3>01 · 材质实验室</h3><p>厚润、通透、柔和三种材质。Glass 使用真实 WebGL2 材质合成，Lite 使用 CSS 降级。</p><div id="materialTabs" class="material-row"></div><div id="sceneTabs" class="scene-row"></div><div class="lens-demo-stage" id="lensDemoStage"><div id="demoLensSlot"></div><span class="lens-demo-hint">PRESS · DRAG · RELEASE</span></div></section>'+
  '<section class="lab-card glass-panel lg-surface" data-glass="panel"><h3>02 · 光导进度</h3><p>进度光纤会在已完成区域轻微波动，完成时有一次流光反馈。</p><div id="labProgress" class="optical-progress-slot"></div><div id="progressActions" class="optical-actions"></div></section>'+
  '<section class="lab-card glass-panel lg-surface" data-glass="panel"><h3>03 · 磁吸选项</h3><p>拖动中央透镜，松手后吸附到最近的选项凹槽。也可以点击或用键盘切换。</p><div id="dropSlot" class="optical-select-slot"></div></section>'+
  '<section class="lab-card glass-panel lg-surface" data-glass="panel"><h3>04 · 放大透镜</h3><p>在二维色域中拖动放大透镜，或使用键盘微调。当前数值仅用于交互展示。</p><div id="xySlot" class="optical-xy-slot"></div></section>'+
  '<section class="lab-card glass-panel lg-surface" data-glass="panel"><h3>05 · 光学选择</h3><p>选择后边缘会流过一道光，然后安静停驻。</p><div id="choicesSlot"></div></section>'+
  '<section class="lab-card glass-panel lg-surface" data-glass="panel"><h3>06 · 声音控制</h3><p>13 种原创合成提示音与速度感应的玻璃摩擦声。不会自动播放背景音乐。</p><div class="sound-card"><div class="sound-copy"><strong>交互音效</strong><small>点击、选择、拖动、完成与摩擦反馈</small></div><div id="labSoundSwitch"></div></div><div class="sound-slider" id="volumeSlot" style="margin-top:15px"></div><div id="soundTestSlot" style="margin-top:13px"></div></section></div>';
}
function renderPageMarkup(){
  switch(state.page){
    case 'subjects':return subjectsPage();
    case 'knowledge':return knowledgePage();
    case 'questions':return questionsPage();
    case 'objective':return objectivePage();
    case 'subjective':return subjectivePage();
    case 'lab':return labPage();
    default:return homePage();
  }
}
function render(){
  dispose();
  root.className='app-stage lg-stage theme-'+state.theme+' device-'+state.device;
  root.innerHTML=
  '<header class="app-topbar"><div class="brand"><div class="brand-mark">Z</div><div><div class="brand-name">ZJGK 2.0</div><div class="brand-sub">LIQUID GLASS EXPERIENCE · V0.2</div></div></div><div class="top-controls"><span class="control-label">APPEARANCE</span><div id="themeSlot" class="top-segment"></div><span class="control-label">DEVICE</span><div id="deviceSlot" class="top-segment device-segment"></div><div class="sound-pill"><span class="control-label">SOUND</span><div id="soundTopSlot"></div></div><div id="menuSlot" class="top-menu"></div></div></header>'+
  '<div class="app-layout"><aside class="sidebar"><div class="sidebar-title">YOUR STUDY SPACE</div><nav class="side-nav">'+
  '<button class="'+(state.page==='home'?'active':'')+'" data-route="home"><span class="nav-glyph">⌂</span>学习总览</button>'+
  '<button class="'+(state.page==='subjects'?'active':'')+'" data-route="subjects"><span class="nav-glyph">▦</span>科目题库</button>'+
  '<button class="'+(state.page==='knowledge'?'active':'')+'" data-route="knowledge"><span class="nav-glyph">◫</span>知识点目录</button>'+
  '<button class="'+(['questions','objective','subjective'].includes(state.page)?'active':'')+'" data-route="questions"><span class="nav-glyph">☷</span>题目列表</button>'+
  '<button class="'+(state.page==='lab'?'active':'')+'" data-route="lab"><span class="nav-glyph">✧</span>Glass 实验室</button></nav><div class="sidebar-bottom"><small>本周专注进度 · 演示</small><strong>42%</strong><div class="mini-track"><span></span></div></div></aside>'+
  '<main class="workspace"><div class="workspace-bar"><div class="breadcrumb">WORKSPACE　/　<strong>'+labels[state.page]+'</strong></div><div class="page-tools"><div id="searchSlot" class="search-slot"></div></div></div><div id="pageContent" class="page-content">'+renderPageMarkup()+'</div></main></div>'+
  '<div class="mobile-dock-wrap"><div id="dockSlot"></div></div>';

  mount('tabs',{label:'显示主题',value:state.theme,options:[{value:'glass',label:'Glass'},{value:'lite',label:'Lite'}],onChange:value=>{state.theme=value;render();}},document.getElementById('themeSlot'));
  mount('tabs',{label:'设备布局',value:state.device,options:[{value:'desktop',label:'桌面'},{value:'mobile',label:'手机'}],onChange:value=>{state.device=value;render();}},document.getElementById('deviceSlot'));
  const search=mount('search',{label:'搜索知识点或题目',placeholder:'搜索知识点或题目…',onChange:value=>{state.search=value;if(state.page==='questions')updateQuestionRows();}},document.getElementById('searchSlot'));
  if(state.search)search.setValue(state.search);
  search.element.querySelector('input').addEventListener('keydown',event=>{if(event.key==='Enter'&&state.page!=='questions'){state.page='questions';render();}});
  mount('switch',{label:'开启交互音效',checked:state.sound,onChange:value=>{state.sound=value;if(sound)sound.set({enabled:value,volume:state.volume});}},document.getElementById('soundTopSlot'));
  mount('menu',{label:'更多体验选项',options:[{value:'lab',label:'进入 Liquid Glass 实验室',icon:'sun'},{value:'home',label:'返回学习总览',icon:'home'},{value:'questions',label:'浏览演示题目',icon:'layers'}],onAction:value=>navigate(value)},document.getElementById('menuSlot'));
  mount('dock',{label:'主要导航',value:['home','subjects','knowledge','questions'].includes(state.page)?state.page:'questions',options:[{value:'home',label:'首页',icon:'home'},{value:'subjects',label:'科目',icon:'layers'},{value:'knowledge',label:'知识点',icon:'adjust'},{value:'questions',label:'题目',icon:'more'}],onChange:value=>navigate(value)},document.getElementById('dockSlot'));

  if(state.page==='home'){
    mount('button',{label:'开始探索',sound:'success',onPress:()=>navigate('subjects')},document.getElementById('heroCta'));
    mount('lens',{label:'可拖动的玻璃透镜',caption:'按住 · 拖动'},document.getElementById('heroLens'));
    mount('button',{label:'继续学习',sound:'select',onPress:()=>navigate('knowledge')},document.getElementById('continueButton'));
    progressHandle=mount('progress',{label:'本周专注进度',value:state.progress,max:100,wave:true,motion:'on'},document.getElementById('homeProgress'));
    mount('button',{label:'打开交互实验室',sound:'select',onPress:()=>navigate('lab')},document.getElementById('labButton'));
    const cardList=mount('card-list',{label:'推荐探索内容',previousLabel:'上一个内容',nextLabel:'下一个内容',items:[
      {id:'sets',label:'集合与逻辑',title:'集合与逻辑初步',description:'从元素与集合的关系开始，连接基础概念和真题。'},
      {id:'functions',label:'函数',title:'函数的表示与性质',description:'浏览定义域、值域、单调性等核心知识。'},
      {id:'sources',label:'题源追溯',title:'从题目返回原卷',description:'保留年份、原始题号、页码与来源审核状态。'}
    ]},document.getElementById('featureList'));
  }
  if(state.page==='questions'){
    mount('tabs',{label:'题源筛选',value:state.filter,options:[{value:'all',label:'全部题目'},{value:'省级真题',label:'省级真题'},{value:'模拟题',label:'模拟题'}],onChange:value=>{state.filter=value;updateQuestionRows();}},document.getElementById('filterSlot'));
  }
  if(state.page==='objective'){
    const opts=[{value:'A',label:'A　{1, 3}'},{value:'B',label:'B　{2, 4}'},{value:'C',label:'C　{2, 4, 6}'},{value:'D',label:'D　{1, 2, 3, 4, 6}'}];
    answerHandle=mount('choices',{label:'选择正确答案',value:state.answer||undefined,options:opts,onChange:value=>{state.answer=value;state.submitted=false;const feedback=document.getElementById('answerFeedback');if(feedback)feedback.classList.remove('show');}},document.getElementById('answerSlot'));
    mount('button',{label:'提交答案',sound:'success',onPress:()=>submitAnswer()},document.getElementById('submitSlot'));
  }
  if(state.page==='subjective'){
    mount('button',{label:'保存本次作答（演示）',sound:'success',onPress:()=>toast('已保存本地演示状态；图片未上传服务器。')},document.getElementById('saveWritten'));
  }
  if(state.page==='lab'){
    mount('tabs',{label:'玻璃材质',value:state.material,options:[{value:'thick',label:'厚润 Thick'},{value:'clear',label:'通透 Clear'},{value:'soft',label:'柔和 Soft'}],onChange:value=>{state.material=value;if(system)system.setMaterial(value);}},document.getElementById('materialTabs'));
    mount('tabs',{label:'背景场景',value:state.scene,options:[{value:'aurora',label:'流光'},{value:'ocean',label:'深海'},{value:'grid',label:'网格'}],onChange:value=>{state.scene=value;if(system)system.setScene(value);}},document.getElementById('sceneTabs'));
    mount('lens',{label:'拖动玻璃透镜',caption:'拖动我'},document.getElementById('demoLensSlot'));
    progressHandle=mount('progress',{label:'光导进度',value:state.progress,max:100,wave:true,motion:'on',completionColor:'gold',completeLabel:'已完成'},document.getElementById('labProgress'));
    const add=mount('button',{label:'推进 20%',sound:'tick',onPress:()=>{state.progress=Math.min(100,state.progress+20);progressHandle.setValue(state.progress,{emit:true});}},document.getElementById('progressActions'));
    mount('button',{label:'完成',sound:'success',onPress:()=>{state.progress=100;progressHandle.setValue(100,{emit:true});}},document.getElementById('progressActions'));
    mount('button',{label:'重置',sound:'reset',onPress:()=>{state.progress=0;progressHandle.setValue(0,{emit:true});}},document.getElementById('progressActions'));
    dropHandle=mount('drop-select',{label:'选择一个场景',value:state.drop,variant:'lens',options:[{value:'focus',label:'专注',icon:'focus'},{value:'daylight',label:'日光',icon:'sun'},{value:'evening',label:'晚间',icon:'moon'}],dragLabel:'拖动透镜并松手，吸附到最近选项'},document.getElementById('dropSlot'));
    xyHandle=mount('xy-slider',{label:'色彩二维调节',xLabel:'冷暖',yLabel:'明暗',value:{x:12,y:18},variant:'lens',instruction:'拖动放大透镜；方向键可微调，Home 重置。'},document.getElementById('xySlot'));
    mount('choices',{label:'选择一种氛围',value:state.choice,selectionColor:'gold',options:[{value:'focus',label:'专注'},{value:'daylight',label:'日光'},{value:'evening',label:'晚间'}],onChange:value=>{state.choice=value;}},document.getElementById('choicesSlot'));
    mount('switch',{label:'开启交互音效',checked:state.sound,onChange:value=>{state.sound=value;if(sound)sound.set({enabled:value,volume:state.volume});}},document.getElementById('labSoundSwitch'));
    volumeHandle=mount('slider',{label:'音量',min:0,max:100,step:1,value:Math.round(state.volume*100),onChange:value=>{state.volume=value/100;if(sound)sound.set({enabled:state.sound,volume:state.volume});}},document.getElementById('volumeSlot'));
    mount('button',{label:'试听完成音效',sound:'success',onPress:()=>{}},document.getElementById('soundTestSlot'));
  }

  if(state.theme==='glass'){
    system=createGlassSystem(root,{material:state.material,scene:state.scene,motion:true,audio:{enabled:state.sound,volume:state.volume,storageKey:'zjgk2.lens.sound.v1'},artwork,onFallback:error=>{root.classList.add('lens-fallback');console.warn('Lens WebGL fallback:',error);}});
    sound=system.sound;
  }else{
    sound=new GlassSound({enabled:state.sound,volume:state.volume,storageKey:'zjgk2.lens.sound.v1'});
    unbindSounds=bindControlSounds(root,sound);
    unbindFocus=bindKeyboardFocus(root);
  }
  const content=document.getElementById('pageContent');
  if(content&&!reducedMotion.matches)content.animate([{opacity:0,transform:'translateY(12px) scale(.995)',filter:'blur(3px)'},{opacity:1,transform:'none',filter:'blur(0)'}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'});
}
function updateQuestionRows(){const list=document.getElementById('questionList');if(list)list.innerHTML=questionRows();}
function submitAnswer(){
  if(!state.answer){toast('请先选择一个选项。');return;}
  state.submitted=true;
  const feedback=document.getElementById('answerFeedback');
  if(feedback){feedback.textContent=(state.answer==='B'?'回答正确。':'已提交。正确答案为 B。')+' 交集表示两个集合中共同拥有的元素。（演示反馈，不记录正式成绩）';feedback.classList.add('show');}

}
function navigate(page){if(!labels[page])return;state.page=page;if(page!=='objective'){state.submitted=false;state.answer='';}render();}
function toast(message){
  let el=document.getElementById('appToast');
  if(!el){el=node('div','app-toast');el.id='appToast';root.append(el);}
  el.textContent=message;el.classList.add('show');
  clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2200);
}
root.addEventListener('click',event=>{
  const route=event.target.closest('[data-route]');
  if(route){event.preventDefault();navigate(route.dataset.route);return;}
  const question=event.target.closest('[data-open-question]');
  if(question){state.questionId=question.dataset.openQuestion;state.page=question.dataset.openQuestion==='MATH-2022-14'?'subjective':'objective';state.answer='';state.submitted=false;navigate(state.page);return;}
});
root.addEventListener('change',event=>{
  if(event.target.id==='answerFiles'){
    const thumbs=document.getElementById('answerThumbs');if(!thumbs)return;thumbs.replaceChildren();
    for(const file of Array.from(event.target.files||[])){const img=node('img');img.alt=file.name;img.src=URL.createObjectURL(file);thumbs.append(img);}
  }
});
window.addEventListener('beforeunload',dispose,{once:true});
render();
