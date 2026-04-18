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

// ---------- Fluorescent color + image sequence ----------
(function () {
  const SLOT_COUNT = 31;
  const IMAGE_PATH = 'images/home/';        // main-1.jpg .. main-N.jpg
  const COLOR_MS   = 900;                   // how long a flat color holds
  const IMAGE_MS   = 2200;                  // how long each image holds

  // Single fluorescent yellow-lime
  const COLORS = ['#ccff00'];

  function init() {
    const s = document.getElementById('strobe');
    const slot = document.getElementById('strobeSlot');
    if (!s || !slot) return;

    const imgs = [];
    const aspects = new Array(SLOT_COUNT).fill(null);  // natural w/h once loaded
    for (let i = 0; i < SLOT_COUNT; i++) {
      const d = document.createElement('div');
      d.className = 'slot-img';
      d.dataset.idx = i;
      const img = document.createElement('img');
      img.src = IMAGE_PATH + 'main-' + (i + 1) + '.jpg';
      img.alt = '';
      img.loading = i < 3 ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.addEventListener('load', () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          aspects[i] = img.naturalWidth / img.naturalHeight;
        }
      });
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

    // color patch — shown during color phase, sized to match the next image
    const patch = document.createElement('div');
    patch.className = 'strobe-patch';
    s.appendChild(patch);

    // --- Image deck (random, one pass per reshuffle) ---
    let deck = [];
    let lastIdx = -1;
    let pendingIdx = -1;   // image chosen at color-phase start, displayed next
    function shuffleDeck() {
      deck = imgs.map((_, i) => i);
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      if (deck.length > 1 && deck[0] === lastIdx) {
        [deck[0], deck[1]] = [deck[1], deck[0]];
      }
    }
    function takeNextImgIdx() {
      if (deck.length === 0) shuffleDeck();
      const n = deck.shift();
      lastIdx = n;
      return n;
    }

    // --- Color deck (no immediate repeats) ---
    let lastColor = null;
    function nextColor() {
      let c;
      do { c = COLORS[Math.floor(Math.random() * COLORS.length)]; }
      while (c === lastColor && COLORS.length > 1);
      lastColor = c;
      return c;
    }

    // --- Size color patch to match the incoming image (object-fit: contain) ---
    function sizePatchFor(imgIdx, color) {
      const boxW = s.clientWidth;
      const boxH = s.clientHeight;
      const fallbackAR = boxW / boxH;
      const ar = aspects[imgIdx] || fallbackAR;
      const boxAR = boxW / boxH;
      let w, h;
      if (ar >= boxAR) {
        w = boxW;
        h = boxW / ar;
      } else {
        h = boxH;
        w = boxH * ar;
      }
      patch.style.width = w + 'px';
      patch.style.height = h + 'px';
      patch.style.backgroundColor = color;
      patch.classList.add('show');
    }

    let timer = null;
    let running = false;

    function clearImages() { imgs.forEach(i => i.classList.remove('show')); }

    function toColor() {
      clearImages();
      pendingIdx = takeNextImgIdx();
      sizePatchFor(pendingIdx, nextColor());
      timer = setTimeout(toImage, COLOR_MS);
    }

    function toImage() {
      patch.classList.remove('show');
      imgs.forEach((img, i) => img.classList.toggle('show', i === pendingIdx));
      timer = setTimeout(toColor, IMAGE_MS);
    }

    function start() {
      if (running) return;
      running = true;
      lastIdx = -1;
      pendingIdx = -1;
      lastColor = null;
      deck = [];
      s.classList.add('running');
      toColor();
    }

    function stop() {
      running = false;
      if (timer) { clearTimeout(timer); timer = null; }
      s.classList.remove('running');
      patch.classList.remove('show');
      clearImages();
    }

    function toggle() { running ? stop() : start(); }

    s.addEventListener('click', toggle);
    s.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });

    const home = document.getElementById('home');
    if (home) {
      new MutationObserver(() => {
        if (home.hidden) stop();
        else start();
      }).observe(home, { attributes: true, attributeFilter: ['hidden'] });
    }

    start();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
