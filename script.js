// script.js
/* ============================================================
   DATA LAYER — storage helpers
   (COLORS, CAT_META and PRODUCTS now live in products.js)
   ============================================================ */
const CURRENCY='₱';

/* ---------- STORAGE (storage.js) ---------- */
const DB={
  get:(k,d)=>{try{return JSON.parse(localStorage.getItem('luxe_'+k))??d}catch(e){return d}},
  set:(k,v)=>localStorage.setItem('luxe_'+k,JSON.stringify(v))
};
let cart=DB.get('cart',[]);
let wishlist=DB.get('wishlist',[]);
let recentlyViewed=DB.get('recent',[]);
let orders=DB.get('orders',[]);
let notifications=DB.get('notifs',[
  {ic:'⚡',t:'Flash Sale is live!',s:'Up to 70% off ends soon',time:'2m ago'},
  {ic:'🚚',t:'Your order #LX2043 shipped',s:'Arriving in 2-3 days',time:'1h ago'},
  {ic:'🎁',t:'You earned a $5 voucher',s:'Use code LUXE5 at checkout',time:'1d ago'}
]);
let user=DB.get('user',null);

/* ============================================================
   ROUTER (app.js)
   ============================================================ */
let currentCat='All', currentFilters={cats:[],colors:[],rating:0,min:null,max:null,sort:'pop',flash:false,q:''};
function go(page,arg){
  progStart();
  closeAll();
  window.scrollTo({top:0,behavior:'instant'});
  setActiveNav(page,arg);
  const v=document.getElementById('view');
  v.style.animation='none'; void v.offsetWidth; v.style.animation='';
  if(page==='home') renderHome();
  else if(page==='products'){ resetFilters(); if(arg==='flash'){currentFilters.flash=true;} else if(arg){currentFilters.cats=[arg];} renderProducts(); }
  else if(page==='product') renderProductDetails(arg);
  else if(page==='cart') renderCartPage();
  else if(page==='wishlist') renderWishlist();
  else if(page==='checkout') renderCheckout();
  else if(page==='profile') renderProfile(arg);
  else if(page==='login') renderAuth('login');
  else if(page==='register') renderAuth('register');
  setTimeout(progEnd,300);
  setTimeout(initReveal,50);
}
function setActiveNav(page,arg){
  document.querySelectorAll('.navlink').forEach(n=>n.classList.remove('active'));
  const links=document.querySelectorAll('.navlink');
  if(page==='home') links[0].classList.add('active');
  else if(page==='products'){
    if(arg==='flash') links[7].classList.add('active');
    else if(arg){links.forEach(l=>{if(l.textContent.includes(arg))l.classList.add('active')});}
    else links[1].classList.add('active');
  }
}
function resetFilters(){currentFilters={cats:[],colors:[],rating:0,min:null,max:null,sort:'pop',flash:false,q:currentFilters.q||''};}

/* ============================================================
   RENDER: HOME (products.js views)
   ============================================================ */
const SLIDES=[
  {tint1:'#ff5a5f',tint2:'#f0b429',badge:'PREMIUM COLLECTION',h:'Gifts That Speak From the Heart',p:'Personalized keepsakes & elegant bouquets, handcrafted for your special moments.',btn:'Shop Now',cat:'Flower Bouquet'},
  {tint1:'#6c5ce7',tint2:'#00cec9',badge:'FLASH SALE ⚡',h:'Up to 70% Off Everything',p:'Limited-time deals on accessories, decor & more. Grab them before they’re gone!',btn:'Grab Deals',cat:'flash'},
  {tint1:'#e63946',tint2:'#ff8fb1',badge:'NEW ARRIVALS 🌸',h:'Fresh Blooms & Handmade Charm',p:'Discover our newest bouquets and personalized keychains this season.',btn:'Explore',cat:'Keychain'}
];
let slideIx=0, slideTimer=null;
function renderHome(){
  const flash=PRODUCTS.filter(p=>p.flash).slice(0,10);
  const nw=PRODUCTS.filter(p=>p.newArrival).slice(0,10);
  const best=[...PRODUCTS].sort((a,b)=>b.sold-a.sold).slice(0,10);
  const trend=PRODUCTS.filter(p=>p.trending).slice(0,10);
  const disc=[...PRODUCTS].filter(p=>p.off>0).sort((a,b)=>b.off-a.off).slice(0,10);
  const pop=[...PRODUCTS].sort((a,b)=>b.rating-a.rating).slice(0,10);

  document.getElementById('view').innerHTML=`
  <section class="hero container">
    <div class="hero-grid">
      <div class="slider" id="slider">
        ${SLIDES.map((s,i)=>`
          <div class="slide ${i===0?'active':''}" style="background:linear-gradient(120deg,${s.tint1},${s.tint2})">
            <div class="sc">
              <span class="badge2">${s.badge}</span>
              <h2>${s.h}</h2>
              <p>${s.p}</p>
              <button class="btn" style="background:#fff;color:#1a1d29" onclick="go('products','${s.cat}')">${s.btn} →</button>
            </div>
          </div>`).join('')}
        <button class="slide-arrow prev" onclick="moveSlide(-1)">‹</button>
        <button class="slide-arrow next" onclick="moveSlide(1)">›</button>
        <div class="slider-dots">${SLIDES.map((s,i)=>`<span class="${i===0?'active':''}" onclick="gotoSlide(${i})"></span>`).join('')}</div>
      </div>
      <div class="hero-side">
        <div class="hero-card" style="background:linear-gradient(120deg,#f0b429,#ff8a5f)" onclick="go('products','Souvenir')">
          <h3>🎁 Custom Souvenirs</h3><p>Make it unforgettable</p>
        </div>
        <div class="hero-card" style="background:linear-gradient(120deg,#6c5ce7,#00cec9)" onclick="go('products','Home Decor')">
          <h3>🖼️ Home Decor</h3><p>Style your space</p>
        </div>
      </div>
    </div>
    <div class="trust">
      ${[['🚚','Flat ₱20 Delivery','Nationwide shipping'],['🔒','Secure Payment','100% protected'],['🎨','Custom Made','Personalize anything'],['💬','24/7 Support','We are here for you']].map(t=>`
        <div class="t glass reveal"><div class="ic">${t[0]}</div><div><h5>${t[1]}</h5><p>${t[2]}</p></div></div>`).join('')}
    </div>
  </section>

  <section class="container section reveal">
    <div class="flash">
      <div class="flash-head">
        <div class="ttl">⚡ Flash Sale</div>
        <div class="countdown" id="countdown"></div>
        <div style="flex:1"></div>
        <a class="link-more" onclick="go('products','flash')">View All →</a>
      </div>
      <div class="prod-scroll">${flash.map(cardHTML).join('')}</div>
    </div>
  </section>

  <section class="container section reveal">
    <div class="section-head"><div class="section-title"><span class="bar"></span>Shop by Category</div></div>
    <div class="cat-grid">
      ${Object.keys(CAT_META).map(c=>{const cnt=PRODUCTS.filter(p=>p.category===c).length;const m=CAT_META[c];return `
        <div class="cat-tile glass" onclick="go('products','${c}')">
          <div class="emo">${m.emo}</div><h4>${c}</h4><p>${cnt} items</p>
        </div>`}).join('')}
    </div>
  </section>

  ${sectionScroll('🆕 New Arrivals',nw,'Fresh picks just for you','products')}
  ${sectionScroll('🔥 Best Sellers',best,'Loved by thousands','products')}
  ${sectionScroll('📈 Trending Now',trend,'What everyone is buying','products')}
  ${sectionScroll('🏷️ Biggest Discounts',disc,'Save the most today','flash')}
  ${sectionScroll('⭐ Popular Products',pop,'Top rated by customers','products')}

  <section class="container section reveal">
    <div class="section-head"><div class="section-title"><span class="bar"></span>What Customers Say</div></div>
    <div class="rev-grid">
      ${REVIEWS.map(r=>`
        <div class="rev glass">
          <div class="top"><div class="av">${r.n[0]}</div><div><h5>${r.n}</h5><p>${r.role}</p></div></div>
          <div class="stars">${stars(r.r)}</div>
          <q>${r.t}</q>
        </div>`).join('')}
    </div>
  </section>

  <section class="container section reveal">
    <div class="glass" style="border-radius:var(--radius-lg);padding:40px;text-align:center;background:linear-gradient(120deg,rgba(255,90,95,.1),rgba(108,92,231,.1))">
      <h2 style="font-size:clamp(22px,3vw,30px);font-weight:800;margin-bottom:8px">Ready to create something special? ✨</h2>
      <p style="color:var(--text-soft);margin-bottom:20px">Customize gifts with names, photos, messages & live preview.</p>
      <button class="btn btn-primary" onclick="go('products','Flower Bouquet')">Start Customizing</button>
    </div>
  </section>
  `;
  startSlider(); startCountdown(); initReveal();
}
const REVIEWS=[
  {n:'Sophia Laurent',role:'Verified Buyer',r:5,t:'The custom bouquet was breathtaking! The live preview matched exactly what arrived. Absolutely obsessed 💐'},
  {n:'Marcus Chen',role:'Verified Buyer',r:5,t:'Engraved keychain for my wife — the personalization options are incredible and shipping was fast.'},
  {n:'Amara Diallo',role:'Verified Buyer',r:4,t:'Beautiful home decor pieces. The quality feels premium and the packaging was gift-ready. Will buy again!'},
];
function sectionScroll(title,list,sub,dest){
  return `<section class="container section reveal">
    <div class="section-head">
      <div class="section-title"><span class="bar"></span>${title}</div>
      <a class="link-more" onclick="go('products','${dest}')">View All →</a>
    </div>
    <div class="prod-scroll">${list.map(cardHTML).join('')}</div>
  </section>`;
}

