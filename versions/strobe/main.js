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
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('DOMContentLoaded', route);
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
    // remove previous content except close button
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

// ---------- Strobe + image sequence ----------
(function () {
  const SLOT_COUNT = 31;                    // count of images in images/home/
  const IMAGE_PATH = 'images/home/';        // main-1.jpg .. main-N.jpg
  const STROBE_MS  = 2200;                  // duration of flashing phase
  const HOLD_MS    = 1800;                  // duration each image is held

  function init() {
    const s = document.getElementById('strobe');
    const slot = document.getElementById('strobeSlot');
    if (!s || !slot) return;

    // build slots — one <img> per slot pointing at images/home/NN.jpg
    const imgs = [];
    for (let i = 0; i < SLOT_COUNT; i++) {
      const d = document.createElement('div');
      d.className = 'slot-img';
      d.dataset.idx = i;
      const img = document.createElement('img');
      img.src = IMAGE_PATH + 'main-' + (i + 1) + '.jpg';
      img.alt = '';
      img.loading = i < 3 ? 'eager' : 'lazy';
      img.decoding = 'async';
      // fallback to a neutral stripe pattern if the image fails to load
      img.addEventListener('error', () => {
        img.remove();
        const ph = document.createElement('div');
        ph.className = 'ph';
        ph.style.background = 'repeating-linear-gradient(45deg, #000 0 1px, transparent 1px 14px), #fff';
        d.appendChild(ph);
      });
      d.appendChild(img);
      slot.appendChild(d);
      imgs.push(d);
    }

    let deck = [];         // shuffled queue of image indices
    let lastIdx = -1;      // last shown, to avoid immediate repeat across reshuffles
    let timer = null;
    let running = false;

    function shuffleDeck() {
      deck = imgs.map((_, i) => i);
      // Fisher-Yates
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      // if the first card of the new deck matches the last shown, swap with next
      if (deck.length > 1 && deck[0] === lastIdx) {
        [deck[0], deck[1]] = [deck[1], deck[0]];
      }
    }

    function nextIdx() {
      if (deck.length === 0) shuffleDeck();
      const n = deck.shift();
      lastIdx = n;
      return n;
    }

    function clearAll() { imgs.forEach(i => i.classList.remove('show')); }

    function toStrobe() {
      clearAll();
      s.classList.add('flash');
      timer = setTimeout(toImage, STROBE_MS);
    }

    function toImage() {
      s.classList.remove('flash');
      const n = nextIdx();
      imgs.forEach((img, i) => img.classList.toggle('show', i === n));
      timer = setTimeout(toStrobe, HOLD_MS);
    }

    function start() {
      if (running) return;
      running = true;
      lastIdx = -1;
      deck = [];
      s.classList.add('running');
      toStrobe();
    }

    function stop() {
      running = false;
      if (timer) { clearTimeout(timer); timer = null; }
      s.classList.remove('running', 'flash');
      clearAll();
    }

    function toggle() { running ? stop() : start(); }

    s.addEventListener('click', toggle);
    s.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });

    // pause when home is hidden, resume when shown
    const home = document.getElementById('home');
    if (home) {
      new MutationObserver(() => {
        if (home.hidden) stop();
        else start();
      }).observe(home, { attributes: true, attributeFilter: ['hidden'] });
    }

    // auto-start on load
    start();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
