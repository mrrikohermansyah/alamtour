const nf=new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'});
const editorModal=document.getElementById('editor-modal');
const editorContent=document.getElementById('editor-content');
const adminList=document.getElementById('admin-list');
const adminSearch=document.getElementById('admin-search');
const fileInput=document.getElementById('file-input');
const btnAdd=document.getElementById('btn-add');
const btnDownload=document.getElementById('btn-download');
const btnReload=document.getElementById('btn-reload');
const btnLogout=document.getElementById('btn-logout');
const siteHeroUrl=document.getElementById('site-hero-url');
const siteHeroSave=document.getElementById('site-hero-save');
const siteWa=document.getElementById('site-wa');
let data={packages:[]};let filtered=[];let q='';
function load(){if(window.db&&window.db.available){window.db.subscribePackages(json=>{if(!json)return;data=json;filtered=json.packages;render();});}else{fetch('data/tours.json').then(r=>r.json()).then(json=>{data=json;filtered=json.packages;render();});}}
function render(){adminList.innerHTML='';filtered.forEach(p=>{const card=document.createElement('article');card.className='card';card.innerHTML=`
  <div class="thumb">
    <img src="${p.thumbnail||'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop'}" alt="${p.title}">
    ${p.duration?`<span class='badge'>${p.duration}</span>`:''}
  </div>
  <div class="content">
    <div class="title">${p.title}</div>
    <div class="meta">${p.location}</div>
    <div class="tags">${(p.tags||[]).slice(0,4).map(t=>`<span class='tag'>${t}</span>`).join('')}</div>
  </div>
  <div class="actions">
    <span class="price">${nf.format(p.price)}</span>
    <div style="display:flex;gap:8px">
      <button class="btn" data-act="edit" data-id="${p.id}">Edit</button>
      <button class="btn" data-act="delete" data-id="${p.id}">Hapus</button>
    </div>
  </div>`;card.querySelector('[data-act="edit"]').addEventListener('click',()=>openEditor(p));card.querySelector('[data-act="delete"]').addEventListener('click',()=>del(p.id));adminList.appendChild(card);});}
