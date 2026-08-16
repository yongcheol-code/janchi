// 라인 아이콘 세트 (currentColor, 24x24 기준). 특정 서비스의 로고/워드마크는 쓰지 않는다.

const s = (path, extra = "") =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}${extra}</svg>`;

export const ICONS = {
  heart: s('<path d="M12 20.5s-7-4.3-9.3-8.6C1 8.7 2 5.6 4.6 4.5c2-.8 4.1-.1 5.4 1.5l2 2.4 2-2.4c1.3-1.6 3.4-2.3 5.4-1.5 2.6 1.1 3.6 4.2 1.9 7.4C19 16.2 12 20.5 12 20.5z"/>'),
  heartFill: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.5s-7-4.3-9.3-8.6C1 8.7 2 5.6 4.6 4.5c2-.8 4.1-.1 5.4 1.5l2 2.4 2-2.4c1.3-1.6 3.4-2.3 5.4-1.5 2.6 1.1 3.6 4.2 1.9 7.4C19 16.2 12 20.5 12 20.5z"/></svg>`,
  bubble: s('<path d="M21 12c0 4.4-4 8-9 8-1.2 0-2.3-.2-3.4-.6L3 21l1.4-4.6C3.5 15 3 13.6 3 12c0-4.4 4-8 9-8s9 3.6 9 8z"/>'),
  send: s('<path d="M22 3 2 11l7 3 3 7 10-18z"/>'),
  share: s('<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.6 15.7 6.4M8.3 13.4l7.4 4.2"/>'),
  bookmark: s('<path d="M6 3h12v18l-6-4-6 4z"/>'),
  coins: s('<circle cx="9" cy="9" r="5.5"/><circle cx="15" cy="15" r="5.5"/>'),
  copy: s('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M15 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4"/>'),
  link: s('<path d="M10 14a4 4 0 0 0 5.6.4l3-3a4 4 0 0 0-5.6-5.6l-1.5 1.4"/><path d="M14 10a4 4 0 0 0-5.6-.4l-3 3a4 4 0 0 0 5.6 5.6l1.4-1.4"/>'),
  close: s('<path d="M5 5l14 14M19 5 5 19"/>'),
  plus: s('<path d="M12 5v14M5 12h14"/>'),
  minus: s('<path d="M5 12h14"/>'),
  chevronRight: s('<path d="M9 5l7 7-7 7"/>'),
  moreHorizontal: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>`,
  circleCheckFill: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.7 2.7L16.3 9" stroke="#1a1a1a" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  checkCircle: s('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16.3 9"/>'),
  kakao: s('<path d="M21 12c0 4.4-4 8-9 8-1.2 0-2.3-.2-3.4-.6L3 21l1.4-4.6C3.5 15 3 13.6 3 12c0-4.4 4-8 9-8s9 3.6 9 8z"/>'),
};

export function icon(name, size = 24) {
  const markup = ICONS[name] ?? ICONS.close;
  const wrap = document.createElement("span");
  wrap.className = "icon";
  wrap.style.width = `${size}px`;
  wrap.style.height = `${size}px`;
  wrap.innerHTML = markup;
  return wrap;
}
