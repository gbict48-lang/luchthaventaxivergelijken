/* Lucide icon helper — the app uses SF Symbols; web substitutes Lucide
   (clean 2px rounded strokes). We inject a <i data-lucide> into a React-owned
   span and let lucide.createIcons() swap it for an <svg>; React never owns the
   swapped node, so re-renders stay safe. */
const { useRef: useIcoRef, useEffect: useIcoEffect } = React;

function Icon({ name, size = 18, stroke = 2, className = "", style = {} }) {
  const ref = useIcoRef(null);
  useIcoEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = '<i data-lucide="' + name + '"></i>';
    const L = window.lucide;
    if (L && L.createIcons) {
      try { L.createIcons({ attrs: { width: size, height: size, "stroke-width": stroke } }); }
      catch (e) { /* ignore */ }
      const svg = host.querySelector("svg");
      if (svg) {
        svg.setAttribute("width", size);
        svg.setAttribute("height", size);
        svg.setAttribute("stroke-width", stroke);
      }
    }
  });
  return <span ref={ref} className={"lucide " + className}
               style={{ display: "inline-flex", lineHeight: 0, ...style }} aria-hidden="true"></span>;
}
Object.assign(window, { Icon });