function openEditor(p){const model=JSON.parse(JSON.stringify(p||{id:crypto.randomUUID(),title:'',location:'',duration:'',price:0,thumbnail:'',gallery:[],tags:[],short_description:'',long_description:'',highlights:[],policies:[],meeting_point:'',map_lat:null,map_lng:null,map_query:'',map_embed:'',itinerary:[],includes:[],excludes:[],featured:false}));editorContent.innerHTML=`
  <div class="modal-body" style="grid-template-columns:1fr 1fr">
    <div>
      <h2>Edit Paket</h2>
      <div class="list">
        <input class="field" data-f="title" placeholder="Judul" value="${model.title||''}">
        <input class="field" data-f="location" placeholder="Lokasi" value="${model.location||''}">
        <input class="field" data-f="duration" placeholder="Durasi" value="${model.duration||''}">
        <input class="field" data-f="price" placeholder="Harga" type="number" value="${model.price||0}">
        <input class="field" data-f="thumbnail" placeholder="Thumbnail URL" value="${model.thumbnail||''}">
        <input class="field" data-f="meeting_point" placeholder="Titik kumpul" value="${model.meeting_point||''}">
        <div class="list">
          <input class="field" data-f="map_lat" placeholder="Latitude (contoh: -7.942)" value="${(model.map_lat??'')}">
          <input class="field" data-f="map_lng" placeholder="Longitude (contoh: 112.953)" value="${(model.map_lng??'')}">
          <input class="field" data-f="map_query" placeholder="Alamat/Place (opsional)" value="${model.map_query||''}">
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
          <button class="btn" id="btn-geo">Lokasi saya</button>
          <input id="map-link" class="field" placeholder="Tempel link Google Maps">
          <button class="btn" id="btn-parse">Ambil dari link</button>
        </div>
        <input class="field" data-f="map_embed" placeholder="Embed Map src (opsional)" value="${model.map_embed||''}">
        <textarea class="field" data-f="short_description" placeholder="Deskripsi singkat">${model.short_description||''}</textarea>
        <textarea class="field" data-f="long_description" placeholder="Deskripsi lengkap">${model.long_description||''}</textarea>
        <textarea class="field" data-f="highlights" placeholder="Highlight (baris baru)">${(model.highlights||[]).join('\n')}</textarea>
        <textarea class="field" data-f="policies" placeholder="Kebijakan (baris baru)">${(model.policies||[]).join('\n')}</textarea>
        <input class="field" data-f="tags" placeholder="Tags (koma)" value="${(model.tags||[]).join(', ')}">
        <textarea class="field" data-f="gallery" placeholder="Gallery URLs (baris baru)">${(model.gallery||[]).join('\n')}</textarea>
        <textarea class="field" data-f="itinerary" placeholder="Itinerary (format: Hari|Judul|Detail per baris)">${(model.itinerary||[]).map(i=>`${i.day}|${i.title}|${i.details}`).join('\n')}</textarea>
        <textarea class="field" data-f="includes" placeholder="Termasuk (baris baru)">${(model.includes||[]).join('\n')}</textarea>
        <textarea class="field" data-f="excludes" placeholder="Tidak termasuk (baris baru)">${(model.excludes||[]).join('\n')}</textarea>
        <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" ${model.featured?'checked':''}> Featured</label>
      </div>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="btn" id="save">Simpan</button>
      </div>
    </div>
    <div>
      <div class="gallery">${(model.gallery&&model.gallery.length?model.gallery:['https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200&auto=format&fit=crop']).slice(0,6).map(u=>`<img src='${u}' alt='preview'>`).join('')}</div>
    </div>
  </div>`;editorModal.classList.remove('hidden');const get=(s)=>editorContent.querySelector(`[data-f="${s}"]`);
  const btnGeo=editorContent.querySelector('#btn-geo');
  if(btnGeo&&navigator.geolocation){btnGeo.addEventListener('click',()=>{navigator.geolocation.getCurrentPosition(pos=>{get('map_lat').value=String(pos.coords.latitude.toFixed(6));get('map_lng').value=String(pos.coords.longitude.toFixed(6));get('map_query').value=`${pos.coords.latitude},${pos.coords.longitude}`;});});}
  const btnParse=editorContent.querySelector('#btn-parse');const mapLink=editorContent.querySelector('#map-link');
  if(btnParse){btnParse.addEventListener('click',()=>{const url=(mapLink&&mapLink.value||'').trim();if(!url)return;let lat=null,lng=null;let m=url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);if(m){lat=parseFloat(m[1]);lng=parseFloat(m[2]);}
    if(lat===null){m=url.match(/[?&]q=([^&]+)/);if(m){try{const qv=decodeURIComponent(m[1]);const parts=qv.split(',');if(parts.length>=2){const la=parseFloat(parts[0]);const ln=parseFloat(parts[1]);if(!isNaN(la)&&!isNaN(ln)){lat=la;lng=ln;}}else{get('map_query').value=qv;}}catch(e){}}}
    if(lat!==null&&lng!==null){get('map_lat').value=String(lat);get('map_lng').value=String(lng);if(!get('map_query').value){get('map_query').value=`${lat},${lng}`;}}
  });}
  document.getElementById('save').addEventListener('click',()=>{const q=(s)=>editorContent.querySelector(`[data-f="${s}"]`);model.title=(q('title').value||'').trim();model.location=(q('location').value||'').trim();model.duration=(q('duration').value||'').trim();model.price=parseInt(q('price').value||'0',10);model.thumbnail=(q('thumbnail').value||'').trim();model.meeting_point=(q('meeting_point').value||'').trim();model.map_lat=(q('map_lat').value?parseFloat(q('map_lat').value):null);model.map_lng=(q('map_lng').value?parseFloat(q('map_lng').value):null);model.map_query=(q('map_query').value||'').trim();let embed=(q('map_embed').value||'').trim();if(embed){const m=embed.match(/src=["']([^"']+)["']/);if(m){embed=m[1];}if(!embed.startsWith('https://www.google.com/maps/embed')){embed='';}}model.map_embed=embed;model.short_description=(q('short_description').value||'').trim();model.long_description=(q('long_description').value||'').trim();model.highlights=(q('highlights').value||'').split('\n').map(s=>s.trim()).filter(Boolean);model.policies=(q('policies').value||'').split('\n').map(s=>s.trim()).filter(Boolean);model.tags=(q('tags').value||'').split(',').map(s=>s.trim()).filter(Boolean);model.gallery=(q('gallery').value||'').split('\n').map(s=>s.trim()).filter(Boolean);model.itinerary=(q('itinerary').value||'').split('\n').map(s=>s.split('|')).filter(a=>a.length>=3).map(a=>({day:parseInt(a[0],10)||1,title:a[1],details:a[2]}));model.includes=(q('includes').value||'').split('\n').map(s=>s.trim()).filter(Boolean);model.excludes=(q('excludes').value||'').split('\n').map(s=>s.trim()).filter(Boolean);model.featured=editorContent.querySelector('input[type="checkbox"]').checked;if(window.db&&window.db.available){const exists=!!(data.packages.find(x=>x.id===model.id));(exists?window.db.updatePackage(model.id,model):window.db.addPackage(model)).then(()=>{editorModal.classList.add('hidden');}).catch(()=>{});}else{const idx=data.packages.findIndex(x=>x.id===model.id);if(idx>=0){data.packages[idx]=model;}else{data.packages.push(model);}filtered=data.packages.filter(f=>match(f,q));render();editorModal.classList.add('hidden');}});} 
