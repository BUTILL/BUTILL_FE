// 세금 관리 화면 선택 항목과 기본값
export const taxGroups = [
  {
    title: "사업자 형태",
    choices: ["개인", "법인", "등록 전", "모름"],
    value: "개인",
  },
  {
    title: "과세 유형",
    hint: "개인사업자",
    choices: ["일반과세자", "간이과세자", "모름"],
    value: "일반과세자",
    tip: true,
  },
  {
    title: "세무 관리 방식",
    hint: "월 기장료 반영",
    choices: ["직접 신고", "세무사 이용", "미정/모름"],
    value: "세무사 이용",
  },
  {
    title: "세금 자금 준비 방식",
    choices: ["매월 세금 확보", "납부월 일괄", "모름"],
    value: "매월 세금 확보",
  },
  {
    title: "직원 고용 여부",
    hint: "정직원 / 파트타이머",
    choices: ["직원 있음", "없음", "채용 / 신고 전"],
    value: "직원 있음",
  },
  {
    title: "납부 방식",
    choices: [
      "일시불",
      "50%\\n(2회 분할)",
      "33.3%\\n(3회 분할)",
      "25%\\n(4회 분할)",
    ],
    value: "일시불",
    rows: true,
  },
];

export const initialTaxSelections: Record<string, string> = Object.fromEntries(
  taxGroups.map((group) => [group.title, group.value]),
);