/* ============================================================
   PRODUCT CARD component (reusable)
   ============================================================ */
function stars(r){const full=Math.round(r);return '★'.repeat(full)+'☆'.repeat(5-full);}
function money(n){return CURRENCY+(+n).toFixed(2);}
function cardHTML(p){
  const fav=wishlist.includes(p.id)?'on':'';
  const badge=p.badge?`<span class="chip ${p.badge}">${p.badge}</span>`:'';
  const flashChip=p.flash&&p.badge!=='sale'?`<span class="chip sale">-${p.off}%</span>`:'';
  return `<div class="card" data-id="${p.id}">
    <div class="imgwrap">
      <img loading="lazy" src="${p.img}" alt="${p.name}" onclick="go('product',${p.id})"/>
      <div class="badges">${badge}${flashChip}</div>
      <button class="fav ${fav}" onclick="toggleWish(${p.id},this)">❤</button>
      <div class="hoveracts">
        <button class="qa" onclick="quickView(${p.id})">👁 Quick View</button>
        <button class="qa" onclick="buyNow(${p.id})">⚡ Buy Now</button>
      </div>
    </div>
    <div class="body">
      <div class="cat">${p.category}</div>
      <div class="name" onclick="go('product',${p.id})">${p.name}</div>
      <div class="rating"><span class="stars">${stars(p.rating)}</span> ${p.rating} · ${fmtSold(p.sold)} sold</div>
      <div class="priceline">
        <span class="price">${money(p.price)}</span>
        ${p.off?`<span class="old">${money(p.base)}</span><span class="off">-${p.off}%</span>`:''}
      </div>
      <div class="swatches">${p.colors.slice(0,5).map(c=>`<span class="swatch" style="background:${c.hex}" title="${c.name}" onclick="event.stopPropagation();go('product',${p.id})"></span>`).join('')}</div>
      <button class="addbtn" onclick="addToCart(${p.id},1,null,this)">🛒 Add to Cart</button>
    </div>
  </div>`;
}
function fmtSold(n){return n>999?(n/1000).toFixed(1)+'k':n;}

/* ============================================================
   RENDER: PRODUCTS LIST + FILTERS (filter.js)
   ============================================================ */
function renderProducts(){
  const allColors=Object.keys(COLORS);
  document.getElementById('view').innerHTML=`
  <div class="container" style="padding-top:24px">
    <div class="breadcrumb"><a onclick="go('home')">Home</a> › <span>${currentFilters.flash?'Flash Sale':(currentFilters.cats[0]||'All Products')}</span></div>
    <h1 class="pagetitle">${currentFilters.flash?'⚡ Flash Sale':(currentFilters.cats[0]||'All Products')}</h1>
    <p style="color:var(--text-soft);margin-bottom:22px">Discover our curated collection of premium handmade gifts.</p>
    <div class="shop-layout">
      <aside class="filters glass">
        <div class="fg">
          <h4>Category</h4>
          ${Object.keys(CAT_META).map(c=>`<label class="chk"><input type="checkbox" ${currentFilters.cats.includes(c)?'checked':''} onchange="fCat('${c}',this.checked)"> ${CAT_META[c].emo} ${c}</label>`).join('')}
        </div>
        <div class="fg">
          <h4>Price Range</h4>
          <div class="pricefields">
            <input type="number" id="fMin" placeholder="Min" value="${currentFilters.min??''}" oninput="fPrice()">
            <span>—</span>
            <input type="number" id="fMax" placeholder="Max" value="${currentFilters.max??''}" oninput="fPrice()">
          </div>
        </div>
        <div class="fg">
          <h4>Color</h4>
          <div class="color-opts">${allColors.map(c=>`<div class="co ${currentFilters.colors.includes(c)?'sel':''}" style="background:${COLORS[c]}" title="${c}" onclick="fColor('${c}',this)"></div>`).join('')}</div>
        </div>
        <div class="fg">
          <h4>Rating</h4>
          ${[4.5,4,3.5,3].map(r=>`<div class="rate-opt ${currentFilters.rating===r?'sel':''}" onclick="fRate(${r})"><span class="stars" style="color:var(--gold)">${stars(r)}</span> ${r} & up</div>`).join('')}
        </div>
        <button class="btn btn-ghost btn-block" onclick="clearFilters()">Clear Filters</button>
      </aside>
      <div>
        <div class="shop-top">
          <div class="result-count" id="resCount"></div>
          <div class="sortbar">
            ${[['pop','Popular'],['new','Newest'],['plow','Price ↑'],['phigh','Price ↓'],['rate','Rating'],['az','A-Z']].map(s=>`<button class="sb ${currentFilters.sort===s[0]?'active':''}" onclick="fSort('${s[0]}')">${s[1]}</button>`).join('')}
          </div>
        </div>
        <div class="grid" id="prodGrid"></div>
        <div id="loadMoreWrap" style="text-align:center;margin-top:26px"></div>
      </div>
    </div>
  </div>`;
  applyFilters();
}
let shownCount=12;
function getFiltered(){
  let list=PRODUCTS.slice();
  if(currentFilters.flash) list=list.filter(p=>p.flash);
  if(currentFilters.cats.length) list=list.filter(p=>currentFilters.cats.includes(p.category));
  if(currentFilters.colors.length) list=list.filter(p=>p.colors.some(c=>currentFilters.colors.includes(c.name)));
  if(currentFilters.rating) list=list.filter(p=>p.rating>=currentFilters.rating);
  if(currentFilters.min!=null) list=list.filter(p=>p.price>=currentFilters.min);
  if(currentFilters.max!=null) list=list.filter(p=>p.price<=currentFilters.max);
  if(currentFilters.q){const q=currentFilters.q.toLowerCase();list=list.filter(p=>p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q));}
  const s=currentFilters.sort;
  if(s==='new') list.sort((a,b)=>b.id-a.id);
  else if(s==='plow') list.sort((a,b)=>a.price-b.price);
  else if(s==='phigh') list.sort((a,b)=>b.price-a.price);
  else if(s==='rate') list.sort((a,b)=>b.rating-a.rating);
  else if(s==='az') list.sort((a,b)=>a.name.localeCompare(b.name));
  else list.sort((a,b)=>b.sold-a.sold);
  return list;
}
function applyFilters(){
  const grid=document.getElementById('prodGrid'); if(!grid)return;
  // skeleton
  grid.innerHTML=Array(8).fill(`<div class="skl"><div class="sh shimmer"></div><div class="sb"><div class="sl shimmer" style="width:40%"></div><div class="sl shimmer"></div><div class="sl shimmer" style="width:60%"></div></div></div>`).join('');
  setTimeout(()=>{
    const list=getFiltered();
    document.getElementById('resCount').textContent=`${list.length} product${list.length!==1?'s':''} found`;
    const slice=list.slice(0,shownCount);
    grid.innerHTML=slice.length?slice.map(cardHTML).join(''):`<div class="empty-state" style="grid-column:1/-1"><div class="em">🔍</div><h3>No products found</h3><p>Try adjusting your filters</p><button class="btn btn-primary" onclick="clearFilters()">Reset Filters</button></div>`;
    const lm=document.getElementById('loadMoreWrap');
    lm.innerHTML=list.length>shownCount?`<button class="btn btn-ghost" onclick="loadMore()">Load More (${list.length-shownCount} more)</button>`:'';
    initReveal();
  },350);
}
function loadMore(){shownCount+=8;applyFilters();}
function fCat(c,on){shownCount=12;if(on)currentFilters.cats.push(c);else currentFilters.cats=currentFilters.cats.filter(x=>x!==c);currentFilters.flash=false;applyFilters();}
function fColor(c,el){shownCount=12;el.classList.toggle('sel');if(currentFilters.colors.includes(c))currentFilters.colors=currentFilters.colors.filter(x=>x!==c);else currentFilters.colors.push(c);applyFilters();}
function fRate(r){shownCount=12;currentFilters.rating=currentFilters.rating===r?0:r;document.querySelectorAll('.rate-opt').forEach(e=>e.classList.remove('sel'));applyFilters();renderProducts();}
function fPrice(){shownCount=12;const mn=document.getElementById('fMin').value,mx=document.getElementById('fMax').value;currentFilters.min=mn===''?null:+mn;currentFilters.max=mx===''?null:+mx;clearTimeout(window._pt);window._pt=setTimeout(applyFilters,400);}
function fSort(s){shownCount=12;currentFilters.sort=s;document.querySelectorAll('.sortbar .sb').forEach(b=>b.classList.remove('active'));event.target.classList.add('active');applyFilters();}
function clearFilters(){resetFilters();currentFilters.q='';renderProducts();}

