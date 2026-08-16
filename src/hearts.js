// 하트 폭죽 — design_handoff_wedding_reels 스펙의 wedFloat/wedPop 키프레임을 그대로 사용.
// host는 앱 셸 내부에 절대 위치로 깔린 버스트 레이어(좌표는 host 기준 상대 좌표).

const COMBO_LABELS = ["x3 COMBO!", "x5 COMBO!", "x10 PERFECT!", "x20 축의금 인정!"];

export function createHeartBurst(host, { comboEnabled = true } = {}) {
  let combo = 0;
  let comboTimer = null;

  function spawnSmallHearts(cx, cy) {
    for (let i = 0; i < 10; i++) {
      const el = document.createElement("span");
      el.className = "wed-heart-particle";
      el.textContent = "❤";
      const size = 14 + Math.random() * 22;
      const dx = ((Math.random() - 0.5) * 190).toFixed(0);
      const r = ((Math.random() - 0.5) * 60).toFixed(0);
      const dur = 900 + Math.random() * 700;
      el.style.cssText = `left:${cx}px;top:${cy}px;font-size:${size}px;--dx:${dx}px;--r:${r}deg;animation:wedFloat ${dur}ms cubic-bezier(0.2,0,0,1) forwards`;
      host.appendChild(el);
      setTimeout(() => el.remove(), 1700);
    }
  }

  function spawnBigHeart(cx, cy) {
    const big = document.createElement("span");
    big.className = "wed-heart-big";
    big.textContent = "❤";
    big.style.cssText = `left:${cx}px;top:${cy}px;animation:wedPop 700ms cubic-bezier(0.2,0,0,1) forwards`;
    host.appendChild(big);
    setTimeout(() => big.remove(), 750);
  }

  function spawnComboLabel() {
    const label =
      combo >= 20 ? COMBO_LABELS[3] : combo >= 10 ? COMBO_LABELS[2] : combo >= 5 ? COMBO_LABELS[1] : COMBO_LABELS[0];
    const tag = document.createElement("span");
    tag.className = "wed-combo-tag";
    tag.textContent = label;
    tag.style.animation = "wedPop 800ms cubic-bezier(0.2,0,0,1) forwards";
    host.appendChild(tag);
    setTimeout(() => tag.remove(), 820);
  }

  function spawn(cx, cy) {
    spawnSmallHearts(cx, cy);
    spawnBigHeart(cx, cy);

    if (!comboEnabled) return;
    combo += 1;
    clearTimeout(comboTimer);
    comboTimer = setTimeout(() => {
      combo = 0;
    }, 1400);
    if (combo >= 3) spawnComboLabel();
  }

  return {
    spawn,
    spawnAt(clientX, clientY) {
      const rect = host.getBoundingClientRect();
      spawn(clientX - rect.left, clientY - rect.top);
    },
  };
}
