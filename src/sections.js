import { CONFIG } from "./config.js";
import { icon } from "./icons.js";
import { mediaSlot } from "./media.js";

function el(tag, className, html) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (html !== undefined) n.innerHTML = html;
  return n;
}

function iconBtn(name, size, onClick, extraClass = "") {
  const btn = el("button", `wed-icon-btn ${extraClass}`.trim());
  btn.appendChild(icon(name, size));
  btn.addEventListener("click", onClick);
  return btn;
}

function daysUntil(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.ceil((date - today) / 86400000));
}

function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

// 아바타는 이모지 페어(사용자 확정 사항)로 통일 — 게시물 헤더/모든 댓글/스토리 뷰어 4곳에서 재사용
function buildAvatar(className = "wed-post-head__avatar") {
  const avatar = el("span", className);
  const inner = el("span", "wed-post-head__avatar-inner");
  inner.appendChild(el("span", "wed-post-head__avatar-fallback", CONFIG.avatarEmoji));
  avatar.appendChild(inner);
  return avatar;
}

// ---------- 헤더 + 스토리 하이라이트 ----------
export function buildHeader(actions) {
  const header = el("header", "wed-header");

  const top = el("div", "wed-header__top");
  top.appendChild(el("span", "wed-header__word", CONFIG.wordmark));
  const actionsRow = el("div", "wed-header__actions");
  actionsRow.appendChild(iconBtn("heart", 24, () => actions.goSection("guestbook")));
  actionsRow.appendChild(iconBtn("send", 24, () => actions.openShare()));
  top.appendChild(actionsRow);
  header.appendChild(top);

  const rail = el("div", "wed-highlights wed-scroll");
  CONFIG.highlights.forEach((h) => {
    const btn = el("button", "wed-highlight");
    const ring = el("span", "wed-highlight__ring");
    const inner = el("span", "wed-highlight__inner");
    inner.appendChild(el("span", "wed-highlight__emoji", h.emoji)).style.fontSize = `${h.emojiSize}px`;
    ring.appendChild(inner);
    btn.appendChild(ring);
    btn.appendChild(el("span", "wed-highlight__label", h.label));
    btn.addEventListener("click", () => {
      if (h.action === "story") actions.openStory(h.set);
      else actions.goSection(h.target);
    });
    rail.appendChild(btn);
  });
  header.appendChild(rail);

  return header;
}

// 게시물 미디어 캐러셀 — 여러 장을 옆으로 스와이프, "n/N · 두 번 탭" 칩으로 위치 표시
function buildMediaCarousel(files, postKey, actions, placeholder) {
  const wrap = el("div", "wed-media wed-media--4x5");
  const track = el("div", "wed-carousel__track wed-scroll");
  files.forEach((file) => {
    const slide = el("div", "wed-carousel__slide");
    slide.appendChild(mediaSlot(file, placeholder));
    track.appendChild(slide);
  });
  wrap.appendChild(track);

  const chip = el("span", "wed-media__chip", files.length > 1 ? `1/${files.length} · 두 번 탭 ❤︎` : "두 번 탭 ❤︎");
  wrap.appendChild(chip);

  track.addEventListener("dblclick", (e) => actions.onMediaDouble(e, postKey));

  if (files.length > 1) {
    let raf = null;
    track.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const index = Math.round(track.scrollLeft / track.clientWidth);
        chip.textContent = `${index + 1}/${files.length} · 두 번 탭 ❤︎`;
      });
    });
  }

  return wrap;
}