/* ============================================================
   SEARCH (search.js)
   ============================================================ */
const searchInput=document.getElementById('searchInput');
searchInput.value=DB.get('lastSearch','');
searchInput.addEventListener('input',()=>{
  const q=searchInput.value.trim().toLowerCase();
  const box=document.getElementById('suggestBox');
  if(!q){box.classList.add('hidden');return;}
  const matches=PRODUCTS.filter(p=>p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q)).slice(0,6);
  const cats=Object.keys(CAT_META).filter(c=>c.toLowerCase().includes(q));
  box.innerHTML=`
    ${cats.length?`<h5>Categories</h5>${cats.map(c=>`<div class="sitem" onclick="go('products','${c}');clearSuggest()"><div style="font-size:22px">${CAT_META[c].emo}</div><div><div style="font-weight:600;font-size:13px">${c}</div><div class="stag">Browse category</div></div></div>`).join('')}`:''}
    ${matches.length?`<h5>Products</h5>${matches.map(p=>`<div class="sitem" onclick="go('product',${p.id});clearSuggest()"><img src="${p.img}"><div style="flex:1"><div style="font-weight:600;font-size:13px">${p.name}</div><div class="stag">${p.category} · ${money(p.price)}</div></div></div>`).join('')}`:'<div class="empty" style="padding:20px;text-align:center;color:var(--text-mute);font-size:13px">No results — try another keyword</div>'}
  `;
  box.classList.remove('hidden');
});
searchInput.addEventListener('keydown',e=>{if(e.key==='Enter')doSearch();});
function clearSuggest(){document.getElementById('suggestBox').classList.add('hidden');}
function doSearch(){
  const q=searchInput.value.trim();
  DB.set('lastSearch',q);
  clearSuggest();
  resetFilters();currentFilters.q=q;
  go('products'); currentFilters.q=q; renderProducts();
}
document.addEventListener('click',e=>{if(!e.target.closest('.searchwrap'))clearSuggest();});

/* ============================================================
   PRODUCT DETAILS + CUSTOMIZATION + PREVIEW
   ============================================================ */
let pdState={};
function renderProductDetails(id){
  const p=PRODUCTS.find(x=>x.id===id); if(!p){go('home');return;}
  addRecent(id);
  pdState={id,color:0,qty:1,custom:{}};
  const related=PRODUCTS.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,10);
  document.getElementById('view').innerHTML=`
  <div class="container" style="padding-top:24px">
    <div class="breadcrumb"><a onclick="go('home')">Home</a> › <a onclick="go('products','${p.category}')">${p.category}</a> › <span>${p.name}</span></div>
    <div class="pd-grid">
      <div class="pd-gallery">
        <div class="pd-main" id="pdMain" onmousemove="zoomMove(event)" onmouseleave="zoomOut()">
          <img id="pdImg" src="${p.colors[0].img}" alt="${p.name}"/>
          <button class="btn btn-ghost pd-360btn" onclick="toggle360()">🔄 360° View</button>
        </div>
        <div class="pd-thumbs" id="pdThumbs">
          ${p.colors.map((c,i)=>`<div class="th ${i===0?'sel':''}" onclick="selColor(${i})"><img src="${c.img}"></div>`).join('')}
        </div>
      </div>
      <div class="pd-info">
        ${p.badge?`<span class="chip ${p.badge}" style="margin-bottom:10px;display:inline-block">${p.badge}</span>`:''}
        <h1>${p.name}</h1>
        <div class="pd-meta">
          <span><span class="stars">${stars(p.rating)}</span> ${p.rating}</span>
          <span>💬 ${Math.floor(p.sold/12)} reviews</span>
          <span>🛒 ${fmtSold(p.sold)} sold</span>
        </div>
        <div class="pd-price">
          <span class="now" id="pdPrice">${money(p.price)}</span>
          ${p.off?`<span class="was">${money(p.base)}</span><span class="save">Save ${p.off}%</span>`:''}
        </div>
        <div class="pd-block">
          <div class="lbl">Color: <span id="pdColorName" style="color:var(--primary)">${p.colors[0].name}</span></div>
          <div class="pd-colors" id="pdColors">
            ${p.colors.map((c,i)=>`<div class="pd-color ${i===0?'sel':''}" onclick="selColor(${i})"><span class="dot" style="background:${c.hex}"></span><span>${c.name}</span></div>`).join('')}
          </div>
        </div>
        <div class="pd-block">
          <div class="lbl">Availability: <span id="pdStock" style="color:var(--success)">${p.colors[0].stock} in stock</span></div>
          <div class="stockbar"><i id="pdStockBar" style="width:${Math.min(100,p.colors[0].stock)}%"></i></div>
        </div>
        ${customPanel(p)}
        <div class="pd-block">
          <div class="lbl">Quantity</div>
          <div class="qtybox"><button onclick="pdQty(-1)">−</button><span id="pdQty">1</span><button onclick="pdQty(1)">+</button></div>
        </div>
        <div class="pd-cta">
          <button class="btn btn-outline" onclick="addToCartPD()">🛒 Add to Cart</button>
          <button class="btn btn-primary" onclick="buyNowPD()">⚡ Buy Now</button>
          <button class="btn btn-ghost" onclick="toggleWish(${p.id},this)" id="pdWish">${wishlist.includes(p.id)?'❤️ Saved':'🤍 Wishlist'}</button>
        </div>
      </div>
    </div>

    <div class="pd-tabs">
      <button class="pd-tab active" onclick="pdTab(0,this)">Description</button>
      <button class="pd-tab" onclick="pdTab(1,this)">Specifications</button>
      <button class="pd-tab" onclick="pdTab(2,this)">Reviews</button>
      <button class="pd-tab" onclick="pdTab(3,this)">Shipping</button>
    </div>
    <div class="pd-panel active">${p.desc}<br><br>Every item is inspected by our artisans before dispatch to ensure it meets our premium standard. Thoughtful packaging makes it ready to gift on arrival.</div>
    <div class="pd-panel"><table class="spec-table">${Object.entries(p.specs).map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}<tr><td>Available Colors</td><td>${p.colors.map(c=>c.name).join(', ')}</td></tr></table></div>
    <div class="pd-panel">
      <div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;margin-bottom:20px">
        <div style="text-align:center"><div style="font-size:44px;font-weight:800;color:var(--primary)">${p.rating}</div><div class="stars" style="color:var(--gold)">${stars(p.rating)}</div><div style="font-size:12px;color:var(--text-mute)">${Math.floor(p.sold/12)} reviews</div></div>
        <div style="flex:1;min-width:200px">${[5,4,3,2,1].map(s=>{const w=s===Math.round(p.rating)?70:s===Math.round(p.rating)-1?20:5;return `<div style="display:flex;align-items:center;gap:8px;font-size:12px;margin:3px 0"><span>${s}★</span><div class="stockbar" style="flex:1;max-width:none"><i style="width:${w}%"></i></div></div>`}).join('')}</div>
      </div>
      ${REVIEWS.concat([{n:'Elena Rossi',role:'Verified',r:5,t:'Exceeded expectations. Looks even better in person!'}]).map(r=>`<div class="rev glass" style="margin-bottom:12px"><div class="top"><div class="av">${r.n[0]}</div><div><h5>${r.n}</h5><div class="stars" style="color:var(--gold);font-size:12px">${stars(r.r)}</div></div></div><q>${r.t}</q></div>`).join('')}
    </div>
    <div class="pd-panel">
      <p>🚚 <b>Delivery</b> — Delivered to your address · Flat ₱20.00</p><br>
      <p>🏪 <b>Store Pickup</b> — Ready in 2 hours · Free</p><br>
      <p>↩️ <b>Returns</b> — 30-day hassle-free returns on all items.</p>
    </div>

    ${sectionScroll('You May Also Like',related,'','products')}
  </div>`;
  initReveal();
}
function customPanel(p){
  if(p.custom==='none'||!p.custom) return '';
  const fields=CUSTOM_FIELDS[p.custom]||[];
  if(!fields.length) return '';
  return `<div class="custom-box">
    <h4>🎨 Personalize This ${p.category}</h4>
    <div class="hint">Make it uniquely yours — preview updates live below.</div>
    ${fields.map(f=>fieldHTML(f)).join('')}
    <div class="preview-card" id="pvCard" style="background:${p.tint};color:#5b3a4a">
      <div class="pv-title">Live Preview</div>
      <div class="preview-emoji" id="pvEmoji">${p.emo}</div>
      <div class="preview-name" id="pvName" style="font-size:20px"></div>
      <div class="preview-msg" id="pvMsg"></div>
      <div class="preview-msg" id="pvExtra" style="font-size:12px;opacity:.75"></div>
    </div>
  </div>`;
}
const CUSTOM_FIELDS={
  bouquet:[
    {k:'name',t:'text',l:'Customer Name',ph:'e.g. Isabella'},
    {k:'msg',t:'text',l:'Ribbon Message',ph:'e.g. With all my love'},
    {k:'card',t:'textarea',l:'Greeting Card / Gift Note',ph:'Write your heartfelt note...'},
    {k:'count',t:'select',l:'Number of Flowers',o:['6 stems','12 stems','24 stems','36 stems']},
    {k:'fcolor',t:'color',l:'Flower Color',v:'#ff8fb1'},
    {k:'wrap',t:'color',l:'Wrapper Color',v:'#f0b429'}
  ],
  accessories:[
    {k:'name',t:'text',l:'Name Engraving',ph:'e.g. Sofia'},
    {k:'msg',t:'text',l:'Text Engraving',ph:'e.g. Forever'},
    {k:'font',t:'select',l:'Font Style',o:['Elegant Script','Modern Sans','Classic Serif','Bold Block']},
    {k:'fcolor',t:'color',l:'Font Color',v:'#1a1d29'},
    {k:'logo',t:'file',l:'Logo / Image Upload'}
  ],
  keychain:[
    {k:'name',t:'text',l:'Name',ph:'e.g. Liam & Emma'},
    {k:'date',t:'text',l:'Special Date',ph:'e.g. 14.02.2026'},
    {k:'emoji',t:'select',l:'Emoji',o:['❤️','⭐','🐾','🌸','🎵','⚓','🚗','🔑']},
    {k:'material',t:'select',l:'Material',o:['Acrylic','Metal','Wood','Resin','Leather']},
    {k:'photo',t:'file',l:'Photo Upload'}
  ],
  decor:[
    {k:'msg',t:'text',l:'Custom Quote',ph:'e.g. Home Sweet Home'},
    {k:'name',t:'text',l:'Family Name',ph:'e.g. The Bennetts'},
    {k:'size',t:'select',l:'Custom Size',o:['A4 (21×30cm)','A3 (30×42cm)','Square (30×30cm)','Large (50×70cm)']},
    {k:'fcolor',t:'color',l:'Frame Color',v:'#1a1d29'},
    {k:'wrap',t:'color',l:'Background Color',v:'#e8ffe0'},
    {k:'photo',t:'file',l:'Photo Upload'}
  ],
  souvenir:[
    {k:'event',t:'select',l:'Event Type',o:['Wedding 💍','Birthday 🎂','Christening 🕊️','Graduation 🎓','Anniversary 💕']},
    {k:'name',t:'text',l:'Event / Couple Name',ph:'e.g. Jack & Rose'},
    {k:'msg',t:'textarea',l:'Custom Message',ph:'Thank you for celebrating with us...'},
    {k:'fcolor',t:'color',l:'Custom Color',v:'#6c5ce7'},
    {k:'logo',t:'file',l:'Custom Logo Upload'}
  ]
};
function fieldHTML(f){
  if(f.t==='select') return `<div class="field"><label>${f.l}</label><select oninput="onCustom('${f.k}',this.value)">${f.o.map(o=>`<option>${o}</option>`).join('')}</select></div>`;
  if(f.t==='textarea') return `<div class="field"><label>${f.l}</label><textarea rows="2" placeholder="${f.ph||''}" oninput="onCustom('${f.k}',this.value)"></textarea></div>`;
  if(f.t==='color') return `<div class="field"><label>${f.l}</label><div class="color-inline"><input type="color" value="${f.v}" oninput="onCustom('${f.k}',this.value)"><span style="font-size:12px;color:var(--text-mute)">Tap to pick</span></div></div>`;
  if(f.t==='file') return `<div class="field"><label>${f.l}</label><input type="file" accept="image/*" onchange="onCustomFile('${f.k}',this)"></div>`;
  return `<div class="field"><label>${f.l}</label><input type="text" placeholder="${f.ph||''}" oninput="onCustom('${f.k}',this.value)"></div>`;
}
function onCustom(k,v){pdState.custom[k]=v;updatePreview();}
function onCustomFile(k,el){
  const f=el.files[0]; if(!f)return;
  const r=new FileReader(); r.onload=e=>{pdState.custom[k]=e.target.result;pdState.custom['_img']=e.target.result;updatePreview();}; r.readAsDataURL(f);
}
function updatePreview(){
  const c=pdState.custom, p=PRODUCTS.find(x=>x.id===pdState.id);
  const card=document.getElementById('pvCard'); if(!card)return;
  const nameEl=document.getElementById('pvName'),msgEl=document.getElementById('pvMsg'),exEl=document.getElementById('pvExtra'),emEl=document.getElementById('pvEmoji');
  // animate morph
  card.style.transform='scale(.97)';setTimeout(()=>card.style.transform='',200);
  if(c.wrap) card.style.background=c.wrap;
  if(c.fcolor){card.style.color=c.fcolor;}
  if(c.emoji) emEl.textContent=c.emoji;
  if(c._img){emEl.innerHTML=`<img src="${c._img}" style="width:90px;height:90px;border-radius:14px;object-fit:cover;box-shadow:var(--shadow-md)">`;}
  nameEl.textContent=c.name||'';
  nameEl.style.fontFamily = c.font==='Elegant Script'?'cursive':c.font==='Classic Serif'?'Georgia,serif':c.font==='Bold Block'?'Impact,sans-serif':'inherit';
  msgEl.textContent=c.msg||c.card||c.event||'';
  const extras=[];
  if(c.date) extras.push('📅 '+c.date);
  if(c.count) extras.push('💐 '+c.count);
  if(c.material) extras.push('🔧 '+c.material);
  if(c.size) extras.push('📐 '+c.size);
  exEl.textContent=extras.join('  ·  ');
}
function selColor(i){
  const p=PRODUCTS.find(x=>x.id===pdState.id); pdState.color=i; const c=p.colors[i];
  const img=document.getElementById('pdImg');
  img.style.opacity='0';img.style.transform='scale(1.1)';
  setTimeout(()=>{img.src=c.img;img.style.opacity='1';img.style.transform='';},220);
  document.getElementById('pdColorName').textContent=c.name;
  document.getElementById('pdStock').textContent=c.stock+' in stock';
  document.getElementById('pdStockBar').style.width=Math.min(100,c.stock)+'%';
  document.querySelectorAll('#pdColors .pd-color').forEach((e,ix)=>e.classList.toggle('sel',ix===i));
  document.querySelectorAll('#pdThumbs .th').forEach((e,ix)=>e.classList.toggle('sel',ix===i));
}
function pdQty(d){pdState.qty=Math.max(1,pdState.qty+d);document.getElementById('pdQty').textContent=pdState.qty;}
function pdTab(i,el){document.querySelectorAll('.pd-tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');document.querySelectorAll('.pd-panel').forEach((p,ix)=>p.classList.toggle('active',ix===i));}
function toggle360(){document.getElementById('pdMain').classList.toggle('view360');}
function zoomMove(e){const m=e.currentTarget,img=m.querySelector('img'),r=m.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;img.style.transformOrigin=`${x}% ${y}%`;img.style.transform='scale(2)';}
function zoomOut(){const img=document.getElementById('pdImg');if(!document.getElementById('pdMain').classList.contains('view360'))img.style.transform='';}
function addToCartPD(){const p=PRODUCTS.find(x=>x.id===pdState.id);addToCart(p.id,pdState.qty,{color:p.colors[pdState.color].name,custom:{...pdState.custom}});}
function buyNowPD(){addToCartPD();setTimeout(()=>go('checkout'),400);}

