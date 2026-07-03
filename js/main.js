/* Galeria AUVP — interações
   - tema claro/escuro (segue o sistema; alternável no header)
   - carrossel do hero com legenda dinâmica
   - parallax sutil em elementos [data-parallax]
   - reveal on scroll, barra de progresso
   - lightbox de obra com fluxo de aquisição
   - fallback para imagens indisponíveis                       */

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- tema claro / escuro ---------- */

  const root = document.documentElement;
  const systemLight = window.matchMedia("(prefers-color-scheme: light)");

  const setTheme = (theme, persist) => {
    root.dataset.theme = theme;
    if (persist) {
      try { localStorage.setItem("auvp-theme", theme); } catch (e) {}
    }
  };

  document.getElementById("themeToggle").addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
  });

  // sem preferência salva, segue mudanças do sistema em tempo real
  systemLight.addEventListener("change", (e) => {
    let saved = null;
    try { saved = localStorage.getItem("auvp-theme"); } catch (err) {}
    if (!saved) setTheme(e.matches ? "light" : "dark", false);
  });

  /* ---------- carrossel do hero ---------- */

  const slides = Array.from(document.querySelectorAll(".hero__slide"));
  const heroCaption = document.getElementById("heroCaption");
  const heroCount = document.getElementById("heroCount");
  const AUTO_MS = 7000;
  let current = 0;
  let autoTimer = null;

  const renderSlide = (i) => {
    slides[current].classList.remove("is-active");
    current = (i + slides.length) % slides.length;
    slides[current].classList.add("is-active");

    const d = slides[current].dataset;
    heroCaption.innerHTML =
      `Em exibição — <em>${d.title}</em>, ${d.artist}, ${d.year}.<br />${d.tech}, ${d.dim}.`;
    heroCount.textContent =
      `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  };

  const restartAuto = () => {
    if (reducedMotion) return;
    clearInterval(autoTimer);
    autoTimer = setInterval(() => renderSlide(current + 1), AUTO_MS);
  };

  document.getElementById("heroPrev").addEventListener("click", () => {
    renderSlide(current - 1); restartAuto();
  });
  document.getElementById("heroNext").addEventListener("click", () => {
    renderSlide(current + 1); restartAuto();
  });
  restartAuto();

  /* ---------- parallax sutil ---------- */

  const parallaxEls = Array.from(document.querySelectorAll("[data-parallax]"));

  if (!reducedMotion && parallaxEls.length) {
    let ticking = false;

    const applyParallax = () => {
      const vh = window.innerHeight;
      for (const el of parallaxEls) {
        const box = (el.closest(".art__frame") || el.parentElement || el).getBoundingClientRect();
        if (box.bottom < -vh * 0.2 || box.top > vh * 1.2) continue;
        const speed = parseFloat(el.dataset.parallax) || 0.1;
        let offset = (box.top + box.height / 2 - vh / 2) * -speed;
        // imagens têm sangria limitada; o clamp evita que descolem da moldura
        const clamp = parseFloat(el.dataset.parallaxClamp);
        if (clamp) {
          const max = box.height * clamp;
          offset = Math.max(-max, Math.min(max, offset));
        }
        el.style.setProperty("--py", `${offset.toFixed(1)}px`);
      }
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(applyParallax); }
    }, { passive: true });
    applyParallax();
  }

  /* ---------- reveal on scroll ---------- */

  const revealer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          revealer.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealer.observe(el));

  /* ---------- header + progresso ---------- */

  const header = document.querySelector(".site-header");
  const progressBar = document.getElementById("progressBar");

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = max > 0 ? `${(y / max) * 100}%` : "0%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- fallback de imagem ----------
     Se alguma URL do Wikimedia falhar, o frame vira um
     placeholder identificado em vez de um ícone quebrado. */

  document.querySelectorAll(".art__frame img, .hero__slide img").forEach((img) => {
    const markBroken = () => {
      const frame = img.closest(".art__frame");
      if (!frame) { img.style.visibility = "hidden"; return; }
      const art = frame.closest(".art");
      frame.dataset.label = art?.dataset.title || "obra";
      frame.classList.add("is-broken");
      img.remove();
    };
    img.addEventListener("error", markBroken);
    // cobre imagens que falharam antes do listener ser registrado
    if (img.complete && img.naturalWidth === 0) markBroken();
  });

  /* ---------- lightbox ---------- */

  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbNum = document.getElementById("lbNum");
  const lbTitle = document.getElementById("lbTitle");
  const lbArtist = document.getElementById("lbArtist");
  const lbTech = document.getElementById("lbTech");
  const lbDim = document.getElementById("lbDim");
  const lbPrice = document.getElementById("lbPrice");
  const lbBuy = document.getElementById("lbBuy");
  const lbConfirm = document.getElementById("lbConfirm");
  const lbClose = document.getElementById("lbClose");

  let lastFocus = null;

  const openLightbox = (art) => {
    const d = art.dataset;
    lbImg.src = d.img;
    lbImg.alt = `${d.title}, de ${d.artist}`;
    lbNum.textContent = `Obra ${d.num}`;
    lbTitle.textContent = d.title;
    lbArtist.textContent = `${d.artist}, ${d.year}`;
    lbTech.textContent = d.tech;
    lbDim.textContent = d.dim;
    lbPrice.textContent = d.price;
    lbConfirm.hidden = true;
    lbBuy.hidden = false;

    lastFocus = art;
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    lbClose.focus();
  };

  const closeLightbox = () => {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    lbImg.src = "";
    lastFocus?.focus();
  };

  document.querySelectorAll(".art").forEach((art) => {
    art.addEventListener("click", () => openLightbox(art));
    art.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(art);
      }
    });
  });

  lbClose.addEventListener("click", closeLightbox);
  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lb.classList.contains("open")) closeLightbox();
  });

  /* ---------- aquisição (concierge, sem checkout) ---------- */

  lbBuy.addEventListener("click", () => {
    lbBuy.hidden = true;
    lbConfirm.hidden = false;
  });
})();
