/* ==========================
   MAIN PAGE LOGIC
   - index.html 전용
   - 전체 탭: SHUFFLE_ALL 값에 따라 랜덤 / 고정 순서
   - 필터·더보기 상태는 URL(?cat=…&n=…)에 저장 → 상세에서 돌아와도 유지
   - tool / contribution 은 workdata.js(상세 데이터)를 단일 출처로 사용
========================== */

/** ---------- Config ---------- */
const SHUFFLE_ALL = true; // true: '전체' 탭 랜덤 노출 / false: data.js 순서 고정
const PAGE_SIZE = 6;
const CATEGORY_LABEL = {
  detail: "홈페이지",
  uiux: "홈페이지",
  ads: "광고",
  video: "영상",
  editorial: "편집디자인"
};

/** ---------- Helpers ---------- */
function qs(sel, el = document) {
  return el.querySelector(sel);
}

function qsa(sel, el = document) {
  return [...el.querySelectorAll(sel)];
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

function shuffleArray(array) {
  const copied = [...array];

  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }

  return copied;
}

/** ---------- Modal (포커스 관리 포함) ---------- */
let lastFocusedEl = null;

function openModal(modalEl) {
  if (!modalEl) return;
  lastFocusedEl = document.activeElement;
  modalEl.classList.add("isOpen");
  modalEl.setAttribute("aria-hidden", "false");
  document.body.classList.add("modalOpen");

  const closeBtn = qs(".careerModalClose", modalEl);
  if (closeBtn) closeBtn.focus();
}

function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove("isOpen");
  modalEl.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modalOpen");

  if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
    lastFocusedEl.focus();
  }
  lastFocusedEl = null;
}

function trapFocus(e, modalEl) {
  if (e.key !== "Tab") return;

  const dialog = qs(".careerModalDialog", modalEl);
  if (!dialog) return;

  const focusables = qsa(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    dialog
  );

  if (!focusables.length) {
    e.preventDefault();
    dialog.focus();
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function wireModalClose(modalEl) {
  if (!modalEl) return;

  modalEl.addEventListener("click", (e) => {
    if (e.target.closest("[data-close='true']")) {
      closeModal(modalEl);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!modalEl.classList.contains("isOpen")) return;

    if (e.key === "Escape") {
      closeModal(modalEl);
      return;
    }

    trapFocus(e, modalEl);
  });
}

/** ---------- Mobile Nav ---------- */
function initMobileNav() {
  const toggleBtn = qs(".navToggle");
  const mobileNav = qs(".mobileNav");

  if (!toggleBtn || !mobileNav) return;

  const setOpen = (open) => {
    toggleBtn.setAttribute("aria-expanded", String(open));
    toggleBtn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    mobileNav.hidden = !open;
  };

  toggleBtn.addEventListener("click", () => {
    const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
    setOpen(!expanded);
  });

  mobileNav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !mobileNav.hidden) {
      setOpen(false);
      toggleBtn.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (mobileNav.hidden) return;
    if (e.target.closest(".navToggle") || e.target.closest(".mobileNav")) return;
    setOpen(false);
  });

  // 화면이 데스크톱 폭이 되면 모바일 메뉴는 닫기
  const mq = window.matchMedia("(min-width: 769px)");
  const onChange = () => {
    if (mq.matches) setOpen(false);
  };
  if (mq.addEventListener) mq.addEventListener("change", onChange);
}

