/* ==========================
   WORK DETAIL LOGIC ONLY
   - work.html 전용
   - 데이터는 workdata.js에서만 관리
   - PC / MO 반응형 상세 이미지 자동 처리
========================== */

/** ---------- Helpers ---------- */
function qs(sel, el = document) {
  return el.querySelector(sel);
}

function getQueryId() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("id") || "").trim();
}

/** ---------- Back Button ---------- */
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

/** ---------- Top Button ---------- */
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

/** ---------- Media Factory ---------- */
function createMediaNode(item) {
  if (!item || !item.type) return null;

  if (item.type === "video") {
    const video = document.createElement("video");
    video.className = "workFullMedia";
    video.src = item.src;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    return video;
  }

  if (item.type === "gif") {
    const gif = document.createElement("img");
    gif.className = "workFullImage";
    gif.src = item.src;
    gif.alt = item.alt || "";
    gif.loading = "lazy";
    return gif;
  }

  if (item.type === "responsive-image") {
    const picture = document.createElement("picture");

    if (item.mo) {
      const source = document.createElement("source");
      source.media = "(max-width: 768px)";
      source.srcset = item.mo;
      picture.appendChild(source);
    }

    const img = document.createElement("img");
    img.className = "workFullImage";
    img.src = item.pc || item.mo || "";
    img.alt = item.alt || "";
    img.loading = "lazy";

    picture.appendChild(img);
    return picture;
  }

  if (item.type === "image") {
    const img = document.createElement("img");
    img.className = "workFullImage";
    img.src = item.src;
    img.alt = item.alt || "";
    img.loading = "lazy";
    return img;
  }

  return null;
}

/** ---------- Render Detail ---------- */
function renderWorkDetail() {
  const id = getQueryId();

  if (!Array.isArray(window.workDetailData)) {
    console.error("workDetailData not found. Check workdata.js load order.");
    return;
  }

  const work = window.workDetailData.find((item) => item.id === id);

  if (!work) {
    document.body.innerHTML = `
      <main style="padding:40px;font-family:'Pretendard Variable', Pretendard, system-ui, sans-serif;background:#FCFCFC;min-height:100vh;">
        <p style="margin:0 0 12px;font-size:20px;font-weight:700;">작업 정보를 찾을 수 없습니다.</p>
        <a href="./index.html#portfolio" style="color:#111;text-decoration:underline;">포트폴리오로 돌아가기</a>
      </main>
    `;
    return;
  }

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

  const colorWrap = qs("#workColors");
  if (colorWrap) {
    colorWrap.innerHTML = "";

    (work.colors || []).forEach((color) => {
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

  const detailWrap = qs("#workFullImageWrap");
  if (detailWrap) {
    detailWrap.innerHTML = "";

    (work.detailMedia || []).forEach((media) => {
      const node = createMediaNode(media);
      if (node) detailWrap.appendChild(node);
    });
  }
}

/** ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initBackButton();
  initTopButton();
  renderWorkDetail();
});