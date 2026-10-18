/* ==========================================================================
   David Agus Kuncoro — portfolio interactions
   Vanilla JS. No dependencies.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Nav: stuck state + active section ---------- */
  function initNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;

    function onScroll() {
      if (window.scrollY > 24) nav.classList.add("is-stuck");
      else nav.classList.remove("is-stuck");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var links = Array.prototype.slice.call(document.querySelectorAll(".nav__links a"));
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      if (el) map[id] = { link: a, el: el };
    });
    var ids = Object.keys(map);
    if (!ids.length) return;

    // Cheap enough to compute directly on every scroll: five sections,
    // five getBoundingClientRect calls. Wrapping this in rAF breaks in
    // throttled/background tabs where the frame callback never fires,
    // leaving the highlight frozen.
    function setActive() {
      var line = window.scrollY + window.innerHeight * 0.42;
      var current = ids[0];
      for (var i = 0; i < ids.length; i++) {
        var rec = map[ids[i]];
        var top = rec.el.getBoundingClientRect().top + window.scrollY;
        if (top <= line) current = ids[i];
      }
      links.forEach(function (l) {
        l.classList.toggle("is-active", l === map[current].link);
      });
    }

    window.addEventListener("scroll", setActive, { passive: true });
    window.addEventListener("resize", setActive);
    window.addEventListener("hashchange", setActive);
    setActive();
  }

  /* ---------- Mobile sheet ---------- */
  function initSheet() {
    var burger = document.getElementById("navBurger");
    var sheet = document.getElementById("sheet");
    var close = document.getElementById("sheetClose");
    if (!burger || !sheet) return;

    function open() {
      sheet.classList.add("is-open");
      sheet.setAttribute("aria-hidden", "false");
      burger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    function hide() {
      sheet.classList.remove("is-open");
      sheet.setAttribute("aria-hidden", "true");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    burger.addEventListener("click", open);
    if (close) close.addEventListener("click", hide);
    sheet.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", hide);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") hide();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (i) { i.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach(function (i) { io.observe(i); });
  }

  /* ---------- YouTube: click-to-load facade (no iframe until asked) ---------- */
  function initVideos() {
    document.querySelectorAll(".video__facade").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.dataset.video;
        if (!id) return;
        var frame = document.createElement("iframe");
        frame.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
        frame.title = btn.getAttribute("aria-label") || "Video";
        frame.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        frame.allowFullscreen = true;
        frame.loading = "lazy";
        btn.replaceWith(frame);
      });
    });
  }

  /* ---------- Cursor glow (fine pointers only) ---------- */
  function initCursor() {
    var glow = document.getElementById("cursorGlow");
    if (!glow) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function loop() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      glow.style.transform = "translate3d(" + cx + "px," + cy + "px,0) translate(-50%,-50%)";
      raf = requestAnimationFrame(loop);
    }
    window.addEventListener(
      "pointermove",
      function (e) {
        tx = e.clientX;
        ty = e.clientY;
        if (!glow.classList.contains("is-on")) {
          glow.classList.add("is-on");
          cx = tx;
          cy = ty;
          if (!raf) loop();
        }
      },
      { passive: true }
    );
    document.addEventListener("mouseleave", function () {
      glow.classList.remove("is-on");
    });
  }

  /* ---------- Subtle parallax on hero photo ---------- */
  function initParallax() {
    var bg = document.querySelector(".hero__bg");
    if (!bg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = window.scrollY;
          if (y < window.innerHeight * 1.2) {
            bg.style.setProperty("--py", y * 0.16 + "px");
            bg.style.translate = "0 " + y * 0.16 + "px";
          }
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* ---------- Boot ---------- */
  function boot() {
    initNav();
    initSheet();
    initReveal();
    initVideos();
    initCursor();
    initParallax();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