/* ============================================================
   CART (cart.js)
   ============================================================ */
function addToCart(id,qty=1,opts=null,btn=null){
  const p=PRODUCTS.find(x=>x.id===id);
  if(btn) flyToCart(btn,p.img);
  const color=opts?.color||p.colors[0].name;
  const key=id+'|'+color+'|'+JSON.stringify(opts?.custom||{});
  const ex=cart.find(c=>c.key===key);
  if(ex) ex.qty+=qty;
  else cart.push({key,id,qty,color,custom:opts?.custom||{},selected:true});
  DB.set('cart',cart);
  updateCartBadge();
  bumpCartIcon();
  toast('Added to cart 🛒');
  if(document.querySelector('.cart-layout')) renderCartPage?.();
  renderCartDrawer();
}
function flyToCart(btn,src){
  const cartBtn=document.getElementById('cartIconBtn').getBoundingClientRect();
  const r=btn.getBoundingClientRect();
  const fly=document.createElement('img'); fly.src=src; fly.className='fly';
  fly.style.left=r.left+'px';fly.style.top=r.top+'px';fly.style.width='60px';fly.style.height='60px';
  document.body.appendChild(fly);
  requestAnimationFrame(()=>{
    fly.style.transition='all .8s cubic-bezier(.5,-.3,.5,1)';
    fly.style.left=cartBtn.left+'px';fly.style.top=cartBtn.top+'px';
    fly.style.width='20px';fly.style.height='20px';fly.style.opacity='.3';fly.style.transform='rotate(180deg)';
  });
  setTimeout(()=>fly.remove(),820);
}
function bumpCartIcon(){const b=document.getElementById('cartIconBtn');b.style.animation='none';void b.offsetWidth;b.style.animation='heartpop .5s';}
function updateCartBadge(){
  const n=cart.reduce((s,c)=>s+c.qty,0);
  const b=document.getElementById('cartBadge');b.textContent=n;b.classList.toggle('hidden',n===0);
}
function updateWishBadge(){const b=document.getElementById('wishBadge');b.textContent=wishlist.length;b.classList.toggle('hidden',wishlist.length===0);}
function cartTotals(){
  let sub=0;cart.forEach(c=>{if(c.selected){const p=PRODUCTS.find(x=>x.id===c.id);sub+=p.price*c.qty;}});
  const ship=sub===0?0:20;
  const tax=+(sub*0.00).toFixed(2);
  const disc=window._voucher||0;
  const total=Math.max(0,sub+ship+tax-disc);
  return {sub,ship,tax,disc,total};
}
window._voucher=DB.get('voucher',0);
function renderCartPage(){
  const t=cartTotals();
  const view=document.getElementById('view');
  if(!cart.length){view.innerHTML=cartEmpty();return;}
  view.innerHTML=`
  <div class="container" style="padding-top:24px">
    <div class="breadcrumb"><a onclick="go('home')">Home</a> › <span>Shopping Cart</span></div>
    <h1 class="pagetitle">🛒 Shopping Cart</h1>
    <div class="cart-layout">
      <div>
        <div class="glass" style="border-radius:14px;padding:12px 16px;margin-bottom:14px;display:flex;align-items:center;gap:10px">
          <label class="chk" style="margin:0"><input type="checkbox" id="selAll" ${cart.every(c=>c.selected)?'checked':''} onchange="selectAll(this.checked)"> Select All (${cart.length})</label>
          <div style="flex:1"></div>
          <button class="btn btn-ghost" style="padding:8px 16px;font-size:13px" onclick="clearCart()">🗑 Clear Cart</button>
        </div>
        ${cart.map((c,ix)=>{const p=PRODUCTS.find(x=>x.id===c.id);const cust=Object.keys(c.custom||{}).filter(k=>k[0]!=='_'&&c.custom[k]);return `
          <div class="cart-item glass">
            <label class="chk" style="margin:0"><input type="checkbox" ${c.selected?'checked':''} onchange="toggleSel(${ix},this.checked)"></label>
            <img src="${p.img}">
            <div>
              <div class="ci-name" onclick="go('product',${p.id})" style="cursor:pointer">${p.name}</div>
              <div class="ci-var">Color: ${c.color}${cust.length?' · Personalized ✨':''}</div>
              ${cust.length?`<div class="ci-var" style="color:var(--accent)">${cust.map(k=>`${k}: ${String(c.custom[k]).slice(0,18)}`).join(' · ')}</div>`:''}
              <div class="ci-price">${money(p.price*c.qty)}</div>
            </div>
            <div class="ci-right">
              <button class="del" onclick="removeItem(${ix})">🗑</button>
              <div class="qtybox"><button onclick="itemQty(${ix},-1)">−</button><span>${c.qty}</span><button onclick="itemQty(${ix},1)">+</button></div>
            </div>
          </div>`}).join('')}
      </div>
      <aside class="summary glass">
        <h3>Order Summary</h3>
        <div class="voucher"><input id="voucherInput" placeholder="Voucher code (try LUXE5)"><button class="btn btn-accent" style="padding:10px 16px" onclick="applyVoucher()">Apply</button></div>
        <div class="sum-row"><span>Subtotal</span><span>${money(t.sub)}</span></div>
        <div class="sum-row"><span>Shipping</span><span>${t.ship?money(t.ship):'FREE'}</span></div>
        <div class="sum-row"><span>Tax (8%)</span><span>${money(t.tax)}</span></div>
        ${t.disc?`<div class="sum-row" style="color:var(--success)"><span>Discount</span><span>-${money(t.disc)}</span></div>`:''}
        <div class="sum-row total"><span>Total</span><span>${money(t.total)}</span></div>
        <button class="btn btn-primary btn-block" style="margin-top:16px" onclick="go('checkout')">Proceed to Checkout →</button>
        <p style="font-size:12px;color:var(--text-mute);text-align:center;margin-top:12px">🔒 Secure checkout · 30-day returns</p>
      </aside>
    </div>
  </div>`;
}
function cartEmpty(){return `<div class="container"><div class="empty-state"><div class="em">🛒</div><h3>Your cart is empty</h3><p>Looks like you haven't added anything yet.</p><button class="btn btn-primary" onclick="go('products')">Start Shopping</button></div></div>`;}
function selectAll(on){cart.forEach(c=>c.selected=on);DB.set('cart',cart);renderCartPage();updateCartBadge();}
function toggleSel(ix,on){cart[ix].selected=on;DB.set('cart',cart);renderCartPage();}
function itemQty(ix,d){cart[ix].qty=Math.max(1,cart[ix].qty+d);DB.set('cart',cart);updateCartBadge();renderCartPage();renderCartDrawer();}
function removeItem(ix){cart.splice(ix,1);DB.set('cart',cart);updateCartBadge();renderCartPage();renderCartDrawer();toast('Item removed');}
function clearCart(){cart=[];DB.set('cart',cart);updateCartBadge();renderCartPage();renderCartDrawer();}
function applyVoucher(){const v=document.getElementById('voucherInput').value.trim().toUpperCase();const codes={'LUXE5':5,'LUXE10':10,'WELCOME':8};if(codes[v]){window._voucher=codes[v];DB.set('voucher',window._voucher);toast('Voucher applied! -'+money(codes[v]));renderCartPage();}else{toast('Invalid voucher code','err');}}
function buyNow(id){addToCart(id,1);setTimeout(()=>go('checkout'),350);}

