const nf = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' });
const editorModal = document.getElementById('editor-modal');
const editorContent = document.getElementById('editor-content');
const adminList = document.getElementById('admin-list');
const adminSearch = document.getElementById('admin-search');
const btnAdd = document.getElementById('btn-add');
const btnLogout = document.getElementById('btn-logout');
const siteHeroUrl = document.getElementById('site-hero-url');
const siteHeroSave = document.getElementById('site-hero-save');
const siteWa = document.getElementById('site-wa');
let waNumber = null;
function normalizeWa(n) { if (!n) return null; let d = String(n).trim().replace(/[^\d]/g, ''); if (!d) return null; if (d.startsWith('0')) { d = '62' + d.slice(1); } else if (d.startsWith('62')) { d = d; } else if (d.startsWith('8')) { d = '62' + d; } else { d = '62' + d; } return d; }
let data = { packages: [] }; let filtered = []; let q = '';
function load() { if (window.db && window.db.available) { window.db.subscribePackages(json => { if (!json) return; data = json; filtered = json.packages; render(); }); } else { fetch('data/tours.json').then(r => r.json()).then(json => { data = json; filtered = json.packages; render(); }); } }
function render() {
  adminList.innerHTML = ''; filtered.forEach(p => {
    const card = document.createElement('article'); card.className = 'card'; card.innerHTML = `
  <div class="thumb">
    <img src="${p.thumbnail || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop'}" alt="${p.title}">
    ${p.duration ? `<span class='badge'>${p.duration}</span>` : ''}
  </div>
  <div class="content">
    <div class="title">${p.title}</div>
    <div class="meta">${p.location}</div>
    <div class="tags">${(p.tags || []).slice(0, 4).map(t => `<span class='tag'>${t}</span>`).join('')}</div>
  </div>
  <div class="actions">
    <span class="price">${nf.format(p.price)}</span>
    <div style="display:flex;gap:8px">
      <button class="btn" data-act="edit" data-id="${p.id}">Edit</button>
      <button class="btn" data-act="delete" data-id="${p.id}">Hapus</button>
    </div>
  </div>`; card.querySelector('[data-act="edit"]').addEventListener('click', () => openEditor(p)); card.querySelector('[data-act="delete"]').addEventListener('click', () => del(p.id)); adminList.appendChild(card);
  });
}
function openEditor(p) {
  const model = JSON.parse(JSON.stringify(p || { id: crypto.randomUUID(), title: '', location: '', duration: '', price: 0, thumbnail: '', gallery: [], tags: [], short_description: '', long_description: '', highlights: [], policies: [], meeting_point: '', map_lat: null, map_lng: null, map_query: '', map_embed: '', itinerary: [], includes: [], excludes: [], featured: false })); editorContent.innerHTML = `
  <div class="modal-body" style="grid-template-columns:1fr 1fr">
    <div>
      <h2>Edit Paket</h2>
      <div class="list">
        <input class="field" name="title" data-f="title" placeholder="Judul" value="${model.title || ''}">
        <input class="field" name="location" data-f="location" placeholder="Lokasi" value="${model.location || ''}">
        <input class="field" name="duration" data-f="duration" placeholder="Durasi" value="${model.duration || ''}">
        <input class="field" name="price" data-f="price" placeholder="Harga" type="number" value="${model.price || 0}">
        <input class="field" name="thumbnail" data-f="thumbnail" placeholder="Thumbnail URL" value="${model.thumbnail || ''}">
        <input class="field" name="meeting_point" data-f="meeting_point" placeholder="Titik kumpul" value="${model.meeting_point || ''}">
        <div class="list">
          <input class="field" name="map_lat" data-f="map_lat" placeholder="Latitude (contoh: -7.942)" value="${(model.map_lat ?? '')}">
          <input class="field" name="map_lng" data-f="map_lng" placeholder="Longitude (contoh: 112.953)" value="${(model.map_lng ?? '')}">
          <input class="field" name="map_query" data-f="map_query" placeholder="Alamat/Place (opsional)" value="${model.map_query || ''}">
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
          <button class="btn" id="btn-geo">Lokasi saya</button>
          <input id="map-link" name="map_link" class="field" placeholder="Tempel link Google Maps">
          <button class="btn" id="btn-parse">Ambil dari link</button>
        </div>
        <input class="field" name="map_embed" data-f="map_embed" placeholder="Embed Map src (opsional)" value="${model.map_embed || ''}">
        <textarea class="field" name="short_description" data-f="short_description" placeholder="Deskripsi singkat">${model.short_description || ''}</textarea>
        <textarea class="field" name="long_description" data-f="long_description" placeholder="Deskripsi lengkap">${model.long_description || ''}</textarea>
        <textarea class="field" name="highlights" data-f="highlights" placeholder="Highlight (baris baru)">${(model.highlights || []).join('\n')}</textarea>
        <textarea class="field" name="policies" data-f="policies" placeholder="Kebijakan (baris baru)">${(model.policies || []).join('\n')}</textarea>
        <input class="field" name="tags" data-f="tags" placeholder="Tags (koma)" value="${(model.tags || []).join(', ')}">
        <textarea class="field" name="gallery" data-f="gallery" placeholder="Gallery URLs (baris baru)">${(model.gallery || []).join('\n')}</textarea>
        <textarea class="field" name="itinerary" data-f="itinerary" placeholder="Itinerary (format: Hari|Judul|Detail per baris)">${(model.itinerary || []).map(i => `${i.day}|${i.title}|${i.details}`).join('\n')}</textarea>
        <textarea class="field" name="includes" data-f="includes" placeholder="Termasuk (baris baru)">${(model.includes || []).join('\n')}</textarea>
        <textarea class="field" name="excludes" data-f="excludes" placeholder="Tidak termasuk (baris baru)">${(model.excludes || []).join('\n')}</textarea>
        <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="featured" ${model.featured ? 'checked' : ''}> Featured</label>
      </div>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="btn" id="save">Simpan</button>
      </div>
    </div>
    <div>
      <div id="live-preview" style="overflow:auto;min-height:260px"></div>
    </div>
  </div>`; editorModal.classList.remove('hidden'); const get = (s) => editorContent.querySelector(`[data-f="${s}"]`);
  const btnGeo = editorContent.querySelector('#btn-geo');
  if (btnGeo && navigator.geolocation) { btnGeo.addEventListener('click', () => { navigator.geolocation.getCurrentPosition(pos => { get('map_lat').value = String(pos.coords.latitude.toFixed(6)); get('map_lng').value = String(pos.coords.longitude.toFixed(6)); get('map_query').value = `${pos.coords.latitude},${pos.coords.longitude}`; }); }); }
  const btnParse = editorContent.querySelector('#btn-parse'); const mapLink = editorContent.querySelector('#map-link');
  if (btnParse) {
    btnParse.addEventListener('click', () => {
      const url = (mapLink && mapLink.value || '').trim(); if (!url) return; let lat = null, lng = null; let m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/); if (m) { lat = parseFloat(m[1]); lng = parseFloat(m[2]); }
      if (lat === null) { m = url.match(/[?&]q=([^&]+)/); if (m) { try { const qv = decodeURIComponent(m[1]); const parts = qv.split(','); if (parts.length >= 2) { const la = parseFloat(parts[0]); const ln = parseFloat(parts[1]); if (!isNaN(la) && !isNaN(ln)) { lat = la; lng = ln; } } else { get('map_query').value = qv; } } catch (e) { } } }
      if (lat !== null && lng !== null) { get('map_lat').value = String(lat); get('map_lng').value = String(lng); if (!get('map_query').value) { get('map_query').value = `${lat},${lng}`; } renderPreview(); }
    });
  }
  function parsePreviewModel() { const q = (s) => editorContent.querySelector(`[data-f="${s}"]`); const m = {}; m.title = (q('title').value || '').trim(); m.location = (q('location').value || '').trim(); m.duration = (q('duration').value || '').trim(); m.price = parseInt(q('price').value || '0', 10); m.thumbnail = (q('thumbnail').value || '').trim(); m.meeting_point = (q('meeting_point').value || '').trim(); m.map_lat = (q('map_lat').value ? parseFloat(q('map_lat').value) : null); m.map_lng = (q('map_lng').value ? parseFloat(q('map_lng').value) : null); m.map_query = (q('map_query').value || '').trim(); let embed = (q('map_embed').value || '').trim(); if (embed) { const mm = embed.match(/src=["']([^"']+)["']/); if (mm) { embed = mm[1]; } if (!embed.startsWith('https://www.google.com/maps/embed')) { embed = ''; } } m.map_embed = embed; m.short_description = (q('short_description').value || '').trim(); m.long_description = (q('long_description').value || '').trim(); m.highlights = (q('highlights').value || '').split('\n').map(s => s.trim()).filter(Boolean); m.policies = (q('policies').value || '').split('\n').map(s => s.trim()).filter(Boolean); m.tags = (q('tags').value || '').split(',').map(s => s.trim()).filter(Boolean); m.gallery = (q('gallery').value || '').split('\n').map(s => s.trim()).filter(Boolean); m.itinerary = (q('itinerary').value || '').split('\n').map(s => s.split('|')).filter(a => a.length >= 3).map(a => ({ day: parseInt(a[0], 10) || 1, title: a[1], details: a[2] })); m.includes = (q('includes').value || '').split('\n').map(s => s.trim()).filter(Boolean); m.excludes = (q('excludes').value || '').split('\n').map(s => s.trim()).filter(Boolean); return m; }
  let previewScale = 0.4; const elScale = editorContent.querySelector('#preview-scale'); const elScaleLabel = editorContent.querySelector('#preview-scale-label'); if (elScale) { previewScale = (parseInt(elScale.value, 10) || 40) / 100; }
  function renderPreview() {
    const target = document.getElementById('live-preview');
    if (!target) return;
    const pm = parsePreviewModel();
    target.innerHTML = '';
    const card = document.createElement('div'); card.className = 'card';
    const body = document.createElement('div'); body.className = 'modal-body'; body.style.gridTemplateColumns = '1fr 1fr'; body.style.padding = '12px';
    const left = document.createElement('div'); const right = document.createElement('div');
    const header = document.createElement('div'); header.className = 'detail-header';
    const hL = document.createElement('div');
    const t = document.createElement('h2'); t.className = 'detail-title'; t.textContent = pm.title || '(Judul paket)';
    const s = document.createElement('div'); s.className = 'detail-sub'; s.textContent = (pm.location || '(Lokasi)') + ' • ' + (pm.duration || '') + (pm.meeting_point ? (' • Titik kumpul: ' + pm.meeting_point) : '');
    hL.appendChild(t); hL.appendChild(s);
    const hR = document.createElement('div'); hR.className = 'detail-actions';
    const pz = document.createElement('div'); pz.className = 'price-badge'; pz.textContent = nf.format(pm.price || 0);
    hR.appendChild(pz);
    const hasLL = (typeof pm.map_lat === 'number' && !isNaN(pm.map_lat)) && (typeof pm.map_lng === 'number' && !isNaN(pm.map_lng));
    const mapLink = hasLL ? ('https://www.google.com/maps?q=' + pm.map_lat + ',' + pm.map_lng) : (pm.map_query ? ('https://www.google.com/maps?q=' + encodeURIComponent(pm.map_query)) : null);
    const waNum = (waNumber ? String(waNumber).replace(/[^\d]/g, '') : null);
    const cta = document.createElement('div'); cta.className = 'cta-group';
    if (waNum) { const a = document.createElement('a'); a.className = 'btn btn-wa'; a.href = 'https://wa.me/' + waNum + '?text=' + encodeURIComponent('Halo, saya ingin menanyakan ketersediaan paket ' + (pm.title || '-') + (pm.location ? (' di ' + pm.location) : '') + '.\nHarga: ' + nf.format(pm.price || 0) + '\nDurasi: ' + (pm.duration || '-')); a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'WhatsApp'; cta.appendChild(a); }
    if (mapLink) { const a = document.createElement('a'); a.className = 'btn btn-map'; a.href = mapLink; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Google Maps'; cta.appendChild(a); }
    hR.appendChild(cta);
    header.appendChild(hL); header.appendChild(hR);
    left.appendChild(header);
    const desc = document.createElement('p'); desc.textContent = pm.long_description || pm.short_description || '';
    left.appendChild(desc);
    if (pm.highlights && pm.highlights.length) { const chips = document.createElement('div'); chips.className = 'chip-list'; pm.highlights.forEach(i => { const c = document.createElement('span'); c.className = 'chip'; c.textContent = i; chips.appendChild(c); }); left.appendChild(chips); }
    const incT = document.createElement('div'); incT.className = 'section-title'; incT.textContent = 'Termasuk';
    const incL = document.createElement('ul'); incL.className = 'list'; (pm.includes && pm.includes.length ? pm.includes : ['Informasi belum tersedia']).forEach(i => { const li = document.createElement('li'); li.textContent = i; incL.appendChild(li); });
    left.appendChild(incT); left.appendChild(incL);
    const excT = document.createElement('div'); excT.className = 'section-title'; excT.textContent = 'Tidak Termasuk';
    const excL = document.createElement('ul'); excL.className = 'list'; (pm.excludes && pm.excludes.length ? pm.excludes : ['Informasi belum tersedia']).forEach(i => { const li = document.createElement('li'); li.textContent = i; excL.appendChild(li); });
    left.appendChild(excT); left.appendChild(excL);
    const itinT = document.createElement('div'); itinT.className = 'section-title'; itinT.textContent = 'Rincian Perjalanan';
    left.appendChild(itinT);
    if (pm.itinerary && pm.itinerary.length) { const tl = document.createElement('div'); tl.className = 'timeline'; pm.itinerary.forEach(it => { const item = document.createElement('div'); item.className = 'timeline-item'; const d = document.createElement('div'); d.className = 'timeline-day'; d.textContent = 'Hari ' + (it.day || 1); const tt = document.createElement('div'); tt.className = 'timeline-title'; tt.textContent = it.title || ''; const td = document.createElement('div'); td.className = 'timeline-desc'; td.textContent = it.details || ''; item.appendChild(d); item.appendChild(tt); item.appendChild(td); tl.appendChild(item); }); left.appendChild(tl); } else { const ul = document.createElement('ul'); ul.className = 'list'; const li = document.createElement('li'); li.textContent = 'Rincian belum tersedia'; ul.appendChild(li); left.appendChild(ul); }
    if (pm.policies && pm.policies.length) { const polS = document.createElement('div'); polS.className = 'section'; const polT = document.createElement('div'); polT.className = 'section-title'; polT.textContent = 'Kebijakan'; const polL = document.createElement('ul'); polL.className = 'list'; pm.policies.forEach(i => { const li = document.createElement('li'); li.textContent = i; polL.appendChild(li); }); polS.appendChild(polT); polS.appendChild(polL); left.appendChild(polS); }
    const gallery = document.createElement('div'); gallery.className = 'gallery-scroll'; const gal = (pm.gallery && pm.gallery.length ? pm.gallery : ['https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200&auto=format&fit=crop']); gal.slice(0, 8).forEach(u => { const img = document.createElement('img'); img.src = u; img.alt = 'preview'; gallery.appendChild(img); });
    right.appendChild(gallery);
    const embedValid = (typeof pm.map_embed === 'string' && pm.map_embed.startsWith('https://www.google.com/maps/embed'));
    const mapSrc = embedValid ? pm.map_embed : (hasLL ? ('https://www.google.com/maps?q=' + pm.map_lat + ',' + pm.map_lng + '&z=12&output=embed') : (pm.map_query ? ('https://www.google.com/maps?q=' + encodeURIComponent(pm.map_query) + '&z=12&output=embed') : null));
    if (mapSrc) { const map = document.createElement('div'); map.className = 'map'; const iframe = document.createElement('iframe'); iframe.className = 'map-frame'; iframe.src = mapSrc; iframe.setAttribute('allowfullscreen', ''); iframe.loading = 'lazy'; map.appendChild(iframe); right.appendChild(map); }
    if (pm.tags && pm.tags.length) { const tg = document.createElement('div'); tg.className = 'tags'; tg.style.marginTop = '12px'; pm.tags.slice(0, 12).forEach(tag => { const sTag = document.createElement('span'); sTag.className = 'tag'; sTag.textContent = tag; tg.appendChild(sTag); }); right.appendChild(tg); }
    body.appendChild(left); body.appendChild(right); card.appendChild(body); target.appendChild(card);
  }
    editorContent.querySelectorAll('.field').forEach(el => { el.addEventListener('input', renderPreview); });
    const chk = editorContent.querySelector('input[type="checkbox"]'); if (chk) { chk.addEventListener('change', renderPreview); } renderPreview();
    document.getElementById('save').addEventListener('click', () => { const q = (s) => editorContent.querySelector(`[data-f="${s}"]`); model.title = (q('title').value || '').trim(); model.location = (q('location').value || '').trim(); model.duration = (q('duration').value || '').trim(); model.price = parseInt(q('price').value || '0', 10); model.thumbnail = (q('thumbnail').value || '').trim(); model.meeting_point = (q('meeting_point').value || '').trim(); model.map_lat = (q('map_lat').value ? parseFloat(q('map_lat').value) : null); model.map_lng = (q('map_lng').value ? parseFloat(q('map_lng').value) : null); model.map_query = (q('map_query').value || '').trim(); let embed = (q('map_embed').value || '').trim(); if (embed) { const m = embed.match(/src=["']([^"']+)["']/); if (m) { embed = m[1]; } if (!embed.startsWith('https://www.google.com/maps/embed')) { embed = ''; } } model.map_embed = embed; model.short_description = (q('short_description').value || '').trim(); model.long_description = (q('long_description').value || '').trim(); model.highlights = (q('highlights').value || '').split('\n').map(s => s.trim()).filter(Boolean); model.policies = (q('policies').value || '').split('\n').map(s => s.trim()).filter(Boolean); model.tags = (q('tags').value || '').split(',').map(s => s.trim()).filter(Boolean); model.gallery = (q('gallery').value || '').split('\n').map(s => s.trim()).filter(Boolean); model.itinerary = (q('itinerary').value || '').split('\n').map(s => s.split('|')).filter(a => a.length >= 3).map(a => ({ day: parseInt(a[0], 10) || 1, title: a[1], details: a[2] })); model.includes = (q('includes').value || '').split('\n').map(s => s.trim()).filter(Boolean); model.excludes = (q('excludes').value || '').split('\n').map(s => s.trim()).filter(Boolean); model.featured = editorContent.querySelector('input[type="checkbox"]').checked; if (window.db && window.db.available) { const exists = !!(data.packages.find(x => x.id === model.id)); (exists ? window.db.updatePackage(model.id, model) : window.db.addPackage(model)).then(() => { editorModal.classList.add('hidden'); }).catch(() => { }); } else { const idx = data.packages.findIndex(x => x.id === model.id); if (idx >= 0) { data.packages[idx] = model; } else { data.packages.push(model); } filtered = data.packages.filter(f => match(f, q)); render(); editorModal.classList.add('hidden'); } });
  }
