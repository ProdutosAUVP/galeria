/* Galeria AUVP — interações
   - reveal on scroll
   - header + barra de progresso
   - lightbox de obra com fluxo de aquisição
   - fallback para imagens indisponíveis                       */

(() => {
  "use strict";

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

  document.querySelectorAll(".art__frame img, .hero__media img").forEach((img) => {
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
