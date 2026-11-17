/* ===== PEHNAWA PRET — script.js ===== */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---------- 1. EDITABLE CONFIG ---------- */
  // Social profiles: paste your real URLs here. Empty = shows a reminder message.
  const SOCIAL = { instagram: "", facebook: "", pinterest: "" };

  // Images used around the page. Replace any URL with your own photo (local file path works too).
  const u = (id, w) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w || 1000}&q=80`;
  const IMAGES = {
    hero:  u("photo-1583391733956-3750e0ff4e8b", 2000),
    cat1:  u("photo-1610030469983-98e550d6193c", 800),
    cat2:  u("photo-1595777457583-95e059d581b8", 800),
    cat3:  u("photo-1617627143750-d86bc21e42bb", 800),
    cat4:  u("photo-1583391733981-8498408ee4b6", 800),
    story: u("photo-1609357605129-26f69add5d6e", 1000),
    bridal: u("photo-1594736797933-d0501ba2fe65", 2000),
    g1: u("photo-1602810318383-e386cc2a3ccf", 900),
    g2: u("photo-1621184455862-c163dfb30e0f", 700),
    g3: u("photo-1585487000160-6ebcfceb0d03", 800),
    g4: u("photo-1590736969955-71cc94801759", 700),
    g5: u("photo-1583391733956-3750e0ff4e8b", 800),
    g6: u("photo-1595777457583-95e059d581b8", 900)
  };

  // Products: change name, category, price (in PKR), image, description here.
  // Categories must be one of: Bridal, Luxury Pret, Party Wear, Festive
  const PRODUCTS = [
    { id: 1, name: "Mehr-e-Noor",  cat: "Bridal",      price: 185000, img: u("photo-1610030469983-98e550d6193c", 800), desc: "A heavily embroidered bridal lehenga in deep burgundy with hand-finished zari borders and a layered net dupatta.", details: ["Hand embroidery with zari and dabka", "Lehenga, choli and dupatta", "Made to measure"] },
    { id: 2, name: "Gulnaar",      cat: "Festive",     price: 28000,  img: u("photo-1617627143750-d86bc21e42bb", 800), desc: "A festive three-piece in rich pomegranate tones with floral threadwork on the shirt and a printed silk dupatta.", details: ["Embroidered shirt and silk dupatta", "Raw silk trousers", "Ready to wear"] },
    { id: 3, name: "Zareen",       cat: "Party Wear",  price: 45000,  img: u("photo-1583391733981-8498408ee4b6", 800), desc: "An evening ensemble in champagne with fine sequin work and a softly flared silhouette.", details: ["Sequin and thread embroidery", "Chiffon dupatta", "Ready to wear"] },
    { id: 4, name: "Noor-e-Sahar", cat: "Luxury Pret", price: 18500,  img: u("photo-1595777457583-95e059d581b8", 800), desc: "A light, refined luxury pret piece in ivory with tonal embroidery, made for day events and gatherings.", details: ["Tonal thread embroidery", "Cotton net and lawn lining", "Ready to wear"] },
    { id: 5, name: "Sheesh Mahal", cat: "Bridal",      price: 245000, img: u("photo-1594736797933-d0501ba2fe65", 800), desc: "Inspired by mirror-work palaces, this bridal sharara is covered in fine shisha, pearls and gold detailing.", details: ["Shisha, pearl and zardozi work", "Sharara, kameez and dupatta", "Made to measure"] },
    { id: 6, name: "Chandni",      cat: "Party Wear",  price: 38000,  img: u("photo-1609357605129-26f69add5d6e", 800), desc: "A silver-toned party outfit with delicate embellishment, designed to catch the light as you move.", details: ["Embellished organza", "Silk inner and trousers", "Ready to wear"] },
    { id: 7, name: "Gul-e-Bahar",  cat: "Festive",     price: 32500,  img: u("photo-1602810318383-e386cc2a3ccf", 800), desc: "Spring-inspired florals in jewel tones, embroidered on rich fabric for Eid and wedding season.", details: ["Multi-colour floral embroidery", "Jacquard trousers", "Ready to wear"] },
    { id: 8, name: "Roshni",       cat: "Luxury Pret", price: 22000,  img: u("photo-1621184455862-c163dfb30e0f", 800), desc: "An easy, elegant pret ensemble with fine embroidered neckline and a soft, flowing drape.", details: ["Embroidered neckline and hem", "Chiffon dupatta", "Ready to wear"] }
  ];

  /* ---------- 2. HELPERS ---------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const fmt = n => "PKR " + n.toLocaleString("en-PK");
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, fallback) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fallback : v; } catch (e) { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  const byId = id => PRODUCTS.find(p => p.id === id);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 3. IMAGES (with graceful fallback) ---------- */
  function bindImage(img, src) {
    const wrap = img.closest(".img-wrap");
    img.addEventListener("load", () => img.classList.add("loaded"));
    img.addEventListener("error", () => { if (wrap) wrap.classList.add("img-fallback"); });
    img.src = src;
    if (img.complete && img.naturalWidth) img.classList.add("loaded");
  }
  $$("img[data-img]").forEach(img => bindImage(img, IMAGES[img.dataset.img]));

  /* ---------- 4. STATE ---------- */
  let bag = store.get("pp_bag", []);           // [{id, qty}]
  let wishlist = store.get("pp_wish", []);     // [id]
  let activeFilter = "All";
  const saveBag = () => store.set("pp_bag", bag);
  const saveWish = () => store.set("pp_wish", wishlist);
  bag = bag.filter(i => byId(i.id) && i.qty > 0);

  /* ---------- 5. TOASTS ---------- */
  const toastWrap = $("#toastWrap");
  function toast(msg, type) {
    const t = document.createElement("div");
    t.className = "toast" + (type === "err" ? " err" : "");
    t.textContent = msg;
    toastWrap.appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 450); }, 2800);
  }

  /* ---------- 6. OVERLAYS (drawer, modal, search) ---------- */
  const overlay = $("#overlay");
  let openPanel = null, lastFocus = null;
  function openLayer(el) {
    closeLayer(true);
    closeMenu();
    lastFocus = document.activeElement;
    el.hidden = false; overlay.hidden = false;
    document.body.classList.add("locked");
    requestAnimationFrame(() => requestAnimationFrame(() => { el.classList.add("show"); overlay.classList.add("show"); }));
    openPanel = el;
    setTimeout(() => { const f = $("input, [data-close]", el); if (f) f.focus(); }, 60);
  }
  function closeLayer(immediate) {
    if (!openPanel) return;
    const el = openPanel; openPanel = null;
    el.classList.remove("show"); overlay.classList.remove("show");
    const done = () => { el.hidden = true; overlay.hidden = true; document.body.classList.remove("locked"); };
    if (immediate || reduceMotion) done(); else setTimeout(() => { if (!openPanel) done(); else el.hidden = true; }, 420);
    if (!immediate && lastFocus && lastFocus.focus) lastFocus.focus();
  }
  overlay.addEventListener("click", () => closeLayer());
  document.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeLayer(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { if (openPanel) closeLayer(); else closeMenu(); }
    // simple focus trap
    if (e.key === "Tab" && openPanel) {
      const items = $$("button, a[href], input", openPanel).filter(n => !n.disabled && n.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- 7. HEADER + MOBILE MENU ---------- */
  const header = $("#header"), nav = $("#nav"), menuToggle = $("#menuToggle");
  const progress = $("#progress"), heroImg = $(".hero-img"), bridalImg = $(".bridal-img"), bridalSec = $("#bridal");
  const onScroll = () => {
    const y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("scrolled", y > 40);
    progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    if (reduceMotion) return;
    if (y < window.innerHeight * 1.2) heroImg.style.transform = `translate3d(0, ${Math.min(y * 0.12, 80)}px, 0)`;
    const r = bridalSec.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) {
      const prog = (window.innerHeight - r.top) / (window.innerHeight + r.height);
      bridalImg.style.transform = `translate3d(0, ${((prog - 0.5) * -80).toFixed(1)}px, 0)`;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  function closeMenu() {
    nav.classList.remove("open"); header.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false"); menuToggle.setAttribute("aria-label", "Open menu");
    if (!openPanel) document.body.classList.remove("locked");
  }
  menuToggle.addEventListener("click", () => {
    const opening = !nav.classList.contains("open");
    if (opening) {
      nav.classList.add("open"); header.classList.add("open");
      menuToggle.setAttribute("aria-expanded", "true"); menuToggle.setAttribute("aria-label", "Close menu");
      document.body.classList.add("locked");
    } else closeMenu();
  });
  window.addEventListener("resize", () => { if (window.innerWidth > 960) closeMenu(); });

  /* ---------- 8. SMOOTH SCROLL + FILTER LINKS ---------- */
  document.addEventListener("click", e => {
    const filterLink = e.target.closest("[data-filter-link]");
    if (filterLink) setFilter(filterLink.dataset.filterLink);
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute("href");
    if (href.length > 1) {
      const target = document.getElementById(href.slice(1));
      if (target) {
        e.preventDefault(); closeMenu();
        // shop-filter links should land on the shop grid even if they sit inside another section
        const dest = filterLink && filterLink.dataset.filterLink !== "All" || (filterLink && a.closest(".nav")) ? $("#shop") : target;
        dest.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    } else e.preventDefault();
  });

  /* ---------- 9. PRODUCTS ---------- */
  const grid = $("#productGrid"), status = $("#shopStatus");
  const heartSVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21S3 15 3 9a5 5 0 019-3 5 5 0 019 3c0 6-9 12-9 12z"/></svg>';

  function productCard(p) {
    const wished = wishlist.includes(p.id);
    return `<article class="product-card" data-id="${p.id}">
      <button class="wish ${wished ? "active" : ""}" data-wish="${p.id}" aria-pressed="${wished}" aria-label="${wished ? "Remove" : "Add"} ${esc(p.name)} ${wished ? "from" : "to"} wishlist">${heartSVG}</button>
      <div class="img-wrap" data-view="${p.id}"><img alt="${esc(p.name)}, ${esc(p.cat)} outfit by Pehnawa Pret" loading="lazy" data-src="${esc(p.img)}"></div>
      <p class="p-cat">${esc(p.cat)}</p>
      <h3 class="p-name">${esc(p.name)}</h3>
      <p class="p-price">${fmt(p.price)}</p>
      <div class="p-actions">
        <button class="btn btn-outline" data-view="${p.id}">VIEW DETAILS</button>
        <button class="btn btn-burgundy" data-add="${p.id}">ADD TO BAG</button>
      </div>
    </article>`;
  }

  function renderProducts() {
    const list = PRODUCTS.filter(p => activeFilter === "All" || p.cat === activeFilter);
    grid.innerHTML = list.map(productCard).join("");
    $$("img[data-src]", grid).forEach(img => bindImage(img, img.dataset.src));
    $$(".product-card", grid).forEach((c, i) => { c.style.animationDelay = (i * 60) + "ms"; });
    status.textContent = list.length ? "" : "No pieces in this category yet.";
  }
  function setFilter(cat) {
    activeFilter = cat;
    $$(".filter").forEach(b => { const on = b.dataset.filter === cat; b.classList.toggle("active", on); b.setAttribute("aria-pressed", on); });
    renderProducts();
  }
  $("#filters").addEventListener("click", e => { const b = e.target.closest(".filter"); if (b) setFilter(b.dataset.filter); });

  grid.addEventListener("click", e => {
    const add = e.target.closest("[data-add]"), view = e.target.closest("[data-view]"), wish = e.target.closest("[data-wish]");
    if (add) addToBag(+add.dataset.add);
    else if (wish) toggleWish(+wish.dataset.wish);
    else if (view) openProduct(+view.dataset.view);
  });

  /* ---------- 10. WISHLIST ---------- */
  function toggleWish(id) {
    const i = wishlist.indexOf(id), p = byId(id);
    if (i > -1) { wishlist.splice(i, 1); toast(p.name + " removed from wishlist"); }
    else { wishlist.push(id); toast(p.name + " saved to wishlist"); }
    saveWish();
    $$(`[data-wish="${id}"]`).forEach(b => {
      const on = wishlist.includes(id);
      b.classList.toggle("active", on); b.setAttribute("aria-pressed", on);
      b.setAttribute("aria-label", `${on ? "Remove" : "Add"} ${p.name} ${on ? "from" : "to"} wishlist`);
    });
  }

  /* ---------- 11. SHOPPING BAG ---------- */
  const bagItems = $("#bagItems"), bagCount = $("#bagCount"), bagTotal = $("#bagTotal"), bagDrawer = $("#bagDrawer");
  function addToBag(id) {
    const line = bag.find(i => i.id === id), p = byId(id);
    if (line) { line.qty = Math.min(line.qty + 1, 10); toast(`${p.name} quantity updated to ${line.qty}`); }
    else { bag.push({ id, qty: 1 }); toast(p.name + " added to your bag"); }
    saveBag(); renderBag();
  }
  function changeQty(id, delta) {
    const line = bag.find(i => i.id === id); if (!line) return;
    line.qty = Math.min(line.qty + delta, 10);
    if (line.qty <= 0) bag = bag.filter(i => i.id !== id);
    saveBag(); renderBag();
  }
  function removeFromBag(id) { bag = bag.filter(i => i.id !== id); saveBag(); renderBag(); toast(byId(id).name + " removed from your bag"); }
  function renderBag() {
    const count = bag.reduce((s, i) => s + i.qty, 0);
    const total = bag.reduce((s, i) => s + byId(i.id).price * i.qty, 0);
    bagCount.textContent = count; bagTotal.textContent = fmt(total);
    $("#bagOpen").setAttribute("aria-label", `Open shopping bag, ${count} item${count === 1 ? "" : "s"}`);
    $("#checkoutBtn").disabled = !count;
    if (!bag.length) {
      bagItems.innerHTML = '<div class="empty"><p>Your bag is empty.</p><a href="#shop" class="btn btn-burgundy" data-close>BROWSE THE COLLECTION</a></div>';
      return;
    }
    bagItems.innerHTML = bag.map(i => {
      const p = byId(i.id);
      return `<div class="bag-line">
        <div class="img-wrap"><img alt="${esc(p.name)}" data-src="${esc(p.img)}"></div>
        <div><h4>${esc(p.name)}</h4><small>${esc(p.cat)}</small><small>${fmt(p.price)}</small>
          <div class="qty"><button data-dec="${p.id}" aria-label="Decrease quantity of ${esc(p.name)}">&minus;</button><span aria-live="polite">${i.qty}</span><button data-inc="${p.id}" aria-label="Increase quantity of ${esc(p.name)}">+</button></div></div>
        <div class="right"><strong>${fmt(p.price * i.qty)}</strong><br><button class="remove" data-remove="${p.id}" aria-label="Remove ${esc(p.name)} from bag">Remove</button></div>
      </div>`;
    }).join("");
    $$("img[data-src]", bagItems).forEach(img => bindImage(img, img.dataset.src));
  }
  bagItems.addEventListener("click", e => {
    const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]"), rm = e.target.closest("[data-remove]");
    if (inc) changeQty(+inc.dataset.inc, 1);
    else if (dec) changeQty(+dec.dataset.dec, -1);
    else if (rm) removeFromBag(+rm.dataset.remove);
  });
  $("#bagOpen").addEventListener("click", () => openLayer(bagDrawer));
  $("#checkoutBtn").addEventListener("click", () => toast("This is a demonstration. No payment or order is processed.", "err"));

  /* ---------- 12. PRODUCT MODAL ---------- */
  const productModal = $("#productModal"), modalContent = $("#modalContent");
  function openProduct(id) {
    const p = byId(id), wished = wishlist.includes(id);
    modalContent.innerHTML = `
      <div class="img-wrap"><img alt="${esc(p.name)}, ${esc(p.cat)} outfit" data-src="${esc(p.img)}"></div>
      <div class="modal-info">
        <p class="p-cat">${esc(p.cat)}</p>
        <h3 id="modalTitle">${esc(p.name)}</h3>
        <p class="p-price">${fmt(p.price)}</p>
        <p>${esc(p.desc)}</p>
        <ul>${p.details.map(d => `<li>${esc(d)}</li>`).join("")}</ul>
        <div class="btn-row">
          <button class="btn btn-burgundy" data-modal-add="${p.id}">ADD TO BAG</button>
          <button class="btn btn-outline" data-modal-wish="${p.id}" aria-pressed="${wished}">${wished ? "SAVED" : "SAVE TO WISHLIST"}</button>
        </div>
      </div>`;
    bindImage($("img", modalContent), p.img);
    openLayer(productModal);
  }
  modalContent.addEventListener("click", e => {
    const add = e.target.closest("[data-modal-add]"), wish = e.target.closest("[data-modal-wish]");
    if (add) addToBag(+add.dataset.modalAdd);
    if (wish) { const id = +wish.dataset.modalWish; toggleWish(id); const on = wishlist.includes(id); wish.textContent = on ? "SAVED" : "SAVE TO WISHLIST"; wish.setAttribute("aria-pressed", on); }
  });

  /* ---------- 13. SEARCH ---------- */
  const searchPanel = $("#searchPanel"), searchInput = $("#searchInput"), searchResults = $("#searchResults");
  $("#searchOpen").addEventListener("click", () => { openLayer(searchPanel); runSearch(); });
  function runSearch() {
    const q = searchInput.value.trim().toLowerCase();
    const list = PRODUCTS.filter(p => !q || p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
    searchResults.innerHTML = list.length
      ? list.map(p => `<li><button data-search-open="${p.id}"><span class="img-wrap"><img alt="" data-src="${esc(p.img)}"></span><span><strong>${esc(p.name)}</strong><small>${esc(p.cat)}</small></span><span>${fmt(p.price)}</span></button></li>`).join("")
      : `<li class="search-none">No pieces match "${esc(searchInput.value.trim())}". Try a name like Zareen, or a category like Bridal.</li>`;
    $$("img[data-src]", searchResults).forEach(img => bindImage(img, img.dataset.src));
  }
  searchInput.addEventListener("input", runSearch);
  searchResults.addEventListener("click", e => {
    const b = e.target.closest("[data-search-open]"); if (!b) return;
    const id = +b.dataset.searchOpen; closeLayer(true); openProduct(id);
  });

  /* ---------- 14. TESTIMONIALS ---------- */
  const slides = $$(".testi-slide"), counter = $("#testiCount");
  let current = 0, timer;
  function showSlide(n) {
    current = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle("active", i === current));
    counter.textContent = `${current + 1} / ${slides.length}`;
  }
  function restartTimer() { clearInterval(timer); if (!reduceMotion) timer = setInterval(() => showSlide(current + 1), 8000); }
  $("#testiPrev").addEventListener("click", () => { showSlide(current - 1); restartTimer(); });
  $("#testiNext").addEventListener("click", () => { showSlide(current + 1); restartTimer(); });
  restartTimer();

  /* ---------- 15. NEWSLETTER (frontend demo only) ---------- */
  const form = $("#newsletterForm"), emailInput = $("#newsEmail"), msg = $("#newsMsg");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const value = emailInput.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    msg.className = "form-msg";
    if (!valid) {
      emailInput.setAttribute("aria-invalid", "true");
      msg.textContent = "Please enter a valid email address, for example name@example.com.";
      msg.classList.add("err"); emailInput.focus(); return;
    }
    emailInput.removeAttribute("aria-invalid");
    msg.textContent = "Email looks valid. This is a demonstration form, so nothing has been saved or sent.";
    msg.classList.add("ok"); toast("Demo only: no subscription was created."); form.reset();
  });
  emailInput.addEventListener("input", () => emailInput.removeAttribute("aria-invalid"));

  /* ---------- 16. FOOTER LINKS ---------- */
  $("#year").textContent = new Date().getFullYear();
  const followBtn = $("#followBtn");
  if (SOCIAL.instagram) followBtn.href = SOCIAL.instagram;
  $$("[data-social]").forEach(a => { if (SOCIAL[a.dataset.social]) a.href = SOCIAL[a.dataset.social]; });
  document.addEventListener("click", e => {
    const s = e.target.closest("[data-social], #followBtn");
    if (s) {
      const key = s.id === "followBtn" ? "instagram" : s.dataset.social;
      if (!SOCIAL[key]) { e.preventDefault(); toast(`Add your ${key} profile link in script.js to activate this button.`); }
    }
    const info = e.target.closest("[data-info]");
    if (info) { e.preventDefault(); $("#infoTitle").textContent = info.dataset.info; openLayer($("#infoModal")); }
  });

  /* ---------- 17. SCROLL REVEAL ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + "ms"; io.observe(el); });
  } else revealEls.forEach(el => el.classList.add("in"));

  /* ---------- INIT ---------- */
  renderProducts();
  renderBag();
})();