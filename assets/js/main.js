/* Kollektiv Kinem — motion, glitter & manners */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- mobile nav ---------- */
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.textContent = open ? "Schließen" : "Menü";
      toggle.setAttribute("aria-expanded", open);
    });
  }

  /* ---------- curtain (loader + page transitions) ---------- */
  const curtain = document.querySelector(".curtain");
  let introDelay = 0;
  if (curtain && hasGsap) {
    curtain.style.animation = "none";
    const firstVisit = !sessionStorageGet("kinem-seen");
    sessionStorageSet("kinem-seen", "1");
    introDelay = firstVisit ? 1.1 : 0.35;
    gsap.to(curtain, {
      yPercent: -101, duration: 1, ease: "expo.inOut", delay: introDelay - 0.35,
      onComplete: () => (curtain.style.visibility = "hidden"),
    });

    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      const samePage = url.pathname === location.pathname && url.hash;
      if (url.origin !== location.origin || samePage || a.hasAttribute("download") || url.protocol === "mailto:") return;
      e.preventDefault();
      curtain.style.visibility = "visible";
      gsap.fromTo(curtain, { yPercent: 101 }, {
        yPercent: 0, duration: 0.7, ease: "expo.inOut",
        onComplete: () => (location.href = a.href),
      });
    });

    // coming back via the browser's back button restores the old (covered) state
    addEventListener("pageshow", (e) => {
      if (e.persisted) { gsap.set(curtain, { yPercent: -101 }); curtain.style.visibility = "hidden"; }
    });
  }

  function sessionStorageGet(k) { try { return sessionStorage.getItem(k); } catch { return null; } }
  function sessionStorageSet(k, v) { try { sessionStorage.setItem(k, v); } catch {} }

  /* ---------- glitter cursor ---------- */
  if (finePointer) initCursor();

  function initCursor() {
    root.classList.add("has-cursor");
    const dot = el("div", "cursor");
    const ring = el("div", "cursor-ring");
    const label = document.createElement("span");
    ring.appendChild(label);
    const canvas = el("canvas", "cursor-canvas");
    document.body.append(canvas, ring, dot);
    const ctx = canvas.getContext("2d");
    const colors = ["#f8c8d8", "#f2a7c0", "#ffe3ec", "#ffffff", "#ffd6a5"];
    let w, h, dpr;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.width = innerWidth * dpr; h = canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + "px"; canvas.style.height = innerHeight + "px";
    };
    resize(); addEventListener("resize", resize);

    const m = { x: innerWidth / 2, y: innerHeight / 2 }, r = { ...m };
    let last = { ...m }, parts = [];

    const spawn = (x, y, burst) => {
      if (reduce) return;
      parts.push({
        x, y,
        vx: burst ? rand(-4, 4) : rand(-0.8, 0.8),
        vy: burst ? rand(-5, 1.5) : rand(-1.6, 0.2),
        life: 1, decay: rand(0.012, 0.024),
        size: burst ? rand(6, 13) : rand(4, 9),
        rot: rand(-0.6, 0.6), spin: rand(-0.06, 0.06),
        kind: Math.random() < 0.45 ? "heart" : Math.random() < 0.7 ? "spark" : "dot",
        color: colors[(Math.random() * colors.length) | 0],
      });
      if (parts.length > 220) parts.shift();
    };

    addEventListener("mousemove", (e) => {
      m.x = e.clientX; m.y = e.clientY;
      const dist = Math.hypot(m.x - last.x, m.y - last.y);
      if (dist > 16) { spawn(m.x, m.y); last = { ...m }; }
    });
    addEventListener("mousedown", (e) => { for (let i = 0; i < 22; i++) spawn(e.clientX, e.clientY, true); });
    document.addEventListener("mouseleave", () => (dot.style.opacity = ring.style.opacity = 0));
    document.addEventListener("mouseenter", () => (dot.style.opacity = ring.style.opacity = ""));

    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("a, button, [data-cursor]");
      ring.classList.toggle("is-hover", !!t);
      const txt = t && t.dataset.cursor;
      ring.classList.toggle("has-label", !!txt);
      dot.classList.toggle("is-hidden", !!txt); // the dot would sit on top of the label
      if (txt) label.textContent = txt;
    });

    const heart = (s) => {
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(0, 0, -s * 0.5, -s * 0.15, -s * 0.5, s * 0.15);
      ctx.bezierCurveTo(-s * 0.5, s * 0.5, 0, s * 0.65, 0, s * 0.9);
      ctx.bezierCurveTo(0, s * 0.65, s * 0.5, s * 0.5, s * 0.5, s * 0.15);
      ctx.bezierCurveTo(s * 0.5, -s * 0.15, 0, 0, 0, s * 0.3);
      ctx.fill();
    };
    const spark = (s) => {
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
        ctx.lineTo(Math.cos(a + Math.PI / 4) * s * 0.22, Math.sin(a + Math.PI / 4) * s * 0.22);
      }
      ctx.closePath(); ctx.fill();
    };

    (function tick() {
      r.x += (m.x - r.x) * 0.18; r.y += (m.y - r.y) * 0.18;
      dot.style.transform = `translate(${m.x}px, ${m.y}px)`;
      ring.style.transform = `translate(${r.x}px, ${r.y}px)`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.045; p.vx *= 0.985;
        p.rot += p.spin; p.life -= p.decay;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        ctx.setTransform(dpr, 0, 0, dpr, p.x * dpr, p.y * dpr);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.min(1, p.life * 1.4);
        ctx.fillStyle = p.color;
        const s = p.size * (0.6 + p.life * 0.4);
        if (p.kind === "heart") heart(s);
        else if (p.kind === "spark") spark(s);
        else { ctx.beginPath(); ctx.arc(0, 0, s * 0.18, 0, 7); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    })();
  }

  function el(tag, cls) { const n = document.createElement(tag); n.className = cls; return n; }

  /* ---------- password gate (a privacy screen, not real security) ---------- */
  // The <head> of every page adds .locked unless the right hash is stored.
  const ACCESS_KEY = "kinem-access";
  const ACCESS_HASH = "6cd5776c";
  const fnv1a = (str) => {
    let h = 0x811c9dc5;
    for (const b of new TextEncoder().encode(str)) h = Math.imul(h ^ b, 0x01000193) >>> 0;
    return h.toString(16).padStart(8, "0");
  };

  if (root.classList.contains("locked")) initGate(startMotion);
  else startMotion();

  function initGate(onUnlock) {
    const logo = document.querySelector(".nav__logo img");
    const gate = el("div", "gate");
    gate.setAttribute("role", "dialog");
    gate.setAttribute("aria-modal", "true");
    gate.setAttribute("aria-labelledby", "gate-title");
    gate.innerHTML = `
      <img class="gate__logo" src="${logo ? logo.src : ""}" alt="">
      <h1 class="display gate__title" id="gate-title">Psst, <em>noch geheim</em></h1>
      <p class="gate__text">Diese Seite ist noch nicht öffentlich. Bitte gib das Passwort ein.</p>
      <form class="gate__form">
        <label class="gate__label" for="gate-pw">Passwort</label>
        <input id="gate-pw" type="password" autocomplete="current-password" placeholder="Passwort" required>
        <button class="btn btn--solid" type="submit">Eintreten <span class="arrow">→</span></button>
      </form>
      <p class="gate__error" aria-live="polite"></p>`;
    document.body.prepend(gate);
    const form = gate.querySelector("form");
    const input = gate.querySelector("input");
    const error = gate.querySelector(".gate__error");
    setTimeout(() => input.focus(), 50);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (fnv1a(input.value.trim().toLowerCase()) !== ACCESS_HASH) {
        error.textContent = "Leider falsch. Versuch's nochmal ♥";
        form.classList.remove("is-wrong");
        void form.offsetWidth; // restart the shake
        form.classList.add("is-wrong");
        input.select();
        return;
      }
      try { localStorage.setItem(ACCESS_KEY, ACCESS_HASH); } catch {}
      try { sessionStorage.setItem(ACCESS_KEY, ACCESS_HASH); } catch {}
      root.classList.remove("locked");
      gate.remove();
      onUnlock();
    });
  }

  /* ---------- everything below needs GSAP ---------- */
  function startMotion() {
    if (!hasGsap) return;
    gsap.registerPlugin(ScrollTrigger);

    /* smooth scroll */
    let lenis = null;
    if (window.Lenis && !reduce) {
      lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      document.querySelectorAll('a[href^="#"]').forEach((a) =>
        a.addEventListener("click", (e) => {
          const target = document.querySelector(a.getAttribute("href"));
          if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -40, duration: 1.6 }); }
          if (nav) { nav.classList.remove("is-open"); if (toggle) toggle.textContent = "Menü"; }
        })
      );
    }

    if (reduce) return;

    /* marquee that speeds up with scroll velocity */
    document.querySelectorAll(".marquee__track").forEach((track) => {
      track.innerHTML += track.innerHTML; // seamless loop
      const dir = track.closest(".marquee").dataset.dir === "right" ? 1 : -1;
      const tween = gsap.fromTo(track, { xPercent: dir < 0 ? 0 : -50 }, {
        xPercent: dir < 0 ? -50 : 0, duration: 28, ease: "none", repeat: -1,
      });
      if (lenis) lenis.on("scroll", ({ velocity }) => {
        gsap.to(tween, { timeScale: 1 + Math.min(Math.abs(velocity) * 0.25, 6), duration: 0.2, overwrite: true });
        gsap.to(tween, { timeScale: 1, duration: 1.2, delay: 0.2 });
      });
    });

    /* split headlines into characters that jump up */
    document.querySelectorAll("[data-split]").forEach((node) => {
      const walk = (n) => {
        [...n.childNodes].forEach((c) => {
          if (c.nodeType === 3) {
            const frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach((word) => {
              if (!word) return;
              if (/^\s+$/.test(word)) { frag.append(" "); return; }
              const wEl = el("span", "word");
              [...word].forEach((ch) => { const s = el("span", "char"); s.textContent = ch; wEl.append(s); });
              frag.append(wEl);
            });
            c.replaceWith(frag);
          } else if (c.nodeType === 1 && c.tagName !== "BR") walk(c);
        });
      };
      walk(node);
      const chars = node.querySelectorAll(".char");
      gsap.from(chars, {
        yPercent: 120, rotate: () => rand(-25, 25), opacity: 0,
        duration: 1.1, ease: "expo.out", stagger: 0.025,
        delay: node.closest(".hero, .sp-hero, .ph-hero") ? introDelay + 0.2 : 0,
        scrollTrigger: { trigger: node, start: "top 88%" },
      });
    });

    /* parallax layers: data-speed="-1 … 2" (higher = faster, negative = against the flow) */
    document.querySelectorAll("[data-speed]").forEach((n) => {
      const speed = parseFloat(n.dataset.speed);
      const host = n.closest("section, header, footer") || n.parentElement;
      gsap.fromTo(n, { y: () => speed * innerHeight * 0.25 }, {
        y: () => -speed * innerHeight * 0.25, ease: "none",
        scrollTrigger: { trigger: host, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
      });
    });

    /* rotating shapes on scroll */
    document.querySelectorAll("[data-turn]").forEach((n) => {
      gsap.to(n, {
        rotate: parseFloat(n.dataset.turn), ease: "none",
        scrollTrigger: { trigger: n.closest("section, header, footer") || n, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    /* stickers flying in from the sides */
    document.querySelectorAll("[data-fly]").forEach((n) => {
      const dir = n.dataset.fly;
      const sign = dir === "left" ? -1 : 1;
      const from = dir === "up"
        ? { y: 260, x: 0, rotation: rand(-30, 30), scale: 0.6 }
        : { x: sign * Math.min(Math.max(innerWidth * 0.65, 260), 900), y: rand(-60, 60), rotation: sign * rand(18, 40), scale: 0.9 };
      gsap.fromTo(n, { ...from, opacity: 0 }, {
        x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, ease: "power3.out",
        scrollTrigger: {
          trigger: n.dataset.flyTrigger ? n.closest(n.dataset.flyTrigger) : n,
          start: n.dataset.flyStart || "top 98%", end: n.dataset.flyEnd || "top 52%", scrub: 1.1,
        },
      });
    });

    /* big media: rounded window opens, picture settles */
    document.querySelectorAll("[data-reveal]").forEach((n) => {
      const media = n.querySelectorAll("img, video");
      const tl = gsap.timeline({ scrollTrigger: { trigger: n, start: "top bottom", end: "top 15%", scrub: 1 } });
      tl.fromTo(n, { clipPath: "inset(14% 9% 14% 9% round 60px)" }, { clipPath: "inset(0% 0% 0% 0% round 22px)", ease: "none" }, 0);
      if (media.length) tl.fromTo(media, { scale: 1.3 }, { scale: 1, ease: "none" }, 0);
    });

    /* show page: the hero collage flies in from everywhere */
    const flies = document.querySelectorAll(".collage__fly");
    if (flies.length) {
      gsap.from(flies, {
        x: () => rand(-1, 1) * innerWidth,
        y: () => (Math.random() < 0.5 ? -1 : 1) * rand(0.6, 1.2) * innerHeight,
        rotation: () => rand(-70, 70), scale: () => rand(0.2, 0.6), opacity: 0,
        duration: 1.7, ease: "expo.out", stagger: 0.11, delay: introDelay,
      });
      // ...and drifts apart as you scroll away
      document.querySelectorAll(".collage__item").forEach((item, i) => {
        gsap.to(item, {
          x: (i % 2 ? 1 : -1) * innerWidth * 0.18, rotate: (i % 2 ? 1 : -1) * 10, scale: 1.15, ease: "none",
          scrollTrigger: { trigger: ".sp-hero", start: "top top", end: "bottom top", scrub: true },
        });
      });
      gsap.to(".sp-hero__title", {
        scale: 0.82, opacity: 0.2, ease: "none",
        scrollTrigger: { trigger: ".sp-hero", start: "top top", end: "bottom top", scrub: true },
      });
    }

    /* show page: gallery pictures fly in, alternating sides, in 3D */
    document.querySelectorAll(".fly-gallery figure").forEach((fig, i) => {
      const sign = i % 2 ? 1 : -1;
      const frame = fig.querySelector(".frame");
      gsap.set(fig, { perspective: 1400 });
      gsap.fromTo(frame, {
        x: sign * innerWidth * 0.55, y: 180, rotation: sign * rand(12, 26), rotationY: sign * -35, scale: 0.55, opacity: 0,
      }, {
        x: 0, y: 0, rotation: 0, rotationY: 0, scale: 1, opacity: 1, ease: "power2.out",
        scrollTrigger: { trigger: fig, start: "top 105%", end: "top 30%", scrub: 1.2 },
      });
      const img = frame.querySelector("img");
      if (img) gsap.fromTo(img, { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true } });
    });

    /* home hero photos float in */
    const heroPhotos = document.querySelectorAll(".hero__photo");
    if (heroPhotos.length) {
      gsap.from(heroPhotos, {
        yPercent: () => rand(80, 160), rotation: () => rand(-40, 40), opacity: 0, scale: 0.6,
        duration: 1.8, ease: "expo.out", stagger: 0.15, delay: introDelay + 0.1,
      });
      gsap.from(".hero__logo", { scale: 0.4, rotation: -90, opacity: 0, duration: 2, ease: "expo.out", delay: introDelay });
    }

    /* gentle fades for everything else */
    document.querySelectorAll("[data-fade]").forEach((n) => {
      gsap.from(n, { y: 50, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: n, start: "top 90%" } });
    });

    /* videos only play while visible */
    document.querySelectorAll("video[data-autoplay]").forEach((v) => {
      ScrollTrigger.create({
        trigger: v, start: "top bottom", end: "bottom top",
        onToggle: (s) => (s.isActive ? v.play().catch(() => {}) : v.pause()),
      });
    });

    if (document.readyState === "complete") ScrollTrigger.refresh();
    else addEventListener("load", () => ScrollTrigger.refresh());
  }
})();
