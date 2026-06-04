/* Hero: headline + app-style fare calculator with address autocomplete. */
const { useState: useHS, useRef: useHR, useEffect: useHE } = React;

/* One address field with live suggestions (curated NL list + OpenStreetMap). */
function AddressField({ label, dot, value, onPick }) {
  const [q, setQ] = useHS(value ? value.title : "");
  const [list, setList] = useHS([]);
  const [open, setOpen] = useHS(false);
  const [loading, setLoading] = useHS(false);
  const box = useHR(null);

  useHE(() => {
    if (!q || q.length < 2) { setList([]); return; }
    if (value && q === value.title) return; // already chosen
    let alive = true; setLoading(true);
    const t = setTimeout(async () => {
      const res = await window.searchPlaces(q);
      if (alive) { setList(res); setOpen(true); setLoading(false); }
    }, 180);
    return () => { alive = false; clearTimeout(t); };
  }, [q]);

  useHE(() => {
    const onDoc = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, []);

  const choose = (p) => { onPick(p); setQ(p.title); setList([]); setOpen(false); };

  return (
    <div className="field ac" ref={box}>
      <span>{label}</span>
      <div className="ac-input">
        <i className="dot" style={{ background: dot }}></i>
        <input type="text" value={q} placeholder="Typ een adres of plaats…"
               autoComplete="off" autoCapitalize="words"
               onChange={(e) => { setQ(e.target.value); }}
               onFocus={() => list.length && setOpen(true)} />
        {loading && <span className="ac-spin"></span>}
      </div>
      {open && list.length > 0 && (
        <div className="ac-list">
          {list.map((p, i) => (
            <button type="button" key={i} className="ac-item" onClick={() => choose(p)}>
              <span className="ac-pin">📍</span>
              <span className="ac-tx"><strong>{p.title}</strong><small>{p.subtitle || p.city}</small></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Calculator(props) {
  const { origin, destination, pax, setOrigin, setDestination, setPax, onCompare, busy } = props;
  return (
    <div className="calc card">
      <h2 className="calc-title">Bereken & vergelijk je rit</h2>
      <AddressField label="Vertrekpunt" dot="#5c8cff" value={origin} onPick={setOrigin} />
      <AddressField label="Bestemming (bijv. Schiphol)" dot="var(--green-bright)" value={destination} onPick={setDestination} />
      <label className="field">
        <span>Aantal personen</span>
        <select value={pax} onChange={(e) => setPax(e.target.value)}>
          <option value="sedan">1–4 personen (taxi)</option>
          <option value="van">5–8 personen (minibus)</option>
        </select>
      </label>
      <button className="btn-primary" onClick={onCompare} disabled={!origin || !destination || busy}>
        {busy ? "Prijzen ophalen…" : "Vergelijk prijzen"}
      </button>
    </div>
  );
}

function Hero(props) {
  return (
    <section className="hero" id="vergelijk">
      <div className="hero-bg" aria-hidden="true"></div>
      <Globe />
      <div className="hero-inner">
        <div className="hero-copy">
          <h1>De goedkoopste <span className="accent">luchthaventaxi</span></h1>
          <p className="lead">Typ je vertrek- en bestemmingsadres en vergelijk onze vaste prijs met Uber en Bolt — vanaf élke locatie, naar elke luchthaven.</p>
          <ul className="hero-points">
            <li>✅ Vaste prijs, geen taximeter</li>
            <li>✅ 24/7 · vaste chauffeur</li>
            <li>✅ Van én naar de luchthaven</li>
          </ul>
        </div>
        <Calculator {...props} />
      </div>
    </section>
  );
}
Object.assign(window, { Hero, Calculator, AddressField });
