// 달빛카페 메뉴 데이터 (예시)
// 메뉴를 추가하거나 바꾸려면 이 파일만 수정하면 됩니다.
const MENU = {
  drinks: [
    {
      category: "커피",
      items: [
        { name: "에스프레소", price: 3000, temp: ["HOT"], desc: "진하게 추출한 기본 에스프레소" },
        { name: "아메리카노", price: 3500, temp: ["HOT", "ICED"], desc: "깔끔하고 고소한 기본 커피" },
        { name: "카페라떼", price: 4200, temp: ["HOT", "ICED"], desc: "에스프레소에 부드러운 우유를 더했어요" },
        { name: "바닐라라떼", price: 4800, temp: ["HOT", "ICED"], desc: "바닐라 시럽을 더한 달콤한 라떼" },
        { name: "카라멜 마키아토", price: 5000, temp: ["HOT", "ICED"], desc: "카라멜 소스를 올린 달콤한 커피" },
        { name: "달빛라떼", price: 5300, temp: ["HOT", "ICED"], desc: "시그니처. 은은한 크림과 흑설탕을 넣은 라떼", signature: true }
      ]
    },
    {
      category: "논커피",
      items: [
        { name: "초코라떼", price: 4800, temp: ["HOT", "ICED"], desc: "진한 초콜릿과 우유" },
        { name: "녹차라떼", price: 4800, temp: ["HOT", "ICED"], desc: "고소하고 쌉싸름한 말차 라떼" },
        { name: "고구마라떼", price: 5000, temp: ["HOT", "ICED"], desc: "달콤한 고구마를 갈아 만든 라떼" },
        { name: "밀크티", price: 4800, temp: ["HOT", "ICED"], desc: "홍차의 향이 진한 밀크티" }
      ]
    },
    {
      category: "티와 에이드",
      items: [
        { name: "캐모마일", price: 4000, temp: ["HOT"], desc: "편안한 향의 허브티" },
        { name: "유자차", price: 4500, temp: ["HOT", "ICED"], desc: "달콤하고 상큼한 유자" },
        { name: "레몬에이드", price: 5000, temp: ["ICED"], desc: "직접 만든 레몬청과 탄산수" },
        { name: "자몽에이드", price: 5500, temp: ["ICED"], desc: "새콤달콤한 자몽 과육이 들어가요" }
      ]
    }
  ],
  desserts: [
    {
      category: "케이크",
      items: [
        { name: "생크림 케이크", price: 6500, desc: "부드러운 생크림을 올린 기본 케이크" },
        { name: "초코 케이크", price: 6800, desc: "진한 초콜릿 시트와 가나슈" },
        { name: "치즈 케이크", price: 6800, desc: "꾸덕하고 진한 크림치즈 케이크" },
        { name: "티라미수", price: 7000, desc: "마스카포네와 커피 시럽을 적신 시트" },
        { name: "당근 케이크", price: 6800, desc: "향긋한 계피와 호두가 들어 있어요" }
      ]
    },
    {
      category: "구움과자",
      items: [
        { name: "마들렌", price: 2500, desc: "버터 향이 가득한 촉촉한 마들렌" },
        { name: "휘낭시에", price: 2800, desc: "겉은 바삭하고 속은 쫀득해요" },
        { name: "스콘", price: 3500, desc: "플레인 스콘. 잼과 버터가 함께 나와요" },
        { name: "쿠키", price: 3000, desc: "초코칩이 가득한 수제 쿠키" }
      ]
    },
    {
      category: "빵과 아이스",
      items: [
        { name: "크루아상", price: 3800, desc: "겹겹이 바삭한 버터 크루아상" },
        { name: "소금빵", price: 3500, desc: "짭짤하고 고소한 소금빵" },
        { name: "와플", price: 6500, desc: "바닐라 아이스크림을 올린 와플" },
        { name: "바닐라 아이스크림", price: 3500, desc: "진한 우유 맛 아이스크림" }
      ]
    }
  ],
  // 전통 메뉴는 보조 메뉴입니다.
  traditional: [
    {
      category: "전통 차와 음료",
      minor: true,
      items: [
        { name: "쌍화차", price: 6000, temp: ["HOT"], desc: "한약재 향이 은은하고 견과류를 띄운 따뜻한 차" },
        { name: "대추차", price: 5000, temp: ["HOT"], desc: "달콤하고 진한 대추 향" },
        { name: "오미자차", price: 5500, temp: ["HOT", "ICED"], desc: "다섯 가지 맛이 나는 붉은 차" },
        { name: "수정과", price: 5000, temp: ["ICED"], desc: "계피와 생강 향에 곶감을 띄웠어요" },
        { name: "식혜", price: 4500, temp: ["ICED"], desc: "달고 시원한 전통 음료" }
      ]
    },
    {
      category: "전통 디저트",
      minor: true,
      items: [
        { name: "약과", price: 3500, desc: "꿀에 재운 바삭하고 쫀득한 전통 과자" },
        { name: "인절미", price: 4000, desc: "쫀득한 떡에 고소한 콩가루" },
        { name: "꿀떡", price: 4000, desc: "속에 달콤한 꿀이 들어 있는 떡" },
        { name: "전통 한과 세트", price: 6500, desc: "약과, 유과 등 한과를 한 접시에" }
      ]
    }
  ]
};
