import "./styles.css";
import { CONFIG } from "./config.js";
import { createHeartBurst } from "./hearts.js";
import { logAndSend } from "./sheet.js";
import {
  buildHeader,
  buildCoverPost,
  buildPost2,
  buildCalendarSection,
  buildAllComments,
  buildMapSection,
  buildFooter,
} from "./sections.js";
import {
  buildBackdropStack,
  buildComposerSheet,
  buildShareSheet,
  buildRsvpModal,
  buildAccountModal,
  buildStoryOverlay,
  buildToast,
} from "./overlays.js";

export function mountApp(root) {
  const shell = document.createElement("div");
  shell.className = "wed-shell";
  root.appendChild(shell);

  const state = {
    postLikes: { ...CONFIG.likeSeed },
    postLiked: {},
    comments: [...CONFIG.comments],
    saved: false,
    calTab: "party",
    mapTab: "party",
    composerFor: null,
    guestName: "",
  };

  const calendarRef = { current: null };
  const guestRef = { current: null };
  const mapRef = { current: null };

  const burst = document.createElement("div");
  burst.className = "wed-burst";
  const heartBurst = createHeartBurst(burst, { comboEnabled: CONFIG.heartCombo });

  const overlayHost = document.createElement("div");
  const backdrop = buildBackdropStack(overlayHost);
  const toast = buildToast(shell);

  const sections = [];
  function registerSection(built) {
    sections.push(built);
    return built.el;
  }
  function notify() {
    sections.forEach((s) => s.update?.(state));
  }

  function copyText(text) {
    navigator.clipboard?.writeText(text).catch(() => {});
  }

  function showOverlay(name) {
    backdrop.hidden = name === null;
    composerSheet.setOpen(name === "composer", state.guestName);
    shareSheet.setOpen(name === "share");
    rsvpModal.setOpen(name === "rsvp");
    accountModal.setOpen(name === "account");
  }

  const MAP_TABS = ["party", "wedding", "jeju"];

  const actions = {
    toastShow(message) {
      toast.show(message);
    },
    onLike(e, postKey) {
      const r = e.currentTarget.getBoundingClientRect();
      heartBurst.spawnAt(r.left + r.width / 2, r.top + r.height / 2);
      state.postLikes[postKey] = (state.postLikes[postKey] || 0) + 1;
      state.postLiked[postKey] = true;
      notify();
    },
    onMediaDouble(e, postKey) {
      heartBurst.spawnAt(e.clientX, e.clientY);
      state.postLikes[postKey] = (state.postLikes[postKey] || 0) + 1;
      state.postLiked[postKey] = true;
      notify();
    },
    onSave() {
      state.saved = !state.saved;
      notify();
      toast.show("청첩장을 저장했어요");
    },
    openComposer(postKey) {
      state.composerFor = postKey;
      showOverlay("composer");
    },
    openShare() {
      showOverlay("share");
    },
    openRsvp() {
      showOverlay("rsvp");
    },
    openAccount() {
      showOverlay("account");
    },
    closeOverlays() {
      state.composerFor = null;
      showOverlay(null);
    },
    openStory(set) {
      storyOverlay.open(set);
    },
    goSection(target) {
      const calTabs = { party: "party", wedding: "wedding" };
      if (target in calTabs) {
        state.calTab = calTabs[target];
        notify();
      }
      if (target === "jeju") {
        state.mapTab = "jeju";
        notify();
      }
      const refMap = { party: calendarRef, wedding: calendarRef, jeju: mapRef, guestbook: guestRef };
      const targetEl = refMap[target]?.current;
      if (!targetEl) return;
      feedEl.scrollTop = targetEl.offsetTop - feedEl.offsetTop;
    },
    setCalTab(key) {
      state.calTab = key;
      notify();
    },
    setMapTab(key) {
      state.mapTab = key;
      notify();
    },
    submitComment({ name, text }) {
      state.guestName = name;
      const post = state.composerFor || "guest";
      state.comments = [
        { id: Date.now(), post, name, initial: name.charAt(0), text, time: "방금", likes: 0, liked: false },
        ...state.comments,
      ];
      state.composerFor = null;
      showOverlay(null);
      notify();
      toast.show("댓글을 남겼어요");
      logAndSend(
        { type: "guestbook", post, name, message: text, submittedAt: new Date().toISOString() },
        "wed-guestbook-log"
      );
    },
    toggleCommentLike(id) {
      state.comments = state.comments.map((c) =>
        c.id === id ? { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) } : c
      );
      notify();
    },
    async submitRsvp({ name, phone, attendParty, attendWedding, count }) {
      const payload = {
        type: "rsvp",
        name,
        phone,
        party: attendParty || "미정",
        wedding: attendWedding || "미정",
        headcount: count,
        submittedAt: new Date().toISOString(),
      };
      await logAndSend(payload, "wed-rsvp-log");
      showOverlay(null);
      const going = [attendParty === "참석" && "파티", attendWedding === "참석" && "결혼식"].filter(Boolean);
      toast.show(
        going.length ? `${name}님, ${going.join("·")} ${count}명으로 전달했어요` : `${name}님, 마음 잘 받았어요`
      );
    },
    copyAccount(value) {
      copyText(value);
      toast.show("계좌번호를 복사했어요");
    },
    copyAddress() {
      const idx = MAP_TABS.indexOf(state.mapTab);
      const addr = [CONFIG.party.addr, CONFIG.wedding.addr, ""][idx];
      if (!addr) {
        toast.show("제주 장소는 확정되면 안내드릴게요");
        return;
      }
      copyText(addr);
      toast.show("주소를 복사했어요");
    },
    copyLink() {
      copyText(CONFIG.shareLinkUrl);
      toast.show("링크를 복사했어요");
    },
    notifyKakao() {
      showOverlay(null);
      toast.show("카카오톡 공유 SDK 연결 지점");
    },
    openRoute(app) {
      const v = CONFIG[state.mapTab];
      if (!v.lat) {
        toast.show("제주 장소는 확정되면 안내드릴게요");
        return;
      }
      const name = encodeURIComponent(v.place);
      const urls = {
        naver: `https://map.naver.com/p/search/${encodeURIComponent(`${v.place} ${v.addr}`)}`,
        kakao: `https://map.kakao.com/link/to/${name},${v.lat},${v.lng}`,
        // 티맵은 앱 스킴 기반이라 모바일에서만 정상 동작. appKey는 발급 전까지 비워둠.
        tmap: `https://apis.openapi.sk.com/tmap/app/routes?appKey=&name=${name}&lon=${v.lng}&lat=${v.lat}`,
      };
      window.open(urls[app] || urls.kakao, "_blank");
    },
  };

  const composerSheet = buildComposerSheet(overlayHost, backdrop, actions);
  const shareSheet = buildShareSheet(overlayHost, backdrop, actions);
  const rsvpModal = buildRsvpModal(overlayHost, backdrop, actions);
  const accountModal = buildAccountModal(overlayHost, backdrop, actions);
  const storyOverlay = buildStoryOverlay(overlayHost, actions);

  shell.appendChild(buildHeader(actions));

  const feedEl = document.createElement("main");
  feedEl.className = "wed-feed wed-scroll";
  shell.appendChild(feedEl);

  feedEl.appendChild(registerSection(buildCoverPost(state, actions)));
  feedEl.appendChild(registerSection(buildPost2(state, actions)));
  feedEl.appendChild(registerSection(buildCalendarSection(actions, calendarRef)));
  feedEl.appendChild(registerSection(buildAllComments(state, actions, guestRef)));
  feedEl.appendChild(registerSection(buildMapSection(state, actions, mapRef)));
  feedEl.appendChild(buildFooter(actions));

  shell.appendChild(burst);
  shell.appendChild(overlayHost);

  notify();

  return { shell };
}

mountApp(document.querySelector("#app"));
