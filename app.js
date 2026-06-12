/* ============================================================
   DARREN NG - INTERACTIVE CV
   Motion engine: preloader, smooth scroll, split-text reveals,
   custom cursor, marquee skew, branched slider, flip cards,
   light/dark mode wipe.
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE_POINTER = window.matchMedia("(pointer: fine)").matches;

/* ---------- SMOOTH SCROLL (Lenis) ---------- */
let lenis = null;
if (window.Lenis && !REDUCED) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
function scrollToTop(immediate) {
  if (lenis) lenis.scrollTo(0, { immediate: !!immediate });
  else window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
}

/* ---------- SPLIT TEXT ---------- */
function splitText(el) {
  if (el.dataset.splitDone) return el.querySelectorAll(".c");
  const walk = (node) => {
    if (node.nodeType === 3) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(" "));
          return;
        }
        const w = document.createElement("span");
        w.className = "w";
        [...part].forEach((ch) => {
          const c = document.createElement("span");
          c.className = "c";
          c.textContent = ch;
          w.appendChild(c);
        });
        frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === 1 && node.tagName !== "BR") {
      [...node.childNodes].forEach(walk);
    }
  };
  [...el.childNodes].forEach(walk);
  el.dataset.splitDone = "1";
  return el.querySelectorAll(".c");
}

document
  .querySelectorAll("[data-split], [data-split-hero], [data-split-ah], .preloader__name")
  .forEach(splitText);

/* ---------- LOGO HYDRATION ---------- */
function hydrateLogo(el) {
  const src = el.dataset.src;
  const letter = el.dataset.letter || "?";
  const bg = el.dataset.bg || "#0a0a0a";
  const img = new Image();
  img.alt = "";
  img.onload = () => {
    while (el.firstChild) el.removeChild(el.firstChild);
    el.appendChild(img);
  };
  img.onerror = () => {
    el.classList.add("has-fallback");
    el.style.background = bg;
    el.textContent = letter;
  };
  img.src = src;
}
document.querySelectorAll(".card__logo[data-src]").forEach(hydrateLogo);

/* ---------- PRELOADER ---------- */
const preloader = document.querySelector(".preloader");

function finishLoad() {
  document.body.classList.remove("is-loading");
  if (preloader) preloader.remove();
  heroIntro();
  initScrollFX();
}

if (preloader && !REDUCED) {
  const nameChars = preloader.querySelectorAll(".c");
  const numEl = preloader.querySelector(".preloader__num");
  const barEl = preloader.querySelector(".preloader__bar span");
  const counter = { v: 0 };

  gsap.set(nameChars, { yPercent: 110 });

  const tl = gsap.timeline();
  tl.to(nameChars, {
    yPercent: 0,
    duration: 0.8,
    stagger: 0.035,
    ease: "power3.out",
    delay: 0.15,
  })
    .to(
      counter,
      {
        v: 100,
        duration: 1.3,
        ease: "power2.inOut",
        onUpdate: () => {
          const v = Math.round(counter.v);
          if (numEl) numEl.textContent = v;
          if (barEl) barEl.style.width = v + "%";
        },
      },
      0.2
    )
    .to(nameChars, {
      yPercent: -110,
      duration: 0.6,
      stagger: 0.02,
      ease: "power3.in",
    }, "-=0.25")
    .to(preloader, {
      yPercent: -100,
      duration: 0.85,
      ease: "expo.inOut",
      onComplete: finishLoad,
    }, "-=0.15");
} else {
  finishLoad();
}

/* ---------- HERO INTRO (work view) ---------- */
function heroIntro() {
  if (REDUCED) return;
  const title = document.querySelector("[data-split-hero]");
  const chars = title ? title.querySelectorAll(".c") : [];
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  if (chars.length) {
    gsap.set(chars, { yPercent: 110 });
    tl.to(chars, { yPercent: 0, duration: 1, stagger: 0.018 }, 0.05);
  }
  tl.from('[data-intro="eyebrow"]', { y: 20, opacity: 0, duration: 0.7 }, 0.1)
    .from('[data-intro="lede"]', { y: 26, opacity: 0, duration: 0.8 }, "-=.6")
    .from(".hero__metrics .metric", { y: 30, opacity: 0, duration: 0.7, stagger: 0.08 }, "-=.55")
    .from(".hero__skills", { x: 50, opacity: 0, duration: 0.9 }, "-=.9")
    .from(".hero__skills .skills__group", { y: 16, opacity: 0, duration: 0.5, stagger: 0.07 }, "-=.6")
    .from('[data-intro="scrollcue"]', { opacity: 0, duration: 0.6 }, "-=.2");
}

