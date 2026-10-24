/* ==========================
   WORK DETAIL LOGIC ONLY
   - 일반 상세 이미지 / 영상 / 탭형 상세페이지 모두 지원
   - layout: "contained" 지원
   - 탭 접근성(키보드 이동) + 탭 상태 URL 저장(?tab=)
   - 이전/다음 프로젝트 이동
========================== */

/* =====================================================
   01. Helpers
===================================================== */
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

function getQueryId() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("id") || "").trim();
}

function getQueryTab() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("tab") || "").trim();
}

function isArrayWithItems(value) {
  return Array.isArray(value) && value.length > 0;
}

/* "[현대디에프]" → "현대디에프" (데이터에 대괄호가 있어도 화면엔 깔끔하게) */
function stripBrackets(text) {
  return String(text || "").replace(/^\s*\[(.*)\]\s*$/, "$1").trim();
}

function getListUrl() {
  let search = "";
  try {
    search = sessionStorage.getItem("portfolioListSearch") || "";
  } catch (err) {
    /* 무시 */
  }
  return `./index.html${search}#portfolio`;
}

/* =====================================================
   02. UI Controls
===================================================== */
function initBackButton() {
  const backBtn = qs("#backBtn");
  const listLink = qs("#listLink");

  if (listLink) listLink.setAttribute("href", getListUrl());
  if (!backBtn) return;

  backBtn.addEventListener("click", () => {
    let ref = null;
    try {
      ref = document.referrer ? new URL(document.referrer) : null;
    } catch (err) {
      ref = null;
    }

    // 내 사이트의 목록에서 왔을 때만 history.back (외부 링크/다른 작업에서 왔으면 목록으로 이동)
    const fromOwnList =
      ref && ref.origin === window.location.origin && !/work\.html$/.test(ref.pathname);

    if (fromOwnList && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = getListUrl();
    }
  });
}

function initTopButton() {
  const topBtn = qs("#workTopBtn");
  if (!topBtn) return;

  const toggle = () => {
    if (window.scrollY > 300) {
      topBtn.classList.add("show");
    } else {
      topBtn.classList.remove("show");
    }
  };

  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
}

/* =====================================================
   03. Media Factory
===================================================== */
function wrapMediaLayout(node, layout) {
  if (layout !== "contained") return node;

  const outer = document.createElement("div");
  outer.className = "workMediaContained";
  outer.appendChild(node);
  return outer;
}

function createImageNode(src, altText) {
  const img = document.createElement("img");
  img.className = "workFullImage";
  img.src = src;
  img.alt = altText || "";
  img.loading = "lazy";
  img.decoding = "async";
  return img;
}

function createResponsiveImageNode(item) {
  const picture = document.createElement("picture");

  if (item.mo) {
    const source = document.createElement("source");
    source.media = "(max-width: 768px)";
    source.srcset = item.mo;
    picture.appendChild(source);
  }

  const img = createImageNode(item.pc || item.mo || "", item.alt || "");
  picture.appendChild(img);

  return wrapMediaLayout(picture, item.layout);
}

function createVideoNode(item) {
  const outer = document.createElement("div");
  outer.className = "workVideoOuter";

  const wrap = document.createElement("div");
  wrap.className = "workVideoWrap";

  const video = document.createElement("video");
  video.className = "workFullMedia";
  video.src = item.src;
  video.playsInline = true;
  video.preload = "metadata";
  video.controls = false;
  video.setAttribute("aria-label", item.alt || "포트폴리오 영상");

  // workdata.js 영상 항목에 poster: "경로" 를 넣으면 재생 전 썸네일로 사용됩니다.
  if (item.poster) video.poster = item.poster;

  const playButton = document.createElement("button");
  playButton.type = "button";
  playButton.className = "workVideoPlayButton";
  playButton.setAttribute("aria-label", "영상 재생");
  playButton.innerHTML = `<span class="workVideoPlayIcon" aria-hidden="true"></span>`;

  const startPlay = async () => {
    try {
      playButton.style.display = "none";
      video.controls = true;
      await video.play();
    } catch (error) {
      console.error("Video play failed:", error);
      playButton.style.display = "";
      video.controls = false;
    }
  };

  playButton.addEventListener("click", startPlay);

  video.addEventListener("ended", () => {
    playButton.style.display = "";
    video.controls = false;
    video.currentTime = 0;
  });

  wrap.appendChild(video);
  wrap.appendChild(playButton);
  outer.appendChild(wrap);

  return outer;
}

