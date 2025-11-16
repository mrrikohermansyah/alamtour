const state={data:{packages:[]},filtered:[],sort:'recommended',q:''};
const nf=new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'});
const elPackages=document.getElementById('packages');
const elSearch=document.getElementById('search');
const elSort=document.getElementById('sort');
const elModal=document.getElementById('modal');
const elModalContent=document.getElementById('modal-content');
const yearEl=document.getElementById('year');
const heroImg=document.getElementById('hero-img');
yearEl.textContent=new Date().getFullYear();
function initData(){if(window.db&&window.db.available){window.db.subscribePackages(json=>{if(!json){state.data={packages:[]};state.filtered=[];render();return;}state.data=json;state.filtered=json.packages;render();});}else{document.addEventListener('DOMContentLoaded',()=>{if(window.db&&window.db.available){window.db.subscribePackages(json=>{if(!json){state.data={packages:[]};state.filtered=[];render();return;}state.data=json;state.filtered=json.packages;render();});}});}}
initData();
function initSettings(){if(window.db&&window.db.available){window.db.subscribeSettings(s=>{if(!s||!s.header_image){if(heroImg){heroImg.style.display='none';}return;}if(heroImg){heroImg.src=s.header_image;heroImg.style.display='block';}});} }
initSettings();
elSearch.addEventListener('input',e=>{state.q=e.target.value.trim().toLowerCase();applyFilter();});
elSort.addEventListener('change',e=>{state.sort=e.target.value;applyFilter();});
document.addEventListener('click',e=>{if(e.target.dataset.close){hideModal();}});
function applyFilter(){const q=state.q;let arr=[...state.data.packages];if(q){arr=arr.filter(p=>[p.title,p.location,(p.tags||[]).join(' ')].join(' ').toLowerCase().includes(q));}
if(state.sort==='price_asc'){arr.sort((a,b)=>a.price-b.price);}else if(state.sort==='price_desc'){arr.sort((a,b)=>b.price-a.price);}else{arr.sort((a,b)=>((b.featured?1:0)-(a.featured?1:0))||a.title.localeCompare(b.title));}
state.filtered=arr;render();}
function render(){elPackages.innerHTML='';if(!state.filtered.length){elPackages.innerHTML=`<div class="meta">Belum ada paket tersedia</div>`;return;}state.filtered.forEach(p=>{const card=document.createElement('article');card.className='card';card.innerHTML=`
  <div class="thumb">
    <img src="${(p.thumbnail||'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop')}" alt="${p.title}">
    ${p.duration?`<span class='badge'>${p.duration}</span>`:''}
  </div>
  <div class="content">
    <div class="title">${p.title}</div>
    <div class="meta">${p.location}</div>
    <div class="tags">${(p.tags||[]).slice(0,4).map(t=>`<span class='tag'>${t}</span>`).join('')}</div>
  </div>
  <div class="actions">
    <span class="price">${nf.format(p.price)}</span>
    <button class="btn" data-id="${p.id}">Lihat Detail</button>
  </div>`;card.querySelector('.btn').addEventListener('click',()=>openDetail(p));elPackages.appendChild(card);});}
function openDetail(p){const gal=(p.gallery&&p.gallery.length?p.gallery:['https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200&auto=format&fit=crop']);const itin=(p.itinerary||[]).map(i=>`<li>Hari ${i.day} — ${i.title}: ${i.details}</li>`).join('');const inc=(p.includes||[]).map(i=>`<li>${i}</li>`).join('');const exc=(p.excludes||[]).map(i=>`<li>${i}</li>`).join('');const hi=(p.highlights||[]).map(i=>`<li>${i}</li>`).join('');const pol=(p.policies||[]).map(i=>`<li>${i}</li>`).join('');const desc=p.long_description||p.short_description||'';const hasLL=(typeof p.map_lat==='number'&&!isNaN(p.map_lat))&&(typeof p.map_lng==='number'&&!isNaN(p.map_lng));const mapSrc=hasLL?`https://www.google.com/maps?q=${p.map_lat},${p.map_lng}&z=12&output=embed`:(p.map_query?`https://www.google.com/maps?q=${encodeURIComponent(p.map_query)}&z=12&output=embed`:null);const mapLink=hasLL?`https://www.google.com/maps?q=${p.map_lat},${p.map_lng}`:(p.map_query?`https://www.google.com/maps?q=${encodeURIComponent(p.map_query)}`:null);elModalContent.innerHTML=`
  <div class="modal-body">
    <div>
      <h2>${p.title}</h2>
      <div class="lead">${p.location} • ${p.duration||''}${p.meeting_point?` • Titik kumpul: ${p.meeting_point}`:''}</div>
      <div class="lead">${nf.format(p.price)}</div>
      <p>${desc}</p>
      ${hi?`<h3>Highlight</h3><ul class=\"list\">${hi}</ul>`:''}
      <h3>Rincian Perjalanan</h3>
      <ul class="list">${itin||'<li>Rincian belum tersedia</li>'}</ul>
      <h3>Termasuk</h3>
      <ul class="list">${inc||'<li>Informasi belum tersedia</li>'}</ul>
      <h3>Tidak Termasuk</h3>
      <ul class="list">${exc||'<li>Informasi belum tersedia</li>'}</ul>
      ${pol?`<h3>Kebijakan</h3><ul class=\"list\">${pol}</ul>`:''}
    </div>
    <div>
      <div class="gallery">${gal.slice(0,6).map(u=>`<img src='${u}' alt='${p.title}'>`).join('')}</div>
      ${mapSrc?`<div class=\"map\"><iframe class=\"map-frame\" src=\"${mapSrc}\" allowfullscreen loading=\"lazy\"></iframe></div><div style=\"margin-top:8px\"><a class=\"btn\" href=\"${mapLink}\" target=\"_blank\" rel=\"noopener\">Buka di Google Maps</a></div>`:''}
      <div class="tags" style="margin-top:12px">${(p.tags||[]).map(t=>`<span class='tag'>${t}</span>`).join('')}</div>
    </div>
  </div>`;showModal();}
function showModal(){elModal.classList.remove('hidden');}
function hideModal(){elModal.classList.add('hidden');}