function del(id){if(window.db&&window.db.available){window.db.deletePackage(id).then(()=>{}).catch(()=>{});}else{const i=data.packages.findIndex(x=>x.id===id);if(i>=0){data.packages.splice(i,1);filtered=data.packages.filter(f=>match(f,q));render();}}}
function match(p,s){return [p.title,p.location,(p.tags||[]).join(' ')].join(' ').toLowerCase().includes((s||'').toLowerCase());}
adminSearch.addEventListener('input',e=>{q=e.target.value;filtered=data.packages.filter(f=>match(f,q));render();});
document.addEventListener('click',e=>{if(e.target.dataset.close){editorModal.classList.add('hidden');}});
btnAdd.addEventListener('click',()=>openEditor(null));
btnDownload.addEventListener('click',()=>{const blob=new Blob([JSON.stringify({...data,updated_at:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='tours.json';a.click();URL.revokeObjectURL(url);});
fileInput.addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const json=JSON.parse(r.result);if(window.db&&window.db.available){const pkgs=json.packages||[];Promise.all(pkgs.map(p=>{return (p.id?window.db.updatePackage(p.id,p):window.db.addPackage(p));})).then(()=>{}).catch(()=>{});}else{data=json;filtered=json.packages;render();}}catch{} };r.readAsText(f);});
btnReload.addEventListener('click',()=>load());
window.onAuthReady=(user)=>{if(btnLogout){btnLogout.addEventListener('click',()=>window.logout());}load();};
if(window.db&&window.db.available){window.db.subscribeSettings(s=>{if(siteHeroUrl){siteHeroUrl.value=(s&&s.header_image)||'';}if(siteWa){siteWa.value=(s&&s.whatsapp_number)||'';}});} 
if(siteHeroSave){siteHeroSave.addEventListener('click',()=>{const u=(siteHeroUrl.value||'').trim();const w=(siteWa.value||'').trim();if(window.db&&window.db.available){window.db.updateSettings({header_image:u,whatsapp_number:w});}});}