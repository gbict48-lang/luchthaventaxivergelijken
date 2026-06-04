/* Hero: headline + selling points, the fare calculator card, globe & street scene. */
const { useState } = React;

function Calculator({ query, onSubmit }) {
  const [city, setCity] = useState(query.city);
  const [airport, setAirport] = useState(query.airport);
  const [pax, setPax] = useState(query.pax);

  const submit = (e) => { e.preventDefault(); onSubmit({ city, airport, pax }); };

  return (
    <div className="calc card">
      <h2 className="calc-title">Bereken je vaste prijs</h2>
      <form onSubmit={submit}>
        <label className="field">
          <span>Vertrek / bestemming (plaats)</span>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            {Object.keys(window.CITIES).map((k) => (
              <option key={k} value={k}>{window.CITIES[k].name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Luchthaven</span>
          <select value={airport} onChange={(e) => setAirport(e.target.value)}>
            {Object.keys(window.AIRPORTS).map((k) => (
              <option key={k} value={k}>{window.AIRPORTS[k].name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Aantal personen</span>
          <select value={pax} onChange={(e) => setPax(e.target.value)}>
            <option value="sedan">1–4 personen (taxi)</option>
            <option value="van">5–8 personen (minibus)</option>
          </select>
        </label>
        <button className="btn-primary" type="submit">Vergelijk prijzen</button>
      </form>
    </div>
  );
}

function Hero({ query, onSubmit }) {
  return (
    <section className="hero" id="vergelijk">
      <div className="hero-bg" aria-hidden="true"></div>
      <Globe />
      <div className="hero-inner">
        <div className="hero-copy">
          <h1>De goedkoopste <span className="accent">luchthaventaxi</span> vanaf Almere</h1>
          <p className="lead">Vergelijk in 5 seconden de vaste prijs naar elke luchthaven — en boek met een vaste chauffeur, zonder verrassingen.</p>
          <ul className="hero-points">
            <li>✅ Vaste prijs, geen taximeter</li>
            <li>✅ 24/7 · vaste chauffeur</li>
            <li>✅ Van én naar de luchthaven</li>
          </ul>
        </div>
        <Calculator query={query} onSubmit={onSubmit} />
      </div>
      <StreetScene />
    </section>
  );
}
Object.assign(window, { Hero, Calculator });
