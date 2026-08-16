# Handoff: 인스타그램 컨셉 모바일 청첩장 (조용철 & 김유진)

## Overview
인스타그램 피드 / 스토리 UI를 패러디한 **모바일 인터랙티브 청첩장**.
하객이 스크롤·더블탭·댓글로 놀 수 있게 만드는 게 목표. 톤은 밈·유머.

이 링크는 **청첩장 파티 공지용으로 먼저 배포**되므로, 화면 전체가 10.24 파티를 기본값으로 두고
서울 결혼식은 탭 전환으로 노출한다.

| 일정 | 날짜 | 장소 |
|---|---|---|
| 청첩장 파티 | 2026.10.24(토) 16–22시, **20시 인사 & 럭키드로우** | 텅앤빈 (서울 성동구 연무장길 45) |
| 서울 결혼식 | 2026.12.06(일) **오전 11시** | 더채플앳청담 3층 (서울 강남구 선릉로 757) |
| 제주 잔치 | 미정 | 미정 |

헤더 워드마크 `용철♥유진, 이제 결혼합니다` / 핸들 `yongtul_yujin`

⚠️ **릴스(9:16 전체화면) 지면은 없다.** 영상 확보가 어려워 **4:5 피드 게시물 2개** 구조로 확정했다.
(PRD 원안의 릴스 스와이프 갤러리는 폐기된 요구사항이다.)

## About the Design Files
이 번들의 HTML은 **디자인 레퍼런스(프로토타입)** 다. 최종 룩앤필과 인터랙션을 확정하기 위한
파일이지 그대로 배포할 프로덕션 코드가 아니다. 작업은 **이 HTML이 보여주는 화면을 대상
코드베이스의 기존 패턴으로 재구현**하는 것. 환경이 없다면 Next.js(App Router) + Tailwind를 권한다.

- `Wedding Reels Invitation.dc.html` 은 사내 프로토타입 런타임(`support.js`)에서 도는 포맷이다.
  `{{ ... }}` = 값 바인딩, `<sc-if>` / `<sc-for>` = 조건·반복, `<x-import>` = 컴포넌트 마운트.
  파일 하단 `<script data-dc-script>` 안의 `class Component` 가 상태/핸들러 전부다.
  → React 이식 시 `class Component` = 컨테이너, `renderVals()` 리턴값 = props/state 로 1:1 매핑된다.
- 로컬에서 열어보려면 폴더째 `npx serve .` 후 해당 HTML을 연다.

## Fidelity
**High-fidelity.** 색·타이포·간격·인터랙션 타이밍 모두 확정값이다.
단, **사진은 전부 비어 있는 플레이스홀더**(`<media-slot>`)이며 실 에셋으로 교체해야 한다.

## Screens / Views

전체 셸: `max-width 430px`, `height 100dvh`, 흰 배경, 세로 flex, `overflow:hidden`,
바깥 그림자 `0 0 40px rgba(0,0,0,.12)`. 데스크톱에서도 중앙 정렬된 모바일 컬럼.

### 0. Sticky Header (`flex:none`)
- 상단 바 52px, 좌우 16px, 하단 hairline `--sf-divider`
  - 좌: 워드마크 `용철♥유진, 이제 결혼합니다` — 20px / 700 / -0.03em
  - 우: 하트(→ 댓글 섹션으로 스크롤), 종이비행기(→ 공유 시트). 24px, gap 14px
- 스토리 하이라이트 레일 (가로 스크롤, 스크롤바 숨김, padding `10px 16px 14px`, gap 16px)
  각 항목 = 66px 폭 / 64px 원(그라데이션 링 `padding:2px` + 안쪽 흰 원) + 11px 라벨.
  **아이콘 대신 이모지를 쓴다** (사용자 확정 사항 — SFDS 기본 원칙의 예외).

  | # | 라벨 | 이모지 | 동작 |
  |---|---|---|---|
  | 1 | 우리의 이야기 | 💚 (26px) | 스토리 뷰어, set 0 |
  | 2 | 우리의 화보 | 📸 (26px) | 스토리 뷰어, set 1 |
  | 3 | 청첩장 파티 | 🎉 (26px) | 캘린더 섹션으로 스크롤 + **캘린더 탭 0** |
  | 4 | 서울 결혼식 | 🤵🏻👰🏻‍♀️ (20px) | 캘린더 섹션으로 스크롤 + **캘린더 탭 1** |
  | 5 | 제주 잔치 | 🏝️ (26px) | 오시는 길로 스크롤 + **지도 탭 2** |

