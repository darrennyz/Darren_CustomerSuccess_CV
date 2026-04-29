gsap.registerPlugin(ScrollTrigger);

/* ---------- HERO INTRO ---------- */
const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
heroTl
  .from(".hero__eyebrow", { y: 20, opacity: 0, duration: 0.7 })
  .from(".hero__title", { y: 50, opacity: 0, duration: 1.1 }, "-=.4")
  .from(".hero__lede", { y: 30, opacity: 0, duration: 0.9 }, "-=.6")
  .from(".metric", { y: 30, opacity: 0, duration: 0.7, stagger: 0.08 }, "-=.5")
  .from(".hero__skills", { x: 60, opacity: 0, duration: 1 }, "-=1")
  .from(".skills__group", { y: 16, opacity: 0, duration: 0.5, stagger: 0.06 }, "-=.6")
  .from(".hero__scroll", { opacity: 0, duration: 0.6 }, "-=.2");

/* ---------- COUNT-UP ---------- */
document.querySelectorAll(".metric__num").forEach((el) => {
  const txt = el.textContent;
  const match = txt.match(/^([\$\+]?)([\d.]+)(\D*)$/);
  if (!match) return;
  const [, prefix, num, suffix] = match;
  const target = parseFloat(num);
  const isFloat = num.includes(".");
  const counter = { v: 0 };
  ScrollTrigger.create({
    trigger: el,
    start: "top 90%",
    once: true,
    onEnter: () => {
      gsap.to(counter, {
        v: target,
        duration: 1.6,
        ease: "power2.out",
        onUpdate: () => {
          const v = isFloat ? counter.v.toFixed(1) : Math.round(counter.v);
          el.textContent = `${prefix}${v}${suffix}`;
        },
      });
    },
  });
});

/* ---------- INTRO REVEAL ---------- */
gsap.from(".intro .kicker, .intro__title, .intro__sub", {
  scrollTrigger: { trigger: ".intro", start: "top 75%" },
  y: 40, opacity: 0, duration: 1, stagger: 0.12, ease: "power3.out",
});

/* ---------- CONCURRENT SLIDER ---------- */
const track = document.querySelector(".slider__track");
const dots = document.querySelectorAll(".sc-dot");
const btns = document.querySelectorAll(".sc-btn");
const cards = document.querySelectorAll(".card");
let idx = 0;
const total = cards.length;

function go(i) {
  idx = (i + total) % total;
  track.style.transform = `translateX(-${idx * 100}%)`;
  dots.forEach((d, di) => d.classList.toggle("active", di === idx));
  cards.forEach((c, ci) => {
    gsap.to(c, { scale: ci === idx ? 1 : 0.97, opacity: ci === idx ? 1 : 0.5, duration: 0.6, ease: "power2.out" });
  });
}
btns.forEach((b) => b.addEventListener("click", () => go(idx + parseInt(b.dataset.dir))));
dots.forEach((d) => d.addEventListener("click", () => go(parseInt(d.dataset.i))));

// drag-to-slide
let startX = 0, dragging = false;
const vp = document.querySelector(".slider__viewport");
vp.addEventListener("pointerdown", (e) => { dragging = true; startX = e.clientX; });
vp.addEventListener("pointerup", (e) => {
  if (!dragging) return;
  const dx = e.clientX - startX;
  if (Math.abs(dx) > 60) go(idx + (dx < 0 ? 1 : -1));
  dragging = false;
});
vp.addEventListener("pointerleave", () => { dragging = false; });

// reveal slider on scroll
gsap.from(".concurrent__header, .slider", {
  scrollTrigger: { trigger: ".concurrent", start: "top 70%" },
  y: 50, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out",
});

/* ---------- MERGE ANIMATION ---------- */
gsap.fromTo(
  ".merge__l, .merge__r",
  { scaleY: 0, opacity: 0 },
  {
    scrollTrigger: { trigger: ".merge", start: "top 80%", end: "bottom 60%", scrub: true },
    scaleY: 1, opacity: 1, ease: "none",
  }
);
gsap.fromTo(
  ".merge__pulse",
  { scale: 0 },
  {
    scrollTrigger: { trigger: ".merge", start: "top 60%", end: "bottom 50%", scrub: true },
    scale: 1.4, ease: "none",
  }
);

/* ---------- TIMELINE LINE GROW ---------- */
ScrollTrigger.create({
  trigger: ".timeline",
  start: "top 60%",
  end: "bottom 80%",
  scrub: true,
  onUpdate: (self) => {
    const line = document.querySelector(".timeline__line");
    if (line) line.style.height = `${self.progress * 100}%`;
  },
});

/* ---------- TIMELINE ITEMS REVEAL ---------- */
document.querySelectorAll(".t-item").forEach((item) => {
  const side = item.dataset.side;
  gsap.from(item.querySelector(".t-card"), {
    scrollTrigger: { trigger: item, start: "top 80%" },
    x: side === "left" ? -60 : 60,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
  });
  gsap.from(item.querySelector(".t-dot"), {
    scrollTrigger: { trigger: item, start: "top 80%" },
    scale: 0,
    duration: 0.6,
    delay: 0.2,
    ease: "back.out(2)",
  });
});

/* count-up timeline stats */
document.querySelectorAll(".s-num").forEach((el) => {
  const m = el.textContent.match(/^([\d.]+)(\D*)$/);
  if (!m) return;
  const target = parseFloat(m[1]);
  const suffix = m[2];
  const c = { v: 0 };
  ScrollTrigger.create({
    trigger: el, start: "top 90%", once: true,
    onEnter: () =>
      gsap.to(c, {
        v: target, duration: 1.4, ease: "power2.out",
        onUpdate: () => (el.textContent = Math.round(c.v) + suffix),
      }),
  });
});

/* ---------- EDUCATION & FOOTER REVEAL ---------- */
gsap.from(".edu__head .kicker, .edu__head h2", {
  scrollTrigger: { trigger: ".education", start: "top 70%" },
  y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: "power3.out",
});
gsap.from(".edu", {
  scrollTrigger: { trigger: ".edu__grid", start: "top 80%" },
  y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out",
});
gsap.from(".tools__list span", {
  scrollTrigger: { trigger: ".tools", start: "top 80%" },
  y: 16, opacity: 0, duration: 0.4, stagger: 0.025, ease: "power2.out",
});
gsap.from(".foot__title, .foot__contacts, .foot__meta", {
  scrollTrigger: { trigger: ".foot", start: "top 75%" },
  y: 30, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out",
});

/* ---------- NAV smooth scroll ---------- */
document.querySelectorAll('.nav__links a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    window.scrollTo({ top: el.offsetTop - 60, behavior: "smooth" });
  });
});
