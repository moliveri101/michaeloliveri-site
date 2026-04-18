// ---------- Routing ----------
(function () {
  const sections = document.querySelectorAll('main section');
  const navLinks = document.querySelectorAll('#sidebar a[href^="#"]');

  function route() {
    const hash = (location.hash || '#home').slice(1);
    const target = document.getElementById(hash) ? hash : 'home';
    sections.forEach(s => { s.hidden = s.id !== target; });

    navLinks.forEach(a => {
      const href = a.getAttribute('href').slice(1);
      const active = target === href || target.startsWith(href + '-');
      a.classList.toggle('active', active);
    });

    // expand the parent category in the sidebar when on its grid or any sub-page
    document.querySelectorAll('.menu > li[data-cat]').forEach(li => {
      const cat = li.dataset.cat;
      const matches = target === cat || target.startsWith(cat + '-');
      li.classList.toggle('open', matches);
    });

    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('DOMContentLoaded', route);
})();

// ---------- Home grid (all images edge-to-edge, auto-detect, randomized) ----------
(function () {
  const IMAGE_PATH = 'images/home/';
  const MAX_PROBE  = 200;   // upper bound of main-N.jpg filenames to probe
  const GAP_STOP   = 12;    // stop after this many consecutive missing numbers

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function probeImage(i) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload  = () => resolve(i);
      img.onerror = () => resolve(null);
      img.src = IMAGE_PATH + 'main-' + i + '.jpg';
    });
  }

  // Probe in parallel in blocks of 20; stop once a full block is missing
  async function findAvailable() {
    const found = [];
    const BLOCK = 20;
    let lastSeen = 0;
    for (let base = 1; base <= MAX_PROBE; base += BLOCK) {
      const batch = [];
      for (let i = base; i < base + BLOCK && i <= MAX_PROBE; i++) batch.push(probeImage(i));
      const results = await Promise.all(batch);
      let anyHit = false;
      results.forEach(n => { if (n !== null) { found.push(n); lastSeen = n; anyHit = true; } });
      // stop if we've had a whole block of misses after the last hit and gap exceeds threshold
      if (!anyHit && base - lastSeen > GAP_STOP) break;
    }
    return found.sort((a, b) => a - b);
  }

  async function init() {
    const grid = document.getElementById('homeGrid');
    if (!grid) return;
    const available = await findAvailable();
    const order = shuffle(available.slice());

    const frag = document.createDocumentFragment();
    order.forEach((n, idx) => {
      const cell = document.createElement('div');
      cell.className = 'home-tile';
      const img = document.createElement('img');
      img.src = IMAGE_PATH + 'main-' + n + '.jpg';
      img.alt = '';
      img.loading = idx < 10 ? 'eager' : 'lazy';
      img.decoding = 'async';
      cell.appendChild(img);
      frag.appendChild(cell);
    });
    grid.innerHTML = '';
    grid.appendChild(frag);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// ---------- Lightbox ----------
(function () {
  let box = null;

  function ensure() {
    if (box) return box;
    box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.type = 'button';
    closeBtn.textContent = 'Close \u00d7';
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); close(); });
    box.appendChild(closeBtn);
    box.addEventListener('click', close);
    document.body.appendChild(box);
    return box;
  }

  function open(sourceEl) {
    const lb = ensure();
    Array.from(lb.querySelectorAll(':scope > :not(.lightbox-close)')).forEach(n => n.remove());
    const content = sourceEl.querySelector('img, .ph');
    if (!content) return;
    const clone = content.cloneNode(true);
    clone.removeAttribute('style');
    lb.appendChild(clone);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!box) return;
    box.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('.img-link');
    if (!link) return;
    e.preventDefault();
    open(link);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();
