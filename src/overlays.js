import { CONFIG } from "./config.js";
import { icon } from "./icons.js";
import { mediaSlot } from "./media.js";

function el(tag, className, html) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (html !== undefined) n.innerHTML = html;
  return n;
}

// ---------- 백드롭 + 바텀시트 / 모달 껍데기 ----------
function buildBackdropStack(host) {
  const backdrop = el("div", "wed-overlay-backdrop");
  backdrop.hidden = true;
  host.appendChild(backdrop);
  return backdrop;
}

function buildSheetShell(host, title) {
  const sheet = el("div", "wed-sheet");
  sheet.hidden = true;
  sheet.appendChild(el("div", "wed-sheet__handle"));
  const head = el("div", "wed-sheet__head");
  const titleEl = el("span", "wed-sheet__title", title);
  head.appendChild(titleEl);
  const closeBtn = el("button", "wed-icon-btn");
  closeBtn.appendChild(icon("close", 20));
  head.appendChild(closeBtn);
  sheet.appendChild(head);
  const body = el("div", "wed-sheet__body");
  sheet.appendChild(body);
  host.appendChild(sheet);
  return { sheet, body, closeBtn, titleEl };
}

function buildModalShell(host, title) {
  const modal = el("div", "wed-modal");
  modal.hidden = true;
  const head = el("div", "wed-modal__head");
  head.appendChild(el("span", "wed-modal__title", title));
  const closeBtn = el("button", "wed-icon-btn");
  closeBtn.appendChild(icon("close", 18));
  head.appendChild(closeBtn);
  modal.appendChild(head);
  const body = el("div");
  modal.appendChild(body);
  host.appendChild(modal);
  return { modal, body, closeBtn };
}

// ---------- 댓글 작성 바텀시트 (게시물 말풍선에서 진입) ----------
export function buildComposerSheet(host, backdrop, actions) {
  const { sheet, body, closeBtn, titleEl } = buildSheetShell(host, "축하 댓글 남기기");
  const form = el("div");
  form.style.display = "flex";
  form.style.flexDirection = "column";
  form.style.gap = "12px";
  form.appendChild(el("p", "", "남기신 댓글은 아래 '모든 댓글'에 함께 쌓입니다."));

  const nameInput = el("input");
  nameInput.type = "text";
  nameInput.maxLength = 12;
  nameInput.placeholder = "이름";
  nameInput.className = "wed-text-input";
  form.appendChild(nameInput);

  const textInput = el("input");
  textInput.type = "text";
  textInput.placeholder = "댓글 달기…";
  textInput.className = "wed-text-input";
  form.appendChild(textInput);

  const submitBtn = el("button", "wed-solid-btn", "게시");
  form.appendChild(submitBtn);
  body.appendChild(form);

  function submit() {
    const text = textInput.value.trim();
    const name = nameInput.value.trim();
    if (!text) return;
    if (!name) {
      actions.toastShow("이름을 함께 남겨주세요");
      return;
    }
    actions.submitComment({ name, text });
    textInput.value = "";
  }
  submitBtn.addEventListener("click", submit);
  textInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit();
  });

  const close = () => actions.closeOverlays();
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", () => {
    if (!sheet.hidden) close();
  });

  return {
    sheet,
    setOpen(open, guestName) {
      sheet.hidden = !open;
      if (open) nameInput.value = guestName ?? "";
    },
  };
}

// ---------- 공유 바텀시트 ----------
export function buildShareSheet(host, backdrop, actions) {
  const { sheet, body, closeBtn } = buildSheetShell(host, "청첩장 공유하기");
  const list = el("div", "wed-share-list");

  const kakaoBtn = el("button", "wed-share-item");
  kakaoBtn.appendChild(icon("kakao", 22));
  kakaoBtn.appendChild(document.createTextNode("카카오톡으로 공유하기"));
  kakaoBtn.addEventListener("click", () => actions.notifyKakao());
  list.appendChild(kakaoBtn);

  const linkBtn = el("button", "wed-share-item");
  linkBtn.appendChild(icon("link", 22));
  linkBtn.appendChild(document.createTextNode("링크 복사"));
  linkBtn.addEventListener("click", () => actions.copyLink());
  list.appendChild(linkBtn);

  body.appendChild(list);

  const close = () => actions.closeOverlays();
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", () => {
    if (!sheet.hidden) close();
  });

  return {
    sheet,
    setOpen(open) {
      sheet.hidden = !open;
    },
  };
}

// ---------- RSVP 모달 (파티 · 결혼식 개별 응답) ----------
function buildAttendBlock(label, sub, onSet) {
  const box = el("div", "wed-rsvp-event");
  const group = el("div");
  group.style.display = "flex";
  group.style.flexDirection = "column";
  group.style.gap = "1px";
  group.appendChild(el("span", "wed-rsvp-event__label", label));
  group.appendChild(el("span", "wed-rsvp-event__sub", sub));
  box.appendChild(group);

  const choice = el("div", "wed-rsvp-choice");
  const yesBtn = el("button", "", "참석합니다");
  const noBtn = el("button", "", "참석이 어렵습니다");
  yesBtn.addEventListener("click", () => onSet("참석", yesBtn, noBtn));
  noBtn.addEventListener("click", () => onSet("불참", yesBtn, noBtn));
  choice.appendChild(yesBtn);
  choice.appendChild(noBtn);
  box.appendChild(choice);

  return { box, yesBtn, noBtn };
}