function buildFeedPost(
  actions,
  { postKey, subText, files, placeholder, caption, captionExpanded, showBookmark, borderTop }
) {
  const article = el("article", "wed-post");
  if (borderTop) article.style.borderTop = "1px solid var(--sf-divider)";

  const head = el("div", "wed-post-head");
  head.appendChild(buildAvatar());
  const meta = el("div", "wed-post-head__meta");
  meta.appendChild(el("span", "wed-post-head__name", CONFIG.handle));
  meta.appendChild(el("span", "wed-post-head__sub", subText));
  head.appendChild(meta);
  head.appendChild(iconBtn("moreHorizontal", 20, () => actions.openShare()));
  article.appendChild(head);

  article.appendChild(buildMediaCarousel(files, postKey, actions, placeholder));

  const actionsRow = el("div", "wed-post-actions");
  const likeBtn = iconBtn("heart", 26, (e) => actions.onLike(e, postKey));
  actionsRow.appendChild(likeBtn);
  actionsRow.appendChild(iconBtn("bubble", 26, () => actions.openComposer(postKey)));
  actionsRow.appendChild(iconBtn("send", 26, () => actions.openShare()));
  if (showBookmark) {
    actionsRow.appendChild(el("span", "wed-post-actions__spacer"));
    actionsRow.appendChild(iconBtn("bookmark", 26, () => actions.onSave()));
  }
  article.appendChild(actionsRow);

  const footer = el("div", "wed-post-footer");
  const likesText = el("span", "wed-post-footer__likes");
  footer.appendChild(likesText);

  const captionP = el("p", "wed-post-footer__caption");
  const captionBody = el("b", "", `${CONFIG.handle} `);
  captionBody.style.fontWeight = "600";
  captionP.appendChild(captionBody);
  captionP.appendChild(document.createTextNode(caption));
  const expandedSpan = el("span", "", " " + captionExpanded);
  expandedSpan.hidden = true;
  captionP.appendChild(expandedSpan);
  const moreBtn = el("button", "wed-post-footer__more", "... 더 보기");
  moreBtn.addEventListener("click", () => {
    expandedSpan.hidden = false;
    moreBtn.remove();
  });
  captionP.appendChild(moreBtn);
  footer.appendChild(captionP);

  const commentsLink = el("button", "wed-post-footer__comments-link");
  commentsLink.addEventListener("click", () => actions.goSection("guestbook"));
  footer.appendChild(commentsLink);
  article.appendChild(footer);

  return {
    el: article,
    update(s) {
      likesText.textContent = `좋아요 ${s.postLikes[postKey].toLocaleString("ko-KR")}개`;
      likeBtn.replaceChildren(icon(s.postLiked[postKey] ? "heartFill" : "heart", 26));
      likeBtn.style.color = s.postLiked[postKey] ? "var(--wed-accent)" : "";
      const count = s.comments.filter((c) => c.post === postKey).length;
      commentsLink.textContent = `댓글 ${count}개 모두 보기`;
    },
  };
}

// ---------- Post 1 · 커버 ----------
export function buildCoverPost(state, actions) {
  return buildFeedPost(actions, {
    postKey: "cover",
    subText: CONFIG.wedding.placeSub,
    files: CONFIG.cover.photos,
    placeholder: "결혼식 스냅 4:5",
    caption: CONFIG.cover.caption,
    captionExpanded: CONFIG.cover.captionExpanded,
    showBookmark: true,
  });
}

// ---------- Post 2 · 우리 만난 이야기 ----------
export function buildPost2(state, actions) {
  return buildFeedPost(actions, {
    postKey: "post2",
    subText: CONFIG.post2.sub,
    files: CONFIG.post2.photos,
    placeholder: "우리 만난 이야기 4:5",
    caption: CONFIG.post2.caption,
    captionExpanded: CONFIG.post2.captionExpanded,
    showBookmark: false,
    borderTop: true,
  });
}

// ---------- 캘린더 / D-Day (파티·결혼식 탭) ----------
function buildCalendarGrid(year, month, highlightDay) {
  const grid = el("div", "wed-calendar__grid");
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let i = 0; i < firstDow; i++) grid.appendChild(el("span"));
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    if (d === highlightDay) {
      grid.appendChild(el("span", "wed-calendar__day--today", String(d)));
    } else {
      grid.appendChild(el("span", dow === 0 ? "wed-calendar__day--sunday" : "", String(d)));
    }
  }
  return grid;
}

function buildDow() {
  const dow = el("div", "wed-calendar__dow");
  ["일", "월", "화", "수", "목", "금", "토"].forEach((d) => dow.appendChild(el("span", "", d)));
  return dow;
}

