/*
 * FAP Clean — content script cho https://fap.fpt.edu.vn/*
 * - Chỉ đổi giao diện; không gửi dữ liệu đi đâu, không sửa form của FAP.
 * - Mọi thứ thêm vào trang đều có class "fx-injected" để gỡ sạch khi tắt.
 */
(() => {
  "use strict";
  if (window.__fapClean) return;
  window.__fapClean = true;

  const ROOT = document.documentElement;
  const DEFAULTS = { enabled: true, theme: "system", lang: "auto" };
  const store = (globalThis.chrome && chrome.storage && (chrome.storage.sync || chrome.storage.local)) || null;
  const darkMQ = window.matchMedia("(prefers-color-scheme: dark)");
  let settings = { ...DEFAULTS };
  let mounted = false;
  let themeObserver = null;
  let heroObserver = null;
  let nowTimer = null;

  /* ---------------- Ngôn ngữ ---------------- */
  const STR = {
    vi: {
      home: "Trang chủ", timetable: "Thời khoá biểu", attendance: "Điểm danh", grade: "Điểm", exam: "Lịch thi",
      search: "Tìm nhanh", searchPh: "Tìm trang, ví dụ: điểm, lịch thi, học phí",
      paletteLabel: "Tìm nhanh trang FAP", noResults: "Không có trang nào khớp. Thử từ khác, ví dụ “điểm” hoặc “đơn”.",
      hintMove: "↑ ↓ để chọn", hintOpen: "Enter để mở", hintClose: "Esc để đóng",
      today: "Hôm nay", viewWeek: "Xem cả tuần", loading: "Đang tải lịch hôm nay…",
      noClass: "Hôm nay bạn không có buổi học nào.", next: "Buổi tiếp theo:", noUpcoming: "Chưa có buổi học nào trong hai tuần tới.",
      loadError: "Không tải được lịch hôm nay. Mở Thời khoá biểu để xem trực tiếp.",
      now: "Bây giờ", online: "Trực tuyến", offline: "Tại lớp", meet: "Mở Meet", slot: "Slot",
      quick: "Truy cập nhanh", all: "Tất cả chức năng",
      morning: "Chào buổi sáng", noon: "Chào buổi trưa", afternoon: "Chào buổi chiều", evening: "Chào buổi tối",
      roll: "MSSV", program: "Chương trình", batch: "Khoá", balance: "Số dư", status: "Trạng thái",
      dTimetable: "Lịch học theo tuần", dAttendance: "Có mặt, vắng từng môn", dGrade: "Điểm thành phần từng môn", dExam: "Ngày, giờ và phòng thi",
      themeToLight: "Chuyển sang giao diện sáng", themeToDark: "Chuyển sang giao diện tối", shortcut: "Ctrl K", shortcutMac: "⌘ K",
    },
    en: {
      home: "Home", timetable: "Timetable", attendance: "Attendance", grade: "Grades", exam: "Exams",
      search: "Quick search", searchPh: "Find a page, e.g. grades, exam, payment",
      paletteLabel: "Quick search FAP pages", noResults: "No page matches. Try another word, like “grade” or “application”.",
      hintMove: "↑ ↓ to move", hintOpen: "Enter to open", hintClose: "Esc to close",
      today: "Today", viewWeek: "View whole week", loading: "Loading today’s schedule…",
      noClass: "You have no classes today.", next: "Next class:", noUpcoming: "No classes in the next two weeks.",
      loadError: "Couldn’t load today’s schedule. Open Timetable to check it directly.",
      now: "Now", online: "Online", offline: "In class", meet: "Open Meet", slot: "Slot",
      quick: "Quick access", all: "All features",
      morning: "Good morning", noon: "Good afternoon", afternoon: "Good afternoon", evening: "Good evening",
      roll: "Student ID", program: "Program", batch: "Batch", balance: "Balance", status: "Status",
      dTimetable: "Your classes this week", dAttendance: "Present and absent per course", dGrade: "Component grades per course", dExam: "Exam dates, times and rooms",
      themeToLight: "Switch to light theme", themeToDark: "Switch to dark theme", shortcut: "Ctrl K", shortcutMac: "⌘ K",
    },
  };
  const lang = () => {
    if (settings.lang === "vi" || settings.lang === "en") return settings.lang;
    return (ROOT.getAttribute("lang") || "vi").toLowerCase().startsWith("en") ? "en" : "vi";
  };
  const t = (k) => STR[lang()][k] ?? STR.vi[k] ?? k;
  const locale = () => (lang() === "en" ? "en-GB" : "vi-VN");
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  /* ---------------- Tiện ích nhỏ ---------------- */
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      // CSP của FAP chặn thuộc tính style="" viết thẳng; gán qua CSSOM thì được phép
      else if (k === "style") n.style.cssText = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : String(v));
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) n.append(kid.nodeType ? kid : String(kid));
    return n;
  };
  const icon = (cls) => el("i", { class: cls, "aria-hidden": "true" });
  const fold = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  const pad = (n) => String(n).padStart(2, "0");
  const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const safeHttp = (href) => { try { const u = new URL(href, location.href); return /^https?:$/.test(u.protocol) ? u.href : null; } catch { return null; } };
  const sentence = (s) => { const x = (s || "").trim(); return x ? x.charAt(0).toUpperCase() + x.slice(1).toLowerCase() : x; };

  /* ---------------- Cài đặt ---------------- */
  const loadSettings = () => new Promise((resolve) => {
    if (!store) return resolve({ ...DEFAULTS });
    try { store.get(DEFAULTS, (v) => resolve({ ...DEFAULTS, ...(v || {}) })); } catch { resolve({ ...DEFAULTS }); }
  });
  const saveSettings = (patch) => { settings = { ...settings, ...patch }; if (store) try { store.set(patch); } catch {} };

  /* ---------------- Theme ---------------- */
  const resolvedTheme = () => (settings.theme === "system" ? (darkMQ.matches ? "dark" : "light") : settings.theme);
  function applyTheme() {
    if (!ROOT.classList.contains("fapx")) return;
    const th = resolvedTheme();
    if (!("fxOrigBsTheme" in ROOT.dataset)) ROOT.dataset.fxOrigBsTheme = ROOT.getAttribute("data-bs-theme") || "light";
    ROOT.dataset.fxTheme = th;
    if (ROOT.getAttribute("data-bs-theme") !== th) ROOT.setAttribute("data-bs-theme", th);
    const btn = document.querySelector(".fx-theme-btn");
    if (btn) {
      btn.replaceChildren(icon(th === "dark" ? "ri-sun-line" : "ri-moon-line"));
      const label = th === "dark" ? t("themeToLight") : t("themeToDark");
      btn.setAttribute("aria-label", label);
      btn.title = label;
    }
  }
  function watchTheme() {
    themeObserver?.disconnect();
    themeObserver = new MutationObserver(() => {
      if (mounted && ROOT.getAttribute("data-bs-theme") !== ROOT.dataset.fxTheme) applyTheme();
    });
    themeObserver.observe(ROOT, { attributes: true, attributeFilter: ["data-bs-theme"] });
  }
  darkMQ.addEventListener?.("change", () => { if (settings.theme === "system") applyTheme(); });

  /* ---------------- Đọc menu từ sidebar của FAP ---------------- */
  const ALIASES = {
    "/weeklytimetable": "thoi khoa bieu tkb lich hoc tuan schedule timetable",
    "/examschedule": "lich thi exam ky thi phong thi",
    "/report/attendance": "diem danh vang co mat attendance",
    "/report/grade": "diem bang diem diem thanh phan grade mark",
    "/report/transcript": "bang diem tich luy gpa hoc ba transcript",
    "/report/ojtconditions": "ojt thuc tap dieu kien",
    "/report/thesisconditions": "do an tot nghiep khoa luan dieu kien thesis capstone",
    "/subject": "mon hoc subject",
    "/curriculum": "khung chuong trinh curriculum",
    "/mycertificates": "chung chi certificate",
    "/news": "tin tuc thong bao news",
    "/document": "tai lieu document",
    "/document/drivepdf": "huong dan su dung user guide",
    "/application": "don xem don application",
    "/application/catalog": "nop don gui don lam don application",
    "/crossclasschange": "doi lop chuyen lop cross class",
    "/startupgroup": "khoi nghiep startup",
    "/startupgroup/add": "nop ho so khoi nghiep startup",
    "/shoppingcart": "thanh toan hoc phi dong tien no phi payment",
    "/coursependingpayment": "phi dang ky mon hoc phi",
    "/transaction": "lich su giao dich transaction",
    "/wishlist": "danh sach cho lop waitlist wishlist",
    "/wishlist/register": "dang ky cho lop waitlist wishlist",
    "/fyecheckinlog": "fye check in",
    "/fyementorfeedback": "fye mentor phan hoi feedback",
    "/account": "thong tin ca nhan tai khoan account",
    "/studentprofile": "cap nhat ho so profile",
  };
  let menuCache = null;
  function readMenu() {
    if (menuCache) return menuCache;
    const nav = document.querySelector("aside.fap-sidebar ul.side-nav");
    const sections = [];
    if (!nav) return (menuCache = sections);
    let cur = null;
    const labelOf = (a) => {
      const spans = [...a.querySelectorAll(":scope > span")].filter((s) => !s.classList.contains("menu-arrow") && s.textContent.trim());
      return (spans[0] || a).textContent.trim().replace(/\s+/g, " ");
    };
    const iconOf = (a) => (a.querySelector(":scope > i")?.className || "ri-file-list-3-line").split(/\s+/).filter((c) => c.startsWith("ri-")).join(" ") || "ri-file-list-3-line";
    for (const li of nav.children) {
      if (li.classList.contains("side-nav-title")) {
        cur = { title: sentence(li.textContent), items: [] };
        sections.push(cur);
        continue;
      }
      if (!li.classList.contains("side-nav-item")) continue;
      if (!cur) { cur = { title: "", items: [] }; sections.push(cur); }
      const a = li.querySelector(":scope > a");
      if (!a) continue;
      const groupIcon = iconOf(a);
      const sub = li.querySelector(":scope > .collapse");
      const push = (link, ic, group) => {
        const href = safeHttp(link.getAttribute("href"));
        if (!href) return;
        const path = new URL(href).pathname.toLowerCase();
        cur.items.push({ label: labelOf(link), href, path, icon: ic, group, external: link.getAttribute("target") === "_blank" });
      };
      if (sub) sub.querySelectorAll("a.side-nav-link").forEach((sa) => push(sa, groupIcon, labelOf(a)));
      else push(a, groupIcon, "");
    }
    return (menuCache = sections.filter((s) => s.items.length));
  }
  const allItems = () => readMenu().flatMap((s) => s.items.map((i) => ({ ...i, section: s.title })));

  /* ---------------- Topbar ---------------- */
  const PINNED = [
    { key: "home", path: "/", match: (p) => p === "/" || p === "/home" || p === "/home/index" },
    { key: "timetable", path: "/WeeklyTimetable", icon: "ri-calendar-2-line", desc: "dTimetable" },
    { key: "attendance", path: "/Report/Attendance", icon: "ri-user-follow-line", desc: "dAttendance" },
    { key: "grade", path: "/Report/Grade", icon: "ri-bar-chart-box-line", desc: "dGrade" },
    { key: "exam", path: "/ExamSchedule", icon: "ri-file-edit-line", desc: "dExam" },
  ];
  function buildTopbar() {
    const brand = document.querySelector(".fap-topbar__brand");
    const menu = document.querySelector(".fap-topbar__menu");
    if (!brand || !menu) return;
    const here = location.pathname.toLowerCase().replace(/\/+$/, "") || "/";
    const nav = el("nav", { class: "fx-topnav fx-injected", "aria-label": "FAP" });
    for (const p of PINNED) {
      const active = p.match ? p.match(here) : here === p.path.toLowerCase() || here.startsWith(p.path.toLowerCase() + "/");
      nav.append(el("a", { href: p.path, "aria-current": active ? "page" : null, text: t(p.key) }));
    }
    brand.append(nav);

    const searchBtn = el("button", { type: "button", class: "fx-search-btn", "aria-label": t("search"), onclick: () => openPalette() },
      icon("ri-search-line"), el("span", { text: t("search") }), el("kbd", { class: "fx-kbd", text: isMac ? t("shortcutMac") : t("shortcut") }));
    const themeBtn = el("button", { type: "button", class: "fx-theme-btn", onclick: () => {
      saveSettings({ theme: resolvedTheme() === "dark" ? "light" : "dark" });
      applyTheme();
    } });
    menu.prepend(el("li", { class: "fx-injected d-flex align-items-center" }, searchBtn), el("li", { class: "fx-injected d-flex align-items-center" }, themeBtn));
  }

  /* ---------------- Tìm nhanh ---------------- */
  let palette = null;
  function openPalette() {
    if (!mounted) return;
    if (!palette) palette = buildPalette();
    palette.lastFocus = document.activeElement;
    palette.root.hidden = false;
    palette.input.value = "";
    palette.render("");
    palette.input.focus();
  }
  function closePalette() {
    if (!palette || palette.root.hidden) return;
    palette.root.hidden = true;
    palette.lastFocus?.focus?.();
  }
  function buildPalette() {
    const items = allItems();
    const input = el("input", { class: "fx-palette__input", type: "text", role: "combobox", "aria-expanded": "true", "aria-controls": "fx-palette-list", "aria-autocomplete": "list", placeholder: t("searchPh"), autocomplete: "off", spellcheck: "false" });
    const list = el("ul", { class: "fx-palette__list", id: "fx-palette-list", role: "listbox" });
    const foot = el("div", { class: "fx-palette__foot" }, el("span", { text: t("hintMove") }), el("span", { text: t("hintOpen") }), el("span", { text: t("hintClose") }));
    const panel = el("div", { class: "fx-palette__panel" }, input, list, foot);
    const root = el("div", { class: "fx-palette fx-injected", role: "dialog", "aria-modal": "true", "aria-label": t("paletteLabel"), hidden: true }, panel);
    let shown = [];
    let sel = 0;
    const score = (it, q) => {
      if (!q) return 1;
      const hay = fold(`${it.label} ${it.group} ${it.section} ${ALIASES[it.path] || ""}`);
      const words = fold(q).split(/\s+/).filter(Boolean);
      if (!words.every((w) => hay.includes(w))) return 0;
      const lab = fold(it.label);
      return (lab.startsWith(words[0]) ? 3 : 0) + (lab.includes(words[0]) ? 2 : 0) + 1;
    };
    const select = (i) => {
      sel = Math.max(0, Math.min(i, shown.length - 1));
      [...list.children].forEach((li, idx) => li.setAttribute("aria-selected", idx === sel ? "true" : "false"));
      const cur = list.children[sel];
      if (cur && cur.id) { input.setAttribute("aria-activedescendant", cur.id); cur.scrollIntoView({ block: "nearest" }); }
    };
    const go = (it) => { if (!it) return; if (it.external) window.open(it.href, "_blank", "noopener"); else location.href = it.href; };
    const render = (q) => {
      shown = items.map((it) => [it, score(it, q)]).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).map(([it]) => it).slice(0, 40);
      list.replaceChildren(...(shown.length ? shown.map((it, i) => el("li", {
        class: "fx-palette__item", role: "option", id: `fx-opt-${i}`, "aria-selected": i === 0 ? "true" : "false",
        onmousemove: () => { if (sel !== i) select(i); }, onclick: () => go(it),
      }, icon(it.icon), el("b", { text: it.label }), el("small", { text: it.group || it.section }))) : [el("li", { class: "fx-palette__empty", text: t("noResults") })]));
      sel = 0;
      if (shown.length) input.setAttribute("aria-activedescendant", "fx-opt-0"); else input.removeAttribute("aria-activedescendant");
    };
    input.addEventListener("input", () => render(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); select(sel + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); select(sel - 1); }
      else if (e.key === "Enter") { e.preventDefault(); go(shown[sel]); }
      else if (e.key === "Escape") { e.preventDefault(); closePalette(); }
    });
    root.addEventListener("mousedown", (e) => { if (e.target === root) closePalette(); });
    document.body.append(root);
    return { root, input, render, lastFocus: null };
  }
  function onKey(e) {
    if (!mounted) return;
    const k = (e.key || "").toLowerCase();
    if ((e.ctrlKey || e.metaKey) && !e.altKey && k === "k") {
      e.preventDefault();
      if (palette && !palette.root.hidden) closePalette();
      else openPalette();
    }
  }

  /* ---------------- Trang chủ ---------------- */
  const isHome = () => !!document.getElementById("home-student-shell");
  function readStudent() {
    const card = document.querySelector(".fap-home-student-card");
    if (!card) return null;
    const name = card.querySelector(".fap-home-student-card__name")?.textContent.trim() || "";
    const roll = card.querySelector(".fap-home-student-card__roll")?.textContent.trim() || "";
    const metrics = {};
    card.querySelectorAll(".fap-home-student-card__metric").forEach((m) => {
      const lab = m.querySelector(".fap-home-student-card__label");
      const kind = [...(lab?.classList || [])].find((c) => c.includes("__label--"))?.split("--")[1];
      if (!kind) return;
      // Giá trị = toàn bộ chữ của ô trừ đi nhãn (giữ được cả "0 VND" ở ô số dư)
      const value = m.textContent.replace(lab?.textContent || "", "").replace(/\s+/g, " ").trim();
      if (value) metrics[kind] = value;
    });
    return { name, roll, status: metrics.primary, program: metrics.info, batch: metrics.secondary, balance: metrics.success };
  }
  function greeting() {
    const h = new Date().getHours();
    return h < 11 ? t("morning") : h < 13 ? t("noon") : h < 18 ? t("afternoon") : t("evening");
  }
  function buildHome() {
    const host = document.querySelector(".content-page > .content > .container-fluid");
    const shell = document.getElementById("home-student-shell");
    if (!host || !shell) return;
    ROOT.classList.add("fx-is-home");
    const dateText = new Intl.DateTimeFormat(locale(), { weekday: "long", day: "numeric", month: "long" }).format(new Date());
    const fact = (k, v) => (v ? el("div", {}, el("dt", { text: t(k) }), el("dd", { text: v })) : null);
    const greet = el("h1", { class: "fx-hero__greet", text: `${greeting()}.` });
    const facts = el("dl", { class: "fx-facts" });
    const hero = el("section", { class: "fx-hero" },
      el("p", { class: "fx-hero__date", text: dateText.charAt(0).toUpperCase() + dateText.slice(1) }), greet, facts);

    // Thẻ sinh viên được FAP tải sau (qua /Home/StudentContentPartial), nên chờ nó xuất hiện rồi mới điền tên
    const fillHero = () => {
      const st = readStudent();
      if (!st || !st.name) return false;
      const given = st.name.split(/\s+/).filter(Boolean).pop() || "";
      greet.textContent = given ? `${greeting()}, ${given}.` : `${greeting()}.`;
      facts.replaceChildren(...[fact("roll", st.roll), fact("program", st.program), fact("batch", st.batch), fact("status", st.status), fact("balance", st.balance)].filter(Boolean));
      return true;
    };
    if (!fillHero()) {
      heroObserver = new MutationObserver(() => {
        if (fillHero()) { heroObserver.disconnect(); heroObserver = null; }
      });
      heroObserver.observe(shell, { childList: true, subtree: true });
    }

    const day = el("div", { class: "fx-day", "aria-live": "polite" }, el("p", { class: "fx-muted", text: t("loading") }));
    const todaySec = el("section", { class: "fx-today", "aria-labelledby": "fx-today-h" },
      el("div", { class: "fx-section-head" }, el("h2", { id: "fx-today-h", text: t("today") }), el("a", { href: "/WeeklyTimetable", text: t("viewWeek") })),
      day);

    const quick = el("div", { class: "fx-quick" }, PINNED.filter((p) => p.icon).map((p) =>
      el("a", { class: "fx-tile", href: p.path }, icon(p.icon), el("b", { text: t(p.key) }), el("span", { text: t(p.desc) }))));
    const quickSec = el("section", { "aria-labelledby": "fx-quick-h" }, el("div", { class: "fx-section-head" }, el("h2", { id: "fx-quick-h", text: t("quick") })), quick);

    const groups = el("div", { class: "fx-groups" }, readMenu().map((s, si) => el("div", { class: "fx-group" },
      s.title ? el("h3", { id: `fx-g-${si}`, text: s.title }) : null,
      el("ul", { "aria-labelledby": s.title ? `fx-g-${si}` : null }, s.items.map((it) => el("li", {},
        el("a", { href: it.href, target: it.external ? "_blank" : null, rel: it.external ? "noopener noreferrer" : null }, icon(it.icon), el("span", { text: it.label }))))))));
    const allSec = el("section", { "aria-labelledby": "fx-all-h" }, el("div", { class: "fx-section-head" }, el("h2", { id: "fx-all-h", text: t("all") })), groups);

    const home = el("div", { class: "fx-home fx-injected" }, hero, todaySec, quickSec, allSec);
    host.insertBefore(home, shell);
    loadDay(day);
  }

  /* ---------- Lịch hôm nay (đọc từ /WeeklyTimetable/WeekPartial, chỉ đọc) ---------- */
  async function fetchWeek(date) {
    const iso = isoDate(date);
    const key = `fx:week:${iso}`;
    try {
      const hit = JSON.parse(sessionStorage.getItem(key) || "null");
      if (hit && Date.now() - hit.t < 10 * 60 * 1000) return parseWeek(hit.html);
    } catch {}
    const res = await fetch(`/WeeklyTimetable/WeekPartial?referenceDate=${encodeURIComponent(iso)}`, {
      credentials: "same-origin",
      headers: { "X-Requested-With": "XMLHttpRequest" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), html })); } catch {}
    return parseWeek(html);
  }
  function parseWeek(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const year = new Date().getFullYear();
    return [...doc.querySelectorAll(".weekly-timetable-mobile-anchor")].map((sec) => {
      const head = sec.querySelector(".fw-semibold")?.textContent.trim() || "";
      const m = head.match(/\((\d{1,2})\/(\d{1,2})\)/);
      return {
        head,
        day: m ? +m[1] : null,
        month: m ? +m[2] : null,
        classes: [...sec.querySelectorAll(".weekly-timetable-mobile-card")].map(parseCard).filter((c) => c.start != null).sort((a, b) => a.start - b.start),
        year,
      };
    });
  }
  function parseCard(card) {
    const partOf = (iconCls) => card.querySelector(`i.${iconCls}`)?.parentElement || null;
    const txt = (n) => (n ? n.textContent.replace(/\s+/g, " ").trim() : "");
    const timeText = txt(partOf("ri-time-line"));
    const tm = timeText.match(/(\d{1,2})\s*[h:]\s*(\d{2})\s*-\s*(\d{1,2})\s*[h:]\s*(\d{2})/);
    const statusEl = card.querySelector(".position-absolute") || partOf("ri-checkbox-circle-line");
    const sc = statusEl?.className || "";
    const meetA = [...card.querySelectorAll("a[href]")].find((a) => /meet\.google|zoom|teams/i.test(a.getAttribute("href") || ""));
    return {
      slot: txt(card.querySelector(".weekly-timetable-mobile-card__slot")),
      course: txt(partOf("ri-book-open-line")),
      room: txt(partOf("ri-map-pin-line")).replace(/\.$/, ""),
      lecturer: txt(partOf("ri-user-line")),
      online: !!card.querySelector("i.ri-wifi-line"),
      meet: meetA ? safeHttp(meetA.getAttribute("href")) : null,
      status: txt(statusEl),
      tone: /success/.test(sc) ? "ok" : /danger/.test(sc) ? "bad" : /warning/.test(sc) ? "warn" : "",
      start: tm ? +tm[1] * 60 + +tm[2] : null,
      end: tm ? +tm[3] * 60 + +tm[4] : null,
      timeLabel: tm ? `${pad(tm[1])}:${tm[2]} – ${pad(tm[3])}:${tm[4]}` : timeText,
    };
  }
  const RAIL_START = 7 * 60;
  const RAIL_END = 22 * 60;
  const pct = (min) => `${((Math.min(Math.max(min, RAIL_START), RAIL_END) - RAIL_START) / (RAIL_END - RAIL_START)) * 100}%`;
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };

  async function loadDay(host) {
    const today = new Date();
    const firstClass = (days) => { for (const d of days) if (d.classes.length) return { d, c: d.classes[0] }; return null; };
    try {
      const week = await fetchWeek(today);
      const idx = week.findIndex((d) => d.day === today.getDate() && d.month === today.getMonth() + 1);
      const todays = idx >= 0 ? week[idx].classes : [];
      let next = null;
      // Chỉ cần "buổi tiếp theo" khi hôm nay không còn buổi nào phía trước
      if (!todays.some((c) => c.end > nowMin())) {
        next = firstClass(idx >= 0 ? week.slice(idx + 1) : []);
        if (!next) {
          const later = new Date(today);
          later.setDate(later.getDate() + 7);
          next = firstClass(await fetchWeek(later).catch(() => []));
        }
      }
      renderDay(host, todays, next);
    } catch {
      host.replaceChildren(el("p", { class: "fx-muted", text: t("loadError") }));
    }
  }
  function renderDay(host, classes, next) {
    const rail = el("div", { class: "fx-rail", "aria-hidden": "true" });
    for (let h = 7; h <= 21; h += 2) rail.append(el("div", { class: "fx-rail__tick", style: `left:${pct(h * 60)}` }, el("span", { text: `${pad(h)}:00` })));
    const now = nowMin();
    for (const c of classes) {
      const state = now >= c.end ? "is-past" : now >= c.start ? "is-now" : "";
      const left = pct(c.start);
      const width = `calc(${pct(c.end)} - ${left} - 4px)`;
      rail.append(el("a", { class: `fx-rail__block ${state}`, href: c.meet || "/WeeklyTimetable", target: c.meet ? "_blank" : null, rel: c.meet ? "noopener noreferrer" : null, tabindex: "-1", style: `left:${left};width:${width}` },
        el("b", { text: c.course.split(" - ")[0] || c.course }), el("small", { text: `${c.timeLabel}` }), el("small", { text: c.online ? t("online") : c.room })));
    }
    const nowLine = el("div", { class: "fx-rail__now" }, el("span", {}));
    const placeNow = () => {
      const m = nowMin();
      nowLine.hidden = m < RAIL_START || m > RAIL_END;
      nowLine.style.left = pct(m);
      nowLine.firstChild.textContent = `${t("now")} ${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
    };
    placeNow();
    clearInterval(nowTimer);
    nowTimer = setInterval(placeNow, 60 * 1000);
    rail.append(nowLine);
    if (!classes.length) rail.append(el("div", { class: "fx-rail__empty", text: t("noClass") }));

    const kids = [rail];
    if (classes.length) {
      kids.push(el("ul", { class: "fx-agenda" }, classes.map((c) => el("li", {},
        el("div", { class: "fx-agenda__time", text: c.timeLabel }, el("small", { text: `${t("slot")} ${c.slot}` })),
        el("div", { class: "fx-agenda__main" }, el("b", { text: c.course }), el("span", { text: [c.online ? t("online") : `${t("offline")}, ${c.room}`, c.lecturer].filter(Boolean).join(", ") })),
        el("div", { class: "fx-agenda__side" },
          c.status ? el("span", { class: `fx-status ${c.tone ? "is-" + c.tone : ""}`, text: c.status }) : null,
          c.meet ? el("a", { class: "fx-meet", href: c.meet, target: "_blank", rel: "noopener noreferrer", text: t("meet") }) : null)))));
    } else {
      kids.push(el("p", { class: "fx-muted fx-empty-mobile", text: t("noClass") }));
    }
    if (next && (!classes.length || classes.every((c) => c.end <= nowMin()))) {
      const d = new Date(next.d.year, next.d.month - 1, next.d.day);
      const when = new Intl.DateTimeFormat(locale(), { weekday: "long", day: "numeric", month: "numeric" }).format(d);
      kids.push(el("p", { class: "fx-next" }, `${t("next")} `, el("b", { text: next.c.course.split(" - ")[0] }),
        `, ${when}, ${next.c.timeLabel}, ${next.c.online ? t("online") : next.c.room}`));
    } else if (!classes.length && !next) {
      kids.push(el("p", { class: "fx-next", text: t("noUpcoming") }));
    }
    host.replaceChildren(...kids);
  }

  /* ---------------- Tinh chỉnh theo trang ---------------- */
  const pageSlug = () => location.pathname.toLowerCase().replace(/^\/+|\/+$/g, "").replace(/[^a-z0-9]+/g, "-") || "home";
  function decoratePage() {
    ROOT.classList.add(`fx-page-${pageSlug()}`);
    if (pageSlug() === "examschedule") markExams();
  }
  // Làm mờ các buổi thi đã qua và đánh dấu buổi thi gần nhất sắp tới
  function markExams() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let marked = false;
    document.querySelectorAll(".content-page table tbody tr").forEach((tr) => {
      const m = tr.cells[0]?.textContent.trim().match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (!m) return;
      const d = new Date(+m[3], +m[2] - 1, +m[1]);
      if (d < today) tr.classList.add("fx-row-past");
      else if (!marked) { tr.classList.add("fx-row-next"); marked = true; }
    });
  }
  function undecoratePage() {
    [...ROOT.classList].filter((c) => c.startsWith("fx-page-")).forEach((c) => ROOT.classList.remove(c));
    document.querySelectorAll(".fx-row-past, .fx-row-next").forEach((n) => n.classList.remove("fx-row-past", "fx-row-next"));
  }

  /* ---------------- Gắn / gỡ ---------------- */
  const isFapLayout = () => !!document.querySelector(".wrapper .content-page") && !!document.querySelector(".fap-topbar");
  function mount() {
    if (mounted || !settings.enabled) return;
    if (!isFapLayout()) { unmount(); return; }
    ROOT.classList.add("fapx");
    mounted = true;
    applyTheme();
    watchTheme();
    buildTopbar();
    applyTheme();
    decoratePage();
    if (isHome()) buildHome();
  }
  function unmount() {
    mounted = false;
    clearInterval(nowTimer);
    heroObserver?.disconnect();
    heroObserver = null;
    undecoratePage();
    themeObserver?.disconnect();
    document.querySelectorAll(".fx-injected").forEach((n) => n.remove());
    palette = null;
    ROOT.classList.remove("fapx", "fx-is-home");
    if ("fxOrigBsTheme" in ROOT.dataset) { ROOT.setAttribute("data-bs-theme", ROOT.dataset.fxOrigBsTheme); delete ROOT.dataset.fxOrigBsTheme; }
    delete ROOT.dataset.fxTheme;
  }
  function remount() { unmount(); menuCache = null; mount(); }

  // Gắn class sớm để tránh nháy giao diện cũ; gỡ lại ngay nếu bị tắt hoặc không phải trang FAP.
  ROOT.classList.add("fapx");
  const ready = new Promise((r) => (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", r, { once: true }) : r()));
  loadSettings().then(async (s) => {
    settings = s;
    if (!settings.enabled) { ROOT.classList.remove("fapx"); return; }
    ROOT.dataset.fxTheme = resolvedTheme();
    await ready;
    mount();
  });
  ready.then(() => { if (!isFapLayout() && !mounted) ROOT.classList.remove("fapx"); });

  document.addEventListener("keydown", onKey, true);

  if (globalThis.chrome && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes) => {
      const patch = {};
      for (const [k, v] of Object.entries(changes)) if (k in DEFAULTS) patch[k] = v.newValue;
      if (!Object.keys(patch).length) return;
      const prev = settings;
      settings = { ...settings, ...patch };
      if ("enabled" in patch) { settings.enabled ? ready.then(mount) : unmount(); return; }
      if ("lang" in patch && patch.lang !== prev.lang) { remount(); return; }
      if ("theme" in patch) applyTheme();
    });
  }
})();