/* ---------- AFTERHOURS HERO INTRO (replayed on switch) ---------- */
function afterhoursIntro() {
  if (REDUCED) return;
  const title = document.querySelector("[data-split-ah]");
  if (!title) return;
  const chars = title.querySelectorAll(".c");
  gsap.set(chars, { yPercent: 110 });
  gsap.to(chars, { yPercent: 0, duration: 1, stagger: 0.02, ease: "power3.out", delay: 0.45 });
  gsap.fromTo(
    ".hero__lede--ah",
    { y: 26, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.85 }
  );
}

/* ---------- LAZY SCROLL FX (re-runs after each mode switch) ---------- */
function visible(el) {
  return el.offsetParent !== null;
}

function initScrollFX() {
  /* Generic reveals */
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    if (el.dataset.fxDone || !visible(el)) return;
    el.dataset.fxDone = "1";
    if (REDUCED) return;
    gsap.from(el, {
      y: 44,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  /* Section rules draw in */
  document.querySelectorAll("[data-rule]").forEach((el) => {
    if (el.dataset.fxDone || !visible(el)) return;
    el.dataset.fxDone = "1";
    if (REDUCED) { el.style.transform = "scaleX(1)"; return; }
    gsap.to(el, {
      scaleX: 1,
      duration: 1.1,
      ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  /* Split headings rise per character */
  document.querySelectorAll("[data-split]").forEach((el) => {
    if (el.dataset.fxDone || !visible(el)) return;
    el.dataset.fxDone = "1";
    if (REDUCED) return;
    const chars = el.querySelectorAll(".c");
    gsap.set(chars, { yPercent: 110 });
    gsap.to(chars, {
      yPercent: 0,
      duration: 0.9,
      stagger: 0.012,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%", once: true },
    });
  });

  /* Hero metric count-ups */
  document.querySelectorAll(".metric__num").forEach((el) => {
    if (el.dataset.fxDone || !visible(el)) return;
    el.dataset.fxDone = "1";
    const match = el.textContent.match(/^([\$\+]?)([\d.]+)(\D*)$/);
    if (!match || REDUCED) return;
    const [, prefix, num, suffix] = match;
    const target = parseFloat(num);
    const isFloat = num.includes(".");
    const counter = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 95%",
      once: true,
      onEnter: () =>
        gsap.to(counter, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => {
            const v = isFloat ? counter.v.toFixed(1) : Math.round(counter.v);
            el.textContent = `${prefix}${v}${suffix}`;
          },
        }),
    });
  });

  /* Timeline stat count-ups */
  document.querySelectorAll(".s-num").forEach((el) => {
    if (el.dataset.fxDone || !visible(el)) return;
    el.dataset.fxDone = "1";
    const m = el.textContent.match(/^([\d.]+)(\D*)$/);
    if (!m || REDUCED) return;
    const target = parseFloat(m[1]);
    const suffix = m[2];
    const c = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 92%",
      once: true,
      onEnter: () =>
        gsap.to(c, {
          v: target,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => (el.textContent = Math.round(c.v) + suffix),
        }),
    });
  });

  /* Timeline items slide in from their side */
  document.querySelectorAll(".t-item").forEach((item) => {
    if (item.dataset.fxDone || !visible(item)) return;
    item.dataset.fxDone = "1";
    if (REDUCED) return;
    const side = item.dataset.side;
    gsap.from(item.querySelector(".t-card"), {
      x: side === "left" ? -64 : 64,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: item, start: "top 82%", once: true },
    });
    gsap.from(item.querySelector(".t-dot"), {
      scale: 0,
      duration: 0.6,
      delay: 0.2,
      ease: "back.out(2)",
      scrollTrigger: { trigger: item, start: "top 82%", once: true },
    });
  });

  /* Branch merge trunk draws on scroll */
  const mergePath = document.querySelector(".rail-merge");
  if (mergePath && !mergePath.dataset.fxDone && visible(mergePath.closest(".branch-stage"))) {
    mergePath.dataset.fxDone = "1";
    if (!REDUCED) {
      const len = mergePath.getTotalLength();
      mergePath.style.strokeDasharray = len;
      mergePath.style.strokeDashoffset = len;
      ScrollTrigger.create({
        trigger: ".branch-stage",
        start: "top 60%",
        end: "bottom 60%",
        scrub: true,
        onUpdate: (self) => {
          mergePath.style.strokeDashoffset = len * (1 - self.progress);
        },
      });
    }
  }

  /* Timeline rail grows */
  const tLine = document.querySelector(".timeline__line");
  if (tLine && !tLine.dataset.fxDone && visible(tLine.parentElement)) {
    tLine.dataset.fxDone = "1";
    if (REDUCED) {
      tLine.style.height = "100%";
    } else {
      ScrollTrigger.create({
        trigger: ".timeline",
        start: "top 60%",
        end: "bottom 80%",
        scrub: true,
        onUpdate: (self) => {
          tLine.style.height = `${self.progress * 100}%`;
        },
      });
    }
  }
}

