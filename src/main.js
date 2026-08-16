import "./styles.css";
import { CONFIG } from "./config.js";
import { createHeartBurst } from "./hearts.js";
import { logAndSend, fetchFeed, submitReply as sheetSubmitReply, verifyPasscode } from "./sheet.js";
import {
  getOwnerToken,
  getMyCommentIds,
  rememberMyComment,
  forgetMyComment,
  newCommentId,
  isCoupleVerified,
  setCoupleVerified,
} from "./identity.js";
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

function formatRelativeTime(iso) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMin = Math.floor((Date.now() - then) / 60000);
  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${Math.floor(diffHour / 24)}일 전`;
}

export function mountApp(root) {
  const shell = document.createElement("div");
  shell.className = "wed-shell";
  root.appendChild(shell);

  const ownerToken = getOwnerToken();

  const state = {
    postLikes: { ...CONFIG.likeSeed },
    postLiked: {},
    comments: [...CONFIG.comments],
    likedCommentIds: new Set(),
    myCommentIds: getMyCommentIds(),
    coupleVerified: isCoupleVerified(),
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

  function showOverlay(name, composerOpts) {
    backdrop.hidden = name === null;
    composerSheet.setOpen(name === "composer", composerOpts);
    shareSheet.setOpen(name === "share");
    rsvpModal.setOpen(name === "rsvp");
    accountModal.setOpen(name === "account");
  }

  // 하트 폭죽은 클릭마다 터지지만, 서버 전송은 900ms 동안 모아서 한 번에 보낸다.
  const pendingLikes = {};
  const likeTimers = {};
  function queueLikeSend(key) {
    pendingLikes[key] = (pendingLikes[key] || 0) + 1;
    clearTimeout(likeTimers[key]);
    likeTimers[key] = setTimeout(() => {
      const count = pendingLikes[key];
      pendingLikes[key] = 0;
      logAndSend({ type: "like", key, count });
    }, 900);
  }

  function bumpPostLike(postKey) {
    state.postLikes[postKey] = (state.postLikes[postKey] || 0) + 1;
    state.postLiked[postKey] = true;
    notify();
    queueLikeSend(postKey);
  }

  const actions = {
    toastShow(message) {
      toast.show(message);
    },
    onLike(e, postKey) {
      const r = e.currentTarget.getBoundingClientRect();
      heartBurst.spawnAt(r.left + r.width / 2, r.top + r.height / 2);
      bumpPostLike(postKey);
    },
    onMediaDouble(e, postKey) {
      heartBurst.spawnAt(e.clientX, e.clientY);
      bumpPostLike(postKey);
    },
    onSave() {
      state.saved = !state.saved;
      notify();
      toast.show("청첩장을 저장했어요");
    },
    openComposer(postKey) {
      state.composerFor = postKey;
      showOverlay("composer", { guestName: state.guestName });
    },
    openCommentEditor(comment) {
      state.composerFor = null;
      showOverlay("composer", { edit: { id: comment.id, text: comment.text } });
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
      const id = newCommentId();
      state.comments = [
        { id, post, name, initial: name.charAt(0), text, time: "방금", likes: 0 },
        ...state.comments,
      ];
      rememberMyComment(id);
      state.myCommentIds = getMyCommentIds();
      state.composerFor = null;
      showOverlay(null);
      notify();
      toast.show("댓글을 남겼어요");
      logAndSend(
        {
          type: "guestbook",
          id,
          post,
          name,
          message: text,
          ownerToken,
          submittedAt: new Date().toISOString(),
        },
        "wed-guestbook-log"
      );
    },
    editComment(id, text) {
      state.comments = state.comments.map((c) => (c.id === id ? { ...c, text } : c));
      showOverlay(null);
      notify();
      toast.show("댓글을 수정했어요");
      logAndSend({ type: "comment_edit", id, ownerToken, message: text });
    },
    deleteComment(id) {
      if (!window.confirm("댓글을 삭제할까요?")) return;
      state.comments = state.comments.filter((c) => c.id !== id);
      forgetMyComment(id);
      state.myCommentIds = getMyCommentIds();
      notify();
      toast.show("댓글을 삭제했어요");
      logAndSend({ type: "comment_delete", id, ownerToken });
    },
    likeComment(id) {
      if (state.likedCommentIds.has(id)) return;
      state.likedCommentIds.add(id);
      state.comments = state.comments.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c));
      notify();
      logAndSend({ type: "comment_like", id });
    },
    openReplyComposer(comment) {
      state.composerFor = null;
      showOverlay("composer", { reply: { id: comment.id, existingReply: comment.reply || "" } });
    },
    openCoupleUnlock() {
      state.composerFor = null;
      showOverlay("composer", { unlock: true });
    },
    async verifyCouple(passcode) {
      try {
        const res = await verifyPasscode(passcode);
        if (res?.ok) {
          setCoupleVerified();
          state.coupleVerified = true;
          showOverlay(null);
          notify();
          toast.show("인증됐어요. 이 기기에서 답글을 달 수 있어요");
          return true;
        }
        toast.show(res?.error || "코드가 올바르지 않아요");
        return false;
      } catch {
        toast.show("인증에 실패했어요. 다시 시도해 주세요");
        return false;
      }
    },
    async submitReply({ id, passcode, reply }) {
      try {
        const res = await sheetSubmitReply({ id, passcode, reply });
        if (res?.ok) {
          state.comments = state.comments.map((c) =>
            c.id === id ? { ...c, reply, replyAt: new Date().toISOString() } : c
          );
          showOverlay(null);
          notify();
          toast.show(reply ? "답글을 남겼어요" : "답글을 삭제했어요");
          return true;
        }
        toast.show(res?.error || "코드가 올바르지 않아요");
        return false;
      } catch {
        toast.show("답글 전송에 실패했어요. 다시 시도해 주세요");
        return false;
      }
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
      const url = app === "naver" ? v.naverMapUrl : v.kakaoMapUrl;
      if (!url) {
        toast.show("제주 장소는 확정되면 안내드릴게요");
        return;
      }
      window.open(url, "_blank");
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

  // 모두가 같은 방명록/좋아요를 보도록 시트에서 최신 데이터를 받아 시드 데이터 위에 얹는다.
  fetchFeed()
    .then((data) => {
      if (!data) return;
      if (data.postLikes) state.postLikes = { ...data.postLikes };
      if (Array.isArray(data.comments)) {
        const fromSheet = data.comments.map((c) => ({
          ...c,
          initial: c.name?.charAt(0) || "나",
          time: formatRelativeTime(c.time) || c.time,
        }));
        state.comments = [...fromSheet, ...CONFIG.comments];
      }
      notify();
    })
    .catch(() => {
      // 엔드포인트 미설정이거나 네트워크 실패 — 시드 데이터만으로 계속 진행
    });

  return { shell };
}

mountApp(document.querySelector("#app"));