function buildPartyPanel() {
  const p = CONFIG.party;
  const panel = el("div", "wed-calendar__panel");
  const head = el("div", "wed-calendar__head");
  head.appendChild(el("span", "wed-calendar__title", p.calHeaderDate));
  head.appendChild(el("span", "wed-calendar__time", p.calHeaderTime));
  panel.appendChild(head);
  panel.appendChild(buildDow());
  panel.appendChild(buildCalendarGrid(p.date.getFullYear(), p.date.getMonth() + 1, p.date.getDate()));
  panel.appendChild(el("div", "wed-calendar__hr"));

  const countdown = el("div", "wed-calendar__countdown");
  const group = el("div");
  group.appendChild(el("span", "wed-calendar__countdown-label", "청첩장 파티까지"));
  group.appendChild(el("span", "wed-calendar__countdown-place", p.placeSub));
  countdown.appendChild(group);
  const dday = el("span", "wed-calendar__countdown-dday", `D-${daysUntil(p.date)}`);
  countdown.appendChild(dday);
  panel.appendChild(countdown);

  const schedule = el("div", "wed-calendar__schedule");
  schedule.appendChild(el("span", "wed-calendar__schedule-label", "그날의 순서"));
  p.schedule.forEach((item) => {
    const row = el("div", "wed-calendar__schedule-row");
    row.appendChild(
      el("span", `wed-calendar__schedule-time${item.accent ? " is-accent" : ""}`, item.time)
    );
    const textGroup = el("div", "wed-calendar__schedule-text");
    textGroup.appendChild(
      el("span", `wed-calendar__schedule-title${item.accent ? " is-accent" : ""}`, item.title)
    );
    textGroup.appendChild(el("span", "wed-calendar__schedule-desc", item.desc ?? ""));
    row.appendChild(textGroup);
    schedule.appendChild(row);
  });
  panel.appendChild(schedule);

  return panel;
}

function buildWeddingPanel() {
  const w = CONFIG.wedding;
  const panel = el("div", "wed-calendar__panel");
  const head = el("div", "wed-calendar__head");
  head.appendChild(el("span", "wed-calendar__title", w.calHeaderDate));
  head.appendChild(el("span", "wed-calendar__time", w.calHeaderTime));
  panel.appendChild(head);
  panel.appendChild(buildDow());
  panel.appendChild(buildCalendarGrid(w.date.getFullYear(), w.date.getMonth() + 1, w.date.getDate()));
  panel.appendChild(el("div", "wed-calendar__hr"));

  const countdown = el("div", "wed-calendar__countdown");
  const group = el("div");
  group.appendChild(el("span", "wed-calendar__countdown-label", "서울 결혼식까지"));
  group.appendChild(el("span", "wed-calendar__countdown-place", w.floor));
  countdown.appendChild(group);
  const dday = el("span", "wed-calendar__countdown-dday", `D-${daysUntil(w.date)}`);
  countdown.appendChild(dday);
  panel.appendChild(countdown);

  const timeBox = el("div", "wed-calendar__timebox");
  const timeGroup = el("div", "wed-calendar__timebox-time");
  timeGroup.appendChild(el("span", "", w.ceremonyMeridiem));
  timeGroup.appendChild(el("span", "", w.ceremonyTime));
  timeBox.appendChild(timeGroup);
  timeBox.appendChild(el("span", "wed-calendar__timebox-divider"));
  const detail = el("div", "wed-calendar__timebox-detail");
  detail.appendChild(el("span", "", "예식 시작"));
  detail.appendChild(el("span", "", w.ceremonyDesc));
  timeBox.appendChild(detail);
  panel.appendChild(timeBox);

  return panel;
}