/* ---------- MARQUEE VELOCITY SKEW ---------- */
if (!REDUCED) {
  /* Skew the band containers, not the tracks - the tracks' transform is
     owned by the CSS marquee keyframes and would override inline skew. */
  const skewTargets = gsap.utils.toArray(".marquee-band, .foot__name-band");
  if (skewTargets.length) {
    const proxy = { skew: 0 };
    const clampSkew = gsap.utils.clamp(-7, 7);
    const setSkew = gsap.quickSetter(skewTargets, "skewX", "deg");
    ScrollTrigger.create({
      onUpdate: (self) => {
        const s = clampSkew(self.getVelocity() / -260);
        if (Math.abs(s) > Math.abs(proxy.skew)) {
          proxy.skew = s;
          gsap.to(proxy, {
            skew: 0,
            duration: 0.7,
            ease: "power3",
            overwrite: true,
            onUpdate: () => setSkew(proxy.skew),
          });
        }
      },
    });
  }
}

/* ---------- CUSTOM CURSOR ---------- */
if (FINE_POINTER && !REDUCED) {
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  const label = document.querySelector(".cursor-label");
  if (dot && ring) {
    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.34, ease: "power2.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.34, ease: "power2.out" });
    window.addEventListener("pointermove", (e) => {
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
    });
    const HOVER = "a, button, .flip-toggle, .skills__group, .exploring__list li, .edu__certs a";
    document.addEventListener("mouseover", (e) => {
      const labelled = e.target.closest("[data-cursor]");
      if (labelled) {
        ring.classList.add("has-label");
        if (label) label.textContent = labelled.dataset.cursor;
        return;
      }
      if (e.target.closest(HOVER)) ring.classList.add("is-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("[data-cursor]")) ring.classList.remove("has-label");
      if (e.target.closest(HOVER)) ring.classList.remove("is-hover");
    });
  }
}

/* ---------- MAGNETIC ELEMENTS ---------- */
if (FINE_POINTER && !REDUCED) {
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.35);
      yTo((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
  });
}

/* ---------- GLARE (cursor-tracked highlight) ---------- */
if (FINE_POINTER) {
  document.addEventListener("pointermove", (e) => {
    const g = e.target.closest(".glare");
    if (!g) return;
    const r = g.getBoundingClientRect();
    g.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    g.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  });
}

/* ---------- TILT ---------- */
function attachTilt(el, max = 4) {
  el.classList.add("tilt");
  el.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    if (el.classList.contains("flipped") || el.classList.contains("dragging")) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.classList.add("is-tilting");
    el.style.transform = `perspective(1100px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateY(-3px)`;
  });
  el.addEventListener("pointerleave", () => {
    el.classList.remove("is-tilting");
    el.style.transform = "";
  });
}
if (FINE_POINTER && !REDUCED) {
  document.querySelectorAll(".passion, .edu").forEach((el) => attachTilt(el, 4));
}

/* ---------- MODE TOGGLE (9-6 work / 6-9 afterhours) ---------- */
const modeToggle = document.querySelector(".mode-toggle");
const modeBtns = document.querySelectorAll(".mode-toggle__btn");

function applyMode(mode) {
  document.body.dataset.mode = mode;
  if (modeToggle) modeToggle.dataset.mode = mode;
  modeBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.mode === mode));
  scrollToTop(true);
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    initScrollFX();
    if (mode === "afterhours") afterhoursIntro();
  });
}