/* cart drawer */
function openCart(){renderCartDrawer();document.getElementById('overlay').classList.add('show');document.getElementById('cartDrawer').classList.add('show');}
function renderCartDrawer(){
  const t=cartTotals();
  document.getElementById('cartDrawer').innerHTML=`
    <div class="dhead"><h3>🛒 My Cart (${cart.reduce((s,c)=>s+c.qty,0)})</h3><button class="iconbtn" onclick="closeAll()">✕</button></div>
    <div class="dbody">
      ${cart.length?cart.map((c,ix)=>{const p=PRODUCTS.find(x=>x.id===c.id);return `
        <div class="mini-item">
          <img src="${p.img}">
          <div><div style="font-size:13px;font-weight:600;line-height:1.3">${p.name}</div><div style="font-size:12px;color:var(--text-mute)">${c.color} · Qty ${c.qty}</div><div style="font-size:13px;font-weight:800;color:var(--primary)">${money(p.price*c.qty)}</div></div>
          <button class="del iconbtn" style="width:32px;height:32px" onclick="removeItem(${ix})">🗑</button>
        </div>`}).join(''):'<div class="empty-state" style="padding:40px 10px"><div class="em">🛍️</div><h3 style="font-size:16px">Cart is empty</h3></div>'}
    </div>
    <div class="dfoot">
      <div class="sum-row total" style="border:none;padding:0;margin-bottom:12px"><span>Total</span><span>${money(t.total)}</span></div>
      <button class="btn btn-ghost btn-block" style="margin-bottom:8px" onclick="go('cart')">View Full Cart</button>
      <button class="btn btn-primary btn-block" onclick="go('checkout')" ${!cart.length?'disabled style=opacity:.5':''}>Checkout →</button>
    </div>`;
}

/* ============================================================
   WISHLIST (wishlist.js)
   ============================================================ */
function toggleWish(id,el){
  const i=wishlist.indexOf(id);
  if(i>-1){wishlist.splice(i,1);toast('Removed from wishlist');}
  else{wishlist.push(id);toast('Saved to wishlist ❤️');if(el)el.classList.add('on');}
  DB.set('wishlist',wishlist);updateWishBadge();
  document.querySelectorAll(`.card[data-id="${id}"] .fav`).forEach(f=>f.classList.toggle('on',wishlist.includes(id)));
  const pw=document.getElementById('pdWish');if(pw)pw.innerHTML=wishlist.includes(id)?'❤️ Saved':'🤍 Wishlist';
  if(document.getElementById('wishGrid'))renderWishlist();
}
function renderWishlist(){
  const list=PRODUCTS.filter(p=>wishlist.includes(p.id));
  document.getElementById('view').innerHTML=`
  <div class="container" style="padding-top:24px">
    <div class="breadcrumb"><a onclick="go('home')">Home</a> › <span>Wishlist</span></div>
    <h1 class="pagetitle">❤️ My Wishlist</h1>
    <p style="color:var(--text-soft);margin-bottom:22px">${list.length} saved item${list.length!==1?'s':''}</p>
    ${list.length?`<div class="grid" id="wishGrid">${list.map(cardHTML).join('')}</div>`:`<div class="empty-state" id="wishGrid"><div class="em">💔</div><h3>No favorites yet</h3><p>Tap the heart on any product to save it here.</p><button class="btn btn-primary" onclick="go('products')">Browse Products</button></div>`}
  </div>`;
  initReveal();
}

/* ============================================================
   CHECKOUT (checkout.js)
   ============================================================ */
