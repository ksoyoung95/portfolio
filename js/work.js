/* ==========================
   WORK DETAIL LOGIC ONLY
   - work.html 전용
   - 데이터는 workdata.js에서만 관리
   - PC / MO 반응형 상세 이미지 자동 처리
   - mp4 영상 클릭 재생 지원
   - hideColor / hideDetailTitle 옵션 지원
========================== */

/** =====================================================
    01. Helpers
===================================================== */
function qs(sel, el = document) {
  return el.querySelector(sel);
}

function getQueryId() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("id") || "").trim();
}

function isArrayWithItems(value) {
  return Array.isArray(value) && value.length > 0;
}

/** =====================================================
    02. Header Controls
===================================================== */
function initBackButton() {
  const backBtn = qs("#backBtn");
  if (!backBtn) return;

  backBtn.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "./index.html#portfolio";
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

/** =====================================================
    03. Media Factory
===================================================== */
function createImageNode(src, altText) {
  const img = document.createElement("img");
  img.className = "workFullImage";
  img.src = src;
  img.alt = altText || "";
  img.loading = "lazy";
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

  return picture;
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

  const playButton = document.createElement("button");
  playButton.type = "button";
  playButton.className = "workVideoPlayButton";
  playButton.setAttribute("aria-label", "영상 재생");

  playButton.innerHTML = `
    <span class="workVideoPlayIcon" aria-hidden="true"></span>
  `;

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

  video.addEventListener("pause", () => {
    if (!video.ended && video.currentTime > 0) return;
  });

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

    case "image":
      return createImageNode(item.src, item.alt || "");

    case "gif":
      return createImageNode(item.src, item.alt || "");

    case "video":
      return createVideoNode(item);

    default:
      return null;
  }
}

/** =====================================================
    04. Basic Text Render
===================================================== */
function renderTextContent(work) {
  const categoryEl = qs("#workCategory");
  const clientEl = qs("#workClient");
  const titleEl = qs("#workTitle");
  const roleEl = qs("#workRole");
  const contributionEl = qs("#workContribution");
  const toolsEl = qs("#workTools");

  if (categoryEl) categoryEl.textContent = work.category || "";
  if (clientEl) clientEl.textContent = work.client || "";
  if (titleEl) titleEl.textContent = work.title || "";
  if (roleEl) roleEl.textContent = work.role || "";
  if (contributionEl) contributionEl.textContent = work.contribution || "";
  if (toolsEl) toolsEl.textContent = work.tools || "";
}

/** =====================================================
    05. Color Section Render
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

/** =====================================================
    06. Detail Title Render
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

/** =====================================================
    07. Detail Media Render
===================================================== */
function renderDetailMedia(work) {
  const detailWrap = qs("#workFullImageWrap");
  if (!detailWrap) return;

  detailWrap.innerHTML = "";

  (work.detailMedia || []).forEach((media) => {
    const node = createMediaNode(media);
    if (node) detailWrap.appendChild(node);
  });
}

/** =====================================================
    08. Not Found Render
===================================================== */
function renderWorkNotFound() {
  document.body.innerHTML = `
    <main style="padding:40px;font-family:'Pretendard Variable', Pretendard, system-ui, sans-serif;background:#FCFCFC;min-height:100vh;">
      <p style="margin:0 0 12px;font-size:20px;font-weight:700;">작업 정보를 찾을 수 없습니다.</p>
      <a href="./index.html#portfolio" style="color:#111;text-decoration:underline;">포트폴리오로 돌아가기</a>
    </main>
  `;
}

/** =====================================================
    09. Work Render
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
  renderDetailMedia(work);
}

/** =====================================================
    10. Init
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initBackButton();
  initTopButton();
  renderWorkDetail();
});