export function buildCalendarSection(actions, calendarRef) {
  const section = el("section", "wed-calendar");
  calendarRef.current = section;

  const card = el("div", "wed-calendar__card");
  const tabs = el("div", "wed-calendar__tabs");
  const partyTab = el("button", "wed-calendar__tab");
  partyTab.appendChild(el("span", "", CONFIG.party.label));
  partyTab.appendChild(el("span", "", CONFIG.party.dateShort));
  partyTab.addEventListener("click", () => actions.setCalTab("party"));
  const weddingTab = el("button", "wed-calendar__tab");
  weddingTab.appendChild(el("span", "", CONFIG.wedding.label));
  weddingTab.appendChild(el("span", "", CONFIG.wedding.dateShort));
  weddingTab.addEventListener("click", () => actions.setCalTab("wedding"));
  tabs.appendChild(partyTab);
  tabs.appendChild(weddingTab);
  card.appendChild(tabs);

  const panelSlot = el("div");
  card.appendChild(panelSlot);

  const rsvpBtn = el("button", "wed-calendar__rsvp-btn");
  rsvpBtn.appendChild(icon("checkCircle", 18));
  rsvpBtn.appendChild(document.createTextNode("참석 여부 알리기"));
  rsvpBtn.addEventListener("click", () => actions.openRsvp());
  card.appendChild(rsvpBtn);
  card.appendChild(
    el("span", "wed-calendar__hint", "두 일정 각각 알려주시면 자리·식사 준비에 큰 도움이 됩니다")
  );

  section.appendChild(card);

  let currentTab = null;
  return {
    el: section,
    update(s) {
      if (currentTab === s.calTab) return;
      currentTab = s.calTab;
      partyTab.classList.toggle("is-active", s.calTab === "party");
      weddingTab.classList.toggle("is-active", s.calTab === "wedding");
      panelSlot.replaceChildren(s.calTab === "party" ? buildPartyPanel() : buildWeddingPanel());
    },
  };
}

// ---------- 모든 댓글 ----------
export function buildAllComments(state, actions, guestRef) {
  const article = el("article", "wed-allcomments");
  guestRef.current = article;

  const head = el("div", "wed-post-head");
  head.appendChild(buildAvatar());
  const meta = el("div", "wed-post-head__meta");
  meta.appendChild(el("span", "wed-post-head__name", "모든 댓글"));
  meta.appendChild(el("span", "wed-post-head__sub", "게시물에 달린 축하 메시지가 모두 모입니다"));
  head.appendChild(meta);
  article.appendChild(head);

  const metaRow = el("div", "wed-allcomments__meta-row");
  const countLabel = el("span", "", "");
  metaRow.appendChild(countLabel);
  metaRow.appendChild(el("span", "wed-post-actions__spacer"));
  const totalLikesLabel = el("span", "", "");
  metaRow.appendChild(totalLikesLabel);
  article.appendChild(metaRow);

  const list = el("div", "wed-allcomments__list");
  article.appendChild(list);

  function buildRow(c) {
    const row = el("div", "wed-allcomments__row");
    row.appendChild(el("span", "wed-comment__avatar", c.initial));
    const body = el("div", "wed-comment__body");
    const text = el("span", "wed-comment__text");
    text.innerHTML = `<b style="font-weight:600">${escapeHtml(c.name)}</b> ${escapeHtml(c.text)}`;
    body.appendChild(text);
    const meta2 = el("div", "wed-allcomments__meta");
    meta2.appendChild(el("span", "wed-allcomments__badge", CONFIG.commentPostLabels[c.post] || "방명록"));
    meta2.appendChild(el("span", "", c.time));
    meta2.appendChild(el("span", "", `좋아요 ${c.likes}개`));
    body.appendChild(meta2);
    row.appendChild(body);

    const likeBtn = el("button", `wed-allcomments__like-btn${c.liked ? " is-liked" : ""}`);
    likeBtn.appendChild(icon(c.liked ? "heartFill" : "heart", 15));
    likeBtn.addEventListener("click", () => actions.toggleCommentLike(c.id));
    row.appendChild(likeBtn);
    return row;
  }

  return {
    el: article,
    update(s) {
      countLabel.textContent = `댓글 ${s.comments.length}개`;
      const total = Object.values(s.postLikes).reduce((sum, n) => sum + n, 0);
      totalLikesLabel.textContent = `좋아요 합계 ${total.toLocaleString("ko-KR")}개`;
      list.replaceChildren(...s.comments.map(buildRow));
    },
  };
}

// ---------- 오시는 길 ----------
// 지도는 임베드하지 않는다 — 길찾기 3버튼(네이버/카카오/티맵)이 이미 그 역할을 하므로
// 지도는 기능이 겹치고 저작권·로딩 부담만 생긴다. 대신 공간 소개 사진 한 장을 보여준다.
const MAP_TABS = ["party", "wedding", "jeju"];

