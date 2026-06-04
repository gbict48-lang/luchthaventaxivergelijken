/* TaxiGeld web — route fields, location-search sheet, when-picker, sort, and
   the result cards. Mirrors CompareView / RideQuoteCard / RouteField. */
const { useState: useCState, useEffect: useCEffect, useRef: useCRef } = React;

/* ---- One clickable address line --------------------------------------- */
function RouteField({ kind, place, placeholder, onTap }) {
  return (
    <button className="route-field" onClick={onTap}>
      <span className={"route-dot " + kind}></span>
      <span className="rf-body">
        {place
          ? <React.Fragment>
              <div className="rf-title">{place.title}</div>
              {place.subtitle ? <div className="rf-sub">{place.subtitle}</div> : null}
            </React.Fragment>
          : <div className="rf-title placeholder">{placeholder}</div>}
      </span>
      <Icon name="chevron-right" size={16} className="rf-chev" />
    </button>
  );
}

function RouteCard({ origin, destination, onEdit, onSwap }) {
  return (
    <div className="route-card">
      <div className="route-fields">
        <RouteField kind="origin" place={origin} placeholder="Vertrekpunt" onTap={() => onEdit("origin")} />
        <div className="route-divider"></div>
        <RouteField kind="dest" place={destination} placeholder="Waar naartoe?" onTap={() => onEdit("destination")} />
      </div>
      {(origin || destination) && (
        <button className="swap-btn" onClick={onSwap} aria-label="Wissel">
          <Icon name="arrow-up-down" size={18} />
        </button>
      )}
    </div>
  );
}

/* ---- Location search bottom-sheet (curated + live OSM) ----------------- */
function LocationSearch({ title, onPick, onClose }) {
  const [q, setQ] = useCState("");
  const [results, setResults] = useCState(window.localSearch ? window.PLACES.slice(0, 7) : []);
  const inputRef = useCRef(null);

  useCEffect(() => { inputRef.current && inputRef.current.focus(); }, []);
  useCEffect(() => {
    let alive = true;
    if (!q.trim()) { setResults(window.PLACES.slice(0, 7)); return; }
    setResults(window.localSearch(q));
    const id = setTimeout(async () => {
      const merged = await window.searchPlaces(q);
      if (alive && merged.length) setResults(merged);
    }, 280);
    return () => { alive = false; clearTimeout(id); };
  }, [q]);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip"></div>
        <h3>{title}</h3>
        <div className="search-box">
          <Icon name="search" size={18} />
          <input ref={inputRef} value={q} placeholder="Zoek adres, stad of luchthaven"
                 onChange={(e) => setQ(e.target.value)} />
          {q && <button className="q-cta open" style={{ padding: "4px 8px" }} onClick={() => setQ("")}><Icon name="x" size={14} /></button>}
        </div>
        <div className="suggestions">
          {results.length === 0
            ? <div className="suggestion empty">Geen plaatsen gevonden — typ verder…</div>
            : results.map((p, i) => (
              <button key={i} className="suggestion" onClick={() => { onPick(p); onClose(); }}>
                <span className="pin"><Icon name="map-pin" size={16} /></span>
                <span style={{ minWidth: 0 }}>
                  <div className="s-title">{p.title}</div>
                  {p.subtitle ? <div className="s-sub">{p.subtitle}</div> : null}
                </span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

/* ---- "Voor wanneer?" datetime + quick chips ---------------------------- */
function pad(n) { return String(n).padStart(2, "0"); }
function toLocal(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function WhenField({ value, onChange }) {
  const now = new Date();
  const tonight = new Date(now); tonight.setHours(22, 0, 0, 0);
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1); tomorrow.setHours(8, 0, 0, 0);
  const chips = [
    { label: "Nu", date: null },
    { label: "Vanavond 22:00", date: tonight },
    { label: "Morgen 08:00", date: tomorrow },
  ];
  const activeIdx = value == null ? 0 : -1;
  return (
    <div className="when">
      <div className="when-row">
        <Icon name="calendar-clock" size={20} />
        <div style={{ flex: 1 }}>
          <label>Voor wanneer?</label>
          <input type="datetime-local"
                 value={value == null ? toLocal(new Date()) : toLocal(value)}
                 onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)} />
        </div>
      </div>
      <div className="when-chips">
        {chips.map((c, i) => (
          <button key={i} className={"chip" + (i === activeIdx ? " active" : "")}
                  onClick={() => onChange(c.date)}>{c.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ---- Sort segmented control ------------------------------------------- */
const SORTS = [
  { id: "cheapest", label: "Goedkoopst", icon: "euro" },
  { id: "fastest", label: "Snelst", icon: "clock" },
  { id: "topRated", label: "Best", icon: "star" },
];
function SortPicker({ value, onChange }) {
  return (
    <div className="segmented">
      {SORTS.map((s) => (
        <button key={s.id} className={value === s.id ? "active" : ""} onClick={() => onChange(s.id)}>
          <Icon name={s.icon} size={14} />{s.label}
        </button>
      ))}
    </div>
  );
}

/* ---- Result card ------------------------------------------------------- */
const MEDALS = ["🥇", "🥈", "🥉"];
function ResultCard({ quote, cheapest, rank, savings, onAction }) {
  const meta = window.PROVIDERS[quote.provider];
  const surgePct = Math.round((quote.surge - 1) * 100);
  return (
    <div className={"quote" + (cheapest ? " cheapest" : "")}>
      <span className="q-icon" style={{ background: "color-mix(in srgb, " + meta.tint + " 18%, transparent)", color: meta.tint }}>
        <Icon name={meta.icon} size={22} />
      </span>
      <div className="q-main">
        <div className="q-title">
          {rank <= 3 && <span className="medal">{MEDALS[rank - 1]}</span>}
          <span className="name">{quote.provider}</span>
          {cheapest && <span className="tag best">Goedkoopste</span>}
          {quote.surge > 1.02 && <span className="tag surge">+{surgePct}% drukte</span>}
        </div>
        <div className="q-note">{quote.note || meta.tagline}</div>
        <div className="q-meta">
          <span className="m"><Icon name="star" size={12} className="star" />{quote.rating.toFixed(1)}</span>
          <span className="m"><Icon name="clock" size={12} />{quote.pickupEtaMinutes === 0 ? "op afspraak" : "± " + quote.pickupEtaMinutes + " min"}</span>
          {savings >= 1 && <span className="m save"><Icon name="arrow-down-circle" size={12} />bespaar {window.euro(savings)}</span>}
        </div>
      </div>
      <div className="q-right">
        <div className="q-price">{window.euro(quote.price)}</div>
        {quote.isEstimate && <div className="q-range">{window.euroRange(quote.priceLow, quote.priceHigh)}</div>}
        {quote.isBookable
          ? <button className="q-cta book" onClick={onAction}>Boeken</button>
          : meta.deepLink
            ? <button className="q-cta open" onClick={onAction}>Openen<Icon name="arrow-up-right" size={13} /></button>
            : <button className="q-cta open" onClick={onAction}>Bel</button>}
      </div>
    </div>
  );
}

Object.assign(window, { RouteCard, LocationSearch, WhenField, SortPicker, ResultCard });
