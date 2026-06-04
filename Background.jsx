/* TaxiGeld web — TrafficBackground: a living street behind the app.
   Ported in spirit from AnimatedTrafficBackground.swift (drifting vehicles &
   scenery in lanes). Extended for web/mobile: it SPEEDS UP while you scroll
   and SPAWNS a zooming car + ripple wherever you tap. */
const { useRef: useBgRef, useEffect: useBgEffect } = React;

const ACTORS = [
  { e: "🚕", size: 30, base: 0.055 }, { e: "🌳", size: 24, base: 0.020 },
  { e: "🚌", size: 28, base: 0.038 }, { e: "🏢", size: 30, base: 0.016 },
  { e: "🚗", size: 26, base: 0.066 }, { e: "🏠", size: 24, base: 0.020 },
  { e: "🚲", size: 24, base: 0.050 }, { e: "🚊", size: 28, base: 0.030 },
  { e: "🌲", size: 26, base: 0.024 }, { e: "🚙", size: 28, base: 0.044 },
  { e: "🧍", size: 20, base: 0.034 }, { e: "🚶", size: 20, base: 0.030 },
];

function TrafficBackground() {
  const ref = useBgRef(null);

  useBgEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W, H, raf, last = performance.now();
    let speed = 1, targetSpeed = 1;
    const bursts = []; // {x,y,vx,emoji,life}
    const ripples = []; // {x,y,r,life}

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // build drifting lanes spread down the viewport
    const N = 13;
    const lanes = [];
    for (let i = 0; i < N; i++) {
      const a = ACTORS[i % ACTORS.length];
      lanes.push({ ...a, y: (i + 0.5) / N, x: Math.random(), flip: Math.random() > 0.5 });
    }

    // scroll → speed boost
    let lastScroll = window.scrollY;
    function onScroll() {
      const dy = Math.abs(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
      targetSpeed = Math.min(6, 1 + dy * 0.18);
    }
    // tap → spawn car + ripple
    function onTap(ev) {
      const x = ev.clientX ?? (ev.touches && ev.touches[0]?.clientX);
      const y = ev.clientY ?? (ev.touches && ev.touches[0]?.clientY);
      if (x == null) return;
      const dir = x < W / 2 ? 1 : -1;
      bursts.push({ x, y, vx: dir * (340 + Math.random() * 160), emoji: ["🚕", "🚗", "🏎️", "🛵"][(Math.random() * 4) | 0], life: 1 });
      ripples.push({ x, y, r: 6, life: 1 });
      targetSpeed = Math.min(7, targetSpeed + 1.6);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onTap);
    const ro = new ResizeObserver(resize);
    ro.observe(document.body);

    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      ctx.clearRect(0, 0, W, H);
      speed += (targetSpeed - speed) * Math.min(1, dt * 4);
      targetSpeed += (1 - targetSpeed) * Math.min(1, dt * 1.2);

      ctx.textBaseline = "middle";
      ctx.globalAlpha = 0.16;
      for (const l of lanes) {
        l.x += l.base * speed * dt;
        if (l.x > 1.1) l.x = -0.1;
        const px = l.x * (W + 80) - 40;
        const py = l.y * H;
        ctx.save();
        ctx.translate(px, py);
        if (l.flip) ctx.scale(-1, 1);
        ctx.font = `${l.size}px serif`;
        ctx.fillText(l.e, 0, 0);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += 220 * dt; r.life -= dt * 1.6;
        if (r.life <= 0) { ripples.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,217,117,${0.5 * r.life})`;
        ctx.lineWidth = 2;
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      // tapped cars
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.x += b.vx * dt; b.life -= dt * 0.55;
        if (b.life <= 0 || b.x < -60 || b.x > W + 60) { bursts.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, b.life));
        ctx.translate(b.x, b.y);
        if (b.vx < 0) ctx.scale(-1, 1);
        ctx.font = "34px serif";
        ctx.textBaseline = "middle";
        ctx.fillText(b.emoji, 0, 0);
        ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onTap);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="traffic-bg" aria-hidden="true"></canvas>;
}
Object.assign(window, { TrafficBackground });
