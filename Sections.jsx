/* Lower page sections: airports grid, why-cards, CTA band, footer. */

function AirportsGrid({ active, onPick }) {
  const euro = window.euro;
  return (
    <section className="airports" id="luchthavens">
      <div className="container">
        <h2 className="section-title">Wij rijden naar alle grote luchthavens</h2>
        <div className="airport-grid">
          {Object.keys(window.AIRPORTS).map((code) => {
            const from = window.ownFare("almere", code);
            return (
              <div key={code}
                   className={"airport-card" + (code === active ? " active" : "")}
                   onClick={() => onPick(code)}>
                <div className="a-ico">{window.AIRPORTS[code].ico}</div>
                {window.AIRPORTS[code].name}
                <span className="a-from">v.a. {euro(from.sedan)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const WHY = [
  { ico: "💶", h: "Vaste prijs", p: "Vooraf bekend, geen taximeter, geen nacht- of bagagetoeslag." },
  { ico: "🕒", h: "Altijd op tijd", p: "We houden je vluchttijd in de gaten en staan klaar wanneer je landt." },
  { ico: "👨‍✈️", h: "Vaste chauffeurs", p: "Ervaren, vriendelijke chauffeurs die de weg kennen." },
  { ico: "🚐", h: "Taxi of minibus", p: "Van 1 tot 8 personen, met ruimte voor al je bagage." },
];

function WhyCards() {
  return (
    <section className="why" id="waarom">
      <div className="container">
        <h2 className="section-title">Waarom via ons boeken?</h2>
        <div className="why-grid">
          {WHY.map((w) => (
            <div key={w.h} className="why-card">
              <div className="why-ico">{w.ico}</div>
              <h3>{w.h}</h3>
              <p>{w.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="cta-band">
      <div className="container cta-inner">
        <div>
          <h2>Klaar om te boeken?</h2>
          <p>Reserveer minimaal 1 uur vooraf voor de vaste prijs.</p>
        </div>
        <div className="cta-actions">
          <a className="btn-primary" href={window.BOOKING_URL} target="_blank" rel="noopener">Boek online</a>
          <a className="btn-ghost" href={"tel:" + window.PHONE}>📞 036 2222222</a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="logo"><span className="logo-badge">✈︎€</span><span className="logo-text">Luchthaventaxi<strong>Vergelijken</strong></span></div>
          <p className="muted" style={{ marginTop: 10 }}>Vaste prijzen voor luchthavenvervoer vanuit Almere, het Gooi en Flevoland.</p>
        </div>
        <div>
          <h4>Populaire pagina's</h4>
          <ul className="muted">
            <li><a href="schiphol-taxi-vergelijken/">Schiphol taxi vergelijken</a></li>
            <li><a href="taxi-naar-schiphol-boeken/">Taxi naar Schiphol boeken</a></li>
            <li><a href="taxi-naar-schiphol-bestellen/">Taxi naar Schiphol bestellen</a></li>
            <li><a href="taxi-naar-schiphol-vergelijken/">Taxi naar Schiphol vergelijken</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul className="muted">
            <li>📞 <a href={"tel:" + window.PHONE}>036 2222222</a></li>
            <li>🌐 <a href={window.BOOKING_URL} target="_blank" rel="noopener">airportservicealmere.nl</a></li>
          </ul>
        </div>
      </div>
      <div className="container sub">
        <p className="muted">Prijzen voor Schiphol zijn vaste tarieven. Prijzen voor overige luchthavens en die van Uber/Bolt zijn richtprijzen ter vergelijking.</p>
        <p className="muted">© {new Date().getFullYear()} LuchthaventaxiVergelijken</p>
      </div>
    </footer>
  );
}

Object.assign(window, { AirportsGrid, WhyCards, CtaBand, Footer });
