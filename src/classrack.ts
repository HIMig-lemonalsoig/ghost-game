// ─── Class rack: classes hang like garments on a bamboo rail ─────────────────
// Ports of two 21st.dev components, vanilla TS:
//  • "Coverflow Carousel" (ruixen.ui) — fractional position, pitch/tilt/depth
//    with a distance falloff, reversed perspective, drag with a flick carry,
//    exponential settle. Here the "covers" are hanging garments.
//  • "Chained Spring Arc Carousel" (aloksivastava1025 / Cue) — springs whose
//    motion ripples outward from the leader. Here each garment is a pendulum on
//    its hook: when the rack slides, the ones nearest the centre swing first and
//    the swing travels down the rail, then everything settles.
// Click a garment, drag / swipe the rail sideways, the ‹ › buttons or the arrow
// keys. Scrolling up/down never changes the class. Reduced motion: no swinging, instant moves.

export interface RackItem { id: string; html: string; accent: string; locked: boolean; }
export interface Rack { select(index: number, animate?: boolean): void; destroy(): void; }

const PITCH = 0.98;     // card widths between hangers
const ROTATE = 22;      // tilt of the first neighbour (deg)
const DEPTH = 0.42;     // recession of the first neighbour (card widths)
const FALLOFF = 0.6;
const FADE = 0.13;