export function buildMapSection(state, actions, mapRef) {
  const article = el("article", "wed-map");
  article.style.borderTop = "1px solid var(--sf-divider)";
  mapRef.current = article;

  const tabs = el("div", "wed-map__tabs");
  const tabBtns = MAP_TABS.map((key) => {
    const btn = el("button", "wed-map__tab", CONFIG[key].label);
    btn.addEventListener("click", () => actions.setMapTab(key));
    tabs.appendChild(btn);
    return btn;
  });
  article.appendChild(tabs);

  const body = el("div", "wed-map__body");
  article.appendChild(body);

  const head = el("div", "wed-map__head");
  const placeName = el("span", "wed-map__place-name");
  const placeAddr = el("span", "wed-map__place-addr");
  const placePhone = el("span", "wed-map__place-phone");
  head.appendChild(placeName);
  head.appendChild(placeAddr);
  head.appendChild(placePhone);
  body.appendChild(head);

  // 4:3으로 비율을 CSS에 고정 — 사진 로드 전에도 레이아웃이 밀리지 않게(CLS 방지)
  const photoBox = el("div", "wed-map__photo");
  body.appendChild(photoBox);

  const detail = el("div", "wed-map__detail");
  const detailTitle = el("span", "wed-map__detail-title");
  const detailDesc = el("span", "wed-map__detail-desc");
  detail.appendChild(detailTitle);
  detail.appendChild(detailDesc);
  body.appendChild(detail);

  const routeSection = el("div", "wed-map__route");
  routeSection.appendChild(el("span", "wed-map__route-label", "길찾기"));
  const routeGrid = el("div", "wed-map__route-grid");
  [
    { app: "naver", label: "네이버지도" },
    { app: "kakao", label: "카카오맵" },
    { app: "tmap", label: "티맵" },
  ].forEach(({ app, label }) => {
    const btn = el("button", "wed-map__route-btn", label);
    btn.addEventListener("click", () => actions.openRoute(app));
    routeGrid.appendChild(btn);
  });
  routeSection.appendChild(routeGrid);
  const copyBtn = el("button", "wed-map__copy");
  copyBtn.appendChild(icon("copy", 18));
  copyBtn.appendChild(document.createTextNode("주소 복사하기"));
  copyBtn.addEventListener("click", () => actions.copyAddress());
  routeSection.appendChild(copyBtn);
  body.appendChild(routeSection);

  let currentTab = null;

  return {
    el: article,
    update(s) {
      tabBtns.forEach((b, i) => b.classList.toggle("is-active", MAP_TABS[i] === s.mapTab));
      const data = CONFIG[s.mapTab];

      placeName.textContent = data.place;
      placeAddr.textContent = data.addrDisplay ?? data.addr;
      placePhone.textContent = data.phone;

      if (currentTab !== s.mapTab) {
        currentTab = s.mapTab;
        photoBox.replaceChildren(mediaSlot(data.venuePhoto, `${data.place} 공간 사진 4:3`));
      }

      detailTitle.textContent =
        s.mapTab === "wedding"
          ? `${data.dateLabel} · 예식`
          : s.mapTab === "party"
            ? `${data.dateLabel} · 청첩장 파티`
            : `${data.label} · ${data.dateLabel}`;
      detailDesc.textContent = data.mapDesc;
    },
  };
}

// ---------- 푸터 ----------
export function buildFooter(actions) {
  const footer = el("footer", "wed-footer");
  footer.appendChild(el("span", "wed-footer__date", "2026 · 12 · 06"));
  footer.appendChild(el("span", "wed-footer__names", `${CONFIG.groom} & ${CONFIG.bride}`));
  footer.appendChild(
    el(
      "p",
      "wed-footer__thanks",
      "스크롤 끝까지 봐주셔서 감사합니다.<br>이 게시물은 저장해두면 12월에 알림이 갑니다(는 거짓말, 직접 기억해 주세요)."
    )
  );
  const shareBtn = el("button", "wed-footer__share");
  shareBtn.appendChild(icon("share", 18));
  shareBtn.appendChild(document.createTextNode("청첩장 공유하기"));
  shareBtn.addEventListener("click", () => actions.openShare());
  footer.appendChild(shareBtn);
  return footer;
}