export function buildRsvpModal(host, backdrop, actions) {
  const { modal, body, closeBtn } = buildModalShell(host, "참석 여부 알려주기");
  const form = el("div", "wed-rsvp-form");
  form.appendChild(
    el("p", "", "자리와 식사 준비를 위해 여쭙습니다. 두 일정 각각 답해주세요.")
  );

  const namesRow = el("div");
  namesRow.style.display = "flex";
  namesRow.style.flexDirection = "column";
  namesRow.style.gap = "8px";
  const nameInput = el("input");
  nameInput.type = "text";
  nameInput.placeholder = "성함";
  nameInput.className = "wed-text-input";
  const phoneInput = el("input");
  phoneInput.type = "tel";
  phoneInput.placeholder = "연락처 (010-0000-0000)";
  phoneInput.className = "wed-text-input";
  namesRow.appendChild(nameInput);
  namesRow.appendChild(phoneInput);
  form.appendChild(namesRow);

  let attendParty = "";
  let attendWedding = "";

  function paint(yesBtn, noBtn, value) {
    yesBtn.classList.toggle("is-active", value === "참석");
    noBtn.classList.toggle("is-active", value === "불참");
  }

  const partyBlock = buildAttendBlock(CONFIG.party.label, `${CONFIG.party.dateLabel} · ${CONFIG.party.place}`, (v, y, n) => {
    attendParty = v;
    paint(y, n, v);
  });
  form.appendChild(partyBlock.box);

  const weddingBlock = buildAttendBlock(
    CONFIG.wedding.label,
    `${CONFIG.wedding.dateLabel} · ${CONFIG.wedding.place}`,
    (v, y, n) => {
      attendWedding = v;
      paint(y, n, v);
    }
  );
  form.appendChild(weddingBlock.box);

  let count = 1;
  const stepper = el("div", "wed-rsvp-stepper");
  stepper.appendChild(el("span", "", "본인 포함 인원"));
  const controls = el("div", "wed-rsvp-stepper__controls");
  const minusBtn = el("button", "wed-rsvp-stepper__btn");
  minusBtn.appendChild(icon("minus", 16));
  const countLabel = el("span", "wed-rsvp-stepper__count", "1");
  const plusBtn = el("button", "wed-rsvp-stepper__btn");
  plusBtn.appendChild(icon("plus", 16));
  minusBtn.addEventListener("click", () => {
    count = Math.max(1, count - 1);
    countLabel.textContent = String(count);
  });
  plusBtn.addEventListener("click", () => {
    count = Math.min(9, count + 1);
    countLabel.textContent = String(count);
  });
  controls.appendChild(minusBtn);
  controls.appendChild(countLabel);
  controls.appendChild(plusBtn);
  stepper.appendChild(controls);
  form.appendChild(stepper);

  const submitBtn = el("button", "wed-rsvp-submit", "보내기");
  submitBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    if (!name) {
      actions.toastShow("성함을 입력해 주세요");
      return;
    }
    if (!attendParty && !attendWedding) {
      actions.toastShow("일정별 참석 여부를 골라주세요");
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = "보내는 중…";
    await actions.submitRsvp({
      name,
      phone: phoneInput.value.trim(),
      attendParty,
      attendWedding,
      count,
    });
    submitBtn.disabled = false;
    submitBtn.textContent = "보내기";
    nameInput.value = "";
    phoneInput.value = "";
    attendParty = "";
    attendWedding = "";
    count = 1;
    countLabel.textContent = "1";
    paint(partyBlock.yesBtn, partyBlock.noBtn, "");
    paint(weddingBlock.yesBtn, weddingBlock.noBtn, "");
  });
  form.appendChild(submitBtn);
  body.appendChild(form);

  const close = () => actions.closeOverlays();
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", () => {
    if (!modal.hidden) close();
  });

  return {
    modal,
    setOpen(open) {
      modal.hidden = !open;
    },
  };
}

