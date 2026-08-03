const heartBtns = document.querySelectorAll('.heart');
heartBtns.forEach(btn => btn.addEventListener('click', (e) => {
  e.stopPropagation();
  const fav = btn.classList.toggle('is-fav');
  btn.setAttribute('aria-pressed', fav);
}));

const searchInputs = document.querySelectorAll('.search-input');
const cards = document.querySelectorAll('#gridFeed .card');
const dividers = document.querySelectorAll('#gridFeed .divider');
let searchQuery = '';
const selectedCats = new Set();

function applyFilters() {
  const searchActive = searchQuery.length > 0;
  const catActive = selectedCats.size > 0;
  dividers.forEach(d => d.classList.toggle('is-filtered-out', searchActive || catActive));
  cards.forEach(c => {
    const text = (c.querySelector('.card__title').textContent + c.querySelector('.card__desc').textContent).toLowerCase();
    const matchesSearch = !searchActive || text.includes(searchQuery);
    const matchesCat = !catActive || selectedCats.has(c.dataset.category);
    c.classList.toggle('is-filtered-out', !(matchesSearch && matchesCat));
  });
}
searchInputs.forEach(inp => inp.addEventListener('input', () => {
  searchQuery = inp.value.trim().toLowerCase();
  searchInputs.forEach(other => { if (other !== inp) other.value = inp.value; });
  applyFilters();
}));

document.querySelectorAll('.search-wrap').forEach(wrap => {
  const btn = wrap.querySelector('.search-btn');
  const input = wrap.querySelector('.search-input');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = wrap.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open);
    if (open) input.focus();
  });
});
document.addEventListener('click', (e) => {
  document.querySelectorAll('.search-wrap.is-open').forEach(wrap => {
    if (!wrap.contains(e.target)) {
      wrap.classList.remove('is-open');
      wrap.querySelector('.search-btn').setAttribute('aria-expanded', 'false');
    }
  });
});

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

const btnCardViews = document.querySelectorAll('.btn-card-view');
const btnMapViews = document.querySelectorAll('.btn-map-view');
const gridFeed = document.getElementById('gridFeed');
const mapView = document.getElementById('mapView');
function setView(view) {
  const showCards = view === 'card';
  btnCardViews.forEach(b => { b.classList.toggle('is-active', showCards); b.setAttribute('aria-pressed', showCards); });
  btnMapViews.forEach(b => { b.classList.toggle('is-active', !showCards); b.setAttribute('aria-pressed', !showCards); });
  gridFeed.classList.toggle('is-hidden', !showCards);
  mapView.classList.toggle('is-visible', !showCards);
}
btnCardViews.forEach(b => b.addEventListener('click', () => setView('card')));
btnMapViews.forEach(b => b.addEventListener('click', () => setView('map')));

const todayEl = document.getElementById('todayDate');
if (todayEl) {
  const d = new Date();
  const parts = new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'long' }).formatToParts(d);
  const get = (t) => parts.find(p => p.type === t)?.value || '';
  todayEl.textContent = `${get('month')}月${get('day')}日 ${get('weekday')}`;
}

const floatingbar = document.getElementById('floatingbar');
const sitehead = document.querySelector('.sitehead');
const onScroll = () => {
  floatingbar.classList.toggle('is-visible', window.scrollY > sitehead.offsetHeight - 48);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