function setMode(mode, originEvent) {
  if (mode === document.body.dataset.mode) return;
  if (REDUCED || !originEvent) {
    applyMode(mode);
    return;
  }
  const btn =
    originEvent.currentTarget ||
    document.querySelector(`.mode-toggle__btn[data-mode="${mode}"]`);
  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const r = Math.hypot(
    Math.max(cx, window.innerWidth - cx),
    Math.max(cy, window.innerHeight - cy)
  );

  const overlay = document.createElement("div");
  overlay.className = "mode-wipe";
  overlay.style.background = mode === "afterhours" ? "#0b0d13" : "#f4efe3";
  overlay.style.clipPath = `circle(0px at ${cx}px ${cy}px)`;
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add("is-expanding");
    overlay.style.clipPath = `circle(${r}px at ${cx}px ${cy}px)`;
  });

  setTimeout(() => applyMode(mode), 380);
  setTimeout(() => {
    overlay.style.transition = "opacity .45s ease";
    overlay.style.opacity = "0";
  }, 820);
  setTimeout(() => overlay.remove(), 1320);
}

modeBtns.forEach((b) =>
  b.addEventListener("click", (e) => setMode(b.dataset.mode, e))
);
document.body.dataset.mode = document.body.dataset.mode || "work";

/* ---------- SCROLL PROGRESS ---------- */
const sp = document.querySelector(".scroll-progress");
function updateScrollProgress() {
  if (!sp) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
  sp.style.width = pct + "%";
}
window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

/* ---------- FLIP CARDS ---------- */
document.querySelectorAll(".flip-toggle").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const flippable = btn.closest(".flippable");
    if (flippable) flippable.classList.toggle("flipped");
  });
});

document.querySelectorAll(".t-card.flippable").forEach((card) => {
  card.addEventListener("click", (e) => {
    if (e.target.closest(".flip-toggle") || e.target.closest("a")) return;
    card.classList.toggle("flipped");
  });
});

/* ---------- BRANCHED TIMELINE - STACK INTERACTION ---------- */
const stage = document.querySelector(".branch-stage");
const stack = document.getElementById("cardStack");
const cards = stack ? stack.querySelectorAll(".role-card") : [];
let active = 0;

function setActive(i) {
  active = i;
  if (stage) stage.dataset.active = String(i);
  cards.forEach((c, ci) => {
    c.classList.toggle("is-back", ci !== i);
    c.style.zIndex = ci === i ? 2 : 1;
    if (ci !== i) c.classList.remove("flipped");
  });
}

if (cards.length) {
  setActive(0);

  cards.forEach((c, ci) => {
    c.addEventListener("click", (e) => {
      if (e.target.closest(".flip-toggle")) return;
      if (c.classList.contains("is-back") && !c.classList.contains("dragging")) {
        setActive(ci);
      }
    });
  });

  let startX = 0, dragging = false, currentCard = null;
  stack.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".flip-toggle")) return;
    const target = e.target.closest(".role-card");
    if (!target || target.classList.contains("is-back")) return;
    if (target.classList.contains("flipped")) return;
    dragging = true;
    currentCard = target;
    startX = e.clientX;
    target.classList.add("dragging");
    target.setPointerCapture(e.pointerId);
  });
  stack.addEventListener("pointermove", (e) => {
    if (!dragging || !currentCard) return;
    const dx = e.clientX - startX;
    currentCard.style.transform = `translate(${dx}px, 0) rotate(${dx * 0.04}deg)`;
  });
  const endDrag = (e) => {
    if (!dragging || !currentCard) return;
    const dx = (e.clientX || 0) - startX;
    currentCard.classList.remove("dragging");
    currentCard.style.transform = "";
    if (Math.abs(dx) > 90) setActive((active + 1) % cards.length);
    dragging = false;
    currentCard = null;
  };
  stack.addEventListener("pointerup", endDrag);
  stack.addEventListener("pointercancel", endDrag);
  stack.addEventListener("pointerleave", endDrag);
}

/* ---------- NAV ANCHORS ---------- */
document.querySelectorAll('.nav__links a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: -72 });
    else window.scrollTo({ top: el.offsetTop - 72, behavior: "smooth" });
  });
});

/* ---------- SETTLE ---------- */
window.addEventListener("load", () => ScrollTrigger.refresh());
