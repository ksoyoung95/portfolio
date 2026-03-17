/* ==========================
   WORK DETAIL DATA ONLY
   - work.html 전용 데이터
   - 상세 페이지 수정은 여기서만
   - PC / MO 상세 이미지 분리 관리
========================== */

/*
추가 템플릿
{
  id: "project-id",
  category: "E-commerce / Promotion",
  client: "[클라이언트명]",
  title: "프로젝트 제목",
  role: "Detailed Page, Graphic",
  contribution: "100%",
  tools: "PS / FIGMA",
  colors: ["#000000", "#FFFFFF"],
  detailMedia: [
    {
      type: "responsive-image",
      pc: "./images/portfilo/detail_page/pc_detail_xxx.jpg",
      mo: "./images/portfilo/detail_page/mo_detail_xxx.jpg",
      alt: "프로젝트 상세 이미지 설명"
    }
  ]
}
*/

const workDetailData = [
  {
    id: "hyundai-jejuair",
    category: "E-commerce / Promotion",
    client: "[현대디에프]",
    title: "현대디에프 제주항공 프로모션 이벤트",
    role: "Detailed Page, Graphic",
    contribution: "100%",
    tools: "PS / FIGMA",
    colors: ["#2B83D0", "#EF7F0E", "#E8A170", "#F93C1C"],
    detailMedia: [
      {
        type: "responsive-image",
        pc: "./images/portfilo/detail_page/pc_detail_jeju_air.jpg",
        mo: "./images/portfilo/detail_page/mo_detail_jeju_air.jpg",
        alt: "현대디에프 제주항공 프로모션 이벤트 상세 이미지"
      }
    ]
  },

  {
    id: "hyundai-newsub",
    category: "E-commerce / Promotion",
    client: "[현대디에프]",
    title: "현대디에프 신규가입 프로모션 페이지",
    role: "Detailed Page, Graphic",
    contribution: "100%",
    tools: "PS / FIGMA",
    colors: ["#2B83D0", "#F4A729", "#DCE8FA"],
    detailMedia: [
      {
        type: "responsive-image",
        pc: "./images/portfilo/detail_page/pc_detail_new_sub.jpg",
        mo: "./images/portfilo/detail_page/mo_detail_new_sub.jpg",
        alt: "현대디에프 신규가입 프로모션 페이지 상세 이미지"
      }
    ]
  },

  {
    id: "hyundai-icair",
    category: "E-commerce / Promotion",
    client: "[현대디에프]",
    title: "[현대디에프] 인천공항면세점앱 가입방법 안내 페이지",
    role: "Detailed Page, Graphic",
    contribution: "100%",
    tools: "FIGMA",
    colors: ["#F59BC1", "#FFFFFF", "#F04C93"],
    detailMedia: [
      {
        type: "responsive-image",
        pc: "./images/portfilo/detail_page/pc_detail_ic_air.jpg",
        mo: "./images/portfilo/detail_page/mo_detail_ic_air.jpg",
        alt: "인천공항면세점앱 가입방법 안내 페이지 상세 이미지"
      }
    ]
  },

  {
    id: "hyundai-wedding",
    category: "E-commerce / Promotion",
    client: "[현대디에프]",
    title: "현대디에프 웨딩 인증 고객 혜택 페이지",
    role: "Detailed Page, Graphic",
    contribution: "100%",
    tools: "FIGMA",
    colors: ["#E9E4DC", "#B8AA96", "#FFFFFF"],
    detailMedia: [
      {
        type: "responsive-image",
        pc: "./images/portfilo/detail_page/pc_detail_wedding.jpg",
        mo: "./images/portfilo/detail_page/mo_detail_wedding.jpg",
        alt: "현대디에프 웨딩 인증 고객 혜택 페이지 상세 이미지"
      }
    ]
  }
];

/* ---------- Expose Global ---------- */
window.workDetailData = workDetailData;