function createMediaNode(item) {
  if (!item || !item.type) return null;

  switch (item.type) {
    case "responsive-image":
      return createResponsiveImageNode(item);

    case "image": {
      const img = createImageNode(item.src, item.alt || "");
      return wrapMediaLayout(img, item.layout);
    }

    case "gif": {
      const img = createImageNode(item.src, item.alt || "");
      return wrapMediaLayout(img, item.layout);
    }

    case "video":
      return createVideoNode(item);

    default:
      return null;
  }
}

/* 첫 화면에 보이는 첫 이미지는 lazy 로딩하지 않음 */
function eagerFirstImage(wrap) {
  const first = qs("img", wrap);
  if (first) first.loading = "eager";
}

/* =====================================================
   04. Text Render
===================================================== */
function renderTextContent(work) {
  const categoryEl = qs("#workCategory");
  const clientEl = qs("#workClient");
  const titleEl = qs("#workTitle");
  const subTextEl = qs("#workSubText");
  const roleEl = qs("#workRole");
  const contributionEl = qs("#workContribution");
  const toolsEl = qs("#workTools");

  const cleanTitle = stripBrackets(work.title);

  if (categoryEl) categoryEl.textContent = work.category || "";
  if (clientEl) clientEl.textContent = stripBrackets(work.client);
  if (titleEl) titleEl.textContent = cleanTitle;

  // 탭 제목 / 공유 시 제목을 프로젝트명으로
  if (cleanTitle) document.title = `${cleanTitle} | 강소영 포트폴리오`;

  if (subTextEl) {
    if (work.subText) {
      subTextEl.textContent = work.subText;
      subTextEl.style.display = "block";
    } else {
      subTextEl.textContent = "";
      subTextEl.style.display = "none";
    }
  }

  if (roleEl) roleEl.textContent = work.role || "";
  if (contributionEl) contributionEl.textContent = work.contribution || "";
  if (toolsEl) toolsEl.textContent = work.tools || "";
}

/* =====================================================
   05. Color Render
===================================================== */
function shouldHideColorSection(work) {
  if (work.hideColor === true) return true;
  if (!isArrayWithItems(work.colors)) return true;
  return false;
}

function renderColorSection(work) {
  const colorSection = qs(".workColorSection");
  const colorWrap = qs("#workColors");

  if (!colorSection || !colorWrap) return;

  const hideColor = shouldHideColorSection(work);

  if (hideColor) {
    colorSection.style.display = "none";
    colorWrap.innerHTML = "";
    return;
  }

  colorSection.style.display = "";
  colorWrap.innerHTML = "";

  work.colors.forEach((color) => {
    const item = document.createElement("div");
    item.className = "workColorItem";

    const dot = document.createElement("span");
    dot.className = "workColorDot";
    dot.style.background = color;

    const code = document.createElement("span");
    code.className = "workColorCode";
    code.textContent = color;

    item.appendChild(dot);
    item.appendChild(code);
    colorWrap.appendChild(item);
  });
}

/* =====================================================
   06. Default Detail Render
===================================================== */
function renderDetailTitle(work) {
  const titleWrap = qs(".workImageContainer");
  const titleText = qs(".workDetailImageTitle");

  if (work.hideDetailTitle === true) {
    if (titleWrap) titleWrap.style.display = "none";
    if (titleText) titleText.style.display = "none";
  } else {
    if (titleWrap) titleWrap.style.display = "";
    if (titleText) titleText.style.display = "";
  }
}

/* 일반 상세 이미지가 없는 작업(탭형)은 섹션 자체를 숨겨 불필요한 빈 여백 제거 */
function renderDetailSection(work) {
  const section = qs(".workImageSection");
  if (!section) return;
  section.hidden = !isArrayWithItems(work.detailMedia);
}