- 프로필 아바타는 모노그램이 아니라 이모지 페어 `🧔🏻‍♂️👩🏻` (36px 원 안에 13px, `letter-spacing:-0.06em`).
  등장 위치 4곳: 게시물 1·2 헤더, 모든 댓글 헤더, 스토리 뷰어 헤더.

### 1. Feed scroller
`flex:1; overflow-y:auto; scroll-snap-type:y proximity; overscroll-behavior-y:contain`.
순서: 게시물 1 → 게시물 2 → 캘린더 → 모든 댓글 → 오시는 길 → 푸터.

### 2. 게시물 1 — 결혼식 스냅 (post key `cover`)
- 헤더: 아바타 / `yongtul_yujin` 14px 600 / 서브 `더채플앳청담 · 서울 강남구` 12px / 우측 더보기 20px
- 이미지 `aspect-ratio 4/5` (slot `post-cover`) + 우상단 칩 `두 번 탭 ❤︎`
  (`--sf-on-image`, radius 999, 11px 600)
- 액션 바(26px, gap 14px): 하트 · 말풍선 · 종이비행기 · 우측 북마크
- `좋아요 1,000,000개` 14px 600 · 캡션 + `... 더 보기`(1회성 펼침) · `댓글 N개 모두 보기`
- 캡션: "10년을 사귀면 결혼을 한다는 게 국룰이라길래, 결국 이렇게 됐습니다 🥲"
  (펼치면 연애 3,650일 + 두 일정 안내)

### 3. 게시물 2 — 우리 만난 이야기 (post key `post2`)
- 게시물 1과 동일한 구조. 서브텍스트 `2016 – 2026`, 이미지 slot `post-2` (4:5)
- 액션 바에 북마크 없음(하트 · 말풍선 · 공유)
- 캡션: "소개팅 아니고 그냥 술자리였습니다. 그날 둘 다 별 생각 없었던 게 10년이 됐네요."
  (펼치면 여행 100번 / 프러포즈 눈치 이야기)
- 좋아요 초기값 8,420 · 자체 `expanded2` 상태

### 4. 캘린더 / D-Day 섹션 (`--sf-gray-25` 위 흰 카드, radius 12, `0 1px 2px rgba(0,0,0,.12)`)
**탭 2개로 두 일정을 전환**한다 (기본 = 청첩장 파티):
- 탭 버튼(각 `flex:1`, radius 8, padding `11px 12px`): 제목 13px 700 + 날짜 11px(opacity .75)
  선택 = `#1a1a1a`/흰 글씨, 비선택 = `--sf-gray-40` + `inset 0 0 0 1px var(--sf-divider)`
- **탭 0 — 청첩장 파티**
  - `2026년 10월` 17px 700 · 우측 `토요일 오후 4시`
  - 7열 그리드(gap 6), **24일** = 30px 원 accent 배경 + `wedBeat 1.8s`, 일요일 열 accent 텍스트
  - `청첩장 파티까지 / 텅앤빈 · 16–22시` + `D-{n}` 30px 700 accent
  - **그날의 순서** 박스(`--sf-gray-25`, radius 10): 시간 44px 컬럼 + 제목/설명
    - `16:00 오픈` — 오시고 싶은 시간에 오셔서, 가고 싶을 때 가시면 됩니다
    - `20:00 신랑신부 인사 & 럭키드로우` — **accent + 700 강조**. 딱 이 시간에만 진행합니다…
    - `22:00 마무리`