let coState={ship:'delivery',pay:'gcash'};
function renderCheckout(){
  const items=cart.filter(c=>c.selected);
  if(!items.length){document.getElementById('view').innerHTML=cartEmpty();return;}
  const t=cartTotals();
  const shipCost=coState.ship==='pickup'?0:20;
  const total=Math.max(0,t.sub+shipCost+t.tax-t.disc);
  document.getElementById('view').innerHTML=`
  <div class="container" style="padding-top:24px">
    <div class="breadcrumb"><a onclick="go('home')">Home</a> › <a onclick="go('checkout')">Cart</a> › <span>Checkout</span></div>
    <h1 class="pagetitle">Checkout</h1>
    <div class="checkout-grid" style="margin-top:18px">
      <div>
        <div class="co-card glass">
          <h3>📍 Shipping Address</h3>
          <div class="field-row"><div class="field"><label>Full Name</label><input id="coName" value="${user?.name||''}" placeholder="Jane Doe"></div><div class="field"><label>Phone</label><input id="coPhone" placeholder="+1 555 000 0000"></div></div>
          <div class="field"><label>Address</label><input id="coAddr" placeholder="123 Blossom Street, Apt 4"></div>
          <div class="field-row"><div class="field"><label>City</label><input id="coCity" placeholder="New York"></div><div class="field"><label>Postal Code</label><input id="coZip" placeholder="10001"></div></div>
        </div>
        <div class="co-card glass">
          <h3>🚚 Delivery Option</h3>
          <div class="opt-list">
            ${[['delivery','🚚','Delivery','Delivered to your address','₱20.00'],['pickup','🏪','Store Pickup','Ready in 2 hours','FREE']].map(o=>`
              <div class="opt ${coState.ship===o[0]?'sel':''}" onclick="setShip('${o[0]}')"><div class="oi">${o[1]}</div><div class="ot"><h5>${o[2]}</h5><p>${o[3]}</p></div><div class="op">${o[4]}</div></div>`).join('')}
          </div>
        </div>
        <div class="co-card glass">
          <h3>💳 Payment Method</h3>
          <div class="opt-list">
            ${[['gcash','💙','GCash','Pay via GCash','QR / mobile number'],['gpay','📱','Google Pay','One-tap checkout',''],['cod','💵','Cash on Delivery','Pay when it arrives','']].map(o=>`
              <div class="opt ${coState.pay===o[0]?'sel':''}" onclick="setPay('${o[0]}')"><div class="oi">${o[1]}</div><div class="ot"><h5>${o[2]}</h5><p>${o[3]}</p></div>${o[4]?`<div class="op" style="font-size:12px;font-weight:600">${o[4]}</div>`:''}</div>`).join('')}
          </div>
        </div>
      </div>
      <aside class="summary glass">
        <h3>Order Summary</h3>
        <div style="max-height:220px;overflow:auto;margin-bottom:10px">
        ${items.map(c=>{const p=PRODUCTS.find(x=>x.id===c.id);return `<div class="mini-item"><img src="${p.img}"><div><div style="font-size:12.5px;font-weight:600">${p.name}</div><div style="font-size:11px;color:var(--text-mute)">${c.color} · x${c.qty}</div></div><div style="font-weight:800;font-size:13px">${money(p.price*c.qty)}</div></div>`}).join('')}
        </div>
        <div class="voucher"><input id="voucherInput" placeholder="Voucher code"><button class="btn btn-accent" style="padding:10px 14px" onclick="applyVoucher();go('checkout')">Apply</button></div>
        <div class="sum-row"><span>Subtotal</span><span>${money(t.sub)}</span></div>
        <div class="sum-row"><span>Shipping</span><span>${shipCost?money(shipCost):'FREE'}</span></div>
        <div class="sum-row"><span>Tax</span><span>${money(t.tax)}</span></div>
        ${t.disc?`<div class="sum-row" style="color:var(--success)"><span>Discount</span><span>-${money(t.disc)}</span></div>`:''}
        <div class="sum-row total"><span>Total</span><span>${money(total)}</span></div>
        <button class="btn btn-primary btn-block" style="margin-top:16px" onclick="placeOrder(${total})">Place Order 🎉</button>
      </aside>
    </div>
  </div>`;
}
function setShip(s){coState.ship=s;renderCheckout();}
function setPay(p){coState.pay=p;renderCheckout();}
/* Email config — the specific email address orders are sent to */
let orderEmail=DB.get('orderEmail','ghaillaniton@gmail.com');
function setOrderEmail(v){orderEmail=(v||'').trim();DB.set('orderEmail',orderEmail);}
let sellerMessenger = DB.get('sellerMessenger','Ghail Rey Laniton'); // <-- Palitan ng tamang username
function setSellerMessenger(v){ sellerMessenger = (v||'').trim(); DB.set('sellerMessenger',sellerMessenger); }

function placeOrder(total){
  const oid='LX'+Math.floor(1000+Math.random()*9000);
  const items=cart.filter(c=>c.selected).map(c=>({...c,name:PRODUCTS.find(p=>p.id===c.id).name,img:PRODUCTS.find(p=>p.id===c.id).img,price:PRODUCTS.find(p=>p.id===c.id).price}));
  // capture shipping / customer details from the checkout form
  const info={
    name:document.getElementById('coName')?.value||user?.name||'Guest',
    phone:document.getElementById('coPhone')?.value||'-',
    addr:document.getElementById('coAddr')?.value||'-',
    city:document.getElementById('coCity')?.value||'-',
    zip:document.getElementById('coZip')?.value||'-',
    ship:coState.ship,pay:coState.pay
  };
  const order={id:oid,date:new Date().toLocaleDateString(),total,items,status:'shipping',info};
  orders.unshift(order);
  DB.set('orders',orders);
  cart=cart.filter(c=>!c.selected);DB.set('cart',cart);updateCartBadge();
  window._voucher=0;DB.set('voucher',0);
  notifications.unshift({ic:'✅',t:`Order ${oid} confirmed!`,s:'Total '+money(total),time:'just now'});DB.set('notifs',notifications);
  document.getElementById('notifBadge').textContent=notifications.length;
  orderSuccess(order);
}

/* note: buildOrderMessage & sendOrderToEmail are now in email/email.js */

function orderSuccess(o){
  fireConfetti();
  openModal(`
    <div style="padding:44px 34px;text-align:center">
      <div style="width:90px;height:90px;border-radius:50%;background:var(--grad);margin:0 auto 18px;display:grid;place-items:center;font-size:44px;animation:heartpop .7s">🎉</div>
      <h2 style="font-size:26px;font-weight:800;margin-bottom:8px">Order Confirmed!</h2>
      <p style="color:var(--text-soft);margin-bottom:6px">Thank you for shopping with Jerose ✨</p>
      <p style="font-size:14px;margin-bottom:4px">Order ID: <b>#${o.id}</b></p>
      <p style="font-size:20px;font-weight:800;color:var(--primary);margin-bottom:18px">${money(o.total)}</p>
      <button class="btn" style="background:#0084ff;color:#fff;margin-bottom:8px" onclick="sendOrderToMessenger('${o.id}')">💬 Prepare Order for Messenger</button>
      <button class="btn btn-ghost" style="margin-bottom:8px" onclick="sendOrderToEmail('${o.id}')">📧 Send via Email (backup)</button>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:8px">
        <button class="btn btn-ghost" onclick="closeAll();go('profile','orders')">Track Order</button>
        <button class="btn btn-primary" onclick="closeAll();go('home')">Continue Shopping</button>
      </div>
    </div>`);
}

/* ============================================================
   PROFILE (profile.js)
   ============================================================ */
