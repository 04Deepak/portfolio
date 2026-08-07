/* Deepak Bharate — portfolio behaviour.
   Progressive enhancement only: every page works with JS disabled. */

(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- Theme -------------------------------------------------- */

  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ---------- Mobile nav --------------------------------------------- */

  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  function closeNav() {
    if (!navLinks) return;
    navLinks.setAttribute("data-open", "false");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.getAttribute("data-open") === "true";
      navLinks.setAttribute("data-open", String(!open));
      navToggle.setAttribute("aria-expanded", String(!open));
    });

    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeNav();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Sticky header shadow ------------------------------------ */

  var header = document.getElementById("siteHeader");
  if (header) {
    var onScroll = function () {
      header.setAttribute("data-stuck", String(window.scrollY > 8));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Scroll reveal ------------------------------------------- */

  var revealables = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || reduceMotion) {
    // No observer support, or the visitor asked for less motion: show everything.
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    Array.prototype.forEach.call(revealables, function (el, i) {
      el.style.transitionDelay = Math.min(i % 6, 5) * 55 + "ms";
      observer.observe(el);
    });
  }

  /* ---------- Active section in nav ----------------------------------- */

  var sections = document.querySelectorAll("main section[id]");
  var navAnchors = navLinks ? navLinks.querySelectorAll('a[href^="#"]') : [];

  if (sections.length && navAnchors.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Array.prototype.forEach.call(navAnchors, function (a) {
          var match = a.getAttribute("href") === "#" + entry.target.id;
          if (match) { a.setAttribute("aria-current", "page"); }
          else { a.removeAttribute("aria-current"); }
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    Array.prototype.forEach.call(sections, function (s) { spy.observe(s); });
  }

  /* ---------- Contact form -------------------------------------------
     Builds a mailto: link. No third-party service, no API key in the page —
     the previous version shipped a live SMTP token in the HTML source. */

  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = document.getElementById("cf-name").value.trim();
      var subject = document.getElementById("cf-subject").value.trim();
      var message = document.getElementById("cf-message").value.trim();

      var body = message + "\n\n— " + name;
      var href =
        "mailto:deepakbharate54321@gmail.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = href;
    });
  }

  /* ---------- Work page filters --------------------------------------- */

  var filters = document.querySelectorAll("[data-filter]");
  var items = document.querySelectorAll("[data-tags]");

  if (filters.length && items.length) {
    Array.prototype.forEach.call(filters, function (btn) {
      btn.addEventListener("click", function () {
        var want = btn.getAttribute("data-filter");

        Array.prototype.forEach.call(filters, function (b) {
          b.setAttribute("aria-pressed", String(b === btn));
        });

        Array.prototype.forEach.call(items, function (item) {
          var tags = item.getAttribute("data-tags") || "";
          var show = want === "all" || tags.split(" ").indexOf(want) !== -1;
          item.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  /* ---------- Footer year ---------------------------------------------- */

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
