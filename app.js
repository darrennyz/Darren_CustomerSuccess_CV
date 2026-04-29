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

/* ---------- COUNT-UP (hero metrics) ---------- */
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

/* ---------- BRANCHED TIMELINE SLIDER ---------- */
const stage = document.querySelector(".branch-stage");
const stack = document.getElementById("cardStack");
const cards = stack ? stack.querySelectorAll(".role-card") : [];
let active = 0;

function setActive(i) {
  active = i;
  stage.dataset.active = String(i);
  cards.forEach((c, ci) => {
    c.classList.toggle("is-back", ci !== i);
    // bring active card to top of stack
    c.style.zIndex = ci === i ? 2 : 1;
  });
}

if (cards.length) {
  // click on the back card to bring it forward
  cards.forEach((c, ci) => {
    c.addEventListener("click", (e) => {
      if (c.classList.contains("is-back") && !c.classList.contains("dragging")) {
        setActive(ci);
      }
    });
  });

  // drag the active card sideways to swap
  let startX = 0, dragging = false, currentCard = null;
  stack.addEventListener("pointerdown", (e) => {
    const target = e.target.closest(".role-card");
    if (!target || target.classList.contains("is-back")) return;
    dragging = true;
    currentCard = target;
    startX = e.clientX;
    target.classList.add("dragging");
    target.setPointerCapture(e.pointerId);
  });
  stack.addEventListener("pointermove", (e) => {
    if (!dragging || !currentCard) return;
    const dx = e.clientX - startX;
    const rot = dx * 0.04;
    currentCard.style.transform = `translate(${dx}px, 0) rotate(${rot}deg)`;
  });
  const endDrag = (e) => {
    if (!dragging || !currentCard) return;
    const dx = (e.clientX || 0) - startX;
    currentCard.classList.remove("dragging");
    currentCard.style.transform = "";
    if (Math.abs(dx) > 90) {
      // swap to the other card
      const next = (active + 1) % cards.length;
      setActive(next);
    }
    dragging = false;
    currentCard = null;
  };
  stack.addEventListener("pointerup", endDrag);
  stack.addEventListener("pointercancel", endDrag);
  stack.addEventListener("pointerleave", endDrag);
}

/* reveal concurrent on scroll */
gsap.from(".concurrent__header > *, .branch-stage", {
  scrollTrigger: { trigger: ".concurrent", start: "top 70%" },
  y: 40, opacity: 0, duration: 1, stagger: 0.12, ease: "power3.out",
});

/* animate the merged trunk drawing in as you scroll past */
const merge = document.querySelector(".rail-merge");
if (merge) {
  const len = merge.getTotalLength();
  merge.style.strokeDasharray = len;
  merge.style.strokeDashoffset = len;
  ScrollTrigger.create({
    trigger: ".branch-stage",
    start: "top 60%",
    end: "bottom 60%",
    scrub: true,
    onUpdate: (self) => {
      merge.style.strokeDashoffset = len * (1 - self.progress);
    },
  });
}

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

/* TOOLBELT — fromTo so chips are guaranteed visible at the end (no hidden state if trigger misfires) */
gsap.fromTo(
  ".tools__list span",
  { y: 14, opacity: 0 },
  {
    scrollTrigger: { trigger: ".tools", start: "top 85%", once: true },
    y: 0, opacity: 1, duration: 0.5, stagger: 0.02, ease: "power2.out",
  }
);

gsap.from(".foot__title, .foot__meta", {
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

/* refresh ScrollTrigger after fonts/layout settle */
window.addEventListener("load", () => ScrollTrigger.refresh());