- **탭 1 — 서울 결혼식**
  - `2026년 12월` · 우측 `일요일 오전 11시`, **6일** 하이라이트
  - `서울 결혼식까지 / 더채플앳청담 3층` + `D-{n}`
  - **시간 강조 박스**: 좌측 `오전` 12px + `11:00` 34px 700 accent │ 세로 hairline │
    `예식 시작` + "시간이 정확합니다. 10시 40분까지 오시면 사진도 함께 남길 수 있어요"
- 카드 하단 공통: 검정 52px `참석 여부 알리기`(radius 6, checkCircle) + 12px 안내문

### 5. 모든 댓글 섹션 (post key `guest`)
- 헤더: 아바타 + `모든 댓글` / `게시물에 달린 축하 메시지가 모두 모입니다`
- 메타 행: `댓글 N개` ↔ `좋아요 합계 N개`
- 댓글 리스트(**전부 노출, 새 댓글이 맨 위**): 32px 이니셜 원 +
  `이름(600) 본문` 14px/1.5 + 메타행(포스트 뱃지 pill · 시간 · 좋아요 N개) + 우측 15px 하트 토글
  - 뱃지 라벨: `결혼식 스냅` / `만난 이야기` / `방명록`
- **입력창 없음** — 댓글은 각 게시물의 말풍선 버튼에서만 작성한다.

### 6. 오시는 길
**지도를 임베드하지 않는다.** 길찾기 3버튼이 그 역할을 이미 하므로 지도는 기능이 겹치고,
저작권·로딩 부담만 생긴다. 그 자리에 **공간 소개 사진 한 장**을 넣어 "여기서 결혼합니다"를 보여준다.

흐름: 탭 3개 → 장소명·주소·전화 → 공간 사진(4:3) → 안내 문구 → 길찾기 3버튼 → 주소 복사하기

- 탭 3개(각 `flex:1`, radius 8, 12px 600): **청첩장 파티 / 서울 결혼식 / 제주 잔치** (기본 0)
- 장소 헤드: 장소명 19px 700/-0.02em · 주소 14px `--sf-content-02` · 전화 13px `--sf-content-03`
- 공간 사진: `aspect-ratio: 4/3`, radius 12, overflow hidden.
  **비율을 CSS로 고정해 둔 이유** — 안 그러면 이미지 로드 시점에 아래 버튼들이 밀린다(CLS).
  탭별로 슬롯이 분리돼 있다: `venue-party` · `venue-wedding` · `venue-jeju`
- 안내 문구: 제목 14px 700 + 본문 13px/1.5
- **길찾기 3버튼** — 라벨 `길찾기` 12px 600 + 3열 그리드(gap 8, 각 46px, radius 6,
  `--sf-gray-40` + inset hairline, 13px 600). 순서는 **네이버지도 → 카카오맵 → 티맵**
  | 앱 | URL |
  |---|---|
  | 네이버지도 | `https://map.naver.com/p/search/{name} {addr}` |
  | 카카오맵 | `https://map.kakao.com/link/to/{name},{lat},{lng}` |
  | 티맵 | `https://apis.openapi.sk.com/tmap/app/routes?appKey=&name={name}&lon={lng}&lat={lat}` |
  - 티맵은 앱 스킴 기반이라 **모바일에서만 정상 동작**한다. appKey는 비어 있다 — 필요 시 발급.
  - 제주 탭은 좌표가 없어 세 버튼 모두 안내 토스트만 띄운다.
- **주소 복사하기** — 전체 폭 46px, 흰 배경 + `inset 0 0 0 1px var(--sf-line-inset)`, 클립보드 + 토스트
- 선택 사항(미구현): 사진 탭 시 라이트박스 확대

### 7. Footer
`--sf-gray-25`, 가운데 정렬: `2026 · 12 · 06` → `조용철 & 김유진` 20px 700 →
감사 문구 13px/1.6 → 검정 pill `청첩장 공유하기`(44px, radius 999)

