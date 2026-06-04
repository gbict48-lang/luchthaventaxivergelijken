/* Results — app engine quotes, cheapest first, with Uber/Bolt deep-links. */
const PROVIDER_ICONS = { TaxiGeld: "🚕", Uber: "⬛", Bolt: "🟩", "Lokale taxi": "🚖" };

function Results({ raw, origin, destination, summary }) {
  if (!raw || !raw.length || !origin || !destination) return null;
  const euro = window.euro, P = window.PROVIDERS;
  const prices = raw.map((q) => q.price);
  const maxP = Math.max(...prices), minP = Math.min(...prices);
  const medals = ["🥇", "🥈", "🥉"];
  const act = (q) => window.Booking.open(q.provider, origin, destination);

  return (
    <section className="results-wrap" id="uitkomst">
      <div className="container">
        <div className="results-meta">
          <span>🚗 {origin.title} ⇄ {destination.title}</span>
          <span>💸 Bespaar tot {euro(maxP - minP)}</span>
        </div>
        <div className="results">
          {raw.map((q, i) => {
            const best = i === 0;
            const meta = P[q.provider] || { name: q.provider, tagline: "", deepLink: false };
            const save = maxP - q.price;
            return (
              <div key={q.provider} className={"result" + (best ? " best" : "")} style={{ animationDelay: i * 70 + "ms" }}>
                <div className="ico">{PROVIDER_ICONS[q.provider] || "🚖"}</div>
                <div className="info">
                  <h3>
                    {medals[i] || ""} {meta.name}
                    {best && <span className="badge">Goedkoopste</span>}
                    {q.surge > 1.02 && <span className="badge gray">drukte +{Math.round((q.surge - 1) * 100)}%</span>}
                  </h3>
                  <div className="sub">{q.note || meta.tagline}{save >= 1 ? " · bespaar " + euro(save) : ""}</div>
                </div>
                <div className="price">
                  <div className="amount">{euro(q.price)}</div>
                  {meta.deepLink
                    ? <button className="book" onClick={() => act(q)}>Openen ↗</button>
                    : q.isBookable
                      ? <button className="book" onClick={() => act(q)}>Boeken</button>
                      : <a className="book ghost" href={"tel:" + window.Booking.phone}>Bel</a>}
                </div>
              </div>
            );
          })}
        </div>
        {summary && (
          <p className="disclaimer">{summary} · Uber &amp; Bolt zijn gelabelde schattingen; onze prijs is vast. Klik “Openen” om in de Uber/Bolt-app te boeken.</p>
        )}
      </div>
    </section>
  );
}
Object.assign(window, { Results });
