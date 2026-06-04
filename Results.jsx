/* Comparison results band — three sorted rows, winner highlighted. */
function Results({ query }) {
  const { city, airport, pax } = query;
  const { rows, dearest, cheapest, fixed, isVan } = window.compareFares(city, airport, pax);
  const euro = window.euro;
  const cityName = window.CITIES[city].name;
  const airName = window.AIRPORTS[airport].name;
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <section className="results-wrap">
      <div className="container">
        <div className="results-meta">
          <span>🚗 {cityName} ⇄ {airName} · {isVan ? "5–8 personen" : "1–4 personen"}</span>
          <span>💸 Bespaar tot {euro(dearest - cheapest)}</span>
        </div>
        <div className="results">
          {rows.map((r, i) => {
            const best = i === 0;
            const save = dearest - r.price;
            return (
              <div key={r.name} className={"result" + (best ? " best" : "")} style={{ animationDelay: i * 70 + "ms" }}>
                <div className="ico">{r.ico}</div>
                <div className="info">
                  <h3>
                    {medals[i] || ""} {r.name}
                    {best && <span className="badge">Goedkoopste</span>}
                    {r.own && !best && <span className="badge gray">Vaste prijs</span>}
                  </h3>
                  <div className="sub">{r.sub}{save >= 1 ? " · bespaar " + euro(save) : ""}</div>
                </div>
                <div className="price">
                  <div className="amount">{euro(r.price)}</div>
                  {r.book
                    ? <a className="book" href={r.book} target="_blank" rel="noopener">Boek nu</a>
                    : <a className="book ghost" href={"tel:" + window.PHONE}>Bel ons</a>}
                </div>
              </div>
            );
          })}
        </div>
        <p className="disclaimer">
          {fixed
            ? "Schipholprijs is een vaste prijs (excl. eventuele tol/parkeren). Uber/Bolt zijn schattingen ter vergelijking."
            : "Prijs voor deze luchthaven is een richtprijs — bel of boek voor de exacte vaste prijs. Uber/Bolt zijn schattingen."}
        </p>
      </div>
    </section>
  );
}
Object.assign(window, { Results });
