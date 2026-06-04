/* Animated globe + parallax street scene — the aspirational motif.
   On-brand emoji actors (no hand-drawn SVG). */

function Globe() {
  return (
    <div className="globe" aria-hidden="true">
      <div className="ball">🌍</div>
      <div className="orbit"><span className="plane">✈️</span></div>
    </div>
  );
}

// repeat a set of emoji into a drifting lane
function lane(items, n = 8) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(items[i % items.length]);
  return out;
}

function StreetScene() {
  const skyline = lane(["🏠", "🏡", "🌳", "🏘️", "🌲", "🏠", "🏢", "🌳"], 16);
  const cars  = lane(["🚕", "🚗", "🚐", "🚙", "🚕", "🚌"], 8);
  const bikes = lane(["🚲", "🛴", "🚲"], 6);
  const walk  = lane(["🚶", "🧍", "🚶‍♀️", "🧑"], 10);
  return (
    <div className="scene" aria-hidden="true">
      <div className="skyline">{skyline.map((e, i) => <span key={i}>{e}</span>)}</div>
      <div className="ground"></div>
      <div className="road-dash"></div>
      <div className="lane walk">{walk.map((e, i) => <span key={i}>{e}</span>)}</div>
      <div className="lane cars">{cars.map((e, i) => <span key={i}>{e}</span>)}</div>
      <div className="lane bikes">{bikes.map((e, i) => <span key={i}>{e}</span>)}</div>
    </div>
  );
}

Object.assign(window, { Globe, StreetScene });