function renderProfile(tab){
  const name=user?.name||'Guest User';
  document.getElementById('view').innerHTML=`
  <div class="container" style="padding-top:24px">
    <div class="breadcrumb"><a onclick="go('home')">Home</a> › <span>My Account</span></div>
    <div class="profile-layout">
      <aside class="profile-side glass">
        <div class="phead"><div class="pav">${name[0].toUpperCase()}</div><h4>${name}</h4><p style="font-size:12px;color:var(--text-mute)">${user?.email||'guest@jerose.shop'}</p></div>
        <div class="pnav">
          <button data-t="profile" onclick="profTab('profile')">👤 Profile</button>
          <button data-t="orders" onclick="profTab('orders')">📦 Order History</button>
          <button data-t="wishlist" onclick="go('wishlist')">❤️ Wishlist</button>
          <button data-t="recent" onclick="profTab('recent')">🕐 Recently Viewed</button>
          <button data-t="notifs" onclick="profTab('notifs')">🔔 Notifications</button>
          <button data-t="settings" onclick="profTab('settings')">⚙️ Settings</button>
          ${user?`<button onclick="logout()">🚪 Logout</button>`:`<button onclick="go('login')">🔑 Login</button>`}
        </div>
      </aside>
      <div>
        <div class="profile-panel" id="pp-profile">
          <h1 class="pagetitle">Profile Details</h1>
          <div class="co-card glass" style="margin-top:16px">
            <div class="field-row"><div class="field"><label>Full Name</label><input value="${name}" id="prName"></div><div class="field"><label>Email</label><input value="${user?.email||'guest@jerose.shop'}" id="prEmail"></div></div>
            <div class="field-row"><div class="field"><label>Phone</label><input placeholder="+1 555 000 0000"></div><div class="field"><label>Birthday</label><input type="date"></div></div>
            <button class="btn btn-primary" onclick="saveProfile()">Save Changes</button>
          </div>
        </div>
        <div class="profile-panel" id="pp-orders">
          <h1 class="pagetitle">Order History</h1>
          <div style="margin-top:16px">${orders.length?orders.map(o=>`
            <div class="order-row glass">
              <img src="${o.items[0].img}">
              <div style="flex:1"><div style="font-weight:700">Order #${o.id}</div><div style="font-size:12px;color:var(--text-mute)">${o.date} · ${o.items.length} item(s) · ${money(o.total)}</div></div>
              <button class="btn" style="background:#0084ff;color:#fff;padding:8px 14px;font-size:12px" onclick="sendOrderToEmail('${o.id}')">📧 Email</button>
              <span class="status ${o.status}">${o.status}</span>
            </div>`).join(''):emptyMini('📦','No orders yet','Your purchases will appear here')}</div>
        </div>
        <div class="profile-panel" id="pp-recent">
          <h1 class="pagetitle">Recently Viewed</h1>
          <div class="grid" style="margin-top:16px">${recentlyViewed.length?PRODUCTS.filter(p=>recentlyViewed.includes(p.id)).map(cardHTML).join(''):emptyMini('🕐','Nothing viewed yet','Products you view will show here')}</div>
        </div>
        <div class="profile-panel" id="pp-notifs">
          <h1 class="pagetitle">Notifications</h1>
          <div style="margin-top:16px">${notifications.map(n=>`<div class="order-row glass"><div class="oi" style="width:46px;height:46px;border-radius:12px;background:var(--bg-2);display:grid;place-items:center;font-size:20px">${n.ic}</div><div style="flex:1"><div style="font-weight:700;font-size:14px">${n.t}</div><div style="font-size:12px;color:var(--text-mute)">${n.s}</div></div><span style="font-size:11px;color:var(--text-mute)">${n.time}</span></div>`).join('')}</div>
        </div>
        <div class="profile-panel" id="pp-settings">
          <h1 class="pagetitle">Settings</h1>
          <div class="co-card glass" style="margin-top:16px">
            <div class="setting-row" style="align-items:flex-start;flex-direction:column;gap:8px"><div><h5>📧 Order Email — Owner: Jerose</h5><p style="font-size:12px;color:var(--text-mute)">Orders are sent to this email (default: ghaillaniton@gmail.com)</p></div><div style="display:flex;gap:8px;width:100%;max-width:420px"><div style="display:flex;align-items:center;flex:1;border:1.5px solid var(--glass-border);border-radius:11px;background:var(--surface-solid);padding:0 12px"><span style="color:var(--text-mute)">✉️</span><input id="orderEmailInput" type="email" value="${orderEmail}" placeholder="ghaillaniton@gmail.com" style="border:none;background:none;outline:none;padding:10px 4px;color:var(--text);width:100%"></div><button class="btn btn-primary" style="padding:10px 16px" onclick="setOrderEmail(document.getElementById('orderEmailInput').value);toast('Order email saved 📧')">Save</button></div></div>
            <div class="setting-row"><div><h5>Dark Mode</h5><p style="font-size:12px;color:var(--text-mute)">Toggle light / dark theme</p></div><div class="switch ${document.documentElement.dataset.theme==='dark'?'on':''}" onclick="toggleTheme();this.classList.toggle('on')"><i></i></div></div>
            <div class="setting-row"><div><h5>Email Notifications</h5><p style="font-size:12px;color:var(--text-mute)">Deals & order updates</p></div><div class="switch on" onclick="this.classList.toggle('on')"><i></i></div></div>
            <div class="setting-row"><div><h5>Language</h5><p style="font-size:12px;color:var(--text-mute)">Interface language</p></div><select style="width:auto;padding:8px 12px;border-radius:10px;border:1.5px solid var(--glass-border);background:var(--surface-solid);color:var(--text)" onchange="setLang(this.value)"><option value="en">🇺🇸 English</option><option value="es">🇪🇸 Español</option><option value="fr">🇫🇷 Français</option></select></div>
            <div class="setting-row" style="border:none"><div><h5>Currency</h5><p style="font-size:12px;color:var(--text-mute)">Display currency</p></div><span style="font-weight:700">PHP (₱)</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  profTab(tab||'profile');
}
function profTab(t){document.querySelectorAll('.profile-panel').forEach(p=>p.classList.remove('active'));document.getElementById('pp-'+t)?.classList.add('active');document.querySelectorAll('.pnav button').forEach(b=>b.classList.toggle('active',b.dataset.t===t));initReveal();}
function emptyMini(em,h,p){return `<div class="empty-state" style="grid-column:1/-1"><div class="em">${em}</div><h3>${h}</h3><p>${p}</p></div>`;}
function saveProfile(){user={name:document.getElementById('prName').value,email:document.getElementById('prEmail').value};DB.set('user',user);document.getElementById('navAvatar').textContent=user.name[0].toUpperCase();toast('Profile saved ✅');}
function logout(){user=null;DB.set('user',null);document.getElementById('navAvatar').textContent='G';toast('Logged out');go('home');}
function addRecent(id){recentlyViewed=recentlyViewed.filter(x=>x!==id);recentlyViewed.unshift(id);recentlyViewed=recentlyViewed.slice(0,12);DB.set('recent',recentlyViewed);}

/* ============================================================
   AUTH (login/register)
   ============================================================ */
function renderAuth(mode){
  document.getElementById('view').innerHTML=`
  <div class="container">
    <div class="auth-wrap glass">
      <div class="auth-tabs"><button class="${mode==='login'?'active':''}" onclick="renderAuth('login')">Login</button><button class="${mode==='register'?'active':''}" onclick="renderAuth('register')">Register</button></div>
      <h2>${mode==='login'?'Welcome back 👋':'Create account ✨'}</h2>
      <p class="sub">${mode==='login'?'Sign in to continue shopping':'Join Jerose for exclusive deals'}</p>
      ${mode==='register'?`<div class="field"><label>Full Name</label><input id="auName" placeholder="Jane Doe"></div>`:''}
      <div class="field"><label>Email</label><input id="auEmail" type="email" placeholder="you@email.com"></div>
      <div class="field"><label>Password</label><input type="password" placeholder="••••••••"></div>
      <button class="btn btn-primary btn-block" style="margin-top:8px" onclick="doAuth('${mode}')">${mode==='login'?'Login':'Create Account'}</button>
      <div style="display:flex;align-items:center;gap:10px;margin:18px 0;color:var(--text-mute);font-size:12px"><span style="flex:1;height:1px;background:var(--glass-border)"></span>OR<span style="flex:1;height:1px;background:var(--glass-border)"></span></div>
      <button class="btn btn-ghost btn-block" onclick="doAuth('${mode}')">🔵 Continue with Google</button>
    </div>
  </div>`;
}
function doAuth(mode){
  const email=document.getElementById('auEmail').value||'user@jerose.shop';
  const name=document.getElementById('auName')?.value||email.split('@')[0];
  user={name:name.charAt(0).toUpperCase()+name.slice(1),email};
  DB.set('user',user);
  document.getElementById('navAvatar').textContent=user.name[0].toUpperCase();
  toast((mode==='login'?'Welcome back, ':'Account created! Welcome, ')+user.name+' 🎉');
  go('home');
}

/* ============================================================
   QUICK VIEW MODAL
   ============================================================ */
function quickView(id){
  const p=PRODUCTS.find(x=>x.id===id);
  openModal(`
    <button class="mclose" onclick="closeAll()">✕</button>
    <div class="qv-grid">
      <div class="qvimg"><img id="qvImg" src="${p.colors[0].img}"></div>
      <div class="qv-body">
        <div class="cat" style="font-size:11px;color:var(--text-mute);text-transform:uppercase;letter-spacing:.5px">${p.category}</div>
        <h2 style="font-size:22px;font-weight:800;margin:6px 0 10px">${p.name}</h2>
        <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:var(--text-soft);margin-bottom:12px"><span class="stars" style="color:var(--gold)">${stars(p.rating)}</span> ${p.rating} · ${fmtSold(p.sold)} sold</div>
        <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:16px"><span style="font-size:28px;font-weight:800;color:var(--primary)">${money(p.price)}</span>${p.off?`<span style="text-decoration:line-through;color:var(--text-mute)">${money(p.base)}</span><span class="off" style="font-size:11px;font-weight:800;color:var(--success);background:rgba(16,185,129,.12);padding:2px 8px;border-radius:6px">-${p.off}%</span>`:''}</div>
        <p style="font-size:13.5px;color:var(--text-soft);line-height:1.6;margin-bottom:16px">${p.desc.slice(0,140)}...</p>
        <div style="font-size:12px;font-weight:700;margin-bottom:8px">Colors:</div>
        <div style="display:flex;gap:8px;margin-bottom:20px">${p.colors.map((c,i)=>`<span class="swatch" style="width:26px;height:26px;background:${c.hex}" title="${c.name}" onclick="document.getElementById('qvImg').src='${c.img}'"></span>`).join('')}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-outline" onclick="addToCart(${p.id},1,null,this)">🛒 Add to Cart</button>
          <button class="btn btn-primary" onclick="closeAll();go('product',${p.id})">View Full Details →</button>
        </div>
      </div>
    </div>`);
}

/* ============================================================
   MODAL / DRAWER / OVERLAY controls
   ============================================================ */
function openModal(html){document.getElementById('modal').innerHTML=html;document.getElementById('overlay').classList.add('show');document.getElementById('modal').classList.add('show');}
function closeAll(){document.getElementById('overlay').classList.remove('show');document.getElementById('modal').classList.remove('show');document.getElementById('cartDrawer').classList.remove('show');document.querySelectorAll('.dd').forEach(d=>d.classList.remove('show'));}
function toggleDD(id){const d=document.getElementById(id);const open=d.classList.contains('show');document.querySelectorAll('.dd').forEach(x=>x.classList.remove('show'));if(!open){buildDD(id);d.classList.add('show');}}
function buildDD(id){
  if(id==='ddNotif'){
    document.getElementById('ddNotif').innerHTML=`<h4>Notifications <a class="link-more" onclick="go('profile','notifs');closeAll()">See all</a></h4>${notifications.slice(0,4).map(n=>`<div class="row"><div style="font-size:22px">${n.ic}</div><div><div class="t">${n.t}</div><div style="font-size:11px;color:var(--text-mute)">${n.s} · ${n.time}</div></div></div>`).join('')}`;
  } else if(id==='ddProfile'){
    document.getElementById('ddProfile').innerHTML=`<h4>${user?('Hi, '+user.name+' 👋'):'Guest'}</h4>
      <div class="row" onclick="go('profile');closeAll()"><div style="font-size:20px">👤</div><div class="t">My Profile</div></div>
      <div class="row" onclick="go('profile','orders');closeAll()"><div style="font-size:20px">📦</div><div class="t">Orders</div></div>
      <div class="row" onclick="go('wishlist');closeAll()"><div style="font-size:20px">❤️</div><div class="t">Wishlist</div></div>
      <div class="row" onclick="go('profile','settings');closeAll()"><div style="font-size:20px">⚙️</div><div class="t">Settings</div></div>
      ${user?`<div class="row" onclick="logout();closeAll()"><div style="font-size:20px">🚪</div><div class="t">Logout</div></div>`:`<div style="padding:8px"><button class="btn btn-primary btn-block" onclick="go('login');closeAll()">Login / Register</button></div>`}`;
  }
}

/* ============================================================
   TOAST / CONFETTI / MICRO-INTERACTIONS (animation.js)
   ============================================================ */
function toast(msg,type=''){
  const w=document.getElementById('toastWrap');
  const el=document.createElement('div');el.className='toast '+type;
  el.innerHTML=`<span class="ti">${type==='err'?'⚠️':'✅'}</span>${msg}`;
  w.appendChild(el);
  setTimeout(()=>{el.style.transition='all .4s';el.style.opacity='0';el.style.transform='translateY(20px)';setTimeout(()=>el.remove(),400);},2600);
}
function fireConfetti(){
  const c=document.getElementById('confetti');c.classList.remove('hidden');
  const ctx=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;
  const cols=['#ff5a5f','#f0b429','#6c5ce7','#00cec9','#ff8fb1','#10b981'];
  let parts=Array.from({length:140},()=>({x:innerWidth/2,y:innerHeight/2,r:Math.random()*7+3,c:cols[Math.floor(Math.random()*cols.length)],vx:(Math.random()-.5)*14,vy:Math.random()*-16-4,a:1,rot:Math.random()*360}));
  let f=0;
  (function anim(){
    ctx.clearRect(0,0,c.width,c.height);f++;
    parts.forEach(p=>{p.vy+=.4;p.x+=p.vx;p.y+=p.vy;p.a-=.008;p.rot+=8;ctx.save();ctx.globalAlpha=Math.max(0,p.a);ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);ctx.fillStyle=p.c;ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*.6);ctx.restore();});
    if(f<160)requestAnimationFrame(anim);else c.classList.add('hidden');
  })();
}
// ripple on all buttons
document.addEventListener('click',e=>{
  const b=e.target.closest('.btn');if(!b)return;
  const r=b.getBoundingClientRect();const rip=document.createElement('span');rip.className='ripple';
  const s=Math.max(r.width,r.height);rip.style.width=rip.style.height=s+'px';rip.style.left=(e.clientX-r.left-s/2)+'px';rip.style.top=(e.clientY-r.top-s/2)+'px';
  b.appendChild(rip);setTimeout(()=>rip.remove(),600);
});

/* ============================================================
   SLIDER (slider.js)
   ============================================================ */
function startSlider(){clearInterval(slideTimer);slideIx=0;slideTimer=setInterval(()=>moveSlide(1),5000);}
function moveSlide(d){const s=document.querySelectorAll('.slide');if(!s.length)return;s[slideIx].classList.remove('active');document.querySelectorAll('.slider-dots span')[slideIx].classList.remove('active');slideIx=(slideIx+d+s.length)%s.length;s[slideIx].classList.add('active');document.querySelectorAll('.slider-dots span')[slideIx].classList.add('active');}
function gotoSlide(i){const s=document.querySelectorAll('.slide');s[slideIx].classList.remove('active');document.querySelectorAll('.slider-dots span')[slideIx].classList.remove('active');slideIx=i;s[i].classList.add('active');document.querySelectorAll('.slider-dots span')[i].classList.add('active');clearInterval(slideTimer);slideTimer=setInterval(()=>moveSlide(1),5000);}

/* countdown */
function startCountdown(){
  const el=document.getElementById('countdown');if(!el)return;
  let end=DB.get('flashEnd',0);const now=Date.now();
  if(!end||end<now){end=now+8*3600*1000;DB.set('flashEnd',end);}
  clearInterval(window._cd);
  function tick(){
    let diff=Math.max(0,end-Date.now());
    if(diff<=0){end=Date.now()+8*3600*1000;DB.set('flashEnd',end);diff=end-Date.now();}
    const h=Math.floor(diff/3600000),m=Math.floor(diff%3600000/60000),s=Math.floor(diff%60000/1000);
    el.innerHTML=`<span style="font-size:12px;color:var(--text-soft);margin-right:4px">Ends in</span><span class="box">${String(h).padStart(2,'0')}</span><span class="colon">:</span><span class="box">${String(m).padStart(2,'0')}</span><span class="colon">:</span><span class="box">${String(s).padStart(2,'0')}</span>`;
  }
  tick();window._cd=setInterval(tick,1000);
}

/* ============================================================
   THEME / LANG
   ============================================================ */
function toggleTheme(){
  const cur=document.documentElement.dataset.theme==='dark'?'light':'dark';
  document.documentElement.dataset.theme=cur;
  document.getElementById('themeIcon').textContent=cur==='dark'?'☀️':'🌙';
  DB.set('theme',cur);
}
const LANGS=[['en','🇺🇸'],['es','🇪🇸'],['fr','🇫🇷'],['de','🇩🇪'],['jp','🇯🇵']];let langIx=0;
function toggleLang(){langIx=(langIx+1)%LANGS.length;document.getElementById('langFlag').textContent=LANGS[langIx][1];DB.set('lang',langIx);toast('Language: '+LANGS[langIx][0].toUpperCase());}
function setLang(v){toast('Language set to '+v.toUpperCase());}

/* ============================================================
   REVEAL / SCROLL / MOUSE / MISC
   ============================================================ */
let io;
function initReveal(){
  if(io)io.disconnect();
  io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
  document.querySelectorAll('.reveal:not(.in)').forEach(el=>io.observe(el));
}
window.addEventListener('scroll',()=>{
  document.getElementById('toTop').classList.toggle('show',scrollY>500);
  const h=document.getElementById('topbar');h.style.boxShadow=scrollY>10?'var(--shadow-md)':'none';
});
// mouse follower
const glow=document.getElementById('cursorGlow');
window.addEventListener('mousemove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';});
document.addEventListener('mouseover',e=>{if(e.target.closest('.btn,.card,.cat-tile,.iconbtn')){glow.style.width='46px';glow.style.height='46px';}else{glow.style.width='26px';glow.style.height='26px';}});
// progress bar
function progStart(){const b=document.getElementById('progbar');b.style.opacity='1';b.style.width='30%';setTimeout(()=>b.style.width='70%',100);}
function progEnd(){const b=document.getElementById('progbar');b.style.width='100%';setTimeout(()=>{b.style.opacity='0';b.style.width='0';},350);}
function toggleMobileNav(){const n=document.getElementById('navRow').parentElement;n.style.display=n.style.display==='block'?'none':'block';}
function subscribe(){const e=document.getElementById('newsEmail').value;if(e){toast('Subscribed! Check your inbox 📧');document.getElementById('newsEmail').value='';}else toast('Enter your email','err');}
document.getElementById('view').addEventListener('click',e=>{if(e.target.id==='pdMain'||e.target.id==='pdImg'){}});

/* ============================================================
   INIT
   ============================================================ */
(function init(){
  const th=DB.get('theme','light');document.documentElement.dataset.theme=th;document.getElementById('themeIcon').textContent=th==='dark'?'☀️':'🌙';
  langIx=DB.get('lang',0);document.getElementById('langFlag').textContent=LANGS[langIx][1];
  if(user)document.getElementById('navAvatar').textContent=user.name[0].toUpperCase();
  updateCartBadge();updateWishBadge();
  document.getElementById('notifBadge').textContent=notifications.length;
  // expose renderCartPage guard
  window.renderCartPage=renderCartPage;
  go('home');
})();
// wire cart page route override (go handles 'cart' via drawer, but also full page)
const _go=go;