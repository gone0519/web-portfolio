// GROWTHWORKS 共通スクリプト（全ページの <head> で読み込み）
// - スクロール表示 [data-reveal]
// - パララックス [data-parallax] / [data-rotate]
// - 数字カウントアップ [data-count]（data-suffix で単位）
// - 別ページのアンカー（About.dc.html#recruit など）への到着時スクロール
(function () {
  if (window.__gwSite) return;
  window.__gwSite = true;
  document.documentElement.classList.add("gw-js");

  // 画像ファイルが無いときは <img class="gw-img"> を隠してプレースホルダーを見せる
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG" && t.classList.contains("gw-img")) t.style.display = "none";
  }, true);
  document.addEventListener("load", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG" && t.classList.contains("gw-img")) t.style.display = "";
  }, true);

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function start() {
    // --- reveal ---
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) en.target.classList.add("gw-in");
        else if (en.boundingClientRect.top > 0) en.target.classList.remove("gw-in");
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });

    // --- count up ---
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        cio.unobserve(el);
        var to = parseFloat(el.dataset.count);
        var suf = el.dataset.suffix || "";
        if (reduce || isNaN(to)) return;
        var t0 = performance.now();
        var tick = function (t) {
          var k = Math.min(1, (t - t0) / 1400);
          el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + suf;
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { rootMargin: "0px 0px -12% 0px" });

    var hideBroken = function () {
      document.querySelectorAll("img.gw-img").forEach(function (img) {
        if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) img.style.display = "none";
      });
    };
    window.addEventListener("load", hideBroken);

    var scan = function () {
      hideBroken();
      document.querySelectorAll("[data-reveal]").forEach(function (el) {
        if (el.__gwSeen) return;
        el.__gwSeen = true;
        io.observe(el);
      });
      document.querySelectorAll("[data-count]").forEach(function (el) {
        if (el.__gwSeen) return;
        el.__gwSeen = true;
        cio.observe(el);
      });
    };
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; scan(); });
    }).observe(document.body, { childList: true, subtree: true });
    scan();

    // --- parallax ---
    if (!reduce) {
      var loop = function () {
        var vh = window.innerHeight || 800;
        document.querySelectorAll("[data-parallax]").forEach(function (el) {
          var host = el.parentElement;
          if (!host) return;
          var r = host.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          var p = (r.top + r.height / 2 - vh / 2) / vh;
          var y = (p * parseFloat(el.dataset.parallax) * -100).toFixed(2);
          var rot = el.dataset.rotate ? " rotate(" + (parseFloat(el.dataset.rotate) + p * 8).toFixed(2) + "deg)" : "";
          el.style.transform = "translate3d(0," + y + "px,0)" + rot;
        });
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }

    // --- hash on arrival: content renders after load, so wait for the target ---
    if (location.hash.length > 1) {
      var id = decodeURIComponent(location.hash.slice(1));
      var tries = 0;
      var find = function () {
        var el = document.getElementById(id);
        if (el) { setTimeout(function () { el.scrollIntoView({ behavior: "auto", block: "start" }); }, 250); return; }
        if (++tries < 60) setTimeout(find, 50);
      };
      find();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
