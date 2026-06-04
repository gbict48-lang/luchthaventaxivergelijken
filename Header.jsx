/* Sticky header with wordmark + nav. */
function Header() {
  return (
    <header className="site-header">
      <a className="logo" href="#top">
        <span className="logo-badge">✈︎€</span>
        <span className="logo-text">Luchthaventaxi<strong>Vergelijken</strong></span>
      </a>
      <nav className="nav">
        <a href="#vergelijk">Vergelijk</a>
        <a href="#luchthavens">Luchthavens</a>
        <a href="#waarom">Waarom wij</a>
        <a href="app/">🚕 App</a>
        <a className="nav-cta" href={"tel:" + window.PHONE}>📞 036&nbsp;2222222</a>
      </nav>
    </header>
  );
}
Object.assign(window, { Header });