// ---------- 계좌 모달 (현재 진입 버튼 없음 — README 확정 필요 항목) ----------
export function buildAccountModal(host, backdrop, actions) {
  const { modal, body, closeBtn } = buildModalShell(host, "마음 전하실 곳");
  const wrap = el("div", "wed-account-body");
  wrap.appendChild(el("p", "", "환불은 어렵지만 밥은 확실합니다."));

  CONFIG.accounts.forEach((acc) => {
    const row = el("div", "wed-account-row");
    const group = el("div", "wed-account-row__group");
    group.appendChild(el("span", "wed-account-row__role", acc.role));
    group.appendChild(el("span", "wed-account-row__value", acc.value));
    row.appendChild(group);
    const copyBtn = el("button", "wed-account-row__copy", "복사");
    copyBtn.addEventListener("click", () => actions.copyAccount(acc.value));
    row.appendChild(copyBtn);
    wrap.appendChild(row);
  });

  body.appendChild(wrap);

  const close = () => actions.closeOverlays();
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", () => {
    if (!modal.hidden) close();
  });

  return {
    modal,
    setOpen(open) {
      modal.hidden = !open;
    },
  };
}

// ---------- 스토리 뷰어 ----------
// 세트별로 사진 개수가 다르므로(우리의 이야기 16장 / 우리의 화보 10장) 진행바·패널을
// open(set) 때마다 새로 만든다. 문구는 슬라이드가 아니라 세트 전체에 고정.
export function buildStoryOverlay(host, actions) {
  const wrap = el("div", "wed-story");
  wrap.hidden = true;

  const bars = el("div", "wed-story__bars");
  wrap.appendChild(bars);

  const head = el("div", "wed-story__head");
  head.appendChild(el("span", "wed-story__avatar", CONFIG.avatarEmoji));
  head.appendChild(el("span", "wed-story__name", CONFIG.handle));
  const closeBtn = el("button", "wed-story__close");
  closeBtn.appendChild(icon("close", 22));
  head.appendChild(closeBtn);
  wrap.appendChild(head);

  const stage = el("div", "wed-story__stage");
  const panelsHost = el("div", "wed-story__panels");
  stage.appendChild(panelsHost);
  const scrim = el("div", "wed-story__scrim");
  stage.appendChild(scrim);
  const captionEl = el("p", "wed-story__caption");
  stage.appendChild(captionEl);
  const prevBtn = el("button", "wed-story__tap-prev");
  prevBtn.setAttribute("aria-label", "이전");
  const nextBtn = el("button", "wed-story__tap-next");
  nextBtn.setAttribute("aria-label", "다음");
  stage.appendChild(prevBtn);
  stage.appendChild(nextBtn);
  wrap.appendChild(stage);

  const footer = el("div", "wed-story__footer");
  footer.appendChild(el("span", "wed-story__msg-pill", "메시지 보내기"));
  const likeBtn = el("button", "wed-story__like");
  likeBtn.appendChild(icon("heart", 24));
  footer.appendChild(likeBtn);
  wrap.appendChild(footer);

  host.appendChild(wrap);

  let index = 0;
  let timer = null;
  let panels = [];
  let fills = [];

  function paint(i) {
    panels.forEach((p, n) => p.classList.toggle("is-active", n === i));
    fills.forEach((fill, n) => {
      fill.style.animation = "none";
      fill.style.transform = n < i ? "scaleX(1)" : "scaleX(0)";
      if (n === i) {
        void fill.offsetWidth;
        fill.style.animation = "wedBar 4s linear forwards";
      }
    });
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (i >= panels.length - 1) close();
      else goTo(i + 1);
    }, 4000);
  }

  function goTo(i) {
    index = i;
    paint(i);
  }

  function open(set = 0) {
    const photos = CONFIG.storySets[set]?.photos ?? [];
    captionEl.innerHTML = CONFIG.storySets[set]?.caption ?? "";

    bars.replaceChildren();
    fills = photos.map(() => {
      const bar = el("div", "wed-story__bar");
      const fill = el("div", "wed-story__bar-fill");
      bar.appendChild(fill);
      bars.appendChild(bar);
      return fill;
    });

    panelsHost.replaceChildren();
    panels = photos.map((file, i) => {
      const panel = el("div", "wed-story__panel");
      panel.dataset.storyPanel = "";
      panel.appendChild(mediaSlot(file, `스토리 ${i + 1} · 9:16`));
      panelsHost.appendChild(panel);
      return panel;
    });

    wrap.hidden = false;
    goTo(0);
  }

  function close() {
    clearTimeout(timer);
    wrap.hidden = true;
  }

  closeBtn.addEventListener("click", close);
  nextBtn.addEventListener("click", () => {
    if (index >= panels.length - 1) close();
    else goTo(index + 1);
  });
  prevBtn.addEventListener("click", () => goTo(Math.max(0, index - 1)));
  likeBtn.addEventListener("click", (e) => actions.onLike(e, "cover"));

  return { open, close, isOpen: () => !wrap.hidden };
}

// ---------- 토스트 ----------
export function buildToast(host) {
  let node = null;
  let hideTimer = null;
  return {
    show(message) {
      node?.remove();
      clearTimeout(hideTimer);
      node = el("div", "wed-toast");
      node.appendChild(icon("circleCheckFill", 18));
      node.appendChild(document.createTextNode(message));
      host.appendChild(node);
      hideTimer = setTimeout(() => {
        node?.remove();
        node = null;
      }, 1900);
    },
  };
}

export { buildBackdropStack };
