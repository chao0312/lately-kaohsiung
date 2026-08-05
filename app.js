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

const floatingbar = document.getElementById('floatingbar');
const sitehead = document.querySelector('.sitehead');
const onScroll = () => {
  floatingbar.classList.toggle('is-visible', window.scrollY > sitehead.offsetHeight - 48);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
