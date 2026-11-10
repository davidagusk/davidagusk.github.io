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

  /* ---------- Language switcher ---------- */
  function initLanguage() {
    var selects = Array.prototype.slice.call(document.querySelectorAll("#languageSelect, #languageSelectMobile"));
    var dropdowns = Array.prototype.slice.call(document.querySelectorAll(".lang-dropdown"));
    if (!selects.length && !dropdowns.length) return;

    var translations = {
      en: {
        nav: ["</Home>", "</Pricing>", "</AboutMe>", "</Skills>", "</Projects>", "</Videos>"],
        mobile: ["Home", "Pricing", "About", "Skills", "Projects", "Videos", "Contact"],
        status: "Available for work · 2026",
        role: "design & code for web",
        lede: "Freelance web developer from Indonesia with a background in digital concept art and frontend design. I build fast, accessible sites in React, Next.js and PHP — and I love fun web UI, collaboration, and making products.",
        view: "View projects",
        talk: "Let's Talk",
        pricing: "</Pricing>",
        pricingNote: "Clear scope, thoughtful design, and a website ready to grow.",
        value: "Time is valuable. Get your website built faster, without compromising on thoughtful design or quality.",
        aboutParagraphs: ["Hi! My name is David. I'm a <strong>Full Stack Web Developer</strong> and digital visual artist. I love crafting and building interactive experiences on the web. My passion for web development began when I started uploading my digital concept artworks and wanted a custom space to showcase them online.", "Instead of just creating an online gallery, I found myself fascinated by the process of developing and designing for the web. That curiosity led me deeper into coding, UI/UX, and the creative possibilities of interactive websites.", "These days, my main focus is designing fun, clean, and thoughtful web interfaces. I love coding from scratch and enjoy transforming ideas into functional, beautiful websites right in the browser."],
        projectDescriptions: ["Information website about dog service and contacts.", "Information website about Premium Travel & Villas in Bali.", "Information website about company and contacts."],
        pricingFoot: "Every package starts with a short discovery call. Hosting, domain, paid plugins, and copywriting are quoted separately when needed.", aboutNote: "<b>//</b> Full stack web developer<br /><b>//</b> digital visual artist<br /><b>//</b> building since 2019", projectsNote: "Three live sites — <b>service</b>,<br /><b>travel</b>, and <b>government</b>.",
        cardNames: ["Launch", "Momentum", "Signature", "Orbit"],
        cardDescs: ["A focused online presence for a personal brand or small business ready to launch.", "An online store with product browsing and ordering, without an integrated payment gateway.", "A complete online store with automatic payment processing built directly into the website.", "A fully customized commerce platform with payments, automation, integrations, and advanced business features."],
        cardFeatures: [["Ready in 2 weeks", "Custom visual direction", "Contact or inquiry section", "Basic on-page SEO setup", "1 year support for website errors and issues", "Launch-ready handoff"], ["Ready in 7–10 business days", "Online store and product catalog", "Shopping cart and order flow", "WhatsApp or manual payment confirmation", "Product and order management", "SEO structure and metadata"], ["Ready in 5–7 business days", "Complete online store and catalog", "Shopping cart and checkout flow", "Automatic payment gateway integration", "Order and payment status management", "Performance and technical SEO", "1 year support for website errors and issues"], ["Ready in 3–5 business days", "Everything in Signature", "Custom storefront and admin dashboard", "Automatic payments, shipping, and order flow", "Advanced API and third-party integrations", "Automation, analytics, and performance review", "1 year support for website errors and issues", "30-day post-launch support"]],
        projectLabel: " / project", chat: "Chat on WhatsApp", popular: "Most popular",
        about: "</AboutMe>", skills: "</Skills>", projects: "</Projects>", videos: "</Videos>",
        contact: "Let's build", contactLine: "Have a product, a site, or an idea that needs shape? I'm always up for a good collaboration."
      },
      fr: {
        nav: ["</Accueil>", "</Tarifs>", "</À propos>", "</Compétences>", "</Projets>", "</Vidéos>"],
        mobile: ["Accueil", "Tarifs", "À propos", "Compétences", "Projets", "Vidéos", "Contact"],
        status: "Disponible pour vos projets · 2026",
        role: "design & code pour le web",
        lede: "Développeur web freelance en Indonésie, avec une expérience en concept art numérique et design frontend. Je crée des sites rapides et accessibles avec React, Next.js et PHP — avec une attention particulière aux interfaces originales.",
        view: "Voir les projets",
        talk: "Parlons-en",
        pricing: "</Tarifs>",
        pricingNote: "Un périmètre clair, un design soigné et un site prêt à évoluer.",
        value: "Le temps est précieux. Votre site est livré rapidement, sans compromis sur le design ou la qualité.",
        aboutParagraphs: ["Bonjour ! Je m'appelle David. Je suis <strong>développeur web full stack</strong> et artiste visuel numérique. J'aime créer des expériences interactives sur le web. Ma passion est née lorsque j'ai commencé à publier mes concept arts numériques et que j'ai voulu créer un espace personnalisé pour les présenter.", "Au lieu de créer une simple galerie en ligne, je me suis passionné pour le développement et le design web. Cette curiosité m'a conduit vers le code, l'UI/UX et les possibilités créatives des sites interactifs.", "Aujourd'hui, je me concentre sur des interfaces web amusantes, claires et réfléchies. J'aime coder de zéro et transformer les idées en sites fonctionnels et élégants directement dans le navigateur."],
        projectDescriptions: ["Site d'information sur un service canin et ses contacts.", "Site d'information sur Premium Travel & Villas à Bali.", "Site d'information sur l'entreprise et ses contacts."],
        pricingFoot: "Chaque offre commence par un court appel découverte. L'hébergement, le domaine, les plugins payants et la rédaction sont proposés séparément si nécessaire.", aboutNote: "<b>//</b> développeur web full stack<br /><b>//</b> artiste visuel numérique<br /><b>//</b> création depuis 2019", projectsNote: "Trois sites en ligne — <b>service</b>,<br /><b>voyage</b> et <b>gouvernement</b>.",
        cardNames: ["Lancement", "Momentum", "Signature", "Orbit"], cardDescs: ["Une présence en ligne ciblée pour une marque personnelle ou une petite entreprise prête à se lancer.", "Une boutique en ligne avec catalogue et commandes, sans passerelle de paiement intégrée.", "Une boutique en ligne complète avec paiements automatiques directement intégrés au site.", "Une plateforme e-commerce personnalisée avec paiements, automatisation et intégrations avancées."], cardFeatures: [["Livré en 2 semaines", "Direction visuelle personnalisée", "Section contact ou demande", "SEO on-page de base", "Mise en ligne incluse"], ["Livré en 7–10 jours ouvrés", "Boutique et catalogue produits", "Panier et parcours de commande", "Confirmation de paiement WhatsApp ou manuelle", "Gestion des produits et commandes", "Structure SEO et métadonnées"], ["Livré en 5–7 jours ouvrés", "Boutique et catalogue complets", "Panier et parcours de paiement", "Intégration automatique d'une passerelle de paiement", "Gestion des statuts de commande et paiement", "Performance et SEO technique"], ["Livré en 3–5 jours ouvrés", "Tout ce qui est inclus dans Signature", "Vitrine personnalisée et tableau de bord admin", "Paiements, livraison et commandes automatiques", "API et intégrations tierces avancées", "Automatisation, analytics et performance", "Support de 30 jours après lancement"]], projectLabel: " / projet", chat: "Écrire sur WhatsApp", popular: "Le plus populaire",
        projectLabel: " / projet", chat: "Écrire sur WhatsApp", popular: "Le plus populaire",
        about: "</À propos>", skills: "</Compétences>", projects: "</Projets>", videos: "</Vidéos>",
        contact: "Construisons ensemble", contactLine: "Un produit, un site ou une idée à concrétiser ? Je suis toujours partant pour une belle collaboration."
      },
      id: {
        nav: ["</Beranda>", "</Harga>", "</Tentang Saya>", "</Keahlian>", "</Proyek>", "</Video>"],
        mobile: ["Beranda", "Harga", "Tentang", "Keahlian", "Proyek", "Video", "Kontak"],
        status: "Siap menerima proyek · 2026",
        role: "desain & kode untuk web",
        lede: "Web developer freelance dari Indonesia dengan latar belakang concept art digital dan desain frontend. Saya membuat website yang cepat dan mudah diakses dengan React, Next.js, dan PHP — dengan antarmuka yang menyenangkan dan penuh perhatian.",
        view: "Lihat proyek",
        talk: "Hubungi Saya",
        pricing: "</Harga>",
        pricingNote: "Ruang lingkup jelas, desain matang, dan website yang siap berkembang.",
        value: "Waktu sangat berharga. Dapatkan website lebih cepat tanpa mengorbankan desain dan kualitas.",
        aboutParagraphs: ["Hai! Nama saya David. Saya seorang <strong>Full Stack Web Developer</strong> dan seniman visual digital. Saya suka membuat pengalaman interaktif di web. Ketertarikan saya pada web development dimulai ketika saya mengunggah karya concept art dan ingin membuat ruang khusus untuk menampilkannya.", "Alih-alih hanya membuat galeri online, saya justru tertarik pada proses pengembangan dan desain web. Rasa ingin tahu itu membawa saya lebih dalam ke coding, UI/UX, dan berbagai kemungkinan kreatif dari website interaktif.", "Saat ini fokus saya adalah membuat interface web yang menyenangkan, bersih, dan thoughtful. Saya suka coding dari awal dan mengubah ide menjadi website yang fungsional dan indah langsung di browser."],
        projectDescriptions: ["Website informasi tentang layanan anjing dan kontak.", "Website informasi tentang Premium Travel & Villas di Bali.", "Website informasi tentang perusahaan dan kontak."],
        pricingFoot: "Setiap paket dimulai dengan discovery call singkat. Hosting, domain, plugin berbayar, dan copywriting dihitung terpisah bila diperlukan.", aboutNote: "<b>//</b> web developer full stack<br /><b>//</b> seniman visual digital<br /><b>//</b> berkarya sejak 2019", projectsNote: "Tiga website live — <b>layanan</b>,<br /><b>travel</b>, dan <b>pemerintahan</b>.",
        cardNames: ["Launch", "Momentum", "Signature", "Orbit"], cardDescs: ["Kehadiran online yang fokus untuk personal brand atau bisnis kecil yang siap diluncurkan.", "Online store dengan katalog produk dan pemesanan, tanpa payment gateway di dalam website.", "Online store lengkap dengan pembayaran otomatis langsung di dalam website.", "Platform commerce lengkap dengan pembayaran, otomasi, integrasi, dan fitur bisnis lanjutan."], cardFeatures: [["Selesai dalam 2 minggu", "Arahan visual custom", "Section kontak atau inquiry", "SEO on-page dasar", "Siap diluncurkan"], ["Selesai dalam 7–10 hari kerja", "Online store dan katalog produk", "Shopping cart dan alur pemesanan", "Konfirmasi pembayaran WhatsApp atau manual", "Manajemen produk dan pesanan", "Struktur SEO dan metadata"], ["Selesai dalam 5–7 hari kerja", "Online store dan katalog lengkap", "Shopping cart dan alur checkout", "Integrasi payment gateway otomatis", "Manajemen status pesanan dan pembayaran", "Optimasi performa dan SEO teknis"], ["Selesai dalam 3–5 hari kerja", "Semua fitur Signature", "Storefront custom dan admin dashboard", "Pembayaran, pengiriman, dan pesanan otomatis", "API dan integrasi pihak ketiga lanjutan", "Otomasi, analytics, dan review performa", "Support 30 hari setelah launch"]], projectLabel: " / proyek", chat: "Chat WhatsApp", popular: "Paling populer",
        projectLabel: " / proyek", chat: "Chat WhatsApp", popular: "Paling populer",
        about: "</Tentang Saya>", skills: "</Keahlian>", projects: "</Proyek>", videos: "</Video>",
        contact: "Mari membangun", contactLine: "Punya produk, website, atau ide yang ingin diwujudkan? Saya siap berkolaborasi."
      }
    };

    function setText(selector, text) {
      var el = document.querySelector(selector);
      if (el) el.textContent = text;
      if (el && el.dataset && "text" in el.dataset) el.setAttribute("data-text", text);
    }

    function setMany(selector, values) {
      document.querySelectorAll(selector).forEach(function (el, index) {
        if (values[index] !== undefined) el.textContent = values[index];
      });
    }

    function setHTML(selector, html) {
      var el = document.querySelector(selector);
      if (el) el.innerHTML = html;
    }

    function setHTMLList(selector, values) {
      document.querySelectorAll(selector).forEach(function (el, index) {
        if (values[index] !== undefined) el.innerHTML = values[index];
      });
    }

    function applyLanguage(language) {
      var t = translations[language] || translations.en;
      document.documentElement.lang = language === "fr" ? "fr" : language === "id" ? "id" : "en";
      document.title = language === "fr" ? "David Agus Kuncoro — Développeur Web & Artiste Numérique" : language === "id" ? "David Agus Kuncoro — Web Developer & Digital Artist" : "David Agus Kuncoro — Web Developer & Digital Artist | Freelance Indonesia";
      document.querySelectorAll(".nav__links a").forEach(function (el, i) { if (t.nav[i]) el.textContent = t.nav[i]; });
      document.querySelectorAll(".sheet nav a").forEach(function (el, i) { if (t.mobile[i]) el.firstChild.textContent = t.mobile[i] + " "; });
      setText(".hero__status", t.status);
      setText(".hero__role", t.role);
      setText(".hero__lede", t.lede);
      setText(".hero__actions .btn--solid", t.view);
      setText(".hero__actions .btn--ghost", t.talk);
      setText("#pricing .section__title", t.pricing);
      setText("#pricing .section__note", t.pricingNote);
      setText(".pricing__value", t.value);
      setHTML(".pricing__footnote", language === "fr" ? "Chaque offre commence par un court appel découverte. L'hébergement/serveur et le domaine sont séparés pour Lancement et Momentum. Signature et Orbit incluent un an d'hébergement/serveur, de domaine, de SSL, de mise en ligne et de sauvegarde de base. Un an de support est inclus uniquement pour corriger les erreurs et problèmes du site. Les plugins payants et la rédaction sont proposés séparément si nécessaire." : language === "id" ? "Setiap paket dimulai dengan discovery call singkat. Hosting/server dan domain terpisah untuk Launch dan Momentum. Signature dan Orbit sudah termasuk hosting/server, domain, SSL, deployment, dan setup backup dasar selama 1 tahun. Support 1 tahun hanya untuk memperbaiki error dan masalah pada website. Plugin berbayar dan copywriting dihitung terpisah bila diperlukan." : "Every package starts with a short discovery call. Hosting/server and domain are separate for Launch and Momentum. Signature and Orbit include one year of hosting/server, domain, SSL, deployment, and basic backup setup. One year of support is included only for fixing website errors and technical issues. Paid plugins and copywriting are quoted separately when needed.");
      setText("#about .section__title", t.about);
      setHTML("#about .section__note", t.aboutNote);
      setHTMLList(".about__body > p", t.aboutParagraphs);
      setMany(".project__desc", t.projectDescriptions);
      setMany(".price-card__name", t.cardNames);
      setMany(".price-card__desc", t.cardDescs);
      document.querySelectorAll(".price-card").forEach(function (card, cardIndex) {
        var features = card.querySelectorAll(".price-card__features li");
        if (t.cardFeatures[cardIndex]) {
          features.forEach(function (feature, featureIndex) {
            if (t.cardFeatures[cardIndex][featureIndex] !== undefined) feature.textContent = t.cardFeatures[cardIndex][featureIndex];
          });
        }
      });
      var supportText = language === "fr"
        ? "Support pendant 1 an pour les erreurs et problèmes du site"
        : language === "id"
          ? "Support 1 tahun untuk error dan masalah website"
          : "1 year support for website errors and issues";
      document.querySelectorAll(".price-card__features li").forEach(function (feature) {
        if (/support.*(year|tahun|an)|support.*website|support.*site|support.*error/i.test(feature.textContent)) feature.textContent = supportText;
      });
      document.querySelectorAll(".price-card__features").forEach(function (list, index) {
        Array.prototype.slice.call(list.children).filter(function (item) {
          return /support.*(year|tahun|an)|support.*website|support.*site|support.*error/i.test(item.textContent);
        }).forEach(function (item) { item.remove(); });
        if (index !== 1) {
          var supportItem = document.createElement("li");
          supportItem.textContent = supportText;
          list.appendChild(supportItem);
        }
      });
      document.querySelectorAll(".price-card__features").forEach(function (list, index) {
        Array.prototype.slice.call(list.children).filter(function (item) {
          return /hosting.*domain|domain.*hosting|hébergement.*domaine|domaine.*hébergement/i.test(item.textContent);
        }).forEach(function (item) { item.remove(); });
        if (index < 2) {
          var excludedText = language === "fr"
            ? "Hébergement et domaine non inclus"
            : language === "id"
              ? "Hosting dan domain tidak termasuk"
              : "Hosting and domain not included";
          var excludedItem = document.createElement("li");
          excludedItem.textContent = excludedText;
          list.appendChild(excludedItem);
        }
      });
      document.querySelectorAll(".price-card__features").forEach(function (list, index) {
        if (index < 2) {
          Array.prototype.slice.call(list.children).filter(function (item) {
            return /hosting|hébergement|domain|domaine/i.test(item.textContent);
          }).forEach(function (item) { item.remove(); });
        }
      });
      setMany(".price-card__price > span", [t.projectLabel, t.projectLabel, t.projectLabel, t.projectLabel]);
      setText(".price-card__badge", t.popular);
      setMany(".price-card__cta", [t.chat, t.chat, t.chat, t.chat]);
      var addon = language === "fr"
        ? { eyebrow: "Option · Launch & Momentum", title: "Maintenance & Hébergement — Standard", desc: "Idéal pour le Pack Débutant. Hébergement, gestion continue et intervention en cas de bug sous 48 heures · stockage standard.", prices: ["/ mois", "/ an · économisez 1 000 000 Rp"], features: ["Domaine et hébergement achetables auprès de nous", "Gestion continue de l'hébergement", "Intervention en cas de bug sous 48 heures", "Stockage standard"], cta: "Demander le prix sur WhatsApp" }
        : language === "id"
          ? { eyebrow: "Add-on · Launch & Momentum", title: "Pemeliharaan & Hosting — Standar", desc: "Ideal untuk Paket Pemula. Hosting, manajemen berkelanjutan, dan intervensi jika terjadi bug dalam waktu 48 jam · penyimpanan standar.", prices: ["/ bulan", "/ tahun · hemat Rp1.000.000"], features: ["Domain dan hosting dapat dibeli melalui kami", "Manajemen hosting berkelanjutan", "Intervensi bug dalam waktu 48 jam", "Penyimpanan standar"], cta: "Tanya harga via WhatsApp" }
          : { eyebrow: "Add-on · Launch & Momentum", title: "Maintenance & Hosting — Standard", desc: "Ideal for the Launch package. Hosting, ongoing management, and bug intervention within 48 hours · standard storage.", prices: ["/ month", "/ year · save Rp1,000,000"], features: ["Domain and hosting available through us", "Ongoing hosting management", "Bug intervention within 48 hours", "Standard storage"], cta: "Ask about pricing on WhatsApp" };
      setText(".hosting-addon__eyebrow", addon.eyebrow);
      setText(".hosting-addon__title", addon.title);
      setText(".hosting-addon__desc", addon.desc);
      setMany(".hosting-addon__prices span", addon.prices);
      setMany(".hosting-addon__features li", addon.features);
      document.querySelectorAll(".hosting-addon__cta").forEach(function (cta) { cta.innerHTML = addon.cta + " <span aria-hidden=\"true\">↗</span>"; });
      setText("#skills .section__title", t.skills);
      setText("#projects .section__title", t.projects);
      setHTML("#projects .section__note", t.projectsNote);
      setText("#videos .section__title", t.videos);
      setText(".contact__title", t.contact);
      setText(".contact__line", t.contactLine);
      selects.forEach(function (select) { select.value = language; });
      dropdowns.forEach(function (dd) {
        dd.querySelectorAll(".lang-dropdown__current").forEach(function (el) { el.textContent = NAMES[language] || language; });
        dd.querySelectorAll(".lang-dropdown__menu li").forEach(function (li) { li.setAttribute("aria-selected", String(li.dataset.lang === language)); });
      });
      localStorage.setItem("preferred-language", language);
    }

    var NAMES = { en: "English", fr: "Français", id: "Indonesia" };
    var saved = localStorage.getItem("preferred-language") || "en";
    applyLanguage(saved);
    selects.forEach(function (select) {
      select.addEventListener("change", function () { applyLanguage(select.value); });
    });

    dropdowns.forEach(function (dd) {
      var btn = dd.querySelector(".lang-dropdown__btn");
      if (!btn) return;
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = dd.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(open));
        dropdowns.forEach(function (other) {
          if (other !== dd) {
            other.classList.remove("is-open");
            var b = other.querySelector(".lang-dropdown__btn");
            if (b) b.setAttribute("aria-expanded", "false");
          }
        });
      });
      dd.querySelectorAll(".lang-dropdown__menu li").forEach(function (li) {
        li.addEventListener("click", function () {
          applyLanguage(li.dataset.lang);
          dd.classList.remove("is-open");
          btn.setAttribute("aria-expanded", "false");
        });
      });
    });
    document.addEventListener("click", function () {
      dropdowns.forEach(function (dd) {
        dd.classList.remove("is-open");
        var b = dd.querySelector(".lang-dropdown__btn");
        if (b) b.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      dropdowns.forEach(function (dd) {
        dd.classList.remove("is-open");
        var b = dd.querySelector(".lang-dropdown__btn");
        if (b) b.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    initNav();
    initSheet();
    initReveal();
    initVideos();
    initCursor();
    initParallax();
    initLanguage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
