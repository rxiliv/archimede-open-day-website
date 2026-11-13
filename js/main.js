/* ==========================================================
   I.S. Archimede — Open Day · slideshow engine
   ========================================================== */
(() => {
  "use strict";

  const slides = [...document.querySelectorAll(".slide")];
  const dotsBox = document.getElementById("dots");
  const counter = document.getElementById("counter");
  const progress = document.getElementById("progressBar");
  const btnPrev = document.getElementById("prev");
  const btnNext = document.getElementById("next");

  let current = 0;
  let animating = false;

  /* ---------- gate · codice di accesso ---------- */
  const ACCESS_CODE = "archimede2627";
  const gate = document.getElementById("gate");
  const gateForm = document.getElementById("gateForm");
  const gateInput = document.getElementById("gateCode");
  const gateErr = document.getElementById("gateErr");

  if (sessionStorage.getItem("archimede-ok") !== "1") {
    gate.hidden = false;
    gateInput.focus();
    gateForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (gateInput.value.trim().toLowerCase() === ACCESS_CODE) {
        sessionStorage.setItem("archimede-ok", "1");
        gate.hidden = true;
      } else {
        gateErr.hidden = false;
        gateForm.classList.remove("shake");
        void gateForm.offsetWidth;
        gateForm.classList.add("shake");
        gateInput.select();
      }
    });
  }

  /* ---------- dots ---------- */
  slides.forEach((s, i) => {
    const b = document.createElement("button");
    b.title = s.dataset.title || `Slide ${i + 1}`;
    b.setAttribute("aria-label", b.title);
    b.addEventListener("click", () => go(i));
    dotsBox.appendChild(b);
  });
  const dots = [...dotsBox.children];

  /* ---------- navigazione ---------- */
  function go(n) {
    if (animating) return;
    const next = Math.max(0, Math.min(slides.length - 1, n));
    if (next === current && slides[current].classList.contains("active")) return;

    animating = true;
    slides[current].classList.remove("active");
    slides[next].classList.add("active");
    current = next;
    updateUI();
    history.replaceState(null, "", `#${current + 1}`);
    setTimeout(() => (animating = false), 950);
  }

  function updateUI() {
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
    counter.textContent = `${current + 1} / ${slides.length}`;
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    btnPrev.disabled = current === 0;
    btnNext.disabled = current === slides.length - 1;
    document.body.classList.toggle("on-light", !slides[current].classList.contains("dark"));
  }

  const next = () => go(current + 1);
  const prev = () => go(current - 1);

  btnNext.addEventListener("click", next);
  btnPrev.addEventListener("click", prev);

  document.addEventListener("keydown", (e) => {
    if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); next(); }
    else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(slides.length - 1);
    else if (e.key.toLowerCase() === "f") {
      document.fullscreenElement
        ? document.exitFullscreen()
        : document.documentElement.requestFullscreen().catch(() => {});
    }
  });

  /* rotellina (con debounce) */
  let wheelLock = false;
  document.addEventListener("wheel", (e) => {
    if (wheelLock || Math.abs(e.deltaY) < 20) return;
    wheelLock = true;
    e.deltaY > 0 ? next() : prev();
    setTimeout(() => (wheelLock = false), 1100);
  }, { passive: true });

  /* swipe touch */
  let touchX = null;
  document.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  document.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 60) (dx < 0 ? next() : prev());
    touchX = null;
  }, { passive: true });

  /* ---------- placeholder immagini ---------- */
  document.querySelectorAll(".ph").forEach((fig) => {
    const img = fig.querySelector("img");
    if (!img) { fig.classList.add("missing"); return; }
    const mark = () => fig.classList.add("missing");
    img.complete ? (img.naturalWidth === 0 && mark()) : img.addEventListener("error", mark);
  });

  /* ---------- terminale typing ---------- */
  function typewriter(el, lines) {
    if (!el) return;
    let li = 0, ci = 0, out = "";
    const cursor = '<span class="cursor"></span>';
    function tick() {
      const [cls, text] = lines[li];
      if (ci <= text.length) {
        el.innerHTML = out + `<span class="${cls}">${text.slice(0, ci)}</span>` + cursor;
        ci++;
        setTimeout(tick, 26 + Math.random() * 40);
      } else {
        out += `<span class="${cls}">${text}</span>\n`;
        li++; ci = 0;
        if (li >= lines.length) {
          setTimeout(() => { li = 0; out = ""; tick(); }, 6000);
          el.innerHTML = out + cursor;
          return;
        }
        setTimeout(tick, 420);
      }
    }
    tick();
  }

  typewriter(document.getElementById("term"), [
    ["p", "$ archimede --benvenuti"],
    ["o", "open day · indirizzo informatica"],
    ["p", "$ turno --programma"],
    ["o", "1 · panoramica sull'indirizzo"],
    ["o", "2 · i progetti degli studenti"],
    ["c", "# si comincia_"],
  ]);

  typewriter(document.getElementById("term2"), [
    ["p", "$ handoff studenti"],
    ["o", "progetti: caricati"],
    ["p", "$ ./progetti-dal-vivo"],
    ["c", "# la parola a chi il progresso lo scrive già_"],
  ]);

  /* ---------- init ---------- */
  const start = parseInt(location.hash.slice(1), 10);
  slides[0].classList.add("active");
  updateUI();
  if (!isNaN(start) && start > 1 && start <= slides.length) go(start - 1);
})();
