const heartBtns = document.querySelectorAll('.heart');
heartBtns.forEach(btn => btn.addEventListener('click', (e) => {
  e.stopPropagation();
  const fav = btn.classList.toggle('is-fav');
  btn.setAttribute('aria-pressed', fav);
}));

const cards = document.querySelectorAll('#gridFeed .card');
const selectedCats = new Set();

function applyFilters() {
  const catActive = selectedCats.size > 0;
  cards.forEach(c => {
    c.classList.toggle('is-filtered-out', catActive && !selectedCats.has(c.dataset.category));
  });
  markerRefs.forEach(({ marker, card }) => {
    const show = !catActive || selectedCats.has(card.dataset.category);
    if (!leafletMap) return;
    if (show && !leafletMap.hasLayer(marker)) marker.addTo(leafletMap);
    if (!show && leafletMap.hasLayer(marker)) marker.remove();
  });
}

const catToggles = document.querySelectorAll('.cat-toggle');
catToggles.forEach(el => el.addEventListener('click', (e) => {
  e.preventDefault();
  const cat = el.dataset.cat;
  const nowSelected = !selectedCats.has(cat);
  if (nowSelected) selectedCats.add(cat); else selectedCats.delete(cat);
  document.querySelectorAll(`.cat-toggle[data-cat="${cat}"]`).forEach(match => {
    match.classList.toggle('is-selected', nowSelected);
    if (match.hasAttribute('aria-pressed')) match.setAttribute('aria-pressed', nowSelected);
  });
  applyFilters();
}));
catToggles.forEach(el => el.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
}));

const todayEl = document.getElementById('todayDate');
if (todayEl) {
  const d = new Date();
  const parts = new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'long' }).formatToParts(d);
  const get = (t) => parts.find(p => p.type === t)?.value || '';
  todayEl.textContent = `${get('month')}月${get('day')}日 ${get('weekday')}`;
}

const gridFeed = document.getElementById('gridFeed');
const mapView = document.getElementById('mapView');
const mapSheet = document.getElementById('mapSheet');
const mapSheetBody = document.getElementById('mapSheetBody');
const mapSheetClose = document.getElementById('mapSheetClose');

// Zuoying (左營), Kaohsiung — placeholder until a Google Maps API key replaces this OSM view.
const ZUOYING_CENTER = [22.688, 120.297];
let leafletMap = null;
const markerRefs = [];

function initMap() {
  if (leafletMap) return;
  leafletMap = L.map('mapCanvas').setView(ZUOYING_CENTER, 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(leafletMap);

  cards.forEach(card => {
    const lat = parseFloat(card.dataset.lat);
    const lng = parseFloat(card.dataset.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;
    const icon = L.divIcon({
      html: `<span class="map-pin" data-category="${card.dataset.category}"></span>`,
      className: 'map-pin-wrapper',
      iconSize: [26, 34],
      iconAnchor: [13, 34]
    });
    const marker = L.marker([lat, lng], {
      icon,
      title: card.querySelector('.card__title').textContent
    }).addTo(leafletMap);
    marker.on('click', () => openMapSheet(card, marker));
    markerRefs.push({ marker, card });
  });

  showPlaceholder();
}

function showPlaceholder() {
  const placeholder = document.createElement('p');
  placeholder.className = 'map-sheet__placeholder';
  placeholder.textContent = '點選地圖上的標記，看看最近發生的事';
  mapSheetBody.replaceChildren(placeholder);
}

function openMapSheet(card, marker) {
  markerRefs.forEach(({ marker: m }) => {
    m.getElement()?.querySelector('.map-pin')?.classList.toggle('is-active', m === marker);
  });

  const photoWrap = document.createElement('div');
  photoWrap.className = 'card__photo';
  const sourceImg = card.querySelector('.card__photo img');
  const img = document.createElement('img');
  img.src = sourceImg.src;
  img.alt = sourceImg.alt;
  photoWrap.appendChild(img);

  const body = document.createElement('div');
  body.className = 'card__body';
  body.appendChild(card.querySelector('.pill').cloneNode(true));
  const title = document.createElement('h3');
  title.className = 'card__title';
  title.textContent = card.querySelector('.card__title').textContent;
  const desc = document.createElement('p');
  desc.className = 'card__desc';
  desc.textContent = card.querySelector('.card__desc').textContent;
  const meta = document.createElement('p');
  meta.className = 'card__meta';
  meta.textContent = card.querySelector('.card__meta').textContent;
  body.append(title, desc, meta);

  mapSheetBody.replaceChildren(photoWrap, body);
  mapSheet.classList.add('is-open');
}

function closeMapSheet() {
  mapSheet.classList.remove('is-open');
  markerRefs.forEach(({ marker }) => {
    marker.getElement()?.querySelector('.map-pin')?.classList.remove('is-active');
  });
  showPlaceholder();
}
mapSheetClose.addEventListener('click', closeMapSheet);

const viewToggleBtns = document.querySelectorAll('.view-toggle__btn');
viewToggleBtns.forEach(btn => btn.addEventListener('click', () => {
  viewToggleBtns.forEach(b => b.classList.toggle('is-active', b === btn));
  const isMap = btn.dataset.view === 'map';
  gridFeed.classList.toggle('is-hidden', isMap);
  mapView.classList.toggle('is-hidden', !isMap);
  if (isMap) {
    initMap();
    requestAnimationFrame(() => leafletMap.invalidateSize());
  } else {
    closeMapSheet();
  }
}));

const floatingbar = document.getElementById('floatingbar');
const sitehead = document.querySelector('.sitehead');
const onScroll = () => {
  floatingbar.classList.toggle('is-visible', window.scrollY > sitehead.offsetHeight - 48);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