### 8. 오버레이
- **스토리 뷰어**(전체화면 #000)
  - 상단 진행 바 4개(2px, `wedBar 4s linear`) → 프로필 행 → 미디어 4장 → 하단 고스트 pill + 하트
  - 사진 패널은 `[data-story-panel]` 로 식별한다. ⚠️ 태그 이름(`DIV`)으로 고르면 스크림·캡션이
    슬라이드로 오인돼 숨겨진다(실제로 겪은 버그).
  - **하단 스크림** `linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 46%)`
  - **문구는 세트별로 하나씩 고정**(슬라이드마다 바뀌지 않음). 22px/700/1.45, left·right 22px, bottom 104px
    - set 0 (우리의 이야기): `여름과 바다, 술을 좋아하는 / 용철과 유진의 / 이야기를 만나보세요.`
    - set 1 (우리의 화보): `2026년 12월 6일(일) / 드디어 저희가 결혼합니다.`
  - 좌 32% 이전 / 우 68% 다음. 4초 자동 진행, 마지막 뒤 종료
  - ⚠️ **두 세트가 같은 사진 4장(`story-1`~`story-4`)을 공유한다.** 세트별로 다른 사진을 쓰려면
    슬롯을 분리해야 한다(예: `photo-1`~`photo-4` 추가).
- **댓글 작성 BottomSheet** — 제목 `축하 댓글 남기기`. 안내문 + **이름** + **댓글** + 검정 `게시`.
  어느 게시물에서 열었는지(`composerFor`)를 기억해 그 게시물의 댓글로 등록된다.
- **공유 BottomSheet** — 제목 `청첩장 공유하기`. 카카오톡으로 공유하기 / 링크 복사 **2개만**
  (길찾기는 여기 없음 — 오시는 길 섹션 전용)
- **RSVP Modal (340px)** — 성함 / 연락처(tel) / **청첩장 파티** 참석·불참 / **서울 결혼식** 참석·불참 /
  본인 포함 인원 스테퍼(1–9) / 검정 52px `보내기`.
  참석 버튼 라벨 `참석합니다` · `참석이 어렵습니다` (42px, 13px 600)
- **계좌 Modal (340px)** — 코드에는 있으나 **여는 버튼이 화면에 없다. 의도된 상태**(이번 배포 제외).
  살릴 때 실제 계좌번호로 교체 필요(현재 더미).
- **Toast** — 하단 16px 인셋, 검정 radius 10, `wedRise 180ms`, 1.9초 자동 소멸

## Interactions & Behavior
1. **하트 콤보 폭죽** — 하트 버튼 클릭 또는 미디어 더블탭 시 클릭 좌표에서
   작은 하트 10개(14–36px, `wedFloat` 900–1600ms, 위로 180px + 좌우 ±95px) +
   큰 흰 하트 1개(88px, `wedPop` 700ms). 1.4초 내 연타 시 누적 →
   3회 `x3 COMBO!` · 5회 `x5 COMBO!` · 10회 `x10 PERFECT!` · 20회 `x20 축의금 인정!`
   (30px 800, 흰 글씨 + accent 네온 글로우). **해당 게시물의 좋아요만 +1**.
2. **게시물별 카운트** — `cover` / `post2` / `guest` 가 각자 좋아요 수를 갖는다
   (초기값 1,000,000 / 8,420 / 2,048).
3. **댓글** — 게시물 말풍선 → 시트 → 이름+본문 → 낙관적으로 리스트 최상단 추가("방금") + 토스트.
   이름이 비면 등록되지 않고 안내 토스트. 아바타 이니셜 = 이름 첫 글자.
4. **댓글 좋아요** — 댓글마다 하트 토글(채워짐 + 카운트 ±1).
5. **스크롤 스냅** — 피드 `y proximity`. 각 섹션이 `scroll-snap-align:start`.
6. **퀵메뉴 스크롤** — ⚠️ 프로토타입에서는 `scroll-behavior:smooth` 와 rAF 애니메이션이
   스냅 컨테이너에서 되돌려져 `scrollTop` 직접 대입으로 처리했다. 실제 앱에서는
   `el.scrollIntoView({behavior:'smooth', block:'start'})` 로 부드럽게 처리해도 된다.
7. **영상 오토플레이**(media-slot에 영상을 넣는 경우) — muted + loop + playsinline,
   `IntersectionObserver(threshold 0.6)`.
8. **애니메이션 규칙** — 120–200ms, `cubic-bezier(0.2,0,0,1)`. 바운스·무한 장식 모션 없음
   (예외: 캘린더 하이라이트 하트비트, 하트 폭죽).

## State Management

| state | 초기값 | 트리거 |
|---|---|---|
| `postLikes` | `{cover:1000000, post2:8420, guest:2048}` | 하트/더블탭 → 해당 키 +1 |
| `postLiked` | `{}` | 누른 게시물만 채워진 하트 |
| `comments[]` | 시드 5개 `{id,post,name,initial,text,time,likes,liked}` | 등록 시 prepend |
| `composerFor` | null | 게시물 말풍선 → post key, 닫으면 null |
| `draft` / `guestName` | '' | 댓글 입력 |
| `expanded` / `expanded2` | false | 게시물 1·2 캡션 더보기 |
| `saved` | false | 북마크 |
| `storyOpen` / `storyIndex` / `storySet` | false / 0 / 0 | 하이라이트, 탭, 4초 타이머 |
| `shareOpen` / `rsvpOpen` / `accountOpen` | false | 각 진입점 |
| `calTab` | 0 (파티) | 캘린더 탭 · 하이라이트 3·4번 |
| `mapTab` | 0 (파티) | 지도 탭 · 하이라이트 5번 |
| `rsvpName` / `rsvpPhone` / `attendParty` / `attendWedding` / `rsvpCount` / `rsvpSending` | '' / '' / '' / '' / 1 / false | RSVP 폼 |
| `toast` | '' | 1.9s 자동 해제 |

## 연동 1 — 길찾기 딥링크 (SDK·API 키 불필요)
카카오맵 JS SDK 연동은 **철회했다.** 키 발급·도메인 등록이 필요한데 지도가 주는 정보는
길찾기 버튼이 이미 다 주기 때문이다. 딥링크만 쓰므로 키가 필요 없다.
- 카카오톡 공유(`notifyKakao`)만 아직 토스트다 → `Kakao.Share.sendDefault` 연결 필요(이때는 JS 키 필요).
- **좌표는 대략값이다. 검증 필요:**
  | 장소 | lat | lng |
  |---|---|---|
  | 텅앤빈 | 37.5417 | 127.0562 |
  | 더채플앳청담 | 37.5236 | 127.0473 |
  | 제주 | null | null |
- 전화번호는 세 곳 모두 **`02-0000-0000` 임시값**이다.

## 연동 2 — RSVP·방명록 → Google Apps Script + 스프레드시트
확정된 방식이다. `rsvp-google-apps-script.gs` 를 그대로 쓰면 된다.

- 클라이언트는 `rsvpEndpoint`(prop)로 받은 웹 앱 URL에 **JSON을 POST** 한다.
  Apps Script가 preflight를 처리하지 못하므로 `mode:'no-cors'` +
  `Content-Type: text/plain;charset=utf-8`. (자체 API로 바꾼다면 `application/json` + CORS 헤더,
  응답 검증·실패 롤백을 추가할 것 — 현재는 응답을 읽을 수 없어 항상 성공으로 간주한다.)
- 엔드포인트 유무와 무관하게 **localStorage에 항상 적립**: `wed-rsvp-log`, `wed-guestbook-log`.

```jsonc
// RSVP
{"type":"rsvp","name":"김하객","phone":"010-0000-0000","party":"참석",
 "wedding":"불참","headcount":2,"submittedAt":"2026-08-16T…"}
// 방명록/댓글
{"type":"guestbook","post":"cover","name":"김하객","message":"축하해요",
 "submittedAt":"2026-08-16T…"}
```

스크립트는 `type` 으로 시트를 나눈다.
- `RSVP` 시트 — 제출시각 · 성함 · 연락처 · 청첩장 파티 · 서울 결혼식 · 인원
- `방명록` 시트 — 작성시각 · 이름 · 메시지 (**`post` 필드는 아직 열로 저장하지 않음** — 필요하면 추가)

설치 순서는 `.gs` 상단 주석 참조. 배포 시 액세스 권한은 **모든 사용자**여야 한다.

## Design Tokens
StayFolio Design System(SFDS) 토큰 사용. 전체 정의는 `_ds/.../tokens/*.css`.

**Color**
- ink `#1a1a1a` · 흰색 `#ffffff`
- gray: 25 `#fafafa` · 40 `#f7f7f7` · 50 `#f2f2f2` · 100 `#e6e6e6` · 200 `#cccccc` ·
  300 `#b7b7b7` · 500 `#767676` · 600 `#595959` · 800 `#333333`
- 시맨틱: `--sf-content-01 #333` · `--sf-content-02 #595959` · `--sf-content-03 #767676` ·
  `--sf-divider #f2f2f2` · `--sf-border-01 #cccccc` · `--sf-line-inset rgba(112,115,124,.22)` ·
  `--sf-on-image rgba(26,26,26,.6)`
- accent `--wed-accent`: 기본 `#da3939`(red-600). 시안에서는 `#d77f21`(orange-500)도 사용
- 스토리 링 `--wed-ring: linear-gradient(135deg,#f3a755,#da3939 45%,#a62b2b)`

**Typography** — Pretendard (`'Pretendard','Pretendard JP',system-ui`)
- 워드마크 20/700/-0.03em · 섹션 타이틀 16–19/700/-0.02em · D-Day 30/700 · 예식 시간 34/700
- 스토리 문구 22/700/1.45 · 본문 14/1.55 · 캡션·메타 12–13 · 마이크로 11 · 계정명 13–14/600

**Spacing** — 4px 그리드(4/6/8/10/12/14/16/20/24/34/36). 좌우 기본 padding 14–16px.
**Radius** — 컨트롤 6 · 입력 4 · 카드/이미지 10–12 · 시트/모달 16–20 · pill 999
**Shadow** — 카드 `0 1px 2px rgba(0,0,0,.12)` · 토스트 `0 8px 24px rgba(0,0,0,.28)` ·
셸 `0 0 40px rgba(0,0,0,.12)`. 보더와 그림자를 같은 면에 함께 쓰지 않는다.
**Keyframes** — `wedFloat`(하트 상승) · `wedPop`(팝) · `wedBeat`(캘린더) ·
`wedBar`(스토리 진행) · `wedRise`(토스트). 정의는 프로토타입 `<helmet><style>` 참조.

## Assets
- **미디어 없음.** `<media-slot>` 플레이스홀더 9칸:

  | slot id | 용도 | 비율 | 권장 |
  |---|---|---|---|
  | `post-cover` | 게시물 1 결혼식 스냅 | 4:5 | 1080×1350 |
  | `post-2` | 게시물 2 만난 이야기 | 4:5 | 1080×1350 |
  | `story-1`~`story-4` | 스토리 4장(두 세트 공유) | 9:16 | 1080×1920 |
  | `venue-party` | 텅앤빈 공간 사진 | 4:3 | 가로 1600px |
  | `venue-wedding` | 예식장 공간 사진 | 4:3 | 가로 1600px |
  | `venue-jeju` | 제주 공간 사진 | 4:3 | 가로 1600px |

  이미지·영상 모두 지원(JPG/PNG/WebP/MP4/WebM), 드롭 시 IndexedDB에 Blob 보관 —
  **프로토타입 전용 장치이므로 프로덕션에서는 CDN 경로로 대체할 것.**
- **아이콘**: SFDS `Icon` 컴포넌트(131글리프, currentColor). 사용 글리프 —
  heart, heartFill, bubble, send, share, bookmark, location, copy, link, close,
  plus, minus, chevronRight, moreHorizontal, checkCircle, circleCheckFill, coins, logoKakao.
  ⚠️ 번들 아이콘 데이터에 글리프 뒤 전면 사각 패스가 들어 있어 그대로 쓰면 검은 사각형이 된다.
  프로토타입에서는 `svg path[d^="M 0 0 L 100 0 L 100 100 L 0 100 L 0 0 Z"]{display:none}` 로 제거했다.
  실제 구현에서는 아이콘 데이터에서 해당 패스를 제거하거나 다른 라인 세트로 대체할 것.
- **이모지**: 하이라이트 5개와 프로필 아바타는 이모지를 쓴다(위 표 참조).
  OS별 렌더가 다르므로 필요하면 Noto Color Emoji 웹폰트를 고정할 것.
- **폰트**: Pretendard(공개 CDN). SFDS 원본 사양은 Pretendard JP.

## Files
```
design_handoff_wedding_reels/
├─ README.md                          ← 이 문서
├─ Wedding Reels Invitation.dc.html   ← 디자인 원본(마크업 + 로직 클래스)
├─ media-slot.js                      ← 사진·영상 플레이스홀더 웹컴포넌트(프로토타입 전용)
├─ support.js                          ← 프로토타입 런타임(이식 불필요)
├─ rsvp-google-apps-script.gs         ← RSVP·방명록 수집 스크립트(그대로 사용)
└─ _ds/stayfolio-design-system-sfds-.../
   ├─ _ds_bundle.js                   ← SFDS React 컴포넌트 + 아이콘 데이터
   ├─ styles.css
   └─ tokens/{colors,typography,spacing,fonts,fig-tokens}.css
```

## 문구를 고칠 때 — 어디에 있나
대부분은 마크업에 리터럴로 있어 검색해서 바꾸면 된다. 아래만 **로직 클래스(`class Component`) 안**에 있다.
- 댓글 시드 5개 (`comments` 초기 state)
- 토스트 문구 전부 (`this.toast('…')`)
- 포스트 뱃지 라벨 (`LABELS` = 결혼식 스냅 / 만난 이야기 / 방명록)
- 장소 이름·주소·좌표 (`Component.VENUES`) — 지도 헤드의 표시 텍스트는 마크업에 따로 또 있으니 **양쪽을 같이 고쳐야 한다**
- 콤보 문구 (`x3 COMBO!` …)

## 이 문서 이후 반영된 변경 (최신순)
1. **오시는 길 개편** — 지도 임베드 철회, 공간 사진(4:3) + 길찾기 3버튼(네이버·카카오·티맵) + 주소 복사.
   `kakaoJsKey` prop과 SDK 로더 삭제. 슬롯 `map-shot` → `venue-party`/`venue-wedding`/`venue-jeju`.
2. **릴스 폐기 → 게시물 2개** — 9:16 전체화면 릴스를 없애고 4:5 피드 게시물 2개
   (결혼식 스냅 / 우리 만난 이야기)로 확정. post key `reel1` → `post2`.
3. **스토리 문구 고정** — 슬라이드별 연도 캡션을 없애고 세트당 문구 하나 + 하단 스크림.
4. **이모지 전환** — 하이라이트 5개와 프로필 아바타를 이모지로(SFDS 기본 원칙의 의도된 예외).
5. **헤더 워드마크** — `용철♥유진, 이제 결혼합니다`.
6. **하이라이트 1번 라벨** — 러브스토리 → 우리의 이야기.

## 구현 전 확정 필요
1. **사진 9장** — 위 slot 표 규격대로. 스토리 두 세트를 다르게 갈 거면 4장 추가.
   공간 사진은 직접 찍은 컷이나 웨딩 스냅의 공간 컷이 저작권·톤 양쪽에서 가장 안전하다.
2. **두 장소 정확한 좌표 검증** + **전화번호 3건**(현재 임시값).
3. **Apps Script 웹 앱 배포** → URL을 `rsvpEndpoint` 에 주입.
4. **제주 잔치** 날짜·장소.
5. **댓글 시드 5개** — 현재 가상의 하객 이름/문구다. 실제 지인 코멘트로 바꾸면 훨씬 살아난다.
6. 럭키드로우 상품 문구 — 넣으면 파티 참석률에 가장 효과적인 한 줄이 된다.
7. 방명록 스팸 방지 정책(비밀번호 삭제, 관리자 승인, rate limit 등).
8. 계좌 모달을 살릴지 여부 + 실제 계좌번호.
