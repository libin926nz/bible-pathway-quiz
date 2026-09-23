/** Shared language utilities for Bible Pathway Quiz (index + plan). */
window.BPQ = window.BPQ || {};

BPQ.LANGS = [
  { id: "zh", label: "简", htmlLang: "zh-CN", ogLocale: "zh_CN" },
  { id: "zh-Hant", label: "繁", htmlLang: "zh-TW", ogLocale: "zh_TW" },
  { id: "en", label: "EN", htmlLang: "en", ogLocale: "en_US" }
];

BPQ.STORAGE_KEY = "bpq_lang";

BPQ.normalizeLang = function (v) {
  if (!v) return null;
  v = String(v).trim().toLowerCase().replace(/_/g, "-");
  if (v === "zh-hant" || v === "zh-tw" || v === "zh-hk" || v === "zh-mo" || v === "hant" || v === "tw" || v === "hk") {
    return "zh-Hant";
  }
  if (v === "zh-hans" || v === "zh-cn" || v === "zh-sg" || v === "cn" || v === "hans" || v === "sc") return "zh";
  if (v === "zh") return "zh";
  if (v === "en" || v === "english") return "en";
  return null;
};

BPQ.parseLangParam = function () {
  try {
    const params = new URLSearchParams(location.search);
    let v = params.get("lang");
    if (!v && location.hash) {
      const m = location.hash.match(/^#lang=([^&]+)/);
      if (m) v = decodeURIComponent(m[1]);
    }
    return BPQ.normalizeLang(v);
  } catch (e) {
    return null;
  }
};

BPQ.detectLang = function () {
  const fromUrl = BPQ.parseLangParam();
  if (fromUrl) return fromUrl;
  try {
    const saved = localStorage.getItem(BPQ.STORAGE_KEY);
    const normalized = BPQ.normalizeLang(saved);
    if (normalized) return normalized;
  } catch (e) {}
  const nav = (navigator.language || navigator.userLanguage || "en").toLowerCase().replace(/_/g, "-");
  if (nav === "zh-tw" || nav === "zh-hk" || nav === "zh-mo" || nav.startsWith("zh-hant")) return "zh-Hant";
  if (nav.startsWith("zh")) return "zh";
  return "en";
};

BPQ.isChinese = function (lang) {
  return lang === "zh" || lang === "zh-Hant";
};

BPQ.saveLang = function (lang) {
  try {
    localStorage.setItem(BPQ.STORAGE_KEY, lang);
  } catch (e) {}
};

BPQ.langMeta = function (lang) {
  return BPQ.LANGS.find(function (l) { return l.id === lang; }) || BPQ.LANGS[0];
};

BPQ.initLangSwitcher = function (containerOrId, getLang, setLang, onChange) {
  const root = typeof containerOrId === "string" ? document.getElementById(containerOrId) : containerOrId;
  if (!root) return null;

  root.classList.add("lang-switch");
  root.setAttribute("role", "group");
  root.setAttribute("aria-label", "Language");
  root.innerHTML = BPQ.LANGS.map(function (l) {
    return '<button type="button" class="lang-opt" data-lang="' + l.id + '">' + l.label + "</button>";
  }).join("");

  function sync() {
    const cur = getLang();
    root.querySelectorAll(".lang-opt").forEach(function (btn) {
      const active = btn.getAttribute("data-lang") === cur;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  root.addEventListener("click", function (e) {
    const btn = e.target.closest(".lang-opt");
    if (!btn) return;
    const next = btn.getAttribute("data-lang");
    if (next === getLang()) return;
    setLang(next);
    BPQ.saveLang(next);
    sync();
    if (onChange) onChange(next);
  });

  sync();
  return { refresh: sync };
};