function renderDetailMedia(work) {
  const detailWrap = qs("#workFullImageWrap");
  if (!detailWrap) return;

  detailWrap.innerHTML = "";

  (work.detailMedia || []).forEach((media) => {
    const node = createMediaNode(media);
    if (node) detailWrap.appendChild(node);
  });

  eagerFirstImage(detailWrap);
}

/* =====================================================
   07. Tab Type Render
===================================================== */
function toggleTabLayout(isVisible) {
  const heroSection = qs("#workHeroSection");
  const tabSection = qs("#workTabSection");
  const tabContentSection = qs("#workTabContentSection");

  if (!heroSection || !tabSection || !tabContentSection) return;

  heroSection.classList.toggle("isVisible", isVisible);
  tabSection.classList.toggle("isVisible", isVisible);
  tabContentSection.classList.toggle("isVisible", isVisible);
}

function renderHeroMedia(work) {
  const heroWrap = qs("#workHeroWrap");
  if (!heroWrap) return;

  heroWrap.innerHTML = "";

  (work.heroMedia || []).forEach((media) => {
    const node = createMediaNode(media);
    if (node) heroWrap.appendChild(node);
  });

  eagerFirstImage(heroWrap);
}

function renderTabContent(tab) {
  const contentWrap = qs("#workTabContent");
  if (!contentWrap) return;

  contentWrap.innerHTML = "";

  (tab.media || []).forEach((media) => {
    const node = createMediaNode(media);
    if (node) contentWrap.appendChild(node);
  });
}

/* 탭 활성화: 표시 상태 / ARIA / 콘텐츠 교체 / URL / 스크롤 보정 */
function setActiveTab(work, tabId, options = {}) {
  const { fromUser = false, focus = false } = options;

  const tabNav = qs("#workTabNav");
  const tabSection = qs("#workTabSection");
  const contentSection = qs("#workTabContentSection");
  const panel = qs("#workTabContent");
  const sections = work.tabSections || [];

  const target = sections.find((tab) => tab.id === tabId) || sections[0];
  if (!target || !tabNav || !panel) return;

  qsa(".workTabButton", tabNav).forEach((btn) => {
    const on = btn.dataset.tabId === target.id;

    btn.classList.toggle("isActive", on);
    btn.setAttribute("aria-selected", String(on));
    btn.tabIndex = on ? 0 : -1;

    if (on) {
      panel.setAttribute("aria-labelledby", btn.id);
      if (focus) btn.focus();
      if (fromUser) btn.scrollIntoView({ block: "nearest", inline: "center" });
    }
  });

  renderTabContent(target);

  if (!fromUser) return;

  // 선택한 탭을 주소에 기록 (공유/새로고침 시 같은 탭이 열림)
  const url = new URL(window.location.href);
  url.searchParams.set("tab", target.id);
  window.history.replaceState(null, "", url);

  // 긴 이미지를 보다가 탭을 바꿨다면 새 콘텐츠의 시작 위치로 이동
  const isSticky = tabSection && window.getComputedStyle(tabSection).position === "sticky";
  const ref = isSticky ? contentSection : tabSection;
  const offset = isSticky ? tabSection.offsetHeight : 0;

  if (ref) {
    const top = ref.getBoundingClientRect().top;
    if (top < offset) {
      window.scrollTo({ top: window.scrollY + top - offset, behavior: "smooth" });
    }
  }
}

