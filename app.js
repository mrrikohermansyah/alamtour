const state={data:{packages:[]},filtered:[],sort:'recommended',q:''};
const nf=new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'});
const elPackages=document.getElementById('packages');
const elSearch=document.getElementById('search');
const elSort=document.getElementById('sort');
const elModal=document.getElementById('modal');
const elModalContent=document.getElementById('modal-content');
const yearEl=document.getElementById('year');
const heroImg=document.getElementById('hero-img');
let waNumber=null;
function normalizeWa(n){if(!n)return null;let d=String(n).trim().replace(/[^\d]/g,'');if(!d)return null;if(d.startsWith('0')){d='62'+d.slice(1);}else if(d.startsWith('62')){d=d;}else if(d.startsWith('8')){d='62'+d;}else{d='62'+d;}return d;}
yearEl.textContent=new Date().getFullYear();
function initData(){if(window.db&&window.db.available){window.db.subscribePackages(json=>{if(!json){state.data={packages:[]};state.filtered=[];render();return;}state.data=json;state.filtered=json.packages;render();});}else{document.addEventListener('DOMContentLoaded',()=>{if(window.db&&window.db.available){window.db.subscribePackages(json=>{if(!json){state.data={packages:[]};state.filtered=[];render();return;}state.data=json;state.filtered=json.packages;render();});}});}}
initData();
function initSettings(){if(window.db&&window.db.available){window.db.subscribeSettings(s=>{if(heroImg){if(!s||!s.header_image){heroImg.style.display='none';}else{heroImg.src=s.header_image;heroImg.style.display='block';}}waNumber=normalizeWa(s&&s.whatsapp_number)||null;});} }
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
function openDetail(p){const gal=(p.gallery&&p.gallery.length?p.gallery:['https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200&auto=format&fit=crop']);const itin=(p.itinerary||[]).map(i=>`<li>Hari ${i.day} — ${i.title}: ${i.details}</li>`).join('');const inc=(p.includes||[]).map(i=>`<li>${i}</li>`).join('');const exc=(p.excludes||[]).map(i=>`<li>${i}</li>`).join('');const hi=(p.highlights||[]).map(i=>`<li>${i}</li>`).join('');const pol=(p.policies||[]).map(i=>`<li>${i}</li>`).join('');const desc=p.long_description||p.short_description||'';const hasLL=(typeof p.map_lat==='number'&&!isNaN(p.map_lat))&&(typeof p.map_lng==='number'&&!isNaN(p.map_lng));const embedValid=(typeof p.map_embed==='string'&&p.map_embed.startsWith('https://www.google.com/maps/embed'));const mapSrc=embedValid?p.map_embed:(hasLL?`https://www.google.com/maps?q=${p.map_lat},${p.map_lng}&z=12&output=embed`:(p.map_query?`https://www.google.com/maps?q=${encodeURIComponent(p.map_query)}&z=12&output=embed`:null));const mapLink=hasLL?`https://www.google.com/maps?q=${p.map_lat},${p.map_lng}`:(p.map_query?`https://www.google.com/maps?q=${encodeURIComponent(p.map_query)}`:null);const waNum=(waNumber?String(waNumber).replace(/[^\d]/g,''):null);const waMsg=`Halo, saya ingin menanyakan ketersediaan paket ${p.title}${p.location?` di ${p.location}`:''}.`;const waHref=(waNum?`https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`:null);elModalContent.innerHTML=`
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
      ${mapSrc?`<div class=\"map\"><iframe class=\"map-frame\" src=\"${mapSrc}\" allowfullscreen loading=\"lazy\"></iframe></div><div style=\"margin-top:8px;display:flex;gap:8px\">${mapLink?`<a class=\"btn btn-map\" href=\"${mapLink}\" target=\"_blank\" rel=\"noopener\"><svg aria-hidden=\"true\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M12 2C8.686 2 6 4.686 6 8c0 5.25 6 14 6 14s6-8.75 6-14c0-3.314-2.686-6-6-6zm0 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6z\"></path></svg><span>Buka di Google Maps</span></a>`:''}${waNum?`<a class=\"btn btn-wa\" href=\"${`https://wa.me/${waNum}?text=${encodeURIComponent('Halo, saya ingin menanyakan ketersediaan paket '+p.title+(p.location?(' di '+p.location):'')+'.\nHarga: '+nf.format(p.price)+'\nDurasi: '+(p.duration||'-')+'\nTermasuk:\n'+(((p.includes||[]).map(i=>'- '+i).join('\\n'))||'-')+'\nTidak termasuk:\n'+(((p.excludes||[]).map(i=>'- '+i).join('\\n'))||'-'))}`}\" target=\"_blank\" rel=\"noopener\"><svg aria-hidden=\"true\" width=\"16\" height=\"16\" viewBox=\"0 0 32 32\" fill=\"currentColor\"><path d=\"M16 3C9.383 3 4 8.383 4 15c0 2.552.794 4.928 2.146 6.91L4 29l7.262-2.093C13.06 27.63 14.492 28 16 28c6.617 0 12-5.383 12-12S22.617 3 16 3zm0 22c-1.33 0-2.6-.326-3.723-.902l-.267-.137-4.02 1.159 1.091-3.933-.174-.282C7.587 20.02 7 18.576 7 17c0-4.962 4.038-9 9-9s9 4.038 9 9-4.038 9-9 9zm4.936-6.681c-.271-.136-1.595-.788-1.841-.876-.246-.088-.426-.136-.606.136-.182.271-.699.876-.857 1.057-.16.182-.316.205-.587.068-.271-.136-1.146-.422-2.183-1.345-.808-.72-1.354-1.607-1.513-1.879-.159-.271-.017-.418.12-.554.123-.122.271-.317.407-.476.136-.159.182-.271.271-.452.09-.182.045-.34-.023-.476-.068-.136-.606-1.463-.831-2.007-.217-.522-.437-.452-.606-.46-.153-.008-.34-.01-.522-.01-.182 0-.476.068-.724.34-.247.271-.948.927-.948 2.259s.973 2.624 1.109 2.805c.136.182 1.916 2.931 4.648 3.991.65.259 1.157.413 1.552.528.652.207 1.247.178 1.717.108.523-.078 1.595-.651 1.819-1.28.224-.63.224-1.166.159-1.282-.068-.115-.247-.182-.518-.319z\"></path></svg><span>Tanya via WhatsApp</span></a>`:''}</div>`:''}
      <div class="tags" style="margin-top:12px">${(p.tags||[]).map(t=>`<span class='tag'>${t}</span>`).join('')}</div>
    </div>
  </div>`;showModal();}
function showModal(){elModal.classList.remove('hidden');document.body.classList.add('modal-open');}
function hideModal(){elModal.classList.add('hidden');document.body.classList.remove('modal-open');}