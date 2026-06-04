/* TaxiGeld web — DotGlobe: a rotating sphere of dots with glowing green route
   arcs. Self-contained canvas (no textures/assets). Echoes the app's stylized
   green-halo globe ("Vergelijk de wereld rond 🌍"). */
const { useRef, useEffect } = React;

function fib(n) {
  const pts = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = phi * i;
    pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
  }
  return pts;
}

function DotGlobe({ spin = 1 }) {
  const ref = useRef(null);
  const spinRef = useRef(spin);
  spinRef.current = spin;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let raf, W, H, R, dots, arcs, t = 0, rot = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(W, H) * 0.42;
    }
    resize();
    dots = fib(620);
    // a few great-circle-ish arcs between random surface points
    arcs = Array.from({ length: 5 }, () => {
      const a = dots[(Math.random() * dots.length) | 0];
      const b = dots[(Math.random() * dots.length) | 0];
      return { a, b, phase: Math.random() };
    });

    const tilt = 0.38;
    const cosT = Math.cos(tilt), sinT = Math.sin(tilt);

    function project([x, y, z]) {
      // rotate around Y
      const cx = Math.cos(rot), sx = Math.sin(rot);
      let X = x * cx - z * sx;
      let Z = x * sx + z * cx;
      let Y = y;
      // tilt around X
      const Y2 = Y * cosT - Z * sinT;
      const Z2 = Y * sinT + Z * cosT;
      return { x: W / 2 + X * R, y: H / 2 + Y2 * R, z: Z2 };
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);
      rot += 0.0016 * spinRef.current;
      t += 0.012;

      // atmosphere halo
      const g = ctx.createRadialGradient(W / 2, H / 2, R * 0.6, W / 2, H / 2, R * 1.25);
      g.addColorStop(0, "rgba(56,182,255,0.10)");
      g.addColorStop(1, "rgba(56,182,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(W / 2, H / 2, R * 1.25, 0, Math.PI * 2); ctx.fill();

      // dots (depth-shaded)
      for (const d of dots) {
        const p = project(d);
        const front = (p.z + 1) / 2; // 0 back .. 1 front
        const size = 0.6 + front * 1.7;
        const alpha = 0.12 + front * 0.6;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${Math.round(40 + front * 30)}, ${Math.round(200 + front * 17)}, ${Math.round(130 + front * 20)}, ${alpha})`;
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // glowing arcs with a travelling pulse
      for (const arc of arcs) {
        const steps = 26;
        const pa = arc.a, pb = arc.b;
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = "rgba(56,182,255,0.28)";
        ctx.beginPath();
        let started = false;
        const pts = [];
        for (let i = 0; i <= steps; i++) {
          const s = i / steps;
          // slerp-ish lift off the surface
          const lift = 1 + Math.sin(s * Math.PI) * 0.18;
          const x = (pa[0] * (1 - s) + pb[0] * s) * lift;
          const y = (pa[1] * (1 - s) + pb[1] * s) * lift;
          const z = (pa[2] * (1 - s) + pb[2] * s) * lift;
          const m = Math.hypot(x, y, z) || 1;
          const p = project([x / m * lift, y / m * lift, z / m * lift]);
          pts.push(p);
          if (p.z > -0.2) {
            if (!started) { ctx.moveTo(p.x, p.y); started = true; }
            else ctx.lineTo(p.x, p.y);
          } else started = false;
        }
        ctx.stroke();
        // pulse
        const pp = pts[Math.floor(((t * 0.25 + arc.phase) % 1) * steps)];
        if (pp && pp.z > -0.2) {
          ctx.beginPath();
          ctx.fillStyle = "rgba(120,255,200,0.95)";
          ctx.shadowColor = "rgba(56,182,255,0.9)";
          ctx.shadowBlur = 10;
          ctx.arc(pp.x, pp.y, 2.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      raf = requestAnimationFrame(frame);
    }
    frame();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className="globe-canvas" aria-hidden="true"></canvas>;
}
Object.assign(window, { DotGlobe });