function renderTabNav(work) {
  const tabNav = qs("#workTabNav");
  const tabSection = qs("#workTabSection");
  const panel = qs("#workTabContent");
  if (!tabNav || !tabSection) return;

  const sections = work.tabSections || [];

  tabSection.classList.remove("isHyundayTab", "isBeautyTab");
  tabSection.classList.add(work.tabStyle === "beauty" ? "isBeautyTab" : "isHyundayTab");

  tabNav.setAttribute("role", "tablist");
  tabNav.setAttribute("aria-label", "상세 카테고리");
  if (panel) panel.setAttribute("role", "tabpanel");

  tabNav.innerHTML = sections.map((tab) => `
    <button
      class="workTabButton"
      type="button"
      role="tab"
      id="tabBtn-${esc(tab.id)}"
      data-tab-id="${esc(tab.id)}"
      aria-controls="workTabContent"
      aria-selected="false"
      tabindex="-1">
      ${
        work.tabStyle === "beauty"
          ? `
            <span class="workTabTopLabel">${esc(tab.topLabel || "")}</span>
            <span class="workTabMainLabel">${esc(tab.label)}</span>
          `
          : `
            <span class="workTabSingleLabel">${esc(tab.label)}</span>
          `
      }
    </button>
  `).join("");

  // 첫 렌더: ?tab= 값이 있으면 그 탭, 없으면 첫 번째 탭
  setActiveTab(work, getQueryTab());

  tabNav.onclick = (e) => {
    const btn = e.target.closest("[data-tab-id]");
    if (!btn) return;
    setActiveTab(work, btn.dataset.tabId, { fromUser: true });
  };

  // 키보드: ← → Home End 로 탭 이동
  tabNav.onkeydown = (e) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;

    const buttons = qsa(".workTabButton", tabNav);
    const current = buttons.indexOf(document.activeElement);
    if (current < 0) return;

    e.preventDefault();

    let next = current;
    if (e.key === "ArrowRight") next = (current + 1) % buttons.length;
    if (e.key === "ArrowLeft") next = (current - 1 + buttons.length) % buttons.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = buttons.length - 1;

    setActiveTab(work, buttons[next].dataset.tabId, { fromUser: true, focus: true });
  };
}

function renderTabTypeWork(work) {
  const hasTabType = isArrayWithItems(work.heroMedia) && isArrayWithItems(work.tabSections);

  toggleTabLayout(hasTabType);

  if (!hasTabType) return;

  renderHeroMedia(work);
  renderTabNav(work);
}

/* =====================================================
   08. Prev / Next
===================================================== */
function renderPager(work) {
  const pager = qs("#workPager");
  if (!pager) return;

  const list = window.workDetailData;

  if (!Array.isArray(list) || list.length < 2) {
    pager.hidden = true;
    return;
  }

  const index = list.findIndex((item) => item.id === work.id);
  const prev = list[(index - 1 + list.length) % list.length];
  const next = list[(index + 1) % list.length];

  const link = (item, cls, label) => `
    <a class="workPagerLink ${cls}" href="./work.html?id=${encodeURIComponent(item.id)}">
      <span class="workPagerLabel">${label}</span>
      <strong class="workPagerTitle">${esc(stripBrackets(item.title))}</strong>
    </a>`;

  pager.innerHTML =
    link(prev, "isPrev", "← 이전 프로젝트") +
    link(next, "isNext", "다음 프로젝트 →");
}

/* =====================================================
   09. Fallback
===================================================== */
function renderWorkNotFound() {
  document.title = "작업을 찾을 수 없습니다 | 강소영 포트폴리오";
  document.body.innerHTML = `
    <main style="padding:40px;font-family:'Pretendard Variable', Pretendard, system-ui, sans-serif;background:#FCFCFC;min-height:100vh;">
      <p style="margin:0 0 12px;font-size:20px;font-weight:700;">작업 정보를 찾을 수 없습니다.</p>
      <a href="${getListUrl()}" style="color:#111;text-decoration:underline;">포트폴리오로 돌아가기</a>
    </main>
  `;
}

/* =====================================================
   10. Main Render
===================================================== */
function renderWorkDetail() {
  const id = getQueryId();

  if (!Array.isArray(window.workDetailData)) {
    console.error("workDetailData not found. Check workdata.js load order.");
    return;
  }

  const work = window.workDetailData.find((item) => item.id === id);

  if (!work) {
    renderWorkNotFound();
    return;
  }

  renderTextContent(work);
  renderColorSection(work);
  renderDetailTitle(work);
  renderDetailSection(work);
  renderDetailMedia(work);
  renderTabTypeWork(work);
  renderPager(work);
}

/* =====================================================
   11. Init
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initBackButton();
  initTopButton();
  renderWorkDetail();
});