function del(id) { if (window.db && window.db.available) { window.db.deletePackage(id).then(() => { }).catch(() => { }); } else { const i = data.packages.findIndex(x => x.id === id); if (i >= 0) { data.packages.splice(i, 1); filtered = data.packages.filter(f => match(f, q)); render(); } } }
function del(id) { if (window.db && window.db.available) { window.db.deletePackage(id).then(() => { }).catch(() => { }); } else { const i = data.packages.findIndex(x => x.id === id); if (i >= 0) { data.packages.splice(i, 1); filtered = data.packages.filter(f => match(f, q)); render(); } } }
function match(p, s) { return [p.title, p.location, (p.tags || []).join(' ')].join(' ').toLowerCase().includes((s || '').toLowerCase()); }
adminSearch.addEventListener('input', e => { q = e.target.value; filtered = data.packages.filter(f => match(f, q)); render(); });
document.addEventListener('click', e => { if (e.target.dataset.close) { editorModal.classList.add('hidden'); } });
btnAdd.addEventListener('click', () => openEditor(null));
window.onAuthReady = (user) => { if (btnLogout) { btnLogout.addEventListener('click', () => window.logout()); } load(); };
if (window.db && window.db.available) { window.db.subscribeSettings(s => { if (siteHeroUrl) { siteHeroUrl.value = (s && s.header_image) || ''; } if (siteWa) { siteWa.value = (s && s.whatsapp_number) || ''; } waNumber = normalizeWa(s && s.whatsapp_number) || null; }); }
if (siteHeroSave) { siteHeroSave.addEventListener('click', () => { const u = (siteHeroUrl.value || '').trim(); const w = (siteWa.value || '').trim(); if (window.db && window.db.available) { window.db.updateSettings({ header_image: u, whatsapp_number: w }); } }); }