export function createRack(host: HTMLElement, items: RackItem[], start: number, onSelect: (index: number) => void): Rack {
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  host.innerHTML = `
    <div class="rack" tabindex="0" role="listbox" aria-label="Classes (use arrow keys)">
      <div class="rack-pole" aria-hidden="true"><i class="rack-cap l"></i><i class="rack-cap r"></i></div>
      <div class="rack-stage">${items.map((it, i) => `
        <div class="hanger${it.locked ? " locked" : ""}" data-rack="${i}" style="--accent:${it.accent}" role="option" aria-selected="false">
          <div class="hang">
            <svg class="hook" viewBox="0 0 24 34" aria-hidden="true"><path d="M12 33 V20 M12 20 C12 14 20 14 20 8 C20 3 16 1 12 1 C8 1 5 4 5 8"/></svg>
            <div class="garment">${it.html}</div>
          </div>
        </div>`).join("")}
      </div>
      <button class="rack-nav prev" type="button" aria-label="Previous class">‹</button>
      <button class="rack-nav next" type="button" aria-label="Next class">›</button>
    </div>`;
  const root = host.querySelector<HTMLElement>(".rack")!;
  const stage = host.querySelector<HTMLElement>(".rack-stage")!;
  const els = Array.from(host.querySelectorAll<HTMLElement>(".hanger"));
  const n = items.length;

  let pos = start, target = start, selected = start;
  let raf = 0, lastT = 0, width = 150;
  // Pendulum per hanger (angle in deg, velocity in deg/s), slightly different stiffness each.
  const swing = items.map((_, i) => ({ a: 0, v: 0, k: 70 + ((i * 37) % 23), delay: 0 }));
  let lastPos = pos;

  const measure = () => { width = els[0]?.offsetWidth || 150; };
  const paint = () => {
    const pitch = width * PITCH;
    for (let i = 0; i < n; i++) {
      const off = i - pos, d = Math.abs(off);
      const ramp = Math.pow(d, FALLOFF);
      const tilt = Math.min(ROTATE * ramp, 70) * Math.sign(off);
      const sc = 1 + 0.14 * Math.max(0, 1 - d);    // the chosen one steps forward
      const el = els[i];
      el.style.transform = `translateX(calc(-50% + ${(off * pitch).toFixed(1)}px)) translateZ(${(-DEPTH * width * ramp).toFixed(1)}px) rotateY(${(tilt).toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      el.style.opacity = String(Math.max(0, 1 - FADE * d).toFixed(3));
      el.style.zIndex = String(100 - Math.round(d * 2));
      el.style.setProperty("--swing", `${swing[i].a.toFixed(2)}deg`);
      el.style.setProperty("--near", Math.max(0, 1 - d).toFixed(3));
    }
  };

  const tick = (now: number) => {
    const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 1 / 60;
    lastT = now;
    // Rail settle (exponential ease-out, as in the coverflow).
    if (!dragging) pos += (target - pos) * (1 - Math.pow(1 - 0.16, dt * 60));
    const railV = (pos - lastPos) / dt;   // cards per second
    lastPos = pos;
    // Garments are pushed by the rail's motion; the push reaches the far ones a
    // beat later (chained ripple outward from the centre).
    let moving = Math.abs(target - pos) > 0.0005 || dragging;
    for (let i = 0; i < n; i++) {
      const s = swing[i];
      const d = Math.abs(i - pos);
      const reach = Math.exp(-d * 0.35);
      const drive = reduced ? 0 : -railV * 20 * reach;
      s.v += (-s.k * s.a - 5.2 * s.v + drive * 9) * dt;
      s.a += s.v * dt;
      s.a = Math.max(-24, Math.min(24, s.a));
      if (Math.abs(s.a) > 0.05 || Math.abs(s.v) > 0.5) moving = true;
    }
    paint();
    if (moving) raf = requestAnimationFrame(tick);
    else { raf = 0; lastT = 0; }
  };
  const wake = () => { if (!raf) { lastT = 0; raf = requestAnimationFrame(tick); } };

  const setSelected = (i: number) => {
    els.forEach((el, k) => { el.classList.toggle("sel", k === i); el.setAttribute("aria-selected", String(k === i)); });
    if (i !== selected) { selected = i; onSelect(i); }
  };

  const select = (i: number, animate = true) => {
    i = Math.max(0, Math.min(n - 1, i));
    target = i;
    if (!animate || reduced) { pos = lastPos = i; paint(); }
    els.forEach((el, k) => { el.classList.toggle("sel", k === i); el.setAttribute("aria-selected", String(k === i)); });
    selected = i;
    wake();
  };

  // ── Input ──
  let dragging = false, dragX = 0, dragY = 0, dragPos = 0, dragV = 0, dragT = 0, moved = 0, movedY = 0;
  let downOn: HTMLElement | null = null;   // the garment under the finger when pressed (pointer capture hides it later)
  root.addEventListener("pointerdown", e => {
    if ((e.target as HTMLElement).closest(".rack-nav")) return;
    downOn = (e.target as HTMLElement).closest<HTMLElement>("[data-rack]");
    dragging = true; dragX = e.clientX; dragY = e.clientY; dragPos = pos; dragV = 0; dragT = performance.now(); moved = 0; movedY = 0;
    root.setPointerCapture(e.pointerId);
    wake();
  });
  root.addEventListener("pointermove", e => {
    if (!dragging) return;
    const now = performance.now(), prev = pos;
    moved = Math.max(moved, Math.abs(e.clientX - dragX));
    movedY = Math.max(movedY, Math.abs(e.clientY - dragY));
    if (movedY > 10 && moved < 10) return;   // scrolling the page up/down, not dragging the rail
    pos = Math.max(-0.4, Math.min(n - 0.6, dragPos - (e.clientX - dragX) / (width * PITCH)));
    dragV = ((pos - prev) / Math.max(now - dragT, 1)) * 1000;
    dragT = now;
    const near = Math.round(Math.max(0, Math.min(n - 1, pos)));
    if (near !== selected) setSelected(near);
    wake();
  });
  const end = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    try { root.releasePointerCapture(e.pointerId); } catch { /* not captured */ }
    // The browser took over to scroll the page (touch), or the finger mostly moved up/down:
    // that was a scroll, never a pick. Settle back on the current class.
    if (e.type === "pointercancel" || (movedY > 10 && moved < 10)) { target = selected; wake(); return; }
    if (moved < 6) {   // a click / tap: pick the garment that was pressed
      const i = downOn ? Number(downOn.dataset.rack) : selected;
      target = i; setSelected(i); wake();
      return;
    }
    const carried = Math.max(-2, Math.min(2, dragV * 0.18));   // a flick carries up to two
    target = Math.max(0, Math.min(n - 1, Math.round(pos + carried)));
    setSelected(target);
    wake();
  };
  root.addEventListener("pointerup", end);
  root.addEventListener("pointercancel", end);
  // Mouse wheel / trackpad: only a sideways swipe moves the rail. Scrolling up/down scrolls
  // the page as normal (it used to switch classes on the way down to the Start button).
  let wheelLock = 0;
  root.addEventListener("wheel", e => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 12) return;
    e.preventDefault();
    const now = performance.now();
    if (now < wheelLock) return;
    wheelLock = now + 220;
    target = Math.max(0, Math.min(n - 1, Math.round(target) + Math.sign(e.deltaX)));
    setSelected(target); wake();
  }, { passive: false });
  // Keyboard ← → is handled by the menu itself (main.ts menuKeys), anywhere on the screen.
  host.querySelector(".rack-nav.prev")!.addEventListener("click", () => { target = Math.max(0, Math.round(target) - 1); setSelected(target); wake(); });
  host.querySelector(".rack-nav.next")!.addEventListener("click", () => { target = Math.min(n - 1, Math.round(target) + 1); setSelected(target); wake(); });

  const ro = new ResizeObserver(() => { measure(); paint(); });
  ro.observe(stage);
  measure();
  select(start, false);
  // A little "the rack was just rolled out" sway on first show.
  if (!reduced) swing.forEach((s, i) => { s.v = (i % 2 ? -1 : 1) * (40 + (i * 13) % 30) * Math.exp(-Math.abs(i - start) * 0.25); });
  wake();

  return {
    select,
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); },
  };
}
