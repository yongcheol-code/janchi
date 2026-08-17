// 이 파일 하나로 문구·날짜·장소·계좌·시트 URL을 관리합니다.
// design_handoff_wedding_reels/README.md (2026-08-16 업데이트본) 스펙을 그대로 반영.
// 이 링크는 청첩장 파티 공지용으로 먼저 배포되므로 파티가 기본값이다.

export const CONFIG = {
  rsvpEndpoint: "https://script.google.com/macros/s/AKfycbxd6dRqV_GYU-cmK9ZNby80Hlm8jFCseVSsN1V8ra_j6VzkuPo_KAHXFiWd23yDOJN3/exec",

  groom: "조용철",
  bride: "김유진",
  handle: "yongtul_yujin",
  wordmark: "용철♥유진, 이제 결혼합니다",
  avatarEmoji: "🧔🏻‍♂️👩🏻",

  likeSeed: { cover: 1000000, post2: 8420, guest: 2048 },
  heartCombo: true,

  // 캘린더/지도 탭 순서: 파티가 0번(기본), 결혼식 1번, 제주 2번
  // 지도는 임베드하지 않고 공간 사진(4:3) + 길찾기 딥링크(네이버/카카오/티맵)만 쓴다.
  // lat/lng은 길찾기 딥링크용 — README에 "대략값, 검증 필요"로 명시되어 있음
  party: {
    label: "청첩장 파티",
    dateShort: "10.24(토)",
    dateLabel: "10.24(토) 16–22시",
    calHeaderDate: "2026년 10월",
    calHeaderTime: "토요일 오후 4시",
    date: new Date(2026, 9, 24),
    place: "텅앤빈 청파",
    placeSub: "텅앤빈 청파 · 16–22시",
    addr: "서울 용산구 청파로45길 14",
    phone: "", // 전화번호 미기재(요청 반영)
    lat: 37.5406,
    lng: 126.9695,
    naverMapUrl: "https://naver.me/5XpnP6F3",
    kakaoMapUrl: "https://place.map.kakao.com/693628217",
    venuePhoto: "venue-party.jpg",
    mapDesc:
      "편하신 시간에 자유롭게 들러주세요!<br>지하철 4호선 숙대입구역 8번/9번 출구 또는 1호선 남영역 1번 출구를 이용해주세요. 주차는 인근 공영주차장을 이용해 주세요.",
    schedule: [
      { time: "16:00", title: "오픈", desc: "오시고 싶은 시간에 오세요. 기다리고 있을게요.", accent: false },
      { time: "20:00", title: "메인 행사", desc: "신랑신부 인사 & 럭키드로우", accent: true },
      { time: "22:00", title: "마무리", desc: "", accent: false },
    ],
  },
  wedding: {
    label: "서울 결혼식",
    dateShort: "12.06(일)",
    dateLabel: "12.06(일) 오전 11시",
    calHeaderDate: "2026년 12월",
    calHeaderTime: "일요일 오전 11시",
    date: new Date(2026, 11, 6),
    place: "더채플앳청담",
    placeSub: "더채플앳청담 · 서울 강남구",
    floor: "더채플앳청담 3층",
    addr: "서울 강남구 선릉로 757",
    addrDisplay: "서울 강남구 선릉로 757 · 3층",
    phone: "02-0000-0000", // TODO: 실제 번호로 교체
    lat: 37.5236,
    lng: 127.0473,
    naverMapUrl: "https://naver.me/5ne4oSX1",
    kakaoMapUrl: "https://place.map.kakao.com/23182563",
    venuePhoto: "venue-wedding.jpg",
    mapDesc: "지하 주차 2시간 무료.<br>7호선 청담역 13번 출구에서 도보 8분, 셔틀은 10분 간격으로 운행합니다.",
    ceremonyTime: "11:00",
    ceremonyMeridiem: "오전",
    ceremonyDesc: "시간이 정확합니다. 10시 40분까지 오시면 사진도 함께 남길 수 있어요",
  },
  jeju: {
    label: "제주 잔치",
    dateLabel: "11월 예정",
    place: "정미당",
    addr: "",
    addrDisplay: "세화리 인근",
    phone: "일정 확정 후 안내드립니다",
    lat: null,
    lng: null,
    venuePhoto: "venue-jeju.jpg",
    mapDesc:
      "제주에서 반겨주신 분들을 위한 소소한 식사 자리를 만드려고 해요.<br>정확한 날짜와 장소는 정해지면 바로 올릴게요.",
  },

  accounts: [
    // TODO: 실제 계좌로 교체 필요. 계좌 모달을 여는 진입 버튼도 아직 화면에 없음(의도된 상태).
    { role: "신랑 조용철", value: "국민 123456-01-789012" },
    { role: "신부 김유진", value: "카카오 3333-01-2345678" },
  ],

  // photos: 업로드 폴더의 번호 순서 그대로. 사진은 4:5로 크롭, 동영상(mov/mp4)은 원본 그대로 사용.
  cover: {
    caption: "여름과 바다, 그리고 술을 사랑하는 용철과 유진이 다가오는 12월, 마침내 결실을 맺습니다.",
    captionExpanded:
      "육지에서 시작해 저희가 사랑하는 제주에 뿌리를 내리기까지, 언제나 따뜻한 응원을 보내주신 덕분입니다.<br><br>한 분 한 분 직접 찾아뵙고 인사드리는 것이 도리이나, 제주에 머물고 있어 여의치 않은 마음을 담아 다 함께 모여 즐겁게 나눌 수 있는 작은 청첩장 파티를 준비했습니다.<br><br>바쁘시겠지만 부디 참석하셔서 청첩장도 받아주시고, 저희의 새로운 시작을 함께 축하해 주세요! 맛있는 음식과 술을 아주 넉넉히 준비해 두겠습니다.<br><br>10월 24일 토요일 오후 4시 · 텅앤빈 청파 (청첩장 파티)<br>12월 6일 일요일 오전 11시 · 더채플앳청담 (서울 결혼식)",
    photos: [
      "post-cover-1.jpg", "post-cover-2.jpg", "post-cover-3.jpg", "post-cover-4.jpg",
      "post-cover-5.jpg", "post-cover-6.jpg", "post-cover-7.jpg", "post-cover-8.jpg",
      "post-cover-9.jpg", "post-cover-10.jpg", "post-cover-11.jpg", "post-cover-12.jpg",
      "post-cover-13.jpg",
    ],
  },

  post2: {
    sub: "2024~",
    caption: "서울에 있을 때도 저희는 늘 바다를 꿈꿨고, 여름을 기다렸습니다.",
    captionExpanded:
      "지나온 사진마다 함께 술잔을 들고 웃고 있는 걸 보면 참 저희답다는 생각이 듭니다. 결국 좋아하는 바다를 따라 제주로 오게 되었고, 이곳에서 저희만의 매일을 만들어가고 있습니다.<br><br>어느 계절이든 제주가 문득 그리워질 때, 망설이지 말고 제주의 용철과 유진을 찾아주세요. 언제나 반갑게 맞아드릴게요.",
    photos: [
      "post-2-1.mp4", "post-2-2.jpg", "post-2-3.jpg", "post-2-4.jpg", "post-2-5.mp4",
      "post-2-6.jpg", "post-2-7.jpg", "post-2-8.jpg", "post-2-9.jpg", "post-2-10.jpg",
      "post-2-11.jpg", "post-2-12.jpg", "post-2-13.jpg", "post-2-14.jpg", "post-2-15.jpg",
      "post-2-16.jpg", "post-2-17.jpg", "post-2-18.jpg",
    ],
  },

  // 스토리는 세트별로 사진이 다르다(우리의 이야기 / 우리의 화보). 문구는 슬라이드와 무관하게 세트 전체에 고정.
  storySets: [
    {
      label: "우리의 이야기",
      caption: "여름과 바다, 술을 좋아하는<br>용철과 유진의<br>이야기를 만나보세요.",
      photos: [
        "story-a-1.jpg", "story-a-2.jpg", "story-a-3.mp4", "story-a-4.jpg", "story-a-5.jpg",
        "story-a-6.jpg", "story-a-7.jpg", "story-a-8.jpg", "story-a-9.jpg", "story-a-10.jpg",
        "story-a-11.jpg", "story-a-12.jpg", "story-a-13.jpg",
      ],
    },
    {
      label: "우리의 화보",
      caption: "드디어 저희가 결혼합니다.<br>10월 24일(토) 청첩장 파티<br>12월 6일(일) 서울 결혼식",
      photos: [
        "story-b-1.jpg", "story-b-2.jpg", "story-b-3.jpg", "story-b-4.jpg", "story-b-5.jpg",
        "story-b-6.jpg", "story-b-7.jpg", "story-b-8.jpg", "story-b-9.jpg", "story-b-10.jpg",
      ],
    },
  ],

  // 아이콘 대신 이모지를 쓴다 (사용자 확정 사항)
  highlights: [
    { emoji: "💚", emojiSize: 26, label: "우리의 이야기", action: "story", set: 0 },
    { emoji: "📸", emojiSize: 26, label: "우리의 화보", action: "story", set: 1 },
    { emoji: "🎉", emojiSize: 26, label: "청첩장 파티", action: "section", target: "party" },
    { emoji: "🤵🏻👰🏻‍♀️", emojiSize: 20, label: "서울 결혼식", action: "section", target: "wedding" },
    { emoji: "🏝️", emojiSize: 26, label: "제주 잔치", action: "section", target: "jeju" },
  ],

  // post: 'cover' | 'post2' | 'guest' — 어느 게시물에 달린 댓글인지
  comments: [
    { id: 1, post: "cover", name: "park_jh", initial: "ㅂ", text: "드디어! 10년 채운 커플 실존했네 축하해 🎉", time: "2시간", likes: 12, liked: false },
    { id: 2, post: "post2", name: "seoyeon.k", initial: "ㅅ", text: "신부님 화보 뭐야… 연예인 데뷔하는 줄", time: "4시간", likes: 8, liked: false },
    { id: 3, post: "cover", name: "teamlead_choi", initial: "ㅊ", text: "신랑 그날 연차 승인해줌. 결재 완료.", time: "6시간", likes: 31, liked: false },
    { id: 4, post: "cover", name: "minho__", initial: "ㅁ", text: "축의금은 성의껏, 밥은 배부르게 먹겠습니다", time: "8시간", likes: 5, liked: false },
    { id: 5, post: "guest", name: "jiwon.lee", initial: "ㅈ", text: "부케 예약합니다 (진심)", time: "12시간", likes: 17, liked: false },
  ],

  shareLinkUrl: "https://yongcheol-code.github.io/janchi/",
  kakaoJsKey: "409d7b21bf245a094eab2df47c11f025",
};

// import.meta.env.BASE_URL은 vite.config.js의 base 값을 그대로 반영한다(로컬 "/", 배포 "/janchi/" 등).
// 여기를 "/media/"로 하드코딩하면 서브경로 배포 시 실제 파일 경로와 어긋나 이미지가 전부 깨진다.
export const MEDIA_BASE = `${import.meta.env.BASE_URL}media/`;