/** ---------- Active Nav (현재 위치 표시) ---------- */
function initActiveNav() {
  const links = qsa(".navLink, .mobileNavLink");
  const targets = ["about", "portfolio", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!links.length || !targets.length || !("IntersectionObserver" in window)) return;

  const setActive = (id) => {
    links.forEach((a) => {
      if (a.getAttribute("href") === "#" + id) {
        a.setAttribute("aria-current", "true");
      } else {
        a.removeAttribute("aria-current");
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  targets.forEach((el) => observer.observe(el));

  window.addEventListener(
    "scroll",
    () => {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

      if (window.scrollY < 200) {
        setActive("home");
      } else if (atBottom) {
        setActive("contact");
      }
    },
    { passive: true }
  );

  setActive("home");
}

/** ---------- Career Render ---------- */
function renderCareers() {
  const grid = qs("#careerGrid");
  if (!grid || !Array.isArray(window.careerData)) return;

  grid.innerHTML = window.careerData.map((c) => `
    <button class="careerMiniItem" type="button" data-career-id="${esc(c.id)}" aria-haspopup="dialog">
      <div class="careerMiniTop">
        <div class="careerMiniCompany">${esc(c.company)}</div>
        <span class="careerMiniTag">${esc(c.tag)}</span>
      </div>
      <div class="careerMiniPeriod">${esc(c.period)}</div>
    </button>
  `).join("");
}

/** ---------- Career Modal ---------- */
function initCareerModal() {
  const modal = qs("#careerModal");
  const grid = qs("#careerGrid");

  if (!modal || !grid || !Array.isArray(window.careerData)) return;

  wireModalClose(modal);

  grid.addEventListener("click", (e) => {
    const card = e.target.closest("[data-career-id]");
    if (!card) return;

    const item = window.careerData.find((c) => c.id === card.dataset.careerId);
    if (!item) return;

    qs("#careerModalTitle").textContent = item.company;
    qs("#careerModalTag").textContent = item.tag;
    qs("#careerModalPeriod").textContent = item.period;
    qs("#careerModalTasks").innerHTML = (item.tasks || [])
      .map((task) => `<li>${esc(String(task).trim())}</li>`)
      .join("");

    openModal(modal);
  });
}

/** ---------- Portfolio ---------- */
let activeFilter = "all";
let visibleCount = PAGE_SIZE;
let shuffledAllWorks = [];
let detailMap = new Map();

function buildDetailMap() {
  const list = Array.isArray(window.workDetailData) ? window.workDetailData : [];
  detailMap = new Map(list.map((d) => [d.id, d]));
}

function getValidWorks() {
  if (!Array.isArray(window.portfolioData)) return [];

  return window.portfolioData.filter((w) => {
    return w.id && w.title && w.desc && w.thumb;
  });
}

/** 대표 프로젝트: 시안 상단에 고정 배치, 기존 상세페이지 데이터 연결 */
function renderFeatured() {
  const grid = qs("#featuredGrid");
  if (!grid) return;

  const featuredIds = ["hyundai-hyunday", "beauty-freeweek", "hyundai-aibeauty"];
  const works = getValidWorks();
  grid.innerHTML = featuredIds.map((id) => {
    const work = works.find((w) => w.id === id);
    if (!work) return "";
    const detail = detailMap.get(id) || {};
    return `
      <a class="featuredCard" href="work.html?id=${encodeURIComponent(id)}">
        <div class="featuredThumb"><img src="${esc(work.thumb)}" alt="${esc(work.title)} 대표 이미지" /></div>
        <h3 class="featuredTitle">${esc(work.title.replace(/^\[[^\]]+\]\s*/, ""))}</h3>
        <p class="featuredDesc">${esc(work.desc)}</p>
        <span class="featuredMeta">${esc(CATEGORY_LABEL[work.category] || work.category)} · ${esc(detail.client || "프로젝트")}</span>
      </a>`;
  }).join("");
}

function resetAllShuffle() {
  shuffledAllWorks = shuffleArray(getValidWorks());
}

function getFilteredWorks() {
  const validWorks = getValidWorks();

  if (activeFilter === "all") {
    if (!SHUFFLE_ALL) return validWorks;

    if (!shuffledAllWorks.length) {
      shuffledAllWorks = shuffleArray(validWorks);
    }
    return shuffledAllWorks;
  }

  // 기존 상세페이지·UI 작업은 새 홈페이지 카테고리에 함께 표시
  if (activeFilter === "uiux") return validWorks.filter((w) => ["uiux", "detail"].includes(w.category));
  return validWorks.filter((w) => w.category === activeFilter);
}

/* --- 상태를 URL에 저장 / 복원 --- */
function readStateFromURL() {
  const params = new URLSearchParams(window.location.search);

  const cat = params.get("cat");
  const usableTab = qsa(".tab").find((t) => t.dataset.filter === cat && !t.hidden);
  if (usableTab) activeFilter = cat;

  const n = parseInt(params.get("n"), 10);
  if (n > 0) {
    visibleCount = Math.min(Math.max(PAGE_SIZE, Math.ceil(n / PAGE_SIZE) * PAGE_SIZE), 200);
  }
}

function writeStateToURL() {
  const params = new URLSearchParams(window.location.search);

  if (activeFilter === "all") params.delete("cat");
  else params.set("cat", activeFilter);

  if (visibleCount === PAGE_SIZE) params.delete("n");
  else params.set("n", String(visibleCount));

  const query = params.toString();
  const search = query ? "?" + query : "";

  history.replaceState(null, "", window.location.pathname + search + window.location.hash);

  // 상세 페이지의 '뒤로가기'가 목록 상태를 복원할 수 있도록 저장
  try {
    sessionStorage.setItem("portfolioListSearch", search);
  } catch (err) {
    /* 저장소를 못 쓰는 환경이면 무시 */
  }
}

function setActiveTab(filter) {
  qsa(".tab").forEach((tab) => {
    const on = tab.dataset.filter === filter;
    tab.classList.toggle("isActive", on);
    tab.setAttribute("aria-pressed", String(on));
  });
}

function renderPortfolio(focusIndex = -1) {
  const grid = qs("#workGrid");
  const loadMoreBtn = qs("#loadMoreBtn");
  const status = qs("#portfolioStatus");
  if (!grid) return;

  const filtered = getFilteredWorks();
  const visibleWorks = filtered.slice(0, visibleCount);

  if (!filtered.length) {
    grid.innerHTML = `<p class="emptyState">아직 등록된 작업이 없습니다.</p>`;
    if (loadMoreBtn) loadMoreBtn.hidden = true;
    if (status) status.textContent = "표시할 작업이 없습니다.";
    return;
  }

  grid.innerHTML = visibleWorks.map((w) => {
    const detail = detailMap.get(w.id) || {};
    const label = CATEGORY_LABEL[w.category] || "";

    return `
    <a class="workCard" href="work.html?id=${encodeURIComponent(w.id)}">
      <div class="workThumb">
        <img src="${esc(w.thumb)}" alt="${esc(w.title)} 썸네일" loading="lazy" decoding="async" />
      </div>
      <h3 class="workTitle">${esc(w.title)}</h3>
      <p class="workDesc">${esc(w.desc)}</p>
      <div class="workMeta">${esc(label || "프로젝트")} · ${esc(detail.client || w.type || "디자인")}</div>
    </a>`;
  }).join("");

  if (loadMoreBtn) {
    loadMoreBtn.hidden = visibleCount >= filtered.length;
    const label = qs("span", loadMoreBtn);
    if (label) label.textContent = `더 보기 (${visibleWorks.length}/${filtered.length})`;
  }

  if (status) {
    status.textContent = `총 ${filtered.length}개 중 ${visibleWorks.length}개 표시 중`;
  }

  // '더 보기' 뒤에는 새로 나타난 첫 카드로 포커스 이동
  if (focusIndex >= 0 && grid.children[focusIndex]) {
    grid.children[focusIndex].focus({ preventScroll: false });
  }
}

function initPortfolio() {
  const tabs = qsa(".tab");

  // 빈 카테고리도 노출하고, 선택 시 빈 목록 안내 표시
  tabs.forEach((btn) => { btn.hidden = false; });

  readStateFromURL();
  setActiveTab(activeFilter);

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter;
      visibleCount = PAGE_SIZE;

      setActiveTab(activeFilter);

      writeStateToURL();
      renderPortfolio();
    });
  });

  qs("#loadMoreBtn")?.addEventListener("click", () => {
    const prevCount = visibleCount;
    visibleCount += PAGE_SIZE;
    writeStateToURL();
    renderPortfolio(prevCount);
  });

  if (SHUFFLE_ALL) resetAllShuffle();
  renderPortfolio();
}

/** ---------- Top Button ---------- */
function initTopButton() {
  const topBtn = qs(".floatingTop");
  if (!topBtn) return;

  const toggleTopButton = () => {
    if (window.scrollY > 400) {
      topBtn.classList.add("show");
    } else {
      topBtn.classList.remove("show");
    }
  };

  window.addEventListener("scroll", toggleTopButton, { passive: true });
  toggleTopButton();
}

/** ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  buildDetailMap();
  renderFeatured();

  initMobileNav();
  initActiveNav();
  renderCareers();
  initCareerModal();
  initPortfolio();
  initTopButton